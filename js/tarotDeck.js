// js/tarotDeck.js
window.Tarot = (() => {
  // Major arcana naming rule:
  // Most majors use TheX.png
  // Exceptions: Temperance, Judgement, WheelOfFortune, Justice (no "The")

  const majors = [
    "TheFool",
    "TheMagician",
    "TheHighPriestess",
    "TheEmpress",
    "TheEmperor",
    "TheHierophant",
    "TheLovers",
    "TheChariot",
    "Strength",
    "TheHermit",
    "WheelOfFortune",
    "Justice",
    "TheHangedMan",
    "Death",
    "Temperance",
    "TheDevil",
    "TheTower",
    "TheStar",
    "TheMoon",
    "TheSun",
    "Judgement",
    "TheWorld",
  ];

  const wands = [
    "AceOfWands","TwoOfWands","ThreeOfWands","FourOfWands",
    "FiveOfWands","SixOfWands","SevenOfWands","EightOfWands",
    "NineOfWands","TenOfWands","PageOfWands","KnightOfWands",
    "QueenOfWands","KingOfWands",
  ];

  const cups = [
    "AceOfCups","TwoOfCups","ThreeOfCups","FourOfCups",
    "FiveOfCups","SixOfCups","SevenOfCups","EightOfCups",
    "NineOfCups","TenOfCups","PageOfCups","KnightOfCups",
    "QueenOfCups","KingOfCups",
  ];

  const swords = [
    "AceOfSwords","TwoOfSwords","ThreeOfSwords","FourOfSwords",
    "FiveOfSwords","SixOfSwords","SevenOfSwords","EightOfSwords",
    "NineOfSwords","TenOfSwords","PageOfSwords","KnightOfSwords",
    "QueenOfSwords","KingOfSwords",
  ];

  const pentacles = [
    "AceOfPentacles","TwoOfPentacles","ThreeOfPentacles","FourOfPentacles",
    "FiveOfPentacles","SixOfPentacles","SevenOfPentacles","EightOfPentacles",
    "NineOfPentacles","TenOfPentacles","PageOfPentacles","KnightOfPentacles",
    "QueenOfPentacles","KingOfPentacles",
  ];

  const cardNames = [...majors, ...wands, ...cups, ...swords, ...pentacles];

  // Two image caches, one per deck
  const imagesByDeck = {
    riderwaite: new Map(),
    luminousarc: new Map(),
  };

  const loadedByDeck = {
    riderwaite: false,
    luminousarc: false,
  };

  const deckPaths = {
    riderwaite: "./RiderWaite/",
    luminousarc: "./LuminousArc/",
  };

  function getPath(deckKey, name) {
    return `${deckPaths[deckKey]}${name}.png`;
  }

  function preload(deckKey) {
    if (!deckKey) deckKey = "riderwaite";
    if (loadedByDeck[deckKey]) return Promise.resolve(true);

    const promises = cardNames.map((name) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          imagesByDeck[deckKey].set(name, img);
          resolve(true);
        };
        img.onerror = () => {
          console.warn("Missing tarot image:", getPath(deckKey, name));
          resolve(false);
        };
        img.src = getPath(deckKey, name);
      });
    });

    return Promise.all(promises).then(() => {
      loadedByDeck[deckKey] = true;
      return true;
    });
  }

  function preloadAll() {
    return Promise.all([preload("riderwaite"), preload("luminousarc")]);
  }

  function randomCard(deckKey) {
    if (!deckKey) deckKey = "riderwaite";
    const name = cardNames[Math.floor(Math.random() * cardNames.length)];
    return { name, img: imagesByDeck[deckKey].get(name) || null };
  }

  function getImage(name, deckKey) {
    if (!deckKey) deckKey = "riderwaite";
    return imagesByDeck[deckKey].get(name) || null;
  }

  function isReady(deckKey) {
    if (!deckKey) deckKey = "riderwaite";
    return loadedByDeck[deckKey];
  }

  return { preload, preloadAll, randomCard, getImage, isReady, cardNames };
})();
