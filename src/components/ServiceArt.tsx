import { useId, type ReactNode } from 'react'

/**
 * Glossy pseudo-3D illustrations for the home-page service tiles, drawn in the site palette
 * (violet faces, deep-indigo extrusions, amber/orange accents). Pure SVG: no assets, scales crisply.
 */

type Ids = { face: string; side: string; top: string; hi: string; orange: string; glass: string; glow: string }

function Defs({ id }: { id: Ids }) {
  return (
    <defs>
      <linearGradient id={id.face} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#a97bff" />
        <stop offset="0.55" stopColor="#6d32f5" />
        <stop offset="1" stopColor="#4a17d6" />
      </linearGradient>
      <linearGradient id={id.side} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3b14b0" />
        <stop offset="1" stopColor="#1f0870" />
      </linearGradient>
      <linearGradient id={id.top} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#d9c6ff" />
        <stop offset="1" stopColor="#9c6bff" />
      </linearGradient>
      <linearGradient id={id.hi} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={id.orange} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffc46b" />
        <stop offset="1" stopColor="#ff6a2b" />
      </linearGradient>
      <linearGradient id={id.glass} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#d6c3ff" stopOpacity="0.55" />
        <stop offset="1" stopColor="#7b3cff" stopOpacity="0.15" />
      </linearGradient>
      <filter id={id.glow} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  )
}

/** Isometric bar: front face, lit top, shaded side. */
function Prism({ x, base, w, h, d = 9, id }: { x: number; base: number; w: number; h: number; d?: number; id: Ids }) {
  const t = base - h
  return (
    <g>
      <path d={`M${x + w} ${t}l${d} ${-d * 0.7}V${base - d * 0.7}l${-d} ${d * 0.7}Z`} fill={`url(#${id.side})`} />
      <path d={`M${x} ${t}l${d} ${-d * 0.7}h${w}l${-d} ${d * 0.7}Z`} fill={`url(#${id.top})`} />
      <rect x={x} y={t} width={w} height={h} rx="2" fill={`url(#${id.face})`} />
      <rect x={x + 3} y={t + 3} width={w * 0.35} height={h - 6} rx="2" fill={`url(#${id.hi})`} opacity="0.6" />
    </g>
  )
}

const arts: Record<string, (id: Ids) => ReactNode> = {
  // browser window with a glowing code glyph
  'web-development': (id) => (
    <g transform="rotate(-8 80 72)">
      <rect x="30" y="34" width="112" height="84" rx="14" fill={`url(#${id.side})`} />
      <rect x="20" y="24" width="112" height="84" rx="14" fill={`url(#${id.face})`} />
      <rect x="20" y="24" width="112" height="22" rx="14" fill="#fff" opacity="0.1" />
      <path d="M20 46h112" stroke="#d6c3ff" strokeOpacity="0.35" />
      <circle cx="34" cy="35" r="3.2" fill="#e9dcff" /><circle cx="44" cy="35" r="3.2" fill="#e9dcff" opacity="0.8" /><circle cx="54" cy="35" r="3.2" fill="#e9dcff" opacity="0.6" />
      <rect x="104" y="32" width="18" height="5" rx="2.5" fill="#e9dcff" opacity="0.7" />
      <g filter={`url(#${id.glow})`} stroke="#f1e8ff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="m60 64-13 13 13 13M92 64l13 13-13 13M82 58l-12 38" />
      </g>
      <rect x="24" y="28" width="104" height="30" rx="12" fill={`url(#${id.hi})`} opacity="0.5" />
    </g>
  ),
  // rising bars with an orange trend arrow
  'digital-marketing': (id) => (
    <g>
      <Prism x={30} base={124} w={24} h={30} id={id} />
      <Prism x={66} base={124} w={24} h={52} id={id} />
      <Prism x={102} base={124} w={24} h={78} id={id} />
      <g filter={`url(#${id.glow})`}>
        <path d="M22 84C52 80 84 62 120 26" stroke={`url(#${id.orange})`} strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="m104 22 22-4-3 22Z" fill={`url(#${id.orange})`} />
      </g>
    </g>
  ),
  // vector pen nib inside a bezier frame
  'branding-design': (id) => (
    <g>
      <g stroke="#c9b2ff" strokeOpacity="0.7" strokeWidth="1.6">
        <path d="M36 30 128 22 140 104 46 116Z" fill="none" />
      </g>
      <g transform="rotate(18 86 72)">
        <path d="M86 18 112 66 98 104H74L60 66Z" fill={`url(#${id.side})`} transform="translate(5 5)" />
        <path d="M86 18 112 66 98 104H74L60 66Z" fill={`url(#${id.face})`} />
        <path d="M86 18 60 66 74 104H86Z" fill={`url(#${id.hi})`} opacity="0.55" />
        <path d="M86 30V70" stroke="#2a0c85" strokeWidth="3" strokeLinecap="round" />
        <circle cx="86" cy="74" r="6" fill="#2a0c85" /><circle cx="86" cy="74" r="2.6" fill="#e9dcff" />
        <rect x="70" y="104" width="32" height="14" rx="4" fill={`url(#${id.top})`} />
      </g>
      {[[36, 30], [128, 22], [140, 104], [46, 116]].map(([x, y], i) => (
        <rect key={i} x={x - 7} y={y - 7} width="14" height="14" rx="3" fill={i % 2 ? `url(#${id.orange})` : `url(#${id.top})`} filter={`url(#${id.glow})`} />
      ))}
    </g>
  ),
  // magnifier lens over a growth line
  'seo-growth': (id) => (
    <g>
      <path d="m104 96 30 30" stroke={`url(#${id.side})`} strokeWidth="18" strokeLinecap="round" />
      <path d="m104 96 30 30" stroke={`url(#${id.orange})`} strokeWidth="11" strokeLinecap="round" />
      <circle cx="74" cy="64" r="44" fill={`url(#${id.side})`} transform="translate(4 5)" />
      <circle cx="74" cy="64" r="44" fill={`url(#${id.face})`} />
      <circle cx="74" cy="64" r="32" fill="#12063c" />
      <circle cx="74" cy="64" r="32" fill={`url(#${id.glass})`} />
      <g filter={`url(#${id.glow})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M52 78 66 66l10 8 20-22" stroke="#ffb44d" strokeWidth="5" />
        <path d="M86 50h11v11" stroke="#ffb44d" strokeWidth="5" />
      </g>
      <path d="M48 46a32 32 0 0 1 22-14" stroke="#fff" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" fill="none" />
    </g>
  ),
  // tilted phone with UI blocks
  'ui-ux-design': (id) => (
    <g transform="rotate(16 82 72)">
      <rect x="54" y="8" width="64" height="122" rx="15" fill={`url(#${id.side})`} />
      <rect x="46" y="4" width="64" height="122" rx="15" fill={`url(#${id.face})`} />
      <rect x="52" y="12" width="52" height="106" rx="10" fill="#1a0a52" />
      <rect x="68" y="16" width="20" height="5" rx="2.5" fill="#3a1a9e" />
      <rect x="58" y="30" width="40" height="15" rx="6" fill={`url(#${id.top})`} opacity="0.95" />
      <rect x="58" y="51" width="40" height="15" rx="6" fill="#7c4dff" opacity="0.85" />
      <rect x="58" y="72" width="40" height="15" rx="6" fill="#7c4dff" opacity="0.6" />
      <rect x="58" y="96" width="40" height="13" rx="6.5" fill={`url(#${id.orange})`} filter={`url(#${id.glow})`} />
      <rect x="50" y="8" width="20" height="112" rx="10" fill={`url(#${id.hi})`} opacity="0.35" />
    </g>
  ),
  // glossy idea bulb with a warm filament
  consulting: (id) => (
    <g>
      <g stroke="#c9b2ff" strokeOpacity="0.6" strokeWidth="4" strokeLinecap="round">
        <path d="M80 6v10M34 26l8 7M126 26l-8 7M22 66h11M138 66h-11" />
      </g>
      <path d="M80 22a40 40 0 0 0-24 72c5 4 8 9 8 15h32c0-6 3-11 8-15a40 40 0 0 0-24-72Z" fill={`url(#${id.side})`} transform="translate(4 4)" />
      <path d="M80 22a40 40 0 0 0-24 72c5 4 8 9 8 15h32c0-6 3-11 8-15a40 40 0 0 0-24-72Z" fill={`url(#${id.face})`} />
      <path d="M80 22a40 40 0 0 0-24 72c5 4 8 9 8 15h32c0-6 3-11 8-15a40 40 0 0 0-24-72Z" fill={`url(#${id.glass})`} />
      <path d="M68 104V82l-8-14M92 104V82l8-14M68 82h24" stroke={`url(#${id.orange})`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter={`url(#${id.glow})`} />
      <rect x="62" y="110" width="36" height="9" rx="4.5" fill={`url(#${id.top})`} />
      <rect x="66" y="122" width="28" height="9" rx="4.5" fill={`url(#${id.top})`} opacity="0.8" />
      <path d="M58 46a28 28 0 0 1 16-14" stroke="#fff" strokeOpacity="0.75" strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
  ),
}

export function ServiceArt({ id: service, className }: { id: string; className?: string }) {
  const uid = useId().replace(/:/g, '')
  const id: Ids = { face: `${uid}f`, side: `${uid}s`, top: `${uid}t`, hi: `${uid}h`, orange: `${uid}o`, glass: `${uid}g`, glow: `${uid}w` }
  const draw = arts[service] ?? arts['web-development']
  return (
    <svg viewBox="0 0 160 140" className={className} aria-hidden>
      <Defs id={id} />
      {draw(id)}
    </svg>
  )
}
