import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useThree, type CanvasProps } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { hasWebGL } from '../../lib/device'
import { useAppState } from '../../lib/store'

/**
 * Reduced-motion mode renders on demand. To let eased state changes (filters, morphs) finish,
 * render a short burst of frames after mount and after any deliberate user input.
 */
function Settle() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let until = 0
    let raf = 0
    const loop = () => {
      invalidate()
      if (performance.now() < until) raf = requestAnimationFrame(loop)
    }
    const burst = (ms: number) => {
      const was = performance.now() < until
      until = Math.max(until, performance.now() + ms)
      if (!was) raf = requestAnimationFrame(loop)
    }
    const onInput = () => burst(1800)
    burst(3000)
    window.addEventListener('pointerdown', onInput)
    window.addEventListener('keydown', onInput)
    window.addEventListener('pointerover', onInput, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointerdown', onInput)
      window.removeEventListener('keydown', onInput)
      window.removeEventListener('pointerover', onInput)
    }
  }, [invalidate])
  return null
}

type Props = {
  children: ReactNode
  className?: string
  camera?: CanvasProps['camera']
  fallback?: ReactNode
  /** Extra margin before the canvas starts rendering as it approaches the viewport. */
  rootMargin?: string
  label?: string
  eventSource?: HTMLElement | React.MutableRefObject<HTMLElement>
  style?: React.CSSProperties
}

/**
 * Shared WebGL host:
 * - pauses the render loop entirely when scrolled out of view (zero GPU cost off-screen)
 * - adapts device pixel ratio to measured frame rate
 * - renders a static CSS fallback when WebGL is unavailable
 * - renders on demand only when the visitor prefers reduced motion
 */
export function SceneCanvas({ children, className = 'scene', camera, fallback, rootMargin = '120px', label, eventSource, style }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const tier = useAppState((s) => s.tier)
  const reduced = useAppState((s) => s.reduced)
  const maxDpr = tier === 'high' ? 1.75 : tier === 'mid' ? 1.4 : 1.1
  const [dpr, setDpr] = useState(maxDpr)
  const [supported] = useState(() => hasWebGL())

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  if (!supported) {
    return (
      <div className={className} style={style} aria-hidden>
        {fallback ?? <div className="scene-fallback" />}
      </div>
    )
  }

  return (
    <div ref={wrap} className={className} style={style} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <Canvas
        dpr={dpr}
        camera={camera ?? { position: [0, 0, 8], fov: 35 }}
        frameloop={!visible ? 'never' : reduced ? 'demand' : 'always'}
        eventSource={eventSource}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false, depth: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.setClearColor(0x000000, 0)
        }}
      >
        <PerformanceMonitor
          bounds={() => [45, 58]}
          flipflops={3}
          onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.15))}
          onFallback={() => setDpr(0.85)}
        />
        {reduced && <Settle />}
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  )
}
