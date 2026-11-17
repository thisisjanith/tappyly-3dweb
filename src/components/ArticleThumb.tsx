import { useId } from 'react'
import type { Article } from '../data/content'

/** Vector cover art per category — crisp at any DPR and zero network cost. */
export function ArticleThumb({ category, seed }: { category: Article['category']; seed: string }) {
  const id = useId().replace(/:/g, '')
  const warm = category === 'Branding' || category === 'Digital Marketing'
  const h = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0)
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a1170" />
          <stop offset="1" stopColor="#0c0530" />
        </linearGradient>
        <radialGradient id={`gl${id}`} cx={0.55 + (h % 20) / 100} cy="0.45" r="0.6">
          <stop offset="0" stopColor={warm ? '#ff8a3d' : '#8a4dff'} stopOpacity="0.75" />
          <stop offset="1" stopColor="#8a4dff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`fg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1e9ff" />
          <stop offset="1" stopColor="#9a6bff" />
        </linearGradient>
        <linearGradient id={`wm${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffc552" />
          <stop offset="1" stopColor="#ff6a2b" />
        </linearGradient>
        <filter id={`bl${id}`}><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <rect width="320" height="200" fill={`url(#bg${id})`} />
      <rect width="320" height="200" fill={`url(#gl${id})`} />
      {Array.from({ length: 18 }).map((_, i) => (
        <circle key={i} cx={(h * (i + 3) * 37) % 320} cy={(h * (i + 7) * 53) % 200} r={((i * h) % 3) * 0.5 + 0.5} fill="#e9dcff" opacity={0.5} />
      ))}
      <g transform="translate(160 104)">
        {category === 'Web Development' || category === 'UI/UX Design' ? (
          <g>
            <rect x="-70" y="-58" width="140" height="88" rx="8" fill="#140838" stroke={`url(#fg${id})`} strokeWidth="2.5" />
            <rect x="-62" y="-50" width="124" height="72" rx="4" fill={`url(#gl${id})`} opacity="0.9" />
            {category === 'Web Development' ? (
              <path d="M-22 -22 -36 -10 -22 2M22 -22 36 -10 22 2M8 -28 -8 8" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <g fill="#fff" opacity="0.9"><rect x="-50" y="-40" width="40" height="52" rx="5" /><rect x="-2" y="-40" width="52" height="22" rx="5" opacity=".6" /><rect x="-2" y="-12" width="52" height="24" rx="5" opacity=".4" /></g>
            )}
            <path d="M-86 30h172l-12 14h-148z" fill={`url(#fg${id})`} />
          </g>
        ) : category === 'Digital Marketing' ? (
          <g>
            <path d="M-50 -14 30 -52v92l-80-38z" fill={`url(#fg${id})`} />
            <rect x="-68" y="-16" width="22" height="32" rx="6" fill="#d9c8ff" />
            <path d="M-56 16l8 32h14l-6-30" fill="#b89aff" />
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M${46 + i * 16} -${26 + i * 10}a${40 + i * 18} ${40 + i * 18} 0 0 1 0 ${52 + i * 20}`} fill="none" stroke={`url(#wm${id})`} strokeWidth="5" strokeLinecap="round" opacity={1 - i * 0.25} />
            ))}
          </g>
        ) : category === 'Branding' ? (
          <g>
            <g filter={`url(#bl${id})`} opacity="0.6"><rect x="-40" y="-40" width="80" height="80" rx="10" fill="#ff8a3d" /></g>
            <path d="M-70 10l40-22 40 22-40 22z" fill="#c9a8ff" /><path d="M-70 10v34l40 22V32z" fill="#7c4dff" /><path d="M10 10v34l-40 22V32z" fill="#5a2bd8" />
            <path d="M-6 -30l36-20 36 20-36 20z" fill={`url(#wm${id})`} /><path d="M-6 -30v30l36 20v-30z" fill="#ff7a3d" /><path d="M66 -30v30L30 20v-30z" fill="#e05a20" />
          </g>
        ) : (
          <g>
            <circle cx="-14" cy="-10" r="40" fill="none" stroke={`url(#fg${id})`} strokeWidth="9" />
            <circle cx="-14" cy="-10" r="30" fill={`url(#gl${id})`} />
            <path d="M16 20l40 40" stroke={`url(#wm${id})`} strokeWidth="14" strokeLinecap="round" />
            <path d="M-34 -2l12-12 10 8 18-20" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </g>
    </svg>
  )
}
