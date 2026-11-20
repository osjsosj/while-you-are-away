/*
 * The made-up letter box used for the website's product screenshots (scripts/shots/capture.mjs).
 * Sam is writing to Emma before a semester apart. Not real people; every screen is the real app.
 */
import { applyStoryToPlan, normalizeStory } from '../../src/utils/story.js'
import { normalizePlan } from '../../src/utils/plan.js'

const byMonth = []
for (let i = 0; i < 31; i++) {
  const d = new Date(Date.UTC(2024, 3 + i, 1))
  byMonth.push({ month: d.toISOString().slice(0, 7), count: 140 + Math.round(120 * Math.abs(Math.sin(i / 2.6))) })
}

export const STORY = {
  about: 'You two talk most at night: what you ate, who was on the bus, and the long calls when one of you can’t sleep.',
  callEachOther: 'Em, bear',
  memories: [
    { id: 'bikes', title: 'Bikes on the Lakefront Trail', place: 'Lakefront Trail', date: '2023-04-02', sticker: 'bicycle', prompt: 'What do you remember about taking the long way that day?' },
    { id: 'pancakes', title: 'Pancakes at 2 a.m.', place: 'The diner on Clark', sticker: 'pancakes', prompt: 'What did you two talk about over those late stacks?' },
    { id: 'power', title: 'The night the power went out', date: '2024-08-17', sticker: 'candle', prompt: 'What would you tell her about that night now?' },
    { id: 'snow', title: 'Her first snow in Chicago', date: '2024-12-21', sticker: 'snowman', prompt: 'What did her face do when it started?' },
  ],
  catchphrases: [
    { id: 'home', who: 'Emma', text: 'Text me when you’re home' },
    { id: 'eat', who: 'Sam', text: 'Did you eat?' },
  ],
  partings: [
    { id: 'lisbon', date: '2024-01-08', place: 'O’Hare', what: 'Emma’s semester in Lisbon', back: '2024-06-20' },
  ],
  stats: {
    total: 6240, calls: 412, callMinutes: 9180, photos: 820, voices: 96, from: '2023-03-11', to: '2026-11-10', spanDays: 1340, daysTalked: 1121,
    first: { at: '2023-03-11T22:14', role: 'them', text: 'did you get home okay?' },
    busiest: { date: '2024-01-07', count: 212 },
    lateNight: { at: '2024-08-18T04:12', role: 'me', text: 'still awake?' },
    phrases: { goodnight: 640, missYou: 118, loveYou: 301, thanks: 220, sorry: 41, laugh: 990 },
    topEmoji: [], topWords: [], byMonth,
  },
}

const part = (() => { const d = new Date(); d.setDate(d.getDate() + 9); return d.toISOString().slice(0, 10) })()
const back = (() => { const d = new Date(); d.setDate(d.getDate() + 9 + 7 * 16); return d.toISOString().slice(0, 10) })()

const base = normalizePlan({
  tonight: true, last: true,
  scheduled: { enabled: true, schedule: 'weekly', count: 16 },
  neverSaid: [{ id: 'n0', label: 'The first time I saw you', hint: 'Where were you standing?' }],
  anytime: [{ id: 's0', label: 'Open when you can’t sleep', hint: '' }, { id: 's1', label: 'Open when you miss home', hint: '' }],
  occasions: [{ id: 'o0', label: 'Your birthday', date: back.slice(0, 4) + '-03-02' }],
})
const { plan, pins } = applyStoryToPlan(base, normalizeStory(STORY))
const bikes = Object.keys(pins).find((id) => pins[id][0].ref === 'bikes')
const pancakes = Object.keys(pins).find((id) => pins[id][0].ref === 'pancakes')

export const DRAFT = {
  phase1: { fromName: 'Sam', toName: 'Emma', relationship: 'A partner', startDate: part, endDate: back, situation: 'Emma is starting a semester in Lisbon' },
  phase1Done: true,
  phase2: { nicknames: 'Em, bear', shared: 'the lake at night, stars over the water, late night walks', transport: 'the Red Line' },
  phase2Done: true,
  chatOfferSeen: true,
  generatedConfig: { chosenName: 'Letters for Em', welcomeMessage: 'Open one when you miss Chicago.' },
  decor: { style: 'flowers' },
  plan,
  story: STORY,
  capsuleData: {
    t0: { letter: 'Hey, you.\n\nYou’ll read this somewhere over the sea, probably pretending you’re not tired. I put my Ventra card in your coat pocket. Use it the day you come back, and I’ll be at the station.' },
    [bikes]: { letter: 'We were never lost. You just wanted the long way, and I wanted whatever you wanted.', pins: pins[bikes] },
    [pancakes]: { letter: 'Two stacks, one burnt, and you telling me about your sister until the sign in the window flickered.', pins: pins[pancakes] },
    s0: { letter: 'Put your phone face down. Count the trams. I’m doing the same thing, six hours behind.' },
    s1: { letter: 'Go to the bakery on the corner and order in Portuguese. Badly. Tell me everything.' },
    n0: { letter: 'You were holding two coffees and neither was yours.' },
    w0: { letter: 'One week. Send me a photo of your street.' },
    w1: { letter: 'Two weeks. Is the bed still too short?' },
  },
  diary: [
    { id: 'd1', writtenOn: new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10), title: 'Today', body: 'You packed the yellow scarf and said you wouldn’t need it.' },
    { id: 'd2', writtenOn: new Date(Date.now() - 864e5).toISOString().slice(0, 10), title: 'Today', body: 'We walked to the train the long way. Neither of us said why.' },
  ],
  interviewChat: [
    { role: 'assistant', content: 'Hi Sam. Emma leaves for Lisbon soon, and you want something waiting for her there. **How often will you two be able to talk?**' },
    { role: 'user', content: 'Every day probably, but the time difference is six hours. Mornings for her are my nights.' },
    { role: 'assistant', content: 'So you’ll talk, just never at the same time of day. Then letters on a rhythm still help: one a week gives her something that isn’t a call. I saw you always say “Did you eat?”. **Is that where a lot of your nights start?**' },
    { role: 'user', content: 'Ha, yes. And she always says text me when you’re home.' },
  ],
  interviewGathered: 4,
}

/** The planning talk mid-conversation, before the plan is ready. */
export const TALK_DRAFT = { ...DRAFT, phase2Done: false, plan: undefined, story: STORY }

