import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { ToneMappingMode } from 'postprocessing'
import { TappylyLogo } from './TappylyLogo'
import { Starfield } from '../common/Starfield'
import { StudioEnv } from '../common/StudioEnv'
import { Effects } from '../common/Effects'
import { glyphTexture, type Glyph } from '../../lib/canvasTextures'
import { pointer, scroll, useAppState } from '../../lib/store'

const CAM = new THREE.Vector3(0, 0.6, 10)

type Placement = { position: [number, number, number]; rotation?: [number, number, number]; depth?: number; speed?: number }

/** Floats its children and drifts them with the cursor; `depth` sets how strongly (nearer = more). */
function Parallax({ position, rotation = [0, 0, 0], depth = 1, speed = 1, children }: Placement & { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const k = 1 - Math.pow(0.01, dt)
    g.position.x += (position[0] + pointer.nx * 0.25 * depth - g.position.x) * k
    g.position.y += (position[1] + pointer.ny * 0.18 * depth - g.position.y) * k
  })
  return (
    <group ref={ref} position={position}>
      <Float speed={1.4 * speed} rotationIntensity={0.5} floatIntensity={0.6} floatingRange={[-0.12, 0.12]}>
        <group rotation={rotation}>{children}</group>
      </Float>
    </group>
  )
}

function GlassCard({ glyph, size = 1, ...placement }: Placement & { glyph: Glyph; size?: number }) {
  const tier = useAppState((s) => s.tier)
  const tex = glyphTexture(glyph)
  return (
    <Parallax {...placement}>
      <RoundedBox args={[size, size, 0.12 * size]} radius={0.14 * size} smoothness={4}>
        {tier === 'low' ? (
          <meshPhysicalMaterial color="#8d6bff" roughness={0.15} metalness={0.1} transparent opacity={0.38} clearcoat={1} envMapIntensity={1.4} />
        ) : (
          <meshPhysicalMaterial
            color="#c4b0ff"
            transmission={1}
            thickness={0.6}
            roughness={0.18}
            ior={1.45}
            attenuationColor="#6b3cff"
            attenuationDistance={1.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={1.5}
          />
        )}
      </RoundedBox>
      <mesh position={[0, 0, 0.07 * size]}>
        <planeGeometry args={[size * 0.62, size * 0.62]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} color={[1.6, 1.5, 2]} />
      </mesh>
    </Parallax>
  )
}

function Rig() {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.02, dt)
    const s = Math.min(1, scroll.y / window.innerHeight)
    const tx = pointer.nx * 0.55
    const ty = CAM.y + pointer.ny * 0.3 - s * 1.2
    const tz = CAM.z - s * 2.5
    camera.position.x += (tx - camera.position.x) * k
    camera.position.y += (ty - camera.position.y) * k
    camera.position.z += (tz - camera.position.z) * k
    look.set(pointer.nx * 0.15, -s * 0.8, 0)
    camera.lookAt(look)
  })
  return null
}

export default function HeroScene() {
  const { size } = useThree()
  const tier = useAppState((s) => s.tier)
  const mobile = size.width < 820
  const icon = useMemo(() => (mobile ? new THREE.Vector3(0.3, 2.0, -1) : new THREE.Vector3(2.75, 0.45, 0)), [mobile])
  const cardScale = mobile ? 0.62 : 1
  const spin = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!spin.current) return
    const s = Math.min(1, scroll.y / window.innerHeight)
    spin.current.rotation.y = s * 0.6
    spin.current.position.y = s * 0.9
  })

  return (
    <>
      <ambientLight intensity={0.25} color="#8a6bff" />
      <pointLight position={[icon.x + 2, icon.y + 3, 4]} intensity={30} color="#d8c8ff" distance={20} />
      <pointLight position={[icon.x - 3, icon.y - 1, 2]} intensity={18} color="#7b3cff" distance={14} />
      <StudioEnv />
      {/* sky, mountains, light river and orbs come from the backdrop image behind the canvas;
          only a light layer of drifting dust is added in 3D for depth */}
      <Starfield count={tier === 'high' ? 420 : 240} depth={[-8, 5]} radius={16} size={0.9} />
      <group position={icon}>
        <group ref={spin} scale={mobile ? 0.66 : 0.86}>
          <TappylyLogo />
        </group>
      </group>
      <group position={icon} scale={cardScale}>
        <GlassCard glyph="code" position={[-1.95, 1.35, 0.5]} rotation={[0.1, 0.35, -0.08]} size={1.05} depth={1.4} />
        <GlassCard glyph="chart" position={[1.75, 1.45, -0.6]} rotation={[0.05, -0.4, 0.06]} size={1.0} depth={0.8} speed={0.8} />
        <GlassCard glyph="spark" position={[-1.9, -0.1, 1.7]} rotation={[0.05, 0.45, 0.1]} size={0.5} depth={2.4} speed={1.5} />
      </group>
      <Rig />
      {/* neutral grading keeps the logo's brand colours true (ACES shifts purple toward blue) */}
      <Effects bloom={0.9} threshold={0.3} vignette={0} toneMapping={ToneMappingMode.NEUTRAL} />
    </>
  )
}
