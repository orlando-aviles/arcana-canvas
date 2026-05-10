/*********************************************************
 * SNOWFALL BACKGROUND
 * Gentle downward-drifting flakes with horizontal sway.
 * Soft white, varied sizes, slight blur on large flakes.
 * Sits on the #animus canvas (same layer as Animus).
 *********************************************************/
window.Snowfall = (() => {
  const canvas = document.getElementById("animus");
  const ctx    = canvas.getContext("2d");

  let W = 0, H = 0, DPR = 1;
  let flakes = [];
  let rafId  = null;
  let last   = performance.now();

  function rand(a, b) { return a + Math.random() * (b - a); }

  // Three tiers of flake — tiny/quick, mid, rare large slow
  function makeFlake() {
    const tier = Math.random();
    return {
      x:      rand(0, W),
      y:      rand(-H, 0),               // start above screen
      r:      tier < 0.60 ? rand(0.8, 1.6)
            : tier < 0.88 ? rand(1.6, 3.2)
                          : rand(3.2, 5.5),
      vy:     tier < 0.60 ? rand(28, 55)  // px/s
            : tier < 0.88 ? rand(18, 35)
                          : rand(10, 22),
      // horizontal sway: sine oscillation
      swayAmp:   rand(12, 40),            // px peak-to-peak
      swaySpeed: rand(0.3, 0.9),          // Hz
      swayPhase: rand(0, Math.PI * 2),
      // opacity
      alpha:  tier < 0.60 ? rand(0.35, 0.65)
            : tier < 0.88 ? rand(0.50, 0.78)
                          : rand(0.65, 0.88),
      // large flakes get a soft drop-shadow for depth
      glow:   tier >= 0.88,
    };
  }

  function rebuild() {
    flakes = [];
    const density = FX.intensity <= 0 ? 0 : 0.25 + FX.intensity * 0.75;
    const count   = Math.round(180 * density);
    for (let i = 0; i < count; i++) {
      const f = makeFlake();
      f.y = rand(0, H); // scatter across screen on first build
      flakes.push(f);
    }
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
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    ctx.clearRect(0, 0, W, H);

    const mult = FX.intensity;
    if (mult <= 0) { rafId = requestAnimationFrame(tick); return; }

    for (const f of flakes) {
      // fall
      f.y += f.vy * dt;
      // horizontal sway
      const sway = Math.sin(now / 1000 * f.swaySpeed * Math.PI * 2 + f.swayPhase) * f.swayAmp;
      const drawX = f.x + sway;

      // wrap bottom → top
      if (f.y > H + 10) {
        f.y = -f.r * 2;
        f.x = rand(0, W);
        f.swayPhase = rand(0, Math.PI * 2);
      }

      ctx.save();
      ctx.globalAlpha = f.alpha * mult;

      if (f.glow) {
        // large flake: radial glow + crisp centre
        const g = ctx.createRadialGradient(drawX, f.y, 0, drawX, f.y, f.r * 2.4);
        g.addColorStop(0,   "rgba(255,255,255,0.90)");
        g.addColorStop(0.4, "rgba(255,255,255,0.50)");
        g.addColorStop(1,   "rgba(255,255,255,0.00)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(drawX, f.y, f.r * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // core flake circle
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.arc(drawX, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

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

  window.addEventListener("resize", () => {
    if (!rafId) return;
    resize(); rebuild();
  }, { passive: true });

  return { start, stop };
})();
