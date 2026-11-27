/*
 * Search guides: one page per thing people actually look up before a goodbye.
 * Each gives ideas and questions to write from, never a finished letter to copy (the letters are always the sender's).
 * Example people and places are American and made up. Edit here, then run: node scripts/guides/build.mjs
 */

export const GUIDES = [
  {
    slug: 'open-when-letter-ideas',
    title: 'Open When Letter Ideas: 50 Prompts for the Time Apart',
    description: 'Open when letter ideas sorted by moment: bad days, sleepless nights, good news, birthdays, and the day you meet again. With questions to start each one.',
    h1: 'Open when letter ideas',
    lede: 'An “open when” letter waits for a moment. The envelope says when, and the person you love decides when that moment has come. Here are ideas sorted by the moments that tend to come up, with a question under each group to help you start.',
    sections: [
      {
        h: 'For the hard days',
        items: [
          'Open when you had a bad day at work',
          'Open when you feel like nobody gets it',
          'Open when you’re homesick',
          'Open when you can’t stop crying',
          'Open when you think you made a mistake',
          'Open when you need a reason to get out of bed',
          'Open when the call dropped and we didn’t finish',
          'Open when you’re angry at me',
          'Open when you’re sick and I can’t bring you soup',
          'Open when you doubt yourself',
          'Open when it rained all week',
          'Open when you want to quit',
        ],
        ask: 'What do you usually say to them on a bad day? Write that down first, in the words you actually use.',
      },
      {
        h: 'For nights',
        items: [
          'Open when you can’t sleep',
          'Open when it’s 3 a.m. here and you’re just getting home',
          'Open when the time difference feels too big',
          'Open when you hear a storm outside',
          'Open when you want to hear my voice',
          'Open when you’re lying awake thinking about us',
          'Open when you miss falling asleep on the phone',
          'Open when the apartment is too quiet',
        ],
        ask: 'Where were you the last time you stayed up talking? Describe the room.',
      },
      {
        h: 'For good news',
        items: [
          'Open when you get the job',
          'Open when you pass the exam',
          'Open when something funny happens and I’m not there',
          'Open when you make a new friend',
          'Open when you finally figure out the bus',
          'Open when you’re proud of yourself',
          'Open when you cook something good',
          'Open when you see something that reminds you of me',
        ],
        ask: 'What did they do the last time they were proud of something? Tell them you noticed.',
      },
      {
        h: 'For the days that come every year',
        items: [
          'Open on your birthday',
          'Open on our anniversary',
          'Open on Thanksgiving',
          'Open on the first snow',
          'Open on New Year’s Eve at midnight',
          'Open on Valentine’s Day',
          'Open on the Fourth of July',
          'Open on the first day of spring',
        ],
        ask: 'Which of these days have you spent together before? Start with what happened last year.',
      },
      {
        h: 'For missing each other',
        items: [
          'Open when you miss me',
          'Open when you need a hug',
          'Open when you want to remember how we met',
          'Open when you forget why we’re doing this',
          'Open when you see a couple holding hands',
          'Open when you find something of mine in your bag',
          'Open when you hear our song',
          'Open when you want to know what I love about you',
        ],
        ask: 'Name one small habit of theirs that you’ll miss first. Small things carry more than big ones.',
      },
      {
        h: 'For the middle and the end',
        items: [
          'Open halfway through',
          'Open when there’s one month left',
          'Open the night before I come home',
          'Open the day we meet again',
          'Open when you’re at the airport',
          'Open when you’re unpacking',
        ],
        ask: 'What do you want to do first when you see them again? Be specific about the place.',
      },
    ],
    tips: [
      ['Write fewer, better letters', 'Ten letters you mean beat forty you rushed. Start with the moments that will surely come: the first night, a bad day, the middle, the end.'],
      ['Use their words, not greeting-card words', 'If you always call them “bug”, write “bug”. The letter should sound like you on a normal Tuesday.'],
      ['Put one real detail in each', 'A street name, the song in the car, what they ordered. Details are what make a letter feel written for one person.'],
      ['Decide who holds the key', 'Some letters work best sealed until a date. Others should be theirs to open whenever they need them. Mix both.'],
    ],
  },
  {
    slug: 'how-to-write-open-when-letters',
    title: 'How to Write Open When Letters (and Make Them Feel Like You)',
    description: 'A plain guide to writing open when letters: how many to write, what to put in each, how long they should be, and how to keep them sealed until their moment.',
    h1: 'How to write open when letters',
    lede: 'You don’t need to be a writer. You need a list of moments, a few honest sentences for each, and a way to keep them sealed until the moment comes. This guide walks through it in the order most people find easiest.',
    steps: [
      ['Pick the moments first', 'Before writing a word, list the moments the time apart will surely bring. The first night, a bad day, a birthday, the middle, the day you meet again. Six to twelve is plenty for most goodbyes.'],
      ['Write the easiest one first', 'Most people find “open when you miss me” or “open on the first night” easiest. Start there. Momentum matters more than order.'],
      ['Start with something that happened', '“Remember the night the car broke down on Lake Shore Drive?” is a better first line than “I love you so much.” A memory brings them back into the room with you.'],
      ['Say what you would actually say', 'Read each letter out loud. If a sentence sounds like a card from a store, cross it out and say it the way you would on the phone.'],
      ['Keep most of them short', 'Half a page is enough for most moments. Save the long one for the day you meet again.'],
      ['Add one thing besides words', 'A photo from that day, a ticket stub, a voice note. Something they can hold or hear changes how the letter lands.'],
      ['Seal them, then let go', 'Mark each one with its moment and trust them to open it at the right time. That trust is part of the gift.'],
    ],
    sections: [
      {
        h: 'How many open when letters should you write?',
        body: 'For a few weeks apart, five to eight. For a semester or a deployment, ten to twenty, plus a few that open on fixed dates so there is always one more coming. More letters are not better if they repeat each other.',
      },
      {
        h: 'Paper, or on their phone?',
        body: 'Paper is beautiful and easy to lose in a move. On a phone, the letters go wherever they go and can stay sealed until their day. Some people do both: a few paper letters in their bag, the rest on their phone.',
      },
      {
        h: 'What if you run out of things to say?',
        body: 'Ask yourself questions instead of trying to write. What did we eat the first time? What do they do when they’re nervous? What do I want them to remember about me if this gets hard? Answer one question per letter.',
      },
    ],
  },
  {
    slug: 'letters-before-deployment',
    title: 'What to Write Before a Deployment: Letter Ideas for Military Families',
    description: 'Ideas for letters to write before a deployment: for the first night, mail call, the hard middle months, birthdays apart, and homecoming. For partners, parents and kids.',
    h1: 'What to write before a deployment',
    lede: 'A deployment has a shape. The first nights are raw, the middle months are long, and homecoming feels far away until suddenly it isn’t. Letters written before they leave can meet each of those stretches. Here are ideas for each, from partners, parents and kids.',
    sections: [
      {
        h: 'For the first night',
        items: [
          'What today felt like for you, honestly',
          'The last normal thing you did together',
          'What you’ll do tonight at home, so they can picture it',
          'A promise about the next letter',
        ],
        ask: 'What was the last ordinary moment before the bags came out? Start there.',
      },
      {
        h: 'For the long middle',
        items: [
          'Open when you’ve lost count of the days',
          'Open when the news makes you worry about home',
          'Open when you need to laugh',
          'Open when you miss the kids',
          'Open when you’re too tired to write back',
          'Open at the halfway point',
        ],
        ask: 'What keeps them going on a long week? Remind them of it in their own words.',
      },
      {
        h: 'For days that happen without them',
        items: [
          'Their birthday',
          'Your anniversary',
          'A child’s first day of school or a recital',
          'Thanksgiving and the holidays',
        ],
        ask: 'How will you spend that day at home? Tell them, so they know they were there in some way.',
      },
      {
        h: 'For homecoming',
        items: [
          'The first meal you’ll make',
          'What changed at home and what stayed the same',
          'What you want to do the first weekend',
          'What you learned about yourself while they were gone',
        ],
        ask: 'Where will you stand when you see them again? Describe it.',
      },
    ],
    tips: [
      ['Check what they can receive', 'Connection, mail and phone use vary a lot by assignment. Ask how letters will reach them before you plan the schedule, and plan for some letters that work offline.'],
      ['Write steady, not just big', 'Short letters that open every week or two often mean more than a few long ones. Steady is what helps in the middle months.'],
      ['Let kids write their own', 'A drawing, three sentences, a joke. Kids’ letters are often the ones that get read the most.'],
      ['Keep it about you and them', 'Leave out details about schedules and locations. Write about home, memories and the future.'],
    ],
  },
  {
    slug: 'letters-for-college-freshman',
    title: 'Letters for a College Freshman: What Parents Can Write Before Move-In Day',
    description: 'Letter ideas for parents sending a child to college: for move-in night, the first exam, homesickness, a bad roommate week, and coming home for Thanksgiving.',
    h1: 'Letters for a college freshman',
    lede: 'Move-in day ends with a hug in a parking lot and a long drive home. The first semester brings exams, new friends, a roommate who never sleeps, and a homesick night or two they may not mention on the phone. Letters written before they go can be there for all of it.',
    sections: [
      {
        h: 'For move-in night',
        items: [
          'What you thought about on the drive home',
          'Something you saw them do today that made you proud',
          'A small memory of their first day of kindergarten',
          'Permission to call, or not call, as much as they want',
        ],
        ask: 'What did they say or do in the parking lot? Write it down before you forget it.',
      },
      {
        h: 'For the first weeks',
        items: [
          'Open when you’re homesick',
          'Open when you don’t know anyone yet',
          'Open when your roommate is driving you crazy',
          'Open when you call home and nobody picks up',
          'Open when you eat in the dining hall alone',
        ],
        ask: 'When were they new somewhere before? Remind them how that turned out.',
      },
      {
        h: 'For exams and grades',
        items: [
          'Open before your first big exam',
          'Open when you get a grade you hate',
          'Open when you want to change your major',
          'Open when you pull an all-nighter',
        ],
        ask: 'What did you struggle with at their age? A little honesty from a parent goes a long way.',
      },
      {
        h: 'For coming home',
        items: [
          'Open the week before Thanksgiving',
          'Open on the drive home for winter break',
          'Open at the end of freshman year',
        ],
        ask: 'What will be waiting for them at home? Their room, the dog, a favorite meal.',
      },
    ],
    tips: [
      ['Let them open some whenever they want', 'Freshmen rarely ask for help. Letters they can open on their own, without calling home, get used on the nights that matter.'],
      ['Keep the advice light', 'One piece of advice per letter, at most. The rest should be about them, not about what they should do.'],
      ['Write from both parents, and siblings', 'Different voices, different letters. A younger sibling’s letter often lands the hardest.'],
      ['Start in July', 'August goes fast. Writing one letter a week through the summer is easier than ten the night before move-in.'],
    ],
  },
  {
    slug: 'long-distance-relationship-letters',
    title: 'Long Distance Relationship Letter Ideas for When You’re Apart',
    description: 'Letter ideas for long distance couples: for the airport, time zones, missed calls, anniversaries apart, and the countdown to seeing each other again.',
    h1: 'Long distance relationship letter ideas',
    lede: 'Long distance has its own small moments: the airport goodbye, a call that cuts out mid-sentence, dinner at different hours, a countdown on the fridge. Letters written ahead of time can be there for those moments, even when the other person is asleep on the other side of the world.',
    sections: [
      {
        h: 'For the goodbye',
        items: [
          'Open on the plane',
          'Open when you land',
          'Open the first night in your new place',
          'Open when you unpack and find my hoodie',
        ],
        ask: 'What did the two of you do the night before they left? Start with that.',
      },
      {
        h: 'For time zones and missed calls',
        items: [
          'Open when I’m asleep and you want to talk',
          'Open when the call drops',
          'Open when we haven’t talked in two days',
          'Open when you’re eating dinner and I’m eating breakfast',
        ],
        ask: 'What time is it for them when you usually call? Write a letter for that exact hour.',
      },
      {
        h: 'For staying close',
        items: [
          'Open when you want to remember our first date',
          'Open when you need to hear what I love about you',
          'Open when you see something we’d laugh at',
          'Open when you want to plan our next trip',
          'Open when you feel far away from me',
        ],
        ask: 'What is a joke only the two of you understand? Put it in one letter and don’t explain it.',
      },
      {
        h: 'For the countdown',
        items: [
          'Open when there are 30 days left',
          'Open the week before',
          'Open at the airport when you come back',
          'Open the day we meet again',
        ],
        ask: 'What is the first thing you’ll do together? Make the plan in the letter.',
      },
    ],
    tips: [
      ['Plan for the hours you don’t overlap', 'Letters they can open while you sleep fill the gap that time zones leave.'],
      ['Mix sealed dates with open ones', 'A letter every week keeps something coming. A few “open when” letters cover the moments you can’t predict.'],
      ['Write back and forth', 'If you both write, the time apart becomes a conversation instead of a wait.'],
      ['Save one for the very end', 'A letter sealed until the day you meet again gives the whole stretch a finish line.'],
    ],
  },
  {
    slug: 'goodbye-letter-before-study-abroad',
    title: 'A Goodbye Letter Before Study Abroad: What to Write and When They Should Open It',
    description: 'What to write to someone leaving to study abroad: for the flight, the first homesick week, culture shock, holidays away, and the trip home. Ideas for partners, parents and friends.',
    h1: 'A goodbye letter before study abroad',
    lede: 'Studying abroad is exciting and lonely at the same time, often in the same afternoon. A single goodbye letter is lovely. A few letters that open at the right moments during the semester can be even better: the flight, the first homesick week, the holidays away, the trip home.',
    sections: [
      {
        h: 'For the flight and the first days',
        items: [
          'Open on the plane',
          'Open when you get to your dorm or host family',
          'Open when you get lost for the first time',
          'Open when you order something you can’t pronounce',
        ],
        ask: 'What were they most nervous about before leaving? Answer that worry directly.',
      },
      {
        h: 'For the hard weeks',
        items: [
          'Open when you feel homesick',
          'Open when the language is exhausting',
          'Open when everyone else seems to be having more fun',
          'Open when you miss food from home',
        ],
        ask: 'What would you cook for them if they were home tonight? Describe it.',
      },
      {
        h: 'For holidays away',
        items: [
          'Open on Thanksgiving',
          'Open on your birthday',
          'Open when everyone at home is together and you’re not',
        ],
        ask: 'How will you celebrate at home? Tell them where their seat will be.',
      },
      {
        h: 'For the end of the semester',
        items: [
          'Open on your last night there',
          'Open on the flight home',
          'Open when you’re back and everything feels strange',
        ],
        ask: 'What do you hope they bring back with them? Not a souvenir, something about who they became.',
      },
    ],
    tips: [
      ['Write before the packing starts', 'The last week is chaos. Write in the weeks before, when you can think.'],
      ['Think about their time zone', 'A letter that opens on their morning reads differently from one at your night.'],
      ['Leave room for their stories', 'Ask questions they can answer when they write back. It turns a goodbye into a conversation.'],
    ],
  },
]
