/*********************************************************
 * INIT + GLUE
 *********************************************************/
loadSettings();

Tarot.preloadAll();

syncVisualUI();
syncDeckUI();
syncReversalsUI();
syncBgUI();

setIntensity(FX.intensity);
applyAuras();
applyBg();

redrawAll();
