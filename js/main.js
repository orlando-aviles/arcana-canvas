/*********************************************************
 * INIT + GLUE
 *********************************************************/
loadSettings();

const _preloadPromise = Tarot.preloadAll();

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
  // Performance mode
  const perfSel = document.getElementById("perfModeSelect");
  if (perfSel) {
    perfSel.value = App.perfMode || "full";
    if (window.applyPerfMode) applyPerfMode(App.perfMode || "full");
  }
  const maxSlider = document.getElementById("maxCardsSlider");
  const maxLabel  = document.getElementById("maxCardsLabel");
  if (maxSlider) { maxSlider.value = App.maxCards || 40; }
  if (maxLabel)  { maxLabel.textContent = App.maxCards || 40; }
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

// Smart splash — wait for BOTH: deck images loaded AND minimum 2s display
const _splashStart = Date.now();
Promise.all([
  _preloadPromise,
  new Promise(r => setTimeout(r, 2000))
]).then(() => {
  const splash = document.getElementById("splash");
  if (!splash) return;
  splash.classList.add("hidden");
  splash.addEventListener("transitionend", () => splash.remove(), { once: true });
});
