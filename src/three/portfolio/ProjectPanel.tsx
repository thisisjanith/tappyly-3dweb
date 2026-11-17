import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { Project } from '../../data/content'
import { projectTexture } from '../../lib/canvasTextures'

const vert = /* glsl */ `
uniform float uTime; uniform float uHover; uniform float uBend; uniform vec2 uMouse;
varying vec2 vUv; varying float vWave;
void main(){
  vUv = uv;
  vec3 p = position;
  float d = distance(uv, uMouse);
  float wave = sin(d*22.0 - uTime*6.0) * exp(-d*4.0) * uHover;
  p.z += wave * 0.05 + sin(uv.x*3.14159) * uBend;
  vWave = wave;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
}`

const frag = /* glsl */ `
uniform sampler2D uMap; uniform float uHover; uniform float uDim; uniform float uAlpha; uniform vec2 uSize; uniform float uRadius; uniform vec3 uGlow; uniform float uTime; uniform float uReveal;
varying vec2 vUv; varying float vWave;
float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q,0.0)) + min(max(q.x,q.y),0.0) - r; }
void main(){
  vec2 p = (vUv - 0.5) * uSize;
  float d = sdRound(p, uSize*0.5, uRadius);
  float aa = fwidth(d);
  float mask = 1.0 - smoothstep(-aa, aa, d);
  vec2 shift = vec2(vWave * 0.02 + uHover*0.003, 0.0);
  vec2 uv = vUv;
  uv = (uv - 0.5) * (1.0 - uHover*0.04) + 0.5;
  vec3 col;
  col.r = texture2D(uMap, uv + shift).r;
  col.g = texture2D(uMap, uv).g;
  col.b = texture2D(uMap, uv - shift).b;
  // glass sheen sweep
  float sweep = smoothstep(0.08, 0.0, abs(vUv.x + vUv.y*0.6 - fract(uTime*0.12)*2.4 + 0.4));
  col += sweep * 0.12;
  // edge glow
  float edge = 1.0 - smoothstep(0.0, 0.06 + uHover*0.04, abs(d));
  col += uGlow * edge * (0.35 + uHover * 1.4);
  col = mix(col, col*0.25, uDim);
  float reveal = smoothstep(uReveal - 0.05, uReveal, 1.0 - vUv.y + 0.0001);
  float a = mask * uAlpha * (1.0 - reveal);
  if (a < 0.002) discard;
  gl_FragColor = vec4(col, a);
}`

export type PanelHandle = {
  group: THREE.Group | null
  setTarget: (t: { pos?: THREE.Vector3; rot?: THREE.Euler; scale?: number; alpha?: number; dim?: number }) => void
}

type Props = {
  project: Project
  width?: number
  onSelect?: (p: Project) => void
  onHover?: (p: Project | null) => void
  bend?: number
}

/** A project mockup panel with rounded-corner SDF mask, hover ripple, RGB split and glowing edge. */
export const ProjectPanel = forwardRef<PanelHandle, Props>(function ProjectPanel({ project, width = 3, onSelect, onHover, bend = 0 }, ref) {
  const group = useRef<THREE.Group>(null)
  const mat = useRef<THREE.ShaderMaterial>(null)
  const height = width / 1.6
  const hover = useRef(0)
  const hovered = useRef(false)
  const target = useRef({ pos: new THREE.Vector3(), rot: new THREE.Euler(), scale: 1, alpha: 1, dim: 0, init: false })

  useImperativeHandle(ref, () => ({
    group: group.current,
    setTarget: (t) => {
      const tg = target.current
      if (t.pos) tg.pos.copy(t.pos)
      if (t.rot) tg.rot.copy(t.rot)
      if (t.scale !== undefined) tg.scale = t.scale
      if (t.alpha !== undefined) tg.alpha = t.alpha
      if (t.dim !== undefined) tg.dim = t.dim
      if (!tg.init && group.current) {
        group.current.position.copy(tg.pos)
        group.current.rotation.copy(tg.rot)
        group.current.scale.setScalar(tg.scale)
        tg.init = true
      }
    },
  }))

  const geo = useMemo(() => new THREE.PlaneGeometry(width, height, 48, 30), [width, height])
  const uniforms = useMemo(
    () => ({
      uMap: { value: projectTexture(project) },
      uTime: { value: 0 }, uHover: { value: 0 }, uBend: { value: bend }, uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uDim: { value: 0 }, uAlpha: { value: 1 }, uSize: { value: new THREE.Vector2(width, height) }, uRadius: { value: 0.14 },
      uGlow: { value: new THREE.Color(project.accent).multiplyScalar(1.4) }, uReveal: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project, width, height],
  )

  useFrame((state, dt) => {
    const g = group.current
    const u = mat.current?.uniforms
    if (!g || !u) return
    const k = 1 - Math.pow(0.004, dt)
    const tg = target.current
    hover.current += ((hovered.current ? 1 : 0) - hover.current) * (1 - Math.pow(0.001, dt))
    const h = hover.current
    g.position.x += (tg.pos.x - g.position.x) * k
    g.position.y += (tg.pos.y - g.position.y) * k
    g.position.z += (tg.pos.z + h * 0.5 - g.position.z) * k
    g.rotation.x += (tg.rot.x * (1 - h * 0.6) - g.rotation.x) * k
    g.rotation.y += (tg.rot.y * (1 - h * 0.6) - g.rotation.y) * k
    g.rotation.z += (tg.rot.z - g.rotation.z) * k
    const s = g.scale.x + (tg.scale * (1 + h * 0.04) - g.scale.x) * k
    g.scale.setScalar(Math.max(0.0001, s))
    u.uTime.value = state.clock.elapsedTime
    u.uHover.value = h
    u.uAlpha.value += (tg.alpha - u.uAlpha.value) * k
    u.uDim.value += (tg.dim - u.uDim.value) * k
    u.uReveal.value = Math.min(1.1, u.uReveal.value + dt * 0.9)
    g.visible = u.uAlpha.value > 0.01
  })

  const move = (e: ThreeEvent<PointerEvent>) => e.uv && (mat.current!.uniforms.uMouse.value as THREE.Vector2).copy(e.uv)
  const over = (e: ThreeEvent<PointerEvent>) => {
    if (target.current.alpha < 0.5) return
    e.stopPropagation()
    hovered.current = true
    onHover?.(project)
    ;(e.nativeEvent.target as HTMLElement).dataset.cursor = 'View'
  }
  const out = (e: ThreeEvent<PointerEvent>) => {
    hovered.current = false
    onHover?.(null)
    delete (e.nativeEvent.target as HTMLElement).dataset.cursor
  }

  return (
    <group ref={group}>
      <mesh
        geometry={geo}
        onPointerOver={over}
        onPointerOut={out}
        onPointerMove={move}
        onClick={(e) => {
          if (target.current.alpha < 0.5) return
          e.stopPropagation()
          onSelect?.(project)
        }}
      >
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} extensions={{ derivatives: true } as never} />
      </mesh>
    </group>
  )
})
