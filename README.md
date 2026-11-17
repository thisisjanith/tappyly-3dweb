# Tappyly — Immersive 3D Website

Vite + React + TypeScript, rendered with React Three Fiber, custom GLSL and a cinematic post-processing stack.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

Add `?quality=low|mid|high` to any URL to force a GPU tier when testing.

## A different 3D experience on every page

| Page | Scene | Interaction |
| --- | --- | --- |
| Home | Glossy app icon (extruded hand + emissive signal arcs), transmissive glass cards, ridged-noise shader terrain, river of light spiralling around the icon, fbm nebula, twinkling GPU starfield | Tap the icon (press, elastic rebound, shockwave); cursor parallax; scroll moves the camera in |
| Home: work | Coverflow of shader-driven project panels | Drag or use the arrows; click to open a case study |
| Services | Glossy 3D infinity symbol (client model) with sparkles | Sways gently and tilts with the cursor; hover a service card to highlight it |
| Portfolio | Tilted wall of panels (rounded-corner SDF, hover ripple, RGB split, edge glow, sheen) | Filters fly panels away and re-flow the rest; click for details |
| About | Procedural night-time studio: real-time reflective floor, shader city skyline, neon sign, pendant lights | Cursor parallax |
| Insights | Glossy 3D infinity symbol (client model) over a starfield | Sways gently and tilts with the cursor |
| Contact | Paper plane with a glowing trail | Banks after your cursor; loops and flies off when the form is sent |

Most textures (card glyphs, project mockups, neon sign, monitors) are drawn procedurally at runtime. The client's 3D models live in `src/assests/` as originals and are served from `public/models/` as web-optimised copies (same geometry, 1024px textures), loaded through `src/three/common/BrandModel.tsx`:

| Model | Used in | Fallback if it fails to load |
| --- | --- | --- |
| `tappyly-logo.glb` | Home hero, centre | Procedural app icon |
| `infinity.glb` | Services hero; Insights hero; CTA banner (every page) | Particle galaxy; procedural ribbon |

## Performance & accessibility

- Each canvas **stops rendering completely when off-screen** (IntersectionObserver → `frameloop="never"`).
- The device tier (`src/lib/device.ts`) scales particle counts, terrain density, reflector resolution, transmission and post effects; `PerformanceMonitor` also lowers DPR if the frame rate drops.
- Pages and scenes are code-split, so each scene loads only on its own page.
- `prefers-reduced-motion`: no smooth scroll, preloader, curtain transitions or custom cursor; canvases render on demand, with short bursts of frames after input so eased changes still finish.
- If WebGL is unavailable, a CSS gradient fallback is shown instead. Canvases carry `role="img"` labels, every 3D gallery has a DOM equivalent, and there's a skip link, visible focus styles and accessible forms.

## Structure

```
src/
  three/        3D scenes (common/, hero/, services/, portfolio/, about/, insights/, contact/)
  pages/        route components
  components/   nav, footer, cursor, preloader, cards, CTA, modal, icons
  lib/          store, device tier, Lenis+GSAP scroll, reveals, transitions, GLSL, canvas textures
  data/         all copy: services, projects, articles, contact
```

## Placeholders to replace before launch

- **Copy:** client names, project results, stats and the "trusted by" marks are illustrative (`src/data/content.ts`, `src/components/Icons.tsx`).
- **Contact form:** the form has no backend yet. It validates, plays the plane animation, then opens a pre-filled `mailto:`. Swap in your API in `src/pages/Contact.tsx`.
- **Links:** "Watch Showreel" links to About, social links go to the platform home pages, and article cards are not linked to full posts yet.
