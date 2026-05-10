/*********************************************************
 * TAROT CANVAS — drawing, interaction (drag + hold)
 *********************************************************/
const tarotCanvas = document.getElementById("tarotCanvas");
const tarotCtx    = tarotCanvas.getContext("2d");
tarotCtx.imageSmoothingEnabled = true;

let draws = []; // each card also stores { w, h } for hit testing

const REVERSAL_CHANCE = 0.40;
function rollReversal() { return App.reversals && Math.random() < REVERSAL_CHANCE; }

// ── Card dimensions by type ──────────────────────────────
function cardDims(type, s) {
  s = s || App.cardScale;
  switch (type) {
    case "text":     return { w: 0, h: 22 * s }; // w computed at draw time
    case "playing":  return { w: 86 * s, h: 120 * s };
    case "tarot":    return { w: 86 * s, h: 140 * s };
    case "luminous": return { w: 108 * s, h: 176 * s };
    case "gilded":   return { w: 86 * s, h: 140 * s };
    case "rune":     return { w: 82 * s, h: 100 * s };
    default:         return { w: 86 * s, h: 140 * s };
  }
}

// ── Text deck names ──────────────────────────────────────
let tarotNames = [
  "The Fool","The Magician","The High Priestess","The Empress","The Emperor",
  "The Hierophant","The Lovers","The Chariot","Strength","The Hermit",
  "Wheel of Fortune","Justice","The Hanged Man","Death","Temperance",
  "The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World",
  "Ace of Wands","Two of Wands","Three of Wands","Four of Wands","Five of Wands",
  "Six of Wands","Seven of Wands","Eight of Wands","Nine of Wands","Ten of Wands",
  "Page of Wands","Knight of Wands","Queen of Wands","King of Wands",
  "Ace of Cups","Two of Cups","Three of Cups","Four of Cups","Five of Cups",
  "Six of Cups","Seven of Cups","Eight of Cups","Nine of Cups","Ten of Cups",
  "Page of Cups","Knight of Cups","Queen of Cups","King of Cups",
  "Ace of Swords","Two of Swords","Three of Swords","Four of Swords","Five of Swords",
  "Six of Swords","Seven of Swords","Eight of Swords","Nine of Swords","Ten of Swords",
  "Page of Swords","Knight of Swords","Queen of Swords","King of Swords",
  "Ace of Pentacles","Two of Pentacles","Three of Pentacles","Four of Pentacles",
  "Five of Pentacles","Six of Pentacles","Seven of Pentacles","Eight of Pentacles",
  "Nine of Pentacles","Ten of Pentacles","Page of Pentacles","Knight of Pentacles",
  "Queen of Pentacles","King of Pentacles",
];

// ── Card descriptions ────────────────────────────────────
const TAROT_DESC = {
  "The Fool":           "New beginnings, innocence, spontaneity, a free spirit.",
  "The Magician":       "Willpower, desire, creation, manifestation.",
  "The High Priestess": "Intuition, sacred knowledge, divine feminine, the subconscious.",
  "The Empress":        "Femininity, beauty, nature, abundance, nurturing.",
  "The Emperor":        "Authority, structure, stability, a father figure.",
  "The Hierophant":     "Tradition, conformity, morality, spiritual wisdom.",
  "The Lovers":         "Love, harmony, relationships, values alignment.",
  "The Chariot":        "Direction, control, willpower, success through effort.",
  "Strength":           "Strength, courage, patience, control, compassion.",
  "The Hermit":         "Soul-searching, introspection, solitude, inner guidance.",
  "Wheel of Fortune":   "Cycles, fate, luck, change, a turning point.",
  "Justice":            "Justice, fairness, truth, cause and effect, law.",
  "The Hanged Man":     "Pause, surrender, letting go, new perspectives.",
  "Death":              "Endings, change, transformation, transition.",
  "Temperance":         "Balance, moderation, patience, purpose, meaning.",
  "The Devil":          "Shadow, addiction, restriction, materialism, bondage.",
  "The Tower":          "Sudden change, upheaval, chaos, revelation.",
  "The Star":           "Hope, faith, purpose, renewal, spirituality.",
  "The Moon":           "Illusion, fear, the unconscious, dreams, the unknown.",
  "The Sun":            "Positivity, joy, vitality, success, clarity.",
  "Judgement":          "Reflection, reckoning, awakening, absolution.",
  "The World":          "Completion, integration, accomplishment, travel.",
};

// Minor arcana descriptions by rank keyword
function minorDesc(rank, suit) {
  const suitTheme = {
    Wands:     "fire, ambition, and energy",
    Cups:      "water, emotion, and intuition",
    Swords:    "air, intellect, and conflict",
    Pentacles: "earth, material, and stability",
  };
  const rankTheme = {
    Ace:    "a pure new beginning in",
    Two:    "duality and choice in",
    Three:  "collaboration and growth in",
    Four:   "consolidation and rest in",
    Five:   "conflict and challenge in",
    Six:    "harmony and movement in",
    Seven:  "assessment and perseverance in",
    Eight:  "momentum and change in",
    Nine:   "near-completion in",
    Ten:    "completion and fulfillment of",
    Page:   "a curious student of",
    Knight: "an active pursuer of",
    Queen:  "a mastery of the inner world of",
    King:   "a mature authority in",
  };
  return `Represents ${rankTheme[rank] || rank} ${suitTheme[suit] || suit}.`;
}

function getCardDescription(card) {
  const rev = card.name && card.name.endsWith(" (R)");
  const suffix = rev ? " (Reversed)" : "";

  if (card.type === "text" || card.type === "tarot" || card.type === "luminous") {
    const baseName = (card.name || "").replace(" (R)", "");
    if (TAROT_DESC[baseName]) return { title: baseName + suffix, body: TAROT_DESC[baseName] };
    // Minor arcana — parse rank and suit
    const parts = baseName.split(" of ");
    if (parts.length === 2) {
      const rank = parts[0], suit = parts[1];
      return { title: baseName + suffix, body: minorDesc(rank, suit) };
    }
    return { title: baseName + suffix, body: "" };
  }

  if (card.type === "playing") {
    const suitNames = { "♠": "Spades", "♥": "Hearts", "♦": "Diamonds", "♣": "Clubs" };
    return { title: `${card.rank} of ${suitNames[card.suit] || card.suit}`, body: "" };
  }

  if (card.type === "gilded") {
    if (card.isMajor) {
      const major = GildedMinima.MAJORS[card.majorIdx];
      return { title: major.name + suffix, body: TAROT_DESC[major.name] || "" };
    }
    return { title: `${card.rank} of ${GildedMinima.SUITS[card.suitIdx].name}` + suffix,
             body: minorDesc(card.rank, GildedMinima.SUITS[card.suitIdx].name) };
  }

  if (card.type === "rune") {
    const r = Runes.RUNES[card.runeIdx];
    const revNote = card.rot && Math.abs(card.rot % (Math.PI*2)) > Math.PI/2 ? " (Reversed)" : "";
    return { title: `${r.name} · ${r.phoneme}` + revNote, body: r.meaning };
  }

  return { title: "", body: "" };
}

// ── Playing card mini-deck ───────────────────────────────
const Playing = (() => {
  const suits = [
    { sym: "♠", color: "#111" }, { sym: "♥", color: "#b0122b" },
    { sym: "♦", color: "#b0122b" }, { sym: "♣", color: "#111" },
  ];
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  function randomCard() {
    return { rank: ranks[Math.floor(Math.random()*ranks.length)],
             ...suits[Math.floor(Math.random()*suits.length)] };
  }
  return { randomCard };
})();

// ── Canvas resize ────────────────────────────────────────
function resizeTarotCanvas() {
  const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
  tarotCanvas.width  = Math.floor(window.innerWidth * dpr);
  tarotCanvas.height = Math.floor(window.innerHeight * dpr);
  tarotCanvas.style.width  = window.innerWidth + "px";
  tarotCanvas.style.height = window.innerHeight + "px";
  tarotCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redrawAll();
}
window.addEventListener("resize", resizeTarotCanvas, { passive: true });
resizeTarotCanvas();

// ── Hit testing ──────────────────────────────────────────
// Returns the topmost card under (px, py), or null
function cardAtPoint(px, py) {
  for (let i = draws.length - 1; i >= 0; i--) {
    const card = draws[i];
    const w = card.w || 0, h = card.h || 0;
    if (!w || !h) continue;

    const rot = card.rot || 0;
    const dx = px - card.x, dy = py - card.y;
    // Rotate point into card-local space
    const cos = Math.cos(-rot), sin = Math.sin(-rot);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;
    if (Math.abs(lx) <= w / 2 && Math.abs(ly) <= h / 2) return card;
  }
  return null;
}

// ── Description overlay ──────────────────────────────────
const descOverlay = document.getElementById("descOverlay");
const descTitle   = document.getElementById("descTitle");
const descBody    = document.getElementById("descBody");
let descTimeout = null;

function showDesc(card, px, py) {
  const info = getCardDescription(card);
  if (!info.title) return;
  descTitle.textContent = info.title;
  descBody.textContent  = info.body;
  descOverlay.classList.add("visible");

  // Position: above the tap point, clamped to viewport
  const ow = descOverlay.offsetWidth  || 220;
  const oh = descOverlay.offsetHeight || 80;
  let left = px - ow / 2;
  let top  = py - oh - 20;
  left = Math.max(12, Math.min(window.innerWidth  - ow - 12, left));
  top  = Math.max(12, Math.min(window.innerHeight - oh - 12, top));
  descOverlay.style.left = left + "px";
  descOverlay.style.top  = top  + "px";

  // Auto-dismiss after 3.5s
  clearTimeout(descTimeout);
  descTimeout = setTimeout(hideDesc, 3500);
}

function hideDesc() {
  descOverlay.classList.remove("visible");
  clearTimeout(descTimeout);
}

descOverlay.addEventListener("click", hideDesc);

// ── Pointer interaction state ────────────────────────────
const HOLD_MS   = 500;
const DRAG_PX   = 8;

let pointerDown   = false;
let pointerStart  = { x: 0, y: 0 };
let holdTimer     = null;
let dragCard      = null;   // card being dragged
let dragOffsetX   = 0;
let dragOffsetY   = 0;
let didDrag       = false;
let didHold       = false;

function cancelHold() { clearTimeout(holdTimer); holdTimer = null; }

tarotCanvas.addEventListener("pointerdown", (e) => {
  if (e.button !== 0 && e.button !== undefined) return; // left/touch only
  hideDesc();
  pointerDown  = true;
  didDrag      = false;
  didHold      = false;
  pointerStart = { x: e.clientX, y: e.clientY };

  // Check if pointer is on an existing card → potential drag
  const hit = cardAtPoint(e.clientX, e.clientY);

  if (hit) {
    // Arm hold timer for description
    holdTimer = setTimeout(() => {
      if (!didDrag) {
        didHold = true;
        showDesc(hit, e.clientX, e.clientY);
      }
    }, HOLD_MS);

    // Prepare drag
    dragCard    = hit;
    dragOffsetX = e.clientX - hit.x;
    dragOffsetY = e.clientY - hit.y;
  } else {
    // Empty canvas: arm hold timer (shows nothing useful, so just arm tap)
    dragCard = null;
  }

  tarotCanvas.setPointerCapture(e.pointerId);
});

tarotCanvas.addEventListener("pointermove", (e) => {
  if (!pointerDown) return;
  const dx = e.clientX - pointerStart.x;
  const dy = e.clientY - pointerStart.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist > DRAG_PX && dragCard && !didHold) {
    // Enter drag mode
    cancelHold();
    didDrag = true;

    // Bring dragged card to top of draw order
    const idx = draws.indexOf(dragCard);
    if (idx !== -1 && idx !== draws.length - 1) {
      draws.splice(idx, 1);
      draws.push(dragCard);
    }

    dragCard.x = e.clientX - dragOffsetX;
    dragCard.y = e.clientY - dragOffsetY;
    redrawAll();
  }
});

tarotCanvas.addEventListener("pointerup", (e) => {
  if (!pointerDown) return;
  pointerDown = false;
  cancelHold();

  if (didDrag) {
    // Finalize drag position
    if (dragCard) {
      dragCard.x = e.clientX - dragOffsetX;
      dragCard.y = e.clientY - dragOffsetY;
      redrawAll();
    }
    dragCard = null;
    didDrag  = false;
    return;
  }

  if (didHold) {
    dragCard = null;
    didHold  = false;
    return;
  }

  // Clean tap on empty canvas → draw new card
  if (!dragCard) {
    spawnCard(e.clientX, e.clientY);
  }

  dragCard = null;
});

tarotCanvas.addEventListener("pointercancel", () => {
  pointerDown = false;
  cancelHold();
  dragCard = null;
  didDrag  = false;
  didHold  = false;
});

// ── Spawn new card ───────────────────────────────────────
function spawnCard(x, y) {
  const deck = App.activeDeck;
  const rev  = rollReversal();
  const baseTilt = (Math.random() * 10 - 5) * (Math.PI / 180);
  const rot  = baseTilt + (rev ? Math.PI : 0);

  if (deck === "text") {
    shuffleArray(tarotNames);
    const name = rev ? tarotNames[0] + " (R)" : tarotNames[0];
    // measure width
    tarotCtx.font = `${Math.max(10, Math.round(12 * App.cardScale))}px Arial`;
    const s = App.cardScale;
    const paddingX = 8 * s;
    const tw = tarotCtx.measureText(name).width;
    const w = Math.ceil(tw + paddingX * 2);
    const h = 22 * s;
    const card = { type: "text", x, y, name, rot: 0, w, h };
    draws.push(card); drawTextCard(card); return;
  }

  if (deck === "playing") {
    const c = Playing.randomCard();
    const { w, h } = cardDims("playing");
    const card = { type: "playing", x, y, rank: c.rank, suit: c.sym, ink: c.color, rot, w, h };
    draws.push(card); drawPlayingCard(card); return;
  }

  if (deck === "riderwaite") {
    const t = Tarot.randomCard("riderwaite");
    const { w, h } = cardDims("tarot");
    const card = { type: "tarot", x, y, name: t.name, deckKey: "riderwaite", rot, w, h };
    draws.push(card); drawTarotCard(card); return;
  }

  if (deck === "luminousarc") {
    const t = Tarot.randomCard("luminousarc");
    const { w, h } = cardDims("luminous");
    const card = { type: "luminous", x, y, name: t.name, deckKey: "luminousarc", rot, w, h };
    draws.push(card); drawLuminousCard(card); return;
  }

  if (deck === "gilded") {
    const g = GildedMinima.randomCard();
    const { w, h } = cardDims("gilded");
    const card = { type: "gilded", x, y, rank: g.rank, suitIdx: g.suitIdx,
                   isMajor: g.isMajor, majorIdx: g.majorIdx, rot, w, h };
    draws.push(card); drawGildedCard(card); return;
  }

  if (deck === "runes") {
    const r = Runes.randomCard();
    const runeRot = (Math.random() * 10 - 5) * (Math.PI / 180) + (rev ? Math.PI : 0);
    const { w, h } = cardDims("rune");
    const card = { type: "rune", x, y, runeIdx: r.runeIdx, rot: runeRot, w, h };
    draws.push(card); drawRuneCard(card); return;
  }
}

// ── Draw functions ───────────────────────────────────────
function drawTextCard(card) {
  const s = App.cardScale;
  const isReversed = card.name.endsWith(" (R)");
  const paddingX = 8 * s, r = 4 * s;

  tarotCtx.save();
  tarotCtx.font = `${Math.max(10, Math.round(12 * s))}px Arial`;
  tarotCtx.textBaseline = "middle";

  const textW = tarotCtx.measureText(card.name).width;
  const w = Math.ceil(textW + paddingX * 2);
  const h = Math.round(22 * s);
  card.w = w; card.h = h; // keep dims fresh
  const x = Math.round(card.x - w / 2), y = Math.round(card.y - h / 2);

  tarotCtx.fillStyle = getCssVar("--cardBg");
  roundRect(tarotCtx, x, y, w, h, r); tarotCtx.fill();
  tarotCtx.strokeStyle = isReversed ? "rgba(180,60,60,0.55)" : getCssVar("--cardStroke");
  tarotCtx.lineWidth = isReversed ? 1.5 : 1; tarotCtx.stroke();
  tarotCtx.fillStyle = isReversed ? "rgba(220,140,140,0.92)" : getCssVar("--cardText");
  tarotCtx.shadowColor = "rgba(0,0,0,0.55)"; tarotCtx.shadowBlur = 4 * s;
  tarotCtx.fillText(card.name, x + paddingX, y + h / 2 + 0.5);
  tarotCtx.restore();
}

function drawPlayingCard(card) {
  const s = App.cardScale;
  const w = 86 * s, h = 120 * s, r = 10 * s;
  card.w = w; card.h = h;

  tarotCtx.save();
  tarotCtx.translate(card.x, card.y); tarotCtx.rotate(card.rot);
  tarotCtx.shadowColor = "rgba(0,0,0,0.55)";
  tarotCtx.shadowBlur = 18 * s; tarotCtx.shadowOffsetY = 10 * s;
  const x = -w/2, y = -h/2;
  const g = tarotCtx.createLinearGradient(x, y, x, y+h);
  g.addColorStop(0,"rgba(255,255,255,0.98)"); g.addColorStop(1,"rgba(245,245,245,0.96)");
  tarotCtx.fillStyle = g; roundRect(tarotCtx, x, y, w, h, r); tarotCtx.fill();
  tarotCtx.shadowBlur = 0; tarotCtx.shadowOffsetY = 0;
  tarotCtx.strokeStyle = "rgba(0,0,0,0.12)"; tarotCtx.lineWidth = 1;
  roundRect(tarotCtx, x, y, w, h, r); tarotCtx.stroke();
  tarotCtx.strokeStyle = "rgba(0,0,0,0.08)"; tarotCtx.lineWidth = 1;
  roundRect(tarotCtx, x+6*s, y+6*s, w-12*s, h-12*s, Math.max(2,r-3*s)); tarotCtx.stroke();
  tarotCtx.fillStyle = card.ink;
  tarotCtx.font = `900 ${Math.max(10,Math.round(14*s))}px ui-sans-serif,Arial`;
  tarotCtx.textBaseline = "top"; tarotCtx.textAlign = "left";
  tarotCtx.fillText(`${card.rank}${card.suit}`, x+12*s, y+10*s);
  tarotCtx.font = `900 ${Math.max(18,Math.round(46*s))}px ui-sans-serif,Arial`;
  tarotCtx.textAlign = "center"; tarotCtx.textBaseline = "middle";
  tarotCtx.fillText(card.suit, 0, 2*s);
  tarotCtx.save(); tarotCtx.rotate(Math.PI);
  tarotCtx.font = `900 ${Math.max(10,Math.round(14*s))}px ui-sans-serif,Arial`;
  tarotCtx.textAlign = "left"; tarotCtx.textBaseline = "top";
  tarotCtx.fillText(`${card.rank}${card.suit}`, x+12*s, y+10*s);
  tarotCtx.restore(); tarotCtx.restore();
}

function drawTarotCard(card) {
  const s = App.cardScale;
  const w = 86 * s, h = 140 * s, r = 12 * s;
  card.w = w; card.h = h;
  const img = Tarot.getImage(card.name, card.deckKey || "riderwaite");

  tarotCtx.save();
  tarotCtx.translate(card.x, card.y); tarotCtx.rotate(card.rot || 0);
  tarotCtx.shadowColor = "rgba(0,0,0,0.60)";
  tarotCtx.shadowBlur = 18*s; tarotCtx.shadowOffsetY = 10*s;
  const x = -w/2, y = -h/2;
  const g = tarotCtx.createLinearGradient(x, y, x, y+h);
  g.addColorStop(0,"rgba(255,255,255,0.98)"); g.addColorStop(1,"rgba(245,245,245,0.96)");
  tarotCtx.fillStyle = g; roundRect(tarotCtx, x, y, w, h, r); tarotCtx.fill();
  tarotCtx.shadowBlur = 0; tarotCtx.shadowOffsetY = 0;
  tarotCtx.strokeStyle = "rgba(0,0,0,0.22)"; tarotCtx.lineWidth = 1;
  roundRect(tarotCtx, x, y, w, h, r); tarotCtx.stroke();
  tarotCtx.strokeStyle = getCssVar("--cardStroke"); tarotCtx.lineWidth = 2;
  roundRect(tarotCtx, x, y, w, h, r); tarotCtx.stroke();
  tarotCtx.save();
  tarotCtx.globalAlpha = 0.75;
  tarotCtx.shadowColor = getCssVar("--cardStroke"); tarotCtx.shadowBlur = 14*s;
  tarotCtx.strokeStyle = getCssVar("--cardStroke"); tarotCtx.lineWidth = 1.5;
  roundRect(tarotCtx, x, y, w, h, r); tarotCtx.stroke();
  tarotCtx.restore();
  tarotCtx.strokeStyle = "rgba(0,0,0,0.08)"; tarotCtx.lineWidth = 1;
  roundRect(tarotCtx, x+6*s, y+6*s, w-12*s, h-12*s, Math.max(2,r-5*s)); tarotCtx.stroke();
  if (img) {
    const pad = 4*s;
    tarotCtx.save();
    roundRect(tarotCtx, x+pad, y+pad, w-pad*2, h-pad*2, Math.max(2,r-5*s));
    tarotCtx.clip();
    tarotCtx.drawImage(img, x+pad, y+pad, w-pad*2, h-pad*2);
    tarotCtx.restore();
  } else {
    tarotCtx.fillStyle = "#111";
    tarotCtx.font = `900 ${Math.max(10,Math.round(12*s))}px ui-sans-serif,Arial`;
    tarotCtx.textAlign = "center"; tarotCtx.textBaseline = "middle";
    tarotCtx.fillText(card.name, 0, 0);
  }
  tarotCtx.restore();
}

function drawLuminousCard(card) {
  const s = App.cardScale;
  const w = 108*s, h = 176*s, r = 14*s;
  card.w = w; card.h = h;
  const img = Tarot.getImage(card.name, "luminousarc");

  tarotCtx.save();
  tarotCtx.translate(card.x, card.y); tarotCtx.rotate(card.rot || 0);
  const x = -w/2, y = -h/2;
  tarotCtx.shadowColor = "rgba(0,0,0,0.72)";
  tarotCtx.shadowBlur = 28*s; tarotCtx.shadowOffsetY = 14*s;
  if (img) {
    tarotCtx.save();
    roundRect(tarotCtx, x, y, w, h, r); tarotCtx.clip();
    tarotCtx.drawImage(img, x, y, w, h);
    tarotCtx.restore();
  } else {
    tarotCtx.fillStyle = "#0f0c24";
    roundRect(tarotCtx, x, y, w, h, r); tarotCtx.fill();
    tarotCtx.fillStyle = "#d4af37";
    tarotCtx.font = `700 ${Math.max(9,Math.round(11*s))}px Georgia,serif`;
    tarotCtx.textAlign = "center"; tarotCtx.textBaseline = "middle";
    tarotCtx.fillText(card.name, 0, 0);
  }
  tarotCtx.shadowBlur = 0; tarotCtx.shadowOffsetY = 0;
  const gc = getCssVar("--cardStroke");
  tarotCtx.save();
  tarotCtx.shadowColor = gc; tarotCtx.shadowBlur = 18*s;
  tarotCtx.strokeStyle = gc; tarotCtx.lineWidth = 1.5*s; tarotCtx.globalAlpha = 0.92;
  roundRect(tarotCtx, x, y, w, h, r); tarotCtx.stroke();
  tarotCtx.shadowBlur = 8*s; tarotCtx.globalAlpha = 0.60; tarotCtx.lineWidth = 1*s;
  roundRect(tarotCtx, x+1*s, y+1*s, w-2*s, h-2*s, Math.max(2,r-1*s)); tarotCtx.stroke();
  tarotCtx.restore(); tarotCtx.restore();
}

function drawGildedCard(card) {
  const s = App.cardScale;
  const w = 86*s, h = 140*s;
  card.w = w; card.h = h;
  GildedMinima.draw(tarotCtx, card, card.x, card.y, w, h, card.rot, s);
}

function drawRuneCard(card) {
  const s = App.cardScale;
  const w = 82*s, h = 100*s;
  card.w = w; card.h = h;
  Runes.draw(tarotCtx, card, card.x, card.y, w, h, card.rot, s);
}

function clearCanvas() {
  tarotCtx.clearRect(0, 0, tarotCanvas.width, tarotCanvas.height);
  draws = [];
  hideDesc();
}

function redrawAll() {
  tarotCtx.clearRect(0, 0, tarotCanvas.width, tarotCanvas.height);
  for (const d of draws) {
    if      (d.type === "text")    drawTextCard(d);
    else if (d.type === "playing") drawPlayingCard(d);
    else if (d.type === "tarot")   drawTarotCard(d);
    else if (d.type === "luminous") drawLuminousCard(d);
    else if (d.type === "gilded")  drawGildedCard(d);
    else if (d.type === "rune")    drawRuneCard(d);
  }
}

function shuffleArray(arr) {
  for (let i = arr.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
}
