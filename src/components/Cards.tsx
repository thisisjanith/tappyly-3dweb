import type { ReactNode } from 'react'
import { useTilt } from '../lib/hooks'
import { TLink } from '../lib/transition'
import { Arrow } from './Icons'
import type { Service } from '../data/content'

export function TiltCard({ children, className = '', as = 'div', ...rest }: { children: ReactNode; className?: string; as?: 'div' | 'article' | 'li' } & Record<string, unknown>) {
  const ref = useTilt<HTMLDivElement>(7)
  const Tag = as as 'div'
  return (
    <Tag ref={ref} className={`glass tilt ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function ServiceCard({ s, large, active, onEnter, onLeave, to }: { s: Service; large?: boolean; active?: boolean; onEnter?: () => void; onLeave?: () => void; to?: string }) {
  const ref = useTilt<HTMLAnchorElement>(8)
  return (
    <TLink
      ref={ref}
      to={to ?? `/services#${s.id}`}
      id={large ? s.id : undefined}
      className={`glass tilt svc-card ${large ? 'svc-card--lg' : ''} ${active ? 'is-active' : ''}`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      <span className="icon-chip"><s.icon /></span>
      <h3 className="h3">{s.title}</h3>
      <p>{large ? s.description : s.short}</p>
      {large && (
        <ul className="ticks">
          {s.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}
      <span className="round-arrow" aria-hidden style={{ marginTop: large ? 22 : undefined }}><Arrow /></span>
    </TLink>
  )
}

