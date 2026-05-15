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

// Restore persisted UI state
(function restorePersistedUI() {
  // Aura opacity slider
  const opSlider = document.getElementById("auraOpacitySlider");
  const opValue  = document.getElementById("auraOpacityValue");
  if (opSlider && App.auraOpacity) {
    opSlider.value = Math.round(App.auraOpacity * 100);
    if (opValue) opValue.textContent = opSlider.value + "%";
  }
  // Aura on/off
  const auraToggle = document.getElementById("auraToggle");
  if (auraToggle) auraToggle.checked = App.auraOn !== false;
  // Auto-cycle
  const cycleToggle = document.getElementById("auraCycleToggle");
  if (cycleToggle) {
    cycleToggle.checked = !!App.auraCycle;
    if (App.auraCycle && window.startCycle) startCycle();
  }
  // Card aura mode
  const cardAuraSel = document.getElementById("cardAuraModeSelect");
  if (cardAuraSel) cardAuraSel.value = App.cardAuraMode || "dynamic";
  // Canvas header
  const headerToggle = document.getElementById("headerToggle");
  const canvasHeader = document.getElementById("canvasHeader");
  if (headerToggle) headerToggle.checked = App.showHeader !== false;
  if (canvasHeader) canvasHeader.style.display = (App.showHeader === false) ? "none" : "";
})();

redrawAll();

// Dismiss splash — short delay so the user sees it on fast devices too
setTimeout(() => {
  const splash = document.getElementById("splash");
  splash.classList.add("hidden");
  splash.addEventListener("transitionend", () => splash.remove(), { once: true });
}, 1200);
