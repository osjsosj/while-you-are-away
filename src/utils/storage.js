/**
 * storage.js — Supabase + localStorage 하이브리드
 *
 * Supabase 연결된 경우: DB 우선 저장, localStorage는 캐시
 * Supabase 없는 경우: localStorage만 사용 (기존 동작 유지)
 */

import { supabase, getUser, loadDraftFromDB, saveDraftToDB } from './supabase'

const LOCAL_KEY = 'lbs_draft'

// ── localStorage 기본 ops ─────────────────────────────────────

function localGet() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}
  } catch {
    return {}
  }
}

function localSet(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
}

// ── Public API ───────────────────────────────────────────────

/** draft 읽기 — 항상 동기 (localStorage 캐시 기준) */
export const getDraft = () => localGet()

/**
 * draft 저장 — localStorage 즉시 + DB 비동기
 * 기존 코드 모두 이걸 호출하므로 시그니처 동일
 */
export const saveDraft = (patch) => {
  const current = localGet()
  const next = { ...current, ...patch }
  localSet(next)
  syncToDB(next)
}

/** draft 초기화 */
export const clearDraft = () => {
  localStorage.removeItem(LOCAL_KEY)
}

/**
 * 앱 시작 시 호출 — DB에서 최신 draft 가져와서 localStorage 갱신
 * 로그인 상태인 경우에만 동작
 */
export async function hydrateFromDB() {
  if (!supabase) return
  const user = await getUser()
  if (!user) return

  const remote = await loadDraftFromDB(user.id)
  if (!remote) return

  const local = localGet()
  const remoteTime = remote._savedAt || 0
  const localTime = local._savedAt || 0

  if (remoteTime >= localTime) {
    localSet(remote)
  }
}

// ── Internal ─────────────────────────────────────────────────

let syncTimer = null

async function syncToDB(data) {
  if (!supabase) return
  clearTimeout(syncTimer)
  syncTimer = setTimeout(async () => {
    const user = await getUser()
    if (!user) return
    const withTimestamp = { ...data, _savedAt: Date.now() }
    await saveDraftToDB(user.id, withTimestamp)
  }, 1500)
}
