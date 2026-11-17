export type Tier = 'high' | 'mid' | 'low'

let webglCache: boolean | null = null
export function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache
  try {
    const c = document.createElement('canvas')
    webglCache = !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!c.getContext('webgl')
  } catch {
    webglCache = false
  }
  return webglCache
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isTouch(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
}

/** Rough GPU budget estimate. Scenes use this to scale particle counts, DPR and effects. */
export function detectTier(): Tier {
  if (typeof window === 'undefined') return 'mid'
  const params = new URLSearchParams(window.location.search)
  const forced = params.get('quality')
  if (forced === 'high' || forced === 'mid' || forced === 'low') return forced
  const cores = navigator.hardwareConcurrency || 4
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 8
  const small = Math.min(window.innerWidth, window.innerHeight) < 600
  if (isTouch() || small) return cores >= 8 && mem >= 6 ? 'mid' : 'low'
  if (cores >= 8 && mem >= 8) return 'high'
  return 'mid'
}
