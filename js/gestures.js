/*********************************************************
 * GESTURES — pan + pinch-zoom for the tarot canvas
 *
 * Coordinate model
 * ────────────────
 * Cards are stored in *canvas space* (the coordinate system
 * tarot.js always uses).  The viewport transform is applied
 * to the canvas element via CSS transform: translate / scale,
 * so existing draw code is completely untouched.
 *
 * To convert a screen point → canvas space:
 *   canvasX = (screenX - vp.tx) / vp.scale
 *   canvasY = (screenY - vp.ty) / vp.scale
 *********************************************************/

const Gestures = (() => {

  /* ── Viewport state ─────────────────────────────────── */
  const vp = { tx: 0, ty: 0, scale: 1 };

  const SCALE_MIN = 0.35;
  const SCALE_MAX = 4.0;
  // Distance a touch can travel before we decide it's a drag, not a tap
  const TAP_SLOP_PX = 12;
  // Minimum pinch movement before we commit to zoom mode
  const PINCH_SLOP_PX = 10;

  /* ── DOM refs ───────────────────────────────────────── */
  const canvas      = document.getElementById('tarotCanvas');
  const overlay     = document.getElementById('zoomOverlay');
  const resetBtn    = document.getElementById('zoomReset');

  /* ── Apply transform to canvas element ─────────────── */
  function applyTransform() {
    canvas.style.transform =
      `translate(${vp.tx}px, ${vp.ty}px) scale(${vp.scale})`;
  }

  function clampViewport() {
    // Keep at least 15% of the canvas visible on each axis
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cw = w * vp.scale;
    const ch = h * vp.scale;
    const margin = 0.15;
    vp.tx = Math.min(w * (1 - margin), Math.max(-cw + w * margin, vp.tx));
    vp.ty = Math.min(h * (1 - margin), Math.max(-ch + h * margin, vp.ty));
  }

  /* ── Reset pill visibility ──────────────────────────── */
  function updateResetBtn() {
    const isDefault = vp.scale === 1 && vp.tx === 0 && vp.ty === 0;
    resetBtn.classList.toggle('visible', !isDefault);
  }

  function resetViewport(animated) {
    if (animated) {
      canvas.style.transition = 'transform 300ms ease';
      setTimeout(() => { canvas.style.transition = ''; }, 320);
    }
    vp.tx = 0; vp.ty = 0; vp.scale = 1;
    applyTransform();
    updateResetBtn();
    hideOverlay();
  }

  resetBtn.addEventListener('click', () => resetViewport(true));

  /* ── Zoom overlay ───────────────────────────────────── */
  let overlayTimer = null;
  function showOverlay() {
    overlay.classList.add('visible');
    if (overlayTimer) clearTimeout(overlayTimer);
  }
  function hideOverlay() {
    if (overlayTimer) clearTimeout(overlayTimer);
    overlayTimer = setTimeout(() => overlay.classList.remove('visible'), 600);
  }

  /* ── Screen → canvas coordinate conversion ─────────── */
  function toCanvas(sx, sy) {
    return {
      x: (sx - vp.tx) / vp.scale,
      y: (sy - vp.ty) / vp.scale,
    };
  }

  /* ── Touch state ────────────────────────────────────── */
  let touches     = {};   // pointerId → {x, y, startX, startY}
  let pointerCount = 0;

  // Pinch state
  let pinching    = false;
  let pinchStartDist = 0;
  let pinchStartScale = 1;
  let pinchMidStart  = { x: 0, y: 0 };
  let pinchVpStart   = { tx: 0, ty: 0 };

  // Pan state
  let panning    = false;
  let panStart   = { x: 0, y: 0 };
  let vpAtPanStart = { tx: 0, ty: 0 };

  // Tap tracking (single finger that barely moved)
  let tapCandidate = null;

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function activePointers() {
    return Object.values(touches);
  }

  /* ── Pointer down ───────────────────────────────────── */
  canvas.addEventListener('pointerdown', (e) => {
    // Only handle touch/stylus, let mouse clicks through to existing handler
    if (e.pointerType === 'mouse') return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);

    touches[e.pointerId] = {
      x: e.clientX, y: e.clientY,
      startX: e.clientX, startY: e.clientY,
    };
    pointerCount = Object.keys(touches).length;

    if (pointerCount === 1) {
      // Potential tap or pan
      tapCandidate = { x: e.clientX, y: e.clientY, id: e.pointerId };
      panning = false;
      panStart = { x: e.clientX, y: e.clientY };
      vpAtPanStart = { tx: vp.tx, ty: vp.ty };
    }

    if (pointerCount === 2) {
      // Starting a pinch — cancel any pending tap/pan
      tapCandidate = null;
      panning = false;
      pinching = false; // will commit once slop is exceeded

      const pts = activePointers();
      pinchStartDist  = dist(pts[0], pts[1]);
      pinchStartScale = vp.scale;
      pinchMidStart   = midpoint(pts[0], pts[1]);
      pinchVpStart    = { tx: vp.tx, ty: vp.ty };
    }
  }, { passive: false });

  /* ── Pointer move ───────────────────────────────────── */
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') return;
    if (!touches[e.pointerId]) return;
    e.preventDefault();

    touches[e.pointerId].x = e.clientX;
    touches[e.pointerId].y = e.clientY;

    const pts = activePointers();

    if (pts.length === 2) {
      // ── Pinch-zoom + two-finger pan ──────────────────
      const d   = dist(pts[0], pts[1]);
      const mid = midpoint(pts[0], pts[1]);

      if (!pinching && Math.abs(d - pinchStartDist) > PINCH_SLOP_PX) {
        pinching = true;
        showOverlay();
      }

      if (pinching) {
        const newScale = Math.min(SCALE_MAX,
                         Math.max(SCALE_MIN,
                           pinchStartScale * (d / pinchStartDist)));

        // Zoom around the midpoint
        const dx = mid.x - pinchMidStart.x;
        const dy = mid.y - pinchMidStart.y;
        const scaleRatio = newScale / pinchStartScale;

        vp.scale = newScale;
        vp.tx = mid.x - scaleRatio * (pinchMidStart.x - pinchVpStart.tx) + dx - dx;
        vp.ty = mid.y - scaleRatio * (pinchMidStart.y - pinchVpStart.ty) + dy - dy;

        // More precisely: anchor the midpoint in canvas space
        const canvasMid = {
          x: (pinchMidStart.x - pinchVpStart.tx) / pinchStartScale,
          y: (pinchMidStart.y - pinchVpStart.ty) / pinchStartScale,
        };
        vp.tx = mid.x - canvasMid.x * vp.scale;
        vp.ty = mid.y - canvasMid.y * vp.scale;

        clampViewport();
        applyTransform();
        updateResetBtn();
      }
      return;
    }

    if (pts.length === 1) {
      // ── Single finger pan ────────────────────────────
      const t = touches[e.pointerId];
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;

      // Commit to pan once slop exceeded
      if (!panning && Math.hypot(dx, dy) > TAP_SLOP_PX) {
        panning = true;
        tapCandidate = null; // definitely not a tap
      }

      if (panning) {
        vp.tx = vpAtPanStart.tx + dx;
        vp.ty = vpAtPanStart.ty + dy;
        clampViewport();
        applyTransform();
        updateResetBtn();
      }
    }
  }, { passive: false });

  /* ── Pointer up / cancel ────────────────────────────── */
  function onPointerUp(e) {
    if (e.pointerType === 'mouse') return;
    e.preventDefault();

    const wasCandidate = tapCandidate && tapCandidate.id === e.pointerId;
    delete touches[e.pointerId];
    pointerCount = Object.keys(touches).length;

    if (pointerCount === 0) {
      if (pinching) {
        pinching = false;
        hideOverlay();
      }

      if (wasCandidate && !panning) {
        // It's a tap — fire the draw logic at the canvas-space coordinate
        const pt = toCanvas(e.clientX, e.clientY);
        fireDraw(pt.x, pt.y);
      }

      panning = false;
      tapCandidate = null;
    }

    // If we go from 2 fingers → 1, reset pinch state and treat remaining
    // finger as a fresh pan origin
    if (pointerCount === 1) {
      pinching = false;
      hideOverlay();
      const remaining = activePointers()[0];
      panStart = { x: remaining.x, y: remaining.y };
      vpAtPanStart = { tx: vp.tx, ty: vp.ty };
      tapCandidate = null; // don't draw when lifting second finger
    }
  }

  canvas.addEventListener('pointerup',     onPointerUp, { passive: false });
  canvas.addEventListener('pointercancel', onPointerUp, { passive: false });

  /* ── fireDraw: replicate click handler logic ────────── */
  // This mirrors the click handler in tarot.js so we don't duplicate
  // the deck dispatch there. We synthesise a fake event-like object.
  function fireDraw(x, y) {
    // Dispatch a synthetic draw event that tarot.js listens for
    canvas.dispatchEvent(new CustomEvent('tarot:draw', {
      detail: { x, y }
    }));
  }

  /* ── Prevent native pinch-zoom on the page ──────────── */
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  // Also block double-tap zoom on the canvas
  let lastTap = 0;
  canvas.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) e.preventDefault();
    lastTap = now;
  }, { passive: false });

  return { vp, toCanvas, reset: () => resetViewport(true) };

})();
