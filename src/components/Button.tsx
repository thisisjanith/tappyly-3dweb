import type { ReactNode } from 'react'
import { useMagnetic } from '../lib/hooks'
import { TLink } from '../lib/transition'

type Common = { children: ReactNode; variant?: 'primary' | 'ghost' | 'light'; size?: 'sm' | 'md'; className?: string; cursor?: string }

export function MagneticLink({ to, children, variant = 'primary', size = 'md', className = '', cursor }: Common & { to: string }) {
  const ref = useMagnetic<HTMLAnchorElement>(0.25)
  return (
    <TLink ref={ref as never} to={to} data-cursor={cursor} className={`btn btn--${variant} ${size === 'sm' ? 'btn--sm' : ''} ${className}`}>
      {children}
    </TLink>
  )
}

export function MagneticButton({ children, variant = 'primary', size = 'md', className = '', type = 'button', onClick, disabled }: Common & { type?: 'button' | 'submit'; onClick?: () => void; disabled?: boolean }) {
  const ref = useMagnetic<HTMLButtonElement>(0.2)
  return (
    <button ref={ref} type={type} onClick={onClick} disabled={disabled} className={`btn btn--${variant} ${size === 'sm' ? 'btn--sm' : ''} ${className}`}>
      {children}
    </button>
  )
}
