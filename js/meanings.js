/*********************************************************
 * MEANINGS — thin wrapper over CardData
 * Keeps the existing Meanings.get(name, reversed) API
 * so tarot.js description overlay works unchanged.
 *********************************************************/
window.Meanings = {
  get: (name, reversed) => CardData.getMeaning(name, reversed)
};
