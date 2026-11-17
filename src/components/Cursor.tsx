import { useEffect, useRef } from 'react'
import { useAppState } from '../lib/store'

/** Dot + lagging ring cursor; grows over interactive elements, shows labels via [data-cursor]. */
export function Cursor() {
  const reduced = useAppState((s) => s.reduced)
  const root = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return
    document.body.classList.add('has-cursor')
    const pos = { x: -100, y: -100 }
    const lag = { x: -100, y: -100 }
    let raf = 0
    const move = (e: PointerEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      root.current?.classList.remove('is-hidden')
      const t = e.target as HTMLElement
      const labelled = t.closest<HTMLElement>('[data-cursor]')
      const interactive = t.closest('a, button, [role="button"], input, textarea, label, .is-interactive')
      root.current?.classList.toggle('is-label', !!labelled?.dataset.cursor)
      root.current?.classList.toggle('is-hover', !!interactive && !labelled?.dataset.cursor)
      if (label.current) label.current.textContent = labelled?.dataset.cursor || ''
    }
    const down = () => root.current?.classList.add('is-down')
    const up = () => root.current?.classList.remove('is-down')
    const leave = () => root.current?.classList.add('is-hidden')
    const loop = () => {
      lag.x += (pos.x - lag.x) * 0.16
      lag.y += (pos.y - lag.y) * 0.16
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      if (ring.current) ring.current.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    loop()
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      document.body.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [reduced])

  if (reduced) return null
  return (
    <div className="cursor is-hidden" ref={root} aria-hidden>
      <div ref={ring} style={{ position: 'absolute' }}>
        <div className="cursor__ring">
          <span ref={label} />
        </div>
      </div>
      <div ref={dot} style={{ position: 'absolute' }}>
        <div className="cursor__dot" />
      </div>
    </div>
  )
}
