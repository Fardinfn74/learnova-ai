// Canvas Confetti burst animation helper
export function triggerConfetti() {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    vRotation: number;
    opacity: number;
  }> = [];

  const colors = ["#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#ef4444", "#facc15"];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2 - 100,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6,
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  let startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    if (elapsed > 2500) {
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
      return;
    }

    ctx!.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.vRotation;
      p.opacity = Math.max(0, 1 - elapsed / 2500);

      ctx!.save();
      ctx!.globalAlpha = p.opacity;
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx!.restore();
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
