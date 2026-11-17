import { useRef } from 'react'
import { useReveal, useCounter } from '../lib/hooks'
import { MagneticLink } from '../components/Button'
import { TiltCard } from '../components/Cards'
import { CTA } from '../components/CTA'
import { Arrow, Bulb, Users, Trophy, Target, Sparkle } from '../components/Icons'
import { usePageMeta } from './meta'
import { HeroBackdrop } from '../components/HeroBackdrop'
import aboutBg from '../assets/about-bg.jpg'

const JOURNEY = [
  { year: '2019', title: 'Founded in Colombo', text: 'Three friends, one laptop each, and a belief that Sri Lankan craft could compete globally.' },
  { year: '2021', title: 'Full-service studio', text: 'Expanded into performance marketing and branding to own the whole growth journey.' },
  { year: '2023', title: 'International clients', text: 'Partnered with brands across Asia, Europe and the Middle East.' },
  { year: '2025', title: 'Immersive & AI', text: 'Launched our creative-technology lab for WebGL, 3D and AI-powered experiences.' },
]

const VALUES = [
  { icon: Bulb, title: 'Innovation First', text: 'We prototype boldly and ship what moves the needle.' },
  { icon: Users, title: 'Client Focused', text: 'One team with you — transparent, responsive, invested.' },
  { icon: Trophy, title: 'Results Driven', text: 'Beautiful work that is measured by real outcomes.' },
  { icon: Target, title: 'Built to Last', text: 'Accessible, performant, maintainable — by default.' },
]

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

export default function About() {
  usePageMeta('About — Tappyly', 'Meet Tappyly: a team of creators, developers and marketers in Colombo helping ambitious brands grow.')
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  return (
    <div ref={root}>
      <section className="page-hero stage-top" style={{ minHeight: '100svh' }} aria-labelledby="about-title">
        <HeroBackdrop src={aboutBg} position="96% 50%" mobilePosition="100% 50%" zoom={1.02} mobileTop />
        <div className="hero__fade" />
        <div className="container hero__content" style={{ pointerEvents: 'auto' }}>
          <div style={{ maxWidth: 540 }}>
            <div className="split__intro">
              <h1 id="about-title" className="h1" data-split data-immediate>
                More Than a Digital <span className="grad">Agency</span>
              </h1>
              <p className="lead" data-reveal data-immediate data-delay="0.3">
                We are a team of passionate creators, developers and marketers, united by a simple goal — to help ambitious brands grow in the digital world.
              </p>
              <ul className="values" data-reveal data-immediate data-delay="0.4">
                {VALUES.slice(0, 3).map((v) => (
                  <li key={v.title}><v.icon />{v.title}</li>
                ))}
              </ul>
              <div className="actions" data-reveal data-immediate data-delay="0.5">
                <MagneticLink to="/about#journey" variant="ghost" size="sm">Our Journey <Arrow /></MagneticLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="container stat-row" data-stagger>
          <Stat to={120} suffix="+" label="Projects delivered" />
          <Stat to={25} suffix="+" label="Creators & engineers" />
          <Stat to={12} suffix="" label="Countries served" />
          <Stat to={98} suffix="%" label="Client satisfaction" />
        </div>
      </section>

      <section className="section" aria-labelledby="values-title">
        <div className="container">
          <div className="split split--even" style={{ alignItems: 'end', marginBottom: 48 }}>
            <div className="split__intro">
              <h2 id="values-title" className="h2" data-split>Values we <span className="grad-violet">build on</span></h2>
            </div>
            <p className="lead" data-reveal>Culture is how we work when nobody is watching. These four principles shape every pixel, line of code and campaign we ship.</p>
          </div>
          <div className="svc-grid" data-stagger>
            {VALUES.map((v) => (
              <TiltCard key={v.title} className="svc-card svc-card--lg">
                <span className="icon-chip"><v.icon /></span>
                <h3 className="h3">{v.title}</h3>
                <p>{v.text}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <section id="journey" className="section" aria-labelledby="journey-title">
        <div className="container split">
          <div className="split__intro">
            <h2 id="journey-title" className="h2" data-split>From a small room to a <span className="grad">global studio</span></h2>
          </div>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 16, position: 'relative' }} data-stagger>
            {JOURNEY.map((j) => (
              <li key={j.year}>
                <TiltCard className="step" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'center' }}>
                  <div className="grad" style={{ fontSize: 'clamp(28px,3vw,40px)', fontWeight: 750, letterSpacing: '-0.04em' }}>{j.year}</div>
                  <div>
                    <h3 style={{ marginTop: 0, display: 'flex', gap: 8, alignItems: 'center' }}><Sparkle style={{ width: 12, color: 'var(--violet)' }} />{j.title}</h3>
                    <p>{j.text}</p>
                  </div>
                </TiltCard>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <CTA title="Let's grow" accent="together." text="We're always excited to meet ambitious teams." />
    </div>
  )
}
