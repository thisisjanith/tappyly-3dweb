import { useSyncExternalStore } from 'react'
import { detectTier, prefersReducedMotion, type Tier } from './device'

/** Tiny global store shared between DOM and WebGL layers (no re-render on hot paths). */
export const scroll = { y: 0, velocity: 0, progress: 0 }
export const pointer = { x: 0, y: 0, nx: 0, ny: 0 } // px and normalised (-1..1)

type State = { tier: Tier; reduced: boolean; loaded: boolean }
let state: State = { tier: 'mid', reduced: false, loaded: false }
const listeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  state = { tier: detectTier(), reduced: prefersReducedMotion(), loaded: false }
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener?.('change', (e) => setState({ reduced: e.matches }))
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ny = -((e.clientY / window.innerHeight) * 2 - 1)
    },
    { passive: true },
  )
}

export function setState(patch: Partial<State>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}
export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}
export function getState() {
  return state
}
export function useAppState<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => sel(state),
    () => sel(state),
  )
}

export const SEND_EVENT = 'tappyly:send'
