import { lazy } from 'react'
import { SceneCanvas } from '../three/common/SceneCanvas'
import { MagneticLink } from './Button'
import { Arrow, Sparkle } from './Icons'

const CtaRibbon = lazy(() => import('../three/services/CtaRibbon'))

export function CTA({ title, accent, after, text }: { title: string; accent: string; after?: string; text: string }) {
  return (
    <section className="section--tight" aria-labelledby="cta-title">
      <div className="container">
        <div className="cta" data-reveal>
          <div className="cta__scene">
            <SceneCanvas camera={{ position: [0, 0, 6], fov: 40 }}>
              <CtaRibbon />
            </SceneCanvas>
            <Sparkle style={{ position: 'absolute', right: 30, top: 34, width: 18, color: '#e9dcff', filter: 'drop-shadow(0 0 8px #a46bff)' }} />
          </div>
          <div>
            <h2 id="cta-title">
              {title} <span className="grad-violet">{accent}</span> {after}
            </h2>
            <p>{text}</p>
          </div>
          <MagneticLink to="/contact" variant="light" size="sm">
            Get in Touch <Arrow />
          </MagneticLink>
        </div>
      </div>
    </section>
  )
}
