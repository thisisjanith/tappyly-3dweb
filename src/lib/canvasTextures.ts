import * as THREE from 'three'
import type { Project } from '../data/content'

const FONT = "'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif"

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  return { c, ctx }
}

function toTexture(c: HTMLCanvasElement, aniso = 8) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = aniso
  t.needsUpdate = true
  return t
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/* ------------------------------------------------------------------ */
/* Glyphs for the floating glass cards in the hero                     */
/* ------------------------------------------------------------------ */
export type Glyph = 'code' | 'chart' | 'mark' | 'spark'
const glyphCache = new Map<string, THREE.Texture>()

export function glyphTexture(kind: Glyph) {
  if (glyphCache.has(kind)) return glyphCache.get(kind)!
  const S = 512
  const { c, ctx } = canvas(S, S)
  const g = ctx.createLinearGradient(0, 0, S, S)
  g.addColorStop(0, '#f1e9ff')
  g.addColorStop(1, '#a983ff')
  ctx.strokeStyle = g
  ctx.fillStyle = g
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = 'rgba(170,120,255,0.95)'
  ctx.shadowBlur = 36
  if (kind === 'code') {
    ctx.lineWidth = 34
    ctx.beginPath()
    ctx.moveTo(190, 160); ctx.lineTo(105, 256); ctx.lineTo(190, 352)
    ctx.moveTo(322, 160); ctx.lineTo(407, 256); ctx.lineTo(322, 352)
    ctx.moveTo(290, 130); ctx.lineTo(222, 382)
    ctx.stroke()
  } else if (kind === 'chart') {
    const bars = [120, 180, 250, 320]
    bars.forEach((h, i) => {
      rr(ctx, 110 + i * 80, 400 - h, 52, h, 14)
      ctx.globalAlpha = 0.55 + i * 0.15
      ctx.fill()
    })
    ctx.globalAlpha = 1
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.moveTo(110, 240); ctx.lineTo(200, 190); ctx.lineTo(280, 210); ctx.lineTo(400, 110)
    ctx.stroke()
  } else if (kind === 'mark') {
    ctx.lineWidth = 0
    ctx.beginPath()
    ctx.moveTo(100, 400); ctx.lineTo(180, 130); ctx.lineTo(256, 300); ctx.lineTo(332, 130); ctx.lineTo(412, 400)
    ctx.lineTo(340, 400); ctx.lineTo(320, 290); ctx.lineTo(256, 400); ctx.lineTo(192, 290); ctx.lineTo(172, 400)
    ctx.closePath()
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.moveTo(256, 90)
    ctx.quadraticCurveTo(276, 236, 422, 256)
    ctx.quadraticCurveTo(276, 276, 256, 422)
    ctx.quadraticCurveTo(236, 276, 90, 256)
    ctx.quadraticCurveTo(236, 236, 256, 90)
    ctx.fill()
  }
  const t = toTexture(c)
  glyphCache.set(kind, t)
  return t
}

/** Soft radial sprite used for halos and glows. */
let radialTex: THREE.Texture | null = null
export function radialTexture() {
  if (radialTex) return radialTex
  const { c, ctx } = canvas(256, 256)
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.45)')
  g.addColorStop(0.6, 'rgba(255,255,255,0.08)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  radialTex = toTexture(c, 1)
  return radialTex
}

/* ------------------------------------------------------------------ */
/* Procedural website mockups for the portfolio                        */
/* ------------------------------------------------------------------ */
const projectCache = new Map<string, THREE.Texture>()

export function projectTexture(p: Project) {
  if (projectCache.has(p.id)) return projectCache.get(p.id)!
  const W = 1280
  const H = 800
  const { c, ctx } = canvas(W, H)
  const dark = p.theme === 'dark'
  const ink = dark ? '#f4efff' : '#1a0b45'
  const sub = dark ? 'rgba(220,205,255,0.55)' : 'rgba(40,20,90,0.45)'

  // background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  if (dark) { bg.addColorStop(0, '#0d0628'); bg.addColorStop(1, '#1d0d55') }
  else { bg.addColorStop(0, '#f7f4ff'); bg.addColorStop(1, '#ddd0ff') }
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W * 0.72, H * 0.5, 0, W * 0.72, H * 0.5, W * 0.55)
  glow.addColorStop(0, dark ? 'rgba(130,70,255,0.55)' : 'rgba(150,110,255,0.35)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // nav
  ctx.fillStyle = p.accent
  rr(ctx, 70, 52, 34, 34, 10); ctx.fill()
  ctx.fillStyle = ink
  ctx.font = `700 24px ${FONT}`
  ctx.fillText(p.client, 118, 78)
  ctx.fillStyle = sub
  for (let i = 0; i < 5; i++) { rr(ctx, 640 + i * 88, 63, 60, 10, 5); ctx.fill() }
  ctx.strokeStyle = sub; ctx.lineWidth = 2
  rr(ctx, 1090, 50, 120, 38, 19); ctx.stroke()

  // visual (drawn before text so headline sits on top)
  drawVisual(ctx, p, W, H, dark)

  // headline
  ctx.fillStyle = ink
  ctx.font = `italic 750 76px ${FONT}`
  const words = p.headline.split(' ')
  const lines: string[] = []
  let line = ''
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > 520 && line) { lines.push(line); line = w } else line = test
  })
  lines.push(line)
  const top = 300 - (lines.length - 1) * 40
  lines.forEach((l, i) => ctx.fillText(l, 70, top + i * 84))
  const after = top + lines.length * 84
  ctx.fillStyle = sub
  rr(ctx, 70, after, 380, 12, 6); ctx.fill()
  rr(ctx, 70, after + 26, 300, 12, 6); ctx.fill()
  const btn = ctx.createLinearGradient(70, 0, 260, 0)
  btn.addColorStop(0, p.accent); btn.addColorStop(1, dark ? '#c9a8ff' : '#9b6bff')
  ctx.fillStyle = btn
  rr(ctx, 70, after + 70, 190, 54, 27); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = `700 20px ${FONT}`
  ctx.fillText('Get Started', 104, after + 104)

  const t = toTexture(c)
  projectCache.set(p.id, t)
  return t
}

function drawVisual(ctx: CanvasRenderingContext2D, p: Project, W: number, H: number, dark: boolean) {
  const a = p.accent
  const cx = W * 0.74
  const cy = H * 0.55
  ctx.save()
  switch (p.layout) {
    case 'dashboard':
    case 'chart': {
      const x0 = 620, x1 = 1210, y0 = 640, yT = 190
      const pts: [number, number][] = []
      for (let i = 0; i <= 24; i++) {
        const t = i / 24
        const rise = p.layout === 'chart' ? Math.pow(t, 1.6) : t * 0.8
        const n = Math.sin(i * 1.7) * 0.07 + Math.sin(i * 0.6) * 0.05
        pts.push([x0 + (x1 - x0) * t, y0 - (y0 - yT) * Math.min(1, Math.max(0.05, rise + n))])
      }
      const fill = ctx.createLinearGradient(0, yT, 0, y0)
      fill.addColorStop(0, `${a}cc`); fill.addColorStop(1, `${a}00`)
      ctx.beginPath(); ctx.moveTo(x0, y0)
      pts.forEach(([x, y]) => ctx.lineTo(x, y))
      ctx.lineTo(x1, y0); ctx.closePath(); ctx.fillStyle = fill; ctx.fill()
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.strokeStyle = '#efe6ff'; ctx.lineWidth = 4; ctx.shadowColor = a; ctx.shadowBlur = 24; ctx.stroke()
      ctx.shadowBlur = 0
      if (p.layout === 'dashboard') {
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.6)'
          rr(ctx, 640 + i * 190, 130, 170, 70, 14); ctx.fill()
          ctx.fillStyle = a; rr(ctx, 658 + i * 190, 150, 60, 10, 5); ctx.fill()
          ctx.fillStyle = dark ? '#fff' : '#1a0b45'; ctx.font = `700 22px ${FONT}`; ctx.fillText(['$84k', '12.4%', '3.2M'][i], 658 + i * 190, 186)
        }
      }
      break
    }
    case 'phone': {
      ctx.translate(cx + 40, cy + 10); ctx.rotate(0.22)
      ctx.shadowColor = 'rgba(40,10,120,0.45)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 30
      ctx.fillStyle = '#120a2e'; rr(ctx, -150, -300, 300, 600, 46); ctx.fill()
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
      const s = ctx.createLinearGradient(0, -280, 0, 280)
      s.addColorStop(0, '#2a1470'); s.addColorStop(1, '#5b2bd8')
      ctx.fillStyle = s; rr(ctx, -136, -286, 272, 572, 36); ctx.fill()
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; rr(ctx, -110, -200 + i * 90, 220, 70, 16); ctx.fill()
        ctx.fillStyle = i % 2 ? a : '#c9a8ff'; ctx.beginPath(); ctx.arc(-80, -165 + i * 90, 18, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; rr(ctx, -50, -180 + i * 90, 120, 10, 5); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; rr(ctx, -50, -160 + i * 90, 80, 8, 4); ctx.fill()
      }
      break
    }
    case 'building': {
      const base = 720
      const cols = ['#5a2bd8', '#7c4dff', '#3d1aa8']
      ;[[760, 260, 120], [880, 140, 150], [1040, 300, 110]].forEach(([x, top, w], i) => {
        const g = ctx.createLinearGradient(x, top, x + w, base)
        g.addColorStop(0, cols[i]); g.addColorStop(1, '#1c0b55')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, top + 30); ctx.lineTo(x + w * 0.5, top); ctx.lineTo(x + w, top + 30); ctx.lineTo(x + w, base); ctx.fill()
        ctx.fillStyle = 'rgba(220,200,255,0.35)'
        for (let yy = top + 60; yy < base - 20; yy += 34) for (let xx = x + 14; xx < x + w - 14; xx += 26) ctx.fillRect(xx, yy, 14, 18)
      })
      break
    }
    case 'orb':
    case 'blob': {
      for (let i = 0; i < 9; i++) {
        const r = 230 - i * 18
        const ang = i * 0.5
        const g = ctx.createRadialGradient(cx - 60 + Math.cos(ang) * 30, cy - 70, 10, cx, cy, r)
        g.addColorStop(0, p.layout === 'orb' ? '#e9dcff' : '#ffffff')
        g.addColorStop(0.45, a)
        g.addColorStop(1, p.layout === 'orb' ? '#1c0a5a' : '#6b2bff00')
        ctx.globalAlpha = 0.22
        ctx.fillStyle = g
        ctx.beginPath(); ctx.ellipse(cx + Math.sin(i) * 40, cy + Math.cos(i * 1.3) * 30, r, r * 0.82, ang, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.strokeStyle = 'rgba(240,230,255,0.55)'; ctx.lineWidth = 26
      ctx.shadowColor = a; ctx.shadowBlur = 40
      ctx.beginPath(); ctx.ellipse(cx, cy, 170, 110, -0.5, 0.3, Math.PI * 1.7); ctx.stroke()
      break
    }
    case 'portrait': {
      const g = ctx.createRadialGradient(cx, cy - 60, 20, cx, cy, 380)
      g.addColorStop(0, '#6b3cff'); g.addColorStop(1, 'rgba(20,8,60,0)')
      ctx.fillStyle = g; ctx.fillRect(560, 100, 720, 700)
      ctx.fillStyle = '#0a0420'
      ctx.beginPath(); ctx.ellipse(cx, cy - 90, 110, 130, 0, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx - 260, H); ctx.quadraticCurveTo(cx - 220, cy + 60, cx, cy + 50); ctx.quadraticCurveTo(cx + 220, cy + 60, cx + 260, H); ctx.fill()
      ctx.fillStyle = '#2a145f'; rr(ctx, cx - 120, cy - 130, 240, 80, 34); ctx.fill()
      ctx.strokeStyle = '#c9a8ff'; ctx.lineWidth = 4; ctx.shadowColor = '#a46bff'; ctx.shadowBlur = 30
      rr(ctx, cx - 120, cy - 130, 240, 80, 34); ctx.stroke()
      ctx.beginPath(); ctx.ellipse(cx, cy - 90, 112, 132, 0, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke()
      break
    }
    case 'grid': {
      for (let i = 0; i < 6; i++) {
        const x = 640 + (i % 3) * 190
        const y = 170 + Math.floor(i / 3) * 260
        ctx.fillStyle = 'rgba(255,255,255,0.75)'
        ctx.shadowColor = 'rgba(80,40,180,0.25)'; ctx.shadowBlur = 30
        rr(ctx, x, y, 170, 230, 22); ctx.fill()
        ctx.shadowBlur = 0
        const g = ctx.createLinearGradient(x, y, x + 170, y + 150)
        g.addColorStop(0, i % 2 ? '#ffb48a' : '#c9a8ff'); g.addColorStop(1, i % 2 ? a : '#7c4dff')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + 85, y + 90, 52, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(40,20,90,0.35)'; rr(ctx, x + 24, y + 175, 100, 10, 5); ctx.fill()
      }
      break
    }
  }
  ctx.restore()
}

/* ------------------------------------------------------------------ */
/* Neon wall sign for the About office scene                            */
/* ------------------------------------------------------------------ */
export function neonSignTexture() {
  const W = 1024
  const H = 320
  const { c, ctx } = canvas(W, H)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  // mark
  ctx.save()
  ctx.translate(70, 60)
  ctx.shadowColor = '#a46bff'; ctx.shadowBlur = 40
  const mg = ctx.createLinearGradient(0, 0, 200, 200)
  mg.addColorStop(0, '#b08aff'); mg.addColorStop(1, '#6b2bff')
  ctx.fillStyle = mg; rr(ctx, 0, 0, 200, 200, 52); ctx.fill()
  ctx.strokeStyle = '#ffb44d'; ctx.lineWidth = 14; ctx.shadowColor = '#ff8a3d'
  ctx.beginPath(); ctx.arc(110, 90, 36, -Math.PI / 2, 0); ctx.stroke()
  ctx.beginPath(); ctx.arc(110, 90, 66, -Math.PI / 2, 0); ctx.stroke()
  ctx.fillStyle = '#fff'; ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 30
  rr(ctx, 62, 62, 26, 90, 13); ctx.fill()
  rr(ctx, 62, 118, 90, 60, 22); ctx.fill()
  ctx.restore()
  // word
  ctx.font = `700 150px ${FONT}`
  ctx.textBaseline = 'middle'
  for (let pass = 0; pass < 3; pass++) {
    ctx.shadowColor = pass < 2 ? '#a46bff' : '#ffffff'
    ctx.shadowBlur = [60, 24, 6][pass]
    ctx.fillStyle = pass < 2 ? '#c9a8ff' : '#ffffff'
    ctx.fillText('Tappyly', 310, 168)
  }
  return toTexture(c)
}
