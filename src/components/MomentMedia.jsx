import { useRef, useState } from 'react'
import { uploadMedia, NeedSignInError, useMediaUrl } from '../utils/media'
import { useRecorder, fmtSeconds } from '../utils/useRecorder'
import SignInModal from './SignInModal'

/* Attach a photo, a short video and/or a voice note to a moment. `value` = { photo, video, voice } media refs. */

const Icon = ({ d }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
)
const PhotoIcon = () => <Icon d={<><rect x="2.5" y="4.5" width="15" height="11" rx="2" /><circle cx="7.5" cy="9" r="1.5" /><path d="M17.5 13l-4-4-6 6.5" /></>} />
const VideoIcon = () => <Icon d={<><rect x="2.5" y="5" width="11" height="10" rx="2" /><path d="M13.5 9l4-2.5v7l-4-2.5" /></>} />
const MicIcon = () => <Icon d={<><rect x="7.5" y="2.5" width="5" height="9" rx="2.5" /><path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5" /></>} />

export default function MomentMedia({ value, onChange }) {
  const photoIn = useRef(null)
  const videoIn = useRef(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(null)

  const store = async (field, blob) => {
    setBusy(field)
    setError('')
    try {
      const ref = await uploadMedia(blob)
      onChange({ ...value, [field]: ref })
    } catch (err) {
      if (err instanceof NeedSignInError) setPending({ field, blob })
      else setError(err.message || 'Upload failed. Try again.')
    } finally {
      setBusy('')
    }
  }

  const rec = useRecorder((blob) => store('voice', blob))
  const pick = (field) => (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (f) store(field, f)
  }

  return (
    <div className="wm">
      <div className="wm-row">
        <button type="button" className="wm-btn" onClick={() => photoIn.current?.click()} disabled={!!busy}>
          <PhotoIcon /> {value.photo ? 'Change photo' : 'Add a photo'}
        </button>
        <button type="button" className="wm-btn" onClick={() => videoIn.current?.click()} disabled={!!busy}>
          <VideoIcon /> {value.video ? 'Change video' : 'Add a video'}
        </button>
        <button
          type="button"
          className={`wm-btn${rec.recording ? ' wm-btn--rec' : ''}`}
          onClick={rec.recording ? rec.stop : rec.start}
          disabled={!!busy && !rec.recording}
          aria-pressed={rec.recording}
        >
          <MicIcon /> {rec.recording ? `Stop · ${fmtSeconds(rec.seconds)}` : value.voice ? 'Re-record voice' : 'Record your voice'}
        </button>
        <input ref={photoIn} type="file" accept="image/*" hidden onChange={pick('photo')} />
        <input ref={videoIn} type="file" accept="video/*" hidden onChange={pick('video')} />
      </div>

      {busy && <p className="wm-status" role="status">{busy === 'photo' ? 'Saving photo…' : busy === 'video' ? 'Saving video… larger clips take a moment.' : 'Saving voice note…'}</p>}
      {(error || rec.error) && <p className="wm-error" role="alert">{error || rec.error}</p>}

      {(value.photo || value.video || value.voice) && (
        <div className="wm-previews">
          {value.photo && <Preview kind="photo" refValue={value.photo} onRemove={() => onChange({ ...value, photo: null })} />}
          {value.video && <Preview kind="video" refValue={value.video} onRemove={() => onChange({ ...value, video: null })} />}
          {value.voice && <Preview kind="voice" refValue={value.voice} onRemove={() => onChange({ ...value, voice: null })} />}
        </div>
      )}

      {pending && (
        <SignInModal
          onClose={() => setPending(null)}
          onDone={() => { const p = pending; setPending(null); store(p.field, p.blob) }}
        />
      )}
    </div>
  )
}

function Preview({ kind, refValue, onRemove }) {
  const url = useMediaUrl(refValue)
  return (
    <div className={`wm-preview wm-preview--${kind}`}>
      {!url ? <div className="wm-loading" aria-label="Loading" />
        : kind === 'photo' ? <img src={url} alt="Attached photo" />
        : kind === 'video' ? <video src={url} controls playsInline preload="metadata" />
        : <audio src={url} controls preload="metadata" />}
      {onRemove && <button type="button" className="wm-remove" onClick={onRemove}>Remove</button>}
    </div>
  )
}

export function MomentMediaView({ entry }) {
  if (!entry.photo && !entry.video && !entry.voice) return null
  return (
    <div className="wm-previews wm-previews--view">
      {entry.photo && <Preview kind="photo" refValue={entry.photo} />}
      {entry.video && <Preview kind="video" refValue={entry.video} />}
      {entry.voice && <Preview kind="voice" refValue={entry.voice} />}
    </div>
  )
}
