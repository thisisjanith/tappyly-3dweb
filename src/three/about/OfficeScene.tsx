import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshReflectorMaterial, Sparkles, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Effects } from '../common/Effects'
import { StudioEnv } from '../common/StudioEnv'
import { neonSignTexture } from '../../lib/canvasTextures'
import { pointer, useAppState } from '../../lib/store'

const cityFrag = /* glsl */ `
uniform float uTime; varying vec2 vUv;
float hash(float n){ return fract(sin(n)*43758.5453123); }
float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
vec3 layer(vec2 uv, float cols, float seed, float hMin, float hMax, vec3 body, float lit){
  float cell = floor(uv.x*cols);
  float h = hMin + hash(cell + seed)*(hMax-hMin);
  if (uv.y > h) return vec3(-1.0);
  vec2 win = vec2(uv.x*cols*6.0, uv.y*90.0);
  vec2 f = fract(win); vec2 id = floor(win);
  float isWin = step(0.25, f.x)*step(f.x, 0.75)*step(0.3, f.y)*step(f.y, 0.75);
  float on = step(1.0 - lit, hash2(id + seed));
  float flick = 0.85 + 0.15*sin(uTime*2.0 + hash2(id)*30.0);
  vec3 wc = mix(vec3(0.75,0.55,1.0), vec3(1.0,0.75,0.45), hash2(id+3.0));
  return body + wc * isWin * on * flick * 0.9;
}
void main(){
  vec2 uv = vUv;
  vec3 sky = mix(vec3(0.25,0.1,0.55), vec3(0.05,0.02,0.16), smoothstep(0.1, 0.9, uv.y));
  sky += vec3(0.6,0.25,0.7) * exp(-pow((uv.y-0.18)*6.0, 2.0)) * 0.5;
  vec3 col = sky;
  vec3 far = layer(uv, 34.0, 11.0, 0.18, 0.42, vec3(0.13,0.06,0.3), 0.25);
  if (far.x >= 0.0) col = far;
  vec3 near = layer(uv, 14.0, 3.0, 0.1, 0.62, vec3(0.05,0.02,0.12), 0.35);
  if (near.x >= 0.0) col = near;
  gl_FragColor = vec4(col, 1.0);
}`

function City() {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  useFrame((s) => mat.current && (mat.current.uniforms.uTime.value = s.clock.elapsedTime))
  return (
    <mesh position={[0, 2.3, -6.4]}>
      <planeGeometry args={[18, 6]} />
      <shaderMaterial ref={mat} uniforms={uniforms} toneMapped={false} vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`} fragmentShader={cityFrag} />
    </mesh>
  )
}

const WALL = '#0e0726'
const DARK = '#140a33'

function Desk({ position, rot = 0 }: { position: [number, number, number]; rot?: number }) {
  const screen = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128; c.height = 80
    const x = c.getContext('2d')!
    const g = x.createLinearGradient(0, 0, 128, 80)
    g.addColorStop(0, '#3a1aa8'); g.addColorStop(1, '#8a4dff')
    x.fillStyle = g; x.fillRect(0, 0, 128, 80)
    x.fillStyle = 'rgba(255,255,255,0.55)'
    for (let i = 0; i < 4; i++) x.fillRect(12, 14 + i * 14, 40 + Math.random() * 50, 5)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <group position={position} rotation-y={rot}>
      <RoundedBox args={[1.7, 0.06, 0.85]} radius={0.02} position={[0, 0.76, 0]}>
        <meshStandardMaterial color="#cfc6ea" roughness={0.35} metalness={0.1} />
      </RoundedBox>
      {[-0.78, 0.78].map((x) => (
        <mesh key={x} position={[x, 0.38, 0]}>
          <boxGeometry args={[0.05, 0.76, 0.75]} />
          <meshStandardMaterial color="#2a1a5a" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <group position={[0, 1.08, -0.22]}>
        <mesh>
          <boxGeometry args={[0.72, 0.44, 0.03]} />
          <meshStandardMaterial color="#0a0418" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.017]}>
          <planeGeometry args={[0.68, 0.4]} />
          <meshBasicMaterial map={screen} toneMapped={false} color={[1.3, 1.3, 1.5]} />
        </mesh>
        <mesh position={[0, -0.28, 0]}>
          <boxGeometry args={[0.05, 0.14, 0.05]} />
          <meshStandardMaterial color="#2a1a5a" />
        </mesh>
      </group>
      <group position={[0, 0, 0.75]}>
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[0.5, 0.07, 0.5]} />
          <meshStandardMaterial color="#1c0f45" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.82, 0.24]}>
          <boxGeometry args={[0.5, 0.62, 0.06]} />
          <meshStandardMaterial color="#1c0f45" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.46]} />
          <meshStandardMaterial color="#2a1a5a" metalness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + Math.random() * 0.4
        const tilt = 0.35 + Math.random() * 0.55
        return { a, tilt, h: 0.6 + Math.random() * 0.7 }
      }),
    [],
  )
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.26, 0.2, 0.5, 24]} />
        <meshStandardMaterial color="#1d1240" roughness={0.4} metalness={0.2} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.48, 0]} rotation={[Math.sin(l.a) * l.tilt, 0, -Math.cos(l.a) * l.tilt]}>
          <mesh position={[0, l.h * 0.5, 0]} scale={[1, l.h * 5.5, 0.3]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color={i % 3 ? '#2b6a4c' : '#24583f'} emissive="#0d2b20" roughness={0.55} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Pendant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 1.4]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.08, 0.32, 0.26, 32, 1, true]} />
        <meshStandardMaterial color="#1a0f3a" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.12, 0]} rotation-x={Math.PI / 2}>
        <circleGeometry args={[0.3, 32]} />
        <meshBasicMaterial color={[3, 2.6, 3.4]} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Rig() {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(1.5, 1.55, -2.2), [])
  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.03, dt)
    const t = state.clock.elapsedTime
    camera.position.x += (-2.1 + pointer.nx * 0.7 + Math.sin(t * 0.1) * 0.3 - camera.position.x) * k
    camera.position.y += (1.75 + pointer.ny * 0.3 - camera.position.y) * k
    camera.position.z += (6.6 + Math.cos(t * 0.12) * 0.25 - camera.position.z) * k
    camera.lookAt(look)
  })
  return null
}

export default function OfficeScene() {
  const tier = useAppState((s) => s.tier)
  const loaded = useAppState((s) => s.loaded)
  const sign = useMemo(() => (loaded ? neonSignTexture() : null), [loaded])
  return (
    <>
      <color attach="background" args={['#07031a']} />
      <fog attach="fog" args={['#0a0424', 8, 22]} />
      <StudioEnv warm={0.4} />
      <ambientLight intensity={0.35} color="#7b5cff" />
      <pointLight position={[-1.5, 3.4, -0.5]} intensity={6} color="#efe6ff" distance={7} />
      <pointLight position={[2, 3.4, -2.5]} intensity={6} color="#efe6ff" distance={7} />
      <pointLight position={[5.2, 2.4, -1.4]} intensity={10} color="#8a4dff" distance={6} />
      <directionalLight position={[0, 4, -8]} intensity={1.2} color="#9a7bff" />

      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -1]}>
        <planeGeometry args={[14, 12]} />
        {tier === 'low' ? (
          <meshStandardMaterial color="#120a2c" roughness={0.3} metalness={0.5} />
        ) : (
          <MeshReflectorMaterial
            blur={[300, 80]}
            resolution={tier === 'high' ? 1024 : 512}
            mixBlur={1}
            mixStrength={3}
            roughness={0.75}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#120a2c"
            metalness={0.6}
            mirror={0.6}
          />
        )}
      </mesh>

      {/* back wall with windows onto the city */}
      <City />
      <group position={[0, 0, -5.4]}>
        <mesh position={[0, 0.4, 0]}><boxGeometry args={[12.4, 0.8, 0.3]} /><meshStandardMaterial color={WALL} /></mesh>
        <mesh position={[0, 4.05, 0]}><boxGeometry args={[12.4, 1.1, 0.3]} /><meshStandardMaterial color={WALL} /></mesh>
        {[-6, -3, 0, 3, 6].map((x) => (
          <mesh key={x} position={[x, 2.15, 0]}><boxGeometry args={[0.16, 2.7, 0.24]} /><meshStandardMaterial color={DARK} metalness={0.6} roughness={0.4} /></mesh>
        ))}
        <mesh position={[0, 2.2, 0]}><boxGeometry args={[12, 0.06, 0.2]} /><meshStandardMaterial color={DARK} metalness={0.6} /></mesh>
      </group>
      {/* side walls + ceiling */}
      <mesh position={[-6.2, 2.25, -1]} rotation-y={Math.PI / 2}><planeGeometry args={[12, 4.5]} /><meshStandardMaterial color={WALL} roughness={0.85} /></mesh>
      <mesh position={[6.2, 2.25, -1]} rotation-y={-Math.PI / 2}><planeGeometry args={[12, 4.5]} /><meshStandardMaterial color="#120936" roughness={0.6} /></mesh>
      <mesh position={[0, 4.5, -1]} rotation-x={Math.PI / 2}><planeGeometry args={[12.4, 12]} /><meshStandardMaterial color="#0a0420" /></mesh>
      {[-3, 0, 3].map((x) => (
        <mesh key={x} position={[x, 4.48, -1.5]}>
          <boxGeometry args={[0.06, 0.02, 7]} />
          <meshBasicMaterial color={[1.6, 1.3, 2.4]} toneMapped={false} />
        </mesh>
      ))}
      {/* neon sign on the right wall */}
      {sign && (
        <group position={[6.15, 2.45, -1.6]} rotation-y={-Math.PI / 2}>
          <mesh>
            <planeGeometry args={[3.4, 1.06]} />
            <meshBasicMaterial map={sign} transparent toneMapped={false} color={[1.8, 1.6, 2.2]} depthWrite={false} />
          </mesh>
        </group>
      )}
      <mesh position={[6.1, 0.06, -1]}>
        <boxGeometry args={[0.04, 0.04, 12]} />
        <meshBasicMaterial color={[1.4, 0.8, 3]} toneMapped={false} />
      </mesh>

      <Desk position={[-1.8, 0, -1.2]} />
      <Desk position={[0.4, 0, -1.2]} />
      <Desk position={[-1.8, 0, -3.3]} />
      <Desk position={[0.4, 0, -3.3]} />
      <Desk position={[2.8, 0, -3.3]} />
      <Pendant position={[-1.6, 3.1, -1.4]} />
      <Pendant position={[0.6, 3.1, -1.4]} />
      <Pendant position={[1.6, 3.1, -3.4]} />
      <Plant position={[-5.2, 0, -4.4]} scale={1.6} />
      <Plant position={[4.9, 0, -4.4]} scale={1.3} />
      <Plant position={[4.6, 0, 0.6]} scale={1.1} />
      <Sparkles count={tier === 'low' ? 30 : 70} scale={[10, 4, 8]} position={[0, 2, -1]} size={1.6} speed={0.2} color="#d6c3ff" opacity={0.6} />
      <Rig />
      <Effects bloom={0.85} threshold={0.6} aberration={0.0004} vignette={0.6} />
    </>
  )
}
