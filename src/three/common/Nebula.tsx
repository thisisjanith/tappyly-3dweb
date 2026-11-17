import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { simplex3 } from '../../lib/glsl'

/** Far-plane volumetric-looking nebula: domain-warped fbm in a single fragment pass. */
export function Nebula({ z = -40, scale = 140, colorA = '#2a0d7a', colorB = '#7a2bff', colorC = '#ff7a3d', intensity = 1 }: {
  z?: number; scale?: number; colorA?: string; colorB?: string; colorC?: string; intensity?: number
}) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uA: { value: new THREE.Color(colorA) },
      uB: { value: new THREE.Color(colorB) },
      uC: { value: new THREE.Color(colorC) },
      uI: { value: intensity },
    }),
    [colorA, colorB, colorC, intensity],
  )
  useFrame((s) => mat.current && (mat.current.uniforms.uTime.value = s.clock.elapsedTime))
  return (
    <mesh position={[0, 0, z]} renderOrder={-10}>
      <planeGeometry args={[scale, scale * 0.6]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        depthWrite={false}
        transparent
        vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
        fragmentShader={`
          ${simplex3}
          uniform float uTime; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform float uI;
          varying vec2 vUv;
          float fbm(vec3 p){ float v=0.0; float a=0.5; for(int i=0;i<4;i++){ v+=a*snoise(p); p*=2.02; a*=0.5; } return v; }
          void main(){
            vec2 uv = vUv*vec2(2.2,1.4);
            float t = uTime*0.015;
            vec2 q = vec2(fbm(vec3(uv, t)), fbm(vec3(uv+5.2, t)));
            float n = fbm(vec3(uv + q*1.6, t*1.5));
            float d = distance(vUv, vec2(0.62,0.62));
            float glow = smoothstep(0.7, 0.0, d);
            vec3 col = mix(uA*0.12, uA*0.7, smoothstep(-0.3, 0.7, n));
            col = mix(col, uB*0.8, smoothstep(0.2, 0.9, n) * glow * 0.8);
            col += uC * smoothstep(0.55, 0.95, n) * glow * 0.35;
            float edge = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.7, vUv.y) * smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
            float a = (0.2 + glow*0.8) * edge * uI;
            gl_FragColor = vec4(col, a);
          }`}
      />
    </mesh>
  )
}
