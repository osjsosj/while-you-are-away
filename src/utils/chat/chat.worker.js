/* Parses a chat export off the main thread, so a large file never freezes the page. */
import { parseChat } from './parse.js'

self.onmessage = (e) => {
  try {
    self.postMessage({ ok: true, result: parseChat(e.data.text, e.data.hint) })
  } catch (err) {
    self.postMessage({ ok: false, error: String(err?.message || err) })
  }
}
