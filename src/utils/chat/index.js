/**
 * Chat import, browser side: read a file, parse it in a worker, nothing leaves the device.
 * The pure pieces live in parse.js, stats.js and sample.js.
 */
import { parseChat } from './parse.js'

export { parseChat, suggestRoles, withRoles, SOURCES } from './parse.js'
export { chatStats } from './stats.js'
export { pickExcerpts } from './sample.js'

export const MAX_FILE_BYTES = 30 * 1024 * 1024

/**
 * Text of an exported file. Exports are UTF-8; an older Windows export can be EUC-KR,
 * so if UTF-8 gives many broken characters the file is read again as EUC-KR.
 */
export async function readChatFile(file) {
  if (file.size > MAX_FILE_BYTES) throw new Error('too_large')
  if (/\.zip$/i.test(file.name)) throw new Error('zip_unsupported')
  const buf = await file.arrayBuffer()
  const utf8 = new TextDecoder('utf-8').decode(buf)
  const broken = (utf8.match(/�/g) || []).length
  if (broken > 20 && broken > utf8.length / 500) {
    try {
      return new TextDecoder('euc-kr').decode(buf)
    } catch { /* decoder not available: keep UTF-8 */ }
  }
  return utf8
}

/** parseChat in a Web Worker; falls back to this thread if workers aren't available. */
export function parseChatAsync(text, hint = 'auto') {
  if (typeof Worker === 'undefined') return Promise.resolve(parseChat(text, hint))
  return new Promise((resolve, reject) => {
    let worker
    try {
      worker = new Worker(new URL('./chat.worker.js', import.meta.url), { type: 'module' })
    } catch {
      resolve(parseChat(text, hint))
      return
    }
    worker.onmessage = (e) => {
      worker.terminate()
      if (e.data.ok) resolve(e.data.result)
      else reject(new Error(e.data.error))
    }
    worker.onerror = () => {
      worker.terminate()
      try { resolve(parseChat(text, hint)) } catch (err) { reject(err) }
    }
    worker.postMessage({ text, hint })
  })
}
