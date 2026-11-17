import { useRef } from 'react'
import { useReveal } from '../lib/hooks'
import { MagneticLink } from '../components/Button'
import { Arrow } from '../components/Icons'
import { usePageMeta } from './meta'

export default function NotFound() {
  usePageMeta('Page not found — Tappyly', 'This page drifted off into space.')
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  return (
    <div ref={root}>
      <section className="page-hero" style={{ minHeight: '90svh', textAlign: 'center' }}>
        <div className="ambient" style={{ width: 700, height: 700, left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
        <div className="container hero__content" style={{ pointerEvents: 'auto' }}>
          <div className="display grad" data-split data-immediate style={{ fontSize: 'clamp(120px, 22vw, 260px)' }}>404</div>
          <p className="lead" style={{ margin: '12px auto 32px' }} data-reveal data-immediate>This page drifted off into space. Let&apos;s get you back on course.</p>
          <div data-reveal data-immediate><MagneticLink to="/">Back to Home <Arrow /></MagneticLink></div>
        </div>
      </section>
    </div>
  )
}
