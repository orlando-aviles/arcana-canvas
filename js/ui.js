/*********************************************************
 * HAMBURGER MENU
 *********************************************************/
const menuBtn   = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");

function openMenu()  { menuPanel.classList.add("open"); menuPanel.setAttribute("aria-hidden","false"); }
function closeMenu() { menuPanel.classList.remove("open"); menuPanel.setAttribute("aria-hidden","true"); }
function toggleMenu(){ menuPanel.classList.contains("open") ? closeMenu() : openMenu(); }
window.toggleMenu = toggleMenu;
window.closeMenu  = closeMenu;

menuBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleMenu(); });

/*********************************************************
 * ATMOSPHERE PANEL
 *********************************************************/
const atmospherePanel = document.getElementById("atmospherePanel");
const atmosphereClose = document.getElementById("atmosphereClose");
const atmosphereBtn   = document.getElementById("atmosphereBtn");

function openAtmosphere() {
  closeMenu();
  if (window.CardIndex) CardIndex.close();
  if (window.Journal)   Journal.close();
  atmospherePanel.classList.add("atmo-open");
  atmospherePanel.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeAtmosphere() {
  atmospherePanel.classList.remove("atmo-open");
  atmospherePanel.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}

atmosphereBtn.addEventListener("click",   () => openAtmosphere());
atmosphereClose.addEventListener("click", () => closeAtmosphere());
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && atmospherePanel.classList.contains("atmo-open")) {
    closeAtmosphere();
  }
});

/*********************************************************
 * AURA SETTINGS
 *********************************************************/
const auraToggle       = document.getElementById("auraToggle");
const auraCycleToggle  = document.getElementById("auraCycleToggle");
const auraOpacitySlider= document.getElementById("auraOpacitySlider");
const auraOpacityValue = document.getElementById("auraOpacityValue");
const headerToggle     = document.getElementById("headerToggle");
const canvasHeader     = document.getElementById("canvasHeader");

// Aura on/off
auraToggle.addEventListener("change", () => {
  App.auraOn = auraToggle.checked;
  document.documentElement.style.setProperty(
    "--auraColor",
    App.auraOn
      ? `hsla(${FX.hueA}, 85%, 72%, ${App.auraOpacity || 0.72})`
      : "rgba(120,120,140,0.4)"
  );
  saveSettings();
});

// Opacity
auraOpacitySlider.addEventListener("input", () => {
  const v = Number(auraOpacitySlider.value) / 100;
  App.auraOpacity = v;
  auraOpacityValue.textContent = auraOpacitySlider.value + "%";
  applyAuras();
  saveSettings();
});

// Auto-cycle — randomly shift hues every 8 seconds
let _cycleTimer = null;
window.startCycle = function startCycle() {
  if (_cycleTimer) return;
  _cycleTimer = setInterval(() => {
    FX.hueA = Math.floor(Math.random() * 360);
    FX.hueB = (FX.hueA + 30 + Math.floor(Math.random() * 60)) % 360;
    applyAuras();
    // Sync sliders
    document.getElementById("hueASlider").value = FX.hueA;
    document.getElementById("hueBSlider").value = FX.hueB;
    document.getElementById("hueAValue").textContent = FX.hueA + "°";
    document.getElementById("hueBValue").textContent = FX.hueB + "°";
    saveSettings();
  }, 8000);
}
window.stopCycle = function stopCycle() {
  clearInterval(_cycleTimer);
  _cycleTimer = null;
}
auraCycleToggle.addEventListener("change", () => {
  App.auraCycle = auraCycleToggle.checked;
  App.auraCycle ? startCycle() : stopCycle();
  saveSettings();
});

// Canvas header toggle
headerToggle.addEventListener("change", () => {
  App.showHeader = headerToggle.checked;
  canvasHeader.style.display = App.showHeader ? "" : "none";
  saveSettings();
});
menuPanel.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => { if (menuPanel.classList.contains("open")) closeMenu(); });

/*********************************************************
 * CLEAR
 *********************************************************/
document.getElementById("journalBtn").addEventListener("click", () => {
  closeMenu();
  Journal.open();
});

document.getElementById("cardIndexBtn").addEventListener("click", () => {
  closeMenu();
  CardIndex.open();
});

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
