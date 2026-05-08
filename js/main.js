/*********************************************************
 * FX HELPERS / GLOBAL FX FUNCTIONS
 * (FX, App state lives in state.js — loaded before this file)
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

// randomizeAuras is defined in ui.js where it's used

/*********************************************************
 * SERVICE WORKER
 *********************************************************/

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Tarot service worker registered'))
    .catch(err => console.error('SW registration failed:', err));
}

/*********************************************************
 * INIT
 *********************************************************/
loadSettings();

// ✅ Load tarot card images immediately at startup
Tarot.preload();

syncVisualUI();
syncDeckUI();
syncBgUI();

setIntensity(FX.intensity);
applyAuras();
applyBg();

redrawAll();
