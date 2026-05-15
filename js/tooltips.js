/*********************************************************
 * TOOLTIPS — tap-hold any element with data-tooltip
 * to show a brief label. Auto-dismisses after 1.5s.
 * Powers both the onboarding hints and general UX.
 *********************************************************/
window.Tooltips = (() => {

  const tip = document.createElement("div");
  tip.className = "btn-tooltip";
  document.body.appendChild(tip);

  let hideTimer = null;

  function show(text, anchorEl) {
    clearTimeout(hideTimer);
    tip.textContent = text;
    tip.classList.add("visible");

    // Position above the element
    const rect = anchorEl.getBoundingClientRect();
    const tipW  = 160; // estimate
    let left = rect.left + rect.width / 2 - tipW / 2;
    let top  = rect.top - 40;

    // Keep on screen
    left = Math.max(8, Math.min(window.innerWidth - tipW - 8, left));
    if (top < 8) top = rect.bottom + 8;

    tip.style.left = left + "px";
    tip.style.top  = top  + "px";

    hideTimer = setTimeout(hide, 1800);
  }

  function hide() {
    tip.classList.remove("visible");
  }

  // Wire up all elements with data-tooltip attribute
  function wire(root = document) {
    root.querySelectorAll("[data-tooltip]").forEach(el => {
      let holdTimer = null;

      el.addEventListener("mousedown", () => {
        holdTimer = setTimeout(() => show(el.dataset.tooltip, el), 500);
      });
      el.addEventListener("mouseup",    () => clearTimeout(holdTimer));
      el.addEventListener("mouseleave", () => clearTimeout(holdTimer));

      el.addEventListener("touchstart", () => {
        holdTimer = setTimeout(() => show(el.dataset.tooltip, el), 500);
      }, { passive: true });
      el.addEventListener("touchend",  () => clearTimeout(holdTimer), { passive: true });
      el.addEventListener("touchmove", () => clearTimeout(holdTimer), { passive: true });
    });
  }

  // Wire on DOM ready, then re-wire after dynamic overlays load
  wire();

  return { show, hide, wire };
})();
