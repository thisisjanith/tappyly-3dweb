import type { ComponentType, SVGProps } from 'react'
import { Code, Chart, Pen, Search, Layers, Bulb, Rocket } from '../components/Icons'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

export const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services', dropdown: true },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'About', to: '/about' },
  { label: 'Insights', to: '/insights' },
  { label: 'Contact', to: '/contact' },
]

export type Service = {
  id: string
  title: string
  short: string
  description: string
  icon: Icon
  points: string[]
  /** Index of the procedural ribbon form the Services scene morphs into. */
  shape: number
  hue: [string, string]
}

export const SERVICES: Service[] = [
  {
    id: 'web-development', title: 'Web Development', short: 'Modern, scalable and high-performance websites.', icon: Code, shape: 1,
    description: 'Fast, accessible and beautifully engineered websites and web apps — from marketing sites to complex platforms.',
    points: ['React, Next.js & headless CMS', 'E-commerce & custom platforms', 'Performance & Core Web Vitals'], hue: ['#7c3aff', '#38bdf8'],
  },
  {
    id: 'digital-marketing', title: 'Digital Marketing', short: 'Data-driven strategies for real growth.', icon: Chart, shape: 2,
    description: 'Full-funnel campaigns built on data — paid media, social and content that turn attention into revenue.',
    points: ['Paid social & search', 'Content & social strategy', 'Analytics & attribution'], hue: ['#a855f7', '#ff7a3d'],
  },
  {
    id: 'branding-design', title: 'Branding & Design', short: 'Build a brand that stands out.', icon: Pen, shape: 3,
    description: 'Identities with intent — strategy, naming, logo systems and brand guidelines that scale across every touchpoint.',
    points: ['Brand strategy & positioning', 'Logo & visual identity', 'Guidelines & brand systems'], hue: ['#ec4899', '#ffb44d'],
  },
  {
    id: 'seo-growth', title: 'SEO & Growth', short: 'Get found. Stay ahead.', icon: Search, shape: 4,
    description: 'Technical SEO, content and conversion optimisation that compound — so the right people find you first.',
    points: ['Technical & local SEO', 'Content & keyword strategy', 'CRO & experimentation'], hue: ['#6366f1', '#22d3ee'],
  },
  {
    id: 'ui-ux-design', title: 'UI/UX Design', short: 'Design experiences people love.', icon: Layers, shape: 5,
    description: 'Research-led product design — journeys, wireframes, prototypes and design systems your users will love.',
    points: ['User research & journeys', 'Prototyping & usability testing', 'Design systems'], hue: ['#8b5cf6', '#f472b6'],
  },
  {
    id: 'consulting', title: 'Consulting', short: 'Turn ideas into impact.', icon: Bulb, shape: 0,
    description: 'Digital strategy and technology advisory for teams who want clarity on where to invest and how to win.',
    points: ['Digital transformation roadmaps', 'Tech stack & architecture', 'Growth workshops'], hue: ['#7c3aff', '#ff8a3d'],
  },
]

export const PROCESS = [
  { n: '01', title: 'Discover', text: 'Understand your goals and vision.', icon: Bulb },
  { n: '02', title: 'Plan', text: 'Craft a strategy that works.', icon: Pen },
  { n: '03', title: 'Build', text: 'Bring your ideas to life.', icon: Rocket },
  { n: '04', title: 'Grow', text: 'Scale your success together.', icon: Chart },
]

export type Project = {
  id: string
  title: string
  client: string
  category: 'Web Apps' | 'Branding' | 'Marketing' | 'UI/UX'
  headline: string
  summary: string
  result: string
  year: string
  /** Palette + layout seed for the procedurally drawn mockup texture. */
  theme: 'dark' | 'light'
  accent: string
  layout: 'dashboard' | 'phone' | 'building' | 'orb' | 'portrait' | 'blob' | 'chart' | 'grid'
}

export const PROJECTS: Project[] = [
  { id: 'lumen', title: 'Lumen Analytics', client: 'Lumen Data', category: 'Web Apps', headline: 'Smarter Decisions.', layout: 'dashboard', theme: 'dark', accent: '#8b5cff', year: '2025',
    summary: 'A real-time analytics platform that turns millions of events into decisions in seconds.', result: '3.4× faster reporting' },
  { id: 'kin', title: 'Kin Community App', client: 'Kin Social', category: 'UI/UX', headline: 'Better Together.', layout: 'phone', theme: 'light', accent: '#ff8a3d', year: '2025',
    summary: 'A mobile-first community product designed around belonging, built with a modular design system.', result: '+62% weekly retention' },
  { id: 'apex', title: 'Apex Properties', client: 'Apex Group', category: 'Branding', headline: 'Dream Bigger.', layout: 'building', theme: 'light', accent: '#6b2bff', year: '2024',
    summary: 'A confident new identity and digital presence for a premium real estate developer.', result: '2× qualified leads' },
  { id: 'nova', title: 'Nova Labs Launch', client: 'Nova Labs', category: 'Marketing', headline: 'Innovate Faster.', layout: 'orb', theme: 'dark', accent: '#a46bff', year: '2025',
    summary: 'An integrated launch campaign across paid social, search and content for a deep-tech startup.', result: '1.8M campaign reach' },
  { id: 'vrse', title: 'VRSE Studio', client: 'VRSE', category: 'Web Apps', headline: 'Innovate Without Limits', layout: 'portrait', theme: 'dark', accent: '#7c5cff', year: '2024',
    summary: 'An immersive WebGL portfolio platform for an XR production studio.', result: 'Awwwards Honourable Mention' },
  { id: 'helix', title: 'Helix Fintech', client: 'Helix', category: 'UI/UX', headline: 'Smarter Solutions, Brighter Future', layout: 'blob', theme: 'light', accent: '#8b5cff', year: '2025',
    summary: 'Product design for a digital banking experience that makes money feel simple.', result: '4.8★ app store rating' },
  { id: 'peak', title: 'Peak Commerce', client: 'Peak Retail', category: 'Marketing', headline: 'Grow Your Business', layout: 'chart', theme: 'dark', accent: '#c084fc', year: '2024',
    summary: 'Performance marketing and CRO programme for a fast-growing e-commerce brand.', result: '+148% online revenue' },
  { id: 'aura', title: 'Aura Wellness', client: 'Aura', category: 'Branding', headline: 'Feel the Difference.', layout: 'grid', theme: 'light', accent: '#ff7a3d', year: '2025',
    summary: 'Brand identity, packaging and web for a modern wellness label.', result: '35 retail partners in 6 months' },
]

export const FILTERS = ['All', 'Web Apps', 'Branding', 'Marketing', 'UI/UX'] as const

export type Article = {
  id: string
  category: 'Web Development' | 'Digital Marketing' | 'Branding' | 'SEO & Growth' | 'UI/UX Design'
  title: string
  excerpt: string
  date: string
  read: string
  /** Particle morph target in the Insights scene. */
  shape: number
}

export const ARTICLES: Article[] = [
  { id: 'future-web-2025', category: 'Web Development', title: 'The Future of Web Development in 2025', excerpt: 'Edge rendering, AI-assisted tooling and the return of craft — what matters next.', date: 'Apr 24, 2025', read: '5 min read', shape: 1 },
  { id: 'marketing-strategies', category: 'Digital Marketing', title: '10 Proven Digital Marketing Strategies', excerpt: 'Ten tactics we use to turn modest budgets into measurable, compounding growth.', date: 'Apr 18, 2025', read: '6 min read', shape: 2 },
  { id: 'strong-brand', category: 'Branding', title: 'Building a Strong Brand in the Digital Age', excerpt: 'Consistency, character and systems: how great brands stay memorable online.', date: 'Apr 12, 2025', read: '4 min read', shape: 3 },
  { id: 'seo-playbook', category: 'SEO & Growth', title: 'The Modern SEO Playbook: Beyond Keywords', excerpt: 'Search is changing fast. Here is how to build durable organic visibility.', date: 'Mar 30, 2025', read: '7 min read', shape: 4 },
  { id: 'design-systems', category: 'UI/UX Design', title: 'Why Every Growing Product Needs a Design System', excerpt: 'Ship faster and stay consistent — the business case for design systems.', date: 'Mar 21, 2025', read: '5 min read', shape: 1 },
  { id: 'webgl-brands', category: 'Web Development', title: 'Immersive 3D on the Web: When It Pays Off', excerpt: 'WebGL can delight or distract. A framework for using 3D with purpose.', date: 'Mar 09, 2025', read: '6 min read', shape: 0 },
]

export const CONTACT = {
  email: 'hello@tappyly.com',
  phone: '+94 11 234 5678',
  location: 'Colombo, Sri Lanka',
}

export const COMPANY = 'Tappyly Technologies (Private) Limited'
