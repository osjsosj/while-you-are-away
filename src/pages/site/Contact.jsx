import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteLayout from './SiteLayout'
import { CONTACT, STEPS } from './content'

const TOPICS = ['A question before I start', 'Help with my letter box', 'A refund', 'Something else']

export default function Contact() {
  const [topic, setTopic] = useState(TOPICS[0])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Contact — While You’re Away'
  }, [])

  // No form backend: the message opens in the visitor's own mail app, already written
  const send = (e) => {
    e.preventDefault()
    if (!message.trim()) return setError('Write a few words first, so we know how to help.')
    setError('')
    const body = `${message.trim()}\n\n${name.trim() ? `— ${name.trim()}` : ''}`
    window.location.href = `mailto:${CONTACT}?subject=${encodeURIComponent(topic)}&body=${encodeURIComponent(body)}`
  }

  return (
    <SiteLayout>
      <section className="ct" aria-labelledby="ct-title">
        <div className="ct-copy">
          <h1 id="ct-title" className="ph-title">Write to us.</h1>
          <p className="ph-lede">A real person reads every message, usually the founder. Ask anything, even if it’s just how to begin.</p>
          <a className="ct-mail" href={`mailto:${CONTACT}`}>{CONTACT}</a>
          <p className="ws-small">California, United States</p>
          <figure className="ct-sky">
            <img src="/site/sunset-stars.jpg" alt="The first stars over a quiet sea just after sunset" width="1400" height="1977" loading="lazy" />
          </figure>
        </div>

        <form className="ct-form" onSubmit={send} noValidate data-rise>
          <fieldset className="ct-field">
            <legend>What’s it about?</legend>
            <div className="ct-topics">
              {TOPICS.map((t) => (
                <button key={t} type="button" className="pill" aria-pressed={topic === t} onClick={() => setTopic(t)}>{t}</button>
              ))}
            </div>
          </fieldset>
          <label className="ct-field">
            <span>Your name <em>(optional)</em></span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label className="ct-field">
            <span>Message</span>
            <textarea rows="6" value={message} onChange={(e) => setMessage(e.target.value)} aria-invalid={!!error} aria-describedby={error ? 'ct-err' : undefined} />
          </label>
          {error && <p id="ct-err" className="ct-err" role="alert">{error}</p>}
          <button type="submit" className="ws-btn ws-btn--ink">Open in my mail app</button>
          <p className="ct-note">This opens your email app with the message ready to send.</p>
        </form>
      </section>

      <section className="ct-see" aria-labelledby="ct-see">
        <h2 id="ct-see" className="ws-h2" data-rise>Not sure yet? See it first.</h2>
        <ul className="ct-shots">
          {STEPS.map((s) => (
            <li key={s.title} data-rise>
              <img src={s.img} alt={s.alt} width="600" height="1298" loading="lazy" className={s.crop ? 'shot-crop' : undefined} />
              <p>{s.title}</p>
            </li>
          ))}
        </ul>
        <p className="ct-more" data-rise><Link to="/services" className="ws-link">How the whole letter box works</Link></p>
      </section>
    </SiteLayout>
  )
}
