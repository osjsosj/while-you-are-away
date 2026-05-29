const KEY = 'lbs_draft'

export const getDraft = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

export const saveDraft = (data) => {
  const current = getDraft()
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...data }))
}

export const clearDraft = () => localStorage.removeItem(KEY)
