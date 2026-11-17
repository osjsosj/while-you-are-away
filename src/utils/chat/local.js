/**
 * The chat the sender brought in, kept on this device only (never in the draft, which syncs to our database).
 * Holds the excerpts we would send for reading, the numbers counted here, and the names confirmed.
 * Cleared once the story has been found, or when the sender removes it.
 */
const KEY = 'wya-chat-v1'

export function loadLocalChat() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    return v && typeof v.excerpts === 'string' && v.stats ? v : null
  } catch {
    return null
  }
}

export function saveLocalChat(chat) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...chat, savedAt: new Date().toISOString() }))
    return true
  } catch {
    return false
  }
}

export function clearLocalChat() {
  try { localStorage.removeItem(KEY) } catch { /* storage blocked */ }
}
