import { createContext, forwardRef, useCallback, useContext, useRef, type ReactNode, type MouseEvent, type AnchorHTMLAttributes } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { getState } from './store'
import { scrollToEl, scrollToTop } from './scroll'
import { LogoMark } from '../components/Logo'

type Ctx = { go: (to: string) => void }
const TransitionCtx = createContext<Ctx>({ go: () => {} })
export const useTransitionNav = () => useContext(TransitionCtx)

const afterNav = (hash: string) => {
  if (hash) setTimeout(() => scrollToEl(hash), 700)
}

/** Curtain wipe between routes: cover → swap route → uncover. */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const busy = useRef(false)
  const curtain = useRef<HTMLDivElement>(null)
  const logo = useRef<HTMLDivElement>(null)

  const go = useCallback(
    (to: string) => {
      const [path, hashPart] = to.split('#')
      const hash = hashPart ? `#${hashPart}` : ''
      const target = path || location.pathname
      if (target === location.pathname) {
        if (hash) scrollToEl(hash)
        else scrollToTop(false)
        return
      }
      if (busy.current) return
      if (getState().reduced || !curtain.current) {
        navigate(target)
        scrollToTop()
        afterNav(hash)
        return
      }
      busy.current = true
      const bars = curtain.current.children
      const tl = gsap.timeline()
      tl.set(bars, { transformOrigin: 'bottom' })
        .to(bars, { scaleY: 1, duration: 0.6, ease: 'expo.inOut', stagger: 0.05 })
        .to(logo.current, { opacity: 1, scale: 1, duration: 0.4, ease: 'expo.out' }, '-=0.25')
        .add(() => {
          navigate(target)
          scrollToTop()
        })
        .to({}, { duration: 0.45 })
        .set(bars, { transformOrigin: 'top' })
        .to(logo.current, { opacity: 0, scale: 0.8, duration: 0.3 })
        .to(bars, { scaleY: 0, duration: 0.7, ease: 'expo.inOut', stagger: 0.05 }, '<')
        .add(() => {
          busy.current = false
          afterNav(hash)
        })
    },
    [location.pathname, navigate],
  )

  return (
    <TransitionCtx.Provider value={{ go }}>
      {children}
      <div className="curtain" ref={curtain} aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="curtain__logo" ref={logo} aria-hidden style={{ transform: 'translate(-50%,-50%) scale(0.8)' }}>
        <LogoMark />
      </div>
    </TransitionCtx.Provider>
  )
}

type TLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; children: ReactNode }

/** Anchor that routes through the curtain transition while staying a real, crawlable link. */
export const TLink = forwardRef<HTMLAnchorElement, TLinkProps>(function TLink({ to, children, onClick, ...rest }, ref) {
  const { go } = useTransitionNav()
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    go(to)
  }
  return (
    <a ref={ref} href={to} onClick={handle} {...rest}>
      {children}
    </a>
  )
})
