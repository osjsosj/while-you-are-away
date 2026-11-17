import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FlowFrame from '../components/FlowFrame'
import Mascot from '../components/Mascot'
import { getDraft, saveDraft } from '../utils/storage'
import { chatStats, parseChatAsync, pickExcerpts, readChatFile, suggestRoles, withRoles } from '../utils/chat'
import { clearLocalChat, loadLocalChat, saveLocalChat } from '../utils/chat/local'
import { draftWithStory, groupCount, normalizeStory, shortDate, statFacts, storyFindings } from '../utils/story'
import { AIUnavailableError, PaymentRequiredError, findStory } from '../utils/aiService'
import { track } from '../utils/track'
import '../styles/chats.css'

/*
 * "Bring your chats": the sender drops in an exported chat. It is read and counted on this device;
 * the numbers are free to see. After checkout, a selection of the messages is read by the AI to find
 * moments, sayings and earlier goodbyes to write from. Nothing here writes a letter.
 */

const SOURCES = [
  {
    id: 'kakao',
    name: 'KakaoTalk',
    steps: ['Open the chat with them.', 'Tap ≡ at the top right, then the ⚙ (설정).', 'Choose “Export chat” (대화 내용 내보내기), then “Text only” (텍스트만 보내기).', 'Save it to Files, then pick it here.'],
    pc: 'On a computer: in the chat window press Ctrl+S (⌘S on a Mac) and pick the saved .txt.',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    steps: ['Open the chat with them.', 'Tap their name (iPhone) or ⋮ → More (Android).', 'Choose “Export chat”, then “Without media”.', 'Save it to Files, then pick it here.'],
    pc: 'On an iPhone you may get a .zip: open it and pick the _chat.txt inside.',
  },
  {
    id: 'imessage',
    name: 'iMessage',
    steps: ['iPhone can’t export messages by itself.', 'On a Mac, a free tool like “imessage-exporter” saves a chat as .txt.', 'Or select some messages, copy them, and use Paste instead.'],
  },
  {
    id: 'paste',
    name: 'Paste',
    steps: ['Copy some messages from any app.', 'Paste them below, one message per line, like “Name: message”.'],
  },
]

const ERRORS = {
  too_large: 'That file is over 30 MB. Export “text only”, without photos, and try again.',
  zip_unsupported: 'That’s a .zip. Open it on your phone or computer and pick the .txt inside.',
  empty: 'We couldn’t find messages in that. Check it’s the exported chat (a .txt or .csv), or try Paste.',
  read: 'We couldn’t read that file. Try exporting it again.',
}

const ROLE_LABEL = (toName) => [['me', 'Me'], ['them', toName || 'Them'], ['other', 'Someone else']]

export default function ChatImport() {
  const navigate = useNavigate()
  const draft = getDraft()
  const p1 = draft.phase1 || {}
  const paid = !!draft.paymentSessionId
  const names = useMemo(() => ({ me: p1.fromName || 'Me', them: p1.toName || 'Them' }), [p1.fromName, p1.toName])

  const saved = useMemo(() => loadLocalChat(), [])
  const [step, setStep] = useState(saved ? 'preview' : 'pick') // pick → reading → who → preview → finding → done
  const [source, setSource] = useState('kakao')
  const [paste, setPaste] = useState('')
  const [error, setError] = useState('')
  const [parsed, setParsed] = useState(null)
  const [roles, setRoles] = useState({})
  const [chat, setChat] = useState(saved) // { excerpts, stats, names, source, messages }
  const [found, setFound] = useState(null)
  const fileRef = useRef(null)
  const headRef = useRef(null)

  useEffect(() => { headRef.current?.focus() }, [step])

  const readText = async (text) => {
    setError('')
    setStep('reading')
    try {
      const result = await parseChatAsync(text, 'auto') // the format is detected from the text itself
      if (result.messages.length < 2) throw new Error('empty')
      setParsed(result)
      setRoles(suggestRoles(result.authors, { fromName: p1.fromName, toName: p1.toName }))
      setStep('who')
      track('chat_parsed', { source: result.source })
    } catch (err) {
      setError(ERRORS[err.message] || ERRORS.empty)
      setStep('pick')
    }
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      await readText(await readChatFile(file))
    } catch (err) {
      setError(ERRORS[err.message] || ERRORS.read)
      setStep('pick')
    }
  }

  const confirmWho = () => {
    const msgs = withRoles(parsed.messages, roles)
    const stats = chatStats(msgs)
    const keyDates = [p1.startDate].filter(Boolean)
    const { text } = pickExcerpts(msgs, { names, keyDates })
    const next = { excerpts: text, stats, names, source: parsed.source, messages: parsed.messages.length }
    setChat(next)
    saveLocalChat(next)
    setParsed(null) // the full chat isn't kept in memory longer than needed
    setStep('preview')
  }

  const find = async () => {
    setError('')
    setStep('finding')
    try {
      const raw = await findStory({ excerpts: chat.excerpts, stats: chat.stats, names: chat.names })
      const story = { ...raw, stats: chat.stats }
      if (!normalizeStory(story)) throw new AIUnavailableError(502)
      const d = getDraft()
      // letters are made from the story once the box has a plan; before that it waits for the editor
      saveDraft(d.plan ? draftWithStory(d, story) : { story, storyPending: true })
      clearLocalChat()
      setFound(story)
      setStep('done')
      track('chat_story_found')
    } catch (err) {
      if (err instanceof PaymentRequiredError) {
        setStep('preview')
        return setError('Reading the moments comes with the letter box. Your numbers are saved on this device until you check out.')
      }
      setError(err instanceof AIUnavailableError && err.status === 429
        ? 'This letter box has used its three chat readings. Your earlier findings are still in the editor.'
        : 'We couldn’t finish reading just now. Nothing was lost; try again in a moment.')
      setStep('preview')
    }
  }

  const startOver = () => {
    clearLocalChat()
    setChat(null)
    setError('')
    setStep('pick')
  }

  const guide = SOURCES.find((s) => s.id === source)
  const facts = chat ? statFacts(chat.stats) : []
  const groups = found ? storyFindings(normalizeStory(found)) : []
  const authors = parsed ? parsed.authors.slice(0, 8) : []
  const hasBoth = Object.values(roles).includes('me') && Object.values(roles).includes('them')

  return (
    <FlowFrame narrow>
      <div className="ci">
        {step === 'pick' && (
          <>
            <h1 className="wf-h1" tabIndex={-1} ref={headRef}>Bring in your chats</h1>
            <p className="wf-lede">Years of messages hold things you’ve forgotten: the first “did you get home okay”, the calls on hard days. We find them so you can write about them.</p>

            <div className="ci-perigan">
              <Mascot move="talk" size={64} />
              <p className="ci-bubble">Your chat is read on this phone first. You’ll see the numbers before anything is sent anywhere.</p>
            </div>

            <div className="wf-pills ci-sources" role="radiogroup" aria-label="Where your chat is">
              {SOURCES.map((s) => (
                <button key={s.id} type="button" role="radio" aria-checked={source === s.id} className="wf-pill" onClick={() => { setSource(s.id); setError('') }}>{s.name}</button>
              ))}
            </div>

            <div className="wf-card ci-guide">
              <ol className="ci-steps">{guide.steps.map((t) => <li key={t}>{t}</li>)}</ol>
              {guide.pc && <p className="wf-note">{guide.pc}</p>}
            </div>

            {source === 'paste' ? (
              <>
                <label className="wf-label" htmlFor="ci-paste">Your messages</label>
                <textarea id="ci-paste" className="wf-input ci-paste" rows={8} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={`${names.them}: did you get home okay?\n${names.me}: just now, going to sleep`} />
                <button type="button" className="wf-btn wf-btn--block" disabled={paste.trim().length < 10} onClick={() => readText(paste)}>Read these messages</button>
              </>
            ) : (
              <>
                <input ref={fileRef} type="file" accept=".txt,.csv,text/plain,text/csv" className="wf-sr" onChange={onFile} tabIndex={-1} aria-hidden="true" />
                <button type="button" className="wf-btn wf-btn--block" onClick={() => fileRef.current?.click()}>Choose the exported file</button>
              </>
            )}
            {error && <p className="wf-error" role="alert">{error}</p>}
            <p className="wf-fine ci-fine">Only you and {names.them} should be in this chat, or a family group you’re both in. Read how we handle it in our <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</p>
          </>
        )}

        {(step === 'reading' || step === 'finding') && (
          <div className="ci-wait" role="status">
            <Mascot move={step === 'finding' ? 'notice' : 'idle'} size={110} loop />
            <h1 className="wf-h1" tabIndex={-1} ref={headRef}>{step === 'reading' ? 'Reading your chat…' : 'Finding your moments…'}</h1>
            <p className="wf-note">{step === 'reading' ? 'This happens on your phone. Long chats take a few seconds.' : 'This takes about a minute. You can keep this page open and wait.'}</p>
            <div className="wf-spinner" aria-hidden="true" />
          </div>
        )}

        {step === 'who' && parsed && (
          <>
            <h1 className="wf-h1" tabIndex={-1} ref={headRef}>Who is who?</h1>
            <p className="wf-lede">We found {parsed.messages.length.toLocaleString('en-US')} messages{parsed.from ? `, from ${shortDate(parsed.from)} to ${shortDate(parsed.to)}` : ''}. Tell us which name is you and which is {names.them}.</p>
            <ul className="ci-who">
              {authors.map((a) => (
                <li key={a.name} className="wf-card ci-person">
                  <p className="ci-person-name">{a.name} <span className="wf-note">· {a.count.toLocaleString('en-US')}</span></p>
                  <div className="ci-roles" role="radiogroup" aria-label={`Who is ${a.name}`}>
                    {ROLE_LABEL(names.them).map(([r, label]) => (
                      <button key={r} type="button" role="radio" aria-checked={roles[a.name] === r} className="wf-pill" onClick={() => setRoles({ ...roles, [a.name]: r })}>{label}</button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            {!hasBoth && <p className="wf-note">Pick one name as you and one as {names.them}.</p>}
            <button type="button" className="wf-btn wf-btn--block" disabled={!hasBoth} onClick={confirmWho}>That’s right</button>
            <button type="button" className="wf-link ci-back" onClick={() => { setParsed(null); setStep('pick') }}>Use a different chat</button>
          </>
        )}

        {step === 'preview' && chat && (
          <>
            <h1 className="wf-h1" tabIndex={-1} ref={headRef}>What your chat already says</h1>
            <p className="wf-lede">{chat.stats.total.toLocaleString('en-US')} messages{chat.stats.spanDays ? ` over ${chat.stats.spanDays.toLocaleString('en-US')} days` : ''}. Counted on this device; nothing has been sent yet.</p>
            <ul className="ci-facts">
              {facts.map((f) => (
                <li key={f.id} className="ci-fact">
                  <span className="ci-fact-big">{f.text}</span>
                  <span className="ci-fact-sub">{f.sub}</span>
                </li>
              ))}
            </ul>

            <div className="wf-paper ci-next">
              <p className="ci-next-h">Next: the moments behind the numbers</p>
              <p className="ci-next-p">We read a selection of your messages (about {Math.round(chat.excerpts.length / 1000)}k characters, not the whole chat) to find shared moments, things you always say, and the goodbyes before this one. You pick what goes on a letter; nothing goes in the box by itself.</p>
              {paid ? (
                <button type="button" className="wf-btn wf-btn--ink wf-btn--block" onClick={find}>Find our moments</button>
              ) : (
                <button type="button" className="wf-btn wf-btn--ink wf-btn--block" onClick={() => navigate('/paywall')}>Continue to checkout</button>
              )}
              {!paid && <p className="wf-note">Comes with the letter box. Your numbers stay saved on this device; come back here after checkout.</p>}
            </div>
            {error && <p className="wf-error" role="alert">{error}</p>}
            <button type="button" className="wf-link ci-back" onClick={startOver}>Remove this chat and start over</button>
          </>
        )}

        {step === 'done' && found && (
          <>
            <div className="ci-perigan">
              <Mascot move="cheer" size={64} />
              <p className="ci-bubble">{getDraft().plan ? 'Found them. I made a letter for each moment; write only the ones that feel right.' : 'Found them. When your box is planned, each moment gets a letter of its own; write only the ones that feel right.'}</p>
            </div>
            <h1 className="wf-h1" tabIndex={-1} ref={headRef}>Here’s what we found</h1>
            {found.about && <p className="wf-lede">{found.about}</p>}
            <ul className="ci-found">
              {groups.map((g) => <li key={g.id} className="wf-card"><span className="ci-found-n">{g.items.length}</span> {groupCount(g).replace(/^\d+ /, '')}</li>)}
            </ul>
            <p className="wf-note ci-note">The chat itself has been removed from this device. Only what we found is kept with your letter box.</p>
            <button type="button" className="wf-btn wf-btn--block" onClick={() => navigate(getDraft().plan ? '/editor' : '/ai-interview')}>{getDraft().plan ? 'Open the editor' : 'Back to planning'}</button>
          </>
        )}
      </div>
    </FlowFrame>
  )
}
