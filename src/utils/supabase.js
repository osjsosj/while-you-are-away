import { createClient } from '@supabase/supabase-js'

/** VITE_SUPABASE_URL may include /rest/v1 — strip for createClient */
function normalizeSupabaseUrl(raw) {
  if (!raw) return ''
  return raw.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '')
}

const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { detectSessionInUrl: true, persistSession: true },
      })
    : null

export async function getUser() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}

export async function loadDraftFromDB(userId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('drafts')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.warn('loadDraftFromDB', error.message)
    return null
  }
  if (!data?.data) return null

  const savedAt = data.updated_at
    ? new Date(data.updated_at).getTime()
    : 0

  return { ...data.data, _savedAt: savedAt }
}

export async function saveDraftToDB(userId, draft) {
  if (!supabase) return
  const { error } = await supabase.from('drafts').upsert(
    {
      user_id: userId,
      data: draft,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) console.warn('saveDraftToDB', error.message)
  return error || null
}

/** `Authorization` header with the signed-in user's token, or {} when signed out. */
export async function authHeader() {
  try {
    const token = supabase ? (await supabase.auth.getSession()).data?.session?.access_token : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

/**
 * Which sign-in providers are switched on in Supabase (e.g. { google: true, kakao: false }),
 * so the sign-in page shows only buttons that work. null if it can't be read.
 */
export async function enabledProviders() {
  if (!url || !anonKey) return null
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anonKey } })
    if (!res.ok) return null
    const { external } = await res.json()
    return external && typeof external === 'object' ? external : null
  } catch {
    return null
  }
}
