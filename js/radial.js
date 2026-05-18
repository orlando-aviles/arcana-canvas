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

  // Order: bottom → top (i=0 closest to hamburger)
  const BTNS = [
    { id: "linear-clear",  icon: "&#x2298;", label: "Clear",
      action: () => { closeLinear(); if (window.clearCanvas) clearCanvas(); }
    },
    { id: "linear-deck",   icon: "&#x25A3;", label: "Deck",
      getLabel: () => {
        const labels = { luminousarc:"Luminous", riderwaite:"Rider-Waite", gilded:"Gilded", runes:"Runes", playing:"Playing" };
        return labels[App.activeDeck] || App.activeDeck;
      },
      action: () => { if (window.cycleEquippedDeck) cycleEquippedDeck(); updateBtns(); }
    },
    { id: "linear-index",  icon: "&#x26B7;", label: "Index",
      action: () => { closeLinear(); if (window.CardIndex) CardIndex.open(); }
    },
    { id: "linear-journal",icon: "&#x270E;", label: "Journal",
      action: () => { closeLinear(); if (window.Journal) Journal.openToday(); }
    },
    { id: "linear-atmo",   icon: "&#x2600;", label: "Settings",
      action: () => { closeLinear(); if (window.openAtmosphere) openAtmosphere(); }
    },
  ];

  let _isOpen = false;
  let _els    = []; // [{btn, lbl}]

  function createEls() {
    BTNS.forEach((def, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = def.id;
      btn.className = "linear-menu-btn";
      // Icon + label inside button
      const labelText = def.getLabel ? def.getLabel() : def.label;
      btn.innerHTML = `<span class="lmb-icon">${def.icon}</span><span class="lmb-text">${labelText}</span>`;

      const bottomOffset = ANCHOR_B + 44 + BTN_GAP + (i * STEP);
      btn.style.bottom = bottomOffset + "px";
      btn.style.right  = ANCHOR_R + "px";
      btn.style.transitionDelay = (i * 40) + "ms";

      btn.addEventListener("click", (e) => { e.stopPropagation(); def.action(); });

      document.body.appendChild(btn);
      _els.push({ btn, def });
    });
  }

  function updateBtns() {
    _els.forEach(({ btn, def }) => {
      const labelText = def.getLabel ? def.getLabel() : def.label;
      btn.innerHTML = `<span class="lmb-icon">${def.icon}</span><span class="lmb-text">${labelText}</span>`;
    });
  }

  function openLinear() {
    _isOpen = true;
    updateBtns();
    menuBtn.classList.add("radial-open");
    document.getElementById("radialBackdrop").classList.add("open");
    if (window.closeMenu) closeMenu();
    _els.forEach(({ btn }) => btn.classList.add("open"));
  }

  function closeLinear() {
    _isOpen = false;
    menuBtn.classList.remove("radial-open");
    document.getElementById("radialBackdrop").classList.remove("open");
    _els.forEach(({ btn }) => btn.classList.remove("open"));
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
