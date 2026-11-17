import { useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { pointer } from '../../lib/store'
import { radialTexture } from '../../lib/canvasTextures'

const HAND_PATH =
  'M30 14 A8 8 0 0 1 46 14 L46 50 A7 7 0 0 1 60 52 A6.5 6.5 0 0 1 73 57 A6 6 0 0 1 85 63 L85 88 C85 104 74 114 58 114 L46 114 C36 114 30 108 24 100 L10 80 C6 74 12 66 19 70 L30 78 Z'

function useHandGeometry() {
  return useMemo(() => {
    const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${HAND_PATH}"/></svg>`)
    const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p))
    const g = new THREE.ExtrudeGeometry(shapes, {
      depth: 10, bevelEnabled: true, bevelThickness: 4, bevelSize: 3, bevelSegments: 8, curveSegments: 32,
    })
    g.center()
    g.scale(0.0125, -0.0125, -0.0125) // two flips keep winding/normals outward
    g.computeVertexNormals()
    return g
  }, [])
}

/** Glossy 3D app icon: rounded glass-plastic body, extruded hand, glowing signal arcs. Tap it. */
export function AppIcon({ onTap }: { onTap?: () => void }) {
  const group = useRef<THREE.Group>(null)
  const press = useRef<THREE.Group>(null)
  const hand = useRef<THREE.Mesh>(null)
  const arcs = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const shock = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Sprite>(null)
  const hovered = useRef(false)
  const flash = useRef({ v: 0 })
  const { gl } = useThree()
  const handGeo = useHandGeometry()
  const glow = radialTexture()

  const arcColors = ['#ffc552', '#ff9a3d', '#ff6a2b']

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const g = group.current
    if (!g) return
    const k = 1 - Math.pow(0.002, dt)
    const hx = hovered.current ? 1.25 : 1
    g.rotation.y += (-0.32 + pointer.nx * 0.38 * hx - g.rotation.y) * k
    g.rotation.x += (0.1 - pointer.ny * 0.25 * hx - g.rotation.x) * k
    g.position.y = Math.sin(t * 0.8) * 0.08
    g.rotation.z = Math.sin(t * 0.5) * 0.03
    arcs.current.forEach((m, i) => {
      if (!m) return
      const wave = 0.5 + 0.5 * Math.sin(t * 2.4 - i * 0.9)
      m.emissiveIntensity = 1.4 + wave * 1.4 + flash.current.v * (3 - i * 0.4)
    })
    if (halo.current) {
      const s = 7.5 + Math.sin(t * 0.9) * 0.3 + flash.current.v * 2
      halo.current.scale.set(s, s, 1)
      ;(halo.current.material as THREE.SpriteMaterial).opacity = 0.42 + flash.current.v * 0.4
    }
  })

  const tap = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onTap?.()
    if (!press.current || !hand.current) return
    gsap.killTweensOf([press.current.scale, press.current.position, hand.current.position, flash.current])
    gsap.timeline()
      .to(press.current.scale, { x: 0.9, y: 0.9, z: 0.9, duration: 0.12, ease: 'power2.out' }, 0)
      .to(press.current.position, { z: -0.35, duration: 0.12, ease: 'power2.out' }, 0)
      .to(hand.current.position, { z: 0.32, duration: 0.12 }, 0)
      .to(press.current.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'elastic.out(1, 0.35)' }, 0.12)
      .to(press.current.position, { z: 0, duration: 1.1, ease: 'elastic.out(1, 0.35)' }, 0.12)
      .to(hand.current.position, { z: 0.47, duration: 0.8, ease: 'elastic.out(1, 0.4)' }, 0.12)
    gsap.fromTo(flash.current, { v: 1 }, { v: 0, duration: 1.4, ease: 'expo.out' })
    if (shock.current) {
      const m = shock.current.material as THREE.MeshBasicMaterial
      gsap.fromTo(shock.current.scale, { x: 1, y: 1 }, { x: 4.2, y: 4.2, duration: 1.3, ease: 'expo.out' })
      gsap.fromTo(m, { opacity: 0.9 }, { opacity: 0, duration: 1.3, ease: 'power2.out' })
    }
  }

  const over = () => {
    hovered.current = true
    gl.domElement.dataset.cursor = 'Tap'
  }
  const out = () => {
    hovered.current = false
    delete gl.domElement.dataset.cursor
  }

  return (
    <group ref={group}>
      <sprite ref={halo} position={[0, 0, -1.2]} scale={7.5} renderOrder={-1}>
        <spriteMaterial map={glow} color="#6a2cff" transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh ref={shock} position={[0, 0, 0.2]}>
        <ringGeometry args={[1.25, 1.32, 96]} />
        <meshBasicMaterial color="#c9a8ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <group ref={press} onClick={tap} onPointerOver={over} onPointerOut={out}>
        <RoundedBox args={[2.35, 2.35, 0.82]} radius={0.44} smoothness={8} bevelSegments={6} creaseAngle={0.5}>
          <meshPhysicalMaterial
            color="#6431ff"
            roughness={0.2}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.06}
            iridescence={0.55}
            iridescenceIOR={1.35}
            sheen={0.6}
            sheenColor="#c5a6ff"
            emissive="#3a10c0"
            emissiveIntensity={0.4}
            envMapIntensity={1.4}
          />
        </RoundedBox>
        {/* inner face light */}
        <mesh position={[-0.05, -0.05, 0.415]}>
          <planeGeometry args={[2.1, 2.1]} />
          <meshBasicMaterial map={glow} color="#9a6bff" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <mesh ref={hand} geometry={handGeo} position={[-0.3, -0.26, 0.47]} rotation={[0, 0, 0.08]}>
          <meshPhysicalMaterial color="#ffffff" roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} emissive="#e3d6ff" emissiveIntensity={0.18} envMapIntensity={1.2} />
        </mesh>
        <group position={[-0.18, 0.4, 0.5]}>
          {[0.27, 0.47, 0.67].map((r, i) => (
            <group key={r}>
              <mesh>
                <torusGeometry args={[r, 0.062, 20, 72, Math.PI / 2]} />
                <meshStandardMaterial ref={(m) => (arcs.current[i] = m)} color={arcColors[i]} emissive={arcColors[i]} emissiveIntensity={2} roughness={0.3} toneMapped={false} />
              </mesh>
              {[0, Math.PI / 2].map((a) => (
                <mesh key={a} position={[Math.cos(a) * r, Math.sin(a) * r, 0]}>
                  <sphereGeometry args={[0.062, 16, 12]} />
                  <meshStandardMaterial color={arcColors[i]} emissive={arcColors[i]} emissiveIntensity={2.2} toneMapped={false} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      </group>
    </group>
  )
}
