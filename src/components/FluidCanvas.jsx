import { useEffect, useRef } from 'react';

const CHARS = [
  '0','1','⊕','λ','Σ','π','∞','⊗','φ','≡','∇','∂','α','β','γ','δ','ε',
  '0xAF','0xFF','0x3C','0xDE','0xAD','0xBE','0xEF','0x1F','0xCA','0xFE',
  'RSA','AES','SHA','KEM','DSA','PQC','TLS','PKI','HMAC','PBKDF',
  'ML-KEM','SHA-256','ML-DSA','NIST','FIPS','P-384','X.509',
  '01001101','11010011','00111010','10110101','01110110',
  '∀x','∃y','⊢Δ','∮F','∑n²','√p','∫dx',
];

const COLORS = [
  'rgba(255,80,10,',
  'rgba(255,60,20,',
  'rgba(239,68,68,',
  'rgba(255,120,40,',
  'rgba(245,158,11,',
  'rgba(220,38,38,',
  'rgba(255,100,30,',
];

/* ═══════════════════════════════════════════════
   NAVIER-STOKES FLUID (Jos Stam, 2003)
═══════════════════════════════════════════════ */
const N  = 36;
const SZ = (N + 2) * (N + 2);

function IX(x, y) {
  return Math.max(0, Math.min(N+1, x)) + Math.max(0, Math.min(N+1, y)) * (N+2);
}

function setBnd(b, x) {
  for (let i = 1; i <= N; i++) {
    x[IX(0,i)]   = b === 1 ? -x[IX(1,i)] : x[IX(1,i)];
    x[IX(N+1,i)] = b === 1 ? -x[IX(N,i)] : x[IX(N,i)];
    x[IX(i,0)]   = b === 2 ? -x[IX(i,1)] : x[IX(i,1)];
    x[IX(i,N+1)] = b === 2 ? -x[IX(i,N)] : x[IX(i,N)];
  }
  x[IX(0,0)]     = 0.5*(x[IX(1,0)]   + x[IX(0,1)]);
  x[IX(0,N+1)]   = 0.5*(x[IX(1,N+1)] + x[IX(0,N)]);
  x[IX(N+1,0)]   = 0.5*(x[IX(N,0)]   + x[IX(N+1,1)]);
  x[IX(N+1,N+1)] = 0.5*(x[IX(N,N+1)] + x[IX(N+1,N)]);
}

function linSolve(b, x, x0, a, c) {
  const inv = 1/c;
  for (let k = 0; k < 6; k++) {
    for (let j = 1; j <= N; j++)
      for (let i = 1; i <= N; i++)
        x[IX(i,j)] = (x0[IX(i,j)] + a*(x[IX(i+1,j)]+x[IX(i-1,j)]+x[IX(i,j+1)]+x[IX(i,j-1)]))*inv;
    setBnd(b, x);
  }
}

function diffuse(b,x,x0,visc,dt){ linSolve(b,x,x0,dt*visc*N*N,1+4*dt*visc*N*N); }

function project(vx,vy,p,div) {
  const h = 1/N;
  for (let j=1;j<=N;j++) for (let i=1;i<=N;i++) {
    div[IX(i,j)] = -0.5*h*(vx[IX(i+1,j)]-vx[IX(i-1,j)]+vy[IX(i,j+1)]-vy[IX(i,j-1)]);
    p[IX(i,j)] = 0;
  }
  setBnd(0,div); setBnd(0,p);
  linSolve(0,p,div,1,4);
  for (let j=1;j<=N;j++) for (let i=1;i<=N;i++) {
    vx[IX(i,j)] -= 0.5*(p[IX(i+1,j)]-p[IX(i-1,j)])/h;
    vy[IX(i,j)] -= 0.5*(p[IX(i,j+1)]-p[IX(i,j-1)])/h;
  }
  setBnd(1,vx); setBnd(2,vy);
}

function advect(b,d,d0,vx,vy,dt) {
  const dt0 = dt*N;
  for (let j=1;j<=N;j++) for (let i=1;i<=N;i++) {
    let sx = Math.max(0.5,Math.min(N+0.5,i-dt0*vx[IX(i,j)]));
    let sy = Math.max(0.5,Math.min(N+0.5,j-dt0*vy[IX(i,j)]));
    const i0=Math.floor(sx),i1=i0+1,j0=Math.floor(sy),j1=j0+1;
    const s1=sx-i0,s0=1-s1,t1=sy-j0,t0=1-t1;
    d[IX(i,j)] = s0*(t0*d0[IX(i0,j0)]+t1*d0[IX(i0,j1)])+s1*(t0*d0[IX(i1,j0)]+t1*d0[IX(i1,j1)]);
  }
  setBnd(b,d);
}

class FluidSim {
  constructor(){ this.vx=new Float32Array(SZ);this.vy=new Float32Array(SZ);this.vx0=new Float32Array(SZ);this.vy0=new Float32Array(SZ);this.p=new Float32Array(SZ);this.div=new Float32Array(SZ); }
  addVelocity(nx,ny,ax,ay,r=4){
    const gx=Math.round(nx*N),gy=Math.round(ny*N);
    for(let dj=-r;dj<=r;dj++) for(let di=-r;di<=r;di++){
      const d=Math.sqrt(di*di+dj*dj);
      if(d<=r){const f=(1-d/r)**1.5;this.vx[IX(gx+di,gy+dj)]+=ax*f;this.vy[IX(gx+di,gy+dj)]+=ay*f;}
    }
  }
  step(){
    const dt=0.014,v=0.000003;
    diffuse(1,this.vx0,this.vx,v,dt);diffuse(2,this.vy0,this.vy,v,dt);
    project(this.vx0,this.vy0,this.p,this.div);
    advect(1,this.vx,this.vx0,this.vx0,this.vy0,dt);advect(2,this.vy,this.vy0,this.vx0,this.vy0,dt);
    project(this.vx,this.vy,this.p,this.div);
    for(let i=0;i<SZ;i++){this.vx[i]*=0.993;this.vy[i]*=0.993;}
  }
  at(nx,ny){
    const gx=Math.max(1,Math.min(N,Math.round(nx*N))),gy=Math.max(1,Math.min(N,Math.round(ny*N)));
    return{vx:this.vx[IX(gx,gy)],vy:this.vy[IX(gx,gy)]};
  }
}

/* ═══════════════════════════════════════════════
   PARTICLE
═══════════════════════════════════════════════ */
class Particle {
  constructor(w,h){this.w=w;this.h=h;this.reset(true);}
  reset(init=false){
    this.x   = Math.random()*this.w;
    this.y   = init ? Math.random()*this.h : this.h+25;
    this.vx  = (Math.random()-0.5)*0.6;
    this.vy  = -(0.25+Math.random()*0.45);
    this.txt = CHARS[Math.floor(Math.random()*CHARS.length)];
    this.col = COLORS[Math.floor(Math.random()*COLORS.length)];
    // Brighter base opacity range — still ambient, not distracting
    this.base = 0.28 + Math.random() * 0.42;
    this.op   = this.base;
    this.sz   = 8.5 + Math.random()*9;
    this.ph   = Math.random()*Math.PI*2;
    this.spd  = 0.013+Math.random()*0.022;
    this.bobPh  = Math.random()*Math.PI*2;
    this.bobSpd = 0.016+Math.random()*0.018;
    this.bobAmp = 0.3+Math.random()*0.7;
    this.life=0; this.maxLife=450+Math.random()*700;
  }
  update(fluid,t){
    this.life++;
    if(this.life>this.maxLife){this.reset();return;}
    const nx=Math.max(0.01,Math.min(0.99,this.x/this.w));
    const ny=Math.max(0.01,Math.min(0.99,this.y/this.h));
    const{vx:fvx,vy:fvy}=fluid.at(nx,ny);
    this.vx+=(fvx*55-this.vx)*0.055;
    this.vy+=(fvy*55-this.vy)*0.055;
    this.vy-=0.035;
    this.bobPh+=this.bobSpd;
    this.y+=Math.sin(this.bobPh)*this.bobAmp*0.08;
    this.vx*=0.975;this.vy*=0.975;
    this.x+=this.vx;this.y+=this.vy;
    // Flicker — stays in visible range
    this.op=Math.max(0.15,Math.min(0.78,this.base+Math.sin(t*this.spd+this.ph)*0.2));
    if(this.x<-70)this.x=this.w+45;
    if(this.x>this.w+70)this.x=-45;
    if(this.y<-35)this.reset();
    if(this.y>this.h+35){this.y=this.h+25;this.vy=-(0.25+Math.random()*0.35);}
  }
  draw(ctx){
    ctx.save();
    ctx.globalAlpha=this.op;
    ctx.font=`${this.sz}px 'JetBrains Mono',monospace`;
    ctx.fillStyle=this.col+this.op+')';
    // Tighter glow so they're visible but not dominant
    ctx.shadowColor=this.col+'0.85)';
    ctx.shadowBlur=7;
    ctx.fillText(this.txt,this.x,this.y);
    ctx.restore();
  }
}

/* ═══════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════ */
export default function FluidCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const fluid = new FluidSim();
    const mouse = {x:-1,y:-1,pvx:0,pvy:0,px:-1,py:-1};
    let t=0,animId;
    const particles=[];

    const resize=()=>{
      canvas.width=window.innerWidth; canvas.height=window.innerHeight;
      particles.forEach(p=>{p.w=canvas.width;p.h=canvas.height;});
    };
    resize();
    window.addEventListener('resize',resize);

    // Denser: 150-180 particles
    const COUNT = Math.min(175, Math.floor((window.innerWidth*window.innerHeight)/5500));
    for(let i=0;i<COUNT;i++) particles.push(new Particle(canvas.width,canvas.height));

    const onMove=(e)=>{
      if(mouse.px>=0){mouse.pvx=(e.clientX-mouse.px)*0.75;mouse.pvy=(e.clientY-mouse.py)*0.75;}
      mouse.x=e.clientX;mouse.y=e.clientY;mouse.px=e.clientX;mouse.py=e.clientY;
    };
    window.addEventListener('mousemove',onMove);

    const loop=()=>{
      t++;
      if(mouse.x>0&&canvas.width>0){
        const spd=Math.sqrt(mouse.pvx**2+mouse.pvy**2);
        if(spd>0.2) fluid.addVelocity(mouse.x/canvas.width,mouse.y/canvas.height,mouse.pvx*0.12,mouse.pvy*0.12,4);
        mouse.pvx*=0.86;mouse.pvy*=0.86;
      }
      fluid.step();
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for(const p of particles){p.update(fluid,t);p.draw(ctx);}
      animId=requestAnimationFrame(loop);
    };
    animId=requestAnimationFrame(loop);

    return()=>{cancelAnimationFrame(animId);window.removeEventListener('resize',resize);window.removeEventListener('mousemove',onMove);};
  },[]);

  return <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:1}}/>;
}
