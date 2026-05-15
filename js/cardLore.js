/*********************************************************
 * CARD LORE — extended descriptions for all 78 tarot
 * cards and 24 Elder Futhark runes.
 *
 * Tarot fields:
 *   theme      — the card's essential truth in one sentence
 *   inReading  — practical interpretive guidance
 *   shadow     — the warning even in an upright draw
 *   symbol     — one key image from the card and its meaning
 *   affirmation— a line to sit with
 *
 * Rune fields:
 *   elderMeaning — historical/mythological context
 *   inCast       — how to read it in divination
 *   phoneme      — sound and name origin
 *   affirmation  — a line to sit with
 *********************************************************/
window.CardLore = (() => {

  const tarot = {

    // ── MAJOR ARCANA ────────────────────────────────────────────────

    "The Fool": {
      theme:       "Every great journey begins with a willingness to step off the map.",
      inReading:   "The Fool asks you to release the need to know the outcome before you begin. Trust appears here as a force, not a feeling — act before certainty arrives.",
      shadow:      "Naivety dressed as freedom. Beware leaping without any consideration for what waits below.",
      symbol:      "The white sun behind him is undimmed optimism — but the cliff edge is real. Both truths exist at once.",
      affirmation: "I trust the ground to rise to meet me."
    },
    "The Magician": {
      theme:       "You already possess every tool the moment requires.",
      inReading:   "The Magician signals that resources, skills, and timing have aligned. This is not a card of waiting — it is a card of doing. What have you been hesitating to begin?",
      shadow:      "Willpower without integrity becomes manipulation. Check that your intentions serve more than yourself.",
      symbol:      "The infinity symbol above his head: mastery is not a destination but a continuous practice.",
      affirmation: "I channel what I know into what I do."
    },
    "The High Priestess": {
      theme:       "The answer you seek is already present — you have not yet grown still enough to hear it.",
      inReading:   "When the High Priestess appears, the path forward is inward. Pause before acting. What does your body know that your mind hasn't admitted?",
      shadow:      "Withdrawal that becomes avoidance. The threshold is meant to be crossed, eventually.",
      symbol:      "The veil behind her conceals pomegranates — fertility hidden, knowledge withheld until the seeker is ready.",
      affirmation: "I trust what I know without needing to explain it."
    },
    "The Empress": {
      theme:       "Abundance is a relationship, not a possession — tend it and it grows.",
      inReading:   "The Empress brings fertility in its broadest sense: creative projects, nurturing relationships, the body's wisdom. Where in your life are you refusing to receive?",
      shadow:      "Overgiving until you deplete yourself. Nurturing others at the cost of your own roots.",
      symbol:      "The wheat at her feet — harvest requires both patience and active cultivation, never one alone.",
      affirmation: "I am worthy of the abundance I create."
    },
    "The Emperor": {
      theme:       "Structure is not the enemy of freedom — it is what makes sustained freedom possible.",
      inReading:   "The Emperor calls for order, boundaries, and long-term thinking. What needs a clear framework rather than an open field? Where are you avoiding authority — including your own?",
      shadow:      "Rigidity masquerading as strength. Rules that serve the ruler, not the realm.",
      symbol:      "The mountain throne — immovable, cold, elevated. Power without warmth can become isolation.",
      affirmation: "I lead with clarity, fairness, and follow-through."
    },
    "The Hierophant": {
      theme:       "Tradition holds wisdom, but wisdom is not the tradition itself.",
      inReading:   "The Hierophant asks you to examine your relationship with established systems — religion, education, community. Are you seeking belonging or surrendering discernment?",
      shadow:      "Conformity confused with virtue. Following the map even when the territory has changed.",
      symbol:      "The two keys at his feet — one opens the known, the other the unknown. He holds both but offers neither freely.",
      affirmation: "I honor what is sacred while questioning what is merely habit."
    },
    "The Lovers": {
      theme:       "Every true choice is also a renunciation — what you say yes to defines who you become.",
      inReading:   "The Lovers is not simply a love card. It is a card of conscious choice and values alignment. What does this decision reveal about who you are becoming?",
      shadow:      "Choosing what feels good over what is true. Mistaking chemistry for compatibility.",
      symbol:      "The angel overhead blesses both figures — love here is witnessed, not hidden. What are you willing to stand behind openly?",
      affirmation: "I choose in alignment with who I truly am."
    },
    "The Chariot": {
      theme:       "Victory belongs to those who can hold opposing forces in disciplined tension.",
      inReading:   "The Chariot speaks to willpower, momentum, and the capacity to move forward despite internal contradiction. You don't need harmony — you need direction.",
      shadow:      "Charging ahead without checking what you're running from. Speed as avoidance.",
      symbol:      "Two sphinxes pulling in opposite directions — mastery is not eliminating conflict but directing it.",
      affirmation: "I move forward with focus, not force."
    },
    "Strength": {
      theme:       "The deepest power is the kind that doesn't need to prove itself.",
      inReading:   "Strength is the capacity to face what frightens you without becoming it. Where in your life are you confusing control with dominance? What needs patience, not pressure?",
      shadow:      "Suppressing feeling rather than integrating it. Endurance that becomes martyrdom.",
      symbol:      "The lion tamed by a gentle hand — not conquered, not destroyed, but in relationship. This is the model.",
      affirmation: "I am strong enough to be gentle."
    },
    "The Hermit": {
      theme:       "Wisdom is not found in the crowd — but neither is it meant to stay hidden forever.",
      inReading:   "The Hermit invites intentional solitude for the purpose of clarity. This is not withdrawal but refinement. What do you need to understand before you can return?",
      shadow:      "Isolation that has outlasted its purpose. Wisdom hoarded rather than offered.",
      symbol:      "The lantern illuminates only the next step — the Hermit doesn't need to see the whole path, only where to place his foot.",
      affirmation: "I go within to find what I need to give."
    },
    "Wheel of Fortune": {
      theme:       "The wheel turns whether you are watching or not — wisdom is in learning to move with it.",
      inReading:   "Wheel of Fortune marks a turning point. Circumstances are shifting, often beyond your control. The question is not whether things will change, but how you'll orient yourself when they do.",
      shadow:      "Passivity disguised as acceptance. Blaming fate for what requires a decision.",
      symbol:      "The figures at the rim rise and fall — only the sphinx at the top remains still. Stillness amid change is the teaching.",
      affirmation: "I release what I cannot control and tend what I can."
    },
    "Justice": {
      theme:       "Truth is not always comfortable, but it is always clarifying.",
      inReading:   "Justice appears when fairness, accountability, or legal matters are at stake. It asks you to be honest before you are kind — with others, and especially with yourself.",
      shadow:      "Judgment delivered without compassion. Using 'truth' as a weapon rather than a mirror.",
      symbol:      "The scales held level — not tipped toward mercy or severity. Both must be present for justice to mean anything.",
      affirmation: "I see clearly and respond with integrity."
    },
    "The Hanged Man": {
      theme:       "The view you need is only available from the position you've been avoiding.",
      inReading:   "The Hanged Man is the card of voluntary surrender — the pause that contains more wisdom than any action. What would you see if you stopped trying to fix it?",
      shadow:      "Martyrdom without meaning. Suffering that hasn't been asked to teach anything.",
      symbol:      "His expression is serene, not anguished — this is not defeat but chosen perspective. The halo of light confirms it.",
      affirmation: "I release my grip and allow a new understanding to arrive."
    },
    "Death": {
      theme:       "Nothing ends that was not already becoming something else.",
      inReading:   "Death rarely means physical death. It marks the end of a chapter — an identity, a relationship, a way of being — that has run its full course. What are you holding on to past its natural end?",
      shadow:      "Refusing the transformation that has already begun. Clinging to what remains of what was.",
      symbol:      "The rising sun on the horizon — Death rides toward it, not away. Every ending faces toward a dawn.",
      affirmation: "I let go of what was so what is can begin."
    },
    "Temperance": {
      theme:       "The alchemist's art is patience: transformation happens in the space between extremes.",
      inReading:   "Temperance is the card of integration and measured action. Where in your life are you swinging between excess and deprivation? The sustainable path is rarely dramatic.",
      shadow:      "Moderation as avoidance. Using balance as an excuse to never fully commit.",
      symbol:      "Water poured between cups without spilling — a continuous flow, never static, never forced.",
      affirmation: "I move at the pace of true change."
    },
    "The Devil": {
      theme:       "The chains are loose enough to remove — the question is why you haven't.",
      inReading:   "The Devil illuminates where you feel bound by desire, habit, fear, or material need. These bonds are rarely external. What story about yourself makes the chains feel necessary?",
      shadow:      "Mistaking comfort for contentment. The known cage over the unknown freedom.",
      symbol:      "The figures' chains hang loose around their necks — the bondage is chosen, even when it doesn't feel that way.",
      affirmation: "I see clearly what holds me, and I choose differently."
    },
    "The Tower": {
      theme:       "What was built on an unexamined foundation cannot stand — and its falling is a mercy.",
      inReading:   "The Tower arrives when a sudden rupture exposes what was already false. Resist the urge to rebuild immediately in the rubble. What was this structure actually protecting you from knowing?",
      shadow:      "Destroying what still had value out of restlessness. Burning it down before understanding what 'it' was.",
      symbol:      "The crown blown from the top — false authority, assumed power, and inherited beliefs are the first casualties.",
      affirmation: "I stand in the wreckage without flinching, and I begin again."
    },
    "The Star": {
      theme:       "Hope is not naivety — it is the practice of holding possibility open when everything argues against it.",
      inReading:   "The Star follows the Tower. After devastation comes renewal, if you allow it. This card asks you to receive — rest, healing, and the quiet return of faith.",
      shadow:      "Hope that floats above reality rather than working within it. Wishing as a substitute for action.",
      symbol:      "She pours water into both the pool and the earth — renewal is both internal and outward, both receiving and giving.",
      affirmation: "I allow myself to be replenished."
    },
    "The Moon": {
      theme:       "The unconscious doesn't lie — it speaks in images, not sentences, and rewards patient attention.",
      inReading:   "The Moon brings confusion, illusion, and the stirring of what lives below awareness. Don't make permanent decisions in its light. What fears or dreams are surfacing that you haven't examined?",
      shadow:      "Mistaking anxiety for intuition. Allowing the imagination to generate threats that serve avoidance.",
      symbol:      "The dog and wolf howl at the same moon — the tamed and the wild self both respond to the same unconscious pull.",
      affirmation: "I move through uncertainty with curiosity, not fear."
    },
    "The Sun": {
      theme:       "Vitality is not something you achieve — it is what remains when you stop blocking it.",
      inReading:   "The Sun announces clarity, success, and the uncomplicated joy of being alive in a moment that is going well. Receive it without suspicion. Let yourself be seen.",
      shadow:      "Ego inflation. Confusing a good season for a permanent condition.",
      symbol:      "The child on the horse, arms open, no armor — the Sun's gift requires vulnerability to be fully received.",
      affirmation: "I shine without apology and receive without hesitation."
    },
    "Judgement": {
      theme:       "The call has been sounding for some time — the only question is whether you are willing to hear it.",
      inReading:   "Judgement marks a moment of reckoning and awakening. Something in you is being called to a higher expression. This is not about guilt — it is about responding to what you know yourself to be capable of.",
      shadow:      "Self-condemnation disguised as self-awareness. Rehearsing the verdict rather than answering the call.",
      symbol:      "The figures rise from coffins — the old self doesn't need to be destroyed, it needs to be resurrected into something truer.",
      affirmation: "I answer the call I have been hearing."
    },
    "The World": {
      theme:       "Completion is not the end — it is the moment before you understand what comes next.",
      inReading:   "The World marks genuine achievement, integration, and the closing of a long cycle. Celebrate it fully before rushing to the next beginning. What have you actually accomplished?",
      shadow:      "Refusing to acknowledge completion. Moving to the next thing before honoring the distance traveled.",
      symbol:      "The dancing figure is both inside and outside the wreath — integrated with the cycle, not imprisoned by it.",
      affirmation: "I have arrived. I honor the journey that brought me here."
    },

    // ── WANDS ──────────────────────────────────────────────────────

    "Ace of Wands": {
      theme:       "Creative fire announces itself as impulse — the skill is learning to trust the spark before you can see the flame.",
      inReading:   "Something new wants to begin through you. The Ace of Wands is pure potential — a business idea, a creative project, a sudden passion. Act before the rational mind talks you out of it.",
      shadow:      "Mistaking excitement for commitment. Starting brilliantly and stopping when the novelty fades.",
      symbol:      "The wand sprouts leaves even as it's held — vitality that doesn't wait for ideal conditions.",
      affirmation: "I say yes to what wants to move through me."
    },
    "Two of Wands": {
      theme:       "Standing on the edge of the familiar and choosing the horizon anyway.",
      inReading:   "You have outgrown your current container. The Two of Wands asks whether you are ready to plan beyond your comfort zone. The world in your hand is not a destination — it is a question.",
      shadow:      "Planning as a way of feeling ready without becoming ready. Mistaking the map for movement.",
      symbol:      "The figure holds a globe at the edge of a parapet — possibility is always held, never quite reached, until you move.",
      affirmation: "I plan boldly and then I move."
    },
    "Three of Wands": {
      theme:       "The ships have sailed — now you do the harder thing and trust them.",
      inReading:   "The Three of Wands rewards those who committed earlier and now watch results arrive. Expansion is underway. This is a card of foresight confirmed — what you invested in is returning.",
      shadow:      "Waiting for results instead of preparing for what comes with them.",
      symbol:      "Ships on the horizon — already sent, already in motion. The work of launching is complete.",
      affirmation: "What I have sent out is already returning to me."
    },
    "Four of Wands": {
      theme:       "Some moments are complete in themselves and ask nothing more than to be enjoyed.",
      inReading:   "A genuine milestone. The Four of Wands celebrates stability earned, community gathered, and joy that is real rather than performed. Don't diminish it by immediately reaching for the next thing.",
      shadow:      "Performing celebration while privately dissatisfied. Joy that requires an audience.",
      symbol:      "The garland-draped canopy — shelter created by human hands, temporary and beautiful.",
      affirmation: "I celebrate what I have built."
    },
    "Five of Wands": {
      theme:       "Conflict is not the problem — undirected energy is the problem.",
      inReading:   "The Five of Wands brings friction, competition, and the chaos of multiple agendas colliding. This may be external or internal. The question is whether the conflict is generative or merely noisy.",
      shadow:      "Picking fights to avoid stillness. Competition that masks insecurity.",
      symbol:      "Five figures strike at each other with no clear combatants — the chaos has no center. Find yours.",
      affirmation: "I channel my fire rather than scatter it."
    },
    "Six of Wands": {
      theme:       "Receive the recognition without letting it become your measure of worth.",
      inReading:   "Victory is here and others can see it. The Six of Wands asks you to accept acknowledgment gracefully and without deflection. You earned this. Now don't let it define you.",
      shadow:      "Needing the applause to feel the victory was real. Identity built on external validation.",
      symbol:      "The laurel wreath — borrowed from Roman triumph, temporary by design. Wear it while it fits.",
      affirmation: "I receive recognition with humility and continue."
    },
    "Seven of Wands": {
      theme:       "Defending what you've built is not arrogance — it is the cost of having built it.",
      inReading:   "You hold a position others want. The Seven of Wands asks you to hold your ground with clarity, not aggression. Who is challenging you, and is the challenge legitimate?",
      shadow:      "Defensiveness that mistakes every question for an attack. Holding ground that should be yielded.",
      symbol:      "The high ground — position matters, but position must be actively maintained.",
      affirmation: "I stand for what I've built without apology."
    },
    "Eight of Wands": {
      theme:       "Speed is not the enemy of intention — sometimes the clearest path is also the fastest one.",
      inReading:   "The Eight of Wands brings rapid movement, swift communications, and the sensation of events accelerating. Don't slow down out of habit. The moment has momentum — ride it.",
      shadow:      "Haste that skips essential steps. Confusing velocity with direction.",
      symbol:      "Eight wands in flight, parallel and purposeful — speed without chaos, motion with form.",
      affirmation: "I move swiftly and with clarity."
    },
    "Nine of Wands": {
      theme:       "Resilience is not the absence of exhaustion — it is choosing to stand anyway.",
      inReading:   "You are close to the end of something that has cost you. The Nine of Wands asks for one more effort — not from enthusiasm, but from the deeper knowledge that this matters. Rest after.",
      shadow:      "Suspicion that has outlasted its usefulness. Guarding against threats that have already passed.",
      symbol:      "The figure is bandaged but upright — wounded, not defeated. There is a difference.",
      affirmation: "I have more in me than I think."
    },
    "Ten of Wands": {
      theme:       "What you carry says as much about your beliefs as your circumstances.",
      inReading:   "The Ten of Wands shows overextension — you have taken on more than is sustainable. Some of what you're carrying was never yours to carry. What can be set down, delegated, or released?",
      shadow:      "The belief that being burdened proves your worth. Suffering as identity.",
      symbol:      "The figure hunches under the load, unable to see what lies ahead — the weight is also a blindfold.",
      affirmation: "I put down what is not mine to carry."
    },
    "Page of Wands": {
      theme:       "Enthusiasm is a form of intelligence — don't apologize for it.",
      inReading:   "The Page of Wands brings news, inspiration, and the energy of genuine excitement about what's possible. This is not naivety — it is the beginning of mastery. What is calling to you?",
      shadow:      "Excitement without follow-through. The endless beginning that never becomes a middle.",
      symbol:      "The salamander on his tunic — fire that lives in fire, passion that sustains itself.",
      affirmation: "I begin with full enthusiasm and let it carry me forward."
    },
    "Knight of Wands": {
      theme:       "Movement is your natural state — the work is learning to steer.",
      inReading:   "The Knight of Wands brings bold, fast, passionate action. The direction may not be perfectly planned, but the energy is real. Channel it rather than suppress it. What adventure is calling?",
      shadow:      "Impulsiveness that burns bridges before crossing them. Passion that outpaces consequence.",
      symbol:      "The rearing horse — power and momentum that must be held in relationship, not abandoned.",
      affirmation: "I act with passion and direct it with purpose."
    },
    "Queen of Wands": {
      theme:       "Confidence is not the absence of doubt — it is the choice to proceed in spite of it.",
      inReading:   "The Queen of Wands embodies creative authority and magnetic warmth. She inspires because she is genuinely inspired. Where are you waiting for permission to lead?",
      shadow:      "Dominating rather than inspiring. Using warmth strategically rather than offering it freely.",
      symbol:      "The black cat at her feet — the shadow self acknowledged, not hidden. Her power includes her darkness.",
      affirmation: "I lead from authentic fire."
    },
    "King of Wands": {
      theme:       "Vision without execution is just imagination — execution without vision is just labor.",
      inReading:   "The King of Wands is the visionary entrepreneur — he sees what could be and has learned to build it. What long-range vision requires your decisive leadership right now?",
      shadow:      "Tyranny of vision. Burning others out in service of an idea they didn't choose.",
      symbol:      "The salamander on his throne — mastery over fire, not immunity to it.",
      affirmation: "I lead with vision, build with purpose, and inspire by example."
    },

    // ── CUPS ───────────────────────────────────────────────────────

    "Ace of Cups": {
      theme:       "Love is not a feeling that arrives — it is a capacity that opens.",
      inReading:   "The Ace of Cups announces the beginning of emotional abundance — new love, creative inspiration, spiritual opening. The cup overflows only when it is offered upward. What are you willing to receive?",
      shadow:      "Sentimentality over intimacy. The feeling of love without the vulnerability of it.",
      symbol:      "The dove descending — spirit meeting matter, the divine entering the personal.",
      affirmation: "My heart is open to what is coming."
    },
    "Two of Cups": {
      theme:       "True connection requires two people willing to be seen.",
      inReading:   "The Two of Cups speaks to partnership — romantic, creative, or professional — built on mutual recognition and equal exchange. Where in your life are you giving or withholding rather than meeting?",
      shadow:      "Merging that loses selfhood. Partnership as escape from the work of individuation.",
      symbol:      "The caduceus between them — healing that flows both ways, the symbol of balanced exchange.",
      affirmation: "I offer myself fully and receive the same."
    },
    "Three of Cups": {
      theme:       "Joy shared is not divided — it multiplies.",
      inReading:   "The Three of Cups is the card of true friendship, celebration, and the nourishment of community. Are you letting yourself be held by the people who love you? This is not the time for isolation.",
      shadow:      "Socializing as avoidance. The group that keeps everyone at the same comfortable distance.",
      symbol:      "Three women toasting, each fully present — no one watching from the edge.",
      affirmation: "I let myself be celebrated and I celebrate others."
    },
    "Four of Cups": {
      theme:       "What you've decided isn't available may be right in front of you.",
      inReading:   "The Four of Cups speaks to apathy and the blindness of dissatisfaction. You may be so focused on what is missing that you cannot see the cup being offered. What assumption is limiting your vision?",
      shadow:      "Boredom that has become a personality. Refusing what is offered because offering feels like losing.",
      symbol:      "The arm extended from a cloud — the divine offers, and the figure looks away. The offer doesn't disappear, but it won't wait forever.",
      affirmation: "I open my eyes to what is actually available."
    },
    "Five of Cups": {
      theme:       "Grief is not the obstacle to moving on — unexperienced grief is.",
      inReading:   "Something real has been lost and the Five of Cups asks you to face it fully. But two cups still stand behind the figure. The loss is real; it is not total.",
      shadow:      "Grief as identity. The story of what was lost told so often it becomes the defining story.",
      symbol:      "Two upright cups behind the mourning figure — hope genuinely present, not forced.",
      affirmation: "I grieve what was lost without losing what remains."
    },
    "Six of Cups": {
      theme:       "The past is a resource, not a residence.",
      inReading:   "The Six of Cups brings the past into view — childhood memory, old connections, the simpler feeling of an earlier time. Revisit it for nourishment, not escape. What sweetness from your past still feeds you?",
      shadow:      "Nostalgia that idealizes rather than integrates. Living in memory to avoid the present.",
      symbol:      "The child offering flowers — innocence extended, not lost. The gift is still being given.",
      affirmation: "I draw on the past as strength, not refuge."
    },
    "Seven of Cups": {
      theme:       "Not every beautiful possibility is yours to pursue.",
      inReading:   "The Seven of Cups confronts you with options, fantasies, and the seduction of unlimited possibility. The work is discernment — which of these visions is real, and which is avoidance wearing a beautiful mask?",
      shadow:      "Potential as identity. Infinite options used to justify never choosing.",
      symbol:      "Seven cups filled with visions — each one compelling, none of them examined. The fog is the point.",
      affirmation: "I choose one thing fully rather than everything partially."
    },
    "Eight of Cups": {
      theme:       "Leaving is not failure — sometimes it is the most honest thing you can do.",
      inReading:   "The Eight of Cups marks a voluntary departure from something that no longer feeds you. The cups are full and stacked — you built this. And it is still not enough. What do you need to walk away from?",
      shadow:      "Running from the fixable. Mistaking restlessness for wisdom.",
      symbol:      "The figure walks at night, toward mountains — the journey is inward as much as outward.",
      affirmation: "I leave what no longer serves me with gratitude and without guilt."
    },
    "Nine of Cups": {
      theme:       "Satisfaction is available right now — the question is whether you'll let yourself feel it.",
      inReading:   "The Nine of Cups is the wish card. What you hoped for has arrived or is arriving. The challenge is receiving it without immediately upgrading the wish. Contentment is a practice.",
      shadow:      "Complacency disguised as gratitude. Satisfaction that closes rather than opens.",
      symbol:      "The satisfied figure, arms crossed, cups arrayed behind — the banquet is set and he knows it.",
      affirmation: "I receive what I asked for fully and without conditions."
    },
    "Ten of Cups": {
      theme:       "The life you wanted is sometimes exactly the life you have.",
      inReading:   "The Ten of Cups is the card of genuine emotional fulfillment — the relationships, the home, the sense of belonging that comes when values and life align. Are you letting yourself feel this?",
      shadow:      "Performing happiness for the rainbow instead of feeling it. The curated life versus the lived one.",
      symbol:      "The rainbow arc of cups — the storm has passed, the light has returned, and the family stands together.",
      affirmation: "I am home."
    },
    "Page of Cups": {
      theme:       "The intuitive message arrives in the most unlikely container — be willing to receive it.",
      inReading:   "The Page of Cups brings emotional news, creative messages, and the surprising emergence of feeling. Something tender wants to be said or heard. Are you letting yourself be moved?",
      shadow:      "Emotional immaturity disguised as sensitivity. Feelings performed rather than felt.",
      symbol:      "The fish in the cup — the unconscious speaking directly, unexpected and undeniable.",
      affirmation: "I am open to being surprised by what I feel."
    },
    "Knight of Cups": {
      theme:       "Romance is a way of seeing before it is a way of being — what happens when the vision meets reality?",
      inReading:   "The Knight of Cups brings offers, invitations, and the energy of romantic pursuit. He arrives beautifully. The question is what he will do when beauty requires work.",
      shadow:      "Enchantment as avoidance. The perpetual seeker who moves on when things become ordinary.",
      symbol:      "The winged helmet — imagination in motion, idealism that hasn't yet been tested by ground.",
      affirmation: "I follow my heart with my eyes open."
    },
    "Queen of Cups": {
      theme:       "The deepest empathy comes from those who have learned to feel without drowning.",
      inReading:   "The Queen of Cups holds emotional intelligence, deep intuition, and the capacity to be present to another's inner world. She is compassionate because she is honest about her own depths. Whose waters need your presence?",
      shadow:      "Absorbing others' emotions as identity. Empathy that loses the self in service of the feeling.",
      symbol:      "The ornate closed cup — she holds depths that are not always available to others. Privacy is not coldness.",
      affirmation: "I offer presence without losing myself."
    },
    "King of Cups": {
      theme:       "Emotional mastery is not the suppression of feeling — it is the capacity to feel fully without being ruled by it.",
      inReading:   "The King of Cups has learned to navigate deep emotional waters without capsizing. He leads with compassion and holds boundaries with warmth. Where in your life does emotional maturity need to arrive?",
      shadow:      "Emotional manipulation by one who has learned the language of feeling. Compassion as currency.",
      symbol:      "He sits on a throne amid turbulent water — stable not because the sea is calm, but because he is.",
      affirmation: "I feel deeply and choose wisely."
    },

    // ── SWORDS ─────────────────────────────────────────────────────

    "Ace of Swords": {
      theme:       "Clarity is a gift and a demand — once you see clearly, you cannot unsee.",
      inReading:   "The Ace of Swords cuts through confusion. A new truth is available — in a situation, in yourself, in a relationship. It may not be comfortable. It is real.",
      shadow:      "Wielding truth as a weapon. Using clarity to wound rather than illuminate.",
      symbol:      "The crown atop the sword — authority is granted to those who use truth in service of justice.",
      affirmation: "I welcome the truth, even when it costs me something."
    },
    "Two of Swords": {
      theme:       "The blindfold is self-chosen — peace bought by refusing to look.",
      inReading:   "The Two of Swords shows a stalemate — internal or external — maintained by willful avoidance. Removing the blindfold will disturb the balance. And the balance needs to be disturbed.",
      shadow:      "Calling indecision 'keeping the peace.' The truce that serves no one.",
      symbol:      "Crossed swords held in tension — not fighting, not resting. An impossible equilibrium.",
      affirmation: "I am willing to look at what I have been avoiding."
    },
    "Three of Swords": {
      theme:       "Heartbreak is the price of having loved something real.",
      inReading:   "The Three of Swords does not soften its message — something has pierced the heart. Don't intellectualize the pain. Feel it. It will not last forever, but it needs to be met honestly.",
      shadow:      "Rehearsing the wound. Telling the story of the hurt so many times it becomes the whole story.",
      symbol:      "Three swords through a heart in a storm — the wound is specific, the sky is specific. This is not metaphor; this is weather.",
      affirmation: "I grieve honestly and trust that grief ends."
    },
    "Four of Swords": {
      theme:       "Rest is not retreat — it is the preparation that makes meaningful action possible.",
      inReading:   "The Four of Swords calls for intentional recovery. You cannot think your way out of exhaustion. What would it mean to genuinely stop, without guilt, for long enough to restore yourself?",
      shadow:      "Avoidance disguised as recovery. Hiding from what needs to be faced.",
      symbol:      "The stone figure at rest, one sword beneath, three above — the mind quieted, the spirit attending.",
      affirmation: "I rest as an act of wisdom, not weakness."
    },
    "Five of Swords": {
      theme:       "Winning at the cost of everyone around you is its own kind of loss.",
      inReading:   "The Five of Swords raises the question of what victory means when it empties the room. Was the conflict worth what it cost? And whose swords are these — yours, or ones you picked up for someone else?",
      shadow:      "Confusing dominance with strength. The win that isolates.",
      symbol:      "The victor holds swords he didn't all earn — collected from the defeated without ceremony.",
      affirmation: "I choose the kind of victory I can live with."
    },
    "Six of Swords": {
      theme:       "Moving on is not always dramatic — sometimes it is simply getting in the boat.",
      inReading:   "The Six of Swords marks a transition from turbulence to calmer water. The passage is not yet complete. You are moving in the right direction — don't abandon the boat mid-crossing.",
      shadow:      "Carrying every sword into the new chapter. Transition without release.",
      symbol:      "The swords upright in the boat — they come with you, but they are stowed, not drawn.",
      affirmation: "I move toward calmer water and I take only what is mine."
    },
    "Seven of Swords": {
      theme:       "What you take without asking carries the weight of the taking.",
      inReading:   "The Seven of Swords speaks to deception — by others or by yourself. Something is being done in secret that cannot withstand the light. Clever strategy is fine; betrayal is not.",
      shadow:      "Self-deception dressed as pragmatism. The story you tell yourself to justify what you know is wrong.",
      symbol:      "The figure glancing back — guilt is present even when denied.",
      affirmation: "I act with integrity even when no one is watching."
    },
    "Eight of Swords": {
      theme:       "The prison is largely constructed from your own beliefs about what is possible.",
      inReading:   "The Eight of Swords shows the mind turned against itself — bound, blindfolded, surrounded by swords that are not actually blocking exit. The restriction is real, but so is your capacity to move. What belief is the real cage?",
      shadow:      "Victimhood as identity. The helplessness that has become more familiar than freedom.",
      symbol:      "The swords are not touching her — they are close, but they are not barriers. The mind has made them walls.",
      affirmation: "I am freer than I believe myself to be."
    },
    "Nine of Swords": {
      theme:       "The mind is a terrible host — it will keep you up all night with stories that aren't finished yet.",
      inReading:   "The Nine of Swords is the sleepless anxiety card — catastrophizing, rumination, the 3am spiral. The fears are real, but the disasters they're predicting are mostly not. What would it take to put down the thought?",
      shadow:      "Using worry as a form of control. If I anticipate every bad thing, perhaps none of them can surprise me.",
      symbol:      "The nine swords on the wall, not in the body — the suffering is mental, not physical. It is not less real for that.",
      affirmation: "I am safe in this moment, even when my mind says otherwise."
    },
    "Ten of Swords": {
      theme:       "The worst has happened. It is survivable.",
      inReading:   "The Ten of Swords marks absolute defeat, betrayal, or the bitter end of something. It is as bad as it looks. And the sun is rising on the horizon. These two facts coexist.",
      shadow:      "Dramatizing ordinary disappointment into catastrophe. Not every setback is a sword in the back.",
      symbol:      "The sun rises despite everything — it does not wait for permission, and neither does the next chapter.",
      affirmation: "I have survived this. Now I begin."
    },
    "Page of Swords": {
      theme:       "Curiosity is a form of courage — not everything needs to be understood before it is engaged.",
      inReading:   "The Page of Swords brings sharp thinking, new information, and the restless energy of a mind that wants to understand everything. What question is driving you right now, and have you followed it far enough?",
      shadow:      "All analysis, no synthesis. Using intelligence to avoid commitment.",
      symbol:      "The windswept figure on high ground — alert, scanning, always looking for the next thing to examine.",
      affirmation: "I follow my curiosity and trust what I find."
    },
    "Knight of Swords": {
      theme:       "Conviction without consideration leaves wreckage in its wake.",
      inReading:   "The Knight of Swords charges forward with absolute certainty and impressive speed. The question is not his power — it is whether he has checked the road ahead. What are you moving toward too fast to see clearly?",
      shadow:      "Intellectual arrogance. The certainty that one's own analysis is always correct.",
      symbol:      "The horse and rider leaning fully into the charge — committed, fast, and quite possibly wrong about what lies ahead.",
      affirmation: "I act with conviction and remain open to correction."
    },
    "Queen of Swords": {
      theme:       "Compassion and clarity are not opposites — in her hands, they are the same tool.",
      inReading:   "The Queen of Swords has been through something and came out clear rather than bitter. She speaks the truth because she has learned that kindness without honesty is not kindness. Who in your life needs this quality right now?",
      shadow:      "Coldness mistaken for discernment. Using wit to wound while claiming objectivity.",
      symbol:      "One hand raised in welcome, one holding the sword — the invitation is real, and so is the boundary.",
      affirmation: "I speak the truth with precision and with care."
    },
    "King of Swords": {
      theme:       "Judgment that serves justice is among the rarest human capacities.",
      inReading:   "The King of Swords brings the authority of a trained and disciplined mind. He decides fairly, speaks directly, and holds principles above preferences. Where does your situation require this quality?",
      shadow:      "Tyranny disguised as principle. Rules applied selectively in service of personal power.",
      symbol:      "The upright sword — authority that is unambiguous, not wielded, simply present.",
      affirmation: "I think clearly, decide fairly, and hold my word."
    },

    // ── PENTACLES ──────────────────────────────────────────────────

    "Ace of Pentacles": {
      theme:       "Material opportunity arrives as a seed — what you do with it determines everything.",
      inReading:   "The Ace of Pentacles is a concrete new beginning — a job offer, a financial opportunity, a project with real-world potential. The seed is healthy. The question is whether you have the soil and the patience to grow it.",
      shadow:      "Treating every material opportunity as proof of worth. Security confused with meaning.",
      symbol:      "The hand extending from cloud to garden — the divine offering something tangible. Receive it practically.",
      affirmation: "I receive this opportunity and I tend it carefully."
    },
    "Two of Pentacles": {
      theme:       "Balance is not a state you achieve — it is a skill you practice continuously.",
      inReading:   "The Two of Pentacles shows you managing multiple demands with more grace than you feel. The juggling is real. The question is which ball matters most if you can only catch one.",
      shadow:      "Busyness as identity. The person who is always juggling never has to ask what they actually want.",
      symbol:      "The infinity loop connecting the coins — the balance is dynamic, never static.",
      affirmation: "I prioritize clearly and trust my capacity to manage the rest."
    },
    "Three of Pentacles": {
      theme:       "Mastery grows faster in collaboration than in isolation.",
      inReading:   "The Three of Pentacles shows skilled work being recognized and refined through feedback. This is the beginning of genuine craft. Who can you be in honest dialogue with about your work?",
      shadow:      "Refusing collaboration to protect the ego. Mistaking independence for strength.",
      symbol:      "The cathedral detail — great works are built by teams who combine their knowledge across difference.",
      affirmation: "My work improves through honest exchange."
    },
    "Four of Pentacles": {
      theme:       "Security is necessary; hoarding is the fear that security will not hold.",
      inReading:   "The Four of Pentacles asks you to examine your relationship with money, resources, and control. What are you holding on to so tightly that it can't grow? Security and scarcity feel the same from inside the grip.",
      shadow:      "Confusing ownership with safety. The thing you own may be owning you.",
      symbol:      "Coins held to the chest, atop the head, underfoot — every point of contact secured. Nothing breathes.",
      affirmation: "I hold what I need and release what I'm holding from fear."
    },
    "Five of Pentacles": {
      theme:       "Hardship isolates only if you refuse to look up at what is still lit.",
      inReading:   "The Five of Pentacles shows real material difficulty — financial strain, health challenge, the cold feeling of exclusion. And a lit window above. Help exists. Pride or shame may be blocking you from it.",
      shadow:      "The virtue of suffering. Enduring hardship unnecessarily because asking feels like failure.",
      symbol:      "Two figures pass a lighted church window — sanctuary exists, and they pass it in the dark.",
      affirmation: "I ask for what I need without shame."
    },
    "Six of Pentacles": {
      theme:       "Generosity and receiving are the same act, seen from different sides of the exchange.",
      inReading:   "The Six of Pentacles speaks to the flow of resources — money, time, energy. Is it flowing freely in your life, or are you stuck as perpetual giver or perpetual receiver? What would balance look like?",
      shadow:      "Generosity that controls. The gift given in a way that creates obligation.",
      symbol:      "The scales in his hand — he measures even as he gives. Justice governs generosity.",
      affirmation: "I give freely and I receive without debt."
    },
    "Seven of Pentacles": {
      theme:       "The harvest requires the patience to let the growing happen.",
      inReading:   "The Seven of Pentacles asks you to assess long-term investment — in a project, in a relationship, in yourself. Is this growing? Is it growing at the right pace? What would it mean to trust the process?",
      shadow:      "Impatience that pulls the plant up to check the roots. Abandoning the garden before harvest.",
      symbol:      "The figure leans on his hoe, watching — active waiting, not passive hoping.",
      affirmation: "I invest and I wait with trust."
    },
    "Eight of Pentacles": {
      theme:       "Excellence is built repetition by repetition — the unglamorous accumulation of deliberate practice.",
      inReading:   "The Eight of Pentacles is the card of apprenticeship and craft. You are in the learning phase, and the learning is the point. Show up, do the work, refine. What skill are you committed to mastering?",
      shadow:      "Perfectionism that prevents completion. Practicing endlessly to avoid being judged on the result.",
      symbol:      "Eight coins carefully worked, hung on display — the labor is visible, and so is the pride in it.",
      affirmation: "I show up for the practice, not just the performance."
    },
    "Nine of Pentacles": {
      theme:       "Self-sufficiency is not solitude — it is the capacity to stand in your own life fully.",
      inReading:   "The Nine of Pentacles celebrates earned abundance and the dignity of a life you have built for yourself. You have cultivated this. Enjoy it without apology.",
      shadow:      "Using material sufficiency to avoid intimacy. The garden as fortress.",
      symbol:      "The falcon on her gloved hand — wildness tamed and integrated, freedom held in relationship.",
      affirmation: "I enjoy what I have built without guilt or diminishment."
    },
    "Ten of Pentacles": {
      theme:       "Legacy is not what you leave behind — it is what you build into the people and places around you.",
      inReading:   "The Ten of Pentacles speaks to generational wealth in its broadest sense — financial, yes, but also the values, stories, and stability that pass between people across time. What are you building that will outlast you?",
      shadow:      "Tradition as control. The family structure that cannot accommodate difference.",
      symbol:      "Three generations under one arch — the old man, the parents, the children, all held within the lineage.",
      affirmation: "I build something worth inheriting."
    },
    "Page of Pentacles": {
      theme:       "The first step toward mastery is taking the work seriously before anyone else does.",
      inReading:   "The Page of Pentacles holds the coin with careful attention — studying it, not spending it. This is the energy of someone who takes the practical seriously. What opportunity deserves this quality of attention from you?",
      shadow:      "So focused on preparation that beginning never happens. The perpetual student who fears the exam.",
      symbol:      "The coin held at eye level — close examination before action. This is methodical, not timid.",
      affirmation: "I approach what matters to me with care and full attention."
    },
    "Knight of Pentacles": {
      theme:       "Slow and deliberate is not the same as stuck — it is the pace of things built to last.",
      inReading:   "The Knight of Pentacles moves carefully, consistently, and with a deep commitment to quality. He is not exciting. He is reliable. Where in your life does this quality need to arrive?",
      shadow:      "Stubbornness mistaken for stability. The pace that never changes even when change is called for.",
      symbol:      "The heavy horse, unmoving — a different kind of power, one that holds its ground by choice.",
      affirmation: "I do what I say I will do, at the pace that serves the work."
    },
    "Queen of Pentacles": {
      theme:       "Nurturing the material world is a spiritual practice, not a compromise of one.",
      inReading:   "The Queen of Pentacles knows that good food, a beautiful home, and a body well-tended are not indulgences — they are the ground from which everything else grows. Where are you neglecting this wisdom?",
      shadow:      "Comfort that becomes avoidance. Using domestic mastery to avoid larger risks.",
      symbol:      "The rabbit at her feet — fertility, abundance, the earth's generosity given and received.",
      affirmation: "I tend to the practical as a form of love."
    },
    "King of Pentacles": {
      theme:       "True wealth is knowing exactly what is enough.",
      inReading:   "The King of Pentacles has mastered the material world — built something substantial, leads with generosity, and knows how to sustain what he has created. What does your version of this mastery look like?",
      shadow:      "Measuring everything in terms of its material return. Confusing prosperity with worth.",
      symbol:      "The bull-carved throne, vines at his feet — nature and civilization in relationship, abundance that is cultivated, not conquered.",
      affirmation: "I build, I sustain, and I give from genuine abundance."
    },
  };

  // ── RUNES ──────────────────────────────────────────────────────────

  const runes = {
    "Fehu": {
      elderMeaning: "Fehu means 'cattle' in Proto-Germanic — livestock was the original currency of the Norse world. This rune carries the energy of moveable wealth, the kind that flows rather than sits.",
      inCast:       "Fehu in a cast speaks to financial opportunity, earned success, or the responsible management of what you have. It asks: are you stewarding your resources or merely possessing them?",
      phoneme:      "Sound: 'F'. Name from Proto-Germanic *fehu — cattle, wealth, property.",
      affirmation:  "I earn, I steward, and I circulate what I have."
    },
    "Uruz": {
      elderMeaning: "Uruz is the aurochs — the massive wild ox that roamed ancient Europe, untameable and formidable. It represents raw vitality, primal strength, and the power of the body before it was domesticated.",
      inCast:       "Uruz calls on your physical and emotional reserves. It may signal a time of renewed energy, or point to where you are underestimating your own strength. What have you been told you cannot endure?",
      phoneme:      "Sound: 'U'. Name from Proto-Germanic *ūruz — aurochs, wild ox.",
      affirmation:  "I am stronger than I have been allowed to believe."
    },
    "Thurisaz": {
      elderMeaning: "Thurisaz is the thorn — or the giant. In Norse mythology, the thurses were chaotic forces at odds with order. The rune holds both the wound and the boundary that prevents greater wounding.",
      inCast:       "Thurisaz appears at thresholds — moments where force may be necessary or where you are encountering resistance that deserves respect rather than dismissal. What boundary needs to exist here?",
      phoneme:      "Sound: 'Th'. Name from Proto-Germanic *þurisaz — giant, thorn, sharp force.",
      affirmation:  "I move through difficulty with directed force, not reckless aggression."
    },
    "Ansuz": {
      elderMeaning: "Ansuz is the rune of Odin — the god who sacrificed an eye for wisdom and hung nine nights on the world-tree to receive the runes themselves. It is the rune of divine breath, of the mouth, of transmission.",
      inCast:       "Ansuz speaks to communication, inspiration, and the wisdom that arrives unbidden. Pay attention to what is being said around you and through you. A message is moving.",
      phoneme:      "Sound: 'A'. Name from Proto-Germanic *ansuz — god, divine breath, Odin.",
      affirmation:  "I speak what I know and listen for what I don't."
    },
    "Raidho": {
      elderMeaning: "Raidho is the ride — the journey undertaken with purpose. It is the rune of the wheel, of movement aligned with the rhythm of the world, of pilgrimage both literal and internal.",
      inCast:       "Raidho signals movement, journey, or the importance of right timing. It asks whether you are traveling in alignment with your deeper purpose or simply in motion. The road has a direction.",
      phoneme:      "Sound: 'R'. Name from Proto-Germanic *raidō — ride, journey, wagon.",
      affirmation:  "I move purposefully and trust the direction of my journey."
    },
    "Kenaz": {
      elderMeaning: "Kenaz is the torch — controlled fire, the hearth flame, the light carried into the dark. Unlike the chaos of wildfire, Kenaz is illumination held in the human hand.",
      inCast:       "Kenaz brings clarity, creativity, and the capacity to see in what was darkness. A problem becomes solvable. A creative direction reveals itself. Knowledge arrives that can be applied.",
      phoneme:      "Sound: 'K'. Name from Proto-Germanic *kauną — torch, boil, sore — fire that transforms.",
      affirmation:  "I carry the light into what was obscure."
    },
    "Gebo": {
      elderMeaning: "Gebo is the gift — but in the Norse world, gifts created bonds. To receive a gift was to enter into relationship with the giver. The exchange was sacred, and generosity was a social force.",
      inCast:       "Gebo speaks to exchange, partnership, and the sacred nature of giving and receiving. Where in your life is the exchange balanced? Where is someone giving more than they receive, or vice versa?",
      phoneme:      "Sound: 'G'. Name from Proto-Germanic *gebō — gift, exchange, bond.",
      affirmation:  "I give and receive in equal measure."
    },
    "Wunjo": {
      elderMeaning: "Wunjo is joy — but specifically the joy of belonging, of clan, of being among those who know you. It is the deep satisfaction of fitting, not the excitement of novelty.",
      inCast:       "Wunjo signals genuine contentment and harmonious connection. It may also point to where you have been denying yourself belonging — staying at the edge when the circle is open.",
      phoneme:      "Sound: 'W'. Name from Proto-Germanic *wunjō — joy, delight, pasture.",
      affirmation:  "I belong here, and I let myself feel it."
    },
    "Hagalaz": {
      elderMeaning: "Hagalaz is hail — destructive, sudden, and outside human control. The Norse accepted Hagalaz as a force of nature to be weathered rather than prevented, understanding that its damage cleared the way for new growth.",
      inCast:       "Hagalaz announces disruption — often from outside, often sudden. The question is not how to stop it but how to stand in it. What structure of yours needs to be tested by weather?",
      phoneme:      "Sound: 'H'. Name from Proto-Germanic *haglaz — hail, destructive ice.",
      affirmation:  "I weather what I cannot control and find myself still standing."
    },
    "Naudhiz": {
      elderMeaning: "Naudhiz is need — the necessity that sharpens the will. The need-fire of Norse tradition was kindled in times of plague and desperation, requiring two sticks and determined human effort. Constraint as teacher.",
      inCast:       "Naudhiz speaks to genuine limitation and what it is demanding of you. This is not comfortable but it is clarifying. Where is necessity teaching you something you would not have chosen to learn?",
      phoneme:      "Sound: 'N'. Name from Proto-Germanic *naudiz — need, necessity, distress.",
      affirmation:  "What I need, I will find the strength to create."
    },
    "Isaz": {
      elderMeaning: "Isaz is ice — beautiful, still, and dangerous. In Norse cosmology, ice was primordial, the substance of Niflheim from which all things originally froze into form. Stillness before creation.",
      inCast:       "Isaz calls for stillness. Movement may be frozen for a time — this is not failure. Ice preserves as well as immobilizes. What needs to be held still long enough to solidify into something real?",
      phoneme:      "Sound: 'I'. Name from Proto-Germanic *isaz — ice, stillness, preservation.",
      affirmation:  "I am still. In stillness, I clarify."
    },
    "Jera": {
      elderMeaning: "Jera is the year — the full cycle of planting, tending, and harvest. The Norse farmers who first used these runes understood deeply that you cannot rush the harvest, and you cannot skip the planting.",
      inCast:       "Jera announces natural cycles completing. A harvest is arriving that reflects the quality of your earlier effort. This rune rewards patience and right action and cannot be forced.",
      phoneme:      "Sound: 'Y'. Name from Proto-Germanic *jēra — year, good year, harvest.",
      affirmation:  "I trust the cycle and honor each of its seasons."
    },
    "Eihwaz": {
      elderMeaning: "Eihwaz is the yew tree — long-lived, poisonous, and sacred. Yew wood made the longbow. Yew grew in churchyards because it was a tree of death and renewal simultaneously. The axis between worlds.",
      inCast:       "Eihwaz speaks to endurance, the long view, and the capacity to stand at the threshold between endings and beginnings. This rune often appears during transformative passages that require steady nerves.",
      phoneme:      "Sound: 'EI'. Name from Proto-Germanic *eihwaz — yew tree, axis, endurance.",
      affirmation:  "I stand at the threshold without flinching."
    },
    "Perthro": {
      elderMeaning: "Perthro's meaning is debated — possibly a dice cup, possibly a womb, possibly something more esoteric. It is the rune of chance, fate, and the hidden forces that operate beneath the visible surface of events.",
      inCast:       "Perthro appears when outcomes are genuinely uncertain or when fate is at play. It does not predict; it acknowledges the mystery. What are you trying to control that belongs to chance?",
      phoneme:      "Sound: 'P'. Name uncertain — possibly *perþō, a gaming piece or lot-casting vessel.",
      affirmation:  "I release my grip on what I cannot determine and stay open to what arrives."
    },
    "Algiz": {
      elderMeaning: "Algiz is the elk — or the sedge grass with its cutting edges, or the hand raised in warning. All meanings converge: protection through awareness, the boundary that keeps harm at a distance.",
      inCast:       "Algiz appears when you need protection or when you are called to protect another. It also signals that your higher self is near and accessible. Trust the instinct that says: not this, not now.",
      phoneme:      "Sound: 'Z'. Name from Proto-Germanic *algiz — elk, protection, sanctuary.",
      affirmation:  "I am protected and I trust my instincts."
    },
    "Sowilo": {
      elderMeaning: "Sowilo is the sun — the guiding force that allowed navigation at sea and gave life to crops. The sun in northern latitudes was not taken for granted; its arrival after winter was cause for genuine celebration.",
      inCast:       "Sowilo brings success, vitality, and the clarity of full light. What has been obscured is now illuminated. What has been draining can now be restored. Move toward the light.",
      phoneme:      "Sound: 'S'. Name from Proto-Germanic *sōwilō — sun, success, life force.",
      affirmation:  "I move toward what gives me life."
    },
    "Tiwaz": {
      elderMeaning: "Tiwaz is the rune of Tyr — the god who placed his hand in the Fenris wolf's mouth as pledge while the gods bound the wolf with unbreakable chains. He knew he would lose the hand. He did it anyway. Justice above self-preservation.",
      inCast:       "Tiwaz calls for integrity, sacrifice in service of something greater than yourself, and the willingness to keep a promise even when it is costly. Where is honor being asked of you?",
      phoneme:      "Sound: 'T'. Name from Proto-Germanic *tīwaz — the god Tyr, justice, one-handed.",
      affirmation:  "I do what is right, even when it costs me something."
    },
    "Berkano": {
      elderMeaning: "Berkano is the birch tree — one of the first trees to recolonize after glacial retreat, a symbol of resilience and new beginnings. In Norse tradition, the birch was associated with birth, fertility, and the spring goddess.",
      inCast:       "Berkano speaks to new beginnings, fertility, and the nurturing of what is newly born. Something tender is beginning. It needs shelter, not exposure. What new growth requires your careful tending?",
      phoneme:      "Sound: 'B'. Name from Proto-Germanic *berkanan — birch, growth, new beginning.",
      affirmation:  "I tend what is new with patience and protection."
    },
    "Ehwaz": {
      elderMeaning: "Ehwaz is the horse — specifically the bond between horse and rider, one of the most intimate partnerships in the ancient world. The horse gave humans mobility, and the relationship required mutual trust.",
      inCast:       "Ehwaz speaks to partnership, movement through trust, and the kind of progress that is impossible alone. Who or what are you in relationship with that makes you capable of more than you'd be separately?",
      phoneme:      "Sound: 'E'. Name from Proto-Germanic *ehwaz — horse, partnership, loyal progress.",
      affirmation:  "I move forward in trust, with and through my connections."
    },
    "Mannaz": {
      elderMeaning: "Mannaz is the human being — the individual within the community, the self in relationship to others of its kind. The Norse understood humanity not as individual souls but as a network of obligations, stories, and shared fate.",
      inCast:       "Mannaz asks you to consider your relationship to your community, your fellow humans, and to your own humanity. Where are you isolating when you need connection? Where are you disappearing into the collective when you need to stand out?",
      phoneme:      "Sound: 'M'. Name from Proto-Germanic *mannaz — man, human being, self.",
      affirmation:  "I am part of humanity and I am distinctly myself."
    },
    "Laguz": {
      elderMeaning: "Laguz is water — the sea, the river, the unconscious depth. The Norse were intimately connected to the sea as both livelihood and threat. Water gave everything and took everything, on its own terms.",
      inCast:       "Laguz speaks to the unconscious, to emotion that is moving whether you acknowledge it or not, and to the importance of flowing rather than forcing. What are you trying to control that moves like water?",
      phoneme:      "Sound: 'L'. Name from Proto-Germanic *laguz — water, sea, lake, depth.",
      affirmation:  "I flow with what is moving rather than fighting its current."
    },
    "Ingwaz": {
      elderMeaning: "Ingwaz is the rune of the god Ing — a deity of fertility and the peaceful hearth. It represents the seed within the earth, gestation before emergence, the potential that has not yet declared itself.",
      inCast:       "Ingwaz appears when something is being held in reserve — an idea, a pregnancy of any kind, a project not yet ready to emerge. The container is necessary. Trust the gestation.",
      phoneme:      "Sound: 'NG'. Name from Proto-Germanic *ingwaz — the god Ing, seed, fertile potential.",
      affirmation:  "What is growing in me will emerge when the time is right."
    },
    "Dagaz": {
      elderMeaning: "Dagaz is the dawn — not just any moment of light, but the specific threshold between night and day, the liminal instant of transformation. In Norse thought, dawn was magical: a hinge-point between worlds.",
      inCast:       "Dagaz marks a breakthrough, an awakening, or the arrival of clarity after a long darkness. The transformation it signals is often sudden and complete. Something is shifting right now, at the level of perception.",
      phoneme:      "Sound: 'D'. Name from Proto-Germanic *dagaz — day, dawn, breakthrough.",
      affirmation:  "I stand in the dawn of something new."
    },
    "Othalan": {
      elderMeaning: "Othala is the ancestral enclosure — the inherited land, the homestead, the bloodline. In Norse society, land was not simply property; it was identity, continuity, and the living connection to those who came before.",
      inCast:       "Othala speaks to inheritance in every sense — ancestral patterns, family values, the gifts and wounds passed down through blood. What have you inherited that serves you? What needs to be consciously released?",
      phoneme:      "Sound: 'O'. Name from Proto-Germanic *ōþalan — ancestral land, inheritance, home.",
      affirmation:  "I honor what I come from and choose what I carry forward."
    },
  };

  function getTarot(name) {
    const clean = name.replace(/ \(R\)$/, "");
    return tarot[clean] || null;
  }

  function getRune(name) {
    return runes[name] || null;
  }

  return { getTarot, getRune };

})();
