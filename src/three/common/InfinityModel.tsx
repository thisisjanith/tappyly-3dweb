import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { MODELS, SafeBrandModel } from './BrandModel'

useGLTF.preload(MODELS.infinity)

/** The client's 3D infinity symbol (public/models/infinity.glb): slow sway, gentle float and cursor tilt. */
export function InfinityModel({ size, fallback = null }: { size: number; fallback?: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    const k = 1 - Math.pow(0.02, dt)
    g.rotation.y += (Math.sin(t * 0.35) * 0.5 + state.pointer.x * 0.35 - g.rotation.y) * k
    g.rotation.x += (0.15 + Math.cos(t * 0.3) * 0.08 - state.pointer.y * 0.2 - g.rotation.x) * k
    g.position.y = Math.sin(t * 0.8) * size * 0.025
  })
  return (
    <group ref={ref} rotation={[0.15, 0, -0.08]}>
      <SafeBrandModel url={MODELS.infinity} size={size} fit="width" name="infinity" fallback={fallback} />
    </group>
  )
}
