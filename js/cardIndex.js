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
  function defaultDeck() {
    // Index defaults to Rider-Waite for classic reference look
    return "RiderWaite";
  }
  let activeDeck  = defaultDeck(); // image deck for rendering
  let deckFilter  = "all";         // filter for list/detail
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
    <div class="ci-list-view" id="ciListView">
      <div class="ci-search-row">
        <input class="ci-search" id="ciSearch" type="search"
               placeholder="Search cards…" autocomplete="off" />
        <select class="ci-deck-select" id="ciDeckSelectList">
          <option value="all">All</option>
          <option value="Tarot">Tarot</option>
          <option value="Oracle">Oracle</option>
        </select>
      </div>
      <div class="ci-list" id="ciList"></div>
    </div>

    <div class="ci-detail-view" id="ciDetailView">
      <!-- Sticky top: deck select, image, name with prev/next flanking -->
      <div class="ci-detail-sticky">
        <div class="ci-card-img-wrap" id="ciImgWrap">
          <img class="ci-card-img" id="ciCardImg" src="" alt="" />
          <div class="ci-card-img-placeholder" id="ciCardImgPlaceholder"></div>
        </div>
        <div class="ci-detail-name-bar" id="ciDetailNameBar">
          <!-- name and prev/next inserted by renderDetailInfo -->
        </div>
      </div>
      <!-- Scrollable bottom: meta, meanings, lore -->
      <div class="ci-detail-scroll">
        <div class="ci-card-info" id="ciCardInfo"></div>
        <div class="ci-nav-dots" id="ciNavDots" style="display:none"></div>
      </div>
    </div>

    <!-- lightbox lives on body, mounted separately -->
    <div class="ci-bottom-bar">
      <button class="ci-bottom-btn" id="ciToJournal" title="Open Journal" data-tooltip="Open Journal">&#x270E;</button>
      <button class="ci-bottom-btn ci-save-btn" id="ciSaveCard" title="Save to Journal" data-tooltip="Save to Journal" style="display:none">&#x2B;</button>
      <button class="ci-bottom-deck-btn" id="ciDeckCycleBtn" title="Switch deck">
        <span id="ciDeckCycleName">Luminous</span>
      </button>
      <button class="ci-bottom-btn ci-nav-right" id="ciBackBtn" title="Back" data-tooltip="Back" style="display:none">&#x2190;</button>
      <button class="ci-bottom-btn ci-nav-right" id="ciCloseBtn" title="Close" data-tooltip="Close">&#x2715;</button>
    </div>
  `;

  document.body.appendChild(overlay);
  if (window.Tooltips) Tooltips.wire(overlay);

  // ── Canvas thumb generator — for decks without image files ───────────
  const _thumbCache = new Map(); // key: cardName+deck → dataURL

  function generateCanvasThumb(card) {
    const key = card.name + "|" + activeDeck;
    if (_thumbCache.has(key)) return _thumbCache.get(key);

    const TW = 60, TH = 90;
    const tc = document.createElement("canvas");
    tc.width = TW; tc.height = TH;
    const ctx = tc.getContext("2d");
    ctx.imageSmoothingEnabled = true;

    let drawn = false;

    // Gilded Minima
    if (window.GildedMinima && activeDeck === "Gilded") {
      const isMajor = card.section === "Major Arcana";
      let tempCard = null;
      if (isMajor) {
        const majorIdx = GildedMinima.MAJORS.findIndex(m => m.name === card.name);
        if (majorIdx >= 0) tempCard = { type:"gilded", isMajor:true, majorIdx, auraH: FX.hueA };
      } else {
        const suitMap = { Wands:0, Cups:1, Swords:2, Pentacles:3 };
        const parts = card.name.split(" of ");
        if (parts.length === 2) {
          const suitIdx = suitMap[parts[1]];
          const rankIdx = GildedMinima.MINOR_RANKS.indexOf(parts[0]);
          if (suitIdx !== undefined && rankIdx >= 0) {
            tempCard = { type:"gilded", isMajor:false,
              rank: GildedMinima.MINOR_RANKS[rankIdx], suitIdx, auraH: FX.hueA };
          }
        }
      }
      if (tempCard) {
        GildedMinima.draw(ctx, tempCard, TW/2, TH/2, TW*0.92, TH*0.94, 0, 0.48);
        drawn = true;
      }
    }

    // Playing Cards — draw via tarot draw system if available
    if (!drawn && activeDeck === "Playing" && window.draws !== undefined) {
      // Use a simple pip preview
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, TW, TH);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "bold 14px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = card.name.split(" of ")[0]?.slice(0, 3) || "?";
      ctx.fillText(label, TW/2, TH/2);
      drawn = true;
    }

    if (!drawn) return null;
    const url = tc.toDataURL();
    _thumbCache.set(key, url);
    return url;
  }

  function needsCanvasThumb(card) {
    // Playing has PNGs now — no canvas thumb needed for any deck
    return false;
  }

  // Lightbox lives on body — works from journal and index
  const lbEl = document.createElement("div");
  lbEl.id = "ciLightbox";
  lbEl.className = "ci-lightbox";
  lbEl.innerHTML = '<img class="ci-lightbox-img" id="ciLightboxImg" src="" alt="" />';
  document.body.appendChild(lbEl);

  // ── Refs ──────────────────────────────────────────────
  // Title shown in swipe hint / header removed — use ciSwipeHint instead
  const ciListView   = overlay.querySelector("#ciListView");
  const ciDetailView = overlay.querySelector("#ciDetailView");
  const ciList       = overlay.querySelector("#ciList");
  const ciSearch     = overlay.querySelector("#ciSearch");
  const ciCardImg    = overlay.querySelector("#ciCardImg");
  const ciImgWrap    = overlay.querySelector("#ciImgWrap");
  const ciCardImgPlaceholder = overlay.querySelector("#ciCardImgPlaceholder");
  const ciCardInfo   = overlay.querySelector("#ciCardInfo");
  const ciSwipeHint  = overlay.querySelector("#ciSwipeHint");
  const ciNavDots       = overlay.querySelector("#ciNavDots");
  const ciBottomCounter = overlay.querySelector("#ciBottomCounter");
  const ciDetailNameBar = overlay.querySelector("#ciDetailNameBar");
  const ciLightbox    = document.getElementById("ciLightbox");
  const ciLightboxImg = document.getElementById("ciLightboxImg");
  // Save card in bottom bar
  // Deck cycle button — tapping steps through all deck options
  // Decks organized by category
  const _tarotDecks  = [
    { val: "LuminousArc", label: "Luminous"   },
    { val: "RiderWaite",  label: "Rider-Waite"},
    { val: "Gilded",      label: "Gilded"     },
  ];
  const _oracleDecks = [
    { val: "Runes",   label: "Runes"   },
    { val: "Playing", label: "Playing" },
  ];
  const _deckCycle = [..._tarotDecks, ..._oracleDecks]; // for cycling
  const ciDeckCycleBtn  = overlay.querySelector("#ciDeckCycleBtn");
  const ciDeckCycleName = overlay.querySelector("#ciDeckCycleName");

  function syncDeckCycleLabel() {
    const entry = _deckCycle.find(d => d.val === activeDeck)
               || _deckCycle.find(d => d.val === deckFilter)
               || { label: "All" };
    if (ciDeckCycleName) ciDeckCycleName.textContent = entry.label;
  }

  ciDeckCycleBtn.addEventListener("click", () => {
    // Cycle within current category, or all if no category
    const isTarot  = deckFilter === "Tarot"  || _tarotDecks.some(d => d.val === deckFilter);
    const isOracle = deckFilter === "Oracle" || _oracleDecks.some(d => d.val === deckFilter);
    const pool = isTarot ? _tarotDecks : isOracle ? _oracleDecks : _deckCycle;
    const curIdx  = pool.findIndex(d => d.val === deckFilter || d.val === activeDeck);
    const nextIdx = (curIdx + 1) % pool.length;
    const next    = pool[nextIdx];
    deckFilter  = next.val;
    activeDeck  = next.val;
    overlay.querySelectorAll(".ci-deck-select").forEach(s => s.value =
      isTarot ? "Tarot" : isOracle ? "Oracle" : "all");
    _thumbCache?.clear(); // clear thumb cache on deck change
    navList = buildFullNavList();
    if (ciDetailView.classList.contains("ci-active") && currentCard) {
      renderDetailImage(currentCard);
    } else {
      renderList();
    }
    syncDeckCycleLabel();
  });

  // Bottom bar nav
  overlay.querySelector("#ciCloseBtn").addEventListener("click", () => close());
  overlay.querySelector("#ciBackBtn").addEventListener("click", () => goBack());
  overlay.querySelector("#ciToJournal").addEventListener("click", () => {
    close();
    if (window.Journal) Journal.open();
  });

  // Save button in bottom bar — only visible in detail view
  const ciSaveCard = overlay.querySelector("#ciSaveCard");
  ciSaveCard.addEventListener("click", () => {
    if (!currentCard?.imageName) return;
    if (window.Journal) Journal.saveCardToToday(currentCard.imageName);
    ciSaveCard.textContent = "⚷";
    ciSaveCard.style.color = "var(--auraColor)";
    setTimeout(() => { ciSaveCard.textContent = "+"; ciSaveCard.style.color = ""; }, 1500);
  });

  // ── Nav list builders ─────────────────────────────────
  function buildFullNavList() {
    const q = searchQuery.toLowerCase();
    return CardData.getAll().filter(card => {
      if (q && !card.name.toLowerCase().includes(q)) return false;
      if (deckFilter === "all")    return true;
      if (deckFilter === "Tarot")  return card.section !== "Runes";
      if (deckFilter === "Oracle") return card.section === "Runes"; // expand as oracle decks added
      // Specific deck selected via cycle button
      if (deckFilter === "Runes")  return card.section === "Runes";
      return card.section !== "Runes";
    });
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
          ? (getImgSrc(card) || "")
          : "";
        const needsCanvas = needsCanvasThumb(card);
        const revBadge = card.isReversedOrientation ? `<span class="ci-rev-badge">R</span>` : "";
        html += `
          <div class="ci-row" data-idx="${i}">
            <div class="ci-thumb-wrap">
              ${imgSrc && !needsCanvas
                ? `<img class="ci-thumb" src="${imgSrc}" alt="" loading="lazy" />`
                : needsCanvas
                  ? `<canvas class="ci-thumb ci-canvas-thumb" data-card="${card.name}" width="60" height="90"></canvas>`
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
            ? (getImgSrc(card) || "")
            : "";
          const needsCanvas = needsCanvasThumb(card);
          const idx = navList.indexOf(card);
          html += `
            <div class="ci-row" data-idx="${idx}">
              <div class="ci-thumb-wrap">
                ${imgSrc && !needsCanvas
                  ? `<img class="ci-thumb" src="${imgSrc}" alt="" loading="lazy" />`
                  : needsCanvas
                    ? `<canvas class="ci-thumb ci-canvas-thumb" data-card="${card.name}" width="60" height="90"></canvas>`
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

    // Lazy-render canvas thumbs via IntersectionObserver
    const canvasThumbs = ciList.querySelectorAll(".ci-canvas-thumb");
    if (canvasThumbs.length > 0) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const tc = entry.target;
          const card = CardData.getByNameOrFile(tc.dataset.card);
          if (!card) return;
          const url = generateCanvasThumb(card);
          if (url) {
            const img = document.createElement("img");
            img.src = url;
            img.className = "ci-thumb";
            img.alt = tc.dataset.card;
            tc.replaceWith(img);
          }
          obs.unobserve(tc);
        });
      }, { root: ciList, rootMargin: "60px" });
      canvasThumbs.forEach(tc => obs.observe(tc));
    }
  }

  // ── Detail view ───────────────────────────────────────
  function showDetailAtIdx(idx) {
    const saveBtn = overlay.querySelector("#ciSaveCard");
    if (saveBtn) saveBtn.style.display = "flex";
    navIdx = Math.max(0, Math.min(navList.length - 1, idx));
    const card = navList[navIdx];
    if (!card) return;
    currentCard = card;

    // title in bottom hint
    const _backBtn = overlay.querySelector("#ciBackBtn");
    if (_backBtn) _backBtn.style.display = "flex";
    ciListView.classList.remove("ci-active");
    ciDetailView.classList.add("ci-active");

    renderDetailImage(card);
    renderDetailInfo(card);
    renderNavDots();
    updateSwipeHint();
    // Scroll both zones to top after paint
    requestAnimationFrame(() => {
      ciDetailView.scrollTop = 0;
      const scrollZone = ciDetailView.querySelector(".ci-detail-scroll");
      if (scrollZone) scrollZone.scrollTop = 0;
    });
  }

  // Suit letter map for playing card filenames (A♠→AS, 2♥→2H etc.)
  const SUIT_LETTER = { "♠":"S","♥":"H","♦":"D","♣":"C" };

  function getImgSrc(card) {
    if (activeDeck === "Playing") {
      // Playing cards: map from Minor Arcana name to rank+suitLetter
      // e.g. "Ace of Swords" → "AceS", "Two of Cups" → "2H"
      const suitToSymbol = { Swords:"♠", Cups:"♥", Pentacles:"♦", Wands:"♣" };
      const rankMap = { Ace:"A", Two:"2", Three:"3", Four:"4", Five:"5",
        Six:"6", Seven:"7", Eight:"8", Nine:"9", Ten:"10",
        Page:"J", Knight:"Q", Queen:"K", King:"A" }; // note: simplified
      // Better: use numeric rank directly
      const rankNum = { Ace:"A", Two:"2", Three:"3", Four:"4", Five:"5",
        Six:"6", Seven:"7", Eight:"8", Nine:"9", Ten:"10",
        Page:"J", Knight:"Q", Queen:"K", King:"K" };
      const parts = card.name.split(" of ");
      if (parts.length === 2) {
        const r = rankNum[parts[0]] || parts[0];
        const sym = suitToSymbol[parts[1]];
        const sl  = SUIT_LETTER[sym] || "";
        return `./decks/Playing/${r}${sl}.png`;
      }
      return null;
    }
    if (activeDeck === "Gilded") {
      if (!card.imageName) return null;
      return `./decks/GildedMinima/${card.imageName}.png`;
    }
    if (!card.imageName) return null;
    return card.section === "Runes"
      ? `./decks/Runes/${card.imageName}.png`
      : `./decks/${activeDeck}/${card.imageName}.png`;
  }

  function renderDetailImage(card) {
    const src = getImgSrc(card);
    ciCardImgPlaceholder.innerHTML = "";
    if (src) {
      ciCardImg.src = src;
      ciCardImg.alt = card.name;
      ciCardImg.style.display = "block";
      ciCardImgPlaceholder.style.display = "none";
      ciCardImg.classList.toggle("ci-rune-img", card.section === "Runes");
    } else if (card.section === "Runes") {
      ciCardImg.style.display = "none";
      ciCardImgPlaceholder.style.display = "flex";
      ciCardImgPlaceholder.textContent = runeGlyph(card.name);
    } else {
      // Gilded / Playing — render live canvas preview
      ciCardImg.style.display = "none";
      ciCardImgPlaceholder.style.display = "flex";
      const PW = 180, PH = 270;
      const previewCanvas = document.createElement("canvas");
      previewCanvas.width  = PW;
      previewCanvas.height = PH;
      previewCanvas.style.cssText = "border-radius:10px;box-shadow:0 0 24px var(--auraColor);display:block;";
      const pCtx = previewCanvas.getContext("2d");
      pCtx.imageSmoothingEnabled = true;

      let drawn = false;
      if (window.GildedMinima && card.imageName === undefined) {
        const isMajor = card.section === "Major Arcana";
        let tempCard = null;
        if (isMajor) {
          const majorIdx = GildedMinima.MAJORS.findIndex(m => m.name === card.name);
          if (majorIdx >= 0) tempCard = { type:"gilded", x:PW/2, y:PH/2,
            isMajor:true, majorIdx, rot:0, auraH: FX.hueA };
        } else {
          const suitMap = { Wands:0, Cups:1, Swords:2, Pentacles:3 };
          const parts = card.name.split(" of ");
          if (parts.length === 2) {
            const rankStr = parts[0], suitStr = parts[1];
            const suitIdx = suitMap[suitStr];
            const rankIdx = GildedMinima.MINOR_RANKS.indexOf(rankStr);
            if (suitIdx !== undefined && rankIdx >= 0) {
              tempCard = { type:"gilded", x:PW/2, y:PH/2,
                isMajor:false, rank:GildedMinima.MINOR_RANKS[rankIdx],
                suitIdx, rot:0, auraH: FX.hueA };
            }
          }
        }
        if (tempCard) {
          const s = 1.4;
          GildedMinima.draw(pCtx, tempCard, PW/2, PH/2, PW*0.88, PH*0.94, 0, s);
          drawn = true;
        }
      }
      if (drawn) {
        ciCardImgPlaceholder.appendChild(previewCanvas);
      } else {
        ciCardImgPlaceholder.textContent = card.name.slice(0, 2).toUpperCase();
      }
    }
  }

  function renderDetailInfo(card) {
    const inSpread      = mode === "spread";
    const isReversed    = !!card.isReversedOrientation;
    const uprightClass  = inSpread ? (isReversed ? "" : "ci-meaning-active") : "";
    const reversedClass = inSpread ? (isReversed ? "ci-meaning-active" : "") : "";
    const revBadge      = (inSpread && isReversed)
      ? ' <span class="ci-rev-badge">Reversed</span>' : "";

    // Get extended lore
    const lore = card.section === "Runes"
      ? (window.CardLore ? CardLore.getRune(card.name) : null)
      : (window.CardLore ? CardLore.getTarot(card.name) : null);

    let loreHTML = "";
    if (lore) {
      if (card.section === "Runes") {
        loreHTML =
          '<div class="ci-content-panel ci-lore-block">' +
            '<div class="ci-lore-label">&#x26F5; Elder Meaning</div>' +
            '<div class="ci-lore-text">' + lore.elderMeaning + '</div>' +
          '</div>' +
          '<div class="ci-content-panel ci-lore-block">' +
            '<div class="ci-lore-label">&#x2467; In a Cast</div>' +
            '<div class="ci-lore-text">' + lore.inCast + '</div>' +
          '</div>' +
          '<div class="ci-content-panel ci-lore-block">' +
            '<div class="ci-lore-label">&#x2442; Phoneme</div>' +
            '<div class="ci-lore-text">' + lore.phoneme + '</div>' +
          '</div>' +
          '<div class="ci-lore-affirmation">&ldquo;' + lore.affirmation + '&rdquo;</div>';
      } else {
        loreHTML =
          '<div class="ci-content-panel ci-lore-block">' +
            '<div class="ci-lore-label">&#x2726; Theme</div>' +
            '<div class="ci-lore-text ci-lore-theme">' + lore.theme + '</div>' +
          '</div>' +
          '<div class="ci-content-panel ci-lore-block">' +
            '<div class="ci-lore-label">&#x25CE; In a Reading</div>' +
            '<div class="ci-lore-text">' + lore.inReading + '</div>' +
          '</div>' +
          '<div class="ci-content-panel ci-lore-block">' +
            '<div class="ci-lore-label">&#x25B3; Shadow</div>' +
            '<div class="ci-lore-text">' + lore.shadow + '</div>' +
          '</div>' +
          '<div class="ci-content-panel ci-lore-block">' +
            '<div class="ci-lore-label">&#x25C7; Symbol</div>' +
            '<div class="ci-lore-text">' + lore.symbol + '</div>' +
          '</div>' +
          '<div class="ci-lore-affirmation">&ldquo;' + lore.affirmation + '&rdquo;</div>';
      }
    }

    // Card name goes in the sticky bar (always visible above scroll)
    if (ciDetailNameBar) {
      ciDetailNameBar.innerHTML = '<div class="ci-detail-name">' + card.name + revBadge + '</div>';
    }

    // Keywords rendered as plain comma-separated text — no badge spans
    function makeChips(str) {
      return str.split(",").map(k => k.trim()).filter(Boolean)
        .map(k => k.replace(/^./, m => m.toUpperCase()))
        .join(", ");
    }

    ciCardInfo.innerHTML =
      '<div class="ci-detail-meta-row" style="padding-top:4px">' +
        '<span class="ci-meta-pill" title="' + card.element + '">' + (ELEMENT_GLYPH[card.element]||"") + '<span class="ci-pill-text"> ' + card.element + '</span></span>' +
        '<span class="ci-meta-pill" title="' + card.astro + '">' + astroGlyph(card.astro) + '<span class="ci-pill-text"> ' + card.astro + '</span></span>' +
        '<span class="ci-meta-pill" title="' + card.number + '">' + (card.number || "") + '</span>' +
      '</div>' +
      (card.numNote ? '<div class="ci-numerology">' + card.number + " — " + card.numNote + '</div>' : "") +
      '<div class="ci-content-panel ci-meaning-block ' + uprightClass + '">' +
        '<div class="ci-meaning-label">&#x2726; Upright</div>' +
        '<div class="ci-keyword-chips">' + makeChips(card.upright) + '</div>' +
      '</div>' +
      '<div class="ci-content-panel ci-meaning-block ci-reversed-block ' + reversedClass + '">' +
        '<div class="ci-meaning-label" style="color:rgba(200,100,100,0.85)">&#x25BD; Reversed</div>' +
        '<div class="ci-keyword-chips">' + makeChips(card.reversed) + '</div>' +
      '</div>' +
      loreHTML;
  }

  function renderNavDots() {
    // Counter now lives in the swipe hint row — updateSwipeHint handles it
  }

  function updateSwipeHint() {
    if (!ciDetailNameBar) return;
    const total    = navList.length;
    const prevName = navIdx > 0 ? navList[navIdx - 1].name : "";
    const nextName = navIdx < navList.length - 1 ? navList[navIdx + 1].name : "";
    const nameEl   = ciDetailNameBar.querySelector(".ci-detail-name");
    const nameTxt  = nameEl ? nameEl.outerHTML : "";
    const counter  = total > 1 ? `<span class="ci-hint-count">${navIdx + 1} / ${total}</span>` : "";
    // Get current card astro symbol for ornament
    const card = navList[navIdx];
    const ornGlyph = card ? (astroGlyph(card.astro) || "✦") : "✦";
    const prevIdx = navIdx - 1;
    const nextIdx = navIdx + 1;
    ciDetailNameBar.innerHTML =
      nameTxt +
      '<div class="ci-hint-row">' +
        (prevName
          ? `<button class="ci-prev-hint ci-hint-btn" data-idx="${prevIdx}">← ${prevName}</button>`
          : '<span class="ci-prev-hint"></span>') +
        counter +
        (nextName
          ? `<button class="ci-next-hint ci-hint-btn" data-idx="${nextIdx}">${nextName} →</button>`
          : '<span class="ci-next-hint"></span>') +
      "</div>";

    // Wire hint buttons to navigate
    ciDetailNameBar.querySelectorAll(".ci-hint-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        showDetailAtIdx(parseInt(btn.dataset.idx));
      });
    });
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

  // Prevent save-image callout on long press
  ciCardImg.addEventListener("contextmenu", e => e.preventDefault());
  ciCardImg.draggable = false;
  ciLightboxImg.addEventListener("contextmenu", e => e.preventDefault());
  ciLightboxImg.draggable = false;

  function tryOpenLightbox() {
    if (currentCard?.imageName) {
      openLightbox(getImgSrc(currentCard));
    }
  }
  // Use both click and touchend — Android WebView needs touchend
  let _imgTouchMoved = false;
  ciImgWrap.addEventListener("touchstart", () => { _imgTouchMoved = false; }, { passive: true });
  ciImgWrap.addEventListener("touchmove",  () => { _imgTouchMoved = true;  }, { passive: true });
  ciImgWrap.addEventListener("touchend",   (e) => {
    if (!_imgTouchMoved && isOpen) { e.preventDefault(); tryOpenLightbox(); }
  });
  ciImgWrap.addEventListener("click", () => { if (isOpen) tryOpenLightbox(); });

  // ── Deck toggle ───────────────────────────────────────

  // Wire deck dropdowns
  function onDeckSelectChange(sel) {
    const val = sel.value;
    overlay.querySelectorAll(".ci-deck-select").forEach(s => s.value = val);
    deckFilter = val;
    if (window.App) { App.indexDeckFilter = val; if (window.saveSettings) saveSettings(); }
    // activeDeck — maps category/deck to image folder
    if (val === "RiderWaite" || val === "Tarot") activeDeck = "RiderWaite";
    else if (val === "Runes"  || val === "Oracle") activeDeck = "Runes";
    else if (val === "Gilded")  activeDeck = "Gilded";
    else if (val === "Playing") activeDeck = "Playing";
    else activeDeck = defaultDeck();
    navList = buildFullNavList();
    if (ciDetailView.classList.contains("ci-active") && currentCard) {
      renderDetailImage(currentCard);
    } else {
      renderList();
    }
  }
  overlay.querySelectorAll(".ci-deck-select").forEach(sel => {
    sel.addEventListener("change", () => onDeckSelectChange(sel));
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
      // no header
      const _backBtn2 = overlay.querySelector("#ciBackBtn"); if (_backBtn2) _backBtn2.style.display = "none";
      ciDetailView.classList.remove("ci-active");
      ciListView.classList.add("ci-active");
    }
  }



  // ── Open / close ──────────────────────────────────────
  // open() — full index from menu
  function open() {
    if (window.Journal) Journal.close();
    // Restore saved deck filter preference
    deckFilter = (window.App && App.indexDeckFilter) ? App.indexDeckFilter : "all";
    if (deckFilter === "RiderWaite") activeDeck = "RiderWaite";
    else if (deckFilter === "Runes") activeDeck = "Runes";
    else activeDeck = defaultDeck();
    if (window.Tooltips) Tooltips.wire(overlay);
    overlay.querySelectorAll(".ci-deck-select").forEach(s => s.value = deckFilter);
    if (typeof syncDeckCycleLabel === "function") syncDeckCycleLabel();
    mode = "full";
    searchQuery = "";
    ciSearch.value = "";
    navList = buildFullNavList();
    isOpen = true;
    overlay.classList.add("ci-open");
    currentCard = null;
    navIdx = 0;
    // no header
    const _backBtn2 = overlay.querySelector("#ciBackBtn"); if (_backBtn2) _backBtn2.style.display = "none";
    ciDetailView.classList.remove("ci-active");
    ciListView.classList.add("ci-active");
    renderList();
    document.body.style.overflow = "hidden";
  }

  // openSpread(filenameOrName) — spread view from description overlay
  function openSpread(filenameOrName) {
    activeDeck = defaultDeck();
    deckFilter = "all";
    mode = "spread";
    navList = buildSpreadNavList();
    if (navList.length === 0) return;

    // Resolve filename format (TheFool) → display name (The Fool) for matching
    const resolved = CardData.fromFilename(filenameOrName) || filenameOrName;
    const startIdx = navList.findIndex(c => c.name === resolved);
    navIdx = startIdx >= 0 ? startIdx : 0;

    isOpen = true;
    overlay.classList.add("ci-open");
    // no header
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

  return {
    open, openSpread, close,
    _showDetailAtIdx: showDetailAtIdx,
    _openLightbox: openLightbox,
  };
})();
