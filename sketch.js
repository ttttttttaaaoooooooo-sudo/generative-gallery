// ==========================================
// Title: COSMIC STACK - PROCESS EDITION
// Features: 16 Unique Generative Engines
// Inspiration: Ryoji Ikeda x Casey Reas (Process 4)
// ==========================================

let activeLayers = []; 
let font;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  textFont('Courier New');
  
  // 初始加载：混合经典宇宙与新的Reas风格
  addLayer(9);  // Star Field (背景)
  addLayer(11); // Reas Network (核心结构)
  addLayer(12); // Reas Tissue (组织)
  addLayer(7);  // Cosmic Rings (装饰)
}

function draw() {
  background(0); // 每帧清空背景
  
  for (let i = 0; i < activeLayers.length; i++) {
    let layer = activeLayers[i];
    let distanceFromTop = (activeLayers.length - 1) - i;
    let alphaMultiplier = 1.0;
    
    if (distanceFromTop > 0) {
      alphaMultiplier = map(distanceFromTop, 0, 10, 0.8, 0.2); 
      alphaMultiplier = constrain(alphaMultiplier, 0.2, 1.0);
    }
    
    push();
    blendMode(ADD); // 保持宇宙光感叠加
    layer.update();
    layer.display(alphaMultiplier);
    pop();
  }
  
  drawGlobalUI();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ==========================================
// 🎲 随机化与图层管理
// ==========================================

window.randomizeStack = function() {
  activeLayers = [];
  let count = floor(random(4, 10)); // 随机生成 4-10 层
  for(let i=0; i<count; i++) {
    // 随机范围扩大到 0-15 (共16种)
    let rMode = floor(random(0, 16)); 
    addLayer(rMode, true);
  }
  updateUI();
}

window.addLayer = function(modeIndex, skipUI = false) {
  if (activeLayers.length >= 20) {
    if(!skipUI) alert("SYSTEM LIMIT REACHED (MAX 20)");
    return;
  }
  
  let newLayer;
  switch(modeIndex) {
    // --- CLASSIC SERIES ---
    case 0: newLayer = new LayerSwarm(); break;
    case 1: newLayer = new LayerHarmonics(); break; 
    case 2: newLayer = new LayerOrbital(); break;
    case 3: newLayer = new LayerTriMesh(); break;
    case 4: newLayer = new LayerBlueprint(); break; 
    case 5: newLayer = new LayerSlitScan(); break;  
    case 6: newLayer = new LayerGridRunner(); break;
    case 7: newLayer = new LayerRadial(); break;    
    case 8: newLayer = new LayerBinary(); break;    
    case 9: newLayer = new LayerNoise(); break;     
    case 10: newLayer = new LayerNebula(); break;
    // --- REAS PROCESS SERIES ---
    case 11: newLayer = new LayerReasNetwork(); break;
    case 12: newLayer = new LayerReasTissue(); break;
    case 13: newLayer = new LayerReasSigil(); break;
    case 14: newLayer = new LayerReasPath(); break;
    case 15: newLayer = new LayerReasKinetic(); break;
  }
  
  newLayer.name = getModeName(modeIndex);
  activeLayers.push(newLayer); 
  if(!skipUI) updateUI();
}

window.removeLayer = function(index) {
  activeLayers.splice(index, 1);
  updateUI();
}

// UI 渲染 (保持不变)
let draggedItemIndex = null;
function updateUI() {
  let stackDiv = document.getElementById('stack');
  stackDiv.innerHTML = '';
  for (let i = activeLayers.length - 1; i >= 0; i--) {
    let layer = activeLayers[i];
    let div = document.createElement('div');
    let distanceFromTop = (activeLayers.length - 1) - i;
    let opacityClass = 'opacity-high';
    if(distanceFromTop >= 1 && distanceFromTop <= 3) opacityClass = 'opacity-mid';
    if(distanceFromTop > 3) opacityClass = 'opacity-low';
    
    div.className = `layer-item ${opacityClass}`;
    div.draggable = true;
    div.dataset.index = i;
    div.innerHTML = `<span style="pointer-events:none;">L${i}: ${layer.name}</span> <span class="delete-btn" onclick="event.stopPropagation(); removeLayer(${i})">[X]</span>`;
    
    div.addEventListener('dragstart', function(e) { draggedItemIndex = parseInt(this.dataset.index); this.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    div.addEventListener('dragend', function(e) { this.classList.remove('dragging'); document.querySelectorAll('.layer-item').forEach(item => item.classList.remove('drag-over')); draggedItemIndex = null; });
    div.addEventListener('dragover', function(e) { e.preventDefault(); if (parseInt(this.dataset.index) !== draggedItemIndex) { this.classList.add('drag-over'); } e.dataTransfer.dropEffect = 'move'; });
    div.addEventListener('dragleave', function(e) { this.classList.remove('drag-over'); });
    div.addEventListener('drop', function(e) { e.stopPropagation(); this.classList.remove('drag-over'); let targetIndex = parseInt(this.dataset.index); if (draggedItemIndex !== null && draggedItemIndex !== targetIndex) { moveLayer(draggedItemIndex, targetIndex); } return false; });
    
    stackDiv.appendChild(div);
  }
}
function moveLayer(fromIndex, toIndex) {
  let itemToMove = activeLayers[fromIndex];
  activeLayers.splice(fromIndex, 1);
  activeLayers.splice(toIndex, 0, itemToMove);
  updateUI();
}

function getModeName(idx) {
  let names = [
    "SWARM", "DATA_BEAMS", "ORBITAL", "TRI_MESH", "DEEP_STRUCT", 
    "DIGI_AURORA", "GRID_RUN", "COSMIC_RINGS", "DATA_NEBULA", "STAR_FIELD", "NEBULA_PHYS",
    "REAS_NETWORK", "REAS_TISSUE", "REAS_SIGIL", "REAS_PATH", "REAS_KINETIC"
  ];
  return names[idx];
}

// ============================================================
// NEW REAS PROCESS ENGINES (11-15)
// ============================================================

// 11. REAS_NETWORK (Process 4 Classic)
// 经典的直线运动 + 距离连线
class LayerReasNetwork {
  constructor() {
    this.agents = [];
    for(let i=0; i<150; i++) {
      this.agents.push({
        pos: createVector(random(width), random(height)),
        // 只允许水平或垂直运动，更具机械感
        vel: (random(1)<0.5) ? createVector(random([-2,2]), 0) : createVector(0, random([-2,2]))
      });
    }
  }
  update() {
    for(let a of this.agents) {
      a.pos.add(a.vel);
      if(a.pos.x<0 || a.pos.x>width) a.vel.x *= -1;
      if(a.pos.y<0 || a.pos.y>height) a.vel.y *= -1;
    }
  }
  display(alphaMult) {
    strokeWeight(0.5);
    for(let i=0; i<this.agents.length; i++) {
      let a = this.agents[i];
      for(let j=i+1; j<this.agents.length; j++) {
        let b = this.agents[j];
        let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        // Process 4 核心逻辑：距离越近，线条越亮
        if(d < 100) {
          let alpha = map(d, 0, 100, 255, 0);
          stroke(255, alpha * alphaMult);
          line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        }
      }
    }
  }
}

// 12. REAS_TISSUE (Skin/Surface)
// 3点成面，模拟组织生长
class LayerReasTissue {
  constructor() {
    this.agents = [];
    for(let i=0; i<100; i++) {
      this.agents.push({
        pos: createVector(random(width), random(height)),
        vel: p5.Vector.random2D().mult(0.5) // 缓慢漂浮
      });
    }
  }
  update() {
    for(let a of this.agents) {
      a.pos.add(a.vel);
      if(a.pos.x<0) a.pos.x=width; if(a.pos.x>width) a.pos.x=0;
      if(a.pos.y<0) a.pos.y=height; if(a.pos.y>height) a.pos.y=0;
    }
  }
  display(alphaMult) {
    noStroke();
    fill(255, 15 * alphaMult); // 非常淡的面
    for(let i=0; i<this.agents.length; i++) {
      let a = this.agents[i];
      // 寻找最近的两个邻居构成三角形
      let neighbors = [];
      for(let j=0; j<this.agents.length; j++) {
        if(i===j) continue;
        let d = dist(a.pos.x, a.pos.y, this.agents[j].pos.x, this.agents[j].pos.y);
        if(d < 80) neighbors.push(this.agents[j].pos);
      }
      if(neighbors.length >= 2) {
        // 只取前两个构成面
        triangle(a.pos.x, a.pos.y, neighbors[0].x, neighbors[0].y, neighbors[1].x, neighbors[1].y);
      }
    }
  }
}

// 13. REAS_SIGIL (Overlap Interactions)
// 节点是大半径的隐形圆，重叠时画出几何符文
class LayerReasSigil {
  constructor() {
    this.agents = [];
    for(let i=0; i<60; i++) {
      this.agents.push({
        pos: createVector(random(width), random(height)),
        vel: p5.Vector.random2D().mult(1),
        r: random(50, 100) // 探测半径
      });
    }
  }
  update() {
    for(let a of this.agents) {
      a.pos.add(a.vel);
      if(a.pos.x<0 || a.pos.x>width) a.vel.x *= -1;
      if(a.pos.y<0 || a.pos.y>height) a.vel.y *= -1;
    }
  }
  display(alphaMult) {
    noFill();
    for(let i=0; i<this.agents.length; i++) {
      let a = this.agents[i];
      for(let j=i+1; j<this.agents.length; j++) {
        let b = this.agents[j];
        let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        // 如果两个探测场重叠
        if(d < (a.r + b.r)) {
          // 在中心点画圈，模拟能量共振
          let midX = (a.pos.x + b.pos.x) / 2;
          let midY = (a.pos.y + b.pos.y) / 2;
          let size = (a.r + b.r) - d; // 重叠越多，圈越大
          strokeWeight(1);
          stroke(255, 100 * alphaMult);
          ellipse(midX, midY, size, size);
          // 连接核心
          strokeWeight(0.5);
          line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        }
      }
    }
  }
}

// 14. REAS_PATH (Flowing Trails)
// 节点带有弯曲的记忆路径，像流体
class LayerReasPath {
  constructor() {
    this.agents = [];
    for(let i=0; i<200; i++) {
      this.agents.push({
        pos: createVector(random(width), random(height)),
        noiseOffset: random(1000),
        history: []
      });
    }
  }
  update() {
    for(let a of this.agents) {
      // 噪声流场运动
      let angle = noise(a.pos.x * 0.005, a.pos.y * 0.005, frameCount * 0.002) * TWO_PI * 4;
      let vel = p5.Vector.fromAngle(angle).mult(2);
      a.pos.add(vel);
      
      // 记录路径
      a.history.push(a.pos.copy());
      if(a.history.length > 30) a.history.shift(); // 限制尾巴长度
      
      // 环绕
      if(a.pos.x < 0) { a.pos.x = width; a.history = []; }
      if(a.pos.x > width) { a.pos.x = 0; a.history = []; }
      if(a.pos.y < 0) { a.pos.y = height; a.history = []; }
      if(a.pos.y > height) { a.pos.y = 0; a.history = []; }
    }
  }
  display(alphaMult) {
    noFill();
    strokeWeight(1);
    stroke(255, 120 * alphaMult);
    for(let a of this.agents) {
      if(a.history.length < 2) continue;
      beginShape();
      for(let v of a.history) vertex(v.x, v.y);
      endShape();
    }
  }
}

// 15. REAS_KINETIC (Force/Repulsion)
// 带有物理排斥力的网络，充满张力
class LayerReasKinetic {
  constructor() {
    this.agents = [];
    for(let i=0; i<120; i++) {
      this.agents.push({
        pos: createVector(random(width), random(height)),
        vel: createVector(0,0),
        acc: createVector(0,0)
      });
    }
  }
  update() {
    for(let i=0; i<this.agents.length; i++) {
      let a = this.agents[i];
      
      // 相互作用力
      for(let j=0; j<this.agents.length; j++) {
        if(i===j) continue;
        let b = this.agents[j];
        let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        
        // 排斥力 (保持距离)
        if(d < 40 && d > 0) {
          let force = p5.Vector.sub(a.pos, b.pos);
          force.normalize();
          force.mult(0.5); // 排斥强度
          a.acc.add(force);
        }
        // 吸引力 (聚集) - 可选，这里只做排斥+布朗运动
      }
      
      // 添加随机扰动
      a.acc.add(p5.Vector.random2D().mult(0.1));
      
      // 物理更新
      a.vel.add(a.acc);
      a.vel.limit(2); // 限制速度
      a.pos.add(a.vel);
      a.acc.mult(0); // 重置加速度
      
      // 边界反弹
      if(a.pos.x < 0 || a.pos.x > width) a.vel.x *= -1;
      if(a.pos.y < 0 || a.pos.y > height) a.vel.y *= -1;
    }
  }
  display(alphaMult) {
    strokeWeight(0.8);
    for(let i=0; i<this.agents.length; i++) {
      let a = this.agents[i];
      for(let j=i+1; j<this.agents.length; j++) {
        let b = this.agents[j];
        let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        // 只有在受力范围（较近）时才画线，表示张力
        if(d < 60) {
          stroke(255, map(d, 0, 60, 200, 0) * alphaMult);
          line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        }
      }
    }
  }
}


// ============================================================
// CLASSIC COSMIC ENGINES (0-10) (Keep Existing Logic)
// ============================================================

// 00. SWARM
class LayerSwarm {
  constructor() {
    this.particles = [];
    for(let i=0; i<800; i++) this.particles.push({
      pos: createVector(width/2, height/2), prev: createVector(width/2, height/2),
      vel: p5.Vector.random2D().mult(random(2,10)), acc: createVector(0,0)
    });
  }
  update() {
    for(let p of this.particles) {
      let angle = noise(p.pos.x*0.01, p.pos.y*0.01, frameCount*0.01)*TWO_PI*4;
      p.acc.add(p5.Vector.fromAngle(angle).mult(0.5));
      p.vel.add(p.acc); p.vel.mult(0.95);
      p.prev = p.pos.copy(); p.pos.add(p.vel); p.acc.mult(0);
      if(p.pos.x<0||p.pos.x>width) { p.vel.x*=-1; p.pos.x=constrain(p.pos.x,0,width); }
      if(p.pos.y<0||p.pos.y>height) { p.vel.y*=-1; p.pos.y=constrain(p.pos.y,0,height); }
    }
  }
  display(alphaMult) {
    stroke(255, 100 * alphaMult); strokeWeight(1);
    for(let p of this.particles) line(p.pos.x, p.pos.y, p.prev.x, p.prev.y);
  }
}

// 01. DATA BEAMS
class LayerHarmonics {
  constructor() {
    this.beams = [];
    for(let x=0; x<width; x+=10) this.beams.push({x:x, noiseOffset:random(1000), width:random(0.5,2)});
  }
  update() { }
  display(alphaMult) {
    noFill();
    for(let b of this.beams) {
      let n = noise(b.noiseOffset, frameCount * 0.5);
      let brightness = (n > 0.6) ? map(n, 0.6, 1, 50, 255) : 0;
      if(brightness > 0) {
        strokeWeight(b.width); stroke(255, brightness * alphaMult);
        line(b.x, 0, b.x, height);
      }
    }
  }
}

// 02. ORBITAL
class LayerOrbital {
  constructor() {
    this.agents = [];
    for(let i=0; i<600; i++) this.agents.push(this.create());
  }
  create() {
    let angle = floor(random(8)) * (PI/4);
    return {
      pos: createVector(random(width), random(height)),
      vel: p5.Vector.fromAngle(angle).mult(random(1, 4)),
      hist: [], maxHist: random(20, 50)
    };
  }
  update() {
    for(let a of this.agents) {
      a.pos.add(a.vel);
      if(a.pos.x<0) { a.pos.x=width; a.hist=[]; } if(a.pos.x>width) { a.pos.x=0; a.hist=[]; }
      if(a.pos.y<0) { a.pos.y=height; a.hist=[]; } if(a.pos.y>height) { a.pos.y=0; a.hist=[]; }
      a.hist.push(a.pos.copy()); if(a.hist.length > a.maxHist) a.hist.shift();
    }
  }
  display(alphaMult) {
    noFill(); strokeWeight(0.5);
    for(let a of this.agents) {
      if(a.hist.length < 2) continue;
      stroke(255, 150 * alphaMult); beginShape(); for(let v of a.hist) vertex(v.x, v.y); endShape();
      stroke(255, 200 * alphaMult); point(a.pos.x, a.pos.y);
    }
  }
}

// 03. TRI_MESH
class LayerTriMesh {
  constructor() {
    this.nodes = [];
    for(let i=0; i<400; i++) this.nodes.push({ pos: createVector(random(width), random(height)), vel: p5.Vector.random2D().mult(0.3) });
  }
  update() {
    for(let n of this.nodes) {
      n.pos.add(n.vel);
      if(n.pos.x<0||n.pos.x>width) n.vel.x*=-1; if(n.pos.y<0||n.pos.y>height) n.vel.y*=-1;
    }
  }
  display(alphaMult) {
    strokeWeight(0.2);
    for(let i=0; i<this.nodes.length; i++) {
      let a = this.nodes[i];
      for(let j=i+1; j<this.nodes.length; j++) {
        let b = this.nodes[j];
        if (abs(a.pos.x - b.pos.x) > 60 || abs(a.pos.y - b.pos.y) > 60) continue;
        let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        if(d < 60) {
          stroke(255, map(d,0,60,180,0) * alphaMult); line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        }
      }
    }
    strokeWeight(1.5); stroke(255, 150 * alphaMult); for(let n of this.nodes) point(n.pos.x, n.pos.y);
  }
}

// 04. DEEP_STRUCT
class LayerBlueprint {
  constructor() {
    this.cons = []; this.traces = [];
    for(let i=0; i<800; i++) this.cons.push({ pos: createVector(random(width), random(height)), prev: createVector(0,0), vel: this.pickVel() });
  }
  pickVel() { let s = 1.5; return (random(1)<0.5) ? createVector(random([-s,s]),0) : createVector(0, random([-s,s])); }
  update() {
    for(let c of this.cons) {
      c.prev = c.pos.copy(); c.pos.add(c.vel);
      if(c.pos.x<0) c.pos.x=width; if(c.pos.x>width) c.pos.x=0; if(c.pos.y<0) c.pos.y=height; if(c.pos.y>height) c.pos.y=0;
      if(p5.Vector.dist(c.pos, c.prev) < 10) this.traces.push({p1:c.prev.copy(), p2:c.pos.copy(), life:400});
      if(random(1)<0.02) c.vel = this.pickVel();
    }
    if(this.traces.length > 3000) this.traces.splice(0, this.traces.length - 3000);
  }
  display(alphaMult) {
    strokeWeight(0.2); stroke(255, 60 * alphaMult);
    for(let t of this.traces) line(t.p1.x, t.p1.y, t.p2.x, t.p2.y);
  }
}

// 05. DIGI_AURORA
class LayerSlitScan {
  constructor() { this.cols = floor(width / 4); this.noiseStart = random(1000); }
  update() { }
  display(alphaMult) {
    noStroke();
    for(let i=0; i<this.cols; i++) {
      let x = i * 4; let n = noise(i * 0.05, frameCount * 0.01 + this.noiseStart);
      let brightness = pow(n, 3) * 255; fill(brightness, brightness * alphaMult * 0.6); rect(x, height/2, 2, height);
    }
  }
}

// 06. GRID_RUN
class LayerGridRunner {
  constructor() {
    this.bots = [];
    for(let i=0; i<500; i++) this.bots.push({
      pos: createVector(floor(random(width/40))*40, floor(random(height/40))*40),
      target: createVector(0,0), speed: 0.2, moving: false
    });
  }
  update() {
    for(let b of this.bots) {
      if(!b.moving) {
        b.target = b.pos.copy(); let dir = floor(random(4));
        if(dir===0) b.target.x+=40; else if(dir===1) b.target.x-=40; else if(dir===2) b.target.y+=40; else b.target.y-=40;
        b.moving = true;
      }
      b.pos.lerp(b.target, b.speed);
      if(b.pos.dist(b.target) < 1) { b.pos=b.target.copy(); b.moving=false; }
      if(b.pos.x<0) b.pos.x=width; if(b.pos.x>width) b.pos.x=0;
    }
  }
  display(alphaMult) {
    stroke(255, 200 * alphaMult); strokeWeight(2); for(let b of this.bots) point(b.pos.x, b.pos.y);
  }
}

// 07. COSMIC_RINGS
class LayerRadial {
  constructor() {
    this.rings = [];
    for(let i=0; i<12; i++) {
      this.rings.push({ r: map(i, 0, 12, 50, height*0.8), speed: random(0.001, 0.005) * (i%2==0?1:-1), particles: [] });
      let pCount = floor(map(i, 0, 12, 50, 300));
      for(let j=0; j<pCount; j++) this.rings[i].particles.push({ angle: random(TWO_PI), offsetR: random(-5, 5) });
    }
  }
  update() { for(let r of this.rings) for(let p of r.particles) p.angle += r.speed; }
  display(alphaMult) {
    noFill(); strokeWeight(0.8); translate(width/2, height/2);
    for(let r of this.rings) {
      stroke(255, 150 * alphaMult);
      for(let p of r.particles) { let x = (r.r + p.offsetR) * cos(p.angle); let y = (r.r + p.offsetR) * sin(p.angle); point(x, y); }
    }
  }
}

// 08. DATA_NEBULA
class LayerBinary {
  constructor() {
    this.stars = [];
    for(let i=0; i<2000; i++) this.stars.push({ x: random(width), y: random(height), char: round(random(1)), offset: random(1000), size: random(8, 12) });
  }
  update() { }
  display(alphaMult) {
    noStroke(); textAlign(CENTER, CENTER);
    for(let s of this.stars) {
      let flicker = noise(s.offset + frameCount * 0.02); let alpha = map(flicker, 0, 1, 30, 200);
      fill(255, alpha * alphaMult); textSize(s.size); text(s.char, s.x, s.y);
    }
  }
}

// 09. STAR_FIELD
class LayerNoise {
  constructor() {
    this.dots = []; for(let i=0; i<3000; i++) this.dots.push({ x: random(width), y: random(height), offset: random(1000) });
  }
  update() { }
  display(alphaMult) {
    strokeWeight(1);
    for(let d of this.dots) {
      let flicker = noise(d.offset + frameCount * 0.05); stroke(255, map(flicker, 0, 1, 50, 255) * alphaMult); point(d.x, d.y);
    }
  }
}

// 10. NEBULA_PHYS
class LayerNebula {
  constructor() {
    this.particles = [];
    for(let i=0; i<350; i++) this.particles.push({ pos: createVector(random(width), random(height)), noiseOffset: createVector(random(1000), random(1000)) });
  }
  update() {
    for(let p of this.particles) {
      let nX = noise(p.noiseOffset.x + frameCount * 0.003); let nY = noise(p.noiseOffset.y + frameCount * 0.003);
      let vel = createVector(map(nX, 0, 1, -1.5, 1.5), map(nY, 0, 1, -1.5, 1.5));
      p.pos.add(vel);
      if(p.pos.x < 0) p.pos.x = width; else if(p.pos.x > width) p.pos.x = 0; if(p.pos.y < 0) p.pos.y = height; else if(p.pos.y > height) p.pos.y = 0;
    }
  }
  display(alphaMult) {
    strokeWeight(0.5);
    for(let i=0; i<this.particles.length; i++) {
      let a = this.particles[i];
      for(let j=i+1; j<this.particles.length; j++) {
        let b = this.particles[j];
        if(p5.Vector.dist(a.pos, b.pos) < 60) { stroke(255, map(p5.Vector.dist(a.pos, b.pos), 0, 60, 180, 20) * alphaMult); line(a.pos.x, a.pos.y, b.pos.x, b.pos.y); }
      }
    }
    stroke(255, 200 * alphaMult); strokeWeight(1); let size = 3;
    for(let p of this.particles) { line(p.pos.x - size, p.pos.y, p.pos.x + size, p.pos.y); line(p.pos.x, p.pos.y - size, p.pos.x, p.pos.y + size); }
  }
}

// ==========================================
// UI FOOTER
// ==========================================
function drawGlobalUI() {
  fill(255); noStroke(); textAlign(RIGHT, BOTTOM); textSize(12);
  let info = "ACTIVE_LAYERS: " + activeLayers.length + " // Tao_processing";
  text(info, width-20, height-20);
}
