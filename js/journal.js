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

  const STORAGE_PREFIX = "arcana_journal_";
  const WORD_TARGET    = 1000;
  const SHADE_STEPS    = [0, 1, 200, 400, 600, 800]; // word thresholds

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
    <div class="jo-header">
      <button class="jo-back" id="joBack" aria-label="Back to calendar">←</button>
      <span class="jo-title" id="joTitle">Journal</span>
      <button class="jo-close" id="joClose" aria-label="Close">✕</button>
    </div>

    <div class="jo-cal-view" id="joCalView">
      <div class="jo-cal-nav">
        <button class="jo-cal-arrow" id="joCalPrev">‹</button>
        <span class="jo-cal-month" id="joCalMonth"></span>
        <button class="jo-cal-arrow" id="joCalNext">›</button>
      </div>
      <div class="jo-cal-grid" id="joCalGrid"></div>
      <div class="jo-cal-legend">
        <span>Less</span>
        <span class="jo-shade jo-shade-0"></span>
        <span class="jo-shade jo-shade-1"></span>
        <span class="jo-shade jo-shade-2"></span>
        <span class="jo-shade jo-shade-3"></span>
        <span class="jo-shade jo-shade-4"></span>
        <span class="jo-shade jo-shade-5"></span>
        <span>More</span>
      </div>
    </div>

    <div class="jo-day-view" id="joDayView">
      <div class="jo-day-header">
        <div class="jo-day-date" id="joDayDate"></div>
        <div class="jo-word-meta">
          <span id="joWordCount">0</span> / ${WORD_TARGET}
          <span class="jo-muted" id="joRemaining"></span>
        </div>
      </div>
      <div class="jo-progress-bar"><div class="jo-progress-fill" id="joProgressFill"></div></div>
      <div class="jo-cards-strip" id="joCardsStrip"></div>
      <textarea class="jo-paper" id="joPaper" placeholder="Write freely…"></textarea>
    </div>
  `;

  document.body.appendChild(overlay);

  // ── Refs ──────────────────────────────────────────────
  const joBack        = overlay.querySelector("#joBack");
  const joClose       = overlay.querySelector("#joClose");
  const joTitle       = overlay.querySelector("#joTitle");
  const joCalView     = overlay.querySelector("#joCalView");
  const joDayView     = overlay.querySelector("#joDayView");
  const joCalGrid     = overlay.querySelector("#joCalGrid");
  const joCalMonth    = overlay.querySelector("#joCalMonth");
  const joCalPrev     = overlay.querySelector("#joCalPrev");
  const joCalNext     = overlay.querySelector("#joCalNext");
  const joDayDate     = overlay.querySelector("#joDayDate");
  const joWordCount   = overlay.querySelector("#joWordCount");
  const joRemaining   = overlay.querySelector("#joRemaining");
  const joProgressFill= overlay.querySelector("#joProgressFill");
  const joCardsStrip  = overlay.querySelector("#joCardsStrip");
  const joPaper       = overlay.querySelector("#joPaper");

  // ── Calendar ──────────────────────────────────────────
  const MONTH_NAMES = ["January","February","March","April","May","June",
                       "July","August","September","October","November","December"];
  const DAY_NAMES   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  function shadeForWords(words) {
    if (words <= 0)   return 0;
    if (words < 200)  return 1;
    if (words < 400)  return 2;
    if (words < 600)  return 3;
    if (words < 800)  return 4;
    return 5;
  }

  function renderCalendar() {
    joCalMonth.textContent = `${MONTH_NAMES[calMonth]} ${calYear}`;
    const today = todayKey();

    // First day of month, number of days
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    let html = "";
    // Day name headers
    DAY_NAMES.forEach(d => { html += `<div class="jo-cal-day-name">${d}</div>`; });

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += `<div class="jo-cal-cell jo-cal-empty"></div>`;
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const entry   = getEntry(dateKey);
      const shade   = shadeForWords(entry.wordCount || 0);
      const hasCards= entry.cards && entry.cards.length > 0;
      const isToday = dateKey === today;
      const isFuture= dateKey > today;

      html += `<div class="jo-cal-cell jo-shade-${shade}${isToday ? " jo-today" : ""}${isFuture ? " jo-future" : ""}"
                    data-date="${dateKey}">
        <span class="jo-cal-num">${d}</span>
        ${hasCards ? `<span class="jo-cal-dot"></span>` : ""}
      </div>`;
    }

    joCalGrid.innerHTML = html;

    joCalGrid.querySelectorAll(".jo-cal-cell[data-date]").forEach(cell => {
      if (cell.classList.contains("jo-future")) return;
      cell.addEventListener("click", () => openDay(cell.dataset.date));
    });
  }

  joCalPrev.addEventListener("click", () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  joCalNext.addEventListener("click", () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  // ── Day view ──────────────────────────────────────────
  function openDay(dateKey) {
    currentDay = dateKey;
    const entry = getEntry(dateKey);
    const isToday = dateKey === todayKey();

    joTitle.textContent = dateKey;
    joBack.style.display = "flex";
    joCalView.classList.remove("jo-active");
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

    // Focus textarea on today
    if (isToday) setTimeout(() => joPaper.focus(), 100);
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

  function renderCardsStrip(cards) {
    if (!cards || cards.length === 0) {
      joCardsStrip.innerHTML = `<div class="jo-cards-empty">No cards saved to this entry yet.</div>`;
      return;
    }
    joCardsStrip.innerHTML = cards.map((filename, i) => {
      const card = CardData.getByNameOrFile(filename);
      const imgSrc = card?.imageName ? `./LuminousArc/${card.imageName}.png` : "";
      const displayName = card?.name || filename;
      return `<div class="jo-card-thumb" data-filename="${filename}" data-idx="${i}" title="${displayName}">
        ${imgSrc
          ? `<img src="${imgSrc}" alt="${displayName}" />`
          : `<div class="jo-card-glyph">${filename.slice(0,2)}</div>`}
        <div class="jo-card-confirm" data-idx="${i}">
          <span class="jo-card-confirm-name">${displayName}</span>
          <button class="jo-card-confirm-btn" data-idx="${i}">Remove</button>
          <button class="jo-card-cancel-btn">Cancel</button>
        </div>
      </div>`;
    }).join("");

    // Prevent browser image context menu (copy/download) on long press
    joCardsStrip.querySelectorAll("img").forEach(img => {
      img.addEventListener("contextmenu", e => e.preventDefault());
      img.draggable = false;
    });

    const HOLD_MS = 500;
    let holdTimer = null;

    function showConfirm(thumb) {
      // Hide any other open confirms first
      joCardsStrip.querySelectorAll(".jo-card-confirm.visible")
        .forEach(el => el.classList.remove("visible"));
      thumb.querySelector(".jo-card-confirm")?.classList.add("visible");
    }
    function hideConfirm(thumb) {
      thumb.querySelector(".jo-card-confirm")?.classList.remove("visible");
    }

    joCardsStrip.querySelectorAll(".jo-card-thumb").forEach(thumb => {
      // Hold to show confirm
      thumb.addEventListener("mousedown", () => {
        holdTimer = setTimeout(() => showConfirm(thumb), HOLD_MS);
      });
      thumb.addEventListener("mouseup",   () => clearTimeout(holdTimer));
      thumb.addEventListener("mouseleave",() => clearTimeout(holdTimer));

      thumb.addEventListener("touchstart", (e) => {
        holdTimer = setTimeout(() => { showConfirm(thumb); }, HOLD_MS);
      }, { passive: true });
      thumb.addEventListener("touchend",   () => clearTimeout(holdTimer), { passive: true });
      thumb.addEventListener("touchmove",  () => clearTimeout(holdTimer), { passive: true });

      // Short tap → open in index (only if confirm not showing)
      thumb.addEventListener("click", (e) => {
        if (e.target.closest(".jo-card-confirm")) return;
        const confirm = thumb.querySelector(".jo-card-confirm");
        if (confirm?.classList.contains("visible")) { hideConfirm(thumb); return; }
        const filename = thumb.dataset.filename;
        const card = CardData.getByNameOrFile(filename);
        if (card) {
          close();
          CardIndex.open();
          setTimeout(() => {
            const idx = CardData.getAll().findIndex(c => c.name === card.name);
            if (idx >= 0) CardIndex._showDetailAtIdx(idx);
          }, 50);
        }
      });
    });

    // Confirm remove
    joCardsStrip.querySelectorAll(".jo-card-confirm-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        const entry = getEntry(currentDay);
        entry.cards.splice(idx, 1);
        entry.updatedAt = Date.now();
        saveEntry(currentDay, entry);
        renderCardsStrip(entry.cards);
      });
    });

    // Cancel
    joCardsStrip.querySelectorAll(".jo-card-cancel-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        btn.closest(".jo-card-confirm")?.classList.remove("visible");
      });
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
  function saveCardToToday(filename) {
    const key   = todayKey();
    const entry = getEntry(key);
    if (!entry.cards) entry.cards = [];
    if (!entry.cards.includes(filename)) {
      entry.cards.push(filename);
      entry.updatedAt = Date.now();
      saveEntry(key, entry);
    }
    // If currently viewing today's day view, refresh strip
    if (isOpen && currentDay === key && joDayView.classList.contains("jo-active")) {
      renderCardsStrip(entry.cards);
    }
  }

  // ── Navigation ────────────────────────────────────────
  function goBack() {
    joTitle.textContent = "Journal";
    joBack.style.display = "none";
    joDayView.classList.remove("jo-active");
    joCalView.classList.add("jo-active");
    // Reset calendar to current month/year when going back
    calMonth = new Date().getMonth();
    calYear  = new Date().getFullYear();
    renderCalendar();
  }

  joBack.addEventListener("click", goBack);
  joClose.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") {
      if (joDayView.classList.contains("jo-active")) goBack();
      else close();
    }
  });

  // ── Open / close ──────────────────────────────────────
  function open(goToToday = false) {
    // Close index if open
    if (window.CardIndex) CardIndex.close();

    isOpen = true;
    overlay.classList.add("jo-open");
    joBack.style.display = "none";
    document.body.style.overflow = "hidden";

    if (goToToday) {
      openDay(todayKey());
    } else {
      joTitle.textContent = "Journal";
      joDayView.classList.remove("jo-active");
      joCalView.classList.add("jo-active");
      calMonth = new Date().getMonth();
      calYear  = new Date().getFullYear();
      renderCalendar();
    }
  }

  function openToday() { open(true); }

  function close() {
    isOpen = false;
    overlay.classList.remove("jo-open");
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
