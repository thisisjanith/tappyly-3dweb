import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Preloader } from './components/Preloader'
import { SmoothScroll } from './lib/scroll'
import { TransitionProvider } from './lib/transition'

const Home = lazy(() => import('./pages/Home'))
const Services = lazy(() => import('./pages/Services'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const About = lazy(() => import('./pages/About'))
const Insights = lazy(() => import('./pages/Insights'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RouteEffects() {
  const { pathname } = useLocation()
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 600)
    document.getElementById('main')?.focus({ preventScroll: true })
    return () => clearTimeout(t)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <TransitionProvider>
      <a href="#main" className="skip-link">Skip to content</a>
      <SmoothScroll />
      <RouteEffects />
      <Preloader />
      <Nav />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        <Suspense fallback={<div style={{ minHeight: '100svh' }} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/about" element={<About />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <div className="noise" aria-hidden />
    </TransitionProvider>
  )
}
