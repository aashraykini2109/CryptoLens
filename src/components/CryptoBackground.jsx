import { useEffect, useRef } from 'react';

const CHARS = [
  '0', '1', '0xA3', '0xFF', '0xDE', '0xAD', '0x2F',
  '⊕', 'λ', 'Σ', 'π', '∞', '⊗', 'φ',
  'ML-KEM', 'SHA-256', 'RSA', 'AES-256', 'ECDSA', 'ML-DSA',
  '01001', '11010', '00111', '10110',
  'NIST', 'FIPS', 'PQC', 'KEM', 'DSA',
];

const EMBER_COLORS = [
  'rgba(255, 69, 0, ',
  'rgba(239, 68, 68, ',
  'rgba(220, 38, 38, ',
  'rgba(245, 158, 11, ',
  'rgba(251, 191, 36, ',
  'rgba(180, 30, 10, ',
];

function randomColor(alpha) {
  return EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)] + alpha + ')';
}

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset(true);
  }

  reset(initial = false) {
    const { width, height } = this.canvas;
    this.x = Math.random() * width;
    this.y = initial ? Math.random() * height : Math.random() * height;
    this.text = CHARS[Math.floor(Math.random() * CHARS.length)];
    this.baseOpacity = 0.08 + Math.random() * 0.22;
    this.opacity = this.baseOpacity;
    this.size = 9 + Math.random() * 7;
    this.color = randomColor(this.opacity);
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = -0.2 - Math.random() * 0.3;
    this.ax = 0;
    this.ay = 0;
    this.life = 0;
    this.maxLife = 400 + Math.random() * 500;
    // For glow flicker
    this.flickerSpeed = 0.005 + Math.random() * 0.015;
    this.flickerPhase = Math.random() * Math.PI * 2;
  }

  update(mx, my, elapsed) {
    this.life++;
    if (this.life > this.maxLife) { this.reset(); return; }

    // Cursor repulsion
    const dx = this.x - mx;
    const dy = this.y - my;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const repelRadius = 120;

    if (dist < repelRadius && mx > 0) {
      const force = (repelRadius - dist) / repelRadius;
      this.ax += (dx / dist) * force * 2.5;
      this.ay += (dy / dist) * force * 2.5;
    }

    // Dampen acceleration (spring back)
    this.ax *= 0.85;
    this.ay *= 0.85;

    this.vx += this.ax;
    this.vy += this.ay;

    // Clamp velocity
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 3.5) { this.vx = (this.vx / speed) * 3.5; this.vy = (this.vy / speed) * 3.5; }

    // Drift back to natural vy
    this.vx *= 0.97;
    this.vy = this.vy * 0.97 + (-0.25) * 0.03;

    this.x += this.vx;
    this.y += this.vy;

    // Flicker opacity
    this.opacity = this.baseOpacity + Math.sin(elapsed * this.flickerSpeed + this.flickerPhase) * 0.06;
    this.opacity = Math.max(0.04, Math.min(0.45, this.opacity));

    // Wrap edges
    if (this.x < -60) this.x = this.canvas.width + 40;
    if (this.x > this.canvas.width + 60) this.x = -40;
    if (this.y < -20) this.reset();
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.font = `${this.size}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = randomColor(this.opacity);
    // Subtle glow
    ctx.shadowColor = 'rgba(255,69,0,0.7)';
    ctx.shadowBlur = 6;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

export default function CryptoBackground() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ particles: [], mouse: { x: -999, y: -999 }, elapsed: 0, animId: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-spread particles on resize
      state.particles.forEach(p => { p.x = Math.random() * canvas.width; p.y = Math.random() * canvas.height; });
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    state.particles = Array.from({ length: COUNT }, () => new Particle(canvas));

    const onMouseMove = (e) => { state.mouse.x = e.clientX; state.mouse.y = e.clientY; };
    const onMouseLeave = () => { state.mouse.x = -999; state.mouse.y = -999; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    const loop = () => {
      state.elapsed++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of state.particles) {
        p.update(state.mouse.x, state.mouse.y, state.elapsed);
        p.draw(ctx);
      }
      state.animId = requestAnimationFrame(loop);
    };
    state.animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(state.animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
