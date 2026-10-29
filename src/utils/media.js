/**
 * media.js — photos, voice notes and video live in Supabase Storage (private bucket "media").
 * The draft stores a small reference string, "media:<user id>/<file>", never the file itself.
 * Old drafts may still hold data: URLs; everything here accepts both.
 */
import { useEffect, useState } from 'react'
import { supabase, getUser } from './supabase'

export const MEDIA_PREFIX = 'media:'
export const MAX_BYTES = 50 * 1024 * 1024

export class NeedSignInError extends Error {
  constructor() {
    super('need_sign_in')
    this.name = 'NeedSignInError'
  }
}

export const isMediaRef = (v) => typeof v === 'string' && v.startsWith(MEDIA_PREFIX)
export const isDataUrl = (v) => typeof v === 'string' && v.startsWith('data:')
export const pathOf = (ref) => (isMediaRef(ref) ? ref.slice(MEDIA_PREFIX.length) : null)

const EXT = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/heic': 'heic',
  'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/mpeg': 'mp3', 'audio/ogg': 'ogg', 'audio/wav': 'wav',
  'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm',
}

function extFor(type) {
  const base = (type || '').split(';')[0].trim().toLowerCase()
  return EXT[base] || base.split('/')[1] || 'bin'
}

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`

export async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl)
  return res.blob()
}

/** Shrink photos before upload (long edge 1600px, JPEG). GIFs and non-images pass through. */
export async function compressImageBlob(file, maxEdge = 1600, quality = 0.85) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality))
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file // e.g. HEIC on browsers that can't decode it: upload as-is
  }
}

/** Upload a File/Blob; returns a media ref for the draft. Throws NeedSignInError when signed out. */
export async function uploadMedia(fileOrBlob) {
  if (!supabase) throw new Error('Storage is not configured')
  const user = await getUser()
  if (!user) throw new NeedSignInError()
  const blob = fileOrBlob.type?.startsWith('image/') ? await compressImageBlob(fileOrBlob) : fileOrBlob
  if (blob.size > MAX_BYTES) throw new Error('That file is over 50 MB. Try a shorter clip or a smaller photo.')
  const month = new Date().toISOString().slice(0, 7)
  const path = `${user.id}/${month}/${uid()}.${extFor(blob.type)}`
  const { error } = await supabase.storage.from('media').upload(path, blob, {
    contentType: blob.type || 'application/octet-stream',
    upsert: false,
  })
  if (error) throw new Error(error.message || 'Upload failed')
  return MEDIA_PREFIX + path
}

// ── Signed URLs for the sender's own previews ───────────────────────────────
const urlCache = new Map() // path -> { url, until }

export async function signedUrl(ref) {
  if (!ref) return null
  if (!isMediaRef(ref)) return ref
  const path = pathOf(ref)
  const hit = urlCache.get(path)
  if (hit && hit.until > Date.now()) return hit.url
  if (!supabase) return null
  const { data, error } = await supabase.storage.from('media').createSignedUrl(path, 3600)
  if (error || !data?.signedUrl) return null
  urlCache.set(path, { url: data.signedUrl, until: Date.now() + 50 * 60 * 1000 })
  return data.signedUrl
}

/** React hook: a playable/viewable URL for a media ref or a legacy data: URL. */
export function useMediaUrl(ref) {
  const [state, setState] = useState({ ref: null, url: null })
  useEffect(() => {
    if (!isMediaRef(ref)) return undefined
    let live = true
    signedUrl(ref).then((url) => { if (live) setState({ ref, url }) })
    return () => { live = false }
  }, [ref])
  if (!ref) return null
  if (!isMediaRef(ref)) return ref
  return state.ref === ref ? state.url : null
}

/**
 * Move any data: URLs left in the draft (photos/voice saved before media moved to the server)
 * into Storage. Returns a patch for saveDraft, or null when nothing needed moving.
 */
export async function migrateDraftMedia(draft) {
  const caps = draft.capsuleData || {}
  let changed = false
  const next = {}
  for (const [id, data] of Object.entries(caps)) {
    const copy = { ...data }
    for (const field of ['photo', 'voice', 'video']) {
      if (isDataUrl(copy[field])) {
        copy[field] = await uploadMedia(await dataUrlToBlob(copy[field]))
        changed = true
      }
    }
    next[id] = copy
  }
  return changed ? { capsuleData: next } : null
}
