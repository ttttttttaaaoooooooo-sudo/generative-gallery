let activeLayers = [];
let draggedItemIndex = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  textFont('Courier New');
  randomizeStack(); // 初始随机生成
}

function draw() {
  background(0);
  for (let i = 0; i < activeLayers.length; i++) {
    let layer = activeLayers[i];
    let distFromTop = (activeLayers.length - 1) - i;
    let alphaMult = constrain(map(distFromTop, 0, 10, 1.0, 0.2), 0.2, 1.0);
    
    push();
    blendMode(ADD);
    layer.update();
    layer.display(alphaMult);
    pop();
  }
  drawGlobalUI();
}

// --- 逻辑管理 ---
window.addLayer = function(idx, skipUI = false) {
  if (activeLayers.length >= 20) return;
  let layer = createLayerById(idx);
  layer.name = getModeName(idx);
  activeLayers.push(layer);
  if (!skipUI) updateUI();
}

window.removeLayer = function(i) { activeLayers.splice(i, 1); updateUI(); }

window.randomizeStack = function() {
  activeLayers = [];
  let count = floor(random(5, 12));
  for (let i = 0; i < count; i++) addLayer(floor(random(0, 23)), true);
  updateUI();
}

function createLayerById(id) {
  switch (id) {
    case 0: return new LayerSwarm(); case 1: return new LayerBeams();
    case 2: return new LayerOrbital(); case 3: return new LayerGrid();
    case 4: return new LayerHyper(); case 5: return new LayerAurora();
    case 6: return new LayerGridRun(); case 7: return new LayerRings();
    case 8: return new LayerDataNebula(); case 9: return new LayerStars();
    case 10: return new LayerCluster(); case 11: return new LayerLattice();
    case 12: return new LayerSurface(); case 13: return new LayerTension();
    case 14: return new LayerVContact(); case 15: return new LayerVPrism();
    case 16: return new LayerVGate(); case 17: return new LayerVHex();
    case 18: return new LayerVLock(); case 19: return new LayerVGlyph();
    case 20: return new LayerCLattice(); case 21: return new LayerCShard();
    case 22: return new LayerCVeil();
  }
}

function getModeName(id) {
  const n = ["SWARM", "BEAMS", "ORBITAL", "GRID", "HYPER", "AURORA", "GRIDRUN", "RINGS", "DATA", "STARS", "CLUSTER", "LATTICE", "SURFACE", "TENSION", "V_CONTACT", "V_PRISM", "V_GATE", "V_HEX", "V_LOCK", "V_GLYPH", "C_LATTICE", "C_SHARD", "C_VEIL"];
  return n[id];
}

// --- UI 渲染 & 拖拽 ---
function updateUI() {
  const stackDiv = document.getElementById('stack');
  stackDiv.innerHTML = '';
  for (let i = activeLayers.length - 1; i >= 0; i--) {
    const div = document.createElement('div');
    div.className = `layer-item ${i === activeLayers.length-1 ? 'opacity-high' : i > activeLayers.length-4 ? 'opacity-mid' : 'opacity-low'}`;
    div.draggable = true; div.dataset.index = i;
    div.innerHTML = `<span>L${i}: ${activeLayers[i].name}</span><span class="delete-btn" onclick="removeLayer(${i})">[X]</span>`;
    div.addEventListener('dragstart', e => { draggedItemIndex = i; div.classList.add('dragging'); });
    div.addEventListener('dragover', e => { e.preventDefault(); div.classList.add('drag-over'); });
    div.addEventListener('dragleave', e => div.classList.remove('drag-over'));
    div.addEventListener('drop', e => {
      let from = draggedItemIndex, to = i;
      let item = activeLayers.splice(from, 1)[0];
      activeLayers.splice(to, 0, item);
      updateUI();
    });
    stackDiv.appendChild(div);
  }
}

function drawGlobalUI() {
  fill(255); noStroke(); textAlign(RIGHT, BOTTOM); textSize(12);
  text("ACTIVE_LAYERS: " + activeLayers.length + " // Tao_processing", width - 20, height - 20);
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }

// ==========================================
// 视觉引擎类 (简化整合版)
// ==========================================

// 00-10 经典系列
class LayerSwarm {
  constructor() { this.pts = Array(800).fill().map(() => ({p: createVector(width/2, height/2), v: p5.Vector.random2D().mult(random(2,8))})); }
  update() { this.pts.forEach(p => { p.v.add(p5.Vector.fromAngle(noise(p.p.x*0.01, p.p.y*0.01, frameCount*0.01)*8).mult(0.2)); p.p.add(p.v); p.v.mult(0.95); }); }
  display(a) { stroke(255, 100*a); this.pts.forEach(p => point(p.p.x, p.p.y)); }
}

class LayerBeams {
  display(a) { for(let x=0; x<width; x+=15) { let n=noise(x, frameCount*0.5); if(n>0.6) { stroke(255, map(n,0.6,1,0,255)*a); line(x, 0, x, height); } } }
  update(){}
}

class LayerOrbital {
  constructor() { this.ag = Array(400).fill().map(() => ({p: createVector(random(width), random(height)), v: p5.Vector.fromAngle(floor(random(8))*QUARTER_PI).mult(3), h: []})); }
  update() { this.ag.forEach(a => { a.p.add(a.v); a.h.push(a.p.copy()); if(a.h.length>20) a.h.shift(); if(a.p.x<0||a.p.x>width||a.p.y<0||a.p.y>height) a.h=[]; }); }
  display(a) { stroke(255, 150*a); noFill(); this.ag.forEach(a => { beginShape(); a.h.forEach(p => vertex(p.x, p.y)); endShape(); }); }
}

class LayerGrid {
  constructor() { this.n = Array(300).fill().map(() => ({p: createVector(random(width), random(height)), v: p5.Vector.random2D().mult(0.5)})); }
  update() { this.n.forEach(n => n.p.add(n.v)); }
  display(a) { stroke(255, 50*a); for(let i=0; i<this.n.length; i++) for(let j=i+1; j<this.n.length; j++) { let d=dist(this.n[i].p.x, this.n[i].p.y, this.n[j].p.x, this.n[j].p.y); if(d<60) line(this.n[i].p.x, this.n[i].p.y, this.n[j].p.x, this.n[j].p.y); } }
}

class LayerHyper {
  constructor() { this.t = []; this.c = Array(400).fill().map(() => ({p: createVector(random(width), random(height)), v: createVector(random([-2,2]),0)})); }
  update() { this.c.forEach(c => { let pr=c.p.copy(); c.p.add(c.v); if(random(1)<0.02) c.v = random(1)<0.5?createVector(random([-2,2]),0):createVector(0,random([-2,2])); this.t.push({a:pr, b:c.p.copy(), l:255}); }); this.t = this.t.filter(t => (t.l-=2)>0); }
  display(a) { stroke(255, 50*a); this.t.forEach(t => line(t.a.x, t.a.y, t.b.x, t.b.y)); }
}

class LayerAurora {
  display(a) { noStroke(); for(let i=0; i<width; i+=4) { fill(255, pow(noise(i*0.01, frameCount*0.02), 4)*255*a); rect(i, height/2, 2, height); } }
  update(){}
}

class LayerGridRun {
  constructor() { this.b = Array(300).fill().map(() => ({p: createVector(floor(random(width/40))*40, floor(random(height/40))*40), t: createVector(0,0)})); }
  update() { this.b.forEach(b => { if(frameCount%20==0) b.t = p5.Vector.add(b.p, p5.Vector.fromAngle(floor(random(4))*HALF_PI).mult(40)); b.p.lerp(b.t, 0.1); }); }
  display(a) { stroke(255, 200*a); this.b.forEach(b => point(b.p.x, b.p.y)); }
}

class LayerRings {
  display(a) { noFill(); translate(width/2, height/2); for(let i=0; i<10; i++) { stroke(255, 100*a); rotate(frameCount*0.001*i); arc(0,0, i*100, i*100, 0, PI); } }
  update(){}
}

class LayerDataNebula {
  constructor() { this.s = Array(1000).fill().map(() => ({p: createVector(random(width), random(height)), c: floor(random(2)), o: random(1000)})); }
  update() { this.s.forEach(s => { s.p.y += 0.5; if(s.p.y>height) s.p.y=0; }); }
  display(a) { fill(255, 150*a); noStroke(); this.s.forEach(s => { if(noise(s.o+frameCount*0.05)>0.4) text(s.c, s.p.x, s.p.y); }); }
}

class LayerStars {
  display(a) { for(let i=0; i<1000; i++) { stroke(255, noise(i, frameCount*0.02)*255*a); point(noise(i*10)*width, noise(i*20)*height); } }
  update(){}
}

class LayerCluster {
  constructor() { this.p = Array(200).fill().map(() => ({p: createVector(random(width), random(height)), o: random(1000)})); }
  update() { this.p.forEach(p => { p.p.add(p5.Vector.fromAngle(noise(p.o, frameCount*0.005)*8).mult(1)); }); }
  display(a) { stroke(255, 100*a); this.p.forEach(p => { ellipse(p.p.x, p.p.y, 2, 2); }); }
}

// 11-19 Void 系列
class LayerLattice {
  constructor() { this.ag = Array(100).fill().map(() => ({p: createVector(random(width), random(height)), v: createVector(random([-1,1]), random([-1,1]))})); }
  update() { this.ag.forEach(a => { a.p.add(a.v); if(a.p.x<0||a.p.x>width) a.v.x*=-1; if(a.p.y<0||a.p.y>height) a.v.y*=-1; }); }
  display(a) { stroke(255, 80*a); for(let i=0; i<this.ag.length; i++) for(let j=i+1; j<this.ag.length; j++) if(dist(this.ag[i].p.x, this.ag[i].p.y, this.ag[j].p.x, this.ag[j].p.y)<100) line(this.ag[i].p.x, this.ag[i].p.y, this.ag[j].p.x, this.ag[j].p.y); }
}

class LayerSurface {
  constructor() { this.ag = Array(80).fill().map(() => ({p: createVector(random(width), random(height)), v: p5.Vector.random2D().mult(0.5)})); }
  update() { this.ag.forEach(a => a.p.add(a.v)); }
  display(a) { fill(255, 20*a); noStroke(); for(let i=0; i<this.ag.length; i++) { let n = this.ag.filter(o => dist(this.ag[i].p.x, this.ag[i].p.y, o.p.x, o.p.y)<80); if(n.length>=3) triangle(n[0].p.x, n[0].p.y, n[1].p.x, n[1].p.y, n[2].p.x, n[2].p.y); } }
}

class LayerTension {
  constructor() { this.ag = Array(100).fill().map(() => ({p: createVector(random(width), random(height)), v: createVector(0,0), ac: createVector(0,0)})); }
  update() { this.ag.forEach(a => { this.ag.forEach(o => { let d=dist(a.p.x, a.p.y, o.p.x, o.p.y); if(d>0&&d<40) a.ac.add(p5.Vector.sub(a.p, o.p).normalize().mult(0.5)); }); a.v.add(a.ac); a.v.limit(2); a.p.add(a.v); a.ac.mult(0); }); }
  display(a) { stroke(255, 150*a); for(let i=0; i<this.ag.length; i++) for(let j=i+1; j<this.ag.length; j++) if(dist(this.ag[i].p.x, this.ag[i].p.y, this.ag[j].p.x, this.ag[j].p.y)<60) line(this.ag[i].p.x, this.ag[i].p.y, this.ag[j].p.x, this.ag[j].p.y); }
}

class LayerVContact {
  constructor() { this.ag = Array(50).fill().map(() => ({p: createVector(random(width), random(height)), v: p5.Vector.random2D(), r: random(50,100)})); }
  update() { this.ag.forEach(a => { a.p.add(a.v); if(a.p.x<0||a.p.x>width) a.v.x*=-1; }); }
  display(a) { noFill(); stroke(255, 100*a); for(let i=0; i<this.ag.length; i++) for(let j=i+1; j<this.ag.length; j++) { let d=dist(this.ag[i].p.x, this.ag[i].p.y, this.ag[j].p.x, this.ag[j].p.y); if(d<this.ag[i].r+this.ag[j].r) ellipse((this.ag[i].p.x+this.ag[j].p.x)/2, (this.ag[i].p.y+this.ag[j].p.y)/2, (this.ag[i].r+this.ag[j].r)-d); } }
}

class LayerVPrism {
  constructor() { this.ag = Array(40).fill().map(() => ({p: createVector(random(width), random(height)), v: p5.Vector.random2D().mult(1.5)})); }
  update() { this.ag.forEach(a => a.p.add(a.v)); }
  display(a) { noFill(); stroke(255, 150*a); for(let i=0; i<this.ag.length; i++) for(let j=i+1; j<this.ag.length; j++) { if(dist(this.ag[i].p.x, this.ag[i].p.y, this.ag[j].p.x, this.ag[j].p.y)<120) { let m = p5.Vector.lerp(this.ag[i].p, this.ag[j].p, 0.5); triangle(this.ag[i].p.x, this.ag[i].p.y, this.ag[j].p.x, this.ag[j].p.y, m.x+random(-20,20), m.y-40); } } }
}

class LayerVGate {
  constructor() { this.ag = Array(30).fill().map(() => ({p: createVector(random(width), random(height)), v: createVector(random(1,2),0)})); }
  update() { this.ag.forEach(a => a.p.add(a.v)); }
  display(a) { noFill(); stroke(255, 120*a); rectMode(CORNERS); for(let i=0; i<this.ag.length; i++) for(let j=i+1; j<this.ag.length; j++) if(abs(this.ag[i].p.x-this.ag[j].p.x)<100 && abs(this.ag[i].p.y-this.ag[j].p.y)<60) rect(this.ag[i].p.x, this.ag[i].p.y, this.ag[j].p.x, this.ag[j].p.y); rectMode(CENTER); }
}

class LayerVHex {
  display(a) { stroke(255, 100*a); noFill(); translate(width/2, height/2); for(let i=0; i<5; i++) { rotate(frameCount*0.01); polygon(0,0, i*50, 6); } }
  update(){}
}
function polygon(x,y,r,n){let a=TWO_PI/n; beginShape(); for(let i=0;i<TWO_PI;i+=a) vertex(x+cos(i)*r, y+sin(i)*r); endShape(CLOSE);}

class LayerVLock {
  display(a) { stroke(255, 200*a); let mx=width/2+sin(frameCount*0.05)*100, my=height/2+cos(frameCount*0.05)*100; line(mx-20, my, mx+20, my); line(mx, my-20, mx, my+20); noFill(); ellipse(mx, my, 40+sin(frameCount*0.1)*10); }
  update(){}
}

class LayerVGlyph {
  display(a) { fill(255, 200*a); textAlign(CENTER); for(let i=0; i<20; i++) text(char(floor(random(33,126))), random(width), random(height)); }
  update(){}
}

// 20-22 构成主义系列
class LayerCLattice {
  constructor() { this.p = Array(800).fill().map(() => ({p: createVector(random(width), random(height)), v: createVector(random(-1,1), random(-1,1))})); }
  update() { this.p.forEach(p => p.p.add(p.v)); }
  display(a) { stroke(220, 60*a); for(let i=0; i<this.p.length; i++) for(let j=i+1; j<100; j++) if(dist(this.p[i].p.x, this.p[i].p.y, this.p[j].p.x, this.p[j].p.y)<60) line(this.p[i].p.x, this.p[i].p.y, this.p[j].p.x, this.p[j].p.y); }
}

class LayerCShard {
  constructor() { this.p = Array(300).fill().map(() => ({p: createVector(random(width), random(height)), v: createVector(random(-0.8,0.8), random(-0.8,0.8))})); }
  update() { this.p.forEach(p => p.p.add(p.v)); }
  display(a) { fill(220, 30*a); noStroke(); for(let i=0; i<this.p.length; i++) { let n = this.p.filter(o => dist(this.p[i].p.x, this.p[i].p.y, o.p.x, o.p.y)<70); if(n.length>=3) triangle(n[0].p.x, n[0].p.y, n[1].p.x, n[1].p.y, n[2].p.x, n[2].p.y); } }
}

class LayerCVeil {
  constructor() { this.p = Array(250).fill().map(() => ({p: createVector(random(width), random(height)), v: createVector(random(-0.5,0.5), random(-0.5,0.5))})); }
  update() { this.p.forEach(p => p.p.add(p.v)); }
  display(a) { noStroke(); fill(220, 15*a); rectMode(CORNERS); for(let i=0; i<this.p.length; i++) for(let j=i+1; j<50; j++) if(dist(this.p[i].p.x, this.p[i].p.y, this.p[j].p.x, this.p[j].p.y)<80) rect(this.p[i].p.x, this.p[i].p.y, this.p[j].p.x, this.p[j].p.y); rectMode(CENTER); }
}
