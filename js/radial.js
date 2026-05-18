/* ═══════════════════════════════════════════════════════
   radial.js — linear vertical menu rising from hamburger
   5 buttons stacked upward: Journal, Index, Settings,
   Clear, Deck Cycle
   ═══════════════════════════════════════════════════════ */

(function() {
  const BTN_SIZE   = 52;
  const BTN_GAP    = 10;
  const ANCHOR_B   = 16;  // hamburger bottom offset
  const ANCHOR_R   = 16;  // hamburger right offset
  const STEP       = BTN_SIZE + BTN_GAP; // 62px per button

  const BTNS = [
    { id: "linear-deck",   icon: "&#x25A3;", label: "Deck",     getIcon: () => "&#x25A3;", getLabel: () => {
        const labels = { luminousarc:"Luminous", riderwaite:"Rider-Waite", gilded:"Gilded", runes:"Runes", playing:"Playing" };
        return labels[App.activeDeck] || App.activeDeck;
      },
      action: () => { if (window.cycleEquippedDeck) cycleEquippedDeck(); updateBtns(); }
    },
    { id: "linear-clear",  icon: "&#x2298;", label: "Clear",    action: () => { closeLinear(); if (window.clearCanvas) clearCanvas(); } },
    { id: "linear-atmo",   icon: "&#x2600;", label: "Settings", action: () => { closeLinear(); if (window.openAtmosphere) openAtmosphere(); } },
    { id: "linear-index",  icon: "&#x26B7;", label: "Index",    action: () => { closeLinear(); if (window.CardIndex) CardIndex.open(); } },
    { id: "linear-journal",icon: "&#x270E;", label: "Journal",  action: () => { closeLinear(); if (window.Journal) Journal.openToday(); } },
  ];

  let _isOpen = false;
  let _els    = []; // [{btn, lbl}]

  function createEls() {
    BTNS.forEach((def, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = def.id;
      btn.className = "linear-menu-btn";
      btn.innerHTML = def.icon;
      btn.setAttribute("data-tooltip", def.label);

      const lbl = document.createElement("div");
      lbl.className = "linear-menu-label";
      lbl.textContent = def.label;

      // Position: stacked upward from hamburger
      // i=0 is closest (deck), i=4 is highest (journal)
      const bottomOffset = ANCHOR_B + 44 + BTN_GAP + (i * STEP);
      btn.style.bottom = bottomOffset + "px";
      btn.style.right  = ANCHOR_R + "px";
      lbl.style.bottom = (bottomOffset + 14) + "px";
      lbl.style.right  = (ANCHOR_R + BTN_SIZE + 8) + "px";

      // Stagger delay — top button animates in last
      const delay = i * 40;
      btn.style.transitionDelay  = delay + "ms";
      lbl.style.transitionDelay  = delay + "ms";

      btn.addEventListener("click", (e) => { e.stopPropagation(); def.action(); });

      document.body.appendChild(btn);
      document.body.appendChild(lbl);
      _els.push({ btn, lbl, def });
    });
  }

  function updateBtns() {
    _els.forEach(({ btn, lbl, def }) => {
      if (def.getLabel) lbl.textContent = def.getLabel();
      if (def.getIcon)  btn.innerHTML   = def.getIcon();
    });
  }

  function openLinear() {
    _isOpen = true;
    updateBtns();
    menuBtn.classList.add("radial-open");
    document.getElementById("radialBackdrop").classList.add("open");
    if (window.closeMenu) closeMenu();
    _els.forEach(({ btn, lbl }) => {
      btn.classList.add("open");
      lbl.classList.add("open");
    });
  }

  function closeLinear() {
    _isOpen = false;
    menuBtn.classList.remove("radial-open");
    document.getElementById("radialBackdrop").classList.remove("open");
    _els.forEach(({ btn, lbl }) => {
      btn.classList.remove("open");
      lbl.classList.remove("open");
    });
  }

  function wireHamburger() {
    const btn = document.getElementById("menuBtn");
    if (!btn) return;
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    window.menuBtn = newBtn;
    newBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      _isOpen ? closeLinear() : openLinear();
    });
  }

  function init() {
    createEls();
    document.getElementById("radialBackdrop")
      .addEventListener("click", closeLinear);
  }

  window.RadialMenu = { open: openLinear, close: closeLinear, update: updateBtns };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { init(); wireHamburger(); });
  } else {
    init(); wireHamburger();
  }
})();
