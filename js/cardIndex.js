/*********************************************************
 * CARD INDEX
 * Full-screen panel, opened from the menu.
 * List view: sections with card rows (thumbnail + name)
 * Detail view: image, name, element/astro/number row,
 *              upright + reversed meanings, numNote
 * Deck selector: Luminous Arc / Rider-Waite (image decks only)
 * Runes show a drawn glyph since there's no image deck for them.
 *********************************************************/
window.CardIndex = (() => {

  // ── State ───────────────────────────────────────────────
  let activeDeck   = "LuminousArc"; // or "RiderWaite"
  let currentCard  = null;
  let searchQuery  = "";
  let isOpen       = false;

  // ── Element glyphs ──────────────────────────────────────
  const ELEMENT_GLYPH = { Fire:"🔥", Water:"💧", Air:"💨", Earth:"🌿" };
  const ASTRO_GLYPH   = {
    Aries:"♈", Taurus:"♉", Gemini:"♊", Cancer:"♋", Leo:"♌", Virgo:"♍",
    Libra:"♎", Scorpio:"♏", Sagittarius:"♐", Capricorn:"♑", Aquarius:"♒", Pisces:"♓",
    Sun:"☀️", Moon:"🌙", Mercury:"☿", Venus:"♀", Mars:"♂", Jupiter:"♃",
    Saturn:"♄", Uranus:"♅", Neptune:"♆", Pluto:"♇",
  };

  function astroGlyph(astro) {
    // May be compound e.g. "Aries / Leo / Sagittarius"
    return astro.split(" / ").map(a => ASTRO_GLYPH[a.trim()] || a).join(" ");
  }

  // ── Build DOM ───────────────────────────────────────────
  const overlay = document.createElement("div");
  overlay.id = "cardIndexOverlay";
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "Card Index");

  overlay.innerHTML = `
    <div class="ci-header">
      <button class="ci-back" id="ciBack" aria-label="Back to list">←</button>
      <span class="ci-title" id="ciTitle">Card Index</span>
      <button class="ci-close" id="ciClose" aria-label="Close index">✕</button>
    </div>

    <div class="ci-list-view" id="ciListView">
      <div class="ci-search-row">
        <input class="ci-search" id="ciSearch" type="search"
               placeholder="Search cards…" autocomplete="off" />
        <div class="ci-deck-toggle" id="ciDeckToggle">
          <button class="ci-deck-btn active" data-deck="LuminousArc">Luminous</button>
          <button class="ci-deck-btn" data-deck="RiderWaite">Rider-Waite</button>
        </div>
      </div>
      <div class="ci-list" id="ciList"></div>
    </div>

    <div class="ci-detail-view" id="ciDetailView">
      <div class="ci-deck-toggle ci-detail-deck" id="ciDetailDeck">
        <button class="ci-deck-btn active" data-deck="LuminousArc">Luminous</button>
        <button class="ci-deck-btn" data-deck="RiderWaite">Rider-Waite</button>
      </div>
      <div class="ci-card-img-wrap">
        <img class="ci-card-img" id="ciCardImg" src="" alt="" />
        <div class="ci-card-img-placeholder" id="ciCardImgPlaceholder"></div>
      </div>
      <div class="ci-card-info" id="ciCardInfo"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  // ── Refs ────────────────────────────────────────────────
  const ciBack        = overlay.querySelector("#ciBack");
  const ciClose       = overlay.querySelector("#ciClose");
  const ciTitle       = overlay.querySelector("#ciTitle");
  const ciListView    = overlay.querySelector("#ciListView");
  const ciDetailView  = overlay.querySelector("#ciDetailView");
  const ciList        = overlay.querySelector("#ciList");
  const ciSearch      = overlay.querySelector("#ciSearch");
  const ciCardImg     = overlay.querySelector("#ciCardImg");
  const ciCardImgPlaceholder = overlay.querySelector("#ciCardImgPlaceholder");
  const ciCardInfo    = overlay.querySelector("#ciCardInfo");

  // ── Render list ─────────────────────────────────────────
  function renderList() {
    const q      = searchQuery.toLowerCase();
    const cards  = CardData.getAll();
    const groups = {};

    cards.forEach(card => {
      if (q && !card.name.toLowerCase().includes(q)) return;
      if (!groups[card.section]) groups[card.section] = [];
      groups[card.section].push(card);
    });

    const sectionOrder = [
      "Major Arcana","Wands","Cups","Swords","Pentacles","Runes"
    ];

    let html = "";
    sectionOrder.forEach(sec => {
      if (!groups[sec]) return;
      html += `<div class="ci-section-header">${sec}</div>`;
      groups[sec].forEach(card => {
        const imgSrc = card.imageName
          ? `./${activeDeck}/${card.imageName}.png`
          : "";
        html += `
          <div class="ci-row" data-name="${card.name}">
            <div class="ci-thumb-wrap">
              ${imgSrc
                ? `<img class="ci-thumb" src="${imgSrc}" alt="" loading="lazy" />`
                : `<div class="ci-thumb-glyph">${runeGlyph(card.name)}</div>`
              }
            </div>
            <div class="ci-row-info">
              <span class="ci-row-name">${card.name}</span>
              <span class="ci-row-meta">${ELEMENT_GLYPH[card.element] || ""} ${card.element} · ${card.astro}</span>
            </div>
          </div>`;
      });
    });

    ciList.innerHTML = html || `<div class="ci-empty">No cards match "${searchQuery}"</div>`;

    ciList.querySelectorAll(".ci-row").forEach(row => {
      row.addEventListener("click", () => showDetail(row.dataset.name));
    });
  }

  // ── Rune glyphs (drawn as text) ─────────────────────────
  const RUNE_GLYPHS = {
    Fehu:"ᚠ",Uruz:"ᚢ",Thurisaz:"ᚦ",Ansuz:"ᚨ",Raidho:"ᚱ",Kenaz:"ᚲ",
    Gebo:"ᚷ",Wunjo:"ᚹ",Hagalaz:"ᚺ",Nauthiz:"ᚾ",Isa:"ᛁ",Jera:"ᛃ",
    Eihwaz:"ᛇ",Perthro:"ᛈ",Algiz:"ᛉ",Sowilo:"ᛊ",Tiwaz:"ᛏ",Berkano:"ᛒ",
    Ehwaz:"ᛖ",Mannaz:"ᛗ",Laguz:"ᛚ",Ingwaz:"ᛜ",Dagaz:"ᛞ",Othala:"ᛟ",
  };
  function runeGlyph(name) { return RUNE_GLYPHS[name] || "?"; }

  // ── Render detail ────────────────────────────────────────
  function showDetail(name) {
    const card = CardData.get(name);
    if (!card) return;
    currentCard = card;

    ciTitle.textContent = card.name;
    ciBack.style.display = "flex";
    ciListView.classList.remove("ci-active");
    ciDetailView.classList.add("ci-active");

    renderDetailImage(card);
    renderDetailInfo(card);
  }

  function renderDetailImage(card) {
    if (card.imageName) {
      ciCardImg.src = `./${activeDeck}/${card.imageName}.png`;
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
    ciCardInfo.innerHTML = `
      <div class="ci-detail-name">${card.name}</div>
      <div class="ci-detail-meta-row">
        <span class="ci-meta-pill">${ELEMENT_GLYPH[card.element] || ""} ${card.element}</span>
        <span class="ci-meta-pill">${astroGlyph(card.astro)} ${card.astro}</span>
        <span class="ci-meta-pill"># ${card.number}</span>
      </div>
      ${card.numNote ? `<div class="ci-numerology">${card.number} — ${card.numNote}</div>` : ""}
      <div class="ci-meaning-block">
        <div class="ci-meaning-label">Upright</div>
        <div class="ci-meaning-text">${card.upright}</div>
      </div>
      <div class="ci-meaning-block ci-reversed">
        <div class="ci-meaning-label">Reversed</div>
        <div class="ci-meaning-text">${card.reversed}</div>
      </div>
    `;
  }

  // ── Deck toggle ─────────────────────────────────────────
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

  // ── Search ───────────────────────────────────────────────
  ciSearch.addEventListener("input", () => {
    searchQuery = ciSearch.value;
    renderList();
  });

  // ── Navigation ───────────────────────────────────────────
  function showList() {
    currentCard = null;
    ciTitle.textContent = "Card Index";
    ciBack.style.display = "none";
    ciDetailView.classList.remove("ci-active");
    ciListView.classList.add("ci-active");
  }

  ciBack.addEventListener("click", showList);
  ciClose.addEventListener("click", close);

  // Close on backdrop tap (outside the panel)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  // ── Open / close ─────────────────────────────────────────
  function open() {
    isOpen = true;
    overlay.classList.add("ci-open");
    showList();
    renderList();
    document.body.style.overflow = "hidden";
  }

  function close() {
    isOpen = false;
    overlay.classList.remove("ci-open");
    document.body.style.overflow = "";
    if (window.closeMenu) closeMenu();
  }

  // ── Keyboard ─────────────────────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") {
      if (currentCard) showList();
      else close();
    }
  });

  return { open, close };
})();
