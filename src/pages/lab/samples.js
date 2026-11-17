/**
 * Three made-up stories, shaped like what the chat analysis will hand over.
 * Names, places, dates and every letter are invented for the design lab. Not real customers.
 * Letters come in three lengths on purpose: a long first-night letter, a medium weekly one, short notes.
 */

/** Messages per month, made up but shaped like a real chat: busy stretches, quiet ones, a spike at a goodbye. */
function months(start, count, shape) {
  const [y, m] = start.split('-').map(Number)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 + i, 1))
    return { month: d.toISOString().slice(0, 7), count: Math.max(0, Math.round(shape(i))) }
  })
}

const HAEUN_LONG = `민준아.

지금 이 편지를 읽고 있으면 너는 논산에서 첫날 밤을 보내고 있겠지. 나는 아마 우리 7번 버스 정류장 앞을 괜히 한 번 더 지나왔을 거야. 오늘 아침에 귤 두 개를 샀는데, 버릇처럼 하나를 반으로 갈라놓고 나서야 네가 없다는 게 실감 났어.

처음 버스에서 네가 귤을 나눠줬을 때 기억나? 껍질을 한 번에 동그랗게 까서 나한테 내밀었잖아. 그게 뭐라고 그날 집에 와서 엄마한테 자랑까지 했어. 그 뒤로 우리는 어디를 가든 귤을 하나씩 들고 다녔지. 한강에서 라면 먹던 새벽에도, 첫눈 오던 성수에서도.

솔직히 말하면 이번 이별이 좀 무서워. 하루에 몇십 개씩 주고받던 메시지가 갑자기 멈춘다는 게 아직 잘 상상이 안 돼. 그래서 이 편지를 미리 잔뜩 써두기로 했어. 네가 전화를 못 하는 날에도 뭔가 하나는 도착하도록.

힘든 날엔 그냥 생각해. 여기서 누가 매일 너 오는 날을 세고 있다고. 나는 잘 지낼 거야. 밥도 잘 먹고, 너 없는 동안 귤도 적당히만 먹을게.

도착하면 연락해. 이번엔 내가 기다릴게.`

const JISU_LONG = `엄마.

공항에서 게이트 들어가기 전에 엄마가 내 손을 한 번 더 잡았잖아. 나는 괜히 쑥스러워서 금방 놨는데, 비행기 안에서 그게 계속 생각났어. 이번엔 그 손 조금 더 오래 잡고 있을걸.

벌써 세 번째 출국이네. 처음 토론토 갈 때는 엄마가 공항에서 계속 웃기만 해서 나는 엄마가 별로 안 서운한 줄 알았어. 나중에 이모한테 들었어. 집에 가는 차 안에서 엄마가 한참 울었다고.

엄마가 매일 보내던 "밥은 먹었니" 있잖아. 솔직히 처음엔 좀 귀찮았어. 근데 바빠서 답을 못 한 날엔 이상하게 마음이 불편하더라. 그게 엄마가 나한테 매일 하는 사랑한다는 말이었다는 걸, 떨어져 살면서 알았어.

일요일 아침 페이스톡도 고마워. 화면 너머로 엄마가 커피 들고 앉아 있는 걸 보면, 여기 아침이 조금 덜 낯설어. 요즘은 나도 커피 한 잔 타서 같이 마셔.

이번에는 졸업하고 일 시작하는 거라 언제 돌아갈지 아직 몰라. 그래도 약속할게. 밥 잘 챙겨 먹고, 일요일마다 전화할게. 이번엔 엄마가 묻기 전에 내가 먼저 말할게. 엄마, 밥은 먹었어?`

const ALEX_LONG = `Sam,

You're reading this on your first night in Berlin, which means the flat is full of boxes and you've eaten something from a petrol station. I know you.

I've been trying to work out when we became the kind of friends who text every day. I think it was the N26. You missed your stop because you were telling me about your terrible date, and we rode it to the end of the line and walked back in the rain. Two hours. Best night of that whole year.

Then there were the Tuesdays. Room 4, the sticky microphone, you insisting on one more song every single time, and every single time the one more song was the same song. I'm not going to say which one. You know.

And the festival. We stood in a field of mud for nine hours and you said it was the best day of your life, soaked to the skin, holding an umbrella that had given up hours before.

I'm not great at saying this out loud, so I'm writing it down: you made this city feel like mine. I don't know who I'll sing badly with now.

Go find a Room 4 there. Find a night bus. When it rains, open the other letter.`

export const SAMPLES = [
  {
    key: 'haeun',
    label: '연인 · 입대',
    lang: 'ko',
    story: {
      from: '하은', to: '민준', relationship: 'partner', mood: 'night',
      nicknames: ['곰돌이'],
      catchphrases: [{ who: '민준', text: '도착하면 연락해', letter: 'a3' }],
      memories: [
        { id: 'a-m1', title: '7번 버스에서 나눠 먹던 귤', place: '7번 버스', date: '2023-03-14', things: ['귤', '버스'], transport: 'bus', sticker: 'tangerine' },
        { id: 'a-m2', title: '새벽 한강 라면', place: '한강 반포', date: '2023-08-02', things: ['라면', '새벽', '한강'], sticker: 'steaming-bowl' },
        { id: 'a-m3', title: '첫눈 오던 날 성수', place: '성수', date: '2023-12-01', things: ['첫눈', '귤 하나씩'], sticker: 'snowflake' },
      ],
      partings: [],
      now: { date: '2026-12-01', place: '논산', what: '입대' },
      stats: { spanDays: 990, daysTalked: 905, total: 61200, calls: 310, callMinutes: 9100, lateNight: 140, byMonth: months('2023-03', 33, (i) => 1500 + 700 * Math.sin(i / 3) + (i > 28 ? 900 : 0)) },
      diary: ['너 짐 싸는 거 도와준 날', '마지막 한강', '내일이 온다'],
      letters: [
        { id: 'a1', section: 'tonight', title: '첫날 밤에', memory: 'a-m1', body: HAEUN_LONG },
        { id: 'aw', section: 'scheduled', title: '1주차', memory: 'a-m3', body: '일주일 됐다. 오늘 버스에서 누가 귤을 까는 냄새가 나서 고개를 돌렸는데 당연히 너는 아니었지.\n\n요즘 나는 퇴근길에 일부러 한 정거장 먼저 내려서 걸어. 네가 걷자고 하던 그 길로. 거기 편의점 아저씨가 오늘은 왜 혼자냐고 물어서, 군대 갔다고 했더니 귤 하나를 서비스로 줬어. 너 대신 받은 걸로 할게.\n\n다음 주엔 더 재밌는 얘기 들고 올게.' },
        { id: 'a2', section: 'anytime', title: '잠이 안 올 때', memory: 'a-m2', body: '새벽 두 시 한강, 라면 불던 거 기억나? 지금도 그 시간에 깨어 있으면 그날 생각해.' },
        { id: 'a3', section: 'occasions', title: '훈련 끝난 날', memory: 'a-m3', body: '도착하면 연락해. 네가 맨날 하던 말 이번엔 내가 할게.' },
      ],
    },
  },
  {
    key: 'jisu',
    label: '자녀 → 엄마 · 유학',
    lang: 'ko',
    story: {
      from: '지수', to: '엄마', relationship: 'child', mood: 'flowers',
      nicknames: ['울 엄마'],
      catchphrases: [{ who: '엄마', text: '밥은 먹었니', letter: 'b2' }],
      memories: [
        { id: 'b-m1', title: '인천공항 배웅', place: '인천공항', date: '2023-06-04', things: ['공항', '비행기'], transport: 'plane', sticker: 'airplane' },
        { id: 'b-m2', title: '엄마 김치찌개', place: '우리 집', things: ['김치찌개', '집밥'], sticker: 'pot-of-food' },
        { id: 'b-m3', title: '일요일 아침 페이스톡', things: ['일요일', '커피 한 잔'], sticker: 'hot-beverage' },
      ],
      partings: [
        { date: '2023-06-04', place: '인천공항', what: '토론토로 출국', back: '2024-12-18' },
        { date: '2025-01-08', place: '인천공항', what: '다시 출국', back: '2025-08-02' },
      ],
      now: { date: '2026-12-20', place: '인천공항', what: '졸업하고 취업' },
      stats: { spanDays: 1200, daysTalked: 230, total: 1200, calls: 260, callMinutes: 1400, lateNight: 12, byMonth: months('2023-06', 40, (i) => 20 + 18 * Math.cos(i / 2.2) + (i === 18 ? 120 : 0)) },
      diary: ['엄마 몰래 반찬통 챙김', '공항 가는 길 미리 가봄', '엄마랑 마지막 장보기'],
      letters: [
        { id: 'b1', section: 'tonight', title: '공항에서 못 한 말', memory: 'b-m1', body: JISU_LONG },
        { id: 'bw', section: 'scheduled', title: '1주차', memory: 'b-m2', body: '엄마, 여기 온 지 일주일. 마트에서 김치를 샀는데 엄마 김치 맛이 안 나.\n\n그래서 영상 보고 김치찌개를 끓여봤는데 엄마 거랑은 완전 달라. 뭐가 빠진 걸까? 이번 일요일에 전화하면 레시피 처음부터 다시 알려줘. 받아 적을게.\n\n아빠한테는 내가 요리한다고 말하지 마. 놀리실 거야.' },
        { id: 'b2', section: 'anytime', title: '밥 거르고 싶은 날', memory: 'b-m2', body: '엄마가 맨날 묻던 거, 오늘은 내가 먼저 물어볼게. 밥은 먹었어?' },
        { id: 'b3', section: 'anytime', title: '일요일 아침에', memory: 'b-m3', body: '이번 주 일요일엔 내가 먼저 전화할게. 커피 타 놓고 기다려.' },
      ],
    },
  },
  {
    key: 'alex',
    label: '친구 · 이사',
    lang: 'en',
    story: {
      from: 'Alex', to: 'Sam', relationship: 'friend', mood: 'scrapbook',
      nicknames: ['Sammy'],
      catchphrases: [{ who: 'Sam', text: 'one more song', letter: 'c3' }],
      memories: [
        { id: 'c-m1', title: 'The N26 night bus home', place: 'N26', date: '2025-02-11', things: ['night bus', 'chips'], transport: 'bus', sticker: 'bus' },
        { id: 'c-m2', title: 'Karaoke Tuesdays', place: 'Room 4', things: ['karaoke', 'neon'], sticker: 'microphone' },
        { id: 'c-m3', title: 'The festival it rained on', place: 'Field Day', date: '2024-07-20', things: ['rain', 'umbrella', 'festival'], sticker: 'umbrella-with-rain-drops' },
      ],
      partings: [],
      now: { date: '2026-12-05', place: 'Berlin', what: 'moving' },
      stats: { spanDays: 520, daysTalked: 380, total: 9100, calls: 22, callMinutes: 310, lateNight: 60, byMonth: months('2025-06', 18, (i) => 400 + 260 * Math.sin(i / 1.6 + 1)) },
      diary: ['Packing your records', 'Last Tuesday at Room 4', 'Tomorrow'],
      letters: [
        { id: 'c1', section: 'tonight', title: 'Your first night in Berlin', memory: 'c-m1', body: ALEX_LONG },
        { id: 'cw', section: 'scheduled', title: 'Week 1', memory: 'c-m2', body: 'Week one. I walked past Room 4 on Tuesday and nearly went in out of habit. The guy at the door asked where my loud friend was. I said Berlin. He said "shame, she was terrible". I think it was a compliment.\n\nAnyway, the N26 is still running, the chips are still bad, and I still check my phone at 1 a.m. for your voice notes. Send one.' },
        { id: 'c2', section: 'anytime', title: 'When it rains there', memory: 'c-m3', body: 'Remember standing in the mud for that last song?' },
        { id: 'c3', section: 'anytime', title: 'When you need a song', memory: 'c-m2', body: 'You always said one more. Say it to someone new.' },
      ],
    },
  },
]
