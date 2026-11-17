/**
 * A made-up story in the shape the chat analysis will hand over (see utils/story.js), for trying
 * the editor's "From your chats" panel in local development. Not a real person's chat.
 */
export const SAMPLE_STORY = {
  memories: [
    { id: 'airport', title: '인천공항 배웅', place: '인천공항', date: '2023-06-04', sticker: 'airplane', prompt: '게이트 앞에서 하고 싶었던 말이 있었나요?' },
    { id: 'stew', title: '엄마 김치찌개', place: '우리 집', sticker: 'pot-of-food', prompt: '그 맛이 생각나는 건 어떤 날이에요?' },
    { id: 'sunday', title: '일요일 아침 페이스톡', sticker: 'hot-beverage', prompt: '화면 너머로 보이던 엄마의 아침은 어땠나요?' },
    { id: 'birthday', title: '영상통화로 불었던 생일 초', date: '2024-03-02', sticker: 'birthday-cake', prompt: '그날 엄마 표정이 기억나요?' },
  ],
  catchphrases: [
    { id: 'meal', who: '엄마', text: '밥은 먹었니' },
    { id: 'arrived', who: '엄마', text: '도착하면 전화해' },
  ],
  partings: [
    { id: 'p1', date: '2023-06-04', place: '인천공항', what: '토론토로 처음 떠난 날', back: '2024-12-18' },
    { id: 'p2', date: '2025-01-08', place: '인천공항', what: '방학 끝나고 다시 떠난 날', back: '2025-08-02' },
  ],
  stats: {
    total: 1158, calls: 277, callMinutes: 1364, from: '2023-06-04', to: '2026-11-14', spanDays: 1260, daysTalked: 224,
    first: { at: '2023-06-04T23:50', role: 'them', text: '잘 도착했니' },
    busiest: { date: '2024-04-09', count: 120 },
    lateNight: { at: '2023-06-14T03:42', role: 'me', text: '아직 안 자' },
    phrases: { goodnight: 14, missYou: 5, loveYou: 3, thanks: 9, sorry: 3, laugh: 70 },
    topEmoji: [], topWords: [], byMonth: [],
  },
}
