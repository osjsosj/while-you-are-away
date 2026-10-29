import { useEffect, useRef, useState } from 'react'

/** Voice recording with MediaRecorder. `onDone(blob)` is called when recording stops. */
export function useRecorder(onDone) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const rec = useRef(null)
  const timer = useRef(null)
  const done = useRef(onDone)

  useEffect(() => {
    done.current = onDone
  }, [onDone])

  useEffect(() => () => {
    clearInterval(timer.current)
    if (rec.current && rec.current.state !== 'inactive') rec.current.stop()
  }, [])

  const start = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const type = ['audio/webm', 'audio/mp4', 'audio/ogg'].find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || ''
      const r = new MediaRecorder(stream, type ? { mimeType: type } : undefined)
      const chunks = []
      r.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks, { type: r.mimeType || 'audio/webm' })
        if (blob.size) done.current?.(blob)
      }
      r.start(250)
      rec.current = r
      setSeconds(0)
      setRecording(true)
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      setError('Microphone access was blocked. Allow it in your browser settings and try again.')
    }
  }

  const stop = () => {
    clearInterval(timer.current)
    setRecording(false)
    if (rec.current && rec.current.state !== 'inactive') rec.current.stop()
  }

  return { recording, seconds, error, start, stop }
}

export const fmtSeconds = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
