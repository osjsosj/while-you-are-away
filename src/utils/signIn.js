/** Which sign-in buttons to show, and in what order, for where the sender seems to be. */

export const PROVIDER = {
  kakao: { id: 'kakao', label: 'Continue with Kakao', name: 'Kakao' },
  google: { id: 'google', label: 'Continue with Google', name: 'Google' },
  apple: { id: 'apple', label: 'Continue with Apple', name: 'Apple' },
}

/** In Korea: Kakao, Google, Apple. Everywhere else: Google and Apple (Apple first on iPhone, iPad and Mac). */
export function providersFor(lang = '', timeZone = '', ua = '') {
  const korea = /^ko(-|$)/i.test(lang) || timeZone === 'Asia/Seoul'
  if (korea) return [PROVIDER.kakao, PROVIDER.google, PROVIDER.apple]
  return /iPhone|iPad|Macintosh/.test(ua) ? [PROVIDER.apple, PROVIDER.google] : [PROVIDER.google, PROVIDER.apple]
}

/** The buttons for this browser. */
export function hereProviders() {
  let tz = ''
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '' } catch { /* old browser */ }
  const lang = (typeof navigator !== 'undefined' && ((navigator.languages && navigator.languages[0]) || navigator.language)) || ''
  return providersFor(lang, tz, (typeof navigator !== 'undefined' && navigator.userAgent) || '')
}
