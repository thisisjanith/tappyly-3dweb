import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scroll, useAppState } from './store'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null
export const getLenis = () => lenis

export function scrollToTop(immediate = true) {
  if (lenis) lenis.scrollTo(0, { immediate, force: true })
  else window.scrollTo(0, 0)
}

export function scrollToEl(target: string | HTMLElement, offset = -90) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 })
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' })
}

/** Lenis smooth scrolling driven by the GSAP ticker so ScrollTrigger stays in sync. */
export function SmoothScroll() {
  const reduced = useAppState((s) => s.reduced)

  useEffect(() => {
    const update = () => {
      scroll.y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      scroll.progress = max > 0 ? scroll.y / max : 0
    }
    if (reduced) {
      window.addEventListener('scroll', update, { passive: true })
      update()
      return () => window.removeEventListener('scroll', update)
    }
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), touchMultiplier: 1.4 })
    lenis.on('scroll', (l: Lenis) => {
      update()
      scroll.velocity = l.velocity
      ScrollTrigger.update()
    })
    const tick = (time: number) => lenis?.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis?.destroy()
      lenis = null
    }
  }, [reduced])

  return null
}
