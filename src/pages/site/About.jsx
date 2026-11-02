import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SiteLayout from './SiteLayout'
import { PaperFragment } from './Fragments'

const PROMISES = [
  ['We won’t write it for you.', 'The guide plans and asks; it never puts words in your mouth. A letter is worth what you put into it.'],
  ['No streaks, no guilt.', 'Miss a day and they’ll never know. Each entry shows the day it was written, never the days in between.'],
  ['Only what’s true.', 'No inflated numbers, no fake urgency. One price, paid once, and a full refund within 14 days.'],
]

export default function About() {
  useEffect(() => {
    document.title = 'Why I made this — While You’re Away'
  }, [])

  return (
    <SiteLayout>
      <section className="ab" aria-labelledby="ab-title">
        <div className="ab-head">
          <h1 id="ab-title" className="ph-title">Why I made this</h1>
          <p className="ab-roles">I’m a soldier. A student far from home. A son. Someone’s partner. Someone’s best friend.</p>
        </div>
        <div className="ab-story" data-rise>
          <p>
            Each of those has come with a goodbye. The last night before basic training, holding on until we ran out of tears. An airport bus I boarded with a straight face, then cried on the whole way. A phone call telling me my closest friend was gone. A hospital room, my mother beside me, when the doctor said my father might not wake up.
          </p>
          <p>Every time, gifts and good dinners felt like grasping at straws. Even “I love you” couldn’t carry it. What stayed with me were the words I hadn’t said.</p>
          <p>So I started writing them down: the days we’d had, the things I’d never said out loud, the future I hoped for. While You’re Away is that letter box, made for anyone with a goodbye coming.</p>
          <p className="ab-sign">Jin, founder</p>
        </div>
        <figure className="ab-shot" data-rise>
          <PaperFragment title="Week four" meta="While we’re apart · opened today" body="If you’re reading this, you’ve already done the hardest part once. I keep thinking about the bus stop, and how you said the rain was the reason your eyes were wet." />
          <figcaption>A letter from Jae to Mina, on paper made from their story.</figcaption>
        </figure>
      </section>

      <section className="ab-then" aria-labelledby="ab-then">
        <div className="ab-then-copy" data-rise>
          <h2 id="ab-then" className="ws-h2">People have always written before parting</h2>
          <p>Long before phones, people far from each other kept close the same way: a few lines, saved and reread. While You’re Away keeps that habit and gives each letter its day.</p>
        </div>
        <figure className="ab-then-letter" data-rise>
          <img src="/site/letter-1864.jpg" alt="A handwritten letter beginning Dear Brother, dated December 17, 1864" width="1400" height="1754" loading="lazy" />
          <figcaption>A sister writes to her brother far from home. North Carolina, December 1864.</figcaption>
        </figure>
        <figure className="ab-then-platform" data-rise>
          <img src="/site/platform-dusk.jpg" alt="A train platform at dusk with people waiting under the lights" width="1600" height="1060" loading="lazy" />
          <figcaption>A platform at dusk, Toyama.</figcaption>
        </figure>
        <figure className="ab-then-sky" data-rise>
          <img src="/site/sunset-stars.jpg" alt="The first stars over a quiet sea just after sunset" width="1400" height="1977" loading="lazy" />
          <figcaption>The first stars over the sea, Stångehuvud.</figcaption>
        </figure>
      </section>

      <section className="ab-promise" aria-labelledby="ab-promise">
        <h2 id="ab-promise" className="ws-h2" data-rise>What we promise</h2>
        <ul>
          {PROMISES.map(([t, d]) => (
            <li key={t} data-rise>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="ab-who" aria-labelledby="ab-who">
        <h2 id="ab-who" className="ws-h2" data-rise>Who runs it</h2>
        <p className="ab-whobody" data-rise>
          While You’re Away is run by Sangjin Ouh, a sole proprietor in California. Questions, worries or a goodbye you’re not sure how to start: <Link to="/contact">write to us</Link>.
        </p>
      </section>
    </SiteLayout>
  )
}
