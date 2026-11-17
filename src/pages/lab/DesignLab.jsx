import { useMemo, useState } from 'react'
import { designFromStory } from '../../utils/design/storyDesign'
import { SAMPLES } from './samples'
import { StoryLetter } from './pieces'
import { useLabFonts } from './fonts'
import '../../styles/decor.css'
import './lab.css'

/*
 * Design lab (dev only, /lab/design): three made-up stories, each dressed by designFromStory().
 * Each one runs the real recipient app in a phone frame (/lab/phone/:key), shows its long first-night
 * letter at full length, and lists which piece of the story every visual choice came from.
 */

function Sample({ sample }) {
  const [variant, setVariant] = useState(0)
  const spec = useMemo(() => designFromStory(sample.story, variant), [sample, variant])
  const p = spec.palette
  const long = spec.letters.find((l) => l.section === 'tonight')
  return (
    <section className="dl-sample" style={{ '--bg': p.bg, '--paper': p.paper, '--ink': p.ink, '--accent': p.accent, '--accent2': p.accent2, '--soft': p.soft }}>
      <header className="dl-sample-head">
        <span className="dl-chip">{sample.label}</span>
        <button type="button" className="dl-again" onClick={() => setVariant((v) => v + 1)}>다시 꾸미기{variant > 0 ? ` (${variant})` : ''}</button>
      </header>

      <div className="dl-phone">
        <iframe title={`${sample.label} 받는 사람 화면`} src={`/lab/phone/${sample.key}?v=${variant}`} loading="lazy" />
      </div>
      <p className="dl-hint">위 화면은 실제 받는 사람 앱(LetterApp)입니다. 편지 버튼을 누르면 열립니다.</p>

      {long && <StoryLetter letter={long} spec={spec} keyBase={sample.key} from={sample.story.from} />}

      <div className="dl-swatches" aria-label="색">
        {['bg', 'paper', 'ink', 'accent', 'accent2', 'soft'].map((k) => <span key={k} style={{ background: p[k] }} title={`${k} ${p[k]}`} />)}
        <code>{spec.typeKey} · 줄 {spec.paper.lines} · 가장자리 {spec.paper.edge}{spec.paper.stain ? ` · 얼룩 ${spec.paper.stain}` : ''}</code>
      </div>

      <details className="dl-trace">
        <summary>이야기 → 디자인 ({spec.trace.length})</summary>
        <ol>{spec.trace.map((t, i) => <li key={i}><span>{t.info}</span><b>→</b><span>{t.design}</span></li>)}</ol>
      </details>
    </section>
  )
}

export default function DesignLab() {
  useLabFonts()
  return (
    <main className="dl">
      <header className="dl-head">
        <h1>Design lab · 이야기마다 다른 편지 박스</h1>
        <p>지어낸 이야기 세 개를 같은 규칙(designFromStory)으로 꾸민 결과입니다. 받는 사람의 메인 화면(편지 길), 긴 편지, 그리고 각 디자인이 이야기의 어느 부분에서 나왔는지를 함께 보여줍니다.</p>
      </header>
      <div className="dl-grid">{SAMPLES.map((s) => <Sample key={s.key} sample={s} />)}</div>
    </main>
  )
}
