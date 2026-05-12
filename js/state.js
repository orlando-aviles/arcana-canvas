// js/state.js
window.FX = {
  intensity: 0.8,
  hueA: 245,
  hueB: 285,
};

window.App = {
  // "text" | "playing" | "riderwaite" | "luminousarc" | "gilded"
  activeDeck: "luminousarc",
  cardScale: 1.0,
  // "starfield" | "particles"
  bg: "particles",
  reversals: false,
};

window.clamp = function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
};

window.roundRect = function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

window.getCssVar = function getCssVar(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
};

/*********************************************************
 * FX HELPERS
 *********************************************************/
window.setIntensity = function setIntensity(v01) {
  FX.intensity = clamp(v01, 0, 1);
  Starfield.setIntensity(FX.intensity);
};

window.applyAuras = function applyAuras() {
  Starfield.setHues(FX.hueA, FX.hueB);
  document.documentElement.style.setProperty(
    "--cardStroke",
    `hsla(${FX.hueA} 92% 70% / 0.50)`,
  );
  // Menu button border + bar color track the aura
  const auraColor = `hsla(${FX.hueA} 85% 72% / 0.72)`;
  document.documentElement.style.setProperty("--auraColor", auraColor);
};

/*********************************************************
 * SERVICE WORKER
 * Skipped on localhost/127.0.0.1 so the dev server stays
 * clean. Add ?sw=force to the URL to test the SW locally.
 *********************************************************/
(function () {
  if (!('serviceWorker' in navigator)) return;
  const isLocal = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  const force   = new URLSearchParams(location.search).has('sw');
  if (isLocal && !force) {
    // Unregister any previously cached SW so it stops intercepting
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => r.unregister());
    });
    console.info('[SW] Skipped on localhost. Add ?sw to force.');
    return;
  }
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('[SW] Registered'))
    .catch(err => console.error('[SW] Registration failed:', err));
}());
