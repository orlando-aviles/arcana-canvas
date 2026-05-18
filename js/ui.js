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

// ── Smooth hue lerp system ─────────────────────────────────────────
// FX.hueA/hueB are TARGETS. _displayHueA/B are the animated values.
// All rendering reads FX.hueA/hueB (which lerp toward targets each frame).
let _targetHueA = FX.hueA;
let _targetHueB = FX.hueB;
let _lerpRafId  = null;

function lerpAngle(a, b, t) {
  // Shortest-path lerp around the 360° colour wheel
  let diff = ((b - a + 540) % 360) - 180;
  return (a + diff * t + 360) % 360;
}

function tickLerp() {
  const speed = 0.025; // fraction per frame (~3s to full shift at 60fps)
  const dA = Math.abs(((FX.hueA - _targetHueA + 540) % 360) - 180);
  const dB = Math.abs(((FX.hueB - _targetHueB + 540) % 360) - 180);

  if (dA < 0.2 && dB < 0.2) {
    FX.hueA = _targetHueA;
    FX.hueB = _targetHueB;
    applyAuras();
    // Sync sliders to final settled value
    const hAs = document.getElementById("hueASlider");
    const hBs = document.getElementById("hueBSlider");
    const hAv = document.getElementById("hueAValue");
    const hBv = document.getElementById("hueBValue");
    if (hAs) hAs.value = Math.round(FX.hueA);
    if (hBs) hBs.value = Math.round(FX.hueB);
    if (hAv) hAv.textContent = Math.round(FX.hueA) + "°";
    if (hBv) hBv.textContent = Math.round(FX.hueB) + "°";
    // Redraw cards with settled color
    if (window.redrawAll) { const _d = window.getDraws ? window.getDraws() : []; if (_d.length > 0) redrawAll(); }
    _lerpRafId = null;
    return;
  }

  FX.hueA = lerpAngle(FX.hueA, _targetHueA, speed);
  FX.hueB = lerpAngle(FX.hueB, _targetHueB, speed);
  applyAuras();
  // In dynamic mode, update cards every N lerp frames (not every frame — too expensive)
  if (window.App && App.cardAuraMode === "dynamic" &&
      window.redrawAll && !(tickLerp._frame % 6)) {
    const _d = window.getDraws ? window.getDraws() : [];
    if (_d.length > 0) redrawAll();
  }
  tickLerp._frame = ((tickLerp._frame || 0) + 1) % 60;
  _lerpRafId = requestAnimationFrame(tickLerp);
}

function setHueTargets(a, b) {
  _targetHueA = ((a % 360) + 360) % 360;
  _targetHueB = ((b % 360) + 360) % 360;
  if (!_lerpRafId) _lerpRafId = requestAnimationFrame(tickLerp);
  // Burst: redraw cards every 100ms for 1s so they catch the color shift
  if (window.App?.perfMode !== "balanced" && window.redrawAll) {
    const currentDraws = window.getDraws ? window.getDraws() : [];
    if (currentDraws.length > 0) {
      let burstCount = 0;
      const burst = setInterval(() => {
        if (burstCount++ >= 10) { clearInterval(burst); return; }
        redrawAll();
      }, 100);
    }
  }
}

// ── Auto-cycle — picks new random targets every 8s, lerp does the work ──
let _cycleTimer = null;
window.startCycle = function startCycle() {
  if (_cycleTimer) return;
  _cycleTimer = setInterval(() => {
    const newA = Math.floor(Math.random() * 360);
    const newB = (newA + 30 + Math.floor(Math.random() * 60)) % 360;
    setHueTargets(newA, newB);
    saveSettings();
  }, 8000);
};
window.stopCycle = function stopCycle() {
  clearInterval(_cycleTimer);
  _cycleTimer = null;
};
auraCycleToggle.addEventListener("change", () => {
  App.auraCycle = auraCycleToggle.checked;
  App.auraCycle ? startCycle() : stopCycle();
  saveSettings();
});

// Card aura mode
const cardAuraModeSelect = document.getElementById("cardAuraModeSelect");
if (cardAuraModeSelect) {
  cardAuraModeSelect.value = App.cardAuraMode || "dynamic";
  cardAuraModeSelect.addEventListener("change", () => {
    App.cardAuraMode = cardAuraModeSelect.value;
    redrawAll();
    saveSettings();
  });
}

// Performance mode
const perfModeSelect = document.getElementById("perfModeSelect");
const perfModeLabel  = document.getElementById("perfModeLabel");
const maxCardsSlider = document.getElementById("maxCardsSlider");
const maxCardsLabel  = document.getElementById("maxCardsLabel");

window.applyPerfMode = function applyPerfMode(mode) {
  App.perfMode = mode;
  const labels = { full: "Full", balanced: "Balanced", saver: "Battery Saver" };
  if (perfModeLabel) perfModeLabel.textContent = labels[mode] || mode;
  if (perfModeSelect) perfModeSelect.value = mode;

  if (mode === "saver") {
    // Stop all background animation
    if (window.Starfield) Starfield.setVisible(false);
    if (window.ParticlesBg) ParticlesBg.stop();
    if (window.Snowfall) Snowfall.stop();
  } else {
    // Restore based on App.bg
    applyBg();
  }
  // Cap RAF to 30fps in balanced mode via Starfield dt clamping
  // (handled by tickLerp and bg systems reading App.perfMode)
};

if (perfModeSelect) {
  perfModeSelect.addEventListener("change", () => {
    applyPerfMode(perfModeSelect.value);
    saveSettings();
  });
}

if (maxCardsSlider) {
  maxCardsSlider.addEventListener("input", () => {
    App.maxCards = parseInt(maxCardsSlider.value);
    if (maxCardsLabel) maxCardsLabel.textContent = maxCardsSlider.value;
    saveSettings();
  });
}

// Battery API — suggest saver mode below 20%
if (navigator.getBattery) {
  navigator.getBattery().then(battery => {
    function checkBattery() {
      if (battery.level < 0.2 && !battery.charging && App.perfMode === "full") {
        // Show a subtle suggestion — don't force it
        const existing = document.getElementById("batteryHint");
        if (!existing) {
          const hint = document.createElement("div");
          hint.id = "batteryHint";
          hint.className = "battery-hint";
          hint.textContent = "🔋 Low battery — consider Battery Saver mode in Settings";
          hint.onclick = () => hint.remove();
          document.body.appendChild(hint);
          setTimeout(() => hint.remove(), 8000);
        }
      }
    }
    battery.addEventListener("levelchange", checkBattery);
    checkBattery();
  }).catch(() => {});
}

// ── Deck equip toggles ───────────────────────────────────────────────
document.querySelectorAll(".deckEquipToggle").forEach(toggle => {
  const deck = toggle.dataset.deck;
  // Restore state
  toggle.checked = App.equippedDecks.includes(deck);
  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      if (!App.equippedDecks.includes(deck)) App.equippedDecks.push(deck);
    } else {
      // Always keep at least one deck equipped
      if (App.equippedDecks.length <= 1) { toggle.checked = true; return; }
      App.equippedDecks = App.equippedDecks.filter(d => d !== deck);
      // If active deck was unequipped, switch to first equipped
      if (!App.equippedDecks.includes(App.activeDeck)) {
        App.activeDeck = App.equippedDecks[0];
        syncDeckUI();
        redrawAll();
      }
    }
    saveSettings();
  });
});

// ── Reversals toggle in settings (mirrors main toggle) ────────────────
const reversalsToggleSettings = document.getElementById("reversalsToggleSettings");
if (reversalsToggleSettings) {
  reversalsToggleSettings.checked = App.reversals;
  reversalsToggleSettings.addEventListener("change", () => {
    App.reversals = reversalsToggleSettings.checked;
    // Sync old toggle if still present
    const old = document.getElementById("reversalsToggle");
    if (old) old.checked = App.reversals;
    saveSettings();
  });
}

// Reversal display mode
const reversalDisplaySelect = document.getElementById("reversalDisplaySelect");
if (reversalDisplaySelect) {
  reversalDisplaySelect.value = App.reversalDisplay || "glow";
  reversalDisplaySelect.addEventListener("change", () => {
    App.reversalDisplay = reversalDisplaySelect.value;
    saveSettings();
    // Trigger re-render of journal strip if open
    if (window.Journal && Journal._getCurrentDay) {
      // Journal re-renders on next open
    }
  });
}

// Canvas header text editing
const headerTitleInput = document.getElementById("headerTitleInput");
const headerSubInput   = document.getElementById("headerSubInput");
const headerTitleEl    = document.querySelector(".canvasHeader-title");
const headerSubEl      = document.querySelector(".canvasHeader-sub");
if (headerTitleInput) {
  headerTitleInput.addEventListener("input", () => {
    App.headerTitle = headerTitleInput.value;
    if (headerTitleEl) headerTitleEl.textContent = headerTitleInput.value || "Arcana Canvas";
    saveSettings();
  });
}
if (headerSubInput) {
  headerSubInput.addEventListener("input", () => {
    App.headerSub = headerSubInput.value;
    if (headerSubEl) headerSubEl.textContent = headerSubInput.value
      || "Tap to draw · Hold for meaning · Drag to move";
    saveSettings();
  });
}

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
  // Sliders snap immediately — set both target and current
  _targetHueA = Number(hueASlider.value) || 0;
  FX.hueA     = _targetHueA;
  applyAuras(); syncVisualUI(); Runes.invalidateCache(); saveSettings();
});
hueBSlider.addEventListener("input", () => {
  _targetHueB = Number(hueBSlider.value) || 0;
  FX.hueB     = _targetHueB;
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

// Cycle through equipped decks only (for shortcuts later)
window.cycleEquippedDeck = function() {
  const equipped = App.equippedDecks;
  if (!equipped.length) return;
  const cur = equipped.indexOf(App.activeDeck);
  App.activeDeck = equipped[(cur + 1) % equipped.length];
  syncDeckUI(); saveSettings();
  if (window.redrawAll) redrawAll();
};


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
