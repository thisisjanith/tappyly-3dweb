import { Component, Suspense, useMemo, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Web-optimised copies of the client's models in src/assests (same geometry, smaller textures).
 * Regenerate them from the originals if a model is re-exported.
 */
export const MODELS = {
  logo: '/models/tappyly-logo.glb',
  infinity: '/models/infinity.glb',
} as const

type Fit = 'width' | 'height' | 'max'

/**
 * Loads a GLB, swaps its standard material for a clear-coated physical one (the glossy brand look),
 * centres it on the origin and scales it so its largest dimension along `fit` equals `size`.
 */
export function BrandModel({ url, size, fit = 'max', clearcoat = 1, envMapIntensity = 1.4 }: {
  url: string; size: number; fit?: Fit; clearcoat?: number; envMapIntensity?: number
}) {
  const { scene } = useGLTF(url)
  const model = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const std = m.material as THREE.MeshStandardMaterial
      if (!std || !std.isMeshStandardMaterial) return
      const mat = new THREE.MeshPhysicalMaterial({
        map: std.map,
        normalMap: std.normalMap,
        normalScale: std.normalScale.clone(),
        roughnessMap: std.roughnessMap,
        metalnessMap: std.metalnessMap,
        roughness: std.roughness * 0.85,
        metalness: std.metalness,
        color: std.color.clone(),
        clearcoat,
        clearcoatRoughness: 0.12,
        envMapIntensity,
      })
      if (mat.map) mat.map.anisotropy = 8
      m.material = mat
    })
    // centre and normalise scale so any re-export of the file drops in cleanly
    const box = new THREE.Box3().setFromObject(root)
    const dim = box.getSize(new THREE.Vector3())
    root.position.sub(box.getCenter(new THREE.Vector3()))
    const span = fit === 'width' ? dim.x : fit === 'height' ? dim.y : Math.max(dim.x, dim.y)
    const wrap = new THREE.Group()
    wrap.add(root)
    wrap.scale.setScalar(size / span)
    return wrap
  }, [scene, size, fit, clearcoat, envMapIntensity])
  return <primitive object={model} />
}

/** Renders `fallback` if the model can't be loaded or parsed. */
export class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode; name?: string }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.warn(`[Tappyly] 3D model${this.props.name ? ` "${this.props.name}"` : ''} failed to load, using fallback.`, err)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** A brand model with its own loading/error boundary; shows `fallback` (or nothing) while unavailable. */
export function SafeBrandModel({ fallback = null, name, ...props }: Parameters<typeof BrandModel>[0] & { fallback?: ReactNode; name?: string }) {
  return (
    <ModelBoundary fallback={fallback} name={name}>
      <Suspense fallback={null}>
        <BrandModel {...props} />
      </Suspense>
    </ModelBoundary>
  )
}
