import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ProjectPanel, type PanelHandle } from './ProjectPanel'
import { PROJECTS, type Project } from '../../data/content'
import { Effects } from '../common/Effects'
import { Starfield } from '../common/Starfield'
import { useAppState } from '../../lib/store'

const ITEMS = PROJECTS.slice(0, 6)

/** Coverflow of project panels. `index` is controlled by the DOM arrows; drag also scrubs it. */
export default function CarouselScene({ index, onIndex, onSelect }: { index: number; onIndex: (i: number) => void; onSelect: (p: Project) => void }) {
  const loaded = useAppState((s) => s.loaded)
  const panels = useRef<(PanelHandle | null)[]>([])
  const cur = useRef(index)
  const { size, gl } = useThree()
  const mobile = size.width < 700
  const drag = useRef({ on: false, x: 0, delta: 0 })
  const pos = useRef(new THREE.Vector3())
  const rot = useRef(new THREE.Euler())

  useEffect(() => {
    const el = gl.domElement
    const d = drag.current
    const down = (e: PointerEvent) => { d.on = true; d.x = e.clientX; d.delta = 0 }
    const move = (e: PointerEvent) => { if (d.on) d.delta = (e.clientX - d.x) / (size.width * 0.35) }
    const up = () => {
      if (!d.on) return
      d.on = false
      if (Math.abs(d.delta) > 0.15) onIndex(index - Math.sign(d.delta))
      d.delta = 0
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [gl, index, onIndex, size.width])

  useFrame((state, dt) => {
    const target = index - drag.current.delta
    cur.current += (target - cur.current) * (1 - Math.pow(0.003, dt))
    const n = ITEMS.length
    ITEMS.forEach((_, i) => {
      let o = i - cur.current
      o = ((o % n) + n + n / 2) % n - n / 2 // wrap to [-n/2, n/2)
      const ao = Math.abs(o)
      const spread = mobile ? 2.3 : 4.1
      pos.current.set(o * spread - Math.sign(o) * Math.max(0, ao - 1) * spread * 0.25, Math.sin(state.clock.elapsedTime * 0.6 + i) * 0.05, -ao * 2.2)
      rot.current.set(0.04, -Math.sign(o) * Math.min(ao, 1) * 0.5, 0)
      panels.current[i]?.setTarget({ pos: pos.current, rot: rot.current, scale: 1.06 - Math.min(ao, 1) * 0.2, alpha: ao > 1.6 ? 0 : 1, dim: Math.min(1, ao * 0.45) })
    })
  })

  if (!loaded) return null
  return (
    <>
      <Starfield count={300} depth={[-12, -2]} radius={14} size={0.8} />
      <group position={[0, 0.1, 0]}>
        {ITEMS.map((p, i) => (
          <ProjectPanel key={p.id} ref={(r) => (panels.current[i] = r)} project={p} width={mobile ? 2.6 : 4.2} bend={0.08} onSelect={onSelect} />
        ))}
      </group>
      <Effects bloom={0.6} threshold={0.75} aberration={0.0004} vignette={0} />
    </>
  )
}
