import { useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { pointer } from '../../lib/store'
import { radialTexture } from '../../lib/canvasTextures'
import { AppIcon } from './AppIcon'
import { MODELS, SafeBrandModel } from '../common/BrandModel'

/** Optimised copy of src/assests/tappylylogo3d.glb (WebP textures, same geometry). */
export const LOGO_URL = MODELS.logo
useGLTF.preload(LOGO_URL)

/** Target on-screen size in world units (the old procedural icon was ~2 units across). */
const SIZE = 2.15

/** The client's 3D logo, with hover tilt, idle float and a tap (press + shockwave + glow) interaction. */
export function TappylyLogo() {
  const group = useRef<THREE.Group>(null)
  const press = useRef<THREE.Group>(null)
  const shock = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Sprite>(null)
  const hovered = useRef(false)
  const flash = useRef({ v: 0 })
  const { gl } = useThree()
  const glow = radialTexture()

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const k = 1 - Math.pow(0.002, dt)
    const hx = hovered.current ? 1.25 : 1
    g.rotation.y += (-0.32 + pointer.nx * 0.38 * hx - g.rotation.y) * k
    g.rotation.x += (0.08 - pointer.ny * 0.25 * hx - g.rotation.x) * k
    g.position.y = Math.sin(t * 0.8) * 0.08
    g.rotation.z = Math.sin(t * 0.5) * 0.03
    if (halo.current) {
      const s = 7 + Math.sin(t * 0.9) * 0.3 + flash.current.v * 2
      halo.current.scale.set(s, s, 1)
      ;(halo.current.material as THREE.SpriteMaterial).opacity = 0.35 + flash.current.v * 0.45
    }
  })

  const tap = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const p = press.current
    if (!p) return
    gsap.killTweensOf([p.scale, p.position, flash.current])
    gsap.timeline()
      .to(p.scale, { x: 0.9, y: 0.9, z: 0.9, duration: 0.12, ease: 'power2.out' }, 0)
      .to(p.position, { z: -0.35, duration: 0.12, ease: 'power2.out' }, 0)
      .to(p.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'elastic.out(1, 0.35)' }, 0.12)
      .to(p.position, { z: 0, duration: 1.1, ease: 'elastic.out(1, 0.35)' }, 0.12)
    gsap.fromTo(flash.current, { v: 1 }, { v: 0, duration: 1.4, ease: 'expo.out' })
    if (shock.current) {
      const m = shock.current.material as THREE.MeshBasicMaterial
      gsap.fromTo(shock.current.scale, { x: 1, y: 1 }, { x: 4.2, y: 4.2, duration: 1.3, ease: 'expo.out' })
      gsap.fromTo(m, { opacity: 0.9 }, { opacity: 0, duration: 1.3, ease: 'power2.out' })
    }
  }

  const over = () => {
    hovered.current = true
    gl.domElement.style.cursor = 'pointer'
  }
  const out = () => {
    hovered.current = false
    gl.domElement.style.cursor = ''
  }

  return (
    <group ref={group}>
      <sprite ref={halo} position={[0, 0, -1.2]} scale={7} renderOrder={-1}>
        <spriteMaterial map={glow} color="#6a2cff" transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh ref={shock} position={[0, 0, 0.2]}>
        <ringGeometry args={[1.25, 1.32, 96]} />
        <meshBasicMaterial color="#c9a8ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <group ref={press} onClick={tap} onPointerOver={over} onPointerOut={out}>
        <SafeBrandModel url={LOGO_URL} size={SIZE} name="logo" fallback={<AppIcon />} />
      </group>
    </group>
  )
}
