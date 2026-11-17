import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { simplex3, curl } from '../../lib/glsl'
import { Effects } from '../common/Effects'
import { Starfield } from '../common/Starfield'
import { getState, useAppState } from '../../lib/store'

type V = [number, number, number]
const R = Math.random
const gauss = () => (R() + R() + R() - 1.5) / 1.5

/* ---------- procedural point-cloud forms ---------- */
function galaxy(): V {
  const arm = Math.floor(R() * 3)
  const r = Math.pow(R(), 1.3) * 2.9
  const a = (arm / 3) * Math.PI * 2 + r * 1.6 + gauss() * 0.4
  const x = Math.cos(a) * r, y = gauss() * 0.25 * (1.2 - r / 2.9), z = Math.sin(a) * r
  const tilt = 1.05 // lean the disc toward the camera
  return [x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)]
}
function rectEdgeOrFill(w: number, h: number, edge: number): [number, number] {
  if (R() < edge) {
    const s = R() * 2 * (w + h)
    if (s < w) return [s - w / 2, -h / 2]
    if (s < 2 * w) return [s - w - w / 2, h / 2]
    if (s < 2 * w + h) return [-w / 2, s - 2 * w - h / 2]
    return [w / 2, s - 2 * w - h - h / 2]
  }
  return [(R() - 0.5) * w, (R() - 0.5) * h]
}
function laptop(): V {
  if (R() < 0.55) {
    const [x, y] = rectEdgeOrFill(3.4, 2.15, 0.35)
    const yy = y + 1.075
    const tilt = -0.28
    return [x, yy * Math.cos(tilt) - 0.9, -1.1 + yy * Math.sin(tilt)]
  }
  const [x, z] = rectEdgeOrFill(3.6, 2.3, 0.3)
  const key = R() < 0.5 ? Math.round(x * 5) / 5 : x
  return [key, -0.95 + (R() < 0.1 ? 0.04 : 0), z + 0.05]
}
function megaphone(): V {
  const u = R()
  if (u < 0.62) {
    const t = R()
    const x = -1.1 + t * 2.3
    const r = 0.3 + t * t * 0.95
    const a = R() * Math.PI * 2
    return [x - 0.3, Math.cos(a) * r, Math.sin(a) * r]
  }
  if (u < 0.72) {
    const a = R() * Math.PI * 2
    return [-1.75 + R() * 0.4 - 0.3, Math.cos(a) * 0.22, Math.sin(a) * 0.22]
  }
  if (u < 0.8) return [-0.8 + (R() - 0.5) * 0.25 - 0.3, -0.35 - R() * 0.9, (R() - 0.5) * 0.25]
  const ring = Math.floor(R() * 3)
  const rad = 1.0 + ring * 0.45
  const a = (R() - 0.5) * 1.3
  return [1.0 + Math.cos(a) * rad * 0.6, Math.sin(a) * rad, gauss() * 0.05]
}
const cubeDefs = [
  { p: [-0.95, -0.55, 0], s: 1.25, r: [0.3, 0.6, 0.1] },
  { p: [0.85, -0.45, 0.3], s: 1.0, r: [0.5, -0.4, 0.2] },
  { p: [0.0, 0.85, -0.2], s: 0.9, r: [-0.4, 0.8, -0.3] },
]
const cubeMats = cubeDefs.map((c) => new THREE.Matrix4().compose(new THREE.Vector3(...(c.p as V)), new THREE.Quaternion().setFromEuler(new THREE.Euler(...(c.r as V))), new THREE.Vector3(c.s, c.s, c.s)))
const tmp = new THREE.Vector3()
function cubes(): V {
  const i = Math.floor(R() * 3)
  const face = Math.floor(R() * 6)
  const axis = face % 3
  const sign = face < 3 ? -0.5 : 0.5
  let a = R() - 0.5
  let b = R() - 0.5
  if (R() < 0.4) { if (R() < 0.5) a = Math.sign(a) * 0.5; else b = Math.sign(b) * 0.5 }
  const v: V = axis === 0 ? [sign, a, b] : axis === 1 ? [a, sign, b] : [a, b, sign]
  tmp.set(...v).applyMatrix4(cubeMats[i])
  return [tmp.x, tmp.y, tmp.z]
}
function magnifier(): V {
  const u = R()
  const cx = -0.35, cy = 0.4
  if (u < 0.55) {
    const a = R() * Math.PI * 2
    const b = R() * Math.PI * 2
    const r = 1.15 + Math.cos(b) * 0.13
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.sin(b) * 0.13]
  }
  if (u < 0.7) {
    const r = Math.sqrt(R()) * 1.0
    const a = R() * Math.PI * 2
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, gauss() * 0.03]
  }
  const t = R()
  const a = R() * Math.PI * 2
  const d = 1.3 + t * 1.5
  const dir = -Math.PI / 4
  const px = cx + Math.cos(dir) * d
  const py = cy + Math.sin(dir) * d
  return [px + Math.cos(a) * 0.17 * Math.sin(dir), py - Math.cos(a) * 0.17 * Math.cos(dir), Math.sin(a) * 0.17]
}

const FORMS = [galaxy, laptop, megaphone, cubes, magnifier]

const vert = /* glsl */ `
${simplex3}
${curl}
uniform float uTime; uniform float uW[5]; uniform float uChaos; uniform vec3 uMouse; uniform float uPixel; uniform float uSize;
attribute vec3 aP1; attribute vec3 aP2; attribute vec3 aP3; attribute vec3 aP4; attribute vec4 aRand;
varying vec3 vColor; varying float vAlpha;
void main(){
  vec3 p = position*uW[0] + aP1*uW[1] + aP2*uW[2] + aP3*uW[3] + aP4*uW[4];
  float t = uTime*0.12;
  vec3 flow = curlNoise(p*0.35 + vec3(t, t*0.7, aRand.w));
  p += flow * (0.05 + uChaos * 1.8 * aRand.z);
  p += vec3(sin(uTime*0.8 + aRand.x*30.0), cos(uTime*0.7 + aRand.y*30.0), 0.0) * 0.02;
  vec3 d = p - uMouse;
  float f = exp(-dot(d,d)*0.9);
  p += normalize(d + 0.0001) * f * 0.9;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float s = mix(0.6, 2.2, pow(aRand.y, 3.0));
  gl_PointSize = uSize * s * uPixel * (10.0 / -mv.z) * (1.0 + f*1.5);
  vec3 a = vec3(0.42, 0.22, 1.0); vec3 b = vec3(0.78, 0.6, 1.0); vec3 c = vec3(1.0, 0.55, 0.25);
  vColor = mix(a, b, aRand.x);
  vColor = mix(vColor, c, smoothstep(0.86, 1.0, aRand.z) * 0.9);
  vColor += f * vec3(0.8, 0.6, 1.0);
  vAlpha = 0.55 + 0.45*aRand.y;
}`

const frag = /* glsl */ `
varying vec3 vColor; varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a = pow(a, 1.8) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor * 1.6, a);
}`

export function Particles({ shape }: { shape: number }) {
  const tier = useAppState((s) => s.tier)
  const count = tier === 'high' ? 16000 : tier === 'mid' ? 10000 : 5000
  const mat = useRef<THREE.ShaderMaterial>(null)
  const group = useRef<THREE.Group>(null)
  const weights = useRef([1, 0, 0, 0, 0])
  const mouseWorld = useMemo(() => new THREE.Vector3(99, 99, 99), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const { camera } = useThree()

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    FORMS.forEach((fn, k) => {
      const arr = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) arr.set(fn(), i * 3)
      g.setAttribute(k === 0 ? 'position' : `aP${k}`, new THREE.BufferAttribute(arr, 3))
    })
    const rand = new Float32Array(count * 4)
    for (let i = 0; i < count * 4; i++) rand[i] = R()
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 4))
    return g
  }, [count])

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uW: { value: [1, 0, 0, 0, 0] }, uChaos: { value: 0 }, uMouse: { value: mouseWorld }, uPixel: { value: 1 }, uSize: { value: 1.5 } }),
    [mouseWorld],
  )

  useFrame((state, dt) => {
    const u = mat.current?.uniforms
    const g = group.current
    if (!u || !g) return
    const k = 1 - Math.pow(getState().reduced ? 0 : 0.12, dt)
    const w = weights.current
    for (let i = 0; i < 5; i++) w[i] += ((i === shape ? 1 : 0) - w[i]) * k
    const sum = w.reduce((a, b) => a + b, 0)
    u.uW.value = w.map((x) => x / sum)
    u.uChaos.value = 1 - Math.max(...w) / sum
    u.uTime.value = state.clock.elapsedTime
    u.uPixel.value = state.gl.getPixelRatio()
    g.rotation.y = state.clock.elapsedTime * 0.08 + state.pointer.x * 0.4
    g.rotation.x = 0.15 - state.pointer.y * 0.2
    ray.setFromCamera(state.pointer, camera)
    const hit = new THREE.Vector3()
    if (ray.ray.intersectPlane(plane, hit)) {
      g.worldToLocal(hit)
      mouseWorld.lerp(hit, 0.2)
    }
  })

  return (
    <group ref={group}>
      <points geometry={geo} frustumCulled={false}>
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}

export default function InsightsScene({ shape }: { shape: number }) {
  const { size } = useThree()
  const mobile = size.width < 820
  return (
    <>
      <Starfield count={600} depth={[-25, 0]} />
      <group position={mobile ? [0, 1.7, -2] : [2.6, 0.3, 0]} scale={mobile ? 0.65 : 0.95}>
        <Particles shape={shape} />
      </group>
      <Effects bloom={0.9} threshold={0.3} aberration={0.0006} />
    </>
  )
}
