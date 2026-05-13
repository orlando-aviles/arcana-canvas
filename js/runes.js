/*********************************************************
 * RUNES DECK — Elder Futhark (24)
 * Each rune is a smooth stone SVG rendered to an
 * offscreen canvas, with the rune glyph etched over it
 * in the active aura color. Floating stone, no card frame.
 *********************************************************/
window.Runes = (() => {

  // ── Elder Futhark 24 ─────────────────────────────────────
  // Each rune: name, phoneme, meaning, and a draw fn
  // draw(ctx, cx, cy, size, color, accentColor)
  // size = radius of the stone's short axis
  const RUNES = [
    {
      name: "Fehu", phoneme: "F",
      meaning: "Cattle — Wealth, abundance, new beginnings",
      draw(ctx, s, c, a) {
        // ᚠ vertical staff + two right-pointing branches up
        line(ctx, 0, -s*.55, 0, s*.55);
        line(ctx, 0, -s*.55, s*.38, -s*.15);
        line(ctx, 0, -s*.18, s*.38,  s*.18);
      }
    },
    {
      name: "Uruz", phoneme: "U",
      meaning: "Aurochs — Strength, health, primal force",
      draw(ctx, s, c, a) {
        // ᚢ two vertical legs joined by arch at top
        line(ctx, -s*.22, -s*.55, -s*.22, s*.55);
        line(ctx, -s*.22, -s*.55,  s*.22, s*.1);
        line(ctx,  s*.22,  s*.1,   s*.22, s*.55);
      }
    },
    {
      name: "Thurisaz", phoneme: "TH",
      meaning: "Thorn — Protection, defence, reactive force",
      draw(ctx, s, c, a) {
        // ᚦ vertical with right-pointing diamond thorn
        line(ctx, 0, -s*.55, 0, s*.55);
        line(ctx, 0, -s*.2,  s*.42, s*.08);
        line(ctx, 0,  s*.38, s*.42, s*.08);
      }
    },
    {
      name: "Ansuz", phoneme: "A",
      meaning: "God — Signals, messages, wisdom",
      draw(ctx, s, c, a) {
        // ᚨ staff + two left branches
        line(ctx, 0, -s*.55, 0, s*.55);
        line(ctx, 0, -s*.55, -s*.36, -s*.15);
        line(ctx, 0, -s*.18, -s*.36,  s*.18);
      }
    },
    {
      name: "Raidho", phoneme: "R",
      meaning: "Ride — Journey, rhythm, right action",
      draw(ctx, s, c, a) {
        // ᚱ staff + arch right top + diagonal leg
        line(ctx, -s*.1, -s*.55, -s*.1, s*.55);
        line(ctx, -s*.1, -s*.55,  s*.28, -s*.3);
        line(ctx,  s*.28, -s*.3,  s*.28,  s*.02);
        line(ctx,  s*.28,  s*.02, -s*.1,  s*.02);
        line(ctx,  s*.1,   s*.02,  s*.36,  s*.55);
      }
    },
    {
      name: "Kenaz", phoneme: "K",
      meaning: "Torch — Knowledge, creativity, illumination",
      draw(ctx, s, c, a) {
        // ᚲ staff + single right branch downward
        line(ctx, -s*.1, -s*.55, -s*.1, s*.55);
        line(ctx, -s*.1, -s*.1,   s*.36, s*.45);
      }
    },
    {
      name: "Gebo", phoneme: "G",
      meaning: "Gift — Exchange, partnership, generosity",
      draw(ctx, s, c, a) {
        // ᚷ X shape
        line(ctx, -s*.38, -s*.52,  s*.38,  s*.52);
        line(ctx,  s*.38, -s*.52, -s*.38,  s*.52);
      }
    },
    {
      name: "Wunjo", phoneme: "W",
      meaning: "Joy — Harmony, belonging, wellbeing",
      draw(ctx, s, c, a) {
        // ᚹ staff + flag shape right at top
        line(ctx, -s*.1, -s*.55, -s*.1, s*.55);
        line(ctx, -s*.1, -s*.55,  s*.34, -s*.18);
        line(ctx,  s*.34, -s*.18, -s*.1, s*.18);
      }
    },
    {
      name: "Hagalaz", phoneme: "H",
      meaning: "Hail — Disruption, transformation, patterns",
      draw(ctx, s, c, a) {
        // ᚺ two verticals + centre crossbar
        line(ctx, -s*.28, -s*.55, -s*.28, s*.55);
        line(ctx,  s*.28, -s*.55,  s*.28, s*.55);
        line(ctx, -s*.28,  0,      s*.28,  0);
      }
    },
    {
      name: "Naudhiz", phoneme: "N",
      meaning: "Need — Necessity, constraint, endurance",
      draw(ctx, s, c, a) {
        // ᚾ two verticals + diagonal cross-stroke
        line(ctx, -s*.28, -s*.55, -s*.28, s*.55);
        line(ctx,  s*.28, -s*.55,  s*.28, s*.55);
        line(ctx, -s*.28, -s*.2,   s*.28,  s*.2);
      }
    },
    {
      name: "Isaz", phoneme: "I",
      meaning: "Ice — Stillness, clarity, suspension",
      draw(ctx, s, c, a) {
        // ᛁ single vertical staff
        line(ctx, 0, -s*.55, 0, s*.55);
      }
    },
    {
      name: "Jera", phoneme: "J/Y",
      meaning: "Year — Harvest, cycles, reward for effort",
      draw(ctx, s, c, a) {
        // ᛃ two opposing angles forming a year-cycle shape
        line(ctx, -s*.28, -s*.52, s*.28,  0);
        line(ctx,  s*.28,  0,    -s*.28, s*.52);
        line(ctx, -s*.28, -s*.52, s*.28, -s*.52);
        line(ctx, -s*.28,  s*.52, s*.28,  s*.52);
      }
    },
    {
      name: "Eihwaz", phoneme: "EI",
      meaning: "Yew — Endurance, death and rebirth, axis",
      draw(ctx, s, c, a) {
        // ᛇ staff with thorn up-left and branch down-right
        line(ctx, 0, -s*.55, 0,  s*.55);
        line(ctx, 0, -s*.3, -s*.32, -s*.55);
        line(ctx, 0,  s*.3,  s*.32,  s*.55);
      }
    },
    {
      name: "Perthro", phoneme: "P",
      meaning: "Lot-cup — Mystery, fate, hidden things",
      draw(ctx, s, c, a) {
        // ᛈ cup / bracket shape rotated
        line(ctx, -s*.15, -s*.52, -s*.15, s*.52);
        line(ctx, -s*.15, -s*.52,  s*.35, -s*.18);
        line(ctx,  s*.35, -s*.18, -s*.15,  0);
        line(ctx, -s*.15,  0,      s*.35,  s*.18);
        line(ctx,  s*.35,  s*.18, -s*.15,  s*.52);
      }
    },
    {
      name: "Algiz", phoneme: "Z",
      meaning: "Elk — Protection, reaching upward, shielding",
      draw(ctx, s, c, a) {
        // ᛉ central staff + two upward-spread branches
        line(ctx, 0, -s*.55, 0, s*.55);
        line(ctx, 0, -s*.1, -s*.36, -s*.52);
        line(ctx, 0, -s*.1,  s*.36, -s*.52);
      }
    },
    {
      name: "Sowilo", phoneme: "S",
      meaning: "Sun — Success, vitality, clarity of will",
      draw(ctx, s, c, a) {
        // ᛊ two stacked diagonals (lightning / sun)
        line(ctx, -s*.18, -s*.55,  s*.18, -s*.02);
        line(ctx, -s*.18, -s*.02,  s*.18,  s*.52);
      }
    },
    {
      name: "Tiwaz", phoneme: "T",
      meaning: "Tyr — Justice, honour, self-sacrifice",
      draw(ctx, s, c, a) {
        // ᛏ arrow pointing up
        line(ctx, 0, -s*.55, 0,  s*.55);
        line(ctx, 0, -s*.55, -s*.36, -s*.18);
        line(ctx, 0, -s*.55,  s*.36, -s*.18);
      }
    },
    {
      name: "Berkano", phoneme: "B",
      meaning: "Birch — Growth, fertility, new beginnings",
      draw(ctx, s, c, a) {
        // ᛒ staff + two right bumps (like B)
        line(ctx, -s*.12, -s*.55, -s*.12, s*.55);
        line(ctx, -s*.12, -s*.55,  s*.28, -s*.28);
        line(ctx,  s*.28, -s*.28, -s*.12,  0);
        line(ctx, -s*.12,  0,      s*.32,  s*.26);
        line(ctx,  s*.32,  s*.26, -s*.12,  s*.55);
      }
    },
    {
      name: "Ehwaz", phoneme: "E",
      meaning: "Horse — Partnership, movement, trust",
      draw(ctx, s, c, a) {
        // ᛖ two vertical staffs + two right-pointing horizontals
        line(ctx, -s*.28, -s*.55, -s*.28, s*.55);
        line(ctx,  s*.28, -s*.55,  s*.28, s*.55);
        line(ctx, -s*.28, -s*.22,  s*.28, -s*.22);
        line(ctx, -s*.28,  s*.22,  s*.28,  s*.22);
      }
    },
    {
      name: "Mannaz", phoneme: "M",
      meaning: "Man — Humanity, self, cooperation",
      draw(ctx, s, c, a) {
        // ᛗ two staffs + shared X crossing in middle
        line(ctx, -s*.3, -s*.55, -s*.3, s*.55);
        line(ctx,  s*.3, -s*.55,  s*.3, s*.55);
        line(ctx, -s*.3, -s*.55,  s*.3, -s*.02);
        line(ctx,  s*.3, -s*.55, -s*.3, -s*.02);
      }
    },
    {
      name: "Laguz", phoneme: "L",
      meaning: "Water — Intuition, flow, the unconscious",
      draw(ctx, s, c, a) {
        // ᛚ staff + single left branch downward
        line(ctx, s*.1, -s*.55, s*.1, s*.55);
        line(ctx, s*.1, -s*.1, -s*.34, s*.45);
      }
    },
    {
      name: "Ingwaz", phoneme: "NG",
      meaning: "Ing — Potential, gestation, inner growth",
      draw(ctx, s, c, a) {
        // ᛜ diamond / rhombus
        line(ctx, 0, -s*.52,  s*.38, 0);
        line(ctx, s*.38, 0,   0,      s*.52);
        line(ctx, 0,  s*.52, -s*.38,  0);
        line(ctx, -s*.38, 0,  0,     -s*.52);
      }
    },
    {
      name: "Dagaz", phoneme: "D",
      meaning: "Day — Breakthrough, awakening, transformation",
      draw(ctx, s, c, a) {
        // ᛞ two triangles sharing a vertical centre
        line(ctx, -s*.36, -s*.52, s*.36,  s*.52);
        line(ctx,  s*.36, -s*.52,-s*.36,  s*.52);
        line(ctx, -s*.36, -s*.52,-s*.36,  s*.52);
        line(ctx,  s*.36, -s*.52, s*.36,  s*.52);
      }
    },
    {
      name: "Othalan", phoneme: "O",
      meaning: "Estate — Inheritance, ancestral land, belonging",
      draw(ctx, s, c, a) {
        // ᛟ diamond with two feet
        line(ctx, 0, -s*.52,  s*.36, 0);
        line(ctx, s*.36, 0,   0,      s*.28);
        line(ctx, 0,  s*.28, -s*.36,  0);
        line(ctx, -s*.36, 0,  0,     -s*.52);
        line(ctx, -s*.36, 0, -s*.36,  s*.55);
        line(ctx,  s*.36, 0,  s*.36,  s*.55);
      }
    },
  ];

  function line(ctx, x1, y1, x2, y2) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }

  // ── Stone SVG rendered to offscreen canvas ────────────
  // Returns a canvas element with the stone drawn on it
  function renderStone(rune, w, h, hueA, hueB, runeIdx) {
    const offscreen = document.createElement("canvas");
    offscreen.width  = w;
    offscreen.height = h;
    const ctx = offscreen.getContext("2d");

    const cx = w / 2, cy = h / 2;
    const rx = w * 0.44, ry = h * 0.50;

    // ── Stone body ──────────────────────────────────────
    // Base: dark cool grey
    const stoneGrad = ctx.createRadialGradient(
      cx - rx*.28, cy - ry*.32, 0,
      cx, cy, Math.max(rx, ry)
    );
    stoneGrad.addColorStop(0,    "#5a5a6a");
    stoneGrad.addColorStop(0.35, "#2e2e3a");
    stoneGrad.addColorStop(0.70, "#1c1c26");
    stoneGrad.addColorStop(1.0,  "#0e0e16");

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2);
    ctx.fillStyle = stoneGrad;
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur  = 18;
    ctx.shadowOffsetY = 8;
    ctx.fill();

    // Specular highlight — top-left gleam
    const specGrad = ctx.createRadialGradient(
      cx - rx*.32, cy - ry*.38, 0,
      cx - rx*.32, cy - ry*.38, rx * .55
    );
    specGrad.addColorStop(0,   "rgba(255,255,255,0.28)");
    specGrad.addColorStop(0.5, "rgba(255,255,255,0.06)");
    specGrad.addColorStop(1,   "rgba(255,255,255,0)");
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2);
    ctx.fill();

    // Subtle rim light on bottom-right edge
    const rimGrad = ctx.createRadialGradient(
      cx + rx*.38, cy + ry*.42, rx*.3,
      cx + rx*.38, cy + ry*.42, rx*.78
    );
    rimGrad.addColorStop(0,   "rgba(180,180,210,0.13)");
    rimGrad.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();

    // ── Rune glyph ──────────────────────────────────────
    // Color: interpolate hueA→hueB along rune index
    const t = runeIdx / (RUNES.length - 1);
    const hA = ((hueA % 360) + 360) % 360;
    const hB = ((hueB % 360) + 360) % 360;
    let dh = hB - hA; if (dh > 180) dh -= 360; if (dh < -180) dh += 360;
    const hue = ((hA + dh * t) % 360 + 360) % 360;
    const glyphColor  = `hsl(${hue} 85% 72%)`;
    const glyphAccent = `hsl(${hue} 95% 88%)`;

    const glyphSize = Math.min(rx, ry) * 0.72;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.clip(); // stay inside stone oval
    ctx.shadowColor = glyphAccent;
    ctx.shadowBlur  = glyphSize * 0.55;
    ctx.strokeStyle = glyphColor;
    ctx.lineWidth   = Math.max(1.5, glyphSize * 0.10);
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.globalAlpha = 0.92;

    rune.draw(ctx, glyphSize, glyphColor, glyphAccent);

    ctx.restore();

    return offscreen;
  }

  // ── Cache: rebuild when hues change ───────────────────
  let cache = new Map();
  let cachedHueA = null, cachedHueB = null;

  function getStone(runeIdx, w, h) {
    const hueA = FX.hueA, hueB = FX.hueB;
    // Invalidate if hues drifted more than 5°
    if (Math.abs(hueA - cachedHueA) > 5 || Math.abs(hueB - cachedHueB) > 5) {
      cache.clear();
      cachedHueA = hueA; cachedHueB = hueB;
    }
    const key = `${runeIdx}_${w}_${h}`;
    if (!cache.has(key)) {
      cache.set(key, renderStone(RUNES[runeIdx], w, h, hueA, hueB, runeIdx));
    }
    return cache.get(key);
  }

  // ── Public draw ────────────────────────────────────────
  function draw(ctx, card, cx, cy, w, h, rot, s) {
    const stoneW = w;
    const stoneH = h;
    const stone  = getStone(card.runeIdx, stoneW, stoneH);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot || 0);

    // Drop shadow
    ctx.shadowColor    = "rgba(0,0,0,0.72)";
    ctx.shadowBlur     = 24 * s;
    ctx.shadowOffsetY  = 12 * s;

    // Draw offscreen stone centred
    ctx.drawImage(stone, -stoneW/2, -stoneH/2, stoneW, stoneH);

    ctx.restore();
  }

  function randomCard() {
    const runeIdx = Math.floor(Math.random() * RUNES.length);
    return { type: "rune", runeIdx, rune: RUNES[runeIdx] };
  }

  function invalidateCache() { cache.clear(); cachedHueA = null; cachedHueB = null; }

  return { draw, randomCard, RUNES, invalidateCache };
})();
