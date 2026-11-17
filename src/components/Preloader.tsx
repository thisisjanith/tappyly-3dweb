import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { getState, setState } from '../lib/store'
import { LogoMark } from './Logo'

/** Brand intro: waits for fonts (needed by canvas-drawn textures) then reveals the site. */
export function Preloader() {
  const [done, setDone] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const logo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = getState().reduced
    const prog = { v: 0 }
    const finish = () => {
      setState({ loaded: true })
      setDone(true)
    }
    if (reduced) {
      document.fonts.ready.then(finish)
      return
    }
    const tl = gsap.timeline({ paused: true })
    tl.fromTo(logo.current, { scale: 0.6, rotate: -12, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1, ease: 'expo.out' }, 0)
    const fill = gsap.to(prog, {
      v: 100, duration: 1.6, ease: 'power2.inOut',
      onUpdate: () => {
        if (bar.current) bar.current.style.transform = `scaleX(${prog.v / 100})`
        if (count.current) count.current.textContent = `${String(Math.round(prog.v)).padStart(3, '0')}`
      },
    })
    tl.play()
    Promise.all([document.fonts.ready, new Promise((r) => fill.eventCallback('onComplete', r))]).then(() => {
      gsap.timeline({ onComplete: () => setDone(true) })
        .to(logo.current, { scale: 1.15, autoAlpha: 0, duration: 0.6, ease: 'expo.in' })
        .add(() => setState({ loaded: true }), '-=0.1')
        .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 1.0, ease: 'expo.inOut' }, '-=0.2')
    })
    return () => { tl.kill(); fill.kill() }
  }, [])

  if (done) return null
  return (
    <div className="preloader" ref={root} style={{ clipPath: 'inset(0 0 0% 0)' }} aria-label="Loading" role="status">
      <div className="preloader__inner">
        <div className="preloader__logo" ref={logo}><LogoMark /></div>
        <div className="preloader__bar"><span ref={bar} /></div>
        <span className="preloader__count" ref={count}>000</span>
      </div>
    </div>
  )
}
