/*********************************************************
 * INIT + GLUE
 *********************************************************/
loadSettings();

Tarot.preloadAll();

syncVisualUI();
syncDeckUI();
syncReversalsUI();
syncViewModeUI();
syncBgUI();

setIntensity(FX.intensity);
applyAuras();
applyBg();

redrawAll();
