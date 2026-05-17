/*********************************************************
 * JOURNAL
 * Full-screen panel in the same visual language as CardIndex.
 * 
 * Views:
 *   calendar — monthly grid, GitHub-style aura shading
 *   day      — textarea + word count + saved card strip
 *
 * Storage: one localStorage key per day
 *   arcana_journal_YYYY-MM-DD → { text, wordCount, cards[], updatedAt }
 *
 * Cards are saved to TODAY always (not the viewed day).
 * Navigating to a past day is read/write for text,
 * but "Save to Journal" always targets today.
 *********************************************************/
window.Journal = (() => {
  // Radial menu state — module level so close() can access it
  let _radialThumb = null;
  let _radialEl    = null;

  function closeRadial() {
    if (_radialEl)    { _radialEl.remove(); _radialEl = null; }
    if (_radialThumb) { _radialThumb.classList.remove("jo-thumb-selected"); _radialThumb = null; }
  }

  const STORAGE_PREFIX = "arcana_journal_";
  const WORD_TARGET    = 1000;
  const SHADE_STEPS    = [0, 1, 200, 400, 600, 800, 1000]; // word thresholds

  // ── State ─────────────────────────────────────────────
  let isOpen      = false;
  let currentDay  = todayKey();
  let calYear     = new Date().getFullYear();
  let calMonth    = new Date().getMonth(); // 0-indexed
  let saveTimer   = null;

  // ── Storage helpers ───────────────────────────────────
  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function getEntry(dateKey) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + dateKey);
      return raw ? JSON.parse(raw) : { text: "", wordCount: 0, cards: [], updatedAt: null };
    } catch { return { text: "", wordCount: 0, cards: [], updatedAt: null }; }
  }

  function saveEntry(dateKey, entry) {
    try {
      localStorage.setItem(STORAGE_PREFIX + dateKey, JSON.stringify(entry));
    } catch(e) { console.warn("Journal save failed:", e); }
  }

  function countWords(text) {
    return text.trim().match(/\S+/g)?.length || 0;
  }

  // Returns all stored journal date keys, sorted descending
  function allKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keys.push(k.replace(STORAGE_PREFIX, ""));
      }
    }
    return keys.sort((a, b) => b.localeCompare(a));
  }

  // ── DOM ───────────────────────────────────────────────
  const overlay = document.createElement("div");
  overlay.id = "journalOverlay";
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "Journal");

  overlay.innerHTML = `
    <div class="jo-day-view jo-active" id="joDayView">
      <!-- Mini popup calendar -->
      <div class="jo-mini-cal" id="joMiniCal">
        <div class="jo-mini-cal-nav">
          <button class="jo-cal-arrow" id="joMiniPrev">&#x2039;</button>
          <span class="jo-mini-cal-month" id="joMiniMonth"></span>
          <button class="jo-cal-arrow" id="joMiniNext">&#x203a;</button>
        </div>
        <div class="jo-mini-cal-grid" id="joMiniGrid"></div>
      </div>

      <div class="jo-day-header">
        <div class="jo-day-date" id="joDayDate"></div>
        <div class="jo-word-meta">
          <span id="joWordCount">0</span> / ${WORD_TARGET}
          <span class="jo-muted" id="joRemaining"></span>
        </div>
      </div>
      <div class="jo-progress-bar"><div class="jo-progress-fill" id="joProgressFill"></div></div>
      <div class="jo-cards-strip" id="joCardsStrip"></div>
      <div class="jo-paper-wrap">
        <textarea class="jo-paper" id="joPaper" placeholder="Write freely\u2026"></textarea>
      </div>
    </div>

    <div class="jo-bottom-bar">
      <button class="jo-bottom-btn" id="joToIndex"    title="Card Index"   data-tooltip="Card Index">&#x26B7;</button>
      <button class="jo-bottom-btn" id="joCalJumpBtn" title="Jump to date" data-tooltip="Jump to Date">&#x25A6;</button>
      <button class="jo-bottom-btn jo-close-right" id="joClose" title="Close" data-tooltip="Close">&#x2715;</button>
    </div>
  `;

  document.body.appendChild(overlay);
  if (window.Tooltips) Tooltips.wire(overlay);

  // ── Refs ──────────────────────────────────────────────
  const joClose       = overlay.querySelector("#joClose");
  const joDayView     = overlay.querySelector("#joDayView");
  const joDayDate     = overlay.querySelector("#joDayDate");
  const joWordCount   = overlay.querySelector("#joWordCount");
  const joRemaining   = overlay.querySelector("#joRemaining");
  const joProgressFill= overlay.querySelector("#joProgressFill");
  const joCardsStrip  = overlay.querySelector("#joCardsStrip");
  const joPaper       = overlay.querySelector("#joPaper");
  const joCalJumpBtn  = overlay.querySelector("#joCalJumpBtn");
  const joMiniCal     = overlay.querySelector("#joMiniCal");
  const joMiniMonth   = overlay.querySelector("#joMiniMonth");
  const joMiniGrid    = overlay.querySelector("#joMiniGrid");
  const joMiniPrev    = overlay.querySelector("#joMiniPrev");
  const joMiniNext    = overlay.querySelector("#joMiniNext");
  const joToIndex     = overlay.querySelector("#joToIndex");
  joToIndex.addEventListener("click", () => {
    close();
    if (window.CardIndex) CardIndex.open();
  });

    // ── Mini popup calendar ─────────────────────────────────────────────
  let miniCalYear  = new Date().getFullYear();
  let miniCalMonth = new Date().getMonth();

  function renderMiniCal() {
    joMiniMonth.textContent = MONTH_NAMES[miniCalMonth] + " " + miniCalYear;
    const today    = todayKey();
    const firstDay = new Date(miniCalYear, miniCalMonth, 1).getDay();
    const days     = new Date(miniCalYear, miniCalMonth + 1, 0).getDate();
    let html = DAY_NAMES.map(d => `<div class="jo-mini-day-name">${d}</div>`).join("");
    for (let i = 0; i < firstDay; i++) html += `<div class="jo-mini-empty"></div>`;
    for (let d = 1; d <= days; d++) {
      const key = miniCalYear + "-" + String(miniCalMonth+1).padStart(2,"0") + "-" + String(d).padStart(2,"0");
      const isToday   = key === today;
      const isCurrent = key === currentDay;
      const isFuture  = key > today;
      const entry     = getEntry(key);
      const shade     = shadeForWords(entry.wordCount || 0);
      html += `<div class="jo-mini-cell jo-shade-${shade}${isToday?" jo-today":""}${isCurrent?" jo-mini-current":""}${isFuture?" jo-future":""}" data-date="${key}">${d}</div>`;
    }
    joMiniGrid.innerHTML = html;
    joMiniGrid.querySelectorAll(".jo-mini-cell[data-date]").forEach(cell => {
      if (cell.classList.contains("jo-future")) return;
      cell.addEventListener("click", () => {
        closeMiniCal();
        openDay(cell.dataset.date);
      });
    });
  }

  function openMiniCal() {
    miniCalYear  = new Date(currentDay).getFullYear();
    miniCalMonth = new Date(currentDay + "T00:00:00").getMonth();
    renderMiniCal();
    joMiniCal.classList.add("visible");
  }
  function closeMiniCal() { joMiniCal.classList.remove("visible"); }

  joCalJumpBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    joMiniCal.classList.contains("visible") ? closeMiniCal() : openMiniCal();
  });
  joMiniPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    miniCalMonth--;
    if (miniCalMonth < 0) { miniCalMonth = 11; miniCalYear--; }
    renderMiniCal();
  });
  joMiniNext.addEventListener("click", (e) => {
    e.stopPropagation();
    miniCalMonth++;
    if (miniCalMonth > 11) { miniCalMonth = 0; miniCalYear++; }
    renderMiniCal();
  });
  // Close mini cal on outside tap
  overlay.addEventListener("click", () => closeMiniCal());

  // ── Calendar helpers ──────────────────────────────────
  const MONTH_NAMES = ["January","February","March","April","May","June",
                       "July","August","September","October","November","December"];
  const DAY_NAMES   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  function shadeForWords(words) {
    if (words <= 0)    return 0;
    if (words < 200)   return 1;
    if (words < 400)   return 2;
    if (words < 600)   return 3;
    if (words < 800)   return 4;
    if (words < 1000)  return 5;
    return 6;
  }



  // ── Day view ──────────────────────────────────────────
  function openDay(dateKey) {
    currentDay = dateKey;
    const entry = getEntry(dateKey);
    const isToday = dateKey === todayKey();

    joDayView.classList.add("jo-active");

    // Format date nicely
    const [y, m, d] = dateKey.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    joDayDate.textContent = date.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    }) + (isToday ? " · Today" : "");

    joPaper.value = entry.text || "";
    updateWordCount(entry.text || "");
    renderCardsStrip(entry.cards || []);

    // User taps textarea to type — no auto-focus
  }

  function updateWordCount(text) {
    const words = countWords(text);
    const pct   = Math.min(100, (words / WORD_TARGET) * 100);
    joWordCount.textContent = words;
    joRemaining.textContent = words >= WORD_TARGET
      ? "· Goal reached ✦"
      : `· ${WORD_TARGET - words} to go`;
    joProgressFill.style.width = pct + "%";
  }

  // Card entries: legacy string OR {filename, reversed}
  function cardEntry(c) {
    return typeof c === "string" ? { filename: c, reversed: false } : c;
  }

  function updateHeaderHeight() {
    const header = overlay.querySelector(".jo-day-header");
    if (header) {
      const h = header.getBoundingClientRect().height;
      overlay.style.setProperty("--jo-header-h", Math.round(h) + "px");
    }
  }

  function renderCardsStrip(cards) {
    if (!cards || cards.length === 0) {
      joCardsStrip.innerHTML = `<div class="jo-cards-empty">No cards saved to this entry yet.</div>`;
      return;
    }
    joCardsStrip.classList.toggle("scrollable", cards.length > 5);
    // Update after render so header height is accurate
    requestAnimationFrame(updateHeaderHeight);
    joCardsStrip.innerHTML = cards.map((raw, i) => {
      const { filename, reversed } = cardEntry(raw);
      const card = CardData.getByNameOrFile(filename);
      const deckFolder = (card?.section === "Runes") ? "Runes"
        : (window.App?.activeDeck === "riderwaite" ? "RiderWaite" : "LuminousArc");
      const imgSrc = card?.imageName ? `./${deckFolder}/${card.imageName}.png` : "";
      const displayName = card?.name || filename;
      const revClass = reversed ? " jo-thumb-reversed" : "";
      return `<div class="jo-card-thumb${revClass}" data-filename="${filename}" data-idx="${i}" data-reversed="${reversed ? '1' : '0'}" title="${displayName}">
        ${imgSrc
          ? `<img src="${imgSrc}" alt="${displayName}" loading="lazy" />`
          : `<div class="jo-card-glyph">${filename.slice(0,2)}</div>`}
      </div>`;
    }).join("");

    // Prevent browser image context menu (copy/download) on long press
    joCardsStrip.querySelectorAll("img").forEach(img => {
      img.addEventListener("contextmenu", e => e.preventDefault());
      img.draggable = false;
    });

    // ── Radial menu — fans below strip, hovers over journal entry ───────

    function openRadial(thumb) {
      closeRadial();
      _radialThumb = thumb;
      thumb.classList.add("jo-thumb-selected");

      const idx      = parseInt(thumb.dataset.idx);
      const filename = thumb.dataset.filename;
      const reversed = thumb.dataset.reversed === "1";
      const rect       = thumb.getBoundingClientRect();
      const totalCards = joCardsStrip.querySelectorAll(".jo-card-thumb").length;
      const isFirst    = idx === 0;
      const isLast     = idx === totalCards - 1;
      const cx = isFirst ? rect.right  - 8
               : isLast  ? rect.left   + 8
               : rect.left + rect.width / 2;
      const cy = isFirst || isLast
               ? rect.top + rect.height / 2
               : rect.bottom + 10;
      // Center angles: right=0°, down=90°, left=180°
      const centerAngle = isFirst ? 0 : isLast ? 180 : 90;
      // Spread ±60° around center in 4 steps (-45°,-15°,+15°,+45°)
      const offsets = [-45, -15, 15, 45];
      const angles  = offsets.map(o => (centerAngle + o + 360) % 360);
      const radius  = 54;
      const defs = [
        { cls: "jo-radial-expand",  icon: "&#x2922;", label: "Expand"                         },
        { cls: "jo-radial-index",   icon: "&#x26B7;", label: "Index"                           },
        { cls: "jo-radial-reverse", icon: reversed ? "&#x21BA;" : "&#x21BB;",
                                          label: reversed ? "Upright" : "Reverse"              },
        { cls: "jo-radial-remove",  icon: "&#x2715;", label: "Remove"                         },
      ];

      const wrap = document.createElement("div");
      wrap.className = "jo-radial-menu";
      wrap.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;z-index:200;pointer-events:none;width:0;height:0;`;

      defs.forEach((d, i) => {
        const angle = angles[i] * Math.PI / 180;
        const bx = Math.round(Math.cos(angle) * radius);
        const by = Math.round(Math.sin(angle) * radius);
        const btn = document.createElement("button");
        btn.className = `jo-radial-btn ${d.cls}`;
        btn.innerHTML = d.icon;
        btn.setAttribute("data-tooltip", d.label);
        btn.style.cssText = `left:${bx}px;top:${by}px;transition-delay:${i*40}ms;`;
        wrap.appendChild(btn);
      });

      document.body.appendChild(wrap);
      _radialEl = wrap;

      requestAnimationFrame(() => {
        wrap.style.pointerEvents = "auto";
        wrap.querySelectorAll(".jo-radial-btn").forEach(b => b.classList.add("jo-radial-visible"));
      });

      wrap.querySelector(".jo-radial-expand").addEventListener("click", (e) => {
        e.stopPropagation(); closeRadial();
        const card = CardData.getByNameOrFile(filename);
        if (!card?.imageName) return;
        const folder = card.section === "Runes" ? "Runes"
          : (window.App?.activeDeck === "riderwaite" ? "RiderWaite" : "LuminousArc");
        if (window.CardIndex) CardIndex._openLightbox(`./${folder}/${card.imageName}.png`);
      });

      wrap.querySelector(".jo-radial-index").addEventListener("click", (e) => {
        e.stopPropagation(); closeRadial();
        const card = CardData.getByNameOrFile(filename);
        if (card) {
          close();
          CardIndex.open();
          setTimeout(() => {
            const i = CardData.getAll().findIndex(c => c.name === card.name);
            if (i >= 0) CardIndex._showDetailAtIdx(i);
          }, 50);
        }
      });

      wrap.querySelector(".jo-radial-reverse").addEventListener("click", (e) => {
        e.stopPropagation(); closeRadial();
        const entry = getEntry(currentDay);
        const cur = cardEntry(entry.cards[idx]);
        cur.reversed = !cur.reversed;
        entry.cards[idx] = cur;
        entry.updatedAt = Date.now();
        saveEntry(currentDay, entry);
        renderCardsStrip(entry.cards);
      });

      wrap.querySelector(".jo-radial-remove").addEventListener("click", (e) => {
        e.stopPropagation(); closeRadial();
        const entry = getEntry(currentDay);
        entry.cards.splice(idx, 1);
        entry.updatedAt = Date.now();
        saveEntry(currentDay, entry);
        renderCardsStrip(entry.cards);
      });
    }

    joCardsStrip.querySelectorAll(".jo-card-thumb").forEach(thumb => {
      thumb.addEventListener("click", () => {
        _radialThumb === thumb ? closeRadial() : openRadial(thumb);
      });
    });

    document.addEventListener("click", (e) => {
      if (!_radialEl) return;
      if (!e.target.closest(".jo-radial-menu") && !e.target.closest(".jo-card-thumb")) {
        closeRadial();
      }
    });
  }

  // ── Auto-save textarea ────────────────────────────────
  joPaper.addEventListener("input", () => {
    const text = joPaper.value;
    updateWordCount(text);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const entry = getEntry(currentDay);
      entry.text      = text;
      entry.wordCount = countWords(text);
      entry.updatedAt = Date.now();
      saveEntry(currentDay, entry);
    }, 600);
  });

  // ── Save a card to today ──────────────────────────────
  function saveCardToToday(filename, reversed = false) {
    const key   = todayKey();
    const entry = getEntry(key);
    if (!entry.cards) entry.cards = [];
    const exists = entry.cards.some(c => cardEntry(c).filename === filename);
    if (!exists) {
      entry.cards.push({ filename, reversed });
      entry.updatedAt = Date.now();
      saveEntry(key, entry);
    }
    // If currently viewing today's day view, refresh strip
    if (isOpen && currentDay === key && joDayView.classList.contains("jo-active")) {
      renderCardsStrip(entry.cards);
    }
  }

  // ── Navigation ────────────────────────────────────────
  joClose.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") close();
  });

  // ── Open / close ──────────────────────────────────────
  function open() {
    if (window.CardIndex) CardIndex.close();
    if (window.Tooltips) Tooltips.wire(overlay);
    isOpen = true;
    overlay.classList.add("jo-open");
    document.body.style.overflow = "hidden";
    openDay(todayKey());
  }

  function openToday() { open(); }

  // Keep cards strip visible when keyboard opens
  // Adjust only the paper-wrap height, not the whole overlay
  const _joCardsStripEl = overlay.querySelector("#joCardsStrip");
  const _joPaperWrapEl  = overlay.querySelector ? null : null; // resolved below

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      if (!isOpen) return;
      const vvHeight = window.visualViewport.height;
      const fullHeight = window.innerHeight;
      const kbHeight = fullHeight - vvHeight;
      const dayView = overlay.querySelector("#joDayView");
      if (dayView) {
        // Shrink the scroll container to keep header/strip pinned above keyboard
        dayView.style.maxHeight = kbHeight > 50 ? vvHeight + "px" : "";
      }
    });
  }

  function close() {
    isOpen = false;
    overlay.classList.remove("jo-open");
    closeRadial();
    // Reset day-view height on close
    const dayView = overlay.querySelector("#joDayView");
    if (dayView) dayView.style.maxHeight = "";
    document.body.style.overflow = "";
    clearTimeout(saveTimer);
    // Flush any pending save
    if (joPaper.value !== undefined && currentDay) {
      const entry = getEntry(currentDay);
      if (entry.text !== joPaper.value) {
        entry.text      = joPaper.value;
        entry.wordCount = countWords(joPaper.value);
        entry.updatedAt = Date.now();
        saveEntry(currentDay, entry);
      }
    }
  }

  // Expose internal for card thumbnail → index navigation
  function _getCurrentDay() { return currentDay; }

  return { open, openToday, close, saveCardToToday, _getCurrentDay };

})();
