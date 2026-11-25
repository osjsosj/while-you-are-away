import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FlowFrame from '../components/FlowFrame'
import Mascot from '../components/Mascot'
import { getDraft, saveDraft } from '../utils/storage'
import { chatStats, parseChatAsync, pickExcerpts, readChatFile, suggestRoles, withRoles } from '../utils/chat'
import { clearLocalChat, loadLocalChat, saveLocalChat } from '../utils/chat/local'
import { draftWithStory, groupCount, mergeStories, momentFromLine, normalizeStory, shortDate, statFacts, storyFindings } from '../utils/story'
import { AIUnavailableError, PaymentRequiredError, SignInRequiredError, findStory } from '../utils/aiService'
import { getUser } from '../utils/supabase'
import { track } from '../utils/track'
import '../styles/chats.css'

/*
 * "Bring your chats": the sender drops in an exported chat. It is read and counted on this device;
 * the numbers are free to see. Once signed in, a selection of the messages is read by the AI to find
 * moments, sayings and earlier goodbyes to write from. Nothing here writes a letter.
 */

const SOURCES = [
  {
    id: 'imessage',
    name: 'iMessage',
    steps: ['iPhone can’t export messages by itself.', 'On a Mac, a free tool like “imessage-exporter” saves a chat as .txt.', 'Or select some messages, copy them, and use Paste instead.'],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    steps: ['Open the chat with them.', 'Tap their name (iPhone) or ⋮ → More (Android).', 'Choose “Export chat”, then “Without media”.', 'Save it to Files, then pick it here.'],
    pc: 'On an iPhone you may get a .zip: open it and pick the _chat.txt inside.',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    steps: ['In Instagram: your profile → ☰ → Accounts Center → Your information and permissions → Download your information.', 'Choose Messages, format JSON, and download.', 'Unzip it and open messages/inbox, then the folder with their name.', 'Pick message_1.json here.'],
  },
  {
    id: 'messenger',
    name: 'Messenger',
    steps: ['In Facebook: Settings → Accounts Center → Your information and permissions → Download your information.', 'Choose Messages, format JSON, and download.', 'Unzip it and open messages/inbox, then the folder with their name.', 'Pick message_1.json here.'],
  },
  {
    id: 'kakao',
    name: 'KakaoTalk',
    steps: ['Open the chat with them.', 'Tap ≡ at the top right, then the ⚙ (설정).', 'Choose “Export chat” (대화 내용 내보내기), then “Text only” (텍스트만 보내기).', 'Save it to Files, then pick it here.'],
    pc: 'On a computer: in the chat window press Ctrl+S (⌘S on a Mac) and pick the saved .txt.',
  },
  {
    id: 'line',
    name: 'LINE',
    steps: ['Open the chat with them.', 'Tap ≡ at the top right, then Settings.', 'Choose “Export chat history”.', 'Save the .txt to Files, then pick it here.'],
  },
  {
    id: 'paste',
    name: 'Paste',
    steps: ['Copy some messages from any app.', 'Paste them below, one message per line, like “Name: message”.'],
  },
]

const ERRORS = {
  too_large: 'That file is over 30 MB. Export “text only”, without photos, and try again.',
  zip_unsupported: 'That’s a .zip. Open it on your phone or computer and pick the .txt (or, from Instagram or Messenger, the message_1.json) inside.',
  too_few: 'We need at least 8 messages from the two of you to read. Check the names above, or bring in a longer chat.',
  empty: 'We couldn’t find messages in that. Check it’s the exported chat (a .txt or .csv), or try Paste.',
  read: 'We couldn’t read that file. Try exporting it again.',
}

/** A short, stable tag for a chat (from its first message), so a later import of it is recognised. */
function fingerprint(s) {
  let h = 2166136261
  for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) }
  return (h >>> 0).toString(36)
}

const ROLE_LABEL = (toName) => [['me', 'Me'], ['them', toName || 'Them'], ['other', 'Someone else']]

export default function ChatImport() {
  const navigate = useNavigate()
  const draft = getDraft()
  const p1 = draft.phase1 || {}
  const paid = !!draft.paymentSessionId
  const then = /^\/[a-z-]*$/.test(new URLSearchParams(window.location.search).get('then') || '') ? new URLSearchParams(window.location.search).get('then') : ''
  const [signedIn, setSignedIn] = useState(null)
  useEffect(() => { let live = true; getUser().then((u) => live && setSignedIn(!!u)); return () => { live = false } }, [])
  const names = useMemo(() => ({ me: p1.fromName || 'Me', them: p1.toName || 'Them' }), [p1.fromName, p1.toName])

  const saved = useMemo(() => loadLocalChat(), [])
  const [step, setStep] = useState(saved ? 'preview' : 'pick') // pick → reading → who → preview → finding → done
  const [source, setSource] = useState('imessage')
  const [paste, setPaste] = useState('')
  const [error, setError] = useState('')
  const [parsed, setParsed] = useState(null)
  const [roles, setRoles] = useState({})
  const [repair, setRepair] = useState(false) // how they make up: read only when the sender asks
  const [chat, setChat] = useState(saved) // { excerpts, stats, names, source, messages }
  const [found, setFound] = useState(null)
  const fileRef = useRef(null)
  const [searchMsgs, setSearchMsgs] = useState(null) // the chat with roles, in memory only, for searching while this page is open
  const [query, setQuery] = useState('')
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
    if (msgs.filter((m) => m.role === 'me' || m.role === 'them').length < 8) return setError(ERRORS.too_few)
    setError('')
    // a chat brought in before is recognised by its first message; then only what's new is read again
    const firstMsg = msgs.find((m) => m.at && m.kind === 'text')
    const fp = firstMsg ? fingerprint(`${firstMsg.at}|${firstMsg.text}`) : ''
    const before = getDraft().chatSource
    const lastAt = msgs.reduce((x, m) => (m.at && m.at > x ? m.at : x), '')
    const sameChat = !!(fp && before?.fp === fp && before.lastAt)
    const fresh = sameChat ? msgs.filter((m) => m.at && m.at > before.lastAt) : msgs
    setSearchMsgs(msgs.filter((m) => m.role === 'me' || m.role === 'them'))
    // the names they gave in the basics let the count find the first time one was used
    const nicknames = String(getDraft().phase2?.nicknames || '').split(/[,·/]| and /).map((x) => x.trim()).filter(Boolean)
    const stats = chatStats(msgs, { nicknames })
    const keyDates = [p1.startDate].filter(Boolean)
    const { text } = pickExcerpts(sameChat && fresh.length >= 8 ? fresh : msgs, { names, keyDates })
    const next = { excerpts: text, stats, names, source: parsed.source, messages: parsed.messages.length, fp, lastAt, ...(sameChat ? { newSince: before.lastAt, newCount: fresh.length } : {}), kept: [] }
    setChat(next)
    saveLocalChat(next)
    setParsed(null) // the full chat isn't kept in memory longer than needed
    setStep('preview')
  }

  const find = async () => {
    setError('')
    setStep('finding')
    try {
      const raw = await findStory({ excerpts: chat.excerpts, stats: chat.stats, names: chat.names, repair })
      const d = getDraft()
      // a second reading of the same chat adds to the first; kept search lines come along as moments
      const kept = (chat.kept || []).map(momentFromLine)
      const read = { ...raw, stats: chat.stats, memories: [...(raw.memories || []), ...kept] }
      const story = chat.newSince && d.story ? mergeStories(d.story, read) : read
      if (!normalizeStory(story)) throw new AIUnavailableError(502)
      // letters are made from the story once the box has a plan; before that it waits for the editor
      saveDraft({ ...(d.plan ? draftWithStory(d, story) : { story, storyPending: true }), chatSource: { fp: chat.fp || '', lastAt: chat.lastAt || '' } })
      clearLocalChat()
      setFound(story)
      setStep('done')
      track('chat_story_found')
    } catch (err) {
      if (err instanceof SignInRequiredError) {
        setStep('preview')
        return navigate('/start?next=/chats')
      }
      if (err instanceof PaymentRequiredError) {
        setStep('preview')
        return setError('You’ve used the free reading. Handing over the box gives you two more; your numbers stay saved on this device.')
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
              <p className="ci-bubble">Your chat is read on this phone first. You’ll see the numbers before anything is sent anywhere, and only a selection is ever sent, never stored.</p>
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
                <input ref={fileRef} type="file" accept=".txt,.csv,.json,text/plain,text/csv,application/json" className="wf-sr" onChange={onFile} tabIndex={-1} aria-hidden="true" />
                <button type="button" className="wf-btn wf-btn--block" onClick={() => fileRef.current?.click()}>Choose the exported file</button>
              </>
            )}
            {error && <p className="wf-error" role="alert">{error}</p>}
            <p className="wf-fine ci-fine">We need at least 8 messages from the two of you. Photos, videos and voice notes are counted, never opened.</p>
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
            <p className="wf-lede">We found {parsed.messages.length.toLocaleString('en-US')} messages{parsed.from ? `, from ${shortDate(parsed.from)} to ${shortDate(parsed.to)}` : ''}. Tell us which name is you and which is {names.them}. If one of you shows up under two names (a renamed contact), give both the same answer.</p>
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
            {chat.newSince && <p className="wf-note ci-new">The same chat as before: {(chat.newCount || 0).toLocaleString('en-US')} new messages since {shortDate(chat.newSince.slice(0, 10))}. Only those are read again; what you found before stays.</p>}
            <ul className="ci-facts">
              {facts.map((f) => (
                <li key={f.id} className="ci-fact">
                  <span className="ci-fact-big">{f.text}</span>
                  <span className="ci-fact-sub">{f.sub}</span>
                </li>
              ))}
            </ul>

            <ChatSearch messages={searchMsgs} names={chat.names} kept={chat.kept || []} onKeep={(m) => { const next = { ...chat, kept: [...(chat.kept || []), { at: m.at, text: m.text }].slice(-12) }; setChat(next); saveLocalChat(next) }} query={query} setQuery={setQuery} />

            <div className="wf-paper ci-next">
              <p className="ci-next-h">Next: the moments behind the numbers</p>
              <p className="ci-next-p">We read a selection of your messages (about {Math.round(chat.excerpts.length / 1000)}k characters, not the whole chat) to find shared moments, things you always say, plans you made and the goodbyes before this one. Each comes with the line from your chat it stands on. You pick what goes on a letter; nothing goes in the box by itself.</p>
              <label className="ci-opt">
                <input id="ci-repair" type="checkbox" checked={repair} onChange={(e) => setRepair(e.target.checked)} />
                <span><b>Also notice how you make up after a hard day</b> A gentle line about what you do, never who was at fault. Off unless you turn it on.</span>
              </label>
              {signedIn === false ? (
                <button type="button" className="wf-btn wf-btn--ink wf-btn--block" onClick={() => navigate('/start?next=/chats')}>Sign in to find our moments</button>
              ) : (
                <button type="button" className="wf-btn wf-btn--ink wf-btn--block" onClick={find} disabled={signedIn === null}>Find our moments</button>
              )}
              <p className="wf-note">{paid ? 'Up to three readings come with your letter box.' : 'Your first reading is free. Your numbers stay saved on this device.'}</p>
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
            <button type="button" className="wf-btn wf-btn--block" onClick={() => navigate(then || (getDraft().plan ? '/editor' : '/ai-interview'))}>{then === '/ai-interview' || !getDraft().plan ? 'Start planning together' : 'Open the editor'}</button>
          </>
        )}
      </div>
    </FlowFrame>
  )
}

/*
 * Find in your chat: a word or a name, searched on this device only. Up to 30 lines, newest first.
 * "Keep" saves a line as a moment (its own words as evidence) that goes into the letters with the reading.
 * The chat itself is never saved for this: after a reload, the file is picked again to search.
 */
function ChatSearch({ messages, names, kept, onKeep, query, setQuery }) {
  const q = query.trim().toLowerCase()
  const hits = useMemo(() => {
    if (!messages || q.length < 2) return []
    const out = []
    for (let i = messages.length - 1; i >= 0 && out.length < 30; i--) {
      const m = messages[i]
      if (m.kind === 'text' && m.text.toLowerCase().includes(q)) out.push(m)
    }
    return out
  }, [messages, q])
  const keptSet = new Set(kept.map((k) => `${k.at}|${k.text}`))
  return (
    <section className="wf-card ci-search" aria-labelledby="ci-search-h">
      <h2 id="ci-search-h" className="ci-search-h">Find in your chat</h2>
      {messages ? (
        <>
          <label htmlFor="ci-search-q" className="wf-sr">Search your chat</label>
          <input id="ci-search-q" className="wf-input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="A place, a word, a name…" />
          {q.length >= 2 && <p className="wf-note" role="status">{hits.length ? `${hits.length === 30 ? 'The 30 newest' : hits.length} of the lines that say “${query.trim()}”` : `No line says “${query.trim()}”.`}</p>}
          <ul className="ci-hits">
            {hits.map((m) => {
              const k = `${m.at}|${m.text}`
              return (
                <li key={k} className="ci-hit">
                  <span className="ci-hit-meta">{m.role === 'me' ? names.me : names.them}{m.at ? `, ${shortDate(m.at.slice(0, 10))}` : ''}</span>
                  <span className="ci-hit-text">{m.text.length > 160 ? `${m.text.slice(0, 159)}…` : m.text}</span>
                  <button type="button" className="wf-btn wf-btn--ghost wf-btn--small" disabled={keptSet.has(k)} onClick={() => onKeep(m)}>{keptSet.has(k) ? 'Kept' : 'Keep'}</button>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <p className="wf-note">Pick the file again to search it. Your chat isn’t kept on this device for searching.</p>
      )}
      {kept.length > 0 && <p className="wf-note">{kept.length} kept {kept.length === 1 ? 'line' : 'lines'}. They join your moments when you find them below.</p>}
    </section>
  )
}
