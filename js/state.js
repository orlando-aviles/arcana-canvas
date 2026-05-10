// js/state.js
window.FX = {
  intensity: 0.8,
  hueA: 220,
  hueB: 120,
};

window.App = {
  // "text" | "playing" | "riderwaite" | "luminousarc" | "gilded"
  activeDeck: "text",
  cardScale: 1.0,
  // "starfield" | "particles"
  bg: "starfield",
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
    `hsla(${FX.hueA} 92% 70% / 0.26)`,
  );
};

/*********************************************************
 * SERVICE WORKER
 *********************************************************/
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Tarot service worker registered'))
    .catch(err => console.error('SW registration failed:', err));
}
