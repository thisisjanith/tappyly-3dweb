import * as THREE from 'three'

/**
 * Build a flat ribbon strip along a set of points.
 * uv.x runs along the curve (0..1), uv.y across (0..1).
 */
export function ribbonGeometry(points: THREE.Vector3[], width: number | ((t: number) => number), facing?: THREE.Vector3) {
  const up = new THREE.Vector3(0, 1, 0)
  const view = new THREE.Vector3()
  const n = points.length
  const pos = new Float32Array(n * 2 * 3)
  const uv = new Float32Array(n * 2 * 2)
  const idx: number[] = []
  const tangent = new THREE.Vector3()
  const side = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    const p = points[i]
    const a = points[Math.max(0, i - 1)]
    const b = points[Math.min(n - 1, i + 1)]
    tangent.subVectors(b, a).normalize()
    if (facing) side.crossVectors(tangent, view.subVectors(facing, p).normalize()).normalize()
    else side.crossVectors(tangent, up).normalize()
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0)
    const t = i / (n - 1)
    const w = (typeof width === 'function' ? width(t) : width) * 0.5
    pos.set([p.x - side.x * w, p.y - side.y * w, p.z - side.z * w], i * 6)
    pos.set([p.x + side.x * w, p.y + side.y * w, p.z + side.z * w], i * 6 + 3)
    uv.set([t, 0, t, 1], i * 4)
    if (i < n - 1) {
      const k = i * 2
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

/** Additive shader: soft core with travelling light pulses. */
export const glowRibbonShader = {
  vertex: /* glsl */ `
    varying vec2 vUv; varying float vDepth;
    void main(){ vUv = uv; vec4 mv = modelViewMatrix*vec4(position,1.0); vDepth = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragment: /* glsl */ `
    uniform float uTime; uniform vec3 uColorA; uniform vec3 uColorB; uniform float uIntensity; uniform float uSpeed; uniform float uPulses; uniform float uFadeStart; uniform float uFadeEnd;
    varying vec2 vUv; varying float vDepth;
    void main(){
      float across = abs(vUv.y - 0.5) * 2.0;
      float core = exp(-across*across*14.0);
      float halo = exp(-across*across*3.0) * 0.35;
      float flow = fract(vUv.x * uPulses - uTime * uSpeed);
      float pulse = smoothstep(0.0, 0.08, flow) * smoothstep(0.35, 0.08, flow);
      float ends = smoothstep(0.0, uFadeStart, vUv.x) * smoothstep(1.0, uFadeEnd, vUv.x);
      vec3 col = mix(uColorA, uColorB, vUv.x);
      col += vec3(1.0, 0.92, 1.0) * core * (0.5 + pulse * 1.6);
      float a = (core + halo) * (0.55 + pulse * 0.9) * ends * uIntensity;
      gl_FragColor = vec4(col, a);
    }`,
}
