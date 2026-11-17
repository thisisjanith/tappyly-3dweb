import { useEffect, useRef } from 'react'
import type { Project } from '../data/content'
import { getLenis } from '../lib/scroll'
import { projectTexture } from '../lib/canvasTextures'
import { Close, Arrow } from './Icons'
import { MagneticLink } from './Button'

export function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null)
  const img = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!project) return
    getLenis()?.stop()
    closeBtn.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    const tex = projectTexture(project)
    const src = (tex.image as HTMLCanvasElement).toDataURL('image/jpeg', 0.85)
    if (img.current) img.current.style.backgroundImage = `url(${src})`
    return () => {
      getLenis()?.start()
      window.removeEventListener('keydown', esc)
    }
  }, [project, onClose])

  if (!project) return null
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="glass modal" role="dialog" aria-modal="true" aria-labelledby="pm-title" onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        <div ref={img} style={{ aspectRatio: '16/10', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '18px 18px 0 0' }} role="img" aria-label={`${project.title} preview`} />
        <div style={{ padding: 'clamp(20px, 4vw, 36px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start' }}>
            <div>
              <h2 id="pm-title" className="h2" style={{ fontSize: 'clamp(28px,3.4vw,40px)' }}>{project.title}</h2>
            </div>
            <button ref={closeBtn} className="round-arrow" style={{ width: 44, height: 44, flex: 'none' }} onClick={onClose} aria-label="Close project">
              <Close style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <p className="lead" style={{ marginTop: 14 }}>{project.summary}</p>
          <div style={{ display: 'flex', gap: 28, marginTop: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--dim)' }}>Client</div>
              <div style={{ fontWeight: 650 }}>{project.client}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--dim)' }}>Outcome</div>
              <div className="grad" style={{ fontWeight: 750, fontSize: 20 }}>{project.result}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <MagneticLink to="/contact" size="sm">Start a similar project <Arrow /></MagneticLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
