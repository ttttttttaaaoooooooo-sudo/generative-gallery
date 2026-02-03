// ==========================================
// Title: COSMIC STACK - FINAL PRO EDITION
// System: Dynamic Layer Stack (Max 20) with Drag & Drop
// Visuals: Refined Cosmic/Sci-Fi Aesthetics
// ==========================================

let activeLayers = []; 
let font;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  textFont('Courier New');
  
  // 预设一套超级震撼的初始组合
  addLayer(9);  // Star Field (背景星空)
  addLayer(7);  // Cosmic Rings (宇宙环)
  addLayer(4);  // Deep Struct (深空结构)
  addLayer(1);  // Data Beams (光束)
}

function draw() {
  background(0); // 每帧清空背景
  
  // 遍历堆栈进行渲染
  // index 越大代表越在"上面" (HTML堆栈顶部)，透明度/亮度越高
  for (let i = 0; i < activeLayers.length; i++) {
    let layer = activeLayers[i];
    
    // 计算层级透明度系数
    // 堆栈顶部 (activeLayers.length - 1) = 1.0 (最亮)
    // 往下逐渐变暗，防止爆光
    let distanceFromTop = (activeLayers.length - 1) - i;
    let alphaMultiplier = 1.0;
    
    if (distanceFromTop > 0) {
      // 衰减公式：层级越深越暗，最低保持 0.2 以保证背景可见
      alphaMultiplier = map(distanceFromTop, 0, 10, 0.8, 0.2); 
      alphaMultiplier = constrain(alphaMultiplier, 0.2, 1.0);
    }
    
    push();
    // 使用 ADD 混合模式，让所有宇宙层级叠加发光！
    // 如果觉得太亮，可以改回 BLEND
    blendMode(ADD); 
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
// 图层管理与拖拽系统
// ==========================================

// 1. 添加图层
window.addLayer = function(modeIndex) {
  if (activeLayers.length >= 20) {
    alert("SYSTEM LIMIT REACHED (MAX 20)");
    return;
  }
  
  let newLayer;
  switch(modeIndex) {
    case 0: newLayer = new LayerSwarm(); break;
    case 1: newLayer = new LayerHarmonics(); break; // Data Beams
    case 2: newLayer = new LayerOrbital(); break;
    case 3: newLayer = new LayerTriMesh(); break;
    case 4: newLayer = new LayerBlueprint(); break; // Deep Struct
    case 5: newLayer = new LayerSlitScan(); break;  // Digi Aurora
    case 6: newLayer = new LayerGridRunner(); break;
    case 7: newLayer = new LayerRadial(); break;    // Cosmic Rings
    case 8: newLayer = new LayerBinary(); break;    // Data Nebula
    case 9: newLayer = new LayerNoise(); break;     // Star Field
    case 10: newLayer = new LayerNebula(); break;
  }
  
  newLayer.name = getModeName(modeIndex);
  activeLayers.push(newLayer); // 添加到数组末尾（视觉顶部）
  updateUI();
}

// 2. 移除图层
window.removeLayer = function(index) {
  activeLayers.splice(index, 1);
  updateUI();
}

// 3. UI 渲染与拖拽逻辑
let draggedItemIndex = null;

function updateUI() {
  let stackDiv = document.getElementById('stack');
  stackDiv.innerHTML = '';
  
  // 倒序遍历：数组末尾（Top Layer）显示在 HTML 列表最上面
  for (let i = activeLayers.length - 1; i >= 0; i--) {
    let layer = activeLayers[i];
    let div = document.createElement('div');
    
    // 视觉样式计算
    let distanceFromTop = (activeLayers.length - 1) - i;
    let opacityClass = 'opacity-high';
    if(distanceFromTop >= 1 && distanceFromTop <= 3) opacityClass = 'opacity-mid';
    if(distanceFromTop > 3) opacityClass = 'opacity-low';
    
    div.className = `layer-item ${opacityClass}`;
    div.draggable = true;
    div.dataset.index = i;
    
    div.innerHTML = `
      <span style="pointer-events:none;">L${i}: ${layer.name}</span> 
      <span class="delete-btn" onclick="event.stopPropagation(); removeLayer(${i})">[X]</span>
    `;
    
    // --- 拖拽事件监听 ---
    div.addEventListener('dragstart', function(e) {
      draggedItemIndex = parseInt(this.dataset.index);
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    
    div.addEventListener('dragend', function(e) {
      this.classList.remove('dragging');
      document.querySelectorAll('.layer-item').forEach(item => item.classList.remove('drag-over'));
      draggedItemIndex = null;
    });
    
    div.addEventListener('dragover', function(e) {
      e.preventDefault();
      if (parseInt(this.dataset.index) !== draggedItemIndex) {
        this.classList.add('drag-over');
      }
      e.dataTransfer.dropEffect = 'move';
    });
    
    div.addEventListener('dragleave', function(e) {
      this.classList.remove('drag-over');
    });
    
    div.addEventListener('drop', function(e) {
      e.stopPropagation();
      this.classList.remove('drag-over');
      let targetIndex = parseInt(this.dataset.index);
      if (draggedItemIndex !== null && draggedItemIndex !== targetIndex) {
        moveLayer(draggedItemIndex, targetIndex);
      }
      return false;
    });
    
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
  let names = ["SWARM", "DATA_BEAMS", "ORBITAL", "TRI_MESH", "DEEP_STRUCT", "DIGI_AURORA", "GRID_RUN", "COSMIC_RINGS", "DATA_NEBULA", "STAR_FIELD", "NEBULA_PHYS"];
  return names[idx];
}

// ============================================================
// VISUAL ENGINES (ALL REFINED COSMIC MODES)
// ============================================================

// 00. SWARM
class LayerSwarm {
  constructor() {
    this.particles = [];
    for(let i=0; i<800; i++) this.particles.push(this.createP());
  }
  createP() {
    return {
      pos: createVector(width/2, height/2),
      prev: createVector(width/2, height/2),
      vel: p5.Vector.random2D().mult(random(2,10)),
      acc: createVector(0,0)
    };
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

// 01. DATA BEAMS (REFINED)
class LayerHarmonics {
  constructor() {
    this.beams = [];
    for(let x=0; x<width; x+=10) {
      this.beams.push({
        x: x, noiseOffset: random(1000), width: random(0.5, 2)
      });
    }
  }
  update() { }
  display(alphaMult) {
    noFill();
    for(let b of this.beams) {
      let n = noise(b.noiseOffset, frameCount * 0.5);
      let brightness = (n > 0.6) ? map(n, 0.6, 1, 50, 255) : 0;
      if(brightness > 0) {
        strokeWeight(b.width);
        stroke(255, brightness * alphaMult);
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
      if(a.pos.x<0) { a.pos.x=width; a.hist=[]; }
      if(a.pos.x>width) { a.pos.x=0; a.hist=[]; }
      if(a.pos.y<0) { a.pos.y=height; a.hist=[]; }
      if(a.pos.y>height) { a.pos.y=0; a.hist=[]; }
      a.hist.push(a.pos.copy());
      if(a.hist.length > a.maxHist) a.hist.shift();
    }
  }
  display(alphaMult) {
    noFill(); strokeWeight(0.5);
    for(let a of this.agents) {
      if(a.hist.length < 2) continue;
      stroke(255, 150 * alphaMult);
      beginShape(); for(let v of a.hist) vertex(v.x, v.y); endShape();
      stroke(255, 200 * alphaMult); point(a.pos.x, a.pos.y);
    }
  }
}

// 03. TRI_MESH
class LayerTriMesh {
  constructor() {
    this.nodes = [];
    for(let i=0; i<400; i++) this.nodes.push({
      pos: createVector(random(width), random(height)),
      vel: p5.Vector.random2D().mult(0.3)
    });
  }
  update() {
    for(let n of this.nodes) {
      n.pos.add(n.vel);
      if(n.pos.x<0||n.pos.x>width) n.vel.x*=-1;
      if(n.pos.y<0||n.pos.y>height) n.vel.y*=-1;
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
          stroke(255, map(d,0,60,180,0) * alphaMult);
          line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        }
      }
    }
    strokeWeight(1.5); stroke(255, 150 * alphaMult);
    for(let n of this.nodes) point(n.pos.x, n.pos.y);
  }
}

// 04. DEEP_STRUCT (REFINED)
class LayerBlueprint {
  constructor() {
    this.cons = []; this.traces = [];
    for(let i=0; i<800; i++) this.cons.push(this.createC());
  }
  createC() { 
    return { pos: createVector(random(width), random(height)), prev: createVector(0,0), vel: this.pickVel() }; 
  }
  pickVel() { 
    let s = 1.5; 
    return (random(1)<0.5) ? createVector(random([-s,s]),0) : createVector(0, random([-s,s])); 
  }
  update() {
    for(let c of this.cons) {
      c.prev = c.pos.copy(); c.pos.add(c.vel);
      if(c.pos.x<0) c.pos.x=width; if(c.pos.x>width) c.pos.x=0;
      if(c.pos.y<0) c.pos.y=height; if(c.pos.y>height) c.pos.y=0;
      if(p5.Vector.dist(c.pos, c.prev) < 10) {
        this.traces.push({p1:c.prev.copy(), p2:c.pos.copy(), life:400});
      }
      if(random(1)<0.02) c.vel = this.pickVel();
    }
    if(this.traces.length > 3000) this.traces.splice(0, this.traces.length - 3000);
  }
  display(alphaMult) {
    strokeWeight(0.2); stroke(255, 60 * alphaMult); 
    for(let t of this.traces) line(t.p1.x, t.p1.y, t.p2.x, t.p2.y);
  }
}

// 05. DIGI_AURORA (REFINED)
class LayerSlitScan {
  constructor() {
    this.cols = floor(width / 4); 
    this.noiseStart = random(1000);
  }
  update() { }
  display(alphaMult) {
    noStroke();
    for(let i=0; i<this.cols; i++) {
      let x = i * 4;
      let n = noise(i * 0.05, frameCount * 0.01 + this.noiseStart);
      let brightness = pow(n, 3) * 255; 
      fill(brightness, brightness * alphaMult * 0.6); 
      rect(x, height/2, 2, height);
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
        b.target = b.pos.copy();
        let dir = floor(random(4));
        if(dir===0) b.target.x+=40; else if(dir===1) b.target.x-=40;
        else if(dir===2) b.target.y+=40; else b.target.y-=40;
        b.moving = true;
      }
      b.pos.lerp(b.target, b.speed);
      if(b.pos.dist(b.target) < 1) { b.pos=b.target.copy(); b.moving=false; }
      if(b.pos.x<0) b.pos.x=width; if(b.pos.x>width) b.pos.x=0;
    }
  }
  display(alphaMult) {
    stroke(255, 200 * alphaMult); strokeWeight(2);
    for(let b of this.bots) point(b.pos.x, b.pos.y);
  }
}

// 07. COSMIC_RINGS (REFINED)
class LayerRadial {
  constructor() {
    this.rings = [];
    for(let i=0; i<12; i++) {
      this.rings.push({
        r: map(i, 0, 12, 50, height*0.8),
        speed: random(0.001, 0.005) * (i%2==0?1:-1),
        particles: []
      });
      let pCount = floor(map(i, 0, 12, 50, 300));
      for(let j=0; j<pCount; j++) {
        this.rings[i].particles.push({
          angle: random(TWO_PI), offsetR: random(-5, 5)
        });
      }
    }
  }
  update() {
    for(let r of this.rings) {
      for(let p of r.particles) p.angle += r.speed; 
    }
  }
  display(alphaMult) {
    noFill(); strokeWeight(0.8);
    translate(width/2, height/2); 
    for(let r of this.rings) {
      stroke(255, 150 * alphaMult);
      for(let p of r.particles) {
        let x = (r.r + p.offsetR) * cos(p.angle);
        let y = (r.r + p.offsetR) * sin(p.angle);
        point(x, y);
      }
    }
  }
}

// 08. DATA_NEBULA (REFINED)
class LayerBinary {
  constructor() {
    this.stars = [];
    for(let i=0; i<2000; i++) {
      this.stars.push({
        x: random(width), y: random(height),
        char: round(random(1)), offset: random(1000), size: random(8, 12)
      });
    }
  }
  update() { } 
  display(alphaMult) {
    noStroke(); textAlign(CENTER, CENTER);
    for(let s of this.stars) {
      let flicker = noise(s.offset + frameCount * 0.02);
      let alpha = map(flicker, 0, 1, 30, 200);
      fill(255, alpha * alphaMult); textSize(s.size);
      text(s.char, s.x, s.y);
    }
  }
}

// 09. STAR_FIELD (REFINED)
class LayerNoise {
  constructor() {
    this.dots = [];
    for(let i=0; i<3000; i++) {
      this.dots.push({ x: random(width), y: random(height), offset: random(1000) });
    }
  }
  update() { }
  display(alphaMult) {
    strokeWeight(1);
    for(let d of this.dots) {
      let flicker = noise(d.offset + frameCount * 0.05);
      stroke(255, map(flicker, 0, 1, 50, 255) * alphaMult);
      point(d.x, d.y);
    }
  }
}

// 10. NEBULA_PHYS
class LayerNebula {
  constructor() {
    this.particles = [];
    for(let i=0; i<350; i++) this.particles.push({
      pos: createVector(random(width), random(height)),
      noiseOffset: createVector(random(1000), random(1000))
    });
  }
  update() {
    for(let p of this.particles) {
      let nX = noise(p.noiseOffset.x + frameCount * 0.003);
      let nY = noise(p.noiseOffset.y + frameCount * 0.003);
      let vel = createVector(map(nX, 0, 1, -1.5, 1.5), map(nY, 0, 1, -1.5, 1.5));
      p.pos.add(vel);
      if(p.pos.x < 0) p.pos.x = width; else if(p.pos.x > width) p.pos.x = 0;
      if(p.pos.y < 0) p.pos.y = height; else if(p.pos.y > height) p.pos.y = 0;
    }
  }
  display(alphaMult) {
    strokeWeight(0.5);
    for(let i=0; i<this.particles.length; i++) {
      let a = this.particles[i];
      for(let j=i+1; j<this.particles.length; j++) {
        let b = this.particles[j];
        let d = p5.Vector.dist(a.pos, b.pos);
        if(d < 60) {
          stroke(255, map(d, 0, 60, 180, 20) * alphaMult);
          line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        }
      }
    }
    stroke(255, 200 * alphaMult); strokeWeight(1); let size = 3;
    for(let p of this.particles) {
      line(p.pos.x - size, p.pos.y, p.pos.x + size, p.pos.y);
      line(p.pos.x, p.pos.y - size, p.pos.x, p.pos.y + size);
    }
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
