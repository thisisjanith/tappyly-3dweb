import { useEffect, useRef } from 'react'
import { pointer, scroll, getState } from '../lib/store'

/**
 * Full-bleed image layer behind the hero canvas. Drifts gently with the cursor and
 * sinks/zooms on scroll so the 2D artwork feels like part of the 3D space.
 */
type Props = {
  src: string
  /** CSS background-position: which part of the artwork stays in frame when cropped */
  position?: string
  mobilePosition?: string
  /** resting zoom; lower keeps more of the image edges in frame (parallax needs a little overscan) */
  zoom?: number
  /** on phones, pin the artwork to the top half and let the copy sit below it */
  mobileTop?: boolean
}

export function HeroBackdrop({ src, position = '62% 60%', mobilePosition = '68% 60%', zoom = 1.08, mobileTop = false }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || getState().reduced) return
    const cur = { x: 0, y: 0 }
    let raf = 0
    const loop = () => {
      cur.x += (pointer.nx * -14 - cur.x) * 0.05
      cur.y += (pointer.ny * 10 - cur.y) * 0.05
      const s = Math.min(1, scroll.y / window.innerHeight)
      el.style.transform = `translate3d(${cur.x}px, ${cur.y + s * 120}px, 0) scale(${zoom + s * 0.06})`
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [zoom])
  return (
    <div className={`hero__backdrop ${mobileTop ? 'hero__backdrop--top-m' : ''}`} aria-hidden>
      <div
        ref={ref}
        className="hero__backdrop-img"
        style={{ backgroundImage: `url(${src})`, transform: `scale(${zoom})`, ['--bg-pos' as string]: position, ['--bg-pos-m' as string]: mobilePosition }}
      />
    </div>
  )
}
