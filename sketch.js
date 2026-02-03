// ==========================================
// Title: CONDITIONAL WORKBOOK - ARCHIVE
// Structure: Scene Manager + 3 Distinct Engines
// ==========================================

let currentMode = 0; // 0: Swarm, 1: Harmonics, 2: Orbital
let font;

// --- 全局容器 ---
let swarmParticles = [];
let oscillators = [];
let orbitalAgents = [];

// --- 通用变量 ---
let generation = 0;
let cycleTimer = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  textFont('Courier New');
  
  // 初始化默认模式
  initMode(0);
}

function draw() {
  // 根据当前模式分发逻辑
  if (currentMode === 0) runSwarm();
  else if (currentMode === 1) runHarmonics();
  else if (currentMode === 2) runOrbital();
  
  // 绘制通用UI
  drawGlobalUI();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initMode(currentMode);
}

// === [核心：模式切换器] ===
// HTML 按钮会调用这个函数
window.switchMode = function(modeIndex) {
  // 更新按钮样式
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
  background(0); // 切换时清空屏幕
  
  // 清空所有数组，释放内存
  swarmParticles = [];
  oscillators = [];
  orbitalAgents = [];
  
  if (mode === 0) initSwarm();
  else if (mode === 1) initHarmonics();
  else if (mode === 2) initOrbital();
}

// ============================================================
// MODE 1: ENTROPIC SWARM (高能粒子流)
// ============================================================
let swarmTotalEnergy = 0;
let swarmFriction = 0.95;

function initSwarm() {
  let count = 1500; // 粒子数量
  for (let i = 0; i < count; i++) {
    swarmParticles.push(new Particle());
  }
  swarmTotalEnergy = 10000;
  swarmFriction = random(0.92, 0.98);
}

function runSwarm() {
  noStroke(); fill(0, 20); rect(width/2, height/2, width, height); // 拖尾
  
  blendMode(ADD);
  swarmTotalEnergy = 0;
  
  for (let p of swarmParticles) {
    p.applyForces();
    p.update();
    p.display();
    swarmTotalEnergy += p.vel.mag();
  }
  blendMode(BLEND);
  
  // 重置逻辑
  cycleTimer++;
  if ((cycleTimer > 60 && swarmTotalEnergy < 50) || cycleTimer > 1800) {
    background(255); // 白闪
    generation++;
    initSwarm();
  }
}

class Particle {
  constructor() {
    this.pos = createVector(width/2 + random(-10,10), height/2 + random(-10,10));
    this.prev = this.pos.copy();
    this.vel = p5.Vector.random2D().mult(random(5, 20));
    this.acc = createVector(0,0);
    this.noiseScale = random(0.005, 0.02);
  }
  applyForces() {
    let angle = noise(this.pos.x * this.noiseScale, this.pos.y * this.noiseScale, frameCount * 0.005) * TWO_PI * 4;
    this.acc.add(p5.Vector.fromAngle(angle).mult(0.5));
  }
  update() {
    this.vel.add(this.acc);
    this.vel.mult(swarmFriction);
    this.prev = this.pos.copy();
    this.pos.add(this.vel);
    this.acc.mult(0);
    if(this.pos.x<0||this.pos.x>width) { this.vel.x*=-1; this.pos.x = constrain(this.pos.x,0,width); }
    if(this.pos.y<0||this.pos.y>height) { this.vel.y*=-1; this.pos.y = constrain(this.pos.y,0,height); }
  }
  display() {
    let alpha = map(this.vel.mag(), 0, 5, 20, 200);
    stroke(255, alpha); strokeWeight(1);
    line(this.pos.x, this.pos.y, this.prev.x, this.prev.y);
  }
}

// ============================================================
// MODE 2: HARMONIC DRIFT (优雅波形)
// ============================================================
let harmDamping = 0.995;
let harmEnergy = 0;

function initHarmonics() {
  let layers = 50;
  for (let i = 0; i < layers; i++) {
    let y = map(i, 0, layers, height*0.2, height*0.8);
    let amp = sin(map(i, 0, layers, 0, PI)) * 100;
    oscillators.push(new Oscillator(y, amp));
  }
  harmDamping = random(0.990, 0.998);
}

function runHarmonics() {
  noStroke(); fill(0, 40); rect(width/2, height/2, width, height); // 丝绸感残影
  
  harmEnergy = 0;
  for (let osc of oscillators) {
    osc.update();
    osc.display();
    harmEnergy += osc.amp;
  }
  
  // 重置逻辑
  cycleTimer++;
  if ((cycleTimer > 120 && harmEnergy < 100) || cycleTimer > 2000) {
    fill(255, 100); rect(width/2, height/2, width, height);
    generation++;
    initHarmonics();
  }
}

class Oscillator {
  constructor(y, amp) {
    this.baseY = y;
    this.amp = amp + random(50);
    this.phase = random(TWO_PI);
    this.freq = random(0.01, 0.05);
    this.speed = random(0.02, 0.1);
  }
  update() {
    this.amp *= harmDamping;
    this.phase += this.speed;
  }
  display() {
    if (this.amp < 1) return;
    stroke(255, map(this.amp, 0, 100, 50, 200)); strokeWeight(1); noFill();
    beginShape();
    for (let x = 0; x <= width; x += 15) {
      let noiseVal = noise(x*0.01, frameCount*0.01) * this.amp * 0.5;
      let sineVal = sin(x * this.freq + this.phase) * this.amp;
      vertex(x, this.baseY + sineVal + noiseVal);
    }
    endShape();
  }
}

// ============================================================
// MODE 3: ORBITAL DECAY (量子化轨迹)
// ============================================================
function initOrbital() {
  let count = 600;
  for (let i = 0; i < count; i++) {
    orbitalAgents.push(new Orbiter());
  }
}

function runOrbital() {
  noStroke(); fill(0, 50); rect(width/2, height/2, width, height); // 较强擦除
  
  // 背景光栅
  if (frameCount % 5 === 0) {
    stroke(255, 30); strokeWeight(1);
    let x = random(width);
    line(x, 0, x, height);
  }
  
  for (let orb of orbitalAgents) {
    orb.update();
    orb.display();
  }
  
  cycleTimer++;
  if (cycleTimer > 2000) {
    background(255);
    generation++;
    initOrbital();
  }
}

class Orbiter {
  constructor() {
    this.init(true);
  }
  init(randomStart) {
    this.history = [];
    if (randomStart) this.pos = createVector(random(width), random(height));
    else {
      let side = floor(random(4));
      if(side===0) this.pos=createVector(random(width),-10);
      else if(side===1) this.pos=createVector(random(width),height+10);
      else if(side===2) this.pos=createVector(-10,random(height));
      else this.pos=createVector(width+10,random(height));
    }
    // 量子化角度 (45度倍数)
    let angle = floor(random(8)) * (PI/4);
    this.vel = p5.Vector.fromAngle(angle).mult(random(3, 8));
    this.life = 1.0;
    this.decay = random(0.005, 0.02);
    this.state = 0; // 0:Active, 1:Decay
  }
  update() {
    this.life -= this.decay;
    if (this.life < 0.4) this.state = 1;
    if (this.life <= 0) { this.init(false); return; }
    
    if (this.state === 1) {
      this.pos.add(p5.Vector.mult(this.vel, 0.5));
      if (random(1) < 0.2) this.pos.x += random(-2, 2);
    } else {
      this.pos.add(this.vel);
    }
    
    if (this.pos.x < 0) { this.pos.x = width; this.history = []; }
    if (this.pos.x > width) { this.pos.x = 0; this.history = []; }
    if (this.pos.y < 0) { this.pos.y = height; this.history = []; }
    if (this.pos.y > height) { this.pos.y = 0; this.history = []; }
    
    this.history.push(this.pos.copy());
    if (this.history.length > 30 * this.life) this.history.shift();
  }
  display() {
    if (this.history.length < 2) return;
    noFill();
    
    if (this.state === 0) {
      stroke(255, 255 * this.life); strokeWeight(1.5);
      beginShape();
      for(let p of this.history) vertex(p.x, p.y);
      endShape();
    } else {
      stroke(150, 150 * this.life); strokeWeight(1);
      for(let i=0; i<this.history.length; i+=2) {
        point(this.history[i].x, this.history[i].y);
      }
    }
  }
}

// ============================================================
// 通用 UI
// ============================================================
function drawGlobalUI() {
  fill(255); noStroke(); textAlign(LEFT, TOP); textSize(12);
  
  let modeName = "";
  let energyVal = 0;
  
  if (currentMode === 0) { modeName = "I. ENTROPIC SWARM"; energyVal = floor(swarmTotalEnergy); }
  else if (currentMode === 1) { modeName = "II. HARMONIC DRIFT"; energyVal = floor(harmEnergy); }
  else if (currentMode === 2) { modeName = "III. ORBITAL DECAY"; energyVal = "N/A"; }
  
  let info = `SYSTEM_MODE: ${modeName}
ITERATION: ${nf(generation, 4)}
ENERGY_LVL: ${energyVal}
RUNTIME: ${cycleTimer}`;
  
  text(info, 20, 20);
  
  // 底部版权/装饰
  textAlign(RIGHT, BOTTOM);
  text("Tao_processing", width-20, height-20);
}
