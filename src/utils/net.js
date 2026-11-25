/**
 * net.js — fetch that gives up. A request that hangs (a dropped signal, a stuck function) rejects
 * after `ms` like any network failure, so no screen waits on a spinner forever. Callers already
 * treat a rejected fetch as "no connection".
 */
export async function timedFetch(url, options = {}, ms = 20000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { ...options, signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** The JSON body, or null when the reply isn't JSON (an error page, a cut-off response). */
export async function jsonOrNull(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}
