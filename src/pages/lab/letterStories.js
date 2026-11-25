/**
 * Six made-up goodbyes for the letter lab (/lab/letters) and scripts/test-forms.mjs.
 * Every name, place, date and letter here is invented to test the letter forms; not real people.
 * They differ on purpose: who they are to each other, the feel, how much the chat holds
 * (one has no chat at all), how many goodbyes came before, and which letters they wrote.
 */
import { normalizePlan } from '../../utils/plan.js'
import { applyStoryToPlan, normalizeStory } from '../../utils/story.js'

const add = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
const months = (from, n, f) => Array.from({ length: n }, (_, i) => { const d = new Date(`${from}-01T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() + i); return { month: d.toISOString().slice(0, 7), count: Math.round(f(i)) } })

/* Build a draft the way the app stores one, so recipientView() and boxLook() run on it unchanged. */
function draft({ key, from, to, relationship, mood, part, weeks, situation, story, nicknames, letters, diary = [], anytime = [], never = [], occasions = [], last, ticket = null, signature = null }) {
  const back = add(part, weeks * 7)
  const base = normalizePlan({
    tonight: !!letters.tonight, last: !!last,
    scheduled: { enabled: true, schedule: 'weekly', count: weeks },
    anytime: anytime.map((a, i) => ({ id: `s${i}`, label: a.label })),
    neverSaid: never.map((n, i) => ({ id: `n${i}`, label: n.label })),
    occasions: occasions.map((o, i) => ({ id: `o${i}`, label: o.label, date: o.date })),
  })
  const st = story ? normalizeStory(story) : null
  const { plan, pins } = st ? applyStoryToPlan(base, st) : { plan: base, pins: {} }
  const capsuleData = {}
  if (letters.tonight) capsuleData.t0 = { letter: letters.tonight }
  ;(letters.weeks || []).forEach((w, i) => { if (w) capsuleData[`w${i}`] = { letter: w.text, pins: w.pins || pins[`w${i}`], ...(w.photo ? { photo: w.photo } : {}) } })
  anytime.forEach((a, i) => { capsuleData[`s${i}`] = { letter: a.text } })
  never.forEach((n, i) => { capsuleData[`n${i}`] = { letter: n.text } })
  occasions.forEach((o, i) => { capsuleData[`o${i}`] = { letter: o.text } })
  if (last) capsuleData.l0 = { letter: last }
  return {
    key,
    today: back,
    draft: {
      phase1: { fromName: from, toName: to, relationship, startDate: part, endDate: back, situation },
      phase1Done: true,
      phase2: { nicknames: nicknames || '' },
      phase2Done: true,
      generatedConfig: { chosenName: `Letters for ${to}` },
      decor: { style: mood, ...(ticket ? { ticket: { kind: ticket, letterId: anytime.length ? 's0' : never.length ? 'n0' : 'o0' } } : {}) },
      ...(signature ? { signature: { d: signature } } : {}),
      story: story || undefined,
      plan,
      capsuleData,
      diary: diary.map((d, i) => ({ id: `d${i}`, writtenOn: add(part, -d.before), ...(d.time ? { writtenTime: d.time } : {}), title: '', body: d.text })),
    },
  }
}

export const LETTER_STORIES = [
  draft({
    key: 'sam-emma', from: 'Sam', to: 'Emma', relationship: 'partner', mood: 'night', part: '2026-01-08', weeks: 16, ticket: 'plane',
    signature: 'M20 96 Q 40 30 62 92 Q 70 120 92 70 Q 110 40 120 92 L 150 60 Q 170 40 182 96 Q 200 120 224 70 Q 250 30 262 90 Q 300 110 380 64',
    situation: 'Emma is starting a semester in Lisbon', nicknames: 'Em, bear',
    story: {
      about: 'You two talk most at night.', callEachOther: 'Em, bear',
      memories: [
        { id: 'bikes', title: 'Bikes on the Lakefront Trail', place: 'Lakefront Trail', date: '2023-04-02', sticker: 'bicycle' },
        { id: 'pancakes', title: 'Pancakes at 2 a.m.', place: 'The diner on Clark', sticker: 'pancakes' },
        { id: 'snow', title: 'Her first snow in Chicago', date: '2024-12-21', sticker: 'snowman' },
      ],
      catchphrases: [{ id: 'home', who: 'Emma', text: 'Text me when you’re home' }, { id: 'drive', who: 'Sam', text: 'Drive safe' }],
      partings: [{ id: 'lisbon', date: '2024-01-08', place: 'O’Hare', what: 'Emma’s first semester away', back: '2024-06-20' }],
      stats: { total: 6240, calls: 412, callMinutes: 9180, from: '2023-03-11', to: '2025-12-30', spanDays: 1025, daysTalked: 990, first: { at: '2023-03-11T22:14', role: 'them', text: 'did you get home okay?' }, lateNight: { at: '2024-08-18T04:12', role: 'me', text: 'still awake?' }, phrases: { goodnight: 640, missYou: 118, loveYou: 301, laugh: 990 }, voices: 96, photos: 820, topWords: [{ word: 'em', count: 214 }, { word: 'okay', count: 180 }], byMonth: months('2023-03', 34, (i) => 150 + 110 * Math.abs(Math.sin(i / 2.6))) },
    },
    letters: {
      tonight: 'Hey, you.\n\nYou’ll read this somewhere over the ocean, pretending you’re not tired. My Ventra card is in your coat pocket. Use it the day you come back, and I’ll be at the station.',
      weeks: [
        { text: 'We were never lost. You just wanted the long way, and I wanted whatever you wanted.', photo: '/site/lakefront-trail.jpg', pins: [{ kind: 'memory', ref: 'bikes', text: 'Bikes on the Lakefront Trail', sub: 'Lakefront Trail · Apr 2, 2023' }] },
        { text: 'You say it every single night, and every single night I text you back. Week two. I’m home. I’m always home when I’m talking to you.', pins: [{ kind: 'quote', ref: 'home', text: 'Text me when you’re home', sub: 'Emma' }] },
        { text: 'I counted. Don’t laugh. I wanted to know how much of you I’ve had so far, and it turns out it’s a lot, and it still isn’t enough.', pins: [{ kind: 'stat', ref: 'calls', text: '153 hours', sub: 'on the phone, over 412 calls' }, { kind: 'stat', ref: 'late', text: '4:12 a.m.', sub: 'the latest we stayed up talking, Aug 18, 2024' }, { kind: 'stat', ref: 'first', text: '“did you get home okay?”', sub: 'The first message, Mar 11, 2023' }] },
        { text: 'Four weeks. Send me a photo of your street. The real one, not the pretty one.' },
      ],
    },
    diary: [{ before: 9, text: 'You packed the yellow scarf and said you wouldn’t need it.' }, { before: 1, time: '11:40 PM', text: 'We walked to the train the long way. Neither of us said why.' }],
    anytime: [{ label: 'Open when you can’t sleep', text: 'Put your phone face down. Count the trams. I’m doing the same thing, six hours behind.' }],
    never: [{ label: 'The first time I saw you', text: 'You were holding two coffees and neither was yours.' }],
    last: 'Look up. I’m the one with the sign.',
  }),
  draft({
    key: 'maria-diego', from: 'Mom', to: 'Diego', relationship: 'child', mood: 'flowers', part: '2026-08-20', weeks: 14, ticket: 'bus',
    situation: 'Diego is leaving for college in Austin', nicknames: 'mijo',
    story: {
      about: 'Mostly short texts, a lot of food photos.', callEachOther: 'mijo',
      memories: [
        { id: 'lot', title: 'Driving lessons in the church lot', place: 'St. Anne’s parking lot', date: '2024-05-11', sticker: 'automobile' },
        { id: 'saturday', title: 'Saturday pancakes', place: 'Our kitchen', sticker: 'pancakes' },
      ],
      catchphrases: [{ id: 'land', who: 'Mom', text: 'Call me when you get there' }],
      stats: { total: 2210, calls: 96, callMinutes: 1500, from: '2022-09-01', to: '2026-08-01', spanDays: 1430, daysTalked: 1010, first: { at: '2022-09-01T07:02', text: 'did you take your lunch' }, phrases: { goodnight: 40, thanks: 120 }, byMonth: months('2022-09', 47, (i) => 40 + 20 * Math.abs(Math.cos(i / 3))) },
    },
    letters: {
      tonight: 'Mijo,\n\nYour room already sounds different. I left the hallway light on anyway.',
      weeks: [
        { text: 'You stalled it eleven times and laughed every time. I still don’t know how you parallel park. I know you’ll figure out everything else.', pins: [{ kind: 'memory', ref: 'lot', text: 'Driving lessons in the church lot', sub: 'St. Anne’s parking lot · May 11, 2024' }] },
        { text: 'You never once called when you got there. I’m asking anyway.', pins: [{ kind: 'quote', ref: 'land', text: 'Call me when you get there', sub: 'Mom' }] },
        null,
        { text: 'Week four. Eat something green. I mean it.' },
      ],
    },
    anytime: [{ label: 'Open when you miss home', text: 'Make the pancakes. Burn the first one. That one was always mine.' }],
    occasions: [{ label: 'Your birthday', date: '2026-10-03', text: 'Nineteen. I was nineteen when I first held you. Happy birthday, my love.' }],
    last: 'The porch light is on. Come in, it’s open.',
  }),
  draft({
    key: 'tyler-jess', from: 'Tyler', to: 'Jess', relationship: 'partner', mood: 'night', part: '2026-03-02', weeks: 10,
    situation: 'Jess leaves for basic training', nicknames: 'J',
    story: null,
    letters: {
      tonight: 'J,\n\nTen weeks. I know you’re going to be great at this and terrible at sleeping.',
      weeks: [{ text: 'First week done. They can’t take your stubbornness away from you, so don’t let them try.' }, { text: 'Two weeks. I made your chili. It was worse than yours.' }],
    },
    anytime: [{ label: 'Open when it gets hard', text: 'You chose this. You choose it again tomorrow. I’m proud of you either way.' }],
    last: 'Hi. Hi. Hi.',
  }),
  draft({
    key: 'priya-anika', from: 'Priya', to: 'Anika', relationship: 'friend', mood: 'scrapbook', part: '2026-06-14', weeks: 12, ticket: 'plane',
    situation: 'Anika is moving to Seattle', nicknames: 'Ani',
    story: {
      about: 'You talk all day in bursts.', callEachOther: 'Ani',
      memories: [
        { id: 'karaoke', title: 'Karaoke at the Brass Monkey', place: 'Brass Monkey, NYC', date: '2025-02-14', sticker: 'microphone' },
        { id: 'rooftop', title: 'The rooftop with the broken chair', place: 'Your old building', date: '2024-07-04', sticker: 'fireworks' },
      ],
      catchphrases: [{ id: 'omw', who: 'Anika', text: 'omw (I am not omw)' }],
      partings: [{ id: 'college', date: '2018-08-25', place: 'Newark', what: 'College, opposite coasts' }, { id: 'london', date: '2022-01-10', place: 'JFK', what: 'Your London year' }],
      stats: { total: 48210, calls: 220, callMinutes: 6100, from: '2017-09-02', to: '2026-06-01', spanDays: 3195, daysTalked: 3020, first: { at: '2017-09-02T13:40', text: 'is this the right lecture hall' }, lateNight: { at: '2023-11-02T03:48', text: 'ok ONE more episode' }, busiest: { date: '2025-02-14', count: 412 }, phrases: { laugh: 9900, thanks: 220 }, byMonth: months('2017-09', 105, (i) => 380 + 200 * Math.abs(Math.sin(i / 5))) },
    },
    letters: {
      tonight: 'Ani.\n\nYou left your good hoodie. I’m keeping it as a hostage.',
      weeks: [
        { text: 'We sang the wrong song on purpose and got applause anyway. Seattle doesn’t know what’s coming.', pins: [{ kind: 'memory', ref: 'karaoke', text: 'Karaoke at the Brass Monkey', sub: 'Brass Monkey, NYC · Feb 14, 2025' }] },
        { text: 'Nine years of you saying this, nine years of me believing it.', pins: [{ kind: 'quote', ref: 'omw', text: 'omw (I am not omw)', sub: 'Anika' }] },
        { text: 'For the record.', pins: [{ kind: 'stat', ref: 'busiest', text: '412 messages', sub: 'in one day, Feb 14, 2025' }, { kind: 'stat', ref: 'late', text: '3:48 a.m.', sub: 'the latest we stayed up talking, Nov 2, 2023' }] },
      ],
    },
    never: [{ label: 'Why I never said goodbye at airports', text: 'Because then it counts.' }],
    occasions: [{ label: 'Your new-job day', date: '2026-07-06', text: 'Go be terrifyingly good at it.' }],
    last: 'Your hoodie and I are at arrivals.',
  }),
  draft({
    key: 'walt-lily', from: 'Grandpa Walt', to: 'Lily', relationship: 'parent', mood: 'quiet', part: '2026-09-01', weeks: 20, ticket: 'train',
    situation: 'Lily is spending a gap year in Japan', nicknames: 'Lil',
    story: {
      about: 'Long emails on Sunday mornings.', callEachOther: 'Lil',
      memories: [{ id: 'garden', title: 'Tomatoes in the back garden', place: 'Dayton, Ohio', date: '2019-08-03', sticker: 'tomato' }],
      catchphrases: [],
      stats: { total: 410, calls: 30, callMinutes: 900, from: '2021-01-03', to: '2026-08-20', spanDays: 2055, daysTalked: 300, byMonth: months('2021-01', 68, () => 6) },
    },
    letters: {
      tonight: 'Dear Lil,\n\nI have written this letter four times. Your grandmother would have done it in one. Here is what I want you to know before you go. You do not have to have a plan to be on the right road. When I was your age I took a bus to Cleveland with eleven dollars and the wrong address, and it turned out to be the best mistake I ever made, because the right address was across the street from your grandmother.\n\nEat the strange food. Get lost on purpose at least once a week. Write down the names of the people who are kind to you; you will want them later.\n\nAnd send your old grandfather a photograph of a temple, a train, and a bowl of something he cannot pronounce.',
      weeks: [{ text: 'The plants are fine. I talk to them; they are poor conversationalists. You would laugh.', pins: [{ kind: 'memory', ref: 'garden', text: 'Tomatoes in the back garden', sub: 'Dayton, Ohio · Aug 3, 2019' }] }],
    },
    anytime: [{ label: 'Open when you feel far away', text: 'You are exactly as far from me as the nearest post office. That is not far at all.' }],
    last: 'Welcome home, Lil. The tomatoes waited for you.',
  }),
  draft({
    key: 'nora-luke', from: 'Nora', to: 'Luke', relationship: 'sibling', mood: 'scrapbook', part: '2026-04-15', weeks: 26,
    situation: 'Luke is deploying with the Navy', nicknames: 'Lukey',
    story: {
      about: 'Memes, mostly. Real talk at 1 a.m.', callEachOther: 'Lukey',
      memories: [{ id: 'ferry', title: 'The ferry to Bainbridge in the rain', place: 'Seattle Ferry Terminal', date: '2023-10-21', sticker: 'ferry' }],
      catchphrases: [{ id: 'fine', who: 'Luke', text: 'It’s fine, it’s fine, it’s fine' }],
      partings: [{ id: 'boot', date: '2021-06-01', place: 'Great Lakes', what: 'Boot camp' }, { id: 'first', date: '2023-02-10', place: 'Norfolk', what: 'First deployment' }],
      stats: { total: 15400, calls: 60, callMinutes: 2400, from: '2019-05-01', to: '2026-04-01', spanDays: 2527, daysTalked: 1900, lateNight: { at: '2025-01-03T01:52', text: 'u up' }, byMonth: months('2019-05', 83, (i) => 150 + 80 * Math.abs(Math.cos(i / 4))) },
    },
    letters: {
      tonight: 'Lukey,\n\nThird goodbye. You’d think I’d be better at it.',
      weeks: [
        { text: 'You said it was fine. It was not fine. We were soaked. Best day.', pins: [{ kind: 'memory', ref: 'ferry', text: 'The ferry to Bainbridge in the rain', sub: 'Seattle Ferry Terminal · Oct 21, 2023' }] },
        { text: 'Everything is, apparently.', pins: [{ kind: 'quote', ref: 'fine', text: 'It’s fine, it’s fine, it’s fine', sub: 'Luke' }] },
      ],
    },
    never: [{ label: 'I was scared the first time', text: 'I acted annoyed at the airport because otherwise I would have cried in front of your whole division.' }],
    occasions: [{ label: 'Mom and Dad’s anniversary', date: '2026-06-20', text: 'Call them. I’ll hold the phone up to the cake.' }],
    last: 'Welcome back. You owe me eleven memes.',
  }),
  // the edges: very long names and places, a long saying, a Korean letter, a long "open when" reason, big numbers
  draft({
    key: 'edge-cases', from: 'Christopher-Montgomery', to: 'Maximiliana Josephine', relationship: 'friend', mood: 'flowers', part: '2026-05-01', weeks: 3,
    situation: 'Maximiliana is moving abroad', nicknames: 'Maximiliana-the-Magnificent', ticket: 'train',
    story: {
      about: 'Everything, all the time.', callEachOther: 'Maximiliana-the-Magnificent',
      memories: [{ id: 'boardwalk', title: 'The very long boardwalk next to the old lighthouse where we got caught in the rain', place: 'Point Wilson Lighthouse boardwalk, Port Townsend, Washington', date: '2019-09-14', sticker: 'lighthouse' }],
      catchphrases: [{ id: 'coffee', who: 'Christopher-Montgomery', text: 'If you are reading this then you owe me a coffee and also a very long phone call about absolutely everything' }],
      partings: [{ id: 'gap', date: '2020-01-02', place: 'Seattle–Tacoma International Airport, North Satellite', what: 'The gap year that turned into two' }],
      stats: { total: 1284530, calls: 12040, callMinutes: 998000, from: '2010-01-01', to: '2026-04-20', spanDays: 5953, daysTalked: 5800, first: { at: '2010-01-01T00:01', text: 'happy new year from the worst party in the entire state of washington' }, lateNight: { at: '2025-12-31T05:59', text: 'go to sleep' }, byMonth: months('2010-01', 196, (i) => 500 + 400 * Math.abs(Math.sin(i / 7))) },
    },
    letters: {
      tonight: '보고 싶어. 매일 밤 네 생각해. 잘 도착하면 꼭 연락해 줘.',
      weeks: [
        { text: 'Antidisestablishmentarianism is the only word long enough for how much I miss you this week.', pins: [{ kind: 'memory', ref: 'boardwalk', text: 'The very long boardwalk next to the old lighthouse where we got caught in the rain', sub: 'Point Wilson Lighthouse boardwalk, Port Townsend, Washington · Sep 14, 2019' }] },
        { text: 'You know what you owe me.', pins: [{ kind: 'quote', ref: 'coffee', text: 'If you are reading this then you owe me a coffee and also a very long phone call about absolutely everything', sub: 'Christopher-Montgomery' }] },
        { text: 'Sixteen years.', pins: [{ kind: 'stat', ref: 'total', text: '1,284,530 messages', sub: 'since January 1, 2010, through every single phone either of us ever dropped in a lake' }, { kind: 'stat', ref: 'calls', text: '16,633 hours', sub: 'on the phone, over 12,040 calls' }] },
      ],
    },
    anytime: [{ label: 'Open when the whole world feels like it is far too loud and you just need someone who knows you', text: 'Breathe. I am right here, just very far away.' }],
    never: [{ label: 'The thing about the lighthouse', text: 'I knew then.' }],
    occasions: [{ label: 'The anniversary of the worst party in the entire state', date: '2026-05-10', text: 'Happy worst-party day.' }],
    last: 'Come home. The lighthouse is still there.',
  }),
]
