/*********************************************************
 * INIT + GLUE
 *********************************************************/
loadSettings();

Tarot.preloadAll();

syncVisualUI();
syncDeckUI();
syncReversalsUI();
syncBgUI();

setIntensity(FX.intensity);
applyAuras();
applyBg();

redrawAll();

// Dismiss splash — short delay so the user sees it on fast devices too
setTimeout(() => {
  const splash = document.getElementById("splash");
  splash.classList.add("hidden");
  splash.addEventListener("transitionend", () => splash.remove(), { once: true });
}, 1200);
