// Shared helpers for the serverless functions. Files under api/_lib are not deployed as endpoints.
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function isPaid(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) return false
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return session.payment_status === 'paid'
  } catch {
    return false
  }
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
