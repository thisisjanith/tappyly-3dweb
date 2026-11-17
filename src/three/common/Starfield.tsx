import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppState } from '../../lib/store'

const vert = /* glsl */ `
uniform float uTime; uniform float uPixel; uniform float uSize;
attribute float aScale; attribute float aPhase; attribute vec3 aColor;
varying vec3 vColor; varying float vTw;
void main(){
  vec3 p = position;
  p.y += sin(uTime*0.15 + aPhase*6.28) * 0.15 * aScale;
  p.x += cos(uTime*0.1 + aPhase*4.0) * 0.1 * aScale;
  vec4 mv = modelViewMatrix * vec4(p,1.0);
  gl_Position = projectionMatrix * mv;
  vTw = 0.55 + 0.45*sin(uTime*(0.8+aPhase*2.0) + aPhase*40.0);
  gl_PointSize = uSize * aScale * uPixel * (12.0 / -mv.z);
  vColor = aColor;
}`
const frag = /* glsl */ `
varying vec3 vColor; varying float vTw;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float core = smoothstep(0.5, 0.0, d);
  float a = pow(core, 2.4) * vTw;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor * (1.0 + core*1.5), a);
}`

/** GPU twinkling star/dust field. */
export function Starfield({ count = 1400, radius = 30, depth = [-30, 4], size = 1, colors = ['#c9b2ff', '#ffffff', '#8a5cff', '#ffb488'] }: {
  count?: number; radius?: number; depth?: [number, number]; size?: number; colors?: string[]
}) {
  const tier = useAppState((s) => s.tier)
  const n = tier === 'low' ? Math.floor(count * 0.45) : count
  const mat = useRef<THREE.ShaderMaterial>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(n * 3)
    const scale = new Float32Array(n)
    const phase = new Float32Array(n)
    const col = new Float32Array(n * 3)
    const pal = colors.map((c) => new THREE.Color(c))
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * radius * 2
      pos[i * 3 + 1] = (Math.random() - 0.5) * radius
      pos[i * 3 + 2] = depth[0] + Math.random() * (depth[1] - depth[0])
      scale[i] = Math.pow(Math.random(), 3) * 2.2 + 0.25
      phase[i] = Math.random()
      const c = pal[Math.floor(Math.pow(Math.random(), 1.6) * pal.length)]
      col.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
    return g
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, radius])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixel: { value: 1 }, uSize: { value: size } }), [size])
  useFrame((s) => {
    if (!mat.current) return
    mat.current.uniforms.uTime.value = s.clock.elapsedTime
    mat.current.uniforms.uPixel.value = s.gl.getPixelRatio()
  })
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}
