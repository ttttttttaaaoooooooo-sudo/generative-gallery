// ==========================================
// Title: TAO_PROCESSING - ARCHIVE (11 MODES)
// Style: Ryoji Ikeda / Monotone / Data / Glitch
// Modes: 11 distinct generative algorithms
// ==========================================

let currentMode = 0;
let font;
let generation = 0;
let cycleTimer = 0;

// === 全局对象池 (复用以节省内存) ===
let particles = []; 
let tracers = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  textFont('Courier New');
  initMode(0);
}

function draw() {
  // 模式分发器
  switch(currentMode) {
    case 0: runSwarm(); break;      // 粒子风暴
    case 1: runHarmonics(); break;  // 谐波
    case 2: runOrbital(); break;    // 轨道
    case 3: runTriMesh(); break;    // 三角网
    case 4: runBlueprint(); break;  // 蓝图
    case 5: runSlitScan(); break;   // 狭缝扫描
    case 6: runGridRunner(); break; // 网格行者
    case 7: runRadial(); break;     // 雷达扩散
    case 8: runBinary(); break;     // 二进制雨
    case 9: runNoiseField(); break; // 噪点场
    case 10: runNebula(); break;    // 数字星云 (新)
  }
  
  drawGlobalUI();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initMode(currentMode);
}

// === 切换器 ===
window.switchMode = function(modeIndex) {
  document.querySelectorAll('button').forEach((btn, idx) => {
    if(idx === modeIndex) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  currentMode = modeIndex;
  generation = 0;
  initMode(modeIndex);
}

function initMode(mode) {
  cycleTimer = 0;
  background(0);
  particles = []; // 清空主数组
  tracers = [];   // 清空副数组
  
  // 初始化对应模式
  if (mode === 0) initSwarm();
  else if (mode === 1) initHarmonics();
  else if (mode === 2) initOrbital();
  else if (mode === 3) initTriMesh();
  else if (mode === 4) initBlueprint();
  else if (mode === 5) initSlitScan();
  else if (mode === 6) initGridRunner();
  else if (mode === 7) initRadial();
  else if (mode === 8) initBinary();
  else if (mode === 9) initNoiseField();
  else if (mode === 10) initNebula();
}

// ============================================================
// MODE 01: ENTROPIC SWARM (高能粒子流)
// ============================================================
let swarmEnergy = 0;
function initSwarm() {
  for(let i=0; i<1200; i++) particles.push(new ParticleSwarm());
  swarmEnergy = 10000;
}
function runSwarm() {
  noStroke(); fill(0, 30); rect(width/2, height/2, width, height);
  blendMode(ADD);
  swarmEnergy = 0;
  for(let p of particles) {
    p.update(); p.display();
    swarmEnergy += p.vel.mag();
  }
  blendMode(BLEND);
  cycleTimer++;
  if((cycleTimer>60 && swarmEnergy<50) || cycleTimer>1800) { background(255); initMode(0); generation++; }
}
class ParticleSwarm {
  constructor() {
    this.pos = createVector(width/2+random(-10,10), height/2+random(-10,10));
    this.prev = this.pos.copy();
    this.vel = p5.Vector.random2D().mult(random(5, 20));
    this.acc = createVector(0,0);
    this.fric = random(0.92, 0.98);
  }
  update() {
    let angle = noise(this.pos.x*0.01, this.pos.y*0.01, frameCount*0.01)*TWO_PI*4;
    this.acc.add(p5.Vector.fromAngle(angle).mult(0.5));
    this.vel.add(this.acc); this.vel.mult(this.fric);
    this.prev = this.pos.copy(); this.pos.add(this.vel); this.acc.mult(0);
    if(this.pos.x<0||this.pos.x>width) this.vel.x*=-1;
    if(this.pos.y<0||this.pos.y>height) this.vel.y*=-1;
  }
  display() {
    stroke(255, map(this.vel.mag(),0,5,20,200)); strokeWeight(1);
    line(this.pos.x, this.pos.y, this.prev.x, this.prev.y);
  }
}

// ============================================================
// MODE 02: HARMONIC DRIFT (优雅波形)
// ============================================================
function initHarmonics() {
  for(let i=0; i<50; i++) particles.push(new Osc(i));
}
function runHarmonics() {
  noStroke(); fill(0, 40); rect(width/2, height/2, width, height);
  let totalAmp = 0;
  for(let p of particles) {
    p.update(); p.display(); totalAmp += p.amp;
  }
  cycleTimer++;
  if((cycleTimer>120 && totalAmp<100) || cycleTimer>2000) { fill(255,100); rect(width/2,height/2,width,height); initMode(1); generation++; }
}
class Osc {
  constructor(i) {
    this.y = map(i, 0, 50, height*0.2, height*0.8);
    this.amp = sin(map(i, 0, 50, 0, PI))*100 + random(50);
    this.phase = random(TWO_PI);
    this.freq = random(0.01, 0.05);
    this.speed = random(0.02, 0.1);
    this.damp = random(0.990, 0.998);
  }
  update() { this.amp *= this.damp; this.phase += this.speed; }
  display() {
    if(this.amp<1) return;
    stroke(255, map(this.amp,0,100,50,200)); noFill();
    beginShape();
    for(let x=0; x<=width; x+=20) {
      vertex(x, this.y + sin(x*this.freq + this.phase)*this.amp);
    }
    endShape();
  }
}

// ============================================================
// MODE 03: ORBITAL DECAY (量子化轨迹)
// ============================================================
function initOrbital() {
  for(let i=0; i<400; i++) particles.push(new Orbiter());
}
function runOrbital() {
  noStroke(); fill(0, 50); rect(width/2, height/2, width, height);
  if(frameCount%5===0) { stroke(255,30); line(random(width),0,random(width),height); }
  for(let p of particles) { p.update(); p.display(); }
  cycleTimer++;
  if(cycleTimer>1800) { background(255); initMode(2); generation++; }
}
class Orbiter {
  constructor() { this.init(true); }
  init(start) {
    this.hist = [];
    this.pos = start ? createVector(random(width),random(height)) : createVector(random(width),-10);
    let angle = floor(random(8)) * (PI/4);
    this.vel = p5.Vector.fromAngle(angle).mult(random(3,8));
    this.life = 1.0; this.decay = random(0.005, 0.02);
  }
  update() {
    this.life -= this.decay;
    if(this.life<=0) { this.init(false); return; }
    this.pos.add(this.vel);
    if(this.pos.x<0) this.pos.x=width; if(this.pos.x>width) this.pos.x=0;
    if(this.pos.y<0) this.pos.y=height; if(this.pos.y>height) this.pos.y=0;
    this.hist.push(this.pos.copy());
    if(this.hist.length > 20*this.life) this.hist.shift();
  }
  display() {
    if(this.hist.length<2) return;
    stroke(255, 255*this.life); noFill();
    beginShape(); for(let v of this.hist) vertex(v.x, v.y); endShape();
  }
}

// ============================================================
// MODE 04: TRIANGLE MESH (三角网)
// ============================================================
function initTriMesh() {
  for(let i=0; i<300; i++) particles.push(new TriAgent());
}
function runTriMesh() {
  noStroke(); fill(0, 60); rect(width/2, height/2, width, height);
  stroke(255, 10);
  for(let x=0; x<width; x+=50) line(x,0,x,height);
  for(let p of particles) { p.update(); p.display(); }
  strokeWeight(0.5);
  for(let i=0; i<particles.length; i++) {
    let a = particles[i];
    if(a.alpha < 0.2) continue;
    for(let j=i+1; j<particles.length; j++) {
      let b = particles[j];
      let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
      if(d < 60) {
        stroke(255, map(d, 0, 60, 200, 20) * a.alpha);
        line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
      }
    }
  }
  cycleTimer++;
  if(cycleTimer > 2000) { background(255); initMode(3); generation++; }
}
class TriAgent {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D().mult(0.5);
    this.alpha = 0; this.offset = random(100);
  }
  update() {
    this.pos.add(this.vel);
    if(this.pos.x<0 || this.pos.x>width) this.vel.x*=-1;
    if(this.pos.y<0 || this.pos.y>height) this.vel.y*=-1;
    this.alpha = (sin((frameCount+this.offset)*0.05)+1)/2;
  }
  display() {
    if(this.alpha<0.1) return;
    noStroke(); fill(255, 255*this.alpha); rect(this.pos.x, this.pos.y, 2, 2);
  }
}

// ============================================================
// MODE 05: BLUEPRINT (蓝图)
// ============================================================
function initBlueprint() {
  for(let i=0; i<40; i++) particles.push(new Constructor());
}
function runBlueprint() {
  if(frameCount%2===0) { noStroke(); fill(0, 5); rect(width/2, height/2, width, height); }
  for(let p of particles) { p.update(); }
  for(let i=tracers.length-1; i>=0; i--) {
    let t = tracers[i];
    t.life -= 2;
    stroke(255, t.life); line(t.p1.x, t.p1.y, t.p2.x, t.p2.y);
    if(t.life<=0) tracers.splice(i, 1);
  }
  cycleTimer++;
  if(cycleTimer > 1500) { background(255); initMode(4); generation++; }
}
class Constructor {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.prev = this.pos.copy();
    this.pickVel();
  }
  pickVel() { return (random(1)<0.5) ? createVector(random([-3,3]),0) : createVector(0, random([-3,3])); }
  update() {
    this.prev = this.pos.copy();
    this.pos.add(this.vel);
    if(this.pos.x<0) this.pos.x=width; if(this.pos.x>width) this.pos.x=0;
    if(this.pos.y<0) this.pos.y=height; if(this.pos.y>height) this.pos.y=0;
    if(p5.Vector.dist(this.pos, this.prev) < 10) {
      tracers.push({p1:this.prev.copy(), p2:this.pos.copy(), life:255});
    }
    if(random(1)<0.05) this.pickVel();
  }
}

// ============================================================
// MODE 06: SLIT SCAN (狭缝扫描)
// ============================================================
function initSlitScan() {
  for(let i=0; i<4; i++) particles.push(new Scanner());
}
function runSlitScan() {
  for(let p of particles) {
    p.update();
    if(random(1)<0.3) {
      tracers.push({pos: p.pos.copy(), vertical: p.vertical, life: 255, w: random(2,10)});
    }
  }
  noStroke();
  for(let i=tracers.length-1; i>=0; i--) {
    let t = tracers[i];
    t.life -= 5;
    fill(255, t.life);
    if(t.vertical) rect(t.pos.x, height/2, t.w, height);
    else rect(width/2, t.pos.y, width, t.w);
    if(t.life<=0) tracers.splice(i,1);
  }
  stroke(255);
  for(let p of particles) {
    if(p.vertical) line(p.pos.x, 0, p.pos.x, height);
    else line(0, p.pos.y, width, p.pos.y);
  }
  cycleTimer++;
  if(cycleTimer > 1200) { filter(INVERT); initMode(5); generation++; }
}
class Scanner {
  constructor() {
    this.vertical = random(1)<0.5;
    this.pos = createVector(width/2, height/2);
    this.speed = random(5, 15) * (random(1)<0.5?1:-1);
  }
  update() {
    if(this.vertical) {
      this.pos.x += this.speed;
      if(this.pos.x<0 || this.pos.x>width) this.speed *= -1;
    } else {
      this.pos.y += this.speed;
      if(this.pos.y<0 || this.pos.y>height) this.speed *= -1;
    }
  }
}

// ============================================================
// MODE 07: GRID RUNNER (网格行者)
// ============================================================
function initGridRunner() {
  for(let i=0; i<800; i++) particles.push(new GridBot());
}
function runGridRunner() {
  noStroke(); fill(0, 40); rect(width/2, height/2, width, height);
  stroke(255, 10); for(let x=0; x<width; x+=40) line(x,0,x,height);
  for(let p of particles) { p.update(); p.display(); }
  cycleTimer++; if(cycleTimer>1800) { background(255); initMode(6); generation++; }
}
class GridBot {
  constructor() {
    this.pos = createVector(floor(random(width/40))*40, floor(random(height/40))*40);
    this.target = this.pos.copy();
    this.speed = 0.15;
    this.pickTarget();
  }
  pickTarget() {
    let dir = floor(random(4));
    let dist = floor(random(1,4))*40;
    if(dir===0) this.target.x += dist;
    else if(dir===1) this.target.x -= dist;
    else if(dir===2) this.target.y += dist;
    else this.target.y -= dist;
  }
  update() {
    this.pos.lerp(this.target, this.speed);
    if(this.pos.dist(this.target) < 1) {
      this.pos = this.target.copy();
      this.pickTarget();
      if(this.pos.x<0) this.pos.x=width; if(this.pos.x>width) this.pos.x=0;
      if(this.pos.y<0) this.pos.y=height; if(this.pos.y>height) this.pos.y=0;
    }
  }
  display() {
    stroke(255); strokeWeight(2); point(this.pos.x, this.pos.y);
    stroke(255, 50); strokeWeight(1); line(this.pos.x, this.pos.y, this.target.x, this.target.y);
  }
}

// ============================================================
// MODE 08: RADIAL (雷达声纳)
// ============================================================
function initRadial() { }
function runRadial() {
  noStroke(); fill(0, 20); rect(width/2, height/2, width, height);
  if(frameCount % 15 === 0) {
    particles.push({r: 0, x: random(width), y: random(height), life: 255});
  }
  noFill();
  for(let i=particles.length-1; i>=0; i--) {
    let p = particles[i];
    p.r += 2;
    p.life -= 3;
    stroke(255, p.life);
    ellipse(p.x, p.y, p.r, p.r);
    if(p.life<=0) particles.splice(i,1);
  }
  cycleTimer++; if(cycleTimer>1800) { background(255); initMode(7); generation++; }
}

// ============================================================
// MODE 09: BINARY RAIN (二进制雨)
// ============================================================
function initBinary() {
  for(let i=0; i<100; i++) particles.push(new BitStream());
}
function runBinary() {
  noStroke(); fill(0, 50); rect(width/2, height/2, width, height);
  fill(255); textSize(10);
  for(let p of particles) { p.update(); p.display(); }
  cycleTimer++; if(cycleTimer>1800) { background(255); initMode(8); generation++; }
}
class BitStream {
  constructor() {
    this.x = floor(random(width/15))*15;
    this.y = random(-height, 0);
    this.speed = random(3, 8);
    this.chars = [];
    for(let i=0; i<20; i++) this.chars.push(round(random(1)));
  }
  update() {
    this.y += this.speed;
    if(this.y > height) this.y = random(-500, -100);
    if(frameCount%5===0) this.chars.pop(); 
    if(frameCount%5===0) this.chars.unshift(round(random(1)));
  }
  display() {
    for(let i=0; i<this.chars.length; i++) {
      let alpha = map(i, 0, this.chars.length, 255, 0);
      fill(255, alpha);
      text(this.chars[i], this.x, this.y - i*12);
    }
  }
}

// ============================================================
// MODE 10: NOISE FIELD (噪点场)
// ============================================================
function initNoiseField() {
  for(let i=0; i<2000; i++) particles.push(new NoiseDot());
}
function runNoiseField() {
  noStroke(); fill(0, 10); rect(width/2, height/2, width, height);
  for(let p of particles) { p.update(); p.display(); }
  cycleTimer++; if(cycleTimer>1800) { background(255); initMode(9); generation++; }
}
class NoiseDot {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.prev = this.pos.copy();
  }
  update() {
    let n = noise(this.pos.x*0.005, this.pos.y*0.005, frameCount*0.005);
    let angle = n * TWO_PI * 4;
    this.prev = this.pos.copy();
    this.pos.add(p5.Vector.fromAngle(angle).mult(2));
    if(this.pos.x<0) this.pos.x=width; if(this.pos.x>width) this.pos.x=0;
    if(this.pos.y<0) this.pos.y=height; if(this.pos.y>height) this.pos.y=0;
    if(p5.Vector.dist(this.pos, this.prev) > 10) this.prev = this.pos.copy();
  }
  display() {
    stroke(255, 100); strokeWeight(1);
    line(this.pos.x, this.pos.y, this.prev.x, this.prev.y);
  }
}

// ============================================================
// MODE 11: NEBULA (数字星云 - 视频效果复刻)
// ============================================================
function initNebula() {
  // 创建约 350 个粒子
  for(let i=0; i<350; i++) particles.push(new NebulaAgent());
}

function runNebula() {
  // 平滑的黑色背景覆盖，无频闪
  noStroke(); fill(0, 40); rect(width/2, height/2, width, height);
  
  // 更新所有粒子
  for(let p of particles) p.update();

  // 绘制连接线 (网络)
  strokeWeight(0.5);
  for(let i=0; i<particles.length; i++) {
    let a = particles[i];
    for(let j=i+1; j<particles.length; j++) {
      let b = particles[j];
      let d = p5.Vector.dist(a.pos, b.pos);
      // 较短的连接距离，形成团块感
      if(d < 60) {
        // 透明度随距离衰减
        stroke(255, map(d, 0, 60, 180, 20));
        line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
      }
    }
  }
  
  // 绘制粒子 (十字形数据点)
  for(let p of particles) p.display();
  
  // 自动重置 (可选，为了保持系统活力)
  cycleTimer++;
  if(cycleTimer > 3000) { initMode(10); generation++; }
}

class NebulaAgent {
  constructor() {
    this.pos = createVector(random(width), random(height));
    // 每个粒子有不同的噪声偏移量，确保运动轨迹各不相同
    this.noiseOffset = createVector(random(1000), random(1000));
  }
  update() {
    // 使用柏林噪声生成平滑、流动的运动
    let nX = noise(this.noiseOffset.x + frameCount * 0.003);
    let nY = noise(this.noiseOffset.y + frameCount * 0.003);
    // 将噪声值映射到速度向量
    let vel = createVector(map(nX, 0, 1, -1.5, 1.5), map(nY, 0, 1, -1.5, 1.5));
    this.pos.add(vel);
    
    // 简单的边界环绕
    if(this.pos.x < 0) this.pos.x = width; else if(this.pos.x > width) this.pos.x = 0;
    if(this.pos.y < 0) this.pos.y = height; else if(this.pos.y > height) this.pos.y = 0;
  }
  display() {
    // 绘制十字形标记 (Crux)
    stroke(255, 200);
    strokeWeight(1);
    let size = 3;
    line(this.pos.x - size, this.pos.y, this.pos.x + size, this.pos.y); // 水平线
    line(this.pos.x, this.pos.y - size, this.pos.x, this.pos.y + size); // 垂直线
  }
}

// ============================================================
// UI
// ============================================================
function drawGlobalUI() {
  fill(255); noStroke(); textAlign(LEFT, TOP); textSize(12);
  let modeNames = [
    "I. ENTROPIC SWARM", "II. HARMONIC DRIFT", "III. ORBITAL DECAY",
    "IV. TRIANGLE MESH", "V. TRANSIENT BLUEPRINT", "VI. SLIT SCAN",
    "VII. GRID RUNNER", "VIII. RADIAL INTERFERENCE", "IX. BINARY CASCADE",
    "X. VOID STATIC", "XI. NEBULA NETWORK"
  ];
  
  let info = `SYSTEM_MODE: ${modeNames[currentMode]}
ITERATION: ${nf(generation, 4)}
RUNTIME: ${cycleTimer}`;
  
  text(info, 20, 20);
  
  textAlign(RIGHT, BOTTOM);
  text("Tao_processing", width-20, height-20);
}
