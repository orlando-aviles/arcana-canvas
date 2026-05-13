/*********************************************************
 * SNOWFALL BACKGROUND
 * Gentle downward-drifting flakes.
 * Wind direction swings like a pendulum — slow, organic,
 * random starting phase so it never feels choreographed.
 * No pointer influence. Sits on the #animus canvas.
 *********************************************************/
window.Snowfall = (() => {
  const canvas = document.getElementById("animus");
  const ctx    = canvas.getContext("2d");

  let W = 0, H = 0, DPR = 1;
  let flakes = [];
  let rafId  = null;
  let last   = performance.now();

  // Pendulum wind: slow sine, random start phase
  const wind = {
    period:    6000 + Math.random() * 2000,
    phase:     Math.random() * Math.PI * 2,
    amplitude: 60,
  };

  function windAt(now) {
    return Math.sin((now / wind.period) * Math.PI * 2 + wind.phase) * wind.amplitude;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeFlake(scatterY) {
    const tier = Math.random();
    return {
      x:         rand(0, W),
      y:         scatterY ? rand(0, H) : rand(-H * 0.1, -4),
      r:         tier < 0.60 ? rand(0.8, 1.6)
               : tier < 0.88 ? rand(1.6, 3.0)
                              : rand(3.0, 5.0),
      vy:        tier < 0.60 ? rand(20, 40)
               : tier < 0.88 ? rand(13, 26)
                              : rand(7,  16),
      swayAmp:   rand(6, 18),
      swaySpeed: rand(0.18, 0.55),
      swayPhase: rand(0, Math.PI * 2),
      alpha:     tier < 0.60 ? rand(0.30, 0.60)
               : tier < 0.88 ? rand(0.45, 0.72)
                              : rand(0.60, 0.85),
      glow:      tier >= 0.88,
      windSens:  rand(0.6, 1.0) * (tier < 0.60 ? 0.5 : tier < 0.88 ? 0.8 : 1.0),
    };
  }

  function rebuild() {
    flakes = [];
    const density = FX.intensity <= 0 ? 0 : 0.25 + FX.intensity * 0.75;
    const count   = Math.round(180 * density);
    for (let i = 0; i < count; i++) flakes.push(makeFlake(true));
  }

  function resize() {
    DPR = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    W = window.innerWidth; H = window.innerHeight;
    canvas.width  = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function tick(now) {
    if (!rafId) return;
    if (window._appHidden) { rafId = requestAnimationFrame(tick); return; }
    // Clamp dt tightly — interaction events can cause long frames
    // that make flakes jump. Cap at 33ms (30fps equivalent).
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, W, H);
    const mult = FX.intensity;
    if (mult <= 0) { rafId = requestAnimationFrame(tick); return; }
    const wx = windAt(now);
    for (const f of flakes) {
      f.y += f.vy * dt;
      // Accumulate x drift into f.x so wrapping stays correct
      f.x += wx * f.windSens * dt;
      const sway  = Math.sin(now / 1000 * f.swaySpeed * Math.PI * 2 + f.swayPhase) * f.swayAmp;
      const drawX = f.x + sway;
      if (f.y > H + 10) { f.y = -f.r * 2; f.x = rand(0, W); f.swayPhase = rand(0, Math.PI * 2); }
      if      (f.x < -20)    f.x += W + 40;
      else if (f.x > W + 20) f.x -= W + 40;
      ctx.save();
      ctx.globalAlpha = f.alpha * mult;
      if (f.glow) {
        const g = ctx.createRadialGradient(drawX, f.y, 0, drawX, f.y, f.r * 2.4);
        g.addColorStop(0,   "rgba(255,255,255,0.90)");
        g.addColorStop(0.4, "rgba(255,255,255,0.50)");
        g.addColorStop(1,   "rgba(255,255,255,0.00)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(drawX, f.y, f.r * 2.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath(); ctx.arc(drawX, f.y, f.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (rafId) return;
    canvas.style.display = "block";
    resize(); rebuild();
    last = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    ctx.clearRect(0, 0, W, H);
    canvas.style.display = "none";
  }

  window.addEventListener("resize", () => { if (!rafId) return; resize(); rebuild(); }, { passive: true });

  return { start, stop };
})();
