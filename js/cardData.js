/*********************************************************
 * CARD DATA — single source of truth
 * Replaces meanings.js. Covers:
 *   - 22 Major Arcana
 *   - 56 Minor Arcana (Wands/Cups/Swords/Pentacles)
 *   - 24 Elder Futhark Runes
 * Playing cards map to Minor Arcana via suitMap below.
 *
 * Each entry:
 *   name, section, number, element, astro,
 *   upright, reversed, imageName (matches LuminousArc/RiderWaite filename)
 *********************************************************/
window.CardData = (() => {

  const MAJOR = [
    { name:"The Fool",          number:"0",  element:"Air",   astro:"Uranus",
      upright:"New beginnings, innocence, spontaneity, a free spirit, leap of faith",
      reversed:"Naivety, foolishness, recklessness, risk-taking, being led astray",
      imageName:"TheFool" },
    { name:"The Magician",      number:"I",  element:"Air",   astro:"Mercury",
      upright:"Willpower, skill, resourcefulness, manifestation, inspired action",
      reversed:"Manipulation, poor planning, untapped talents, trickery",
      imageName:"TheMagician" },
    { name:"The High Priestess",number:"II", element:"Water", astro:"Moon",
      upright:"Intuition, sacred knowledge, the subconscious, inner voice",
      reversed:"Secrets, disconnection from intuition, withdrawal, repressed feelings",
      imageName:"TheHighPriestess" },
    { name:"The Empress",       number:"III",element:"Earth", astro:"Venus",
      upright:"Femininity, beauty, nature, abundance, nurturing, fertility",
      reversed:"Creative block, dependence on others, smothering, insecurity",
      imageName:"TheEmpress" },
    { name:"The Emperor",       number:"IV", element:"Fire",  astro:"Aries",
      upright:"Authority, structure, fatherhood, stability, established power",
      reversed:"Domination, rigidity, inflexibility, control issues, tyranny",
      imageName:"TheEmperor" },
    { name:"The Hierophant",    number:"V",  element:"Earth", astro:"Taurus",
      upright:"Tradition, conformity, spirituality, institutions, shared beliefs",
      reversed:"Rebellion, subversiveness, new approaches, challenging the status quo",
      imageName:"TheHierophant" },
    { name:"The Lovers",        number:"VI", element:"Air",   astro:"Gemini",
      upright:"Love, harmony, relationships, values alignment, choices",
      reversed:"Disharmony, imbalance, misalignment of values, bad choices",
      imageName:"TheLovers" },
    { name:"The Chariot",       number:"VII",element:"Water", astro:"Cancer",
      upright:"Control, willpower, victory, determination, focused ambition",
      reversed:"Lack of control, aggression, no direction, scattered energy",
      imageName:"TheChariot" },
    { name:"Strength",          number:"VIII",element:"Fire", astro:"Leo",
      upright:"Courage, patience, inner strength, compassion, soft control",
      reversed:"Inner doubt, low energy, self-doubt, weakness, insecurity",
      imageName:"Strength" },
    { name:"The Hermit",        number:"IX", element:"Earth", astro:"Virgo",
      upright:"Introspection, solitude, inner guidance, wisdom, soul-searching",
      reversed:"Isolation, loneliness, withdrawal, rejection of help",
      imageName:"TheHermit" },
    { name:"Wheel of Fortune",  number:"X",  element:"Fire",  astro:"Jupiter",
      upright:"Luck, cycles, fate, turning point, destiny in motion",
      reversed:"Bad luck, resistance to change, breaking cycles, external forces",
      imageName:"WheelOfFortune" },
    { name:"Justice",           number:"XI", element:"Air",   astro:"Libra",
      upright:"Justice, fairness, truth, cause and effect, karmic law",
      reversed:"Unfairness, dishonesty, lack of accountability, legal troubles",
      imageName:"Justice" },
    { name:"The Hanged Man",    number:"XII",element:"Water", astro:"Neptune",
      upright:"Surrender, new perspectives, enlightenment, waiting, sacrifice",
      reversed:"Delays, resistance, stalling, indecision, martyrdom",
      imageName:"TheHangedMan" },
    { name:"Death",             number:"XIII",element:"Water",astro:"Scorpio",
      upright:"Endings, beginnings, change, transition, letting go",
      reversed:"Resistance to change, inability to move on, stagnation, decay",
      imageName:"Death" },
    { name:"Temperance",        number:"XIV",element:"Fire",  astro:"Sagittarius",
      upright:"Balance, moderation, patience, purpose, middle path",
      reversed:"Imbalance, excess, lack of long-term vision, extremes",
      imageName:"Temperance" },
    { name:"The Devil",         number:"XV", element:"Earth", astro:"Capricorn",
      upright:"Bondage, materialism, ignorance, shadow self, addiction",
      reversed:"Releasing limiting beliefs, detachment, freedom, reclaiming power",
      imageName:"TheDevil" },
    { name:"The Tower",         number:"XVI",element:"Fire",  astro:"Mars",
      upright:"Sudden upheaval, chaos, revelation, awakening, radical change",
      reversed:"Averting disaster, fear of change, delaying the inevitable",
      imageName:"TheTower" },
    { name:"The Star",          number:"XVII",element:"Air",  astro:"Aquarius",
      upright:"Hope, faith, renewal, inspiration, serenity, healing",
      reversed:"Faithlessness, discouragement, insecurity, despair",
      imageName:"TheStar" },
    { name:"The Moon",          number:"XVIII",element:"Water",astro:"Pisces",
      upright:"Illusion, fear, the unconscious, confusion, hidden things",
      reversed:"Release of fear, confusion lifts, misunderstanding resolved",
      imageName:"TheMoon" },
    { name:"The Sun",           number:"XIX",element:"Fire",  astro:"Sun",
      upright:"Success, radiance, abundance, joy, optimism, vitality",
      reversed:"Temporary depression, positivity blocked, sadness, burnout",
      imageName:"TheSun" },
    { name:"Judgement",         number:"XX", element:"Fire",  astro:"Pluto",
      upright:"Reflection, reckoning, awakening, inner calling, absolution",
      reversed:"Self-doubt, refusal of self-examination, ignoring the call",
      imageName:"Judgement" },
    { name:"The World",         number:"XXI",element:"Earth", astro:"Saturn",
      upright:"Completion, integration, accomplishment, travel, wholeness",
      reversed:"Seeking closure, shortcuts, delays, incomplete work",
      imageName:"TheWorld" },
  ];

  function minorCards(suit, element, astroRange, startNum = 1) {
    const nums = [
      ["Ace",   "I",   "Pure potential, new beginning, seed of the suit"],
      ["Two",   "II",  "Duality, choice, balance, partnership"],
      ["Three", "III", "Growth, creativity, initial fulfilment, collaboration"],
      ["Four",  "IV",  "Stability, consolidation, rest, foundation"],
      ["Five",  "V",   "Conflict, instability, challenge, change"],
      ["Six",   "VI",  "Harmony, communication, transition, giving"],
      ["Seven", "VII", "Reflection, assessment, perseverance, mystery"],
      ["Eight", "VIII","Movement, speed, mastery, action"],
      ["Nine",  "IX",  "Near completion, patience, resilience"],
      ["Ten",   "X",   "Completion, culmination, end of a cycle"],
    ];
    const courts = [
      ["Page",   "XI",  "Student, messenger, new energy, curiosity"],
      ["Knight", "XII", "Action, movement, quest, ambition"],
      ["Queen",  "XIII","Mastery, receptivity, nurturing authority"],
      ["King",   "XIV", "Command, mastery, leadership, full expression"],
    ];
    const allNums = [...nums, ...courts];
    return allNums.map(([rank, num, numNote]) => ({
      name: `${rank === "Ace" ? "Ace" : rank} of ${suit}`,
      number: num,
      numNote,
      element,
      astro: astroRange,
      imageName: `${rank === "Ace" ? "Ace" : rank}Of${suit}`,
      ...suitMeanings[suit][rank],
    }));
  }

  const suitMeanings = {
    Wands: {
      Ace:    { upright:"Inspiration, new opportunities, growth, creative spark",    reversed:"Delays, lack of motivation, weighed down, creative block" },
      Two:    { upright:"Planning, decisions, leaving comfort zone, expansion",      reversed:"Fear of unknown, indecision, playing it safe, over-planning" },
      Three:  { upright:"Looking ahead, expansion, foresight, long-term vision",     reversed:"Obstacles, delays, disappointing results, lack of foresight" },
      Four:   { upright:"Celebration, harmony, home, community, milestone",          reversed:"Lack of support, instability, home conflict, transience" },
      Five:   { upright:"Conflict, disagreements, competition, tension, chaos",      reversed:"Avoiding conflict, respecting differences, resolution" },
      Six:    { upright:"Victory, success, public reward, progress, recognition",    reversed:"Egotism, fall from grace, opposition, delayed success" },
      Seven:  { upright:"Challenge, competition, perseverance, holding ground",      reversed:"Giving up, overwhelmed, self-doubt, defensive" },
      Eight:  { upright:"Speed, action, air travel, communication, momentum",       reversed:"Delays, frustration, holding off, miscommunication" },
      Nine:   { upright:"Resilience, grit, last stand, persistence, stamina",        reversed:"Exhaustion, fatigue, questioning motives, stubbornness" },
      Ten:    { upright:"Burden, extra responsibility, hard work, completion",       reversed:"Doing it all alone, carrying too much, burnt out" },
      Page:   { upright:"Enthusiasm, exploration, discovery, free spirit",           reversed:"Immaturity, lack of direction, hastiness" },
      Knight: { upright:"Energy, passion, inspired action, adventure, courage",      reversed:"Passion without purpose, haste, scattered energy" },
      Queen:  { upright:"Courage, confidence, independence, determination, warmth",  reversed:"Selfishness, jealousy, insecurities, volatility" },
      King:   { upright:"Natural-born leader, vision, entrepreneur, bold",           reversed:"Impulsiveness, overbearing, unachievable expectations" },
    },
    Cups: {
      Ace:    { upright:"Compassion, creativity, overwhelming emotion, new love",    reversed:"Self-love blocked, intuition closed, emotional emptiness" },
      Two:    { upright:"Unity, partnership, mutual attraction, deep connection",    reversed:"Imbalance, broken communication, tension in partnership" },
      Three:  { upright:"Friendship, community, reunions, celebration, joy",         reversed:"Gossip, excess, independence needed, isolation" },
      Four:   { upright:"Meditation, apathy, contemplation, reevaluation",           reversed:"Missed opportunity, awakening, new motivation" },
      Five:   { upright:"Regret, failure, disappointment, pessimism, grief",         reversed:"Moving on, acceptance, forgiveness, finding peace" },
      Six:    { upright:"Nostalgia, reunion, childhood, revisiting the past",        reversed:"Living in the past, unrealistic, clinging to old ways" },
      Seven:  { upright:"Choices, wishful thinking, illusion, fantasy, options",    reversed:"Alignment, clarity, decisive choices, focus" },
      Eight:  { upright:"Walking away, disillusionment, abandonment, seeking more", reversed:"Avoidance, fear of moving on, staying in a rut" },
      Nine:   { upright:"Contentment, satisfaction, gratitude, wish fulfilled",      reversed:"Overindulgence, materialism, dissatisfaction, greed" },
      Ten:    { upright:"Happiness, marriage, alignment, family harmony, bliss",     reversed:"Broken family, disconnection, misaligned values" },
      Page:   { upright:"Dreamy, sensitive, creative, emotional messages",           reversed:"Emotional immaturity, insecurity, disappointment" },
      Knight: { upright:"Romance, charm, imagination, following your heart",         reversed:"Unrealistic, jealousy, moodiness, illusion" },
      Queen:  { upright:"Compassion, calm, comfort, intuition, emotional depth",     reversed:"Martyrdom, insecurity, giving too much, co-dependency" },
      King:   { upright:"Emotionally balanced, diplomatic, compassionate mastery",   reversed:"Manipulation, moodiness, emotionally volatile" },
    },
    Swords: {
      Ace:    { upright:"Breakthroughs, clarity, sharp mind, new idea, truth",      reversed:"Confusion, brutality, chaos, clouded thinking" },
      Two:    { upright:"Indecision, choices, truce, stalemate, blocked emotions",  reversed:"Information overload, confusion, no right answer" },
      Three:  { upright:"Heartbreak, grief, hurt, sorrow, painful truth",           reversed:"Recovering, forgiveness, moving on, healing" },
      Four:   { upright:"Rest, relaxation, meditation, sanctuary, recovery",        reversed:"Restlessness, burn-out, stress, unable to rest" },
      Five:   { upright:"Conflict, tension, defeat, winning at all costs",          reversed:"Reconciliation, making amends, moving past conflict" },
      Six:    { upright:"Transition, change, rite of passage, moving on",           reversed:"Resistance to change, unfinished business, rough waters" },
      Seven:  { upright:"Betrayal, deception, getting away with something",         reversed:"Coming clean, conscience, imposter syndrome" },
      Eight:  { upright:"Imprisonment, entrapment, victim mentality, restriction",  reversed:"Freedom, self-acceptance, release, open mind" },
      Nine:   { upright:"Anxiety, worry, fear, depression, nightmares",             reversed:"Hope, reaching out, light at end of tunnel" },
      Ten:    { upright:"Painful endings, betrayal, crisis, rock bottom",           reversed:"Recovery, regeneration, resisting inevitable end" },
      Page:   { upright:"Curious, communicative, thirst for knowledge, vigilant",   reversed:"Deception, manipulation, talking without listening" },
      Knight: { upright:"Ambitious, action-oriented, driven, fast-thinking",        reversed:"Restless, scattered, impatient, impulsive" },
      Queen:  { upright:"Independent, unbiased, clear boundaries, direct, honest",  reversed:"Cold-hearted, cruel, bitter, resentful" },
      King:   { upright:"Mental clarity, intellectual power, authority, truth",     reversed:"Manipulative, tyrannical, abusive, irrational" },
    },
    Pentacles: {
      Ace:    { upright:"Opportunity, prosperity, new venture, abundance, seed",    reversed:"Lost opportunity, missed chances, scarcity mindset" },
      Two:    { upright:"Multiple priorities, time management, adaptability",       reversed:"Over-committed, disorganised, poor balance" },
      Three:  { upright:"Teamwork, initial fulfilment, collaboration, skill",       reversed:"Lack of teamwork, disorganised, conflict of vision" },
      Four:   { upright:"Saving, security, conservatism, stability, possession",    reversed:"Greediness, materialism, self-protection, hoarding" },
      Five:   { upright:"Financial loss, poverty, lack, insecurity, hardship",     reversed:"Recovery, charity, improvement, spiritual poverty ends" },
      Six:    { upright:"Generosity, charity, giving, prosperity, sharing",         reversed:"Debt, selfishness, strings attached, power imbalance" },
      Seven:  { upright:"Long-term view, sustainable results, perseverance",        reversed:"Lack of vision, limited reward, impatience" },
      Eight:  { upright:"Apprenticeship, mastery, skill development, dedication",   reversed:"Self-development blocked, perfectionism, misdirected" },
      Nine:   { upright:"Abundance, luxury, self-sufficiency, refinement",          reversed:"Working too hard, financial setbacks, over-investment" },
      Ten:    { upright:"Wealth, financial security, long-term success, legacy",    reversed:"Family disputes, financial failure, loss of stability" },
      Page:   { upright:"Manifestation, financial opportunity, diligence, study",   reversed:"Procrastination, short-term thinking, lack of progress" },
      Knight: { upright:"Efficiency, routine, health, conservative, reliable",      reversed:"Self-discipline issues, boredom, stuck, perfectionism" },
      Queen:  { upright:"Practicality, creature comforts, financial security, nurturing", reversed:"Self-centeredness, jealousy, smothering" },
      King:   { upright:"Wealth, business, leadership, security, abundance",        reversed:"Financially inept, obsessed with wealth, stubborn" },
    },
  };

  const WANDS      = minorCards("Wands",      "Fire",  "Aries / Leo / Sagittarius");
  const CUPS       = minorCards("Cups",       "Water", "Cancer / Scorpio / Pisces");
  const SWORDS     = minorCards("Swords",     "Air",   "Gemini / Libra / Aquarius");
  const PENTACLES  = minorCards("Pentacles",  "Earth", "Taurus / Virgo / Capricorn");

  // Add section labels
  MAJOR.forEach(c => c.section = "Major Arcana");
  WANDS.forEach(c => c.section = "Wands");
  CUPS.forEach(c => c.section = "Cups");
  SWORDS.forEach(c => c.section = "Swords");
  PENTACLES.forEach(c => c.section = "Pentacles");

  const RUNES = [
    { name:"Fehu",     number:"1",  element:"Fire",  astro:"Venus",   section:"Runes", imageName:"fehu",
      upright:"Wealth, abundance, prosperity, luck, success, cattle",
      reversed:"Loss, greed, stagnation, discord over money" },
    { name:"Uruz",     number:"2",  element:"Earth", astro:"Taurus",  section:"Runes", imageName:"uruz",
      upright:"Strength, vitality, primal force, endurance, good health",
      reversed:"Weakness, poor health, stubbornness, missed opportunity" },
    { name:"Thurisaz", number:"3",  element:"Fire",  astro:"Mars",    section:"Runes", imageName:"thurisaz",
      upright:"Protection, conflict, change, gateway, directed force",
      reversed:"Danger, defenselessness, betrayal, compulsion" },
    { name:"Ansuz",    number:"4",  element:"Air",   astro:"Mercury", section:"Runes", imageName:"ansuz",
      upright:"Wisdom, communication, inspiration, divine message, truth",
      reversed:"Miscommunication, deception, confusion, manipulation" },
    { name:"Raidho",   number:"5",  element:"Air",   astro:"Gemini",  section:"Runes", imageName:"raidho",
      upright:"Journey, movement, growth, perspective, right action",
      reversed:"Stagnation, delay, recklessness, crisis" },
    { name:"Kenaz",    number:"6",  element:"Fire",  astro:"Sun",     section:"Runes", imageName:"kenaz",
      upright:"Knowledge, creativity, vision, clarity, inner fire",
      reversed:"Ignorance, fear, false hope, disease, loss" },
    { name:"Gebo",     number:"7",  element:"Air",   astro:"Venus",   section:"Runes", imageName:"gebo",
      upright:"Partnership, generosity, exchange, gift, balance",
      reversed:"Imbalance, obligation, isolation, greed" },
    { name:"Wunjo",    number:"8",  element:"Earth", astro:"Leo",     section:"Runes", imageName:"wunjo",
      upright:"Joy, harmony, fellowship, success, pleasure, wish fulfilled",
      reversed:"Sorrow, alienation, discord, delirium" },
    { name:"Hagalaz",  number:"9",  element:"Water", astro:"Aquarius",section:"Runes", imageName:"hagalaz",
      upright:"Disruption, testing, hail storm, transformation through crisis",
      reversed:"Stagnation, powerlessness, natural disaster — no reversed (symmetrical)" },
    { name:"Nauthiz",  number:"10", element:"Fire",  astro:"Capricorn",section:"Runes",imageName:"naudhiz",
      upright:"Need, restriction, survival, endurance, necessity",
      reversed:"Constraint, frustration, poverty, emotional hunger" },
    { name:"Isa",      number:"11", element:"Water", astro:"Moon",    section:"Runes", imageName:"isaz",
      upright:"Stillness, clarity, patience, introspection, standstill",
      reversed:"Stagnation, ego blockage, treachery — symmetrical" },
    { name:"Jera",     number:"12", element:"Earth", astro:"Sun",     section:"Runes", imageName:"jera",
      upright:"Harvest, reward, cycles, natural timing, good year",
      reversed:"Setback, poor timing, conflict — symmetrical" },
    { name:"Eihwaz",   number:"13", element:"Earth", astro:"Scorpio", section:"Runes", imageName:"eihwaz",
      upright:"Endurance, defence, transformation, reliability, yew tree",
      reversed:"Confusion, weakness, duplicity, destruction" },
    { name:"Perthro",  number:"14", element:"Water", astro:"Saturn",  section:"Runes", imageName:"perthro",
      upright:"Fate, mystery, chance, divination, hidden things",
      reversed:"Stagnation, addiction, loneliness, malaise" },
    { name:"Algiz",    number:"15", element:"Air",   astro:"Cancer",  section:"Runes", imageName:"algiz",
      upright:"Protection, warding, higher self, sanctuary, elk",
      reversed:"Vulnerability, danger, hidden threat, consumed by protection" },
    { name:"Sowilo",   number:"16", element:"Fire",  astro:"Sun",     section:"Runes", imageName:"sowilo",
      upright:"Sun, success, wholeness, vitality, life force, clarity",
      reversed:"False goals, overconfidence, low energy — symmetrical" },
    { name:"Tiwaz",    number:"17", element:"Air",   astro:"Mars",    section:"Runes", imageName:"tiwaz",
      upright:"Honour, justice, leadership, sacrifice, victory, Tyr",
      reversed:"Defeat, injustice, cowardice, blocked communication" },
    { name:"Berkano",  number:"18", element:"Earth", astro:"Venus",   section:"Runes", imageName:"berkano",
      upright:"Birch, fertility, growth, renewal, femininity, sanctuary",
      reversed:"Stagnation, loss, domestic trouble, anxiety" },
    { name:"Ehwaz",    number:"19", element:"Earth", astro:"Gemini",  section:"Runes", imageName:"ehwaz",
      upright:"Movement, partnership, progress, trust, horse, swift change",
      reversed:"Haste, betrayal, instability, recklessness" },
    { name:"Mannaz",   number:"20", element:"Air",   astro:"Jupiter", section:"Runes", imageName:"mannaz",
      upright:"Humanity, self, community, intelligence, interdependence",
      reversed:"Isolation, self-deceit, manipulation, depression" },
    { name:"Laguz",    number:"21", element:"Water", astro:"Moon",    section:"Runes", imageName:"laguz",
      upright:"Water, flow, intuition, the unconscious, renewal, lake",
      reversed:"Fear, confusion, blocked intuition, taking on too much" },
    { name:"Ingwaz",   number:"22", element:"Earth", astro:"Venus",   section:"Runes", imageName:"ingwaz",
      upright:"Fertility, new beginnings, gestation, inner growth, seed",
      reversed:"Impotence, stagnation, wasted energy — symmetrical" },
    { name:"Dagaz",    number:"23", element:"Fire",  astro:"Sun",     section:"Runes", imageName:"dagaz",
      upright:"Breakthrough, awakening, clarity, hope, dawn, transformation",
      reversed:"Obscurity, confusion, delays — symmetrical" },
    { name:"Othala",   number:"24", element:"Earth", astro:"Saturn",  section:"Runes", imageName:"othalan",
      upright:"Inheritance, heritage, home, tradition, ancestry, estate",
      reversed:"Prejudice, poverty, homelessness, clinging to the past" },
  ];

  // Playing card → Minor Arcana mapping
  const SUIT_MAP = { "♠":"Swords", "♥":"Cups", "♦":"Pentacles", "♣":"Wands" };
  const RANK_MAP = {
    "A":"Ace","2":"Two","3":"Three","4":"Four","5":"Five","6":"Six","7":"Seven",
    "8":"Eight","9":"Nine","10":"Ten","J":"Page","Q":"Queen","K":"King"
  };

  // ── Playing Cards — 52 card deck ──────────────────────────────────
  // Suits map to elements/tarot but with unique names
  // Jack = combined Page+Knight (messenger/action energy)
  // No Major Arcana equivalent
  const PLAYING_SUITS = [
    { name:"Spades",   sym:"♠", element:"Air",   tarot:"Swords",    astro:"Gemini / Libra / Aquarius" },
    { name:"Hearts",   sym:"♥", element:"Water",  tarot:"Cups",      astro:"Cancer / Scorpio / Pisces" },
    { name:"Diamonds", sym:"♦", element:"Earth",  tarot:"Pentacles", astro:"Taurus / Virgo / Capricorn" },
    { name:"Clubs",    sym:"♣", element:"Fire",   tarot:"Wands",     astro:"Aries / Leo / Sagittarius" },
  ];
  const PLAYING_RANKS = [
    { rank:"A",  name:"Ace",   num:"I",    upright:"New beginnings, opportunity, potential",              reversed:"Missed opportunity, false start, delay" },
    { rank:"2",  name:"Two",   num:"II",   upright:"Balance, partnership, choice, duality",               reversed:"Imbalance, indecision, disconnection" },
    { rank:"3",  name:"Three", num:"III",  upright:"Creativity, growth, collaboration, expansion",        reversed:"Stagnation, conflict, lack of cooperation" },
    { rank:"4",  name:"Four",  num:"IV",   upright:"Stability, structure, consolidation, foundation",     reversed:"Instability, rigidity, stagnation" },
    { rank:"5",  name:"Five",  num:"V",    upright:"Challenge, conflict, change, disruption",              reversed:"Resolution, peace, avoiding conflict" },
    { rank:"6",  name:"Six",   num:"VI",   upright:"Harmony, flow, generosity, balance restored",         reversed:"Debt, self-interest, disrupted flow" },
    { rank:"7",  name:"Seven", num:"VII",  upright:"Strategy, skill, perseverance, wisdom",               reversed:"Deception, shortcuts, lack of discipline" },
    { rank:"8",  name:"Eight", num:"VIII", upright:"Action, movement, mastery, momentum",                 reversed:"Delays, blocked energy, lack of direction" },
    { rank:"9",  name:"Nine",  num:"IX",   upright:"Resilience, near-completion, endurance",              reversed:"Exhaustion, giving up, over-extension" },
    { rank:"10", name:"Ten",   num:"X",    upright:"Completion, culmination, fullness, legacy",            reversed:"Burden, loss, transition, letting go" },
    { rank:"J",  name:"Jack",  num:"XI",   upright:"Energy, ambition, message, swift action, curiosity",  reversed:"Impulsiveness, scattered energy, unreliability" },
    { rank:"Q",  name:"Queen", num:"XII",  upright:"Mastery, intuition, authority, nurturing power",      reversed:"Control, manipulation, emotional instability" },
    { rank:"K",  name:"King",  num:"XIII", upright:"Command, leadership, maturity, established power",    reversed:"Tyranny, rigidity, abuse of power" },
  ];

  const PLAYING = [];
  PLAYING_SUITS.forEach(suit => {
    PLAYING_RANKS.forEach(r => {
      const filename = r.rank + suit.name[0]; // AS, 2H, KD etc.
      PLAYING.push({
        name:      `${r.name} of ${suit.name}`,
        number:    r.num,
        element:   suit.element,
        astro:     suit.astro,
        upright:   r.upright,
        reversed:  r.reversed,
        imageName: filename,
        section:   "Playing",
      });
    });
  });

  const ALL = [...MAJOR, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES, ...RUNES, ...PLAYING];

  // Lookup map by name
  const byName = {};
  ALL.forEach(c => { byName[c.name] = c; });

  function get(name) {
    const clean = name.replace(/ \(R\)$/, "");
    return byName[clean] || null;
  }

  function getMeaning(name, reversed) {
    const card = get(name);
    if (!card) return reversed
      ? "A mystery card. Its reversed meaning is hidden."
      : "A mystery card. Its meaning is yet to be revealed.";
    return reversed ? card.reversed : card.upright;
  }

  function getAll()     { return ALL; }
  function getSuitMap() { return SUIT_MAP; }
  function getRankMap() { return RANK_MAP; }


  // ── Filename → display name lookup ───────────────────
  // tarotDeck.js uses camelCase filenames (TheFool, AceOfCups).
  // This map converts them to the display names used in CardData.
  const filenameMap = {};
  ALL.forEach(c => {
    if (c.imageName) filenameMap[c.imageName] = c.name;
  });

  function fromFilename(filename) {
    // Strip reversal suffix first
    const clean = filename.replace(/ \(R\)$/, "");
    return filenameMap[clean] || null;
  }

  // Lookup by either display name OR filename
  function getByNameOrFile(nameOrFile) {
    const clean = nameOrFile.replace(/ \(R\)$/, "");
    return byName[clean] || byName[filenameMap[clean]] || null;
  }

  function getMeaningByNameOrFile(nameOrFile, reversed) {
    const card = getByNameOrFile(nameOrFile);
    if (!card) return reversed
      ? "A mystery. Its reversed meaning is hidden."
      : "A mystery. Its meaning is yet to be revealed.";
    return reversed ? card.reversed : card.upright;
  }

  return { get, getMeaning, getMeaningByNameOrFile, getByNameOrFile, fromFilename, getAll, getSuitMap, getRankMap };
})();
