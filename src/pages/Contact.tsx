import { lazy, useRef, useState, type FormEvent } from 'react'
import { SceneCanvas } from '../three/common/SceneCanvas'
import { SEND_EVENT } from '../lib/store'
import { useReveal } from '../lib/hooks'
import { MagneticButton } from '../components/Button'
import { Arrow, Mail, Phone, Pin } from '../components/Icons'
import { CONTACT, SERVICES } from '../data/content'
import { usePageMeta } from './meta'
import { HeroBackdrop } from '../components/HeroBackdrop'
import contactBg from '../assets/contact-bg.jpg'

const PlaneScene = lazy(() => import('../three/contact/PlaneScene'))

type Errors = Partial<Record<'name' | 'email' | 'message', string>>

export default function Contact() {
  usePageMeta('Contact — Tappyly', "Have a project in mind? Let's talk. Tappyly, Colombo, Sri Lanka.")
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  const [form, setForm] = useState({ name: '', email: '', service: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const validate = (): Errors => {
    const e: Errors = {}
    if (form.name.trim().length < 2) e.name = 'Please tell us your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.'
    if (form.message.trim().length < 10) e.message = 'A few more words about your project, please (10+ characters).'
    return e
  }

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0]
      document.getElementById(`c-${first}`)?.focus()
      return
    }
    setStatus('sending')
    window.dispatchEvent(new Event(SEND_EVENT))
    // No backend is wired up yet — opening the visitor's mail client keeps the message deliverable.
    setTimeout(() => {
      setStatus('sent')
      const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})${form.service ? `\nService: ${form.service}` : ''}`)
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('New project enquiry')}&body=${body}`
    }, 1400)
  }

  const field = (k: keyof typeof form) => ({
    id: `c-${k}`,
    value: form[k],
    onChange: (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value })),
    'aria-invalid': !!errors[k as keyof Errors],
    'aria-describedby': errors[k as keyof Errors] ? `c-${k}-err` : undefined,
  })

  return (
    <div ref={root}>
      <section className="page-hero" style={{ minHeight: '100svh' }} aria-labelledby="contact-title">
        <HeroBackdrop src={contactBg} position="60% 50%" mobilePosition="78% 40%" />
        <div className="hero__bg">
          <SceneCanvas camera={{ position: [0, 0, 10], fov: 38 }} label="A glowing paper plane that follows your cursor">
            <PlaneScene />
          </SceneCanvas>
        </div>
        <div className="container hero__content" style={{ pointerEvents: 'auto' }}>
          <div className="split split--even">
            <div className="split__intro">
              <h1 id="contact-title" className="h1" data-split data-immediate>
                Let&apos;s Build Something <span className="grad">Great</span> Together.
              </h1>
              <p className="lead" data-reveal data-immediate data-delay="0.3">Have a project in mind? Let&apos;s talk. We&apos;d love to hear from you.</p>
              <div data-reveal data-immediate data-delay="0.4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginTop: 36 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <span className="icon-chip glass" style={{ flex: 'none' }}><Mail style={{ width: 20 }} /></span>
                  <div style={{ fontSize: 14 }}>
                    <a href={`mailto:${CONTACT.email}`} style={{ display: 'block', fontWeight: 600 }}>{CONTACT.email}</a>
                    <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} style={{ color: 'var(--muted)' }}>{CONTACT.phone}</a>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <span className="icon-chip glass" style={{ flex: 'none' }}><Phone style={{ width: 20 }} /></span>
                  <div style={{ fontSize: 14 }}>
                    <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} style={{ display: 'block', fontWeight: 600 }}>{CONTACT.phone}</a>
                    <span style={{ color: 'var(--muted)', display: 'flex', gap: 4, alignItems: 'center' }}><Pin style={{ width: 14 }} />{CONTACT.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <form className="glass glass--clear" onSubmit={submit} noValidate data-reveal data-immediate data-delay="0.3" style={{ padding: 'clamp(20px, 3vw, 32px)', borderRadius: 24, display: 'grid', gap: 14 }} aria-label="Project enquiry">
              {status === 'sent' ? (
                <div role="status" style={{ padding: '40px 8px', textAlign: 'center' }}>
                  <div className="h3">Message on its way ✈️</div>
                  <p className="body" style={{ marginTop: 10 }}>Your email app should open with your message ready to send. We reply within one business day.</p>
                  <button className="link-arrow" style={{ marginTop: 18 }} onClick={() => { setStatus('idle'); setForm({ name: '', email: '', service: '', message: '' }) }} type="button">Send another <Arrow /></button>
                </div>
              ) : (
                <>
                  <div className={`field ${errors.name ? 'is-invalid' : ''}`}>
                    <label htmlFor="c-name">Your Name</label>
                    <input {...field('name')} autoComplete="name" placeholder="Jane Perera" />
                    {errors.name && <div id="c-name-err" className="field__err">{errors.name}</div>}
                  </div>
                  <div className={`field ${errors.email ? 'is-invalid' : ''}`}>
                    <label htmlFor="c-email">Your Email</label>
                    <input {...field('email')} type="email" autoComplete="email" placeholder="jane@company.com" />
                    {errors.email && <div id="c-email-err" className="field__err">{errors.email}</div>}
                  </div>
                  <div className="field">
                    <label id="c-service-l">Interested in</label>
                    <div className="pill-row" role="group" aria-labelledby="c-service-l">
                      {SERVICES.map((s) => (
                        <button type="button" key={s.id} className={`pill ${form.service === s.title ? 'is-active' : ''}`} aria-pressed={form.service === s.title} onClick={() => setForm((f) => ({ ...f, service: f.service === s.title ? '' : s.title }))} style={{ height: 32, fontSize: 12, padding: '0 12px' }}>
                          {s.title}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`field ${errors.message ? 'is-invalid' : ''}`}>
                    <label htmlFor="c-message">Tell us about your project…</label>
                    <textarea {...field('message')} placeholder="Goals, timeline, budget — anything that helps." />
                    {errors.message && <div id="c-message-err" className="field__err">{errors.message}</div>}
                  </div>
                  <MagneticButton type="submit" disabled={status === 'sending'} className="send-btn">
                    {status === 'sending' ? 'Sending…' : 'Send Message'} <Arrow />
                  </MagneticButton>
                </>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
