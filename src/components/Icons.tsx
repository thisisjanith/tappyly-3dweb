import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

export const Arrow = (p: P) => (<svg {...base} {...p} className={`arrow ${p.className ?? ''}`}><path d="M5 12h14M13 6l6 6-6 6" /></svg>)
export const ArrowUpRight = (p: P) => (<svg {...base} {...p}><path d="M7 17 17 7M8 7h9v9" /></svg>)
export const Chevron = (p: P) => (<svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>)
export const ChevronLeft = (p: P) => (<svg {...base} {...p}><path d="m15 6-6 6 6 6" /></svg>)
export const ChevronRight = (p: P) => (<svg {...base} {...p}><path d="m9 6 6 6-6 6" /></svg>)
export const Play = (p: P) => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" /></svg>)
export const Close = (p: P) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>)

export const Code = (p: P) => (<svg {...base} {...p}><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></svg>)
export const Chart = (p: P) => (<svg {...base} {...p}><path d="M4 20V14M9 20V10M14 20v-7M19 20V5M3 20h18" /><path d="m4 10 5-4 5 3 6-6" strokeWidth={1.4} /></svg>)
export const Pen = (p: P) => (<svg {...base} {...p}><path d="M14.5 4.5 19.5 9.5 9 20H4v-5L14.5 4.5Z" /><path d="M12.5 6.5l5 5M4 20l3-3" /></svg>)
export const Search = (p: P) => (<svg {...base} {...p}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.8-4.8M8 10.5a2.5 2.5 0 0 1 2.5-2.5" /></svg>)
export const Layers = (p: P) => (<svg {...base} {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5M3 17.5l9 5 9-5" /></svg>)
export const Bulb = (p: P) => (<svg {...base} {...p}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z" /></svg>)
export const Rocket = (p: P) => (<svg {...base} {...p}><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 15l-3-3c1-4 4-8 9.5-9 1 0 1.5.5 1.5 1.5-1 5.5-5 8.5-9 9.5Z" /><circle cx="14.5" cy="9.5" r="1.6" /><path d="M6 12H3l2.5-3.5H9M12 18v3l3.5-2.5V15" /></svg>)
export const Target = (p: P) => (<svg {...base} {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></svg>)
export const Users = (p: P) => (<svg {...base} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.5 3.3-5.5 6.5-5.5s5.9 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.6c2 .7 3.2 2.6 3.5 5.4" /></svg>)
export const Laptop = (p: P) => (<svg {...base} {...p}><rect x="4" y="5" width="16" height="11" rx="1.6" /><path d="M2 19.5h20" /></svg>)
export const Bolt = (p: P) => (<svg {...base} {...p}><path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z" /></svg>)
export const Trophy = (p: P) => (<svg {...base} {...p}><path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8 21h8M9 17h6l1 4H8l1-4Z" /></svg>)
export const Mail = (p: P) => (<svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>)
export const Phone = (p: P) => (<svg {...base} {...p}><path d="M5 3h3.5l2 5-2.5 1.5a11 11 0 0 0 6.5 6.5L16 13.5l5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" /></svg>)
export const Pin = (p: P) => (<svg {...base} {...p}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>)
export const Clock = (p: P) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>)
export const Sparkle = (p: P) => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M12 2c.6 4.9 2.8 8 9 10-6.2 2-8.4 5.1-9 10-.6-4.9-2.8-8-9-10 6.2-2 8.4-5.1 9-10Z" /></svg>)

export const LinkedIn = (p: P) => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.84-2.05 3.79-2.05 4.05 0 4.8 2.62 4.8 6.03V21h-4v-5c0-1.2-.02-2.73-1.66-2.73-1.67 0-1.92 1.3-1.92 2.64V21h-4V9.75Z" /></svg>)
export const YouTube = (p: P) => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12c0 1.3.1 2.6.4 3.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8ZM10 15.1V8.9l5.2 3.1L10 15.1Z" /></svg>)
export const XIcon = (p: P) => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.3l-4.9-6.4L5 21H1.9l7.3-8.3L1.5 3h6.4l4.4 5.9L17.5 3Zm-1.1 16.2h1.7L7 4.7H5.2l11.2 14.5Z" /></svg>)
export const Instagram = (p: P) => (<svg {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></svg>)

/** Abstract partner marks for the "trusted by" strip (fictional, generic geometry). */
export const BrandMarks = [
  (p: P) => (<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden {...p}><path d="M16 4c4 4 4 8 0 12-4-4-4-8 0-12Zm0 24c-4-4-4-8 0-12 4 4 4 8 0 12ZM4 16c4-4 8-4 12 0-4 4-8 4-12 0Z" opacity=".9" /></svg>),
  (p: P) => (<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden {...p}><rect x="5" y="5" width="9" height="22" rx="3" /><rect x="18" y="5" width="9" height="22" rx="3" /><path d="M14 16h4" /></svg>),
  (p: P) => (<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden {...p}><path d="M9 4h14v6l-4 3 4 3v12H9V16l4-3-4-3V4Z" /></svg>),
  (p: P) => (<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden {...p}><path d="M6 11V6h5M21 6h5v5M26 21v5h-5M11 26H6v-5" /><circle cx="16" cy="16" r="4" /></svg>),
  (p: P) => (<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden {...p}><path d="M6 6l10 12M26 6 16 18v9M11 6h0M21 6h0" /></svg>),
]
