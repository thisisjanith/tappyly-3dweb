import { lazy, useEffect, useRef, useState } from 'react'
import { SceneCanvas } from '../three/common/SceneCanvas'
import { useReveal, useCounter } from '../lib/hooks'
import { getState } from '../lib/store'
import { MagneticLink } from '../components/Button'
import { ServiceCard, TiltCard } from '../components/Cards'
import { CTA } from '../components/CTA'
import { Arrow } from '../components/Icons'
import { SERVICES, PROCESS } from '../data/content'
import { usePageMeta } from './meta'

const ServicesScene = lazy(() => import('../three/services/ServicesScene'))

function Stat({ to, suffix, label }: { to: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useCounter(ref, to, suffix)
  return (
    <TiltCard className="stat">
      <div className="stat__num grad" ref={ref}>0{suffix}</div>
      <div className="stat__label">{label}</div>
    </TiltCard>
  )
}

export default function Services() {
  usePageMeta('Services — Tappyly', 'Web development, digital marketing, branding, SEO, UI/UX design and consulting from Tappyly.')
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  const [hover, setHover] = useState<number | null>(null)
  const [auto, setAuto] = useState(0)

  // idle: the ribbon slowly cycles through every service form
  useEffect(() => {
    if (hover !== null || getState().reduced) return
    const id = setInterval(() => setAuto((a) => (a + 1) % SERVICES.length), 4200)
    return () => clearInterval(id)
  }, [hover])

  const activeIdx = hover ?? auto
  const shape = SERVICES[activeIdx].shape

  return (
    <div ref={root}>
      <section style={{ position: 'relative' }} aria-labelledby="services-title">
        <div style={{ position: 'sticky', top: 0, height: '100svh', marginBottom: '-100svh', zIndex: 0 }}>
          <SceneCanvas camera={{ position: [0, 0, 9], fov: 36 }} label="Interactive 3D ribbon that morphs for each Tappyly service — drag to rotate">
            <ServicesScene shape={shape} />
          </SceneCanvas>
        </div>
        <div className="page-hero stage-top" style={{ minHeight: '78svh', alignItems: 'flex-end' }}>
          <div className="container hero__content" style={{ paddingBottom: 48 }}>
            <div className="hero__copy" style={{ maxWidth: 560 }}>
              <h1 id="services-title" className="h1" data-split data-immediate>
                Solutions to Power Your <span className="grad">Growth</span>
              </h1>
              <p className="lead" data-reveal data-immediate data-delay="0.3" style={{ marginTop: 22 }}>
                From stunning websites to high-impact marketing strategies, we offer end-to-end digital solutions tailored to your business needs.
              </p>
              <div className="hero__actions" data-reveal data-immediate data-delay="0.45" style={{ marginTop: 30 }}>
                <MagneticLink to="/contact" size="sm">Get Started <Arrow /></MagneticLink>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Now showing: <strong style={{ color: 'var(--text)' }}>{SERVICES[activeIdx].title}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: 120 }}>
          <div className="svc-grid svc-grid--3" data-stagger>
            {SERVICES.map((s, i) => (
              <ServiceCard key={s.id} s={s} large active={activeIdx === i} to="/contact" onEnter={() => setHover(i)} onLeave={() => setHover(null)} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="why-title" style={{ position: 'relative', zIndex: 1, background: 'linear-gradient(to bottom, transparent, var(--bg) 20%)' }}>
        <div className="container">
          <div className="split split--even" style={{ alignItems: 'end', marginBottom: 48 }}>
            <div className="split__intro">
              <h2 id="why-title" className="h2" data-split>Craft, data and <span className="grad-violet">momentum</span></h2>
            </div>
            <p className="lead" data-reveal>Every engagement pairs senior designers, engineers and strategists in one team — so ideas move from whiteboard to measurable growth without hand-off friction.</p>
          </div>
          <div className="stat-row" data-stagger>
            <Stat to={120} suffix="+" label="Projects launched" />
            <Stat to={98} suffix="%" label="Client retention" />
            <Stat to={40} suffix="+" label="Brands grown" />
            <Stat to={6} suffix="" label="Years of craft" />
          </div>
          <div className="process" style={{ marginTop: 64 }} data-stagger>
            {PROCESS.map((s, i) => (
              <TiltCard key={s.n} className="step">
                <div className="step__head">
                  <span className="step__num">{s.n}</span>
                  <s.icon style={{ color: i % 2 ? '#c58bff' : '#ffb44d' }} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>
      <CTA title="Have a project" accent="in mind?" text="Tell us where you want to go — we'll map the fastest route there." />
    </div>
  )
}
