import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { simplex3 } from '../../lib/glsl'
import { getState } from '../../lib/store'

/**
 * Fully GPU-procedural ribbon. The vertex shader evaluates parametric knot curves
 * (infinity, torus knots, trefoil, figure-eight, crown) and morphs between any two of them,
 * building a twisting Frenet-like frame on the fly. No geometry is rebuilt on morph.
 */
const vert = /* glsl */ `
${simplex3}
#define PI 3.141592653589793
uniform float uTime; uniform int uA; uniform int uB; uniform float uMix; uniform float uWidth; uniform float uTwist; uniform float uRipple; uniform float uScale;
varying float vU; varying float vV; varying vec3 vN; varying vec3 vW; varying vec3 vObj;

vec3 curve(int s, float t){
  if (s == 0) { float d = 1.0 + sin(t)*sin(t); return vec3(2.35*cos(t)/d, 2.0*sin(t)*cos(t)/d, 0.55*sin(t)); }
  if (s == 1) { float r = 1.0 + 0.42*cos(3.0*t); return 1.45*vec3(r*cos(2.0*t), r*sin(2.0*t), 0.45*sin(3.0*t)); }
  if (s == 2) { return 0.58*vec3(sin(t) + 2.0*sin(2.0*t), cos(t) - 2.0*cos(2.0*t), -0.9*sin(3.0*t)); }
  if (s == 3) { float r = 1.0 + 0.34*cos(5.0*t); return 1.55*vec3(r*cos(3.0*t), r*sin(3.0*t), 0.38*sin(5.0*t)); }
  if (s == 4) { float r = 2.0 + cos(2.0*t); return 0.62*vec3(r*cos(3.0*t), r*sin(3.0*t), 1.1*sin(4.0*t)); }
  return vec3(2.0*cos(t), 1.65*sin(t), 0.45*sin(3.0*t));
}
vec3 shape(float t){ return mix(curve(uA, t), curve(uB, t), uMix) * uScale; }

void main(){
  float u = uv.x;            // along
  float v = uv.y * 2.0 - 1.0; // across
  float t = u * 2.0 * PI;
  float e = 0.002;
  vec3 c = shape(t);
  vec3 T = normalize(shape(t + e) - shape(t - e));
  vec3 ref = normalize(vec3(0.0, 0.25, 1.0));
  vec3 N = cross(T, ref);
  if (length(N) < 0.05) N = cross(T, vec3(0.0, 1.0, 0.0));
  N = normalize(N);
  vec3 B = normalize(cross(T, N));
  float a = t * uTwist * 0.5 + uTime * 0.25 + sin(t*2.0 + uTime*0.4)*0.35;
  vec3 side = cos(a)*N + sin(a)*B;
  float w = uWidth * (0.85 + 0.15*sin(t*3.0 + uTime*0.6));
  vec3 nrm = normalize(cross(T, side));
  float wave = sin(t*14.0 - uTime*3.0) * uRipple * 0.12 * (1.0 - abs(v)*0.5);
  float n = snoise(vec3(c*0.6 + uTime*0.15)) * 0.08;
  vec3 p = c + side * v * w + nrm * (wave + n);
  vU = u; vV = v; vObj = c;
  vN = normalize(normalMatrix * nrm);
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`

const frag = /* glsl */ `
uniform vec3 uColA; uniform vec3 uColB; uniform vec3 uColC; uniform float uTime; uniform float uGlow;
varying float vU; varying float vV; varying vec3 vN; varying vec3 vW; varying vec3 vObj;
vec3 pal(float t){ return 0.5 + 0.5*cos(6.28318*(vec3(1.0,1.0,1.0)*t + vec3(0.0,0.33,0.67))); }
void main(){
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vW);
  // world-space N for lighting: normalMatrix gives view space; convert approx by using view-space lights
  vec3 Vv = vec3(0.0, 0.0, 1.0);
  vec3 L1 = normalize(vec3(-0.5, 0.8, 0.6));
  vec3 L2 = normalize(vec3(0.8, -0.2, 0.5));
  float g = smoothstep(-2.6, 2.6, vObj.x + vObj.y*0.35);
  vec3 base = mix(uColA, uColB, g);
  base = mix(base, uColC, smoothstep(0.45, 1.0, g) * 0.85);
  float dif = clamp(dot(N, L1), 0.0, 1.0)*0.6 + 0.4*clamp(dot(N, L2)*0.5+0.5, 0.0, 1.0);
  vec3 H1 = normalize(L1 + Vv); vec3 H2 = normalize(L2 + Vv);
  float spec = pow(clamp(dot(N, H1),0.0,1.0), 90.0) * 1.6 + pow(clamp(dot(N, H2),0.0,1.0), 40.0) * 0.6;
  float fres = pow(1.0 - clamp(abs(dot(N, Vv)),0.0,1.0), 2.5);
  vec3 R = reflect(-Vv, N);
  float box = smoothstep(0.6, 0.92, R.y) * 0.6 + smoothstep(0.78, 0.98, R.x) * 0.35;
  vec3 irid = pal(fres*0.6 + vU*0.5 + uTime*0.03) * 0.25;
  vec3 col = base * (0.18 + dif * 0.9);
  col += vec3(1.0, 0.95, 1.0) * (spec * 0.75 + box * 0.3);
  col += (base * 1.2 + irid) * fres * 0.6;
  float edge = smoothstep(0.82, 1.0, abs(vV));
  col += mix(uColB, vec3(1.0), 0.4) * edge * 0.6 * uGlow;
  float pulse = smoothstep(0.985, 1.0, sin(vU*6.28318*3.0 - uTime*1.2)*0.5+0.5);
  col += uColB * pulse * 1.5 * uGlow;
  gl_FragColor = vec4(col, 1.0);
}`

const HUES: Record<number, [string, string, string]> = {
  0: ['#5a2bff', '#9b5cff', '#ff8a3d'],
  1: ['#4f2dff', '#7c5cff', '#38bdf8'],
  2: ['#6b2bff', '#c05cff', '#ff7a3d'],
  3: ['#7c2bff', '#ec4899', '#ffb44d'],
  4: ['#3b2bd6', '#6366f1', '#22d3ee'],
  5: ['#6b2bff', '#a46bff', '#f472b6'],
}

export function InfinityRibbon({ shape = 0, width = 0.55, scale = 1, twist = 3, interactive = true, segments = 900 }: {
  shape?: number; width?: number; scale?: number; twist?: number; interactive?: boolean; segments?: number
}) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const group = useRef<THREE.Group>(null)
  const { gl } = useThree()
  const morph = useRef({ from: shape, to: shape, mix: 1, ripple: 0 })
  const drag = useRef({ active: false, x: 0, y: 0, vx: 0, vy: 0, rx: 0, ry: 0 })
  const colors = useRef({
    a: new THREE.Color(HUES[shape][0]), b: new THREE.Color(HUES[shape][1]), c: new THREE.Color(HUES[shape][2]),
  })

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1, segments, 10)
    g.translate(0.5, 0.5, 0)
    return g
  }, [segments])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 }, uA: { value: shape }, uB: { value: shape }, uMix: { value: 1 },
      uWidth: { value: width }, uTwist: { value: twist }, uRipple: { value: 0 }, uScale: { value: scale }, uGlow: { value: 1 },
      uColA: { value: colors.current.a.clone() }, uColB: { value: colors.current.b.clone() }, uColC: { value: colors.current.c.clone() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // queue a morph whenever the requested shape changes
  useEffect(() => {
    const m = morph.current
    if (shape === m.to) return
    const u = mat.current?.uniforms
    if (u) {
      // freeze current blend as the new "from"
      m.from = m.mix > 0.5 ? m.to : m.from
    }
    m.to = shape
    m.mix = 0
    m.ripple = 1
    const h = HUES[shape] ?? HUES[0]
    colors.current.a.set(h[0]); colors.current.b.set(h[1]); colors.current.c.set(h[2])
  }, [shape])

  useEffect(() => {
    if (!interactive) return
    const el = gl.domElement
    const d = drag.current
    const down = (e: PointerEvent) => { d.active = true; d.x = e.clientX; d.y = e.clientY; el.dataset.cursor = 'Drag' }
    const move = (e: PointerEvent) => {
      if (!d.active) { morph.current.ripple = Math.min(1, morph.current.ripple + Math.hypot(e.movementX, e.movementY) * 0.004); return }
      d.vx = (e.clientX - d.x) * 0.006; d.vy = (e.clientY - d.y) * 0.004
      d.x = e.clientX; d.y = e.clientY
    }
    const up = () => { d.active = false }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    el.dataset.cursor = 'Drag'
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      delete el.dataset.cursor
    }
  }, [gl, interactive])

  useFrame((state, dt) => {
    const u = mat.current?.uniforms
    if (!u) return
    const m = morph.current
    const reduced = getState().reduced
    m.mix = Math.min(1, m.mix + dt * (reduced ? 10 : 0.75))
    m.ripple *= Math.pow(0.25, dt)
    const e = m.mix < 0.5 ? 4 * m.mix ** 3 : 1 - Math.pow(-2 * m.mix + 2, 3) / 2
    u.uA.value = m.from
    u.uB.value = m.to
    u.uMix.value = e
    if (m.mix >= 1) m.from = m.to
    u.uRipple.value = m.ripple + Math.sin(e * Math.PI) * 0.8
    u.uTime.value = state.clock.elapsedTime
    const k = 1 - Math.pow(0.05, dt)
    ;(u.uColA.value as THREE.Color).lerp(colors.current.a, k)
    ;(u.uColB.value as THREE.Color).lerp(colors.current.b, k)
    ;(u.uColC.value as THREE.Color).lerp(colors.current.c, k)
    const g = group.current
    if (!g) return
    const d = drag.current
    d.ry += d.vx
    d.rx += d.vy
    d.vx *= 0.93
    d.vy *= 0.93
    d.rx *= 0.97
    const t = state.clock.elapsedTime
    g.rotation.y = d.ry + Math.sin(t * 0.25) * 0.35 + state.pointer.x * 0.2
    g.rotation.x = d.rx + Math.cos(t * 0.2) * 0.12 - state.pointer.y * 0.15
  })

  return (
    <group ref={group}>
      <mesh geometry={geo} frustumCulled={false}>
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
