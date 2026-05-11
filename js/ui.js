/*********************************************************
 * HAMBURGER MENU
 *********************************************************/
const menuBtn   = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");

function openMenu()  { menuPanel.classList.add("open"); menuPanel.setAttribute("aria-hidden","false"); }
function closeMenu() { menuPanel.classList.remove("open"); menuPanel.setAttribute("aria-hidden","true"); }
function toggleMenu(){ menuPanel.classList.contains("open") ? closeMenu() : openMenu(); }

menuBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleMenu(); });
document.addEventListener("click", () => { if (menuPanel.classList.contains("open")) closeMenu(); });
menuPanel.addEventListener("click", (e) => e.stopPropagation());

/*********************************************************
 * CLEAR
 *********************************************************/
document.getElementById("clearBtn").addEventListener("click", () => {
  clearCanvas();
  closeMenu();
});

/*********************************************************
 * VISUAL CONTROLS
 *********************************************************/
const intensitySlider = document.getElementById("intensitySlider");
const intensityValue  = document.getElementById("intensityValue");
const cardSizeSlider  = document.getElementById("cardSizeSlider");
const cardSizeValue   = document.getElementById("cardSizeValue");
const hueASlider      = document.getElementById("hueASlider");
const hueAValue       = document.getElementById("hueAValue");
const hueBSlider      = document.getElementById("hueBSlider");
const hueBValue       = document.getElementById("hueBValue");
const randomizeBtn    = document.getElementById("randomizeBtn");

function syncVisualUI() {
  intensitySlider.value      = String(Math.round(FX.intensity * 100));
  intensityValue.textContent = `${Math.round(FX.intensity * 100)}%`;
  cardSizeSlider.value       = String(Math.round(App.cardScale * 100));
  cardSizeValue.textContent  = `${Math.round(App.cardScale * 100)}%`;
  hueASlider.value = String(FX.hueA); hueAValue.textContent = `${FX.hueA}°`;
  hueBSlider.value = String(FX.hueB); hueBValue.textContent = `${FX.hueB}°`;
}

intensitySlider.addEventListener("input", () => {
  setIntensity((Number(intensitySlider.value) || 0) / 100);
  syncVisualUI(); saveSettings();
});
cardSizeSlider.addEventListener("input", () => {
  App.cardScale = clamp((Number(cardSizeSlider.value) || 100) / 100, 0.6, 1.6);
  syncVisualUI(); redrawAll(); saveSettings();
});
hueASlider.addEventListener("input", () => {
  FX.hueA = Number(hueASlider.value) || 0;
  applyAuras(); syncVisualUI(); Runes.invalidateCache(); saveSettings();
});
hueBSlider.addEventListener("input", () => {
  FX.hueB = Number(hueBSlider.value) || 0;
  applyAuras(); syncVisualUI(); Runes.invalidateCache(); saveSettings();
});

function randomizeAuras() {
  const a = Math.floor(Math.random() * 361);
  let b = Math.floor(Math.random() * 361);
  const minDiff = 60;
  if (Math.abs(b - a) < minDiff) b = (a + minDiff + Math.floor(Math.random() * 140)) % 360;
  Starfield.morphTo(a, b, 1000);
  FX.hueA = a; FX.hueB = b;
  applyAuras(); syncVisualUI();
  Runes.invalidateCache();
}
randomizeBtn.addEventListener("click", () => { randomizeAuras(); saveSettings(); });

/*********************************************************
 * DECK SELECTOR
 *********************************************************/
const deckSelect = document.getElementById("deckSelect");

function syncDeckUI() { deckSelect.value = App.activeDeck; }

deckSelect.addEventListener("change", () => {
  App.activeDeck = deckSelect.value;
  syncDeckUI(); saveSettings();
});

/*********************************************************
 * VIEW MODE
 *********************************************************/
const viewModeToggle = document.getElementById("viewModeToggle");
const zoomOverlay    = document.getElementById("zoomOverlay");

function syncViewModeUI() {
  viewModeToggle.checked = !!App.viewMode;
  zoomOverlay.classList.toggle("visible", !!App.viewMode);
}

viewModeToggle.addEventListener("change", () => {
  App.viewMode = viewModeToggle.checked;
  syncViewModeUI();
  closeMenu();
});

/*********************************************************
 * REVERSALS TOGGLE
 *********************************************************/
const reversalsToggle = document.getElementById("reversalsToggle");

function syncReversalsUI() {
  reversalsToggle.checked = App.reversals;
}

reversalsToggle.addEventListener("change", () => {
  App.reversals = reversalsToggle.checked;
  saveSettings();
});

/*********************************************************
 * BACKGROUND SELECTOR
 *********************************************************/
const bgSelect = document.getElementById("bgSelect");

window.applyBg = function applyBg() {
  ParticlesBg.stop();
  Snowfall.stop();
  Starfield.setVisible(false);
  if (App.bg === "particles") {
    ParticlesBg.start();
  } else if (App.bg === "snowfall") {
    Snowfall.start();
  } else {
    Starfield.setVisible(true);
  }
};

function syncBgUI() { bgSelect.value = App.bg; }

bgSelect.addEventListener("change", () => {
  App.bg = bgSelect.value;
  syncBgUI(); applyBg(); saveSettings();
});
