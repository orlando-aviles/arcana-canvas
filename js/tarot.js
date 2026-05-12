/*********************************************************
 * TAROT CANVAS DRAWING
 *********************************************************/
const tarotCanvas = document.getElementById("tarotCanvas");
const tarotCtx    = tarotCanvas.getContext("2d");
tarotCtx.imageSmoothingEnabled = true;

let draws = [];

const REVERSAL_CHANCE = 0.40;

function rollReversal() {
  return App.reversals && Math.random() < REVERSAL_CHANCE;
}

// Text deck names
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

/**** Playing card mini-deck ****/
const Playing = (() => {
  const suits = [
    { sym: "♠", color: "#111" },
    { sym: "♥", color: "#b0122b" },
    { sym: "♦", color: "#b0122b" },
    { sym: "♣", color: "#111" },
  ];
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  function randomCard() {
    const s = suits[Math.floor(Math.random() * suits.length)];
    const r = ranks[Math.floor(Math.random() * ranks.length)];
    return { rank: r, suit: s.sym, ink: s.color };
  }
  return { randomCard };
})();

/**** Canvas resize ****/
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

/**** Draw dispatcher — called by click (mouse) and gestures.js (touch) ****/
function dispatchDraw(x, y) {
  const deck = App.activeDeck;
  const rev  = rollReversal();
  // Small random tilt (-5° to +5°), reversed cards get +180°
  const baseTilt = (Math.random() * 10 - 5) * (Math.PI / 180);
  const rot = baseTilt + (rev ? Math.PI : 0);

  if (deck === "text") {
    // Pick from a shuffled *copy* so the source array isn't mutated
    const pool = tarotNames.slice();
    shuffleArray(pool);
    const name = rev ? pool[0] + " (R)" : pool[0];
    const card = { type: "text", x, y, name };
    draws.push(card); drawTextCard(card); return;
  }

  if (deck === "playing") {
    const c = Playing.randomCard();
    const card = { type: "playing", x, y, rank: c.rank, suit: c.suit, ink: c.ink, rot };
    draws.push(card); drawPlayingCard(card); return;
  }

  if (deck === "riderwaite") {
    const t = Tarot.randomCard("riderwaite");
    const card = { type: "tarot", x, y, name: t.name, deckKey: "riderwaite", rot };
    draws.push(card); drawTarotCard(card); return;
  }

  if (deck === "luminousarc") {
    const t = Tarot.randomCard("luminousarc");
    const card = { type: "luminous", x, y, name: t.name, deckKey: "luminousarc", rot };
    draws.push(card); drawLuminousCard(card); return;
  }

  if (deck === "gilded") {
    const g = GildedMinima.randomCard();
    const card = { type: "gilded", x, y, rank: g.rank, suitIdx: g.suitIdx, isMajor: g.isMajor, majorIdx: g.majorIdx, rot };
    draws.push(card); drawGildedCard(card); return;
  }

  if (deck === "runes") {
    const runeRev = rollReversal();
    const runeRot = (Math.random() * 10 - 5) * (Math.PI / 180) + (runeRev ? Math.PI : 0);
    const r = Runes.randomCard();
    const card = { type: "rune", x, y, runeIdx: r.runeIdx, rot: runeRot };
    draws.push(card); drawRuneCard(card); return;
  }
}

/**** Hit testing — find topmost card at a point ****/
function cardAt(x, y) {
  const s = App.cardScale;
  // Walk backwards so topmost (last drawn) card wins
  for (let i = draws.length - 1; i >= 0; i--) {
    const c = draws[i];
    let hw, hh; // half-width, half-height of bounding box
    if      (c.type === "text")    { hw = 80 * s;  hh = 14 * s; }
    else if (c.type === "playing") { hw = 46 * s;  hh = 62 * s; }
    else if (c.type === "tarot")   { hw = 46 * s;  hh = 74 * s; }
    else if (c.type === "luminous"){ hw = 58 * s;  hh = 90 * s; }
    else if (c.type === "gilded")  { hw = 46 * s;  hh = 74 * s; }
    else if (c.type === "rune")    { hw = 44 * s;  hh = 54 * s; }
    else continue;

    // Rotate the test point into the card's local space
    const rot = c.rot || 0;
    const dx = x - c.x;
    const dy = y - c.y;
    const lx =  dx * Math.cos(rot) + dy * Math.sin(rot);
    const ly = -dx * Math.sin(rot) + dy * Math.cos(rot);
    if (Math.abs(lx) <= hw && Math.abs(ly) <= hh) return i;
  }
  return -1;
}

/**** Card name for description overlay ****/
function cardDisplayName(card) {
  if (card.type === "text")    return card.name;
  if (card.type === "playing") return `${card.rank}${card.suit}`;
  if (card.type === "tarot" || card.type === "luminous") return card.name;
  if (card.type === "gilded")  return card.isMajor
    ? GildedMinima.majorName(card.majorIdx)
    : GildedMinima.minorName(card.rank, card.suitIdx);
  if (card.type === "rune")    return Runes.name(card.runeIdx);
  return "";
}

/**** Interaction ****/
// Unified system — no click event used anywhere.
// Mouse: mousedown tracks state, mouseup draws or ends drag.
// Touch: touchstart intercepts card hits for hold/drag,
//        clean touchend draws. Multi-touch passes through for zoom/pan.

const HOLD_MS   = 400;
const DRAG_SLOP = 10;

const descOverlay = document.getElementById("descOverlay");
const descTitle   = document.getElementById("descTitle");
const descBody    = document.getElementById("descBody");

function showDesc(card) {
  descTitle.textContent = cardDisplayName(card);
  const isReversed = cardDisplayName(card).endsWith(" (R)");
  descBody.textContent  = Meanings.get(cardDisplayName(card), isReversed);
  descOverlay.classList.add("visible");
}
function hideDesc() {
  descOverlay.classList.remove("visible");
}
descOverlay.addEventListener("click", hideDesc);

// ── Touch (mobile) ────────────────────────────────────────
let _touch = null;

tarotCanvas.addEventListener("touchstart", (e) => {
  if (e.touches.length !== 1) return; // multi-touch = browser zoom/pan
  const t = e.touches[0];
  const cardIdx = cardAt(t.clientX, t.clientY);

  // Always intercept — we handle draw, hold, and drag from here
  e.preventDefault();

  const holdTimer = setTimeout(() => {
    if (_touch) {
      _touch.isHold = true;
      if (cardIdx >= 0) showDesc(draws[cardIdx]);
    }
  }, HOLD_MS);

  _touch = {
    cardIdx,
    startX: t.clientX, startY: t.clientY,
    dragOffsetX: cardIdx >= 0 ? t.clientX - draws[cardIdx].x : 0,
    dragOffsetY: cardIdx >= 0 ? t.clientY - draws[cardIdx].y : 0,
    holdTimer,
    isDrag: false,
    isHold: false,
  };
}, { passive: false });

tarotCanvas.addEventListener("touchmove", (e) => {
  if (!_touch) return;
  if (e.touches.length !== 1) return;
  const t = e.touches[0];
  const dx = t.clientX - _touch.startX;
  const dy = t.clientY - _touch.startY;

  if (!_touch.isDrag && Math.hypot(dx, dy) > DRAG_SLOP) {
    clearTimeout(_touch.holdTimer);
    _touch.isDrag = true;
    hideDesc();
  }

  if (_touch.isDrag && _touch.cardIdx >= 0) {
    e.preventDefault();
    const card = draws[_touch.cardIdx];
    card.x = t.clientX - _touch.dragOffsetX;
    card.y = t.clientY - _touch.dragOffsetY;
    redrawAll();
  }
}, { passive: false });

tarotCanvas.addEventListener("touchend", (e) => {
  if (!_touch) return;
  clearTimeout(_touch.holdTimer);
  const wasDrag = _touch.isDrag;
  const wasHold = _touch.isHold;
  const cardIdx = _touch.cardIdx;
  const x = e.changedTouches[0].clientX;
  const y = e.changedTouches[0].clientY;
  _touch = null;

  e.preventDefault(); // always suppress ghost click

  if (wasHold || wasDrag) return;

  // Clean tap — draw a card
  dispatchDraw(x, y);
}, { passive: false });

// ── Mouse (desktop) ───────────────────────────────────────
let _mouse = null;

tarotCanvas.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  const cardIdx = cardAt(e.clientX, e.clientY);

  const holdTimer = setTimeout(() => {
    if (_mouse) {
      _mouse.isHold = true;
      if (cardIdx >= 0) showDesc(draws[cardIdx]);
    }
  }, HOLD_MS);

  _mouse = {
    cardIdx,
    startX: e.clientX, startY: e.clientY,
    dragOffsetX: cardIdx >= 0 ? e.clientX - draws[cardIdx].x : 0,
    dragOffsetY: cardIdx >= 0 ? e.clientY - draws[cardIdx].y : 0,
    holdTimer,
    isDrag: false,
    isHold: false,
  };
});

tarotCanvas.addEventListener("mousemove", (e) => {
  if (!_mouse) return;
  const dx = e.clientX - _mouse.startX;
  const dy = e.clientY - _mouse.startY;

  if (!_mouse.isDrag && Math.hypot(dx, dy) > DRAG_SLOP) {
    clearTimeout(_mouse.holdTimer);
    _mouse.isDrag = true;
    hideDesc();
  }

  if (_mouse.isDrag && _mouse.cardIdx >= 0) {
    const card = draws[_mouse.cardIdx];
    card.x = e.clientX - _mouse.dragOffsetX;
    card.y = e.clientY - _mouse.dragOffsetY;
    redrawAll();
  }
});

tarotCanvas.addEventListener("mouseup", (e) => {
  if (!_mouse) return;
  clearTimeout(_mouse.holdTimer);
  const wasDrag = _mouse.isDrag;
  const wasHold = _mouse.isHold;
  _mouse = null;

  if (wasHold || wasDrag) return;

  // Clean click — draw a card
  dispatchDraw(e.clientX, e.clientY);
});

// Cancel drag if mouse leaves canvas
tarotCanvas.addEventListener("mouseleave", () => {
  if (_mouse) { clearTimeout(_mouse.holdTimer); _mouse = null; }
});


/**** Draw helpers ****/

function drawTextCard(card) {
  const s = App.cardScale;
  const isReversed = card.name.endsWith(" (R)");
  const paddingX = 8 * s;
  const r = 4 * s;

  tarotCtx.save();
  tarotCtx.font = `${Math.max(10, Math.round(12 * s))}px Arial`;
  tarotCtx.textBaseline = "middle";

  const textW = tarotCtx.measureText(card.name).width;
  const w = Math.ceil(textW + paddingX * 2);
  const h = Math.round(22 * s);
  const x = Math.round(card.x - w / 2);
  const y = Math.round(card.y - h / 2);

  tarotCtx.fillStyle = getCssVar("--cardBg");
  roundRect(tarotCtx, x, y, w, h, r); tarotCtx.fill();

  // Reversed cards get a subtle warm tint on the border
  tarotCtx.strokeStyle = isReversed
    ? "rgba(180, 60, 60, 0.55)"
    : getCssVar("--cardStroke");
  tarotCtx.lineWidth = isReversed ? 1.5 : 1;
  tarotCtx.stroke();

  tarotCtx.fillStyle = isReversed
    ? "rgba(220, 140, 140, 0.92)"
    : getCssVar("--cardText");
  tarotCtx.shadowColor = "rgba(0,0,0,0.55)";
  tarotCtx.shadowBlur = 4 * s;
  tarotCtx.fillText(card.name, x + paddingX, y + h / 2 + 0.5);

  tarotCtx.restore();
}

function drawPlayingCard(card) {
  const s = App.cardScale;
  const w = 86 * s; const h = 120 * s; const r = 10 * s;

  tarotCtx.save();
  tarotCtx.translate(card.x, card.y);
  tarotCtx.rotate(card.rot);

  tarotCtx.shadowColor = "rgba(0,0,0,0.55)";
  tarotCtx.shadowBlur = 18 * s; tarotCtx.shadowOffsetY = 10 * s;

  const x = -w / 2; const y = -h / 2;
  const g = tarotCtx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "rgba(255,255,255,0.98)");
  g.addColorStop(1, "rgba(245,245,245,0.96)");
  tarotCtx.fillStyle = g;
  roundRect(tarotCtx, x, y, w, h, r); tarotCtx.fill();

  tarotCtx.shadowBlur = 0; tarotCtx.shadowOffsetY = 0;
  tarotCtx.strokeStyle = "rgba(0,0,0,0.12)"; tarotCtx.lineWidth = 1;
  roundRect(tarotCtx, x, y, w, h, r); tarotCtx.stroke();
  tarotCtx.strokeStyle = "rgba(0,0,0,0.08)"; tarotCtx.lineWidth = 1;
  roundRect(tarotCtx, x+6*s, y+6*s, w-12*s, h-12*s, Math.max(2,r-3*s)); tarotCtx.stroke();

  tarotCtx.fillStyle = card.ink;
  tarotCtx.font = `900 ${Math.max(10,Math.round(14*s))}px ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial`;
  tarotCtx.textBaseline = "top"; tarotCtx.textAlign = "left";
  tarotCtx.fillText(`${card.rank}${card.suit}`, x+12*s, y+10*s);
  tarotCtx.font = `900 ${Math.max(18,Math.round(46*s))}px ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial`;
  tarotCtx.textAlign = "center"; tarotCtx.textBaseline = "middle";
  tarotCtx.fillText(card.suit, 0, 2*s);
  tarotCtx.save(); tarotCtx.rotate(Math.PI);
  tarotCtx.font = `900 ${Math.max(10,Math.round(14*s))}px ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial`;
  tarotCtx.textAlign = "left"; tarotCtx.textBaseline = "top";
  tarotCtx.fillText(`${card.rank}${card.suit}`, x+12*s, y+10*s);
  tarotCtx.restore();
  tarotCtx.restore();
}

function drawTarotCard(card) {
  const s = App.cardScale;
  const w = 86 * s; const h = 140 * s; const r = 12 * s;
  const img = Tarot.getImage(card.name, card.deckKey || "riderwaite");

  tarotCtx.save();
  tarotCtx.translate(card.x, card.y);
  tarotCtx.rotate(card.rot || 0);

  tarotCtx.shadowColor = "rgba(0,0,0,0.60)";
  tarotCtx.shadowBlur = 18 * s; tarotCtx.shadowOffsetY = 10 * s;

  const x = -w/2; const y = -h/2;
  const g = tarotCtx.createLinearGradient(x, y, x, y+h);
  g.addColorStop(0,"rgba(255,255,255,0.98)");
  g.addColorStop(1,"rgba(245,245,245,0.96)");
  tarotCtx.fillStyle = g;
  roundRect(tarotCtx, x, y, w, h, r); tarotCtx.fill();

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
    tarotCtx.font = `900 ${Math.max(10,Math.round(12*s))}px ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial`;
    tarotCtx.textAlign = "center"; tarotCtx.textBaseline = "middle";
    tarotCtx.fillText(card.name, 0, 0);
  }
  tarotCtx.restore();
}

function drawLuminousCard(card) {
  const s = App.cardScale;
  // Larger card — edge-to-edge image, no white base
  const w = 108 * s; const h = 176 * s; const r = 14 * s;
  const img = Tarot.getImage(card.name, "luminousarc");

  tarotCtx.save();
  tarotCtx.translate(card.x, card.y);
  tarotCtx.rotate(card.rot || 0);

  const x = -w/2; const y = -h/2;

  // Drop shadow — deeper to match larger card
  tarotCtx.shadowColor = "rgba(0,0,0,0.72)";
  tarotCtx.shadowBlur  = 28 * s;
  tarotCtx.shadowOffsetY = 14 * s;

  if (img) {
    // Clip to rounded rect and draw image edge-to-edge
    tarotCtx.save();
    roundRect(tarotCtx, x, y, w, h, r);
    tarotCtx.clip();
    tarotCtx.drawImage(img, x, y, w, h);
    tarotCtx.restore();
  } else {
    // Fallback: dark fill with name
    tarotCtx.fillStyle = "#0f0c24";
    roundRect(tarotCtx, x, y, w, h, r); tarotCtx.fill();
    tarotCtx.fillStyle = "#d4af37";
    tarotCtx.font = `700 ${Math.max(9, Math.round(11*s))}px Georgia, serif`;
    tarotCtx.textAlign = "center"; tarotCtx.textBaseline = "middle";
    tarotCtx.fillText(card.name, 0, 0);
  }

  tarotCtx.shadowBlur = 0; tarotCtx.shadowOffsetY = 0;

  // Bright thin gilded glow — no white, pure hue-reactive stroke
  const guildColor = getCssVar("--cardStroke");
  tarotCtx.save();
  tarotCtx.shadowColor = guildColor;
  tarotCtx.shadowBlur  = 18 * s;
  tarotCtx.strokeStyle = guildColor;
  tarotCtx.lineWidth   = 1.5 * s;
  tarotCtx.globalAlpha = 0.92;
  roundRect(tarotCtx, x, y, w, h, r);
  tarotCtx.stroke();
  // Second pass — tighter, brighter inner edge of the glow
  tarotCtx.shadowBlur  = 8 * s;
  tarotCtx.globalAlpha = 0.60;
  tarotCtx.lineWidth   = 1 * s;
  roundRect(tarotCtx, x + 1*s, y + 1*s, w - 2*s, h - 2*s, Math.max(2, r - 1*s));
  tarotCtx.stroke();
  tarotCtx.restore();

  tarotCtx.restore();
}

function drawGildedCard(card) {
  const s = App.cardScale;
  const w = 86 * s; const h = 140 * s;
  GildedMinima.draw(tarotCtx, card, card.x, card.y, w, h, card.rot, s);
}

function drawRuneCard(card) {
  const s = App.cardScale;
  // Stone is oval: wider than tall slightly
  const w = 82 * s; const h = 100 * s;
  Runes.draw(tarotCtx, card, card.x, card.y, w, h, card.rot, s);
}


function clearCanvas() {
  tarotCtx.clearRect(0, 0, tarotCanvas.width, tarotCanvas.height);
  draws = [];
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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
