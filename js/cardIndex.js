/*********************************************************
 * CARD INDEX  v2
 *
 * Two modes:
 *   full   — all cards, opened from menu
 *   spread — filtered to current canvas draws, opened
 *             from the description overlay
 *
 * Features:
 *   - List → detail navigation
 *   - Swipe left/right in detail to move through nav list
 *   - Tap image → lightbox (full-screen, tap to dismiss)
 *   - Deck toggle (Luminous Arc / Rider-Waite)
 *   - No pinch-zoom inside overlay (touch-action: pan-y)
 *   - Back in spread mode → closes index entirely (returns
 *     to canvas), not to index list
 *********************************************************/
window.CardIndex = (() => {

  // ── State ─────────────────────────────────────────────
  // Default to whatever deck is active on canvas
  function defaultDeck() {
    if (!window.App) return "LuminousArc";
    if (App.activeDeck === "riderwaite") return "RiderWaite";
    return "LuminousArc";
  }
  let activeDeck = defaultDeck();
  let mode        = "full";      // "full" | "spread"
  let navList     = [];          // ordered list for swipe nav
  let navIdx      = 0;           // current position in navList
  let currentCard = null;
  let searchQuery = "";
  let isOpen      = false;

  // ── Glyphs ────────────────────────────────────────────
  const ELEMENT_GLYPH = { Fire:"🔥", Water:"💧", Air:"💨", Earth:"🌿" };
  const ASTRO_GLYPH = {
    Aries:"♈",Taurus:"♉",Gemini:"♊",Cancer:"♋",Leo:"♌",Virgo:"♍",
    Libra:"♎",Scorpio:"♏",Sagittarius:"♐",Capricorn:"♑",Aquarius:"♒",Pisces:"♓",
    Sun:"☀️",Moon:"🌙",Mercury:"☿",Venus:"♀",Mars:"♂",Jupiter:"♃",
    Saturn:"♄",Uranus:"♅",Neptune:"♆",Pluto:"♇",
  };
  const RUNE_GLYPHS = {
    Fehu:"ᚠ",Uruz:"ᚢ",Thurisaz:"ᚦ",Ansuz:"ᚨ",Raidho:"ᚱ",Kenaz:"ᚲ",
    Gebo:"ᚷ",Wunjo:"ᚹ",Hagalaz:"ᚺ",Nauthiz:"ᚾ",Isa:"ᛁ",Jera:"ᛃ",
    Eihwaz:"ᛇ",Perthro:"ᛈ",Algiz:"ᛉ",Sowilo:"ᛊ",Tiwaz:"ᛏ",Berkano:"ᛒ",
    Ehwaz:"ᛖ",Mannaz:"ᛗ",Laguz:"ᛚ",Ingwaz:"ᛜ",Dagaz:"ᛞ",Othala:"ᛟ",
  };
  function runeGlyph(name) { return RUNE_GLYPHS[name] || "?"; }
  function astroGlyph(astro) {
    return astro.split(" / ").map(a => ASTRO_GLYPH[a.trim()] || a).join(" ");
  }

  // ── Build DOM ─────────────────────────────────────────
  const overlay = document.createElement("div");
  overlay.id = "cardIndexOverlay";
  overlay.setAttribute("aria-modal","true");
  overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-label","Card Index");

  overlay.innerHTML = `
    <div class="ci-header">
      <button class="ci-back" id="ciBack" aria-label="Back">←</button>
      <span class="ci-title" id="ciTitle">Card Index</span>
      <button class="ci-close" id="ciClose" aria-label="Close">✕</button>
    </div>

    <div class="ci-list-view" id="ciListView">
      <div class="ci-search-row">
        <input class="ci-search" id="ciSearch" type="search"
               placeholder="Search cards…" autocomplete="off" />
        <div class="ci-deck-toggle">
          <button class="ci-deck-btn active" data-deck="LuminousArc">Luminous</button>
          <button class="ci-deck-btn" data-deck="RiderWaite">Rider-Waite</button>
        </div>
      </div>
      <div class="ci-list" id="ciList"></div>
    </div>

    <div class="ci-detail-view" id="ciDetailView">
      <div class="ci-deck-toggle ci-detail-deck">
        <button class="ci-deck-btn active" data-deck="LuminousArc">Luminous</button>
        <button class="ci-deck-btn" data-deck="RiderWaite">Rider-Waite</button>
      </div>
      <div class="ci-swipe-hint" id="ciSwipeHint"></div>
      <div class="ci-card-img-wrap" id="ciImgWrap">
        <img class="ci-card-img" id="ciCardImg" src="" alt="" />
        <div class="ci-card-img-placeholder" id="ciCardImgPlaceholder"></div>
      </div>
      <div class="ci-card-info" id="ciCardInfo"></div>
      <div class="ci-nav-dots" id="ciNavDots"></div>
    </div>

    <div class="ci-lightbox" id="ciLightbox">
      <img class="ci-lightbox-img" id="ciLightboxImg" src="" alt="" />
    </div>
    <div class="ci-bottom-bar">
      <button class="ci-bottom-btn" id="ciToJournal" title="Open Journal">&#x270E;</button>
      <button class="ci-bottom-btn ci-save-btn" id="ciSaveCard" title="Save to Journal" style="display:none">&#x2B;</button>
      <button class="ci-bottom-btn ci-close-right" id="ciCloseBtn" title="Close">&#x2715;</button>
    </div>
  `;

  document.body.appendChild(overlay);

  // ── Refs ──────────────────────────────────────────────
  const ciBack       = overlay.querySelector("#ciBack");
  const ciClose      = overlay.querySelector("#ciClose");
  const ciTitle      = overlay.querySelector("#ciTitle");
  const ciListView   = overlay.querySelector("#ciListView");
  const ciDetailView = overlay.querySelector("#ciDetailView");
  const ciList       = overlay.querySelector("#ciList");
  const ciSearch     = overlay.querySelector("#ciSearch");
  const ciCardImg    = overlay.querySelector("#ciCardImg");
  const ciImgWrap    = overlay.querySelector("#ciImgWrap");
  const ciCardImgPlaceholder = overlay.querySelector("#ciCardImgPlaceholder");
  const ciCardInfo   = overlay.querySelector("#ciCardInfo");
  const ciSwipeHint  = overlay.querySelector("#ciSwipeHint");
  const ciNavDots    = overlay.querySelector("#ciNavDots");
  const ciLightbox   = overlay.querySelector("#ciLightbox");
  const ciLightboxImg= overlay.querySelector("#ciLightboxImg");
  // Save card in bottom bar
  // Bottom bar nav
  overlay.querySelector("#ciCloseBtn").addEventListener("click", () => close());
  overlay.querySelector("#ciToJournal").addEventListener("click", () => {
    close();
    if (window.Journal) Journal.open();
  });

  // Save button in bottom bar — only visible in detail view
  const ciSaveCard = overlay.querySelector("#ciSaveCard");
  ciSaveCard.addEventListener("click", () => {
    if (!currentCard?.imageName) return;
    if (window.Journal) Journal.saveCardToToday(currentCard.imageName);
    ciSaveCard.textContent = "✦";
    ciSaveCard.style.color = "var(--auraColor)";
    setTimeout(() => { ciSaveCard.textContent = "✛"; ciSaveCard.style.color = ""; }, 1500);
  });

  // ── Nav list builders ─────────────────────────────────
  function buildFullNavList() {
    const q = searchQuery.toLowerCase();
    return CardData.getAll().filter(c =>
      !q || c.name.toLowerCase().includes(q)
    );
  }

  // Build nav list from canvas draws (deduped, preserving draw order)
  function buildSpreadNavList() {
    const currentDraws = window.getDraws ? window.getDraws() : [];
    if (!currentDraws.length) return [];
    const seen = new Set();
    const list = [];
    currentDraws.forEach(d => {
      const filename = cardDisplayNameFromDraw(d);
      const clean    = filename.replace(/ (R)$/, "");
      if (!seen.has(clean)) {
        seen.add(clean);
        const card = CardData.getByNameOrFile(clean);
        if (card) {
          // Detect reversed from rotation, not name
          const isReversed = !!d.rot && (Math.abs(d.rot % (Math.PI * 2)) > Math.PI / 2);
          list.push({ ...card, isReversedOrientation: isReversed });
        }
      }
    });
    return list;
  }

  function cardDisplayNameFromDraw(d) {
    if (typeof cardDisplayName === "function") return cardDisplayName(d);
    return d.name || "";
  }

  // ── List view ─────────────────────────────────────────
  function renderList() {
    const cards  = navList;
    const groups = {};
    const sectionOrder = ["Major Arcana","Wands","Cups","Swords","Pentacles","Runes"];

    cards.forEach(card => {
      const sec = card.section || "Other";
      if (!groups[sec]) groups[sec] = [];
      groups[sec].push(card);
    });

    let html = "";
    if (mode === "spread") {
      // Flat list for spread mode — no section headers
      cards.forEach((card, i) => {
        const imgSrc = card.imageName
          ? (card.section === "Runes" ? `./Runes/${card.imageName}.png` : `./${activeDeck}/${card.imageName}.png`)
          : "";
        const revBadge = card.isReversedOrientation ? `<span class="ci-rev-badge">R</span>` : "";
        html += `
          <div class="ci-row" data-idx="${i}">
            <div class="ci-thumb-wrap">
              ${imgSrc
                ? `<img class="ci-thumb" src="${imgSrc}" alt="" loading="lazy" />`
                : `<div class="ci-thumb-glyph">${runeGlyph(card.name)}</div>`}
            </div>
            <div class="ci-row-info">
              <span class="ci-row-name">${card.name} ${revBadge}</span>
              <span class="ci-row-meta">${ELEMENT_GLYPH[card.element]||""} ${card.element} · ${card.astro}</span>
            </div>
          </div>`;
      });
    } else {
      sectionOrder.forEach(sec => {
        if (!groups[sec]) return;
        html += `<div class="ci-section-header">${sec}</div>`;
        groups[sec].forEach(card => {
          const imgSrc = card.imageName
          ? (card.section === "Runes" ? `./Runes/${card.imageName}.png` : `./${activeDeck}/${card.imageName}.png`)
          : "";
          const idx = navList.indexOf(card);
          html += `
            <div class="ci-row" data-idx="${idx}">
              <div class="ci-thumb-wrap">
                ${imgSrc
                  ? `<img class="ci-thumb" src="${imgSrc}" alt="" loading="lazy" />`
                  : `<div class="ci-thumb-glyph">${runeGlyph(card.name)}</div>`}
              </div>
              <div class="ci-row-info">
                <span class="ci-row-name">${card.name}</span>
                <span class="ci-row-meta">${ELEMENT_GLYPH[card.element]||""} ${card.element} · ${card.astro}</span>
              </div>
            </div>`;
        });
      });
    }

    ciList.innerHTML = html || `<div class="ci-empty">No cards in spread yet.</div>`;
    ciList.querySelectorAll(".ci-row").forEach(row => {
      row.addEventListener("click", () => {
        navIdx = parseInt(row.dataset.idx);
        showDetailAtIdx(navIdx);
      });
    });
  }

  // ── Detail view ───────────────────────────────────────
  function showDetailAtIdx(idx) {
    // Show save button in detail view
    const saveBtn = overlay.querySelector("#ciSaveCard");
    if (saveBtn) saveBtn.style.display = "flex";
    // Sync deck toggle buttons on every detail render
    overlay.querySelectorAll(".ci-deck-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.deck === activeDeck);
    });
    navIdx = Math.max(0, Math.min(navList.length - 1, idx));
    const card = navList[navIdx];
    if (!card) return;
    currentCard = card;

    ciTitle.textContent = card.name;
    ciBack.style.display = "flex";
    ciListView.classList.remove("ci-active");
    ciDetailView.classList.add("ci-active");

    renderDetailImage(card);
    renderDetailInfo(card);
    renderNavDots();
    updateSwipeHint();
    ciDetailView.scrollTop = 0;
  }

  function getImgSrc(card) {
    if (!card.imageName) return null;
    return card.section === "Runes"
      ? `./Runes/${card.imageName}.png`
      : `./${activeDeck}/${card.imageName}.png`;
  }

  function renderDetailImage(card) {
    const src = getImgSrc(card);
    if (src) {
      ciCardImg.src = src;
      ciCardImg.alt = card.name;
      ciCardImg.style.display = "block";
      ciCardImgPlaceholder.style.display = "none";
    } else {
      ciCardImg.style.display = "none";
      ciCardImgPlaceholder.style.display = "flex";
      ciCardImgPlaceholder.textContent = runeGlyph(card.name);
    }
  }

  function renderDetailInfo(card) {
    const inSpread    = mode === "spread";
    const isReversed  = !!card.isReversedOrientation;
    const uprightClass  = inSpread ? (isReversed ? "" : "ci-meaning-active") : "";
    const reversedClass = inSpread ? (isReversed ? "ci-meaning-active" : "") : "";
    const revBadge = (inSpread && isReversed)
      ? ' <span class="ci-rev-badge">Reversed</span>' : "";

    ciCardInfo.innerHTML =
      '<div class="ci-detail-name">' + card.name + revBadge + '</div>' +
      '<div class="ci-detail-meta-row">' +
        '<span class="ci-meta-pill">' + (ELEMENT_GLYPH[card.element]||"") + " " + card.element + '</span>' +
        '<span class="ci-meta-pill">' + astroGlyph(card.astro) + " " + card.astro + '</span>' +
        '<span class="ci-meta-pill"># ' + card.number + '</span>' +
      '</div>' +
      (card.numNote ? '<div class="ci-numerology">' + card.number + " — " + card.numNote + '</div>' : "") +
      '<div class="ci-meaning-block ' + uprightClass + '">' +
        '<div class="ci-meaning-label">Upright</div>' +
        '<div class="ci-meaning-text">' + card.upright + '</div>' +
      '</div>' +
      '<div class="ci-meaning-block ci-reversed-block ' + reversedClass + '">' +
        '<div class="ci-meaning-label">Reversed</div>' +
        '<div class="ci-meaning-text">' + card.reversed + '</div>' +
      '</div>';
  }

  function renderNavDots() {
    if (navList.length <= 1) { ciNavDots.innerHTML = ""; return; }
    // Show at most 7 dots; current is highlighted
    const total = navList.length;
    let html = "";
    if (total <= 9) {
      for (let i = 0; i < total; i++) {
        html += `<span class="ci-dot${i === navIdx ? " ci-dot-active" : ""}" data-idx="${i}"></span>`;
      }
    } else {
      html = `<span class="ci-dot-count">${navIdx + 1} / ${total}</span>`;
    }
    ciNavDots.innerHTML = html;
    ciNavDots.querySelectorAll(".ci-dot").forEach(dot => {
      dot.addEventListener("click", () => showDetailAtIdx(parseInt(dot.dataset.idx)));
    });
  }

  function updateSwipeHint() {
    if (navList.length <= 1) { ciSwipeHint.textContent = ""; return; }
    const parts = [];
    if (navIdx > 0) parts.push("← " + navList[navIdx - 1].name);
    if (navIdx < navList.length - 1) parts.push(navList[navIdx + 1].name + " →");
    ciSwipeHint.textContent = parts.join("   ");
  }

  // ── Swipe navigation ──────────────────────────────────
  let swipeStartX = 0, swipeStartY = 0, swipeActive = false;

  ciDetailView.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
    swipeActive = true;
  }, { passive: true });

  ciDetailView.addEventListener("touchend", (e) => {
    if (!swipeActive || e.changedTouches.length !== 1) return;
    swipeActive = false;
    const dx = e.changedTouches[0].clientX - swipeStartX;
    const dy = e.changedTouches[0].clientY - swipeStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && navIdx < navList.length - 1) showDetailAtIdx(navIdx + 1);
      if (dx > 0 && navIdx > 0) showDetailAtIdx(navIdx - 1);
    }
  }, { passive: true });

  // Keyboard arrow nav
  document.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    const inLightbox = ciLightbox.classList.contains("ci-lb-open");
    if (e.key === "Escape") {
      if (inLightbox) { closeLightbox(); return; }
      if (currentCard) goBack(); else close();
      return;
    }
    if (!ciDetailView.classList.contains("ci-active")) return;
    if (e.key === "ArrowRight") {
      if (inLightbox) {
        const next = navIdx + 1;
        if (next < navList.length) {
          navIdx = next; currentCard = navList[navIdx];
          if (currentCard.imageName) ciLightboxImg.src = getImgSrc(currentCard) || "";
          else closeLightbox();
          renderDetailInfo(currentCard); renderNavDots(); updateSwipeHint();
        }
      } else showDetailAtIdx(navIdx + 1);
    }
    if (e.key === "ArrowLeft") {
      if (inLightbox) {
        const prev = navIdx - 1;
        if (prev >= 0) {
          navIdx = prev; currentCard = navList[navIdx];
          if (currentCard.imageName) ciLightboxImg.src = getImgSrc(currentCard) || "";
          else closeLightbox();
          renderDetailInfo(currentCard); renderNavDots(); updateSwipeHint();
        }
      } else showDetailAtIdx(navIdx - 1);
    }
  });

  // ── Lightbox ──────────────────────────────────────────
  let lbSwipeStartX = 0, lbSwipeActive = false;

  function openLightbox(src) {
    ciLightboxImg.src = src;
    ciLightbox.classList.add("ci-lb-open");
  }
  function closeLightbox() {
    ciLightbox.classList.remove("ci-lb-open");
  }

  ciLightbox.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    lbSwipeStartX = e.touches[0].clientX;
    lbSwipeActive = true;
  }, { passive: true });

  ciLightbox.addEventListener("touchend", (e) => {
    if (!lbSwipeActive || e.changedTouches.length !== 1) return;
    lbSwipeActive = false;
    const dx = e.changedTouches[0].clientX - lbSwipeStartX;
    if (Math.abs(dx) > 50) {
      // Swipe to adjacent card and update lightbox image
      const nextIdx = dx < 0 ? navIdx + 1 : navIdx - 1;
      if (nextIdx >= 0 && nextIdx < navList.length) {
        navIdx = nextIdx;
        const card = navList[navIdx];
        if (getImgSrc(card)) {
          ciLightboxImg.src = getImgSrc(card);
          // Also update detail view in background
          currentCard = card;
          renderDetailImage(card);
          renderDetailInfo(card);
          renderNavDots();
          updateSwipeHint();
        } else {
          closeLightbox();
          showDetailAtIdx(navIdx);
        }
      }
    } else {
      // Short tap = close
      closeLightbox();
    }
  }, { passive: true });

  // Click to close (desktop)
  ciLightbox.addEventListener("click", closeLightbox);

  ciImgWrap.addEventListener("click", () => {
    if (currentCard?.imageName) {
      openLightbox(`./${activeDeck}/${currentCard.imageName}.png`);
    }
  });

  // ── Deck toggle ───────────────────────────────────────
  function setDeck(deck) {
    activeDeck = deck;
    overlay.querySelectorAll(".ci-deck-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.deck === deck);
    });
    if (currentCard) renderDetailImage(currentCard);
    if (!ciDetailView.classList.contains("ci-active")) renderList();
  }
  overlay.querySelectorAll(".ci-deck-btn").forEach(btn => {
    btn.addEventListener("click", () => setDeck(btn.dataset.deck));
  });

  // ── Search ────────────────────────────────────────────
  ciSearch.addEventListener("input", () => {
    searchQuery = ciSearch.value;
    navList = buildFullNavList();
    renderList();
  });

  // ── Navigation ────────────────────────────────────────
  function goBack() {
    const saveBtn = overlay.querySelector("#ciSaveCard");
    if (saveBtn) saveBtn.style.display = "none";
    if (mode === "spread") {
      close();
    } else {
      currentCard = null;
      navIdx = 0;
      ciTitle.textContent = "Card Index";
      ciBack.style.display = "none";
      ciDetailView.classList.remove("ci-active");
      ciListView.classList.add("ci-active");
    }
  }

  ciBack.addEventListener("click", goBack);
  ciClose.addEventListener("click", close);

  // ── Open / close ──────────────────────────────────────
  // open() — full index from menu
  function open() {
    if (window.Journal) Journal.close();
    activeDeck = defaultDeck();
    mode = "full";
    searchQuery = "";
    ciSearch.value = "";
    navList = buildFullNavList();
    isOpen = true;
    overlay.classList.add("ci-open");
    currentCard = null;
    navIdx = 0;
    ciTitle.textContent = "Card Index";
    ciBack.style.display = "none";
    ciDetailView.classList.remove("ci-active");
    ciListView.classList.add("ci-active");
    renderList();
    document.body.style.overflow = "hidden";
  }

  // openSpread(filenameOrName) — spread view from description overlay
  function openSpread(filenameOrName) {
    activeDeck = defaultDeck();
    mode = "spread";
    navList = buildSpreadNavList();
    if (navList.length === 0) return;

    // Resolve filename format (TheFool) → display name (The Fool) for matching
    const resolved = CardData.fromFilename(filenameOrName) || filenameOrName;
    const startIdx = navList.findIndex(c => c.name === resolved);
    navIdx = startIdx >= 0 ? startIdx : 0;

    isOpen = true;
    overlay.classList.add("ci-open");
    ciTitle.textContent = "Your Spread";
    ciListView.classList.remove("ci-active");
    showDetailAtIdx(navIdx);
    document.body.style.overflow = "hidden";
  }

  function close() {
    isOpen = false;
    overlay.classList.remove("ci-open");
    closeLightbox();
    document.body.style.overflow = "";
  }

  return { open, openSpread, close, _showDetailAtIdx: showDetailAtIdx };
})();
