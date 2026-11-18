// Who may call the AI, and how much. Planning, writing and reading a chat are free once signed in;
// paying (at handover) raises the limits. Every call is counted per account and per network address,
// so a script can't run up the bill with fresh accounts or no account at all.
import { createHash } from 'node:crypto'
import { db, isPaid } from './server.js'

export const LIMITS = {
  // per account before paying, per paid letter box after
  free: { interview: 120, theme: 6, companion: 40, chat: 1, sticker: 8 },
  paid: { interview: 400, theme: 20, companion: 300, chat: 3, sticker: 30 },
}
export const PER_ADDRESS_PER_DAY = 300 // AI calls from one network address in a day, across accounts
export const NEW_ACCOUNTS_PER_ADDRESS = 4 // free accounts that may use the AI from one address in a day

/** The signed-in user from `Authorization: Bearer <supabase token>`, or null. */
export async function userOf(req) {
  const jwt = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!jwt) return null
  try {
    const { data } = await db().auth.getUser(jwt)
    return data?.user || null
  } catch {
    return null
  }
}

/** The network address, hashed: counters never hold the address itself. */
function addressOf(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  const raw = (fwd || req.socket?.remoteAddress || 'unknown').slice(0, 64)
  return createHash('sha256').update(`${raw}|${process.env.ADDRESS_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`).digest('hex').slice(0, 24)
}

/** Add one to a counter; false if it was already at `cap`. Fails open (with a warning) if the table is missing. */
export async function spend(key, cap) {
  try {
    const { data, error } = await db().from('ai_usage').select('messages').eq('session_id', key).maybeSingle()
    if (error) throw error
    const used = data?.messages || 0
    if (used >= cap) return false
    await db().from('ai_usage').upsert({ session_id: key, messages: used + 1, updated_at: new Date().toISOString() }, { onConflict: 'session_id' })
    return true
  } catch (err) {
    console.warn('ai_usage unavailable:', err?.message || err)
    return true
  }
}

/** Remember that this account used the AI from this address today; false once too many free accounts have. */
async function accountAllowedHere(address, userId, day) {
  const key = `addr:${address}:${day}:accounts`
  try {
    const { data } = await db().from('ai_usage').select('messages, note').eq('session_id', key).maybeSingle()
    const seen = String(data?.note || '').split(',').filter(Boolean)
    if (seen.includes(userId)) return true
    if (seen.length >= NEW_ACCOUNTS_PER_ADDRESS) return false
    await db().from('ai_usage').upsert({ session_id: key, messages: seen.length + 1, note: [...seen, userId].join(','), updated_at: new Date().toISOString() }, { onConflict: 'session_id' })
    return true
  } catch (err) {
    console.warn('ai_usage (accounts) unavailable:', err?.message || err)
    return true
  }
}

/**
 * May this request make one AI call of `kind`? Returns { ok: true, paid, user } or { ok: false, status, error }.
 *  401 sign_in_required: not signed in and not paid
 *  402 payment_required: the free allowance for this kind is used up (paying at handover raises it)
 *  429 cap_reached / busy: the paid limit, or too many calls from one address
 */
export async function allowAI(req, kind, sessionId) {
  const [paid, user] = await Promise.all([isPaid(sessionId), userOf(req)])
  if (!paid && !user) return { ok: false, status: 401, error: 'sign_in_required' }
  const day = new Date().toISOString().slice(0, 10)
  const address = addressOf(req)
  if (!paid && !(await accountAllowedHere(address, user.id, day))) return { ok: false, status: 429, error: 'busy' }
  if (!(await spend(`addr:${address}:${day}`, PER_ADDRESS_PER_DAY))) return { ok: false, status: 429, error: 'busy' }
  const tier = paid ? 'paid' : 'free'
  const owner = paid ? sessionId : `user:${user.id}`
  if (!(await spend(`${owner}:${kind}`, LIMITS[tier][kind] ?? 0))) {
    return paid ? { ok: false, status: 429, error: 'cap_reached' } : { ok: false, status: 402, error: 'payment_required' }
  }
  return { ok: true, paid, user }
}
