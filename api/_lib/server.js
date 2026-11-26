// Shared helpers for the serverless functions. Files under api/_lib are not deployed as endpoints.
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// made on first use, so a missing or broken Stripe key can never take down the functions that don't pay
let stripeClient = null
function stripe() {
  if (!stripeClient) stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
  return stripeClient
}

const tierCache = new Map() // per warm instance: skip re-asking Stripe about a session we already saw paid

/**
 * What a checkout session paid for: 'keepsake' (the letter box with the keepsake book, or the keepsake added later),
 * 'box' (the letter box), or null (not paid, not ours, or Stripe unreachable).
 */
export async function paidTier(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) return null
  if (tierCache.has(sessionId)) return tierCache.get(sessionId)
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId)
    // 'no_payment_required' = a 100%-off promotion code (friends, testers) on a completed checkout
    const paid = session.payment_status === 'paid' || (session.status === 'complete' && session.payment_status === 'no_payment_required')
    if (!paid) return null
    const t = session.metadata?.tier
    const tier = t === 'keepsake' || t === 'upgrade' ? 'keepsake' : 'box'
    tierCache.set(sessionId, tier)
    return tier
  } catch {
    return null
  }
}

/** A letter box was paid for (either tier). */
export async function isPaid(sessionId) {
  return !!(await paidTier(sessionId))
}

/** Does this sender have the keepsake book: bought with the box, or added later with its own checkout. */
export async function hasKeepsake(draft = {}, boxSessionId = null) {
  const main = boxSessionId || draft.paymentSessionId
  if ((await paidTier(main)) === 'keepsake') return true
  return !!draft.keepsakeSessionId && (await paidTier(draft.keepsakeSessionId)) === 'keepsake'
}

let admin = null
export function db() {
  if (!admin) {
    const url = (process.env.SUPABASE_URL || '').replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '')
    admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  }
  return admin
}

export const siteUrl = () => (process.env.SITE_URL || 'https://getwhileyouareaway.com').replace(/\/$/, '')

export const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export const isEmail = (s) => typeof s === 'string' && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
export const isISODate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)

/** The calendar date it is in the US evening when the daily job runs (01:00 UTC). */
export function usEveningDate(now = new Date()) {
  return new Date(now.getTime() - 6 * 3600 * 1000).toISOString().slice(0, 10)
}
