import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { TLink } from '../lib/transition'
import { getLenis } from '../lib/scroll'
import { NAV, SERVICES, CONTACT } from '../data/content'
import { Logo } from './Logo'
import { Arrow, Chevron } from './Icons'
import { MagneticLink } from './Button'

export function Nav() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let last = 0
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      setHidden(y > 400 && y > last + 2)
      if (y < last - 2) setHidden(false)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const l = getLenis()
    if (open) l?.stop()
    else l?.start()
    document.body.style.overflow = open ? 'hidden' : ''
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  const isActive = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to))

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${hidden && !open ? 'is-hidden' : ''}`}>
        <div className="container nav__inner">
          <TLink to="/" aria-label="Tappyly home">
            <Logo />
          </TLink>
          <nav aria-label="Primary">
            <ul className="nav__links">
              {NAV.map((item) => (
                <li key={item.to} className={item.dropdown ? 'has-dropdown' : undefined}>
                  <TLink to={item.to} className={`nav__link ${isActive(item.to) ? 'is-active' : ''}`} aria-current={isActive(item.to) ? 'page' : undefined}>
                    {item.label}
                    {item.dropdown && <Chevron />}
                  </TLink>
                  {item.dropdown && (
                    <div className="dropdown" role="menu">
                      {SERVICES.map((s) => (
                        <TLink key={s.id} to={`/services#${s.id}`} role="menuitem">
                          <s.icon />
                          <span>
                            <strong>{s.title}</strong>
                            <span>{s.short}</span>
                          </span>
                        </TLink>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="nav__cta">
            <MagneticLink to="/contact" variant="ghost" size="sm">
              Let&apos;s Talk <Arrow />
            </MagneticLink>
          </div>
          <button className="burger" aria-label="Menu" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
            <span />
          </button>
        </div>
      </header>
      <div id="mobile-menu" className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        {NAV.map((item, i) => (
          <TLink key={item.to} to={item.to} className="mm-link" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
            <small>0{i + 1}</small>
            {item.label}
          </TLink>
        ))}
        <div className="mm-foot">
          <a href={`mailto:${CONTACT.email}`} tabIndex={open ? 0 : -1}>{CONTACT.email}</a>
          <span>{CONTACT.phone}</span>
          <span>{CONTACT.location}</span>
        </div>
      </div>
    </>
  )
}
