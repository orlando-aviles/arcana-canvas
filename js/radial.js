/* ═══════════════════════════════════════════════════════
   radial.js — double-ring radial menu
   Inner ring: Journal, Index, Atmosphere, Clear
   Outer ring: configured shortcuts from App.shortcuts
   ═══════════════════════════════════════════════════════ */

(function() {
  // ── Anchor: bottom-right corner ──────────────────────
  // menuBtn is at bottom:16px, right:16px, 44×44px
  // Radial fans 90° from 180° (left) to 90° (up)
  const ANCHOR_B = 16 + 22; // px from bottom to btn center
  const ANCHOR_R = 16 + 22; // px from right to btn center

  // Inner ring config
  const INNER_RADIUS = 82;
  const INNER_BTNS = [
    { id: "radial-journal",    icon: "&#x270E;", label: "Journal",   angle: 180, action: () => { closeRadial(); if(window.Journal) Journal.openToday(); } },
    { id: "radial-index",      icon: "&#x26B7;", label: "Index",     angle: 150, action: () => { closeRadial(); if(window.CardIndex) CardIndex.open(); } },
    { id: "radial-atmosphere", icon: "&#x2600;", label: "Settings",  angle: 120, action: () => { closeRadial(); if(window.openAtmosphere) openAtmosphere(); } },
    { id: "radial-clear",      icon: "&#x2298;", label: "Clear",     angle:  90, action: () => { closeRadial(); if(window.clearCanvas) clearCanvas(); } },
  ];

  // Outer ring config — driven by App.shortcuts
  const OUTER_RADIUS = 155;
  const OUTER_ANGLES = [195, 168, 141, 110]; // spread in 90° arc

  // Shortcut definitions
  const SHORTCUT_DEFS = {
    deck:      { icon: "&#x25A3;", getLabel: () => { const d = App.equippedDecks?.[App.equippedDecks.indexOf(App.activeDeck)]; return App.activeDeck?.slice(0,3).toUpperCase() || "DK"; }, action: () => { if(window.cycleEquippedDeck) cycleEquippedDeck(); updateOuterBtns(); } },
    size:      { icon: "&#x2921;", getLabel: () => (App.cardScale ? Math.round(App.cardScale * 100) + "%" : "SZ"), action: () => { if(window.cycleCardSize) cycleCardSize(); updateOuterBtns(); } },
    reversals: { icon: "&#x25BD;", getLabel: () => App.reversals ? "REV ON" : "REV OFF", action: () => { if(window.toggleReversals) toggleReversals(); updateOuterBtns(); }, getActive: () => App.reversals },
    perf:      { icon: "&#x26A1;", getLabel: () => { const m = App.perfMode || "full"; return m === "full" ? "FULL" : m === "balanced" ? "BAL" : "SAVE"; }, action: () => { if(window.cyclePerf) cyclePerf(); updateOuterBtns(); } },
    none:      { icon: "", getLabel: () => "", action: () => {} },
  };

  let _isOpen = false;
  let _innerEls = [];
  let _outerEls = []; // [{btn, label}]

  // ── Build DOM elements ────────────────────────────────
  function createBtn(cls, id) {
    const btn = document.createElement("button");
    btn.className = `radial-btn ${cls}`;
    if (id) btn.id = id;
    btn.type = "button";
    document.body.appendChild(btn);
    return btn;
  }

  function createLabel() {
    const lbl = document.createElement("div");
    lbl.className = "radial-btn-label";
    document.body.appendChild(lbl);
    return lbl;
  }

  // Convert polar (angle in degrees, radius) to fixed position offsets
  // from bottom-right anchor
  function polarToFixed(angleDeg, radius) {
    const rad = angleDeg * Math.PI / 180;
    // cos for x (negative = left from right edge), sin for y (positive = up from bottom)
    const dx = Math.cos(rad) * radius; // left from anchor
    const dy = Math.sin(rad) * radius; // up from anchor
    return {
      right:  Math.round(ANCHOR_R - 22 + (22 - dx)), // px from right edge
      bottom: Math.round(ANCHOR_B - 22 + (22 - dy)), // px from bottom edge
    };
  }

  // ── Init ──────────────────────────────────────────────
  function init() {
    // Inner ring buttons
    INNER_BTNS.forEach((def, i) => {
      const btn = createBtn("inner", def.id);
      btn.innerHTML = def.icon;
      btn.title = def.label;
      btn.setAttribute("data-tooltip", def.label);
      const pos = polarToFixed(def.angle, INNER_RADIUS);
      btn.style.right  = pos.right  + "px";
      btn.style.bottom = pos.bottom + "px";
      btn.style.transitionDelay = `${i * 35}ms`;
      btn.addEventListener("click", (e) => { e.stopPropagation(); def.action(); });
      _innerEls.push(btn);
    });

    // Outer ring buttons (built from App.shortcuts)
    for (let i = 0; i < 4; i++) {
      const btn = createBtn("outer");
      const lbl = createLabel();
      const pos = polarToFixed(OUTER_ANGLES[i], OUTER_RADIUS);
      btn.style.right  = pos.right  + "px";
      btn.style.bottom = pos.bottom + "px";
      btn.style.transitionDelay = `${(i + 4) * 30}ms`;
      lbl.style.right  = (pos.right - 20) + "px";
      lbl.style.bottom = (pos.bottom - 16) + "px";
      lbl.style.transitionDelay = `${(i + 4) * 30}ms`;
      const idx = i;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const key = App.shortcuts?.[idx] || "none";
        const def = SHORTCUT_DEFS[key] || SHORTCUT_DEFS.none;
        def.action();
      });
      _outerEls.push({ btn, lbl });
    }

    updateOuterBtns();

    // Wire backdrop
    document.getElementById("radialBackdrop")
      .addEventListener("click", closeRadial);
  }

  // ── Update outer buttons from current App.shortcuts ───
  function updateOuterBtns() {
    _outerEls.forEach(({ btn, lbl }, i) => {
      const key = App.shortcuts?.[i] || "none";
      const def = SHORTCUT_DEFS[key] || SHORTCUT_DEFS.none;
      btn.innerHTML = def.icon;
      btn.title = key;
      lbl.textContent = def.getLabel();
      btn.classList.toggle("active", !!(def.getActive && def.getActive()));
      btn.style.display = key === "none" ? "none" : "";
      lbl.style.display = key === "none" ? "none" : "";
    });
  }

  // ── Open / Close ──────────────────────────────────────
  function openRadial() {
    _isOpen = true;
    updateOuterBtns();
    menuBtn.classList.add("radial-open");
    document.getElementById("radialBackdrop").classList.add("open");
    // Close menu panel if open
    if (window.closeMenu) closeMenu();
    // Animate in with staggered delay
    [..._innerEls, ..._outerEls.map(o => o.btn), ..._outerEls.map(o => o.lbl)]
      .forEach(el => el.classList.add("open"));
  }

  function closeRadial() {
    _isOpen = false;
    menuBtn.classList.remove("radial-open");
    document.getElementById("radialBackdrop").classList.remove("open");
    [..._innerEls, ..._outerEls.map(o => o.btn), ..._outerEls.map(o => o.lbl)]
      .forEach(el => el.classList.remove("open"));
  }

  // ── Wire hamburger ────────────────────────────────────
  // Runs after DOM is ready — replaces the old toggleMenu behavior
  function wireHamburger() {
    const btn = document.getElementById("menuBtn");
    if (!btn) return;
    // Remove old listener by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    window.menuBtn = newBtn;

    newBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      _isOpen ? closeRadial() : openRadial();
    });
  }

  // ── Public ────────────────────────────────────────────
  window.RadialMenu = { open: openRadial, close: closeRadial, update: updateOuterBtns };

  // Init after DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { init(); wireHamburger(); });
  } else {
    init(); wireHamburger();
  }
})();
