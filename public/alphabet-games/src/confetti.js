// Confetti & Particle Effects Engine

export class ParticleFX {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.particles = [];
    this.isRunning = false;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 60) {
    const colors = ['#FF6B8B', '#FFD166', '#06D6A0', '#118AB2', '#9B5DE5', '#F15BB5', '#FEE140'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      const size = Math.random() * 9 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const type = Math.random() > 0.4 ? 'star' : 'circle';

      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size,
        color,
        type,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        life: 1,
        decay: Math.random() * 0.015 + 0.012
      });
    }

    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // Gravity
      p.vx *= 0.98; // Air friction
      p.rotation += p.vRot;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);

      if (p.type === 'star') {
        this.drawStar(0, 0, 5, p.size, p.size / 2, p.color);
      } else {
        this.ctx.beginPath();
        this.ctx.rect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.isRunning = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
