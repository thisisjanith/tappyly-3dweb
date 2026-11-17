import { lazy, useRef, useState, type FormEvent } from 'react'
import { SceneCanvas } from '../three/common/SceneCanvas'
import { useReveal, useTilt } from '../lib/hooks'
import { MagneticButton } from '../components/Button'
import { Arrow, Clock } from '../components/Icons'
import { ArticleThumb } from '../components/ArticleThumb'
import { scrollToEl } from '../lib/scroll'
import { ARTICLES, type Article } from '../data/content'
import { usePageMeta } from './meta'

const InsightsScene = lazy(() => import('../three/insights/InfinityScene'))

function ArticleCard({ a }: { a: Article }) {
  const ref = useTilt<HTMLElement>(6)
  return (
    <article ref={ref} className="glass tilt article-card">
      <div className="article-card__thumb"><ArticleThumb category={a.category} seed={a.id} /></div>
      <div className="article-card__body">
        <span className="article-card__cat">{a.category}</span>
        <h3><a href={`#${a.id}`} onClick={(e) => e.preventDefault()} className="is-interactive">{a.title}</a></h3>
        <p className="excerpt">{a.excerpt}</p>
        <div className="article-card__meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {a.date} · <Clock style={{ width: 12 }} /> {a.read}
        </div>
      </div>
    </article>
  )
}

export default function Insights() {
  usePageMeta('Insights — Tappyly', 'Ideas, trends and expert tips on web development, digital marketing, branding and growth.')
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [err, setErr] = useState('')

  const subscribe = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('Please enter a valid email address.')
    setErr('')
    setSubscribed(true)
  }

  return (
    <div ref={root}>
      <section style={{ position: 'relative' }}>
        <div style={{ position: 'sticky', top: 0, height: '100svh', marginBottom: '-100svh' }}>
          <SceneCanvas camera={{ position: [0, 0, 9], fov: 38 }} label="Glossy 3D infinity symbol that tilts with your cursor">
            <InsightsScene />
          </SceneCanvas>
        </div>
        <div className="page-hero stage-top" style={{ minHeight: '84svh' }}>
          <div className="container hero__content">
            <div className="hero__copy" style={{ maxWidth: 520 }}>
              <h1 className="h1" data-split data-immediate>
                Ideas, Trends &amp; Expert <span className="grad">Tips</span>
              </h1>
              <p className="lead" data-reveal data-immediate data-delay="0.3" style={{ marginTop: 22 }}>
                Stay ahead with the latest insights on web development, digital marketing and more.
              </p>
              <div data-reveal data-immediate data-delay="0.4" style={{ marginTop: 30 }}>
                <MagneticButton size="sm" onClick={() => scrollToEl('#articles')}>Explore All <Arrow /></MagneticButton>
              </div>
            </div>
          </div>
        </div>
        <div id="articles" className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: 100 }}>
          <div className="svc-grid svc-grid--3" data-stagger>
            {ARTICLES.map((a) => (
              <ArticleCard key={a.id} a={a} />
            ))}
          </div>
        </div>
      </section>

      <section className="section--tight" aria-labelledby="nl-title">
        <div className="container">
          <div className="glass" style={{ padding: 'clamp(28px,5vw,56px)', borderRadius: 28, display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'center' }} data-reveal>
            <div>
              <h2 id="nl-title" className="h2" style={{ fontSize: 'clamp(26px,3vw,38px)' }}>Insights, <span className="grad-violet">monthly.</span></h2>
              <p className="body" style={{ marginTop: 10 }}>One thoughtful email a month. No spam, unsubscribe anytime.</p>
            </div>
            {subscribed ? (
              <p role="status" style={{ fontWeight: 650 }}>You&apos;re in! Check your inbox to confirm. ✨</p>
            ) : (
              <form onSubmit={subscribe} noValidate style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div className={`field ${err ? 'is-invalid' : ''}`} style={{ flex: '1 1 220px' }}>
                  <label htmlFor="nl-email" className="sr-only">Email</label>
                  <input id="nl-email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err} aria-describedby={err ? 'nl-err' : undefined} />
                  {err && <div id="nl-err" className="field__err">{err}</div>}
                </div>
                <MagneticButton type="submit">Subscribe <Arrow /></MagneticButton>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
