import { createClient } from '@supabase/supabase-js'

// Own client on purpose: _lib/server.js builds a Stripe client at import time, and tracking must not depend on it.
let admin = null
function db() {
  if (!admin) {
    const url = (process.env.SUPABASE_URL || '').replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '')
    admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  }
  return admin
}

// First-party funnel events. Accepts only a fixed list of event names and a few short props.
// It never stores names, emails, free text, IP addresses or box tokens.

const NAMES = new Set([
  'page_view', 'cta_start', 'interview_step', 'interview_done', 'checkout_start', 'ai_start', 'plan_ready',
  'box_dressed', 'diary_entry', 'link_made', 'link_copied', 'link_shared', 'box_opened', 'reply_sent',
  // sign-in and chat import steps, and remaking a link: sent by the app, dropped until 2026-11-25
  'sign_in_start', 'sign_in_done', 'chat_parsed', 'chat_story_found', 'chat_offer_taken', 'link_remade',
  // a recipient starting a box of their own for the sender
  'make_back',
  // how far a sender gets into writing (step: 1, 3 or 5 letters)
  'letters_written',
  // the letter for tonight, written in the first steps before signing in
  'first_letter',
])
const PROP_KEYS = new Set(['where', 'step', 'kind'])
const clip = (v, n = 60) => (typeof v === 'string' ? v.replace(/[^\w\-./:+ ]/g, '').slice(0, n) : null)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {})
    if (raw.length > 2000) return res.status(413).end()
    const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    if (!NAMES.has(b.name)) return res.status(400).end()

    const props = {}
    for (const [k, v] of Object.entries(b.props || {})) {
      if (!PROP_KEYS.has(k)) continue
      const val = typeof v === 'number' ? v : clip(v)
      if (val !== null && val !== '') props[k] = val
    }
    const path = clip(b.path, 80)
    const row = {
      name: b.name,
      anon_id: typeof b.anon_id === 'string' && /^[a-f0-9-]{16,40}$/.test(b.anon_id) ? b.anon_id : null,
      // Box links are private: never keep a token, even by accident.
      path: path && path.startsWith('/b/') ? '/b/:token' : path,
      src: clip(b.src, 60),
      medium: clip(b.medium, 40),
      campaign: clip(b.campaign, 60),
      props,
    }
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { error } = await db().from('events').insert(row)
      if (error) console.warn('track insert', error.message)
    }
  } catch (err) {
    console.warn('track', err?.message)
  }
  res.status(204).end()
}
