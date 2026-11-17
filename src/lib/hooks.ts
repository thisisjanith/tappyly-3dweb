import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getState, subscribe } from './store'

gsap.registerPlugin(ScrollTrigger)

const useIso = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** Wrap every word of an element's text nodes in masked spans (keeps inline markup such as .grad). */
function splitWords(el: HTMLElement) {
  if (el.dataset.splitDone) return
  el.dataset.splitDone = '1'
  const walk = (node: Node, gradParent: string) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || ''
        if (!text.trim()) return
        const frag = document.createDocumentFragment()
        text.split(/(\s+)/).forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '))
            return
          }
          const outer = document.createElement('span')
          outer.className = 'w'
          const inner = document.createElement('span')
          if (gradParent) inner.className = gradParent
          inner.textContent = part
          outer.appendChild(inner)
          frag.appendChild(outer)
        })
        child.parentNode?.replaceChild(frag, child)
      } else if (child instanceof HTMLElement) {
        if (child.tagName === 'BR') return
        const gradCls = Array.from(child.classList).find((c) => c.startsWith('grad')) || ''
        if (gradCls) child.classList.remove(gradCls)
        walk(child, gradCls || gradParent)
      }
    })
  }
  walk(el, '')
}

/**
 * Scroll-driven reveals for everything inside `scope`:
 *   [data-split]  – headline words rise out of a mask
 *   [data-reveal] – fade + rise (optional data-delay)
 *   [data-stagger] – children reveal in sequence
 * Elements marked data-immediate play once the preloader has finished instead of on scroll.
 */
export function useReveal(scope: RefObject<HTMLElement>, deps: unknown[] = []) {
  useIso(() => {
    const root = scope.current
    if (!root) return
    const reduced = getState().reduced
    const pending: gsap.core.Tween[] = []
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
        splitWords(el)
        if (reduced) return
        const immediate = el.hasAttribute('data-immediate')
        const tw = gsap.fromTo(
          el.querySelectorAll('.w > span'),
          { yPercent: 115, rotate: 4 },
          {
            yPercent: 0, rotate: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06,
            delay: parseFloat(el.dataset.delay || '0'),
            paused: immediate,
            scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 88%' },
          },
        )
        if (immediate) pending.push(tw)
      })
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        if (reduced) return
        const immediate = el.hasAttribute('data-immediate')
        const tw = gsap.fromTo(
          el,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out',
            delay: parseFloat(el.dataset.delay || '0'),
            paused: immediate,
            scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 90%' },
          },
        )
        if (immediate) pending.push(tw)
      })
      root.querySelectorAll<HTMLElement>('[data-stagger]').forEach((el) => {
        if (reduced) return
        gsap.fromTo(
          Array.from(el.children),
          { autoAlpha: 0, y: 50 },
          { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 88%' } },
        )
      })
    }, root)
    // hero copy waits for the preloader to finish
    let unsub: (() => void) | undefined
    const play = () => pending.forEach((t) => t.play())
    if (getState().loaded) play()
    else unsub = subscribe(() => {
      if (getState().loaded) {
        play()
        unsub?.()
        unsub = undefined
      }
    })
    const t = setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => {
      clearTimeout(t)
      unsub?.()
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Pointer-tracked 3D tilt + spotlight for glass cards (writes CSS vars, no re-renders). */
export function useTilt<T extends HTMLElement>(strength = 8) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(pointer: coarse)').matches || getState().reduced) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      el.style.setProperty('--rx', `${(0.5 - y) * strength}deg`)
      el.style.setProperty('--ry', `${(x - 0.5) * strength}deg`)
      el.style.setProperty('--px', `${x * 100}%`)
      el.style.setProperty('--py', `${y * 100}%`)
      el.style.setProperty('--spot', '1')
    }
    const leave = () => {
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
      el.style.setProperty('--spot', '0')
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [strength])
  return ref
}

/** Magnetic pull toward the cursor for buttons. */
export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(pointer: coarse)').matches || getState().reduced) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${(e.clientX - (r.left + r.width / 2)) * strength}px`)
      el.style.setProperty('--my', `${(e.clientY - (r.top + r.height / 2)) * strength}px`)
    }
    const leave = () => {
      el.style.setProperty('--mx', '0px')
      el.style.setProperty('--my', '0px')
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [strength])
  return ref
}

export function useMediaQuery(q: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(q)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(q).matches,
    () => false,
  )
}

/** Animated number counter that starts when scrolled into view. */
export function useCounter(ref: RefObject<HTMLElement>, to: number, suffix = '') {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (getState().reduced) {
      el.textContent = `${to}${suffix}`
      return
    }
    const obj = { v: 0 }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: to, duration: 2.2, ease: 'expo.out',
          onUpdate: () => { el.textContent = `${Math.round(obj.v)}${suffix}` },
        }),
    })
    return () => st.kill()
  }, [ref, to, suffix])
}
