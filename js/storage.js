const STORAGE_KEY_SETTINGS = "arcana_settings_v5";

const VALID_DECKS = ["text","playing","riderwaite","luminousarc","gilded","runes"];
const VALID_BGS   = ["starfield","particles","snowfall"];

function saveSettings() {
  const settings = {
    fx:  { intensity: FX.intensity, hueA: FX.hueA, hueB: FX.hueB },
    app: {
      activeDeck:  App.activeDeck,
      cardScale:   App.cardScale,
      bg:          App.bg,
      reversals:   App.reversals,
      auraOn:      App.auraOn,
      auraOpacity: App.auraOpacity,
      auraCycle:   App.auraCycle,
      showHeader:   App.showHeader,
      cardAuraMode: App.cardAuraMode,
      perfMode:     App.perfMode,
      maxCards:     App.maxCards,
      headerTitle:      App.headerTitle,
      headerSub:        App.headerSub,
      reversalDisplay:  App.reversalDisplay,
      indexDeckFilter: App.indexDeckFilter,
    },
  };
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return false;

    if (data.fx) {
      if (typeof data.fx.intensity === "number") FX.intensity = clamp(data.fx.intensity, 0, 1);
      if (typeof data.fx.hueA === "number") FX.hueA = ((data.fx.hueA % 360) + 360) % 360;
      if (typeof data.fx.hueB === "number") FX.hueB = ((data.fx.hueB % 360) + 360) % 360;
    }
    if (data.app) {
      if (VALID_DECKS.includes(data.app.activeDeck)) App.activeDeck = data.app.activeDeck;
      if (typeof data.app.cardScale   === "number")  App.cardScale   = clamp(data.app.cardScale, 0.6, 1.6);
      if (VALID_BGS.includes(data.app.bg))           App.bg          = data.app.bg;
      if (typeof data.app.reversals   === "boolean") App.reversals   = data.app.reversals;
      if (typeof data.app.auraOn      === "boolean") App.auraOn      = data.app.auraOn;
      if (typeof data.app.auraOpacity === "number")  App.auraOpacity = clamp(data.app.auraOpacity, 0.1, 1);
      if (typeof data.app.auraCycle   === "boolean") App.auraCycle   = data.app.auraCycle;
      if (typeof data.app.showHeader  === "boolean") App.showHeader  = data.app.showHeader;
      if (["dynamic","static","off"].includes(data.app.cardAuraMode)) App.cardAuraMode = data.app.cardAuraMode;
      if (["full","balanced","saver"].includes(data.app.perfMode)) App.perfMode = data.app.perfMode;
      if (typeof data.app.maxCards === "number") App.maxCards = Math.max(5, Math.min(60, data.app.maxCards));
      if (typeof data.app.headerTitle === "string") App.headerTitle = data.app.headerTitle;
      if (typeof data.app.headerSub   === "string") App.headerSub   = data.app.headerSub;
      if (["glow","flip"].includes(data.app.reversalDisplay)) App.reversalDisplay = data.app.reversalDisplay;
      if (typeof data.app.indexDeckFilter === "string") App.indexDeckFilter = data.app.indexDeckFilter;
    }
    return true;
  } catch { return false; }
}
