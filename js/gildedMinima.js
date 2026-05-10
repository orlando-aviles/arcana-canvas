/*********************************************************
 * GILDED MINIMA DECK
 * Dark indigo cards, gold geometry. No image files.
 * 78 cards: 22 majors + 56 minors (4 suits × 14).
 *********************************************************/
window.GildedMinima = (() => {

  // ── Pip layouts (normalized 0–1 within pip area) ──────
  const PIP_LAYOUTS = {
    1:  [[0.5, 0.5]],
    2:  [[0.5, 0.22], [0.5, 0.78]],
    3:  [[0.5, 0.15], [0.5, 0.5], [0.5, 0.85]],
    4:  [[0.28, 0.22], [0.72, 0.22], [0.28, 0.78], [0.72, 0.78]],
    5:  [[0.28, 0.18], [0.72, 0.18], [0.5, 0.5], [0.28, 0.82], [0.72, 0.82]],
    6:  [[0.28, 0.18], [0.72, 0.18], [0.28, 0.5], [0.72, 0.5], [0.28, 0.82], [0.72, 0.82]],
    7:  [[0.28, 0.15], [0.72, 0.15], [0.5, 0.33], [0.28, 0.52], [0.72, 0.52], [0.28, 0.85], [0.72, 0.85]],
    8:  [[0.28, 0.14], [0.72, 0.14], [0.28, 0.38], [0.72, 0.38], [0.28, 0.62], [0.72, 0.62], [0.28, 0.86], [0.72, 0.86]],
    9:  [[0.28, 0.12], [0.72, 0.12], [0.28, 0.34], [0.72, 0.34], [0.5, 0.5],  [0.28, 0.66], [0.72, 0.66], [0.28, 0.88], [0.72, 0.88]],
    10: [[0.28, 0.10], [0.72, 0.10], [0.5, 0.26],  [0.28, 0.38], [0.72, 0.38], [0.28, 0.62], [0.72, 0.62], [0.5, 0.74],  [0.28, 0.90], [0.72, 0.90]],
  };

  // ── Suits ──────────────────────────────────────────────
  const SUITS = [
    { name: "Wands",     sym: "𝌆", color: "#d4af37", accent: "#f5d76e" },
    { name: "Cups",      sym: "♦", color: "#a08cc0", accent: "#c8b4e8" },
    { name: "Swords",    sym: "✦", color: "#7ab8d4", accent: "#b2dced" },
    { name: "Pentacles", sym: "★", color: "#d4af37", accent: "#f5d76e" },
  ];

  const MINOR_RANKS = ["Ace","2","3","4","5","6","7","8","9","10","Page","Knight","Queen","King"];
  const COURT       = new Set(["Page","Knight","Queen","King"]);

  // ── Major Arcana ───────────────────────────────────────
  // Each major has: name, roman numeral, and a draw function
  // that renders its unique glyph centred at (0,0).
  // draw(ctx, r, s) — r = available radius, s = card scale
  const MAJORS = [
    {
      name: "The Fool", roman: "0",
      glyph(ctx, r, s) {
        // A circle with a small dot — the zero, the beginning
        ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2); ctx.fill();
        // tiny step mark
        ctx.beginPath();
        ctx.moveTo(-r * 0.3, r * 0.42);
        ctx.lineTo( r * 0.3, r * 0.42);
        ctx.stroke();
      }
    },
    {
      name: "The Magician", roman: "I",
      glyph(ctx, r, s) {
        // Infinity lemniscate above a vertical staff
        const a = r * 0.32, b = r * 0.18, cy = -r * 0.18;
        ctx.beginPath();
        // draw figure-8 / lemniscate approximation with beziers
        ctx.moveTo(0, cy);
        ctx.bezierCurveTo( a,  cy - b,  a * 1.6,  cy - b * 2.2,  a, cy);
        ctx.bezierCurveTo( a * 0.4, cy + b * 1.1,  -a * 0.4, cy + b * 1.1, -a, cy);
        ctx.bezierCurveTo(-a * 1.6, cy - b * 2.2, -a, cy - b, 0, cy);
        ctx.stroke();
        // staff
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(0, r * 0.52); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, r * 0.52, r * 0.07, 0, Math.PI * 2); ctx.fill();
      }
    },
    {
      name: "The High Priestess", roman: "II",
      glyph(ctx, r, s) {
        // Crescent moon — grace and mystery
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.52, Math.PI * 0.3, Math.PI * 1.7); ctx.stroke();
        ctx.beginPath();
        ctx.arc(r * 0.18, 0, r * 0.42, Math.PI * 0.35, Math.PI * 1.65, true); ctx.stroke();
        // veil line
        ctx.beginPath(); ctx.moveTo(-r*0.52, r*0.42); ctx.lineTo(r*0.52, r*0.42); ctx.stroke();
      }
    },
    {
      name: "The Empress", roman: "III",
      glyph(ctx, r, s) {
        // Venus symbol — circle over a cross
        ctx.beginPath(); ctx.arc(0, -r * 0.18, r * 0.36, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, r * 0.18); ctx.lineTo(0, r * 0.52); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-r * 0.24, r * 0.36); ctx.lineTo(r * 0.24, r * 0.36); ctx.stroke();
      }
    },
    {
      name: "The Emperor", roman: "IV",
      glyph(ctx, r, s) {
        // A square — order, authority, structure
        const d = r * 0.44;
        ctx.strokeRect(-d, -d, d * 2, d * 2);
        // inner point
        ctx.beginPath(); ctx.arc(0, 0, r * 0.1, 0, Math.PI * 2); ctx.fill();
        // four corner marks
        for (const [sx, sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
          ctx.beginPath(); ctx.arc(sx * d, sy * d, r * 0.06, 0, Math.PI * 2); ctx.fill();
        }
      }
    },
    {
      name: "The Hierophant", roman: "V",
      glyph(ctx, r, s) {
        // Triple cross — papal cross, triple authority
        const cx = r * 0.28, bx = r * 0.42;
        ctx.beginPath(); ctx.moveTo(0, -r * 0.52); ctx.lineTo(0,  r * 0.52); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-bx, -r * 0.28); ctx.lineTo(bx, -r * 0.28); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-cx, 0); ctx.lineTo(cx, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-cx * 0.6, r * 0.28); ctx.lineTo(cx * 0.6, r * 0.28); ctx.stroke();
      }
    },
    {
      name: "The Lovers", roman: "VI",
      glyph(ctx, r, s) {
        // Two interlocking rings — union
        const off = r * 0.2;
        ctx.beginPath(); ctx.arc(-off, 0, r * 0.38, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc( off, 0, r * 0.38, 0, Math.PI * 2); ctx.stroke();
        // heart-point above
        ctx.beginPath(); ctx.arc(0, -r * 0.52, r * 0.08, 0, Math.PI * 2); ctx.fill();
      }
    },
    {
      name: "The Chariot", roman: "VII",
      glyph(ctx, r, s) {
        // Forward-pointing arrow inside a circle — drive
        ctx.beginPath(); ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2); ctx.stroke();
        const tip = -r * 0.32, tail = r * 0.32, aw = r * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, tip);
        ctx.lineTo( aw, tail * 0.3);
        ctx.lineTo(0, tail * 0.05);
        ctx.lineTo(-aw, tail * 0.3);
        ctx.closePath(); ctx.fill();
      }
    },
    {
      name: "Strength", roman: "VIII",
      glyph(ctx, r, s) {
        // Lemniscate (∞) centred — infinite inner power
        const a = r * 0.46, b = r * 0.24;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo( a,  -b * 2.0,  a * 1.7,  -b,  a, 0);
        ctx.bezierCurveTo( a * 0.5, b * 1.2, -a * 0.5, b * 1.2, -a, 0);
        ctx.bezierCurveTo(-a * 1.7, -b,  -a, -b * 2.0, 0, 0);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2); ctx.fill();
      }
    },
    {
      name: "The Hermit", roman: "IX",
      glyph(ctx, r, s) {
        // Lantern — a hexagon with a ray upward
        const hr = r * 0.32;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
          i === 0 ? ctx.moveTo(Math.cos(a)*hr, Math.sin(a)*hr)
                  : ctx.lineTo(Math.cos(a)*hr, Math.sin(a)*hr);
        }
        ctx.closePath(); ctx.stroke();
        // inner light dot
        ctx.beginPath(); ctx.arc(0, 0, r * 0.09, 0, Math.PI * 2); ctx.fill();
        // staff up and down
        ctx.beginPath(); ctx.moveTo(0, -hr); ctx.lineTo(0, -r * 0.52); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,  hr); ctx.lineTo(0,  r * 0.52); ctx.stroke();
      }
    },
    {
      name: "Wheel of Fortune", roman: "X",
      glyph(ctx, r, s) {
        // Wheel — three concentric circles + 8 spokes
        ctx.beginPath(); ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, r * 0.30, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, r * 0.10, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * r * 0.10, Math.sin(a) * r * 0.10);
          ctx.lineTo(Math.cos(a) * r * 0.30, Math.sin(a) * r * 0.30);
          ctx.stroke();
        }
      }
    },
    {
      name: "Justice", roman: "XI",
      glyph(ctx, r, s) {
        // Balance scales — a horizontal bar, two pans
        ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.05); ctx.lineTo(r * 0.5, -r * 0.05); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -r * 0.05); ctx.lineTo(0, r * 0.48); ctx.stroke();
        // left pan arc
        ctx.beginPath(); ctx.arc(-r * 0.38, r * 0.14, r * 0.18, 0, Math.PI); ctx.stroke();
        // right pan arc
        ctx.beginPath(); ctx.arc( r * 0.38, r * 0.14, r * 0.18, 0, Math.PI); ctx.stroke();
        // top pivot dot
        ctx.beginPath(); ctx.arc(0, -r * 0.05, r * 0.07, 0, Math.PI * 2); ctx.fill();
      }
    },
    {
      name: "The Hanged Man", roman: "XII",
      glyph(ctx, r, s) {
        // Inverted triangle inside a circle — suspension, inversion
        ctx.beginPath(); ctx.arc(0, 0, r * 0.50, 0, Math.PI * 2); ctx.stroke();
        const tr = r * 0.32;
        // inverted triangle
        ctx.beginPath();
        ctx.moveTo(0,  tr);
        ctx.lineTo(-tr * 0.866, -tr * 0.5);
        ctx.lineTo( tr * 0.866, -tr * 0.5);
        ctx.closePath(); ctx.stroke();
        // hanging line from top of circle
        ctx.beginPath(); ctx.moveTo(0, -r*0.50); ctx.lineTo(0, -tr*0.5); ctx.stroke();
      }
    },
    {
      name: "Death", roman: "XIII",
      glyph(ctx, r, s) {
        // Hourglass — time and transformation
        const hw = r * 0.38, hh = r * 0.46;
        ctx.beginPath();
        ctx.moveTo(-hw, -hh); ctx.lineTo(hw, -hh);
        ctx.lineTo(0, 0);
        ctx.lineTo(hw, hh); ctx.lineTo(-hw, hh);
        ctx.lineTo(0, 0);
        ctx.closePath(); ctx.stroke();
        // top/bottom bars
        ctx.beginPath(); ctx.moveTo(-hw, -hh); ctx.lineTo(hw, -hh); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-hw,  hh); ctx.lineTo(hw,  hh); ctx.stroke();
        // centre grain
        ctx.beginPath(); ctx.arc(0, 0, r * 0.07, 0, Math.PI * 2); ctx.fill();
      }
    },
    {
      name: "Temperance", roman: "XIV",
      glyph(ctx, r, s) {
        // Two vessels pouring into each other — flow, balance
        // Left vessel
        ctx.beginPath();
        ctx.moveTo(-r*0.42, -r*0.38);
        ctx.lineTo(-r*0.22, -r*0.38);
        ctx.lineTo(-r*0.14,  r*0.12);
        ctx.lineTo(-r*0.44,  r*0.12);
        ctx.closePath(); ctx.stroke();
        // Right vessel
        ctx.beginPath();
        ctx.moveTo( r*0.42, -r*0.38);
        ctx.lineTo( r*0.22, -r*0.38);
        ctx.lineTo( r*0.14,  r*0.12);
        ctx.lineTo( r*0.44,  r*0.12);
        ctx.closePath(); ctx.stroke();
        // flow arc between them
        ctx.beginPath();
        ctx.moveTo(-r*0.14, -r*0.1);
        ctx.bezierCurveTo(-r*0.02, r*0.28, r*0.02, r*0.28, r*0.14, -r*0.1);
        ctx.stroke();
      }
    },
    {
      name: "The Devil", roman: "XV",
      glyph(ctx, r, s) {
        // Inverted pentagram — 5-pointed star upside-down
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * 4 / 5) * Math.PI * 2 + Math.PI / 2; // *4 for star skip, +PI to invert
          const x = Math.cos(a) * r * 0.48, y = Math.sin(a) * r * 0.48;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, r * 0.09, 0, Math.PI * 2); ctx.fill();
      }
    },
    {
      name: "The Tower", roman: "XVI",
      glyph(ctx, r, s) {
        // Tall rectangle with a lightning bolt through it
        const tw = r * 0.26, th = r * 0.50;
        ctx.strokeRect(-tw, -th, tw * 2, th * 2);
        // battlements at top
        const bn = 3, bw = (tw * 2) / (bn * 2 - 1);
        for (let i = 0; i < bn; i++) {
          ctx.fillRect(-tw + i * bw * 2, -th - bw * 0.8, bw, bw * 0.8);
        }
        // lightning bolt through centre
        ctx.beginPath();
        ctx.moveTo( r*0.12, -r*0.38);
        ctx.lineTo(-r*0.08,  r*0.02);
        ctx.lineTo( r*0.08,  r*0.02);
        ctx.lineTo(-r*0.12,  r*0.38);
        ctx.stroke();
      }
    },
    {
      name: "The Star", roman: "XVII",
      glyph(ctx, r, s) {
        // Eight-pointed star — hope, radiance
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const inner = i % 2 === 0 ? r * 0.48 : r * 0.22;
          const x = Math.cos(a) * inner, y = Math.sin(a) * inner;
          if (i === 0) ctx.beginPath(), ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, r * 0.10, 0, Math.PI * 2); ctx.fill();
      }
    },
    {
      name: "The Moon", roman: "XVIII",
      glyph(ctx, r, s) {
        // Full moon with crescent shadow — duality
        ctx.beginPath(); ctx.arc(0, 0, r * 0.46, 0, Math.PI * 2); ctx.stroke();
        // shadow crescent
        ctx.beginPath();
        ctx.arc(r * 0.20, 0, r * 0.34, 0, Math.PI * 2);
        ctx.fillStyle = "#0f0c24"; ctx.fill();
        ctx.strokeStyle = "rgba(212,175,55,0.3)"; ctx.stroke();
        // reset stroke
        ctx.strokeStyle = "#d4af37";
        // three small drops falling (reflection in water)
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath(); ctx.arc(i * r * 0.22, r * 0.56, r * 0.04, 0, Math.PI * 2);
          ctx.fillStyle = "#d4af37"; ctx.fill();
        }
      }
    },
    {
      name: "The Sun", roman: "XIX",
      glyph(ctx, r, s) {
        // Sun — circle with 12 rays alternating long/short
        ctx.beginPath(); ctx.arc(0, 0, r * 0.24, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          const inner = r * 0.28, outer = i % 2 === 0 ? r * 0.52 : r * 0.40;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
          ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
          ctx.stroke();
        }
      }
    },
    {
      name: "Judgement", roman: "XX",
      glyph(ctx, r, s) {
        // Trumpet from above, rising arc below — the call
        // Bell of trumpet
        ctx.beginPath();
        ctx.moveTo(-r*0.38, -r*0.18);
        ctx.bezierCurveTo(-r*0.38, -r*0.52,  r*0.38, -r*0.52,  r*0.38, -r*0.18);
        ctx.lineTo(r*0.10, -r*0.02);
        ctx.lineTo(-r*0.10, -r*0.02);
        ctx.closePath(); ctx.stroke();
        // rising arc — souls emerging
        ctx.beginPath();
        ctx.arc(0, r*0.30, r*0.30, Math.PI, 0);
        ctx.stroke();
        // three rising figures (dots)
        for (const [dx, dy] of [[-r*0.22, r*0.18],[0, r*0.08],[r*0.22, r*0.18]]) {
          ctx.beginPath(); ctx.arc(dx, dy, r*0.06, 0, Math.PI*2); ctx.fill();
        }
      }
    },
    {
      name: "The World", roman: "XXI",
      glyph(ctx, r, s) {
        // Ellipse wreath with a star at centre — completion
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.28, r * 0.52, 0, 0, Math.PI * 2); ctx.stroke();
        // outer wreath dots (8 around the ellipse)
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const ex = Math.cos(a) * r * 0.28 * 1.55;
          const ey = Math.sin(a) * r * 0.52 * 1.15;
          ctx.beginPath(); ctx.arc(ex, ey, r * 0.05, 0, Math.PI * 2); ctx.fill();
        }
        // centre 4-pointed star
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * r * 0.18, Math.sin(a) * r * 0.18);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(0, 0, r * 0.06, 0, Math.PI * 2); ctx.fill();
      }
    },
  ];

  // ── Palette ────────────────────────────────────────────
  const CARD_BG_TOP     = "#0f0c24";
  const CARD_BG_BOT     = "#1a1438";
  const BORDER_GOLD     = "#d4af37";
  const BORDER_GOLD_DIM = "#7a6120";

  // ── Shared draw utilities ──────────────────────────────
  function drawOrnament(ctx, x, y, s) {
    ctx.save();
    ctx.fillStyle = BORDER_GOLD;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    const d = 3 * s;
    ctx.moveTo(x, y - d); ctx.lineTo(x + d, y);
    ctx.lineTo(x, y + d); ctx.lineTo(x - d, y);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawCardBase(ctx, x, y, w, h, r, s) {
    // shadow
    ctx.shadowColor = "rgba(0,0,0,0.65)";
    ctx.shadowBlur = 18 * s;
    ctx.shadowOffsetY = 10 * s;

    const bg = ctx.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, CARD_BG_TOP);
    bg.addColorStop(1, CARD_BG_BOT);
    ctx.fillStyle = bg;
    roundRect(ctx, x, y, w, h, r); ctx.fill();

    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    ctx.strokeStyle = BORDER_GOLD; ctx.lineWidth = 1.5 * s;
    roundRect(ctx, x, y, w, h, r); ctx.stroke();

    const ib = 6 * s;
    ctx.strokeStyle = BORDER_GOLD_DIM; ctx.lineWidth = 0.8 * s;
    roundRect(ctx, x + ib, y + ib, w - ib*2, h - ib*2, Math.max(2, r - ib)); ctx.stroke();

    // corner ornaments
    for (const [ox, oy] of [[x+3*s, y+3*s],[x+w-3*s, y+3*s],[x+3*s, y+h-3*s],[x+w-3*s, y+h-3*s]]) {
      drawOrnament(ctx, ox, oy, s);
    }
  }

  function drawPip(ctx, x, y, size, suit) {
    ctx.save();
    ctx.font = `${size}px serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = suit.color;
    ctx.shadowColor = suit.accent; ctx.shadowBlur = size * 0.6;
    ctx.fillText(suit.sym, x, y);
    ctx.restore();
  }

  // ── Major card draw ────────────────────────────────────
  function drawMajor(ctx, card, cx, cy, w, h, rot, s) {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot || 0);

    const x = -w/2, y = -h/2, r = 12 * s;
    drawCardBase(ctx, x, y, w, h, r, s);

    const major = MAJORS[card.majorIdx];

    // Roman numeral top-centre
    const numSize = Math.max(7, 9 * s);
    ctx.font = `400 ${numSize}px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = "rgba(212,175,55,0.60)";
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText(major.roman, 0, y + 10 * s);

    // Card name bottom-centre in small caps style
    const nameSize = Math.max(6, 7.5 * s);
    ctx.font = `700 ${nameSize}px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = "rgba(212,175,55,0.72)";
    ctx.textBaseline = "bottom";
    ctx.fillText(major.name.toUpperCase(), 0, y + h - 9 * s);

    // Central glyph — drawn in a circle frame
    const glyphR = Math.min(w, h) * 0.28;
    const glyphCY = (y + h/2) - h * 0.04; // slightly above centre

    // Glyph circle frame
    ctx.strokeStyle = "rgba(212,175,55,0.18)";
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath(); ctx.arc(0, glyphCY - y - h/2, glyphR * 1.22, 0, Math.PI * 2); ctx.stroke();

    // Apply glyph transform and draw
    ctx.save();
    ctx.translate(0, glyphCY - y - h/2);
    ctx.strokeStyle = BORDER_GOLD;
    ctx.fillStyle   = BORDER_GOLD;
    ctx.lineWidth   = 1.4 * s;
    ctx.shadowColor = "#f5d76e";
    ctx.shadowBlur  = 8 * s;
    major.glyph(ctx, glyphR, s);
    ctx.restore();

    ctx.restore();
  }

  // ── Minor card draw ────────────────────────────────────
  function drawMinor(ctx, card, cx, cy, w, h, rot, s) {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot || 0);

    const x = -w/2, y = -h/2, r = 12 * s;
    drawCardBase(ctx, x, y, w, h, r, s);

    const suit = SUITS[card.suitIdx];

    // Rank label top-left and bottom-right (rotated 180)
    const rankFontSize = Math.max(10, 13 * s);
    ctx.font = `700 ${rankFontSize}px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = BORDER_GOLD;
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(card.rank, x + 10*s, y + 9*s);
    ctx.save(); ctx.rotate(Math.PI);
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(card.rank, x + 10*s, y + 9*s);
    ctx.restore();

    // Suit symbol corner
    const cornerSymSize = Math.max(8, 10 * s);
    ctx.font = `${cornerSymSize}px serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = suit.color;
    ctx.fillText(suit.sym, x + 14*s, y + 28*s);
    ctx.save(); ctx.rotate(Math.PI);
    ctx.fillText(suit.sym, x + 14*s, y + 28*s);
    ctx.restore();

    // Suit name bottom centre
    const suitFontSize = Math.max(6, 8 * s);
    ctx.font = `400 ${suitFontSize}px Georgia, serif`;
    ctx.fillStyle = "rgba(212,175,55,0.55)";
    ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    ctx.fillText(suit.name.toUpperCase(), 0, y + h - 8*s);

    // Pips or court glyph
    const pipArea = {
      left: x + 16*s, top: y + 38*s,
      right: x + w - 16*s, bottom: y + h - 38*s,
    };
    const pipW = pipArea.right - pipArea.left;
    const pipH = pipArea.bottom - pipArea.top;

    if (COURT.has(card.rank)) {
      const bigSize = Math.max(20, 42 * s);
      ctx.font = `${bigSize}px serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = suit.color;
      ctx.shadowColor = suit.accent; ctx.shadowBlur = bigSize * 0.7;
      ctx.fillText(suit.sym, 0, (pipArea.top + pipArea.bottom)/2 - y - h/2);
      ctx.shadowBlur = 0;
      const bannerY = pipArea.bottom - y - h/2 - 2*s;
      ctx.font = `italic 700 ${Math.max(7, 9*s)}px Georgia, serif`;
      ctx.fillStyle = "rgba(212,175,55,0.72)"; ctx.textBaseline = "bottom";
      ctx.fillText(card.rank.toUpperCase(), 0, bannerY);
    } else {
      const count = card.rank === "Ace" ? 1 : parseInt(card.rank);
      const layout = PIP_LAYOUTS[count] || PIP_LAYOUTS[1];
      const pipSize = Math.max(10, Math.min(22*s, pipW * 0.28));
      for (const [nx, ny] of layout) {
        const px = pipArea.left + nx * pipW;
        const py = pipArea.top  + ny * pipH;
        drawPip(ctx, px - x - w/2 + x + w/2, py - y - h/2 + y + h/2, pipSize, suit);
      }
    }

    ctx.restore();
  }

  // ── Public draw dispatcher ─────────────────────────────
  function draw(ctx, card, cx, cy, w, h, rot, s) {
    if (card.isMajor) drawMajor(ctx, card, cx, cy, w, h, rot, s);
    else              drawMinor(ctx, card, cx, cy, w, h, rot, s);
  }

  // ── randomCard — 22 majors + 56 minors weighted evenly ─
  function randomCard() {
    const total = MAJORS.length + MINOR_RANKS.length * SUITS.length; // 22 + 56 = 78
    const roll  = Math.floor(Math.random() * total);
    if (roll < MAJORS.length) {
      return { isMajor: true, majorIdx: roll, type: "gilded" };
    }
    const minorIdx = roll - MAJORS.length;
    const suitIdx  = Math.floor(minorIdx / MINOR_RANKS.length) % SUITS.length;
    const rankIdx  = minorIdx % MINOR_RANKS.length;
    return {
      isMajor: false,
      rank: MINOR_RANKS[rankIdx],
      suitIdx,
      suit: SUITS[suitIdx],
      type: "gilded",
    };
  }

  return { draw, randomCard, SUITS, MAJORS, MINOR_RANKS };
})();
