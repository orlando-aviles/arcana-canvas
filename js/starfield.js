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

  // ── Parallax system ────────────────────────────────────
  // Gyroscope when available, slow time-based drift as fallback
  const parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let gyroAvailable = false;
  let driftTime = 0;

  // Gyroscope
  function onDeviceOrientation(e) {
    if (!gyroAvailable) gyroAvailable = true;
    // gamma = left/right tilt (-90 to 90), beta = front/back (-180 to 180)
    const gx = Math.max(-30, Math.min(30, e.gamma || 0));
    const gy = Math.max(-30, Math.min(30, (e.beta || 0) - 45)); // subtract 45° for natural hold angle
    parallax.targetX = (gx / 30) * 40;   // max 40px shift
    parallax.targetY = (gy / 30) * 25;
  }

  if (window.DeviceOrientationEvent) {
    // iOS 13+ requires permission
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      // Will be requested on first user interaction
      window._requestGyro = () => {
        DeviceOrientationEvent.requestPermission()
          .then(r => { if (r === "granted") window.addEventListener("deviceorientation", onDeviceOrientation); })
          .catch(() => {});
      };
      window.addEventListener("pointerdown", () => {
        if (!gyroAvailable && window._requestGyro) { window._requestGyro(); window._requestGyro = null; }
      }, { once: true });
    } else {
      window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true });
    }
  }

  function makeStar() {
    const pop = Math.random();
    // depth 0=far/slow, 1=near/fast — controls parallax strength
    const depth = pop < 0.68 ? rand(0.0, 0.25)   // tiny: distant
                : pop < 0.92 ? rand(0.2, 0.55)    // mid
                             : rand(0.5, 1.0);     // bright: near
    return {
      x: rand(0, W),
      y: rand(0, H),
      r:      pop < 0.68 ? rand(0.3, 0.7)
            : pop < 0.92 ? rand(0.7, 1.2)
                         : rand(1.2, 2.0),
      baseA:  pop < 0.68 ? rand(0.45, 0.75)
            : pop < 0.92 ? rand(0.60, 0.85)
                         : rand(0.75, 0.95),
      twSpeed: rand(0.4, 1.8),
      twAmp:   rand(0.06, 0.18),
      twPhase: rand(0, Math.PI * 2),
      // Sparkle: rare event, not constant — each star has its own timer
      sparkTimer:    rand(0, 30),   // seconds until next sparkle
      sparkInterval: rand(8, 40),   // how often it sparkles
      sparkDuration: rand(0.6, 1.4),// how long the cross lasts
      sparkActive:   false,
      sparkAge:      0,
      depth,
      tint: tint(),
    };
  }

  function rebuild() {
    stars = [];
    const density = FX.intensity <= 0 ? 0 : 0.3 + FX.intensity * 0.7;
    const count   = Math.floor(900 * density);
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
    if (window._appHidden) { requestAnimationFrame(tick); return; }
    const dt = Math.min(.033, (now - last) / 1000);
    last = now;

    updateMorph(now);
    drawBg();

    if (starsVisible) {
      // Parallax — gyroscope if available, drift fallback
      driftTime += dt;
      if (!gyroAvailable) {
        parallax.targetX = Math.sin(driftTime * 0.07) * 22 + Math.cos(driftTime * 0.031) * 10;
        parallax.targetY = Math.cos(driftTime * 0.05) * 14 + Math.sin(driftTime * 0.042) * 8;
      }
      // Smooth lerp toward target (gyro or drift)
      parallax.x += (parallax.targetX - parallax.x) * Math.min(1, dt * 4);
      parallax.y += (parallax.targetY - parallax.y) * Math.min(1, dt * 4);

      const mult = FX.intensity;
      ctx.save();
      ctx.lineCap = "round";

      for (const s of stars) {
        // Parallax: near stars move more, far stars barely move
        const px = s.x + parallax.x * s.depth;
        const py = s.y + parallax.y * s.depth;

        // Base twinkle — subtle breath, not flashy
        const tw = s.baseA * (1 - s.twAmp * 0.4 + s.twAmp * 0.4 * Math.sin((now/1000) * s.twSpeed + s.twPhase));
        const a  = clamp(tw * mult, 0, 1);
        if (a < 0.005) continue;

        // Update sparkle timer
        s.sparkTimer -= dt;
        if (s.sparkTimer <= 0 && !s.sparkActive && s.r > 0.8) {
          s.sparkActive = true;
          s.sparkAge    = 0;
          s.sparkTimer  = s.sparkInterval + rand(-4, 4);
        }
        if (s.sparkActive) {
          s.sparkAge += dt;
          if (s.sparkAge >= s.sparkDuration) {
            s.sparkActive = false;
          }
        }

        // Draw star dot — use shadow blur for soft glow on larger stars
        ctx.globalAlpha = a;
        ctx.fillStyle   = s.tint;
        if (s.r > 0.85) {
          ctx.shadowColor = s.tint;
          ctx.shadowBlur  = s.r * 4;
        }
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Organic sparkle cross — only during sparkle event
        if (s.sparkActive && s.r > 0.8) {
          // Sparkle lifecycle: ease in, hold, ease out
          const life = s.sparkAge / s.sparkDuration;
          const sparkEnv = life < 0.3
            ? life / 0.3
            : life > 0.7
            ? 1 - (life - 0.7) / 0.3
            : 1;
          const sparkA   = a * sparkEnv * 0.75;
          const armLen   = s.r * (5 + sparkEnv * 4);
          const diagLen  = armLen * 0.45;

          ctx.strokeStyle = s.tint;

          // Main cross — tapered lines (wide at center, narrow at tip)
          // Achieved by drawing two paths with different lineWidths
          ctx.globalAlpha = sparkA;
          ctx.lineWidth   = 0.6 + s.r * 0.3;
          ctx.beginPath();
          ctx.moveTo(px - armLen, py); ctx.lineTo(px + armLen, py);
          ctx.moveTo(px, py - armLen); ctx.lineTo(px, py + armLen);
          ctx.stroke();

          // Fine inner bright core of cross
          ctx.globalAlpha = sparkA * 0.9;
          ctx.lineWidth   = 0.3;
          ctx.beginPath();
          ctx.moveTo(px - armLen * 0.6, py); ctx.lineTo(px + armLen * 0.6, py);
          ctx.moveTo(px, py - armLen * 0.6); ctx.lineTo(px, py + armLen * 0.6);
          ctx.stroke();

          // Diagonal arms — shorter, much fainter, slightly rotated for asymmetry
          const rot = 0.03; // slight organic tilt
          ctx.globalAlpha = sparkA * 0.28;
          ctx.lineWidth   = 0.4;
          ctx.beginPath();
          ctx.moveTo(px - diagLen * Math.cos(Math.PI*0.25 + rot), py - diagLen * Math.sin(Math.PI*0.25 + rot));
          ctx.lineTo(px + diagLen * Math.cos(Math.PI*0.25 + rot), py + diagLen * Math.sin(Math.PI*0.25 + rot));
          ctx.moveTo(px + diagLen * Math.cos(Math.PI*0.75 + rot), py - diagLen * Math.sin(Math.PI*0.75 + rot));
          ctx.lineTo(px - diagLen * Math.cos(Math.PI*0.75 + rot), py + diagLen * Math.sin(Math.PI*0.75 + rot));
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      ctx.restore();
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
