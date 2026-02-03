// ==========================================
// Title: MEAL DEAL - GENERATIVE SYNTHESIS (COSMIC EDITION)
// Logic: Select 3 Modules (Rule A + Rule B + Element 1)
// Style: Elegant, High-Density, Sci-Fi, Ambient
// ==========================================

let currentMeal = { A: null, B: null, C: null };
let activeLayers = { A: null, B: null, C: null };
let font;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  // 使用系统自带等宽字体，加载更快且更具科技感
  textFont('Courier, monospace'); 
  background(0);
  
  // 预设一个极具宇宙感的套餐
  selectItem('A', 10); // Nebula (Physics)
  selectItem('B', 4);  // Blueprint (Structure)
  selectItem('C', 8);  // Binary (Texture)
}

function draw() {
  background(0); // 每帧清空背景
  
  // 渲染顺序与混合模式优化
  
  // 1. Render Rule A (Base Layer - Physics Movement)
  if (activeLayers.A) {
    push();
    activeLayers.A.update();
    activeLayers.A.display(1.0); 
    pop();
  }

  // 2. Render Rule B (Mid Layer - Static Structure)
  // 使用 ADD 模式让结构叠加发光
  if (activeLayers.B) {
    push();
    blendMode(ADD);
    activeLayers.B.update();
    activeLayers.B.display(0.7); 
    pop();
  }

  // 3. Render Element 1 (Top Layer - Fine Texture)
  // 使用 ADD 模式让纹理最亮
  if (activeLayers.C) {
    push();
    blendMode(ADD);
    activeLayers.C.update();
    activeLayers.C.display(0.8);
    blendMode(BLEND);
    pop();
  }
  
  drawUI();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }

// ==========================================
// 交互逻辑 (Interaction Logic)
// ==========================================

window.selectItem = function(category, id) {
  currentMeal[category] = id;
  let newLayer = createLayerById(id);
  activeLayers[category] = newLayer;
  updateUIState(category, id, newLayer.name);
}

function updateUIState(category, id, name) {
  let buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => {
    let clickStr = btn.getAttribute('onclick');
    if (clickStr.includes(`'${category}', ${id}`)) {
      btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    }
  });
  let slot = document.getElementById(`slot-${category}`);
  slot.classList.add('filled');
  slot.querySelector('.content').innerText = name;
}

function createLayerById(id) {
  let layer;
  switch(id) {
    case 0: layer = new LayerSwarm(); break;
    case 1: layer = new LayerHarmonics(); break; // REFINED
    case 2: layer = new LayerOrbital(); break;
    case 3: layer = new LayerTriMesh(); break;
    case 4: layer = new LayerBlueprint(); break; // REFINED
    case 5: layer = new LayerSlitScan(); break; // REFINED
    case 6: layer = new LayerGridRunner(); break;
    case 7: layer = new LayerRadial(); break;    // REFINED
    case 8: layer = new LayerBinary(); break;    // REFINED
    case 9: layer = new LayerNoise(); break;
    case 10: layer = new LayerNebula(); break;
  }
  layer.name = getModeName(id);
  return layer;
}

function getModeName(idx) {
  let names = ["SWARM", "DATA_BEAMS", "ORBITAL", "TRI_MESH", "DEEP_STRUCT", "DIGI_AURORA", "GRID_RUN", "COSMIC_RINGS", "DATA_NEBULA", "STAR_FIELD", "NEBULA_PHYS"];
  return names[idx];
}

function drawUI() {
  fill(255); noStroke(); textAlign(RIGHT, TOP); textSize(12);
  text("COSMIC_SYNTHESIS_PROTOCOL // V2.1", width-20, 20);
  textAlign(RIGHT, BOTTOM);
  text("Tao_processing", width-20, height-20);
}

// ============================================================
// VISUAL ENGINES (REFINED FOR ELEGANCE & COSMIC FEEL)
// ============================================================

// --- RULE A (PHYSICS) ---

// 00. SWARM (保持原样，效果不错)
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

// 02. ORBITAL (保持原样，效果不错)
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

// 06. GRID_RUN (优秀案例，保持原样)
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

// 10. NEBULA_PHYS (保持原样，效果不错)
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

// --- RULE B (STRUCTURE) ---

// 05. DIGI_AURORA (REFINED: 高密数字极光)
// 修改：不再是几根线，而是铺满屏幕的垂直像素帘，亮度随噪波缓慢流动
class LayerSlitScan {
  constructor() {
    this.cols = floor(width / 4); // 每4个像素一列
    this.noiseStart = random(1000);
  }
  update() { }
  display(alphaMult) {
    noStroke();
    for(let i=0; i<this.cols; i++) {
      let x = i * 4;
      // 使用二维噪声创造缓慢流动的光幕效果
      let n = noise(i * 0.05, frameCount * 0.01 + this.noiseStart);
      // 通过幂运算增强对比度，让亮部更亮，暗部更暗
      let brightness = pow(n, 3) * 255; 
      
      fill(brightness, brightness * alphaMult * 0.6); // 控制整体透明度
      // 绘制细长的垂直光条
      rect(x, height/2, 2, height);
    }
  }
}

// 04. DEEP_STRUCT (REFINED: 高维深空结构)
// 修改：数量增加到800，线条极细，速度极慢，形成密集的幽灵结构
class LayerBlueprint {
  constructor() {
    this.cons = []; this.traces = [];
    // 巨量增加构建者
    for(let i=0; i<800; i++) this.cons.push(this.createC());
  }
  createC() { 
    return { 
      pos: createVector(random(width), random(height)), 
      prev: createVector(0,0), 
      vel: this.pickVel() 
    }; 
  }
  pickVel() { 
    // 极慢的速度
    let s = 1.5; 
    return (random(1)<0.5) ? createVector(random([-s,s]),0) : createVector(0, random([-s,s])); 
  }
  update() {
    for(let c of this.cons) {
      c.prev = c.pos.copy(); c.pos.add(c.vel);
      // 边界环绕而不是反弹，保持结构连续性
      if(c.pos.x<0) c.pos.x=width; if(c.pos.x>width) c.pos.x=0;
      if(c.pos.y<0) c.pos.y=height; if(c.pos.y>height) c.pos.y=0;
      
      // 记录痕迹，寿命很长
      if(p5.Vector.dist(c.pos, c.prev) < 10) {
        this.traces.push({p1:c.prev.copy(), p2:c.pos.copy(), life:400});
      }
      if(random(1)<0.02) c.vel = this.pickVel();
    }
    // 维护痕迹数组
    if(this.traces.length > 3000) this.traces.splice(0, this.traces.length - 3000);
  }
  display(alphaMult) {
    strokeWeight(0.2); // 极细线条
    stroke(255, 60 * alphaMult); // 非常淡
    for(let t of this.traces) {
      line(t.p1.x, t.p1.y, t.p2.x, t.p2.y);
    }
  }
}

// 07. COSMIC_RINGS (REFINED: 优雅的宇宙环)
// 修改：同心旋转的粒子环，模拟星环
class LayerRadial {
  constructor() {
    this.rings = [];
    // 创建 12 个主要环带
    for(let i=0; i<12; i++) {
      this.rings.push({
        r: map(i, 0, 12, 50, height*0.8), // 半径分布
        speed: random(0.001, 0.005) * (i%2==0?1:-1), // 极慢转速，正反交替
        particles: []
      });
      // 每个环带填充粒子
      let pCount = floor(map(i, 0, 12, 50, 300));
      for(let j=0; j<pCount; j++) {
        this.rings[i].particles.push({
          angle: random(TWO_PI),
          offsetR: random(-5, 5) // 半径微调，增加厚度感
        });
      }
    }
  }
  update() {
    for(let r of this.rings) {
      for(let p of r.particles) {
        p.angle += r.speed; // 旋转粒子
      }
    }
  }
  display(alphaMult) {
    noFill(); strokeWeight(0.8);
    translate(width/2, height/2); // 中心化
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

// 08. DATA_NEBULA (REFINED: 静谧数据星云)
// 修改：不再下落，而是静止悬浮的微小数字，像星星一样闪烁
class LayerBinary {
  constructor() {
    this.stars = [];
    // 高密度：2000个数据点
    for(let i=0; i<2000; i++) {
      this.stars.push({
        x: random(width), y: random(height),
        char: round(random(1)), // 0 或 1
        offset: random(1000), // 闪烁偏移
        size: random(8, 12) // 微小的尺寸变化
      });
    }
  }
  update() { } // 静止不动
  display(alphaMult) {
    noStroke(); textAlign(CENTER, CENTER);
    for(let s of this.stars) {
      // 缓慢呼吸闪烁
      let flicker = noise(s.offset + frameCount * 0.02);
      let alpha = map(flicker, 0, 1, 30, 200);
      
      fill(255, alpha * alphaMult);
      textSize(s.size);
      text(s.char, s.x, s.y);
    }
  }
}

// --- ELEMENT 1 (TEXTURE) ---

// 01. DATA_BEAMS (REFINED: 垂直闪烁光束)
// 修改：改成笔直的垂直线，进行高频亮度闪烁
class LayerHarmonics {
  constructor() {
    this.beams = [];
    // 每隔 10px 一条光束
    for(let x=0; x<width; x+=10) {
      this.beams.push({
        x: x,
        noiseOffset: random(1000), // 独立的闪烁频率
        width: random(0.5, 2) // 不同的粗细
      });
    }
  }
  update() { }
  display(alphaMult) {
    noFill();
    for(let b of this.beams) {
      // 高频闪烁噪声
      let n = noise(b.noiseOffset, frameCount * 0.5);
      // 阈值过滤，让闪烁更干脆
      let brightness = (n > 0.6) ? map(n, 0.6, 1, 50, 255) : 0;
      
      if(brightness > 0) {
        strokeWeight(b.width);
        stroke(255, brightness * alphaMult);
        line(b.x, 0, b.x, height);
      }
    }
  }
}

// 03. TRI_MESH (保持原样，高密度版效果不错)
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

// 09. STAR_FIELD (保持原样，静谧星空效果不错)
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
