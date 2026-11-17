import { lazy, useRef, useState } from 'react'
import { SceneCanvas } from '../three/common/SceneCanvas'
import { useReveal } from '../lib/hooks'
import { TiltCard } from '../components/Cards'
import { CTA } from '../components/CTA'
import { ProjectModal } from '../components/ProjectModal'
import { MagneticButton } from '../components/Button'
import { Arrow, ArrowUpRight } from '../components/Icons'
import { scrollToEl } from '../lib/scroll'
import { FILTERS, PROJECTS, type Project } from '../data/content'
import { usePageMeta } from './meta'

const GalleryScene = lazy(() => import('../three/portfolio/GalleryScene'))

export default function Portfolio() {
  usePageMeta('Portfolio — Tappyly', 'Selected Tappyly projects across web apps, branding, marketing and UI/UX.')
  const root = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<string>('All')
  const [selected, setSelected] = useState<Project | null>(null)
  useReveal(root)
  const list = PROJECTS.filter((p) => filter === 'All' || p.category === filter)

  return (
    <div ref={root}>
      <section className="page-hero" style={{ minHeight: '100svh' }} aria-labelledby="pf-title">
        <div className="hero__bg" data-cursor="View">
          <SceneCanvas camera={{ position: [0, 0, 12], fov: 36 }} label="3D wall of Tappyly projects — click a panel for details">
            <GalleryScene filter={filter} onSelect={setSelected} />
          </SceneCanvas>
        </div>
        <div className="container hero__content" style={{ alignSelf: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="hero__copy" style={{ maxWidth: 440 }}>
              <h1 id="pf-title" className="h1" data-split data-immediate>
                Ideas into <span className="grad">Impact</span>
              </h1>
              <p className="lead" data-reveal data-immediate data-delay="0.3" style={{ marginTop: 20 }}>
                A showcase of our work, where creativity meets technology.
              </p>
              <div data-reveal data-immediate data-delay="0.4" style={{ marginTop: 28 }}>
                <MagneticButton variant="ghost" size="sm" onClick={() => scrollToEl('#case-list')}>View All Projects <Arrow /></MagneticButton>
              </div>
            </div>
            <div className="pill-row" role="group" aria-label="Filter projects" data-reveal data-immediate data-delay="0.5">
              {FILTERS.map((f) => (
                <button key={f} className={`pill ${filter === f ? 'is-active' : ''}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="case-list" className="section" aria-label="Project list">
        <div className="container">
          <div className="svc-grid svc-grid--3" key={filter} data-stagger>
            {list.map((p) => (
              <TiltCard key={p.id} className="svc-card svc-card--lg is-interactive" as="article">
                <button onClick={() => setSelected(p)} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', height: '100%' }} aria-label={`Open ${p.title}`}>
                  <span className="article-card__cat">{p.category} · {p.year}</span>
                  <h3 className="h3" style={{ marginTop: 10 }}>{p.title}</h3>
                  <p>{p.summary}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 22, width: '100%' }}>
                    <span className="grad" style={{ fontWeight: 700 }}>{p.result}</span>
                    <span className="round-arrow"><ArrowUpRight /></span>
                  </div>
                </button>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>
      <CTA title="Your project could be" accent="next." text="Let's build something worth showing off." />
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
