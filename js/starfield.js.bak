/*********************************************************
 * STARFIELD — true stars, fixed in place, twinkle only
 * No drift. No fall. Just pinprick lights that breathe.
 * Shooting stars still cross occasionally.
 *********************************************************/
window.Starfield = (() => {
  const canvas = document.getElementById("space");
  const ctx    = canvas.getContext("2d");

  let W = 0, H = 0, DPR = 1;
  let stars   = [];
  let streaks = [];
  let running = true;
  let starsVisible = true;
  let last = performance.now();

  let hueA = FX.hueA, hueB = FX.hueB;
  let morphActive = false, morphStart = 0, morphDuration = 1000;
  let hueAFrom = hueA, hueBFrom = hueB, hueATo = hueA, hueBTo = hueB;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function normalizeHue(h) { return ((h % 360) + 360) % 360; }
  function lerpHue(a, b, t) {
    a = normalizeHue(a); b = normalizeHue(b);
    let d = b - a;
    if (d >  180) d -= 360;
    if (d < -180) d += 360;
    return normalizeHue(a + d * t);
  }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
  }

  function tint() {
    const roll = Math.random();
    if (roll < 0.72) return "white";
    return `hsl(${normalizeHue(roll < 0.87 ? hueA : hueB)} 90% 76%)`;
  }

  function makeStar() {
    // Three populations: tiny/dim, mid, rare bright
    const pop = Math.random();
    return {
      x: rand(0, W),
      y: rand(0, H),
      r:      pop < 0.68 ? rand(0.4, 0.9)
            : pop < 0.92 ? rand(0.9, 1.6)
                         : rand(1.6, 2.6),
      baseA:  pop < 0.68 ? rand(0.25, 0.55)
            : pop < 0.92 ? rand(0.45, 0.75)
                         : rand(0.65, 0.92),
      twSpeed: rand(0.4, 1.8),   // radians/sec
      twAmp:   rand(0.12, 0.38), // fraction of baseA
      twPhase: rand(0, Math.PI * 2),
      tint: tint(),
    };
  }

  function rebuild() {
    stars = [];
    const density = FX.intensity <= 0 ? 0 : 0.3 + FX.intensity * 0.7;
    const count   = Math.floor(320 * density);
    for (let i = 0; i < count; i++) stars.push(makeStar());
  }

  function resize() {
    DPR = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    W = window.innerWidth; H = window.innerHeight;
    canvas.width  = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    rebuild();
  }

  function setHues(a, b)  { hueA = normalizeHue(a); hueB = normalizeHue(b); }
  function setIntensity(v){ FX.intensity = clamp(v, 0, 1); rebuild(); }
  function setVisible(v)  { starsVisible = v; }

  function morphTo(a, b, dur = 1000) {
    hueAFrom = hueA; hueBFrom = hueB;
    hueATo   = normalizeHue(a); hueBTo = normalizeHue(b);
    morphDuration = Math.max(150, dur | 0);
    morphStart    = performance.now();
    morphActive   = true;
  }

  function updateMorph(now) {
    if (!morphActive) return;
    const t = easeInOutCubic(clamp((now - morphStart) / morphDuration, 0, 1));
    hueA = lerpHue(hueAFrom, hueATo, t);
    hueB = lerpHue(hueBFrom, hueBTo, t);
    // Re-tint a fraction of stars each frame for smooth colour shift
    for (let i = 0; i < stars.length; i += 6) stars[i].tint = tint();
    if (t >= 1) { morphActive = false; hueA = hueATo; hueB = hueBTo; }
  }

  // ── Nebula background ──────────────────────────────────
  function drawBg() {
    ctx.fillStyle = "#05050a";
    ctx.fillRect(0, 0, W, H);
    const R = Math.max(W, H);

    const g1 = ctx.createRadialGradient(W*.22, H*.14, 0, W*.22, H*.14, R*.72);
    g1.addColorStop(0, `hsla(${hueA} 92% 62% / 0.18)`);
    g1.addColorStop(.42,`hsla(${hueA} 92% 62% / 0.06)`);
    g1.addColorStop(1,  `rgba(0,0,0,0)`);

    const g2 = ctx.createRadialGradient(W*.8, H*.32, 0, W*.8, H*.32, R*.62);
    g2.addColorStop(0, `hsla(${hueB} 92% 62% / 0.14)`);
    g2.addColorStop(.44,`hsla(${hueB} 92% 62% / 0.05)`);
    g2.addColorStop(1,  `rgba(0,0,0,0)`);

    const hC = normalizeHue((hueA + hueB) * .5);
    const g3 = ctx.createRadialGradient(W*.56, H*.94, 0, W*.56, H*.94, R*.7);
    g3.addColorStop(0, `hsla(${hC} 90% 60% / 0.08)`);
    g3.addColorStop(.5,`hsla(${hC} 90% 60% / 0.03)`);
    g3.addColorStop(1, `rgba(0,0,0,0)`);

    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = g3; ctx.fillRect(0, 0, W, H);
  }

  // ── Shooting stars ─────────────────────────────────────
  function spawnStreak() {
    const fromLeft = Math.random() < .5;
    streaks.push({
      x: fromLeft ? rand(-80, W*.3) : rand(W*.7, W+80),
      y: rand(0, H*.35),
      dx: fromLeft ? rand(.8, 1.2) : rand(-1.2, -.8),
      dy: rand(.9, 1.4),
      speed: rand(850, 1400),
      length: rand(120, 240),
      tint: tint(),
      t: 0, life: rand(.6, 1.1),
    });
  }

  function updateStreaks(dt) {
    if (FX.intensity <= 0) return;
    const p = 1 / (rand(12, 20) / Math.max(.18, FX.intensity));
    if (Math.random() < p * dt) spawnStreak();
    for (let i = streaks.length - 1; i >= 0; i--) {
      const s = streaks[i];
      s.t += dt; s.x += s.dx * s.speed * dt; s.y += s.dy * s.speed * dt;
      if (s.t >= s.life) streaks.splice(i, 1);
    }
  }

  function renderStreaks() {
    for (const s of streaks) {
      const fade = Math.sin(Math.PI * clamp(s.t / s.life, 0, 1)) * FX.intensity;
      const x2 = s.x - s.dx * s.length, y2 = s.y - s.dy * s.length;
      ctx.save(); ctx.lineCap = "round";
      const g = ctx.createLinearGradient(x2, y2, s.x, s.y);
      g.addColorStop(0,   `rgba(255,255,255,0)`);
      g.addColorStop(.25, `rgba(255,255,255,${.08*fade})`);
      g.addColorStop(1,   `rgba(255,255,255,${.4*fade})`);
      ctx.strokeStyle = g; ctx.lineWidth = 2.1;
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(s.x, s.y); ctx.stroke();
      ctx.globalAlpha = .85*fade; ctx.fillStyle = s.tint;
      ctx.beginPath(); ctx.arc(s.x, s.y, 2.2, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  // ── Main loop ──────────────────────────────────────────
  function tick(now) {
    if (!running) return;
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;

    updateMorph(now);
    drawBg();

    if (starsVisible) {
      const mult = FX.intensity;
      for (const s of stars) {
        // Stars do NOT move — just twinkle in place
        const tw = s.baseA * (1 - s.twAmp + s.twAmp * Math.sin((now/1000) * s.twSpeed + s.twPhase));
        const a  = clamp(tw * mult, 0, 1);
        if (a < 0.005) continue;
        ctx.beginPath();
        ctx.globalAlpha = a;
        ctx.fillStyle   = s.tint;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
        ctx.fill();

        // Cross-sparkle on bright large stars
        if (s.r > 1.6 && a > 0.45) {
          const armLen = s.r * 4.5;
          const sparkA = a * 0.28;
          ctx.globalAlpha = sparkA;
          ctx.strokeStyle = s.tint;
          ctx.lineWidth   = 0.8;
          ctx.lineCap     = "round";
          ctx.beginPath();
          ctx.moveTo(s.x - armLen, s.y); ctx.lineTo(s.x + armLen, s.y);
          ctx.moveTo(s.x, s.y - armLen); ctx.lineTo(s.x, s.y + armLen);
          ctx.stroke();
          // Diagonal arms, shorter and fainter
          const dLen = armLen * 0.55;
          ctx.globalAlpha = sparkA * 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - dLen, s.y - dLen); ctx.lineTo(s.x + dLen, s.y + dLen);
          ctx.moveTo(s.x + dLen, s.y - dLen); ctx.lineTo(s.x - dLen, s.y + dLen);
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }
      updateStreaks(dt);
      renderStreaks();
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  requestAnimationFrame(tick);

  return { setIntensity, setHues, morphTo, setVisible };
})();
