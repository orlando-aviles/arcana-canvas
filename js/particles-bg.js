/*********************************************************
 * ANIMUS BACKGROUND
 * Connected-particle network drawn on a dedicated canvas.
 * Reads FX.hueA / FX.hueB live — shares the nebula palette.
 * Sits above #space (nebula) and below #tarotCanvas.
 *********************************************************/
window.ParticlesBg = (() => {
  const canvas = document.getElementById("animus");
  const ctx = canvas.getContext("2d");

  let W = 0, H = 0, DPR = 1;
  let particles = [];
  let rafId = null;
  let last = performance.now();

  const COUNT = 120;
  const MAX_DIST = 150;
  const SPEED = 0.6;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function normalizeHue(h) { return ((h % 360) + 360) % 360; }

  function particleColor() {
    const roll = Math.random();
    if (roll < 0.55) return "rgba(255,255,255,0.7)";
    const hue = roll < 0.78 ? FX.hueA : FX.hueB;
    return `hsla(${normalizeHue(hue)} 90% 75% / 0.75)`;
  }

  function lineColor(alpha) {
    // blend between hueA and hueB for connector lines
    const hue = normalizeHue((FX.hueA + FX.hueB) / 2);
    return `hsla(${hue} 80% 70% / ${alpha.toFixed(3)})`;
  }

  function makeParticle() {
    return {
      x: rand(0, W),
      y: rand(0, H),
      vx: rand(-SPEED, SPEED),
      vy: rand(-SPEED, SPEED),
      r: rand(1.5, 4.0),
      color: particleColor(),
    };
  }

  function resize() {
    DPR = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function rebuild() {
    particles = [];
    const density = FX.intensity <= 0 ? 0 : 0.35 + FX.intensity * 0.65;
    const count = Math.round(COUNT * density);
    for (let i = 0; i < count; i++) particles.push(makeParticle());
  }

  function tick(now) {
    if (!rafId) return; // stopped

    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    ctx.clearRect(0, 0, W, H);

    const intensity = FX.intensity;
    if (intensity <= 0) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    // update positions
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      else if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      else if (p.y > H + 10) p.y = -10;
    }

    // draw links
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.6 * intensity;
          ctx.beginPath();
          ctx.strokeStyle = lineColor(alpha);
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // draw particles
    for (const p of particles) {
      ctx.beginPath();
      ctx.globalAlpha = intensity * 0.95;
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (rafId) return;
    canvas.style.display = "block";
    resize();
    rebuild();
    last = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    ctx.clearRect(0, 0, W, H);
    canvas.style.display = "none";
  }

  function isRunning() { return !!rafId; }

  // Respond to intensity changes (called by setIntensity via main.js)
  window.addEventListener("animusRebuild", rebuild);

  window.addEventListener("resize", () => {
    if (!rafId) return;
    resize();
    rebuild();
  }, { passive: true });

  return { start, stop, isRunning };
})();
