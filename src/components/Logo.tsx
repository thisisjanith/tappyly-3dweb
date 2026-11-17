import { useId } from 'react'

export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={`lg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9a66ff" />
          <stop offset="1" stopColor="#4a1fd6" />
        </linearGradient>
        <linearGradient id={`lw${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#ff6f3d" />
          <stop offset="1" stopColor="#ffbe55" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#lg${id})`} />
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" fill="none" stroke="rgba(255,255,255,.35)" />
      <g fill="none" stroke={`url(#lw${id})`} strokeWidth="4" strokeLinecap="round">
        <path d="M36 18a10 10 0 0 1 10 10" />
        <path d="M36 10a18 18 0 0 1 18 18" />
      </g>
      <path
        d="M22 20a3.5 3.5 0 0 1 7 0v14a3 3 0 0 1 6 1 3 3 0 0 1 5.5 2 2.7 2.7 0 0 1 5 2.5V46c0 6-4.5 10-10.5 10h-4c-3 0-5-1.5-7-4l-6-8c-1.5-2 .8-4.5 3-3l3.5 3z"
        fill="#fff"
      />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span>Tappyly</span>
    </span>
  )
}
