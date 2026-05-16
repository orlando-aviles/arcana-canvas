# Arcana Canvas — Development Notes

PWA tarot canvas app. Deployed to Netlify (arcana-canvas.netlify.app).
Built for Google Play Store via TWA (Bubblewrap). Stack: vanilla JS,
Canvas 2D, localStorage, service worker. No framework.

---

## Architecture

### Key Files
| File | Purpose |
|------|---------|
| `index.html` | Main HTML, all overlay/panel markup |
| `styles/main.css` | All CSS — single file |
| `js/state.js` | App/FX globals, getCssVar, getCardStroke/Shadow, applyAuras, visibility pause |
| `js/storage.js` | saveSettings/loadSettings (key: arcana_settings_v5) |
| `js/tarot.js` | Canvas draw functions, touch/mouse handlers, dispatchDraw, DeckQueues, offscreen cache |
| `js/ui.js` | Menu, settings panel, atmosphere controls, hue lerp, cycle, perf mode |
| `js/main.js` | Init, splash dismiss, restorePersistedUI |
| `js/cardData.js` | All 78 tarot + 24 rune data (upright/reversed/element/astro) |
| `js/cardLore.js` | Extended lore (theme/inReading/shadow/symbol/affirmation per card) |
| `js/cardIndex.js` | Full-screen index overlay, spread mode, lightbox, deck filter dropdown |
| `js/journal.js` | Journal overlay, mini calendar popup, card strip, textarea |
| `js/starfield.js` | Starfield with parallax/gyroscope, sparkles |
| `js/snowfall.js` | Pendulum wind snowfall with aura color tinting |
| `js/particles-bg.js` | Animus particles background |
| `js/runes.js` | Elder Futhark 24, PNG image draw with aura glow |
| `js/gildedMinima.js` | Gilded Minima deck |
| `js/tooltips.js` | Tap-hold tooltip system (data-tooltip attribute) |
| `sw.js` | Service worker v37, arcana-cache-v37, arcana-images-v2 |
| `manifest.json` | Portrait lock, PWA metadata |

### Asset Folders
- `LuminousArc/` — 78 card PNGs + LuminousArcBack.png
- `RiderWaite/` — 78 card PNGs
- `Runes/` — 24 rune PNGs (lowercase names)
- `icons/` — icon-192, icon-512, icon-512-maskable

### App State (App object)
```
activeDeck, cardScale, bg, reversals,
auraOn, auraOpacity, auraCycle, showHeader,
cardAuraMode: "dynamic"|"static"|"off",
perfMode: "full"|"balanced"|"saver",
maxCards: 5-60,
headerTitle: string,
headerSub: string
```

### FX Object
```
hueA, hueB, intensity
(targetHueA/B are in ui.js scope for lerp)
```

---

## Current Features

### Canvas
- Tap to draw, hold for meaning overlay, drag to move
- No-repeat deck queues per deck type (reset on clear)
- RAF-throttled drag with offscreen cache canvas (O(1) during drag)
- Max cards limit with flash warning
- Card aura modes: Dynamic (tracks current hue) / Static (keeps drawn hue) / Off
- DPR-aware canvas sizing

### Decks
- Luminous Arc (78 cards, custom art)
- Rider-Waite (78 cards)
- Gilded Minima (78 cards, generative)
- Elder Futhark Runes (24, custom art PNGs)
- Playing Cards (52)
- Text deck (Major Arcana names)

### Description Overlay
- Hold card → meaning overlay at bottom
- Orientation badge (Upright/Reversed, color-coded)
- Three action buttons: ✚ Save · ⚷ Index · ✎ Open
- Correct meanings for all deck types including runes and playing cards

### Card Index
- Full-screen overlay, museum-style navigation
- Extended lore: theme, in reading, shadow, symbol, affirmation (tarot)
- Extended lore: elder meaning, in cast, phoneme, affirmation (runes)
- Swipe between cards in detail view
- Tap image → lightbox, swipe in lightbox
- Deck filter dropdown (All / Luminous Arc / Rider-Waite / Gilded / Runes / Playing)
- Spread mode: filtered to current canvas draws, shows orientation
- Save to Journal / Go to Journal from detail view
- Sticky bottom nav: ✎ Journal · + Save · N/Total counter · ← Back · ✕ Close

### Journal
- Opens to today's entry directly
- Monthly calendar (popup via ⊞ button) with GitHub-style word count shading
- 6 shades: 0, 1-199, 200-399, 400-599, 600-799, 800-999, 1000+ words
- Saved card strip (5 across, tap → Expand/Index/Remove popup)
- Textarea with 1000-word progress bar
- Auto-save (600ms debounce, flush on close)
- Sticky bottom nav: ⚷ Index · ⊞ Calendar · ✕ Close

### Settings Panel
- Atmosphere: bg selector, intensity, hue A/B, randomize
- Aura: on/off toggle, opacity, auto-cycle
- Card Aura: Dynamic/Static/Off mode
- Display: canvas header toggle, header title (PRO), header subtitle (PRO)
- Performance: Full/Balanced/Saver, max cards slider
- Battery API: suggests Saver mode below 20%

### Background Effects
- Starfield: 900 stars, 3-layer parallax, gyroscope + drift fallback
  Occasional sparkle crosses (8-40s intervals), visibility-pause when backgrounded
- Animus particles: connected node network
- Snowfall: pendulum wind, aura-tinted large flakes
- All systems pause on visibilitychange

### Smooth Color System
- _targetHueA/B set by slider, randomize, or auto-cycle
- tickLerp() RAF loop interpolates current hues toward targets
- Shortest-path lerp around 360° wheel, ~3s to full shift
- Auto-cycle picks new random targets every 8s, lerp handles transition
- Manual sliders snap immediately

---

## Known Issues / Bugs

- **Balanced performance mode** — select exists, UI works, but background
  systems don't actually throttle to 30fps yet. Need to add frame-skip
  check in starfield.js, snowfall.js, particles-bg.js tick functions.
  Fix is 3 lines per file — deferred.

- **Index deck images for Gilded/Playing** — when Gilded Minima or
  Playing Cards is selected in the index dropdown, the detail view
  shows a blank image since those decks don't have image files.
  They need a drawn/generated visual representation.

- **Touch callout on index lightbox** — long-press on lightbox image
  may still show native save/copy menu on some Android versions.

## Fixed in Last Audit
- Dynamic card aura: tickLerp now calls redrawAll() every 6 frames
  when cardAuraMode === "dynamic" and cards exist on canvas.
- Auto-cycle slider sync: sliders update to final hue when lerp settles.
- Duplicate data-tooltip attribute on journal menu button removed.
- meanings.js confirmed as harmless wrapper (kept for compatibility).

---

## Pending Features (Roadmap)

### Near-term (next sprint)
- Balanced mode actual throttling (3 lines per bg file)
- Dynamic aura real-time update (hook redrawAll to tickLerp)
- Slider sync after auto-cycle settles
- Mock ad banner placeholder (top of canvas, above header)
- Independent aura modes for cards / menu elements / canvas header
- Per-deck aura toggle in settings

### Medium-term
- Onboarding: first-launch guided tour using tooltip system
  (tap sequence that highlights each feature in order)
- Shortcuts menu: user-bookmarkable quick-access panel
  above action buttons in main menu
- Saving spreads: name and save current canvas layout to journal
- Additional deck types (Oracle, Lenormand)

### Monetisation (Free vs Pro)
**Free tier:**
- All decks, all core features
- Canvas header always visible (branding)
- Ad banner at top of canvas (placeholder exists in settings)

**Pro tier (paid, unlock via in-app purchase):**
- No ads
- Canvas header toggle (hide or edit)
- Custom header title and subtitle text (inputs exist, PRO-gated)
- Additional deck packs (future)
- Export journal entries (future)

### Play Store
- Domain setup (arcana-canvas.netlify.app or custom domain)
- Bubblewrap TWA build (twa/ folder exists, needs domain filled in)
- Privacy policy page (required by Google — simple static page)
- Content rating questionnaire (Lifestyle / Entertainment)
- Store listing: screenshots, description, icon
- assetlinks.json for TWA verification

---

## Service Worker Notes
- Cache strategy: network-first for HTML, cache-first for assets
- Bump CACHE_NAME (arcana-cache-vN) when JS/CSS/HTML changes
- Bump IMAGE_CACHE (arcana-images-vN) when deck images change
- Current: arcana-cache-v37, arcana-images-v2

## Important Patterns
- **No framework** — vanilla JS only, IIFE modules via window globals
- **No build step** — deploy folder directly to Netlify
- **localStorage** — all persistence, no backend
- **Canvas DPR** — all canvas operations scale by devicePixelRatio
- **Touch system** — touchstart/touchend passive:false where needed,
  touch-action:none avoided (preserves browser zoom/pan)
- **Offscreen cache** — built on drag start, invalidated on redrawAll/clear

