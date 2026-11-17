import { lazy, useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SceneCanvas } from '../three/common/SceneCanvas'
import { useCounter, useReveal, useTilt } from '../lib/hooks'
import { getState } from '../lib/store'
import { MagneticLink } from '../components/Button'
import { TiltCard } from '../components/Cards'
import { CTA } from '../components/CTA'
import { ProjectModal } from '../components/ProjectModal'
import { Arrow, Play, BrandMarks, ChevronLeft, ChevronRight, Laptop, Users, Trophy, Bolt } from '../components/Icons'
import { ServiceArt } from '../components/ServiceArt'
import { TLink } from '../lib/transition'
import { SERVICES, PROCESS, PROJECTS, type Project, type Service } from '../data/content'
import { usePageMeta } from './meta'
import { HeroBackdrop } from '../components/HeroBackdrop'
import heroBg from '../assets/hero-bg.jpg'

const HeroScene = lazy(() => import('../three/hero/HeroScene'))
const CarouselScene = lazy(() => import('../three/portfolio/CarouselScene'))

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <HeroBackdrop src={heroBg} />
      <div className="hero__bg">
        <SceneCanvas camera={{ position: [0, 0.6, 10], fov: 35 }} label="Interactive 3D Tappyly app icon floating above a glowing valley — click the icon to tap it">
          <HeroScene />
        </SceneCanvas>
      </div>
      <div className="hero__fade" />
      <div className="container hero__content">
        <div className="hero__copy">
          <h1 id="hero-title" className="display" data-split data-immediate>
            Build. Grow.
            <br />
            <span className="grad">Thrive.</span>
          </h1>
          <p className="lead" data-reveal data-immediate data-delay="0.35">
            Tappyly Technologies (Private) Limited is a full-service digital agency, helping brands build powerful online experiences and achieve sustainable growth.
          </p>
          <div className="hero__actions" data-reveal data-immediate data-delay="0.5">
            <MagneticLink to="/portfolio">
              Explore Our Work <Arrow />
            </MagneticLink>
            <TLink to="/about" className="play">
              <span className="play__icon"><Play /></span>
              Watch Showreel
            </TLink>
          </div>
        </div>
      </div>
      <div className="trusted">
        <div className="container trusted__row">
          <div data-reveal data-immediate data-delay="0.7">
            <p className="trusted__label">Trusted by innovative brands</p>
            <div className="trusted__logos">
              {BrandMarks.map((M, i) => <M key={i} />)}
            </div>
          </div>
          <div className="scroll-cue" data-reveal data-immediate data-delay="0.8">
            <span className="scroll-cue__mouse" /> Scroll to explore
          </div>
        </div>
      </div>
    </section>
  )
}

function ServiceTile({ s }: { s: Service }) {
  const ref = useTilt<HTMLAnchorElement>(7)
  return (
    <TLink ref={ref} to={`/services#${s.id}`} className="glass tilt svc-tile">
      <ServiceArt id={s.id} className="svc-tile__art" />
      <h3 className="svc-tile__title">{s.title}</h3>
      <div className="svc-tile__row">
        <p>{s.short}</p>
        <span className="round-arrow" aria-hidden><Arrow /></span>
      </div>
    </TLink>
  )
}

function ServicesTeaser() {
  return (
    <section className="section" aria-labelledby="svc-title">
      <div className="ambient" style={{ width: 640, height: 640, left: -240, top: 40 }} />
      <div className="ambient" style={{ width: 520, height: 520, right: -220, bottom: -80 }} />
      <div className="container">
        <div className="sec-head">
          <h2 id="svc-title" className="h2" data-split>
            End-to-End <span className="grad">Digital Solutions</span>
          </h2>
          <p className="lead" data-reveal>
            From idea to impact, we craft digital experiences, build scalable products and help brands grow in the digital world.
          </p>
        </div>
        <div className="svc-tiles" data-stagger>
          {SERVICES.map((s) => <ServiceTile key={s.id} s={s} />)}
        </div>
      </div>
    </section>
  )
}

const WORK_STATS = [
  { to: 50, suffix: '+', label: 'Projects Delivered', icon: Laptop },
  { to: 30, suffix: '+', label: 'Happy Clients', icon: Users },
  { to: 10, suffix: '+', label: 'Industries Served', icon: Trophy },
  { to: 95, suffix: '%', label: 'Client Satisfaction', icon: Bolt },
]

function WorkStat({ to, suffix, label, icon: Icon }: (typeof WORK_STATS)[number]) {
  const num = useRef<HTMLDivElement>(null)
  useCounter(num, to, suffix)
  return (
    <div className="work-stat">
      <span className="work-stat__icon"><Icon /></span>
      <div>
        <div className="work-stat__num" ref={num}>0{suffix}</div>
        <div className="work-stat__label">{label}</div>
      </div>
    </div>
  )
}

const WORK_COUNT = 6

function WorkTeaser() {
  const [index, setIndex] = useState(1)
  const [selected, setSelected] = useState<Project | null>(null)
  const set = useCallback((i: number) => setIndex(((i % WORK_COUNT) + WORK_COUNT) % WORK_COUNT), [])
  const current = PROJECTS[index]
  return (
    <section className="section work" aria-labelledby="work-title">
      <div className="ambient" style={{ width: 700, height: 500, left: '50%', top: '30%', transform: 'translateX(-50%)' }} />
      <div className="container">
        <div className="sec-head">
          <h2 id="work-title" className="h2" data-split>
            Real Projects. <span className="grad">Real Impact.</span>
          </h2>
          <p className="lead" data-reveal>
            A glimpse of our work — from modern websites to scalable digital products that drive real business results.
          </p>
        </div>
        <div className="work__stage" data-reveal data-cursor="Drag">
          <div className="work__floor" aria-hidden />
          <SceneCanvas camera={{ position: [0, 0, 7.2], fov: 38 }} label="Carousel of Tappyly project showcases">
            <CarouselScene index={index} onIndex={set} onSelect={setSelected} />
          </SceneCanvas>
        </div>
        <div className="work__nav" data-reveal>
          <button className="round-arrow work__arrow" onClick={() => set(index - 1)} aria-label="Previous project"><ChevronLeft /></button>
          <div className="work__dots">
            {PROJECTS.slice(0, WORK_COUNT).map((p, i) => (
              <button key={p.id} className={`work__dot ${i === index ? 'is-active' : ''}`} onClick={() => set(i)} aria-label={`Show ${p.title}`} aria-current={i === index} />
            ))}
          </div>
          <button className="round-arrow work__arrow" onClick={() => set(index + 1)} aria-label="Next project"><ChevronRight /></button>
        </div>
        <button className="work__caption" onClick={() => setSelected(current)} aria-live="polite">
          <strong>{current.title}</strong> · {current.category} · {current.result}
        </button>
        <div className="work-stats" data-stagger>
          {WORK_STATS.map((st) => <WorkStat key={st.label} {...st} />)}
        </div>
        <div className="work__cta" data-reveal>
          <MagneticLink to="/portfolio">View Full Portfolio <Arrow /></MagneticLink>
        </div>
      </div>
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

function Process() {
  const path = useRef<SVGPathElement>(null)
  useEffect(() => {
    const p = path.current
    if (!p || getState().reduced) return
    const len = p.getTotalLength()
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
    const st = ScrollTrigger.create({
      trigger: p, start: 'top 85%', end: 'top 40%', scrub: 1,
      onUpdate: (s) => gsap.set(p, { strokeDashoffset: len * (1 - s.progress) }),
    })
    return () => st.kill()
  }, [])
  return (
    <section className="section" aria-labelledby="process-title">
      <div className="container split">
        <div className="split__intro">
          <h2 id="process-title" className="h2" data-split>
            A Simple <span className="grad-violet">4-Step</span> Process
          </h2>
          <p className="lead" data-reveal>From idea to impact — we make it effortless.</p>
        </div>
        <div className="process">
          <div className="process__line" aria-hidden>
            <svg viewBox="0 0 1000 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pl" x1="0" x2="1">
                  <stop offset="0" stopColor="#6b2bff" />
                  <stop offset="0.6" stopColor="#c58bff" />
                  <stop offset="1" stopColor="#ff8a3d" />
                </linearGradient>
              </defs>
              <path ref={path} d="M0 20 C 120 -10, 200 50, 333 20 S 540 -10, 666 20 S 880 50, 1000 20" fill="none" stroke="url(#pl)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          {PROCESS.map((s, i) => (
            <TiltCard key={s.n} className="step" data-reveal data-delay={String(i * 0.1)}>
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
  )
}

export default function Home() {
  usePageMeta('Tappyly — Build. Grow. Thrive.', 'A full-service digital agency in Colombo helping brands build powerful online experiences and achieve sustainable growth.')
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  return (
    <div ref={root}>
      <Hero />
      <ServicesTeaser />
      <WorkTeaser />
      <Process />
      <CTA title="Ready to Take Your" accent="Business" after="to the Next Level?" text="Let's create something extraordinary together." />
    </div>
  )
}
