import { TLink } from '../lib/transition'
import { NAV, COMPANY } from '../data/content'
import { Logo } from './Logo'
import { LinkedIn, YouTube, XIcon, Instagram } from './Icons'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer__glow" aria-hidden />
      <div className="container footer__row">
        <div className="footer__brand">
          <TLink to="/" aria-label="Tappyly home">
            <Logo />
          </TLink>
          <p className="footer__legal">
            {COMPANY}
            <br />© {year} All rights reserved.
          </p>
        </div>
        <nav className="footer__nav" aria-label="Footer">
          {NAV.map((n) => (
            <TLink key={n.to} to={n.to}>{n.label}</TLink>
          ))}
        </nav>
        <div className="socials">
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedIn /></a>
          <a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><YouTube /></a>
          <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X"><XIcon /></a>
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram /></a>
        </div>
      </div>
    </footer>
  )
}
