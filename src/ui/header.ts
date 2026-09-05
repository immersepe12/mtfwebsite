import './header.css'
import type { Chapter } from '../engine/chapter'
import type { ScrollEngine } from '../engine/scroll'
import type { Stage } from '../engine/stage'
import { gsap } from '../engine/scroll'
import { CustomEase } from 'gsap/CustomEase'
import { mark } from '../art/mark'
import { clamp } from '../engine/utils'

/**
 * Header + REGISTER pill + nav overlay — DESIGN-BIBLE §7.2, §7.3, §7.5.
 *
 *   header    the MTF sea-line mark (draws on mtf:ready) · MTF 2026 · the REGISTER pill · the menu ring
 *   pill      face = the live sky (--sky-now); date label from Ch 08 on ≥ 1100 px; gold-faced in Ch 13–14;
 *             two-layer magnet ≤ 6 px; bottom-centre clone under 600 px
 *   overlay   six giant Fraunces items with mono indices + sub-labels, hairlines drawing, siblings dimming,
 *             the sea-line behind the list, the mono row, the meta column with the day count, socials;
 *             #app inert while open, focus trapped, Esc closes, navigate = close then scroll.scrollTo(target)
 *
 * Dev hook: window.__mtf.openNav() / closeNav() (used by shots/shot-nav.mjs).
 */

type NavRow = { title: string; sub: string }

/** §7.5 — the six items. Titles/sub-labels are the bible's designed copy; the facts inside them are checked against content.json below. */
const NAV_TABLE: Record<string, NavRow> = {
  hero: { title: 'The Sun', sub: 'Stewardship · Unity · Net Positive' },
  paradise: { title: 'Three Days', sub: '25 · 26 · 27 November' },
  eleven: { title: 'Eleven for Eleven', sub: 'MTF Brain Think Tanks' },
  rudder: { title: 'The Four', sub: 'Beautiful Destinations · MED READY · AI · Coffee' },
  hand: { title: "Calypso's Odyssey", sub: 'The Gala · 26 November' },
  register: { title: 'Register', sub: 'The application' },
}

const MOTION_KEY = 'mtf-motion'
const PRESS = (() => { try { return CustomEase.create('mtf-press', '.22,1,.36,1') } catch { return 'power4.out' } })()

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
const utc = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) }
const monthLong = (t: number) => new Date(t).toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' })

/** Read the stored MOTION preference (FULL / REDUCED). null = follow the OS. */
function storedMotion(): 'full' | 'reduced' | null {
  try { const v = localStorage.getItem(MOTION_KEY); return v === 'full' || v === 'reduced' ? v : null } catch { return null }
}

export function initHeader({ scroll, chapters, content, stage }: { scroll: ScrollEngine; chapters: Chapter[]; content: any; stage?: Stage }) {
  const html = document.documentElement
  const header = document.getElementById('site-header') as HTMLElement | null
  const nav = document.getElementById('site-nav') as HTMLElement | null
  const app = document.getElementById('app') as HTMLElement | null
  if (!header || !nav) return

  const ev = content?.event ?? {}
  const startIso: string = ev.dates?.start ?? '2026-11-25'
  const endIso: string = ev.dates?.end ?? '2026-11-27'
  const galaIso: string = content?.gala?.date ?? '2026-11-26'
  const startT = utc(startIso), endT = utc(endIso)
  const dayOf = (t: number) => new Date(t).getUTCDate()
  const forumName: string = String(ev.name?.value ?? 'Mediterranean Tourism Forum').replace(/\s+\d{4}$/, '')
  const editionLabel: string = ev.editionLabel ?? `${ev.edition?.ordinal ?? '11th'} edition`
  const datesShort: string = ev.dates?.displayShort ?? '25–27 Nov 2026'
  const city: string = ev.city?.value ?? 'Malta'
  const dateChip = datesShort.replace(/\s+\d{4}$/, '')  // "25–27 Nov"

  // facts inside the designed sub-labels come from content.json
  const days: number[] = []
  for (let t = startT; t <= endT; t += 864e5) days.push(dayOf(t))
  NAV_TABLE.hero.sub = ev.theme?.expansion ?? NAV_TABLE.hero.sub
  NAV_TABLE.paradise.sub = `${days.join(' · ')} ${monthLong(startT)}`
  NAV_TABLE.hand.sub = `The Gala · ${dayOf(utc(galaIso))} ${monthLong(utc(galaIso))}`

  /* ───────────── header ───────────── */
  const brand = header.querySelector('.header__brand') as HTMLAnchorElement | null
  const markEl = header.querySelector('.header__mark') as HTMLElement | null
  const cta = header.querySelector('.header__cta') as HTMLAnchorElement | null
  const toggle = header.querySelector('[data-nav-toggle]') as HTMLButtonElement | null

  if (markEl) {
    markEl.innerHTML = mark(26)
    markEl.querySelector('path')?.style.removeProperty('stroke')   // CSS owns the stroke (ink on paper, gold on hover)
    const draw = () => markEl.classList.add('is-drawn')
    if (html.classList.contains('is-ready')) draw()
    else document.addEventListener('mtf:ready', draw, { once: true })
  }

  const dressPill = (a: HTMLAnchorElement) => {
    a.innerHTML = `<span class="flood" aria-hidden="true"></span><i class="btn__rim btn__rim--1" aria-hidden="true"></i><i class="btn__rim btn__rim--2" aria-hidden="true"></i><span class="btn__label"><span class="header__cta-text">Register</span><span class="header__cta-date" aria-hidden="true">&nbsp;· ${esc(dateChip)}</span></span><span class="btn__arrow" aria-hidden="true">→</span>`
    a.setAttribute('aria-label', `Register · ${datesShort}`)
  }
  const pills: HTMLAnchorElement[] = []
  if (cta) { dressPill(cta); pills.push(cta) }

  // < 600 px: the pill lives bottom-centre (the header hides its own copy in CSS)
  if (cta) {
    const dock = document.createElement('div')
    dock.className = 'header__dock'
    const clone = cta.cloneNode(false) as HTMLAnchorElement
    clone.classList.add('header__cta--bottom')
    dressPill(clone)
    dock.appendChild(clone)
    header.insertAdjacentElement('afterend', dock)
    pills.push(clone)
  }

  /* ───────────── nav overlay ───────────── */
  const items = chapters.filter(c => c.inNav)
  const socials: { network: string; url: string }[] = (content?.contact?.socials?.items ?? []).filter((s: any) => s?.url && s?.network)
  const hotelsUrl: string | undefined = content?.hotels?.currentUrl
  const watchUrl: string | undefined = content?.registration?.watchLastYear?.currentUrl
  const shortName: string = ev.shortName?.value ?? 'MTF11'
  const lastYear = `MTF${Math.max(1, Number(ev.edition?.value ?? 11) - 1)}`

  const ext = (href: string, label: string, cls = 'nav__link') => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${label}<span class="nav__ext" aria-hidden="true"> ↗</span></a>`
  const inner = (target: string, label: string, cls = 'nav__link') => `<a class="${cls}" href="#${target}" data-target="${target}">${label}</a>`

  nav.setAttribute('data-lenis-prevent', '')
  nav.tabIndex = -1
  nav.innerHTML = `
    <div class="nav__sea" aria-hidden="true">${mark(1000)}</div>
    <div class="nav__inner">
      <ol class="nav__list">
        ${items.map((c, i) => {
          const row = NAV_TABLE[c.id] ?? { title: c.label ?? c.id, sub: '' }
          const idx = c.navIndex ?? String(i + 1).padStart(2, '0')
          return `<li class="nav__li" style="--i:${i}" data-id="${esc(c.id)}">
            <a class="nav__item" href="#ch-${esc(c.id)}" data-target="ch-${esc(c.id)}">
              <b class="nav__index">${esc(idx)}</b>
              <span class="nav__mask"><em class="nav__title">${esc(row.title)}</em></span>
              ${row.sub ? `<span class="nav__sub">${esc(row.sub)}</span>` : ''}
            </a>
            <i class="nav__rule" aria-hidden="true"></i>
          </li>`
        }).join('')}
      </ol>
      <aside class="nav__meta" aria-label="Event">
        <p class="nav__meta-line">${esc(forumName)} · ${esc(editionLabel)}</p>
        <p class="nav__meta-line">${esc(datesShort)} · ${esc(city)}</p>
        <p class="nav__days tnum" aria-live="off"></p>
        ${socials.length ? `<ul class="nav__socials">${socials.map(s => `<li>${ext(s.url, esc(s.network), 'nav__social')}</li>`).join('')}</ul>` : ''}
      </aside>
      <div class="nav__row" style="--i:6">
        <i class="nav__rule nav__rule--row" aria-hidden="true"></i>
        ${inner('ch-homer', 'Voices')}
        ${hotelsUrl ? ext(hotelsUrl, 'Hotels') : inner('ch-register', 'Hotels')}
        ${inner('ch-register', 'Partners')}
        ${inner('ch-ogygia', 'The Foundation')}
        ${inner('ch-sunrise', 'Contact')}
        ${watchUrl ? ext(watchUrl, `Watch ${esc(lastYear)}`) : ''}
        <button class="nav__motion" type="button" aria-label="Motion preference"><span class="nav__motion-k">Motion:</span> <span class="nav__motion-v" data-v="full">Full</span><span class="nav__motion-sep"> / </span><span class="nav__motion-v" data-v="reduced">Reduced</span></button>
      </div>
    </div>`
  void shortName

  // the day count — days until the first day, tnum, computed from event.dates.start
  nav.querySelector('.nav__sea path')?.removeAttribute('style')
  const daysEl = nav.querySelector('.nav__days') as HTMLElement | null
  const renderDays = () => {
    if (!daysEl) return
    const now = new Date()
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    const d = Math.round((startT - today) / 864e5)
    let text = ''
    if (d > 1) text = `${d} days`
    else if (d === 1) text = '1 day'
    else if (d === 0) text = 'Today'
    else if (today <= endT) text = `Day ${Math.round((today - startT) / 864e5) + 1}`
    daysEl.textContent = text
    daysEl.hidden = !text
  }
  renderDays()

  /* motion toggle — persisted, toggles html.reduced-motion, reloads (the engine reads the preference at boot) */
  const motionBtn = nav.querySelector('.nav__motion') as HTMLButtonElement | null
  const paintMotion = () => {
    const reduced = html.classList.contains('reduced-motion')
    motionBtn?.querySelectorAll<HTMLElement>('.nav__motion-v').forEach(v => v.classList.toggle('is-on', (v.dataset.v === 'reduced') === reduced))
    motionBtn?.setAttribute('aria-label', `Motion preference: ${reduced ? 'reduced' : 'full'}. Switch to ${reduced ? 'full' : 'reduced'} motion`)
  }
  const stored = storedMotion()
  if (stored) html.classList.toggle('reduced-motion', stored === 'reduced')
  paintMotion()
  motionBtn?.addEventListener('click', () => {
    const next = html.classList.contains('reduced-motion') ? 'full' : 'reduced'
    try { localStorage.setItem(MOTION_KEY, next) } catch {}
    html.classList.toggle('reduced-motion', next === 'reduced')
    paintMotion()
    location.reload()
  })

  /* ───────────── open / close ───────────── */
  let isOpen = false
  let lastFocus: HTMLElement | null = null
  const focusables = (): HTMLElement[] => {
    const sel = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const inHeader = Array.from(header.querySelectorAll<HTMLElement>(sel))
    const inNav = Array.from(nav.querySelectorAll<HTMLElement>(sel))
    return [...inHeader, ...inNav].filter(e => e.offsetParent !== null || e === toggle)
  }

  const setOpen = (v: boolean) => {
    if (v === isOpen) return
    isOpen = v
    html.classList.toggle('nav-open', v)
    nav.setAttribute('aria-hidden', String(!v))
    toggle?.setAttribute('aria-expanded', String(v))
    toggle?.setAttribute('aria-label', v ? 'Close navigation' : 'Open navigation')
    if (app) app.inert = v
    if (v) {
      lastFocus = document.activeElement as HTMLElement | null
      markCurrent()
      scroll.stop()
      window.setTimeout(() => { if (isOpen) nav.focus({ preventScroll: true }) }, 80)   // the dialog itself takes focus; Tab reaches the first item
    } else {
      scroll.start()
      const back = lastFocus && lastFocus !== document.body ? lastFocus : toggle
      back?.focus({ preventScroll: true })
    }
  }

  /** The overlay is a time machine: mark the chapter we are in so the visitor knows where the camera is. */
  const markCurrent = () => {
    const i = activeIndex()
    const id = chapters[i]?.id
    // current = the last nav item at or before the active chapter
    let cur: string | undefined
    for (const c of chapters) { if (c.inNav) cur = c.id; if (c.id === id) break }
    nav.querySelectorAll<HTMLElement>('.nav__li').forEach(li => li.classList.toggle('is-current', li.dataset.id === cur))
  }

  toggle?.addEventListener('click', () => setOpen(!isOpen))

  const go = (target: HTMLElement | number) => {
    setOpen(false)
    // let Lenis wake up, then travel — the camera is seen moving under the fading overlay
    window.setTimeout(() => scroll.scrollTo(target), 30)
  }
  nav.addEventListener('click', e => {
    const a = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null
    if (!a) return
    const id = a.dataset.target
    if (!id) { setOpen(false); return }   // external link: let it open, close the overlay behind it
    e.preventDefault()
    const t = document.getElementById(id)
    if (t) go(t)
  })
  brand?.addEventListener('click', e => { e.preventDefault(); go(0) })
  for (const p of pills) p.addEventListener('click', e => {
    const t = document.getElementById('ch-register')
    if (!t) return
    e.preventDefault(); go(t)
  })

  document.addEventListener('keydown', e => {
    if (!isOpen) return
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return }
    if (e.key !== 'Tab') return
    const list = focusables()
    if (!list.length) return
    const first = list[0], last = list[list.length - 1]
    const active = document.activeElement as HTMLElement | null
    if (e.shiftKey && (active === first || !active || !list.includes(active))) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus() }
  })

  /* ───────────── the pill listens to the stage ───────────── */
  const idxOf = (id: string) => chapters.findIndex(c => c.id === id)
  const dateFrom = idxOf('rudder')
  const goldFrom = idxOf('register')

  const activeIndex = (): number => {
    const list = stage?.mounted ?? []
    if (!list.length) return 0
    const y = scroll.y, vh = window.innerHeight, centre = y + vh * 0.5
    let i = list.findIndex(m => m.film ? (y >= m.top && y < m.top + m.height - vh) : (centre >= m.top && centre < m.top + m.height))
    if (i < 0) i = list.findIndex(m => centre >= m.top && centre < m.top + m.height)
    if (i < 0) i = centre < list[0].top ? 0 : list.length - 1
    return i
  }
  let lastIdx = -1
  const syncPill = () => {
    const i = activeIndex()
    if (i === lastIdx) return
    lastIdx = i
    for (const p of pills) {
      p.classList.toggle('has-date', dateFrom >= 0 && i >= dateFrom)
      p.classList.toggle('is-gold', goldFrom >= 0 && i >= goldFrom)
    }
  }
  syncPill()
  scroll.onScroll(syncPill)
  document.addEventListener('mtf:ready', () => { lastIdx = -1; syncPill() }, { once: true })

  /* ───────────── magnet (≤ 6 px, two layers, fine pointers only) ───────────── */
  const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches
  if (cta && !coarse && !html.classList.contains('reduced-motion')) {
    const label = cta.querySelector('.btn__label') as HTMLElement
    const bx = gsap.quickTo(cta, 'x', { duration: .4, ease: 'power4.out' })
    const by = gsap.quickTo(cta, 'y', { duration: .4, ease: 'power4.out' })
    const lx = gsap.quickTo(label, 'x', { duration: .4, ease: 'power4.out' })
    const ly = gsap.quickTo(label, 'y', { duration: .4, ease: 'power4.out' })
    cta.addEventListener('pointermove', e => {
      const r = cta.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2)
      bx(clamp(dx * .35, -6, 6)); by(clamp(dy * .35, -6, 6))
      lx(clamp(dx * .15, -2.6, 2.6)); ly(clamp(dy * .15, -2.6, 2.6))
    })
    cta.addEventListener('pointerleave', () => {
      gsap.to(cta, { x: 0, y: 0, duration: .64, ease: PRESS, overwrite: 'auto' })
      gsap.to(label, { x: 0, y: 0, duration: .64, ease: PRESS, overwrite: 'auto' })
    })
  }

  /* dev hooks */
  const w = window as unknown as { __mtf?: Record<string, unknown> }
  w.__mtf = w.__mtf ?? {}
  w.__mtf.openNav = () => setOpen(true)
  w.__mtf.closeNav = () => setOpen(false)
}
