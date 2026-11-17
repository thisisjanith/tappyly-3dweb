import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { simplex3 } from '../../lib/glsl'
import { useAppState } from '../../lib/store'

/** Valley centre line shared by the terrain shader and the light river that flows through it. */
export const valleyX = (z: number) => Math.sin(z * 0.13) * 3.2 + 1.6
export const TERRAIN_Y = -3.2

const vert = /* glsl */ `
${simplex3}
uniform float uTime;
varying vec3 vWorld; varying float vH; varying float vValley;
float ridged(vec2 p){
  float h=0.0, a=0.55, f=1.0;
  for(int i=0;i<6;i++){ float n=1.0-abs(snoise(vec3(p*f, 3.7))); h+=n*n*a; f*=2.03; a*=0.5; }
  return h;
}
void main(){
  vec3 p = position;
  float vx = sin(p.z*0.13)*3.2 + 1.6;
  float v = smoothstep(0.6, 9.0, abs(p.x - vx));
  float far = smoothstep(4.0, -26.0, p.z);
  float h = ridged(p.xz*0.085) * (2.2 + far*6.0) * (0.03 + v*v*1.1);
  p.y += h;
  vH = h; vValley = abs(p.x - vx);
  vec4 w = modelMatrix * vec4(p,1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`

const frag = /* glsl */ `
uniform vec3 uFog; uniform vec3 uRim; uniform vec3 uKey; uniform vec3 uRiver; uniform float uTime;
varying vec3 vWorld; varying float vH; varying float vValley;
void main(){
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 rimDir = normalize(vec3(-0.2, 0.55, -1.0));
  vec3 keyDir = normalize(vec3(0.6, 0.8, 0.4));
  float rim = pow(clamp(dot(n, rimDir),0.0,1.0), 2.0);
  float fres = pow(1.0 - clamp(dot(n, V),0.0,1.0), 3.0);
  float key = clamp(dot(n, keyDir),0.0,1.0);
  vec3 base = vec3(0.035, 0.018, 0.09);
  vec3 col = base + uKey * key * 0.03 + uRim * rim * 0.3 + uRim * fres * 0.05;
  col += vec3(0.75,0.65,1.0) * smoothstep(3.5, 7.5, vH) * 0.12;
  // river light spilling onto the valley floor
  float river = exp(-vValley*vValley*0.35);
  float shimmer = 0.75 + 0.25*sin(vWorld.z*1.3 + uTime*2.0);
  col += uRiver * river * 0.55 * shimmer;
  col = pow(col, vec3(1.12));
  float dist = length(cameraPosition - vWorld);
  float fog = 1.0 - exp(-dist*0.035);
  col = mix(col, uFog, clamp(fog,0.0,1.0)*0.75);
  float fadeFar = smoothstep(-48.0, -30.0, vWorld.z);
  gl_FragColor = vec4(col, fadeFar);
}`

/** Procedural ridged-noise mountains with faceted shading, rim light and a glowing valley. */
export function Terrain() {
  const tier = useAppState((s) => s.tier)
  const mat = useRef<THREE.ShaderMaterial>(null)
  const geo = useMemo(() => {
    const seg = tier === 'high' ? [260, 180] : tier === 'mid' ? [180, 120] : [110, 75]
    const g = new THREE.PlaneGeometry(100, 56, seg[0], seg[1])
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0, -20)
    return g
  }, [tier])
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFog: { value: new THREE.Color('#090322') },
      uRim: { value: new THREE.Color('#7c45ff') },
      uKey: { value: new THREE.Color('#c9b2ff') },
      uRiver: { value: new THREE.Color('#8f5bff') },
    }),
    [],
  )
  useFrame((s) => mat.current && (mat.current.uniforms.uTime.value = s.clock.elapsedTime))
  return (
    <mesh geometry={geo} position={[0, TERRAIN_Y, 0]} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent extensions={{ derivatives: true } as never} />
    </mesh>
  )
}
