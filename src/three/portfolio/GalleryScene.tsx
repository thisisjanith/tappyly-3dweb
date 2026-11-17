import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ProjectPanel, type PanelHandle } from './ProjectPanel'
import { PROJECTS, type Project } from '../../data/content'
import { Effects } from '../common/Effects'
import { Starfield } from '../common/Starfield'
import { Nebula } from '../common/Nebula'
import { pointer, scroll, useAppState } from '../../lib/store'

/** Tilted isometric wall of projects. Filtering flies non-matching panels away and re-flows the rest. */
export default function GalleryScene({ filter, onSelect }: { filter: string; onSelect: (p: Project) => void }) {
  const loaded = useAppState((s) => s.loaded)
  const panels = useRef<(PanelHandle | null)[]>([])
  const wall = useRef<THREE.Group>(null)
  const { size, viewport } = useThree()
  const mobile = size.width < 820
  const v = new THREE.Vector3()
  const e = new THREE.Euler()

  const cols = mobile ? 2 : 3
  const areaW = mobile ? viewport.width * 0.88 : viewport.width * 0.52
  const gap = mobile ? 0.25 : 0.4
  const w = Math.min(3, (areaW - gap * (cols - 1)) / cols)
  const h = w / 1.6

  useFrame((state, dt) => {
    const visible = PROJECTS.filter((p) => filter === 'All' || p.category === filter)
    const rows = Math.ceil(visible.length / cols)
    PROJECTS.forEach((p, i) => {
      const k = visible.indexOf(p)
      if (k === -1) {
        v.set(((i % 3) - 1) * 4, -9 - (i % 2) * 2, -6)
        e.set(-0.8, 0.4 * ((i % 2) * 2 - 1), 0.3)
        panels.current[i]?.setTarget({ pos: v, rot: e, scale: 0.6, alpha: 0, dim: 1 })
        return
      }
      const c = k % cols
      const r = Math.floor(k / cols)
      const rowCount = Math.min(cols, visible.length - r * cols)
      v.set((c - (rowCount - 1) / 2) * (w + gap), ((rows - 1) / 2 - r) * (h + gap), Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.06)
      e.set(0, 0, 0)
      panels.current[i]?.setTarget({ pos: v, rot: e, scale: 1, alpha: 1, dim: 0 })
    })
    const g = wall.current
    if (g) {
      const kk = 1 - Math.pow(0.02, dt)
      const s = Math.min(1, scroll.y / size.height)
      g.rotation.x += (-0.32 + pointer.ny * 0.08 + s * 0.25 - g.rotation.x) * kk
      g.rotation.y += ((mobile ? 0.12 : -0.38) + pointer.nx * 0.12 - g.rotation.y) * kk
      g.rotation.z += ((mobile ? 0.06 : 0.12) - g.rotation.z) * kk
    }
  })

  return (
    <>
      <Nebula z={-30} scale={90} intensity={0.45} />
      <Starfield count={700} depth={[-25, 2]} />
      {loaded && (
        <group position={mobile ? [0, -2.6, 0] : [viewport.width * 0.15, -0.55, 0]}>
          <group ref={wall}>
            {PROJECTS.map((p, i) => (
              <ProjectPanel key={p.id} ref={(r) => (panels.current[i] = r)} project={p} width={w} onSelect={onSelect} />
            ))}
          </group>
        </group>
      )}
      <Effects bloom={0.7} threshold={0.7} aberration={0.0005} />
    </>
  )
}
