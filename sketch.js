// ==========================================
// Title: TAO_PROCESSING - FINAL STACK SYSTEM (V2.0)
// Features: Refined Aesthetics, High Density, Pro Styling
// Updates: Noise (Starry), Radial (Squares), TriMesh (Dense), Scan (Fine)
// ==========================================

let activeLayers = []; 
let font;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  textFont('Courier New');
  
  // 默认加载效果展示
  addLayer(10); // Nebula
  addLayer(3);  // TriMesh (High Density)
}

function draw() {
  background(0); // 每帧清空背景
  
  // 遍历堆栈进行渲染
  for (let i = 0; i < activeLayers.length; i++) {
    let layer = activeLayers[i];
    
    // 计算层级透明度系数
    // 堆栈顶部最亮，往下逐渐变暗
    let distanceFromTop = (activeLayers.length - 1) - i;
    let alphaMultiplier = 1.0;
    
    if (distanceFromTop > 0) {
      alphaMultiplier = map(distanceFromTop, 0, 10, 0.7, 0.1); 
      alphaMultiplier = constrain(alphaMultiplier, 0.1, 0.9);
    }
    
    push();
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

window.addLayer = function(modeIndex) {
  if (activeLayers.length >= 20) {
    alert("SYSTEM LIMIT REACHED (MAX 20)");
    return;
  }
  
  let newLayer;
  switch(modeIndex) {
    case 0: newLayer = new LayerSwarm(); break;
    case 1: newLayer = new LayerHarmonics(); break; 
    case 2: newLayer = new LayerOrbital(); break;   
    case 3: newLayer = new LayerTriMesh(); break;   // Updated
    case 4: newLayer = new LayerBlueprint(); break;
    case 5: newLayer = new LayerSlitScan(); break;  // Updated
    case 6: newLayer = new LayerGridRunner(); break;
    case 7: newLayer = new LayerRadial(); break;    // Updated (Kinetic Squares)
    case 8: newLayer = new LayerBinary(); break;
    case 9: newLayer = new LayerNoise(); break;     // Updated (Star Field)
    case 10: newLayer = new LayerNebula(); break;
  }
  
  newLayer.name = getModeName(modeIndex);
  activeLayers.push(newLayer); 
  updateUI();
}

window.removeLayer = function(index) {
  activeLayers.splice(index, 1);
  updateUI();
}

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
    
    div.innerHTML = `
      <span style="pointer-events:none;">L${i}: ${layer.name}</span> 
      <span class="delete-btn" onclick="event.stopPropagation(); removeLayer(${i})">[X]</span>
    `;
    
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
      if (parseInt(this.dataset.index) !== draggedItemIndex) this.classList.add('drag-over');
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
  let names = ["SWARM", "HARMONICS", "ORBITAL", "TRI_MESH", "BLUEPRINT", "SLIT_SCAN", "GRID_RUN", "RADIAL", "BINARY", "NOISE", "NEBULA"];
  return names[idx];
}

// ============================================================
// MODE CLASSES (VISUAL ENGINES)
// ============================================================

// 01. SWARM
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
    blendMode(ADD);
    stroke(255, 100 * alphaMult); strokeWeight(1);
    for(let p of this.particles) line(p.pos.x, p.pos.y, p.prev.x, p.prev.y);
    blendMode(BLEND);
  }
}

// 02. HARMONICS (DATA SILK)
class LayerHarmonics {
  constructor() {
    this.lines = [];
    for(let i=0; i<20; i++) {
      this.lines.push({
        baseY: map(i, 0, 20, height*0.1, height*0.9),
        amp: random(30, 120),
        phase: random(TWO_PI),
        speed: random(0.002, 0.01),
        noiseScale: random(0.002, 0.005),
        density: 3 
      });
    }
  }
  update() { }
  display(alphaMult) {
    noFill();
    for(let l of this.lines) {
      l.phase += l.speed;
      strokeWeight(1); stroke(255, 160 * alphaMult);
      beginShape(POINTS);
      for(let x = 0; x <= width; x += l.density) {
        let n = noise(x * l.noiseScale, frameCount * 0.005 + l.phase);
        let sine = sin(x * 0.01 + l.phase);
        let y = l.baseY + sine * (l.amp * n);
        let fade = 1.0;
        if(x < 100) fade = map(x, 0, 100, 0, 1);
        if(x > width-100) fade = map(x, width-100, width, 1, 0);
        stroke(255, 180 * alphaMult * fade);
        vertex(x, y);
        if (random(1) < 0.001) {
           strokeWeight(2); stroke(255, 255*alphaMult);
           point(x, y);
           strokeWeight(1); stroke(255, 160*alphaMult*fade);
        }
      }
      endShape();
    }
  }
}

// 03. ORBITAL
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
      hist: [],
      maxHist: random(20, 50)
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

// 04. TRI_MESH (UPDATED: HIGH DENSITY)
// 修改：数量增加到 400，连线距离减小，线条更细
class LayerTriMesh {
  constructor() {
    this.nodes = [];
    // 增加节点数量，提升密度
    for(let i=0; i<400; i++) this.nodes.push({
      pos: createVector(random(width), random(height)),
      vel: p5.Vector.random2D().mult(0.3) // 速度减慢，更稳定
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
    strokeWeight(0.2); // 极细连线，防止糊成一片
    for(let i=0; i<this.nodes.length; i++) {
      let a = this.nodes[i];
      // 优化：只检查部分邻居，提升性能
      for(let j=i+1; j<this.nodes.length; j++) {
        let b = this.nodes[j];
        // 快速距离检查
        if (abs(a.pos.x - b.pos.x) > 60 || abs(a.pos.y - b.pos.y) > 60) continue;
        
        let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        if(d < 60) {
          // 距离越近越亮
          stroke(255, map(d,0,60,180,0) * alphaMult);
          line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        }
      }
    }
    // 绘制节点点
    strokeWeight(1.5);
    stroke(255, 150 * alphaMult);
    for(let n of this.nodes) point(n.pos.x, n.pos.y);
  }
}

// 05. BLUEPRINT
class LayerBlueprint {
  constructor() {
    this.cons = [];
    this.traces = [];
    for(let i=0; i<20; i++) this.cons.push(this.createC());
  }
  createC() {
    return { pos: createVector(random(width), random(height)), prev: createVector(0,0), vel: this.pickVel() };
  }
  pickVel() { return (random(1)<0.5) ? createVector(random([-3,3]),0) : createVector(0, random([-3,3])); }
  update() {
    for(let c of this.cons) {
      c.prev = c.pos.copy(); c.pos.add(c.vel);
      if(c.pos.x<0) c.pos.x=width; if(c.pos.x>width) c.pos.x=0;
      if(c.pos.y<0) c.pos.y=height; if(c.pos.y>height) c.pos.y=0;
      if(p5.Vector.dist(c.pos, c.prev) < 10) this.traces.push({p1:c.prev.copy(), p2:c.pos.copy(), life:255});
      if(random(1)<0.05) c.vel = this.pickVel();
    }
    for(let i=this.traces.length-1; i>=0; i--) {
      this.traces[i].life -= 5;
      if(this.traces[i].life<=0) this.traces.splice(i,1);
    }
  }
  display(alphaMult) {
    strokeWeight(1);
    for(let t of this.traces) {
      stroke(255, t.life * alphaMult);
      line(t.p1.x, t.p1.y, t.p2.x, t.p2.y);
    }
  }
}

// 06. SLIT_SCAN (UPDATED: FINE LINES + DUST)
// 修改：不再是粗条，而是极细的扫描线，数量增加，带有粒子尘埃
class LayerSlitScan {
  constructor() {
    this.scanners = [];
    // 增加扫描线数量到 15 条
    for(let i=0; i<15; i++) {
      this.scanners.push({
        y: random(height), 
        speed: random(0.5, 3) * (random(1)<0.5?1:-1),
        type: random(1)<0.5 ? 'H' : 'V', // 支持横向和纵向
        pos: random(width) // 若为V模式
      });
    }
    this.dust = [];
  }
  update() {
    // 移动扫描线
    for(let s of this.scanners) {
      if(s.type === 'H') {
        s.y += s.speed;
        if(s.y > height) s.y = 0; if(s.y < 0) s.y = height;
        // 生成尘埃
        if(random(1)<0.2) this.dust.push({x: random(width), y: s.y + random(-10,10), life: 255});
      } else {
        s.pos += s.speed;
        if(s.pos > width) s.pos = 0; if(s.pos < 0) s.pos = width;
        if(random(1)<0.2) this.dust.push({x: s.pos + random(-10,10), y: random(height), life: 255});
      }
    }
    // 更新尘埃
    for(let i=this.dust.length-1; i>=0; i--) {
      this.dust[i].life -= 5;
      if(this.dust[i].life <= 0) this.dust.splice(i,1);
    }
  }
  display(alphaMult) {
    // 绘制扫描线
    strokeWeight(1); // 细线
    for(let s of this.scanners) {
      stroke(255, 100 * alphaMult); // 半透明
      if(s.type === 'H') line(0, s.y, width, s.y);
      else line(s.pos, 0, s.pos, height);
    }
    // 绘制尘埃
    strokeWeight(1.5);
    for(let d of this.dust) {
      stroke(255, d.life * alphaMult);
      point(d.x, d.y);
    }
  }
}

// 07. GRID_RUN
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

// 08. RADIAL (UPDATED: KINETIC SQUARES)
// 修改：完全重写，复刻图片 image_e1cf38.jpg 的效果
// 短方块拖尾，高密度，随机分布
class LayerRadial {
  constructor() {
    this.particles = [];
    // 高密度：800个
    for(let i=0; i<800; i++) {
      this.particles.push({
        pos: createVector(random(width), random(height)),
        vel: p5.Vector.random2D().mult(random(1, 3)),
        len: random(5, 15), // 拖尾长度
        thick: random(1, 3)  // 方块厚度
      });
    }
  }
  update() {
    for(let p of this.particles) {
      p.pos.add(p.vel);
      // 边界环绕
      if(p.pos.x < 0) p.pos.x = width; if(p.pos.x > width) p.pos.x = 0;
      if(p.pos.y < 0) p.pos.y = height; if(p.pos.y > height) p.pos.y = 0;
    }
  }
  display(alphaMult) {
    noStroke();
    fill(255, 180 * alphaMult);
    for(let p of this.particles) {
      // 绘制带方向的短矩形
      push();
      translate(p.pos.x, p.pos.y);
      rotate(p.vel.heading());
      rect(0, 0, p.len, p.thick); // 绘制长条
      pop();
    }
  }
}

// 09. BINARY
class LayerBinary {
  constructor() {
    this.streams = [];
    for(let i=0; i<50; i++) this.streams.push({
      x: floor(random(width/15))*15, y: random(-height, 0),
      speed: random(3,8), chars: Array(15).fill(0).map(()=>round(random(1)))
    });
  }
  update() {
    for(let s of this.streams) {
      s.y += s.speed;
      if(s.y > height) s.y = random(-500, -100);
      if(frameCount%5===0) { s.chars.pop(); s.chars.unshift(round(random(1))); }
    }
  }
  display(alphaMult) {
    fill(255, 200 * alphaMult); noStroke(); textSize(10);
    for(let s of this.streams) {
      for(let i=0; i<s.chars.length; i++) text(s.chars[i], s.x, s.y - i*12);
    }
  }
}

// 10. NOISE (UPDATED: STARRY SKY)
// 修改：不再是流场，而是静止的高密度星空，只有透明度闪烁
class LayerNoise {
  constructor() {
    this.dots = [];
    // 超高密度：3000个
    for(let i=0; i<3000; i++) {
      this.dots.push({
        x: random(width),
        y: random(height),
        offset: random(1000) // 用于闪烁的噪点偏移
      });
    }
  }
  update() {
    // 位置静止，无需更新 pos
  }
  display(alphaMult) {
    strokeWeight(1);
    for(let d of this.dots) {
      // 闪烁逻辑
      let flicker = noise(d.offset + frameCount * 0.05); // 慢速闪烁
      let alpha = map(flicker, 0, 1, 50, 255);
      stroke(255, alpha * alphaMult);
      point(d.x, d.y);
    }
  }
}

// 11. NEBULA (NO-FLICKER)
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
