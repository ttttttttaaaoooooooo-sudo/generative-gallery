// ==========================================
// Title: TAO_PROCESSING - LAYERED STACK SYSTEM
// Architecture: Object-Oriented Mixer
// Core: Multi-layer rendering with alpha decay
// ==========================================

let activeLayers = []; // 存储当前活跃的图层对象
let font;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  textFont('Courier New');
  
  // 默认添加一个图层，防止开局太空
  addLayer(0);
}

function draw() {
  background(0); // 统一清空背景
  
  // 遍历堆栈进行渲染
  // index 越大代表越在"上面" (在数组末尾)，也就是 HTML 堆栈的顶部
  // 我们希望顶部的图层最亮，底部的最暗
  
  for (let i = 0; i < activeLayers.length; i++) {
    let layer = activeLayers[i];
    
    // 计算层级透明度系数 (0.0 - 1.0)
    // 顶部图层(最后一个) = 1.0
    // 往下逐渐衰减
    let distanceFromTop = (activeLayers.length - 1) - i;
    let alphaMultiplier = 1.0;
    
    if (distanceFromTop > 0) {
      alphaMultiplier = map(distanceFromTop, 0, 5, 0.6, 0.1); 
      alphaMultiplier = constrain(alphaMultiplier, 0.1, 0.8);
    }
    
    // 运行该图层
    push(); // 隔离绘图状态
    layer.update();
    layer.display(alphaMultiplier);
    pop();
  }
  
  drawGlobalUI();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// === 图层管理系统 ===

// 添加图层
window.addLayer = function(modeIndex) {
  if (activeLayers.length >= 6) {
    alert("SYSTEM OVERLOAD: MAX 6 LAYERS ALLOWED");
    return;
  }
  
  let newLayer;
  switch(modeIndex) {
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
  }
  
  newLayer.name = getModeName(modeIndex);
  activeLayers.push(newLayer); // 添加到数组末尾（顶部）
  updateUI();
}

// 移除图层
window.removeLayer = function(index) {
  activeLayers.splice(index, 1);
  updateUI();
}

// 更新 HTML UI
function updateUI() {
  let stackDiv = document.getElementById('stack');
  stackDiv.innerHTML = '';
  
  // 倒序遍历，因为 HTML 中上面显示的是数组末尾（Top Layer）
  for (let i = 0; i < activeLayers.length; i++) {
    let layer = activeLayers[i];
    let div = document.createElement('div');
    
    // 计算样式类
    let distanceFromTop = (activeLayers.length - 1) - i;
    let opacityClass = 'opacity-high';
    if(distanceFromTop === 1) opacityClass = 'opacity-mid';
    if(distanceFromTop > 1) opacityClass = 'opacity-low';
    
    div.className = `layer-item ${opacityClass}`;
    div.innerHTML = `<span>L${i}: ${layer.name}</span> <span>[X]</span>`;
    div.onclick = () => removeLayer(i); // 点击删除
    
    stackDiv.appendChild(div); // appendChild 配合 flex-direction: column-reverse 实现堆叠
  }
}

function getModeName(idx) {
  let names = ["SWARM", "HARMONICS", "ORBITAL", "TRI_MESH", "BLUEPRINT", "SLIT_SCAN", "GRID_RUN", "RADIAL", "BINARY", "NOISE"];
  return names[idx];
}

// ============================================================
// MODE CLASSES (每个模式封装为一个独立的类)
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

// ============================================================
// 02. HARMONICS (REMASTERED: DATA SILK)
// 风格：优雅、流动、非实体线条、数据流感
// ============================================================
class LayerHarmonics {
  constructor() {
    this.lines = [];
    // 创建 30 层波浪，数量适中以保持优雅
    for(let i=0; i<30; i++) {
      this.lines.push({
        baseY: map(i, 0, 30, height*0.15, height*0.85), // 分布在屏幕垂直方向
        amp: random(20, 100),       // 振幅
        phase: random(TWO_PI),      // 初始相位
        speed: random(0.005, 0.02), // 波浪起伏速度
        flowSpeed: random(1, 3),    // 数据点横向流动速度
        noiseOffset: random(1000),  // 噪点偏移，保证每条线形状不同
        density: floor(random(10, 20)) // 点的间距
      });
    }
  }

  update() {
    // 逻辑在 display 中一并处理以优化循环
  }

  display(alphaMult) {
    noFill();
    
    for(let l of this.lines) {
      // 1. 更新参数
      l.phase += l.speed;      // 上下起伏的节奏
      l.noiseOffset += 0.002;  // 形状缓慢变形 (模拟水流)
      
      // 2. 绘制 "幽灵线" (极淡的背景轨迹，增加层次感)
      strokeWeight(1);
      stroke(255, 15 * alphaMult); // 透明度极低 (15/255)
      
      beginShape();
      for(let x = 0; x <= width; x += 20) {
        let n = noise(x * 0.003 + l.noiseOffset, frameCount * 0.001);
        // 结合 Sine (韵律) + Noise (有机)
        let y = l.baseY + sin(x * 0.005 + l.phase) * (l.amp * n);
        vertex(x, y);
      }
      endShape();

      // 3. 绘制 "流动数据点" (视觉主体)
      // 这些点沿着波浪路径高速移动
      strokeWeight(1.5);
      stroke(255, 180 * alphaMult); // 较亮
      
      // 计算流动的偏移量
      let flowShift = (frameCount * l.flowSpeed) % l.density;
      
      for(let x = flowShift; x <= width; x += l.density) {
        // 使用同样的数学公式计算 Y，确保点在线上
        let n = noise(x * 0.003 + l.noiseOffset, frameCount * 0.001);
        let y = l.baseY + sin(x * 0.005 + l.phase) * (l.amp * n);
        
        // [视觉优化] 距离中心越近，点越活跃；边缘则淡出
        let distFromCenter = abs(width/2 - x);
        let fade = map(distFromCenter, 0, width/2, 1, 0.2);
        
        // 偶尔画点，偶尔画短线，制造 Data Glitch 感
        if (noise(x * 0.1, frameCount * 0.05) > 0.3) {
           point(x, y);
        } else {
           // 极细的竖线装饰，像 Ryoji Ikeda 的数据雨
           strokeWeight(0.5);
           line(x, y - 2, x, y + 2);
           strokeWeight(1.5);
        }
      }
    }
  }
}

// 03. ORBITAL
class LayerOrbital {
  constructor() {
    this.agents = [];
    for(let i=0; i<300; i++) this.agents.push(this.create());
  }
  create() {
    return {
      pos: createVector(random(width), random(height)),
      vel: p5.Vector.fromAngle(floor(random(8))*PI/4).mult(random(2,6)),
      hist: []
    };
  }
  update() {
    for(let a of this.agents) {
      a.pos.add(a.vel);
      if(a.pos.x<0) a.pos.x=width; if(a.pos.x>width) a.pos.x=0;
      if(a.pos.y<0) a.pos.y=height; if(a.pos.y>height) a.pos.y=0;
      a.hist.push(a.pos.copy());
      if(a.hist.length > 20) a.hist.shift();
    }
  }
  display(alphaMult) {
    noFill(); stroke(255, 200 * alphaMult); strokeWeight(1);
    for(let a of this.agents) {
      beginShape(); for(let v of a.hist) vertex(v.x, v.y); endShape();
    }
  }
}

// 04. TRI_MESH
class LayerTriMesh {
  constructor() {
    this.nodes = [];
    for(let i=0; i<150; i++) this.nodes.push({
      pos: createVector(random(width), random(height)),
      vel: p5.Vector.random2D().mult(0.5)
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
    strokeWeight(0.5);
    for(let i=0; i<this.nodes.length; i++) {
      let a = this.nodes[i];
      for(let j=i+1; j<this.nodes.length; j++) {
        let b = this.nodes[j];
        let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        if(d < 70) {
          stroke(255, map(d,0,70,150,0) * alphaMult);
          line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        }
      }
    }
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

// 06. SLIT_SCAN
class LayerSlitScan {
  constructor() {
    this.bars = [];
    this.scanners = [];
    for(let i=0; i<3; i++) this.scanners.push({y:random(height), speed:random(2,5)});
  }
  update() {
    for(let s of this.scanners) {
      s.y += s.speed;
      if(s.y > height) s.y = 0;
      if(random(1)<0.2) this.bars.push({y:s.y, h:random(2,10), life:255});
    }
    for(let i=this.bars.length-1; i>=0; i--) {
      this.bars[i].life -= 3;
      if(this.bars[i].life<=0) this.bars.splice(i,1);
    }
  }
  display(alphaMult) {
    noStroke();
    for(let b of this.bars) {
      fill(255, b.life * alphaMult);
      rect(width/2, b.y, width, b.h);
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

// 08. RADIAL
class LayerRadial {
  constructor() { this.circles = []; }
  update() {
    if(frameCount%15===0) this.circles.push({x:random(width), y:random(height), r:0, life:255});
    for(let i=this.circles.length-1; i>=0; i--) {
      let c = this.circles[i]; c.r+=2; c.life-=3;
      if(c.life<=0) this.circles.splice(i,1);
    }
  }
  display(alphaMult) {
    noFill(); strokeWeight(1);
    for(let c of this.circles) {
      stroke(255, c.life * alphaMult);
      ellipse(c.x, c.y, c.r, c.r);
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

// 10. NOISE
class LayerNoise {
  constructor() { this.dots = []; for(let i=0; i<1000; i++) this.dots.push(createVector(random(width), random(height))); }
  update() {
    for(let d of this.dots) {
      let n = noise(d.x*0.005, d.y*0.005, frameCount*0.005);
      d.add(p5.Vector.fromAngle(n*TWO_PI*4).mult(2));
      if(d.x<0) d.x=width; if(d.x>width) d.x=0;
      if(d.y<0) d.y=height; if(d.y>height) d.y=0;
    }
  }
  display(alphaMult) {
    stroke(255, 100 * alphaMult); strokeWeight(1);
    for(let d of this.dots) point(d.x, d.y);
  }
}

// ============================================================
// UI
// ============================================================
function drawGlobalUI() {
  fill(255); noStroke(); textAlign(RIGHT, BOTTOM); textSize(12);
  let info = "ACTIVE_LAYERS: " + activeLayers.length + " // Tao_processing";
  text(info, width-20, height-20);
}
