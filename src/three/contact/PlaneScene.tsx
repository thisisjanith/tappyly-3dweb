import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Trail, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { Effects } from '../common/Effects'
import { StudioEnv } from '../common/StudioEnv'
import { pointer, useAppState, SEND_EVENT } from '../../lib/store'



function usePlaneGeometry() {
  return useMemo(() => {
    const N = [1.25, 0, 0], T = [-0.8, 0.02, 0], L = [-0.95, 0.16, 0.8], Rw = [-0.95, 0.16, -0.8], K = [-0.7, -0.32, 0], C = [0.2, 0.0, 0]
    const tri = (a: number[], b: number[], c: number[]) => [...a, ...b, ...c]
    const pos = new Float32Array([...tri(N, L, T), ...tri(N, T, Rw), ...tri(C, T, K), ...tri(N, C, K)])
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.computeVertexNormals()
    return g
  }, [])
}

function PaperPlane() {
  const ref = useRef<THREE.Group>(null)
  const geo = usePlaneGeometry()
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 1), [geo])
  const { viewport } = useThree()
  const vel = useMemo(() => new THREE.Vector3(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const prev = useMemo(() => new THREE.Vector3(), [])
  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const roll = useMemo(() => new THREE.Quaternion(), [])
  const launch = useRef(-1)

  useEffect(() => {
    const go = () => (launch.current = 0)
    window.addEventListener(SEND_EVENT, go)
    return () => window.removeEventListener(SEND_EVENT, go)
  }, [])

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    const wide = viewport.width > 9
    const cx = wide ? viewport.width * 0.22 : 0
    const cy = wide ? 0.2 : viewport.height * 0.22
    if (launch.current >= 0) {
      launch.current += dt
      const p = launch.current
      if (p < 0.6) {
        // loop-the-loop
        const a = p / 0.6 * Math.PI * 2
        target.set(g.position.x + Math.cos(a) * 0.4, g.position.y + Math.sin(a) * 0.6 + 0.05, g.position.z)
      } else if (p < 2.0) target.set(viewport.width * 0.9, viewport.height * 0.8, -6)
      else if (p < 2.05) {
        g.position.set(-viewport.width * 0.9, -viewport.height * 0.4, -2)
        prev.copy(g.position)
      } else target.set(cx, cy, 0)
      if (p > 3.2) launch.current = -1
    } else {
      // chase the cursor across the whole viewport, with a lazy figure-eight drift on top
      target.set(
        pointer.nx * viewport.width * 0.42 + Math.sin(t * 0.45) * 1.2,
        pointer.ny * viewport.height * 0.38 + Math.sin(t * 0.9) * 0.5,
        1 + Math.cos(t * 0.45) * 1.2,
      )
    }
    const k = 1 - Math.pow(launch.current > 0.6 ? 0.25 : 0.12, dt)
    prev.copy(g.position)
    g.position.lerp(target, k)
    vel.subVectors(g.position, prev)
    if (vel.lengthSq() > 1e-7) {
      const dir = vel.clone().normalize()
      m.lookAt(new THREE.Vector3(), dir.clone().negate(), new THREE.Vector3(0, 1, 0))
      q.setFromRotationMatrix(m)
      // geometry points +x; lookAt aligns -z → rotate so +x faces forward
      q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2))
      const bank = THREE.MathUtils.clamp(-vel.x * 6 * Math.sign(dir.x || 1) + vel.y * 2, -1, 1)
      roll.setFromAxisAngle(new THREE.Vector3(1, 0, 0), bank * 0.9)
      q.multiply(roll)
      g.quaternion.slerp(q, 1 - Math.pow(0.02, dt))
    }
  })

  return (
    <Trail width={1.6} length={7} color="#9a6bff" attenuation={(w) => w * w} decay={1.2}>
      <group ref={ref} scale={0.75}>
        <mesh geometry={geo}>
          <meshStandardMaterial color="#f3edff" emissive="#6b3cff" emissiveIntensity={0.25} roughness={0.35} metalness={0.05} flatShading side={THREE.DoubleSide} envMapIntensity={1.2} />
        </mesh>
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={[2.2, 1.8, 3]} toneMapped={false} />
        </lineSegments>
      </group>
    </Trail>
  )
}

export default function PlaneScene() {
  const tier = useAppState((s) => s.tier)
  return (
    <>
      <StudioEnv />
      <ambientLight intensity={0.5} color="#b9a2ff" />
      <directionalLight position={[3, 5, 4]} intensity={2} color="#ffffff" />
      {/* sky, globe and mountains come from the backdrop image; just a few drifting sparkles in 3D */}
      <Sparkles count={tier === 'low' ? 20 : 40} scale={[14, 7, 6]} size={1.8} speed={0.3} color="#c9a8ff" opacity={0.7} />
      <PaperPlane />
      <Effects bloom={1.0} threshold={0.35} vignette={0} />
    </>
  )
}
