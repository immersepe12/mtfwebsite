import './intro.css'
import { player } from '../engine/play'

/**
 * The invitation — said once, when the curtain goes up.
 *
 * The film can be watched two ways and neither is obvious from looking at it, so it says so: PLAY runs the whole
 * thing at its own pace, NEXT (or the wheel) takes it a moment at a time. It also says the thing a reader most
 * needs to know — that PLAY can be paused on any frame and picked up again. It appears once per visitor, leaves
 * on the first press or gesture, and never returns (`?intro` brings it back for a look).
 */
const KEY = 'mtf-intro'

export function initIntro() {
  const q = new URLSearchParams(location.search)
  const force = q.has('intro')
  if (!force) { try { if (localStorage.getItem(KEY)) return } catch { /* private mode: show it, once per load */ } }

  const el = document.createElement('aside')
  el.className = 'intro'
  el.setAttribute('aria-label', 'How to watch')
  el.innerHTML = `
    <span class="intro__rule" aria-hidden="true"></span>
    <p class="intro__eyebrow">Two ways to watch</p>
    <ul class="intro__ways">
      <li class="intro__way"><span class="intro__key">▶ Play</span><p class="intro__say">Sit back. The film runs itself, and holds on every line long enough to read it.</p></li>
      <li class="intro__way"><span class="intro__key">Next ⌄ / scroll</span><p class="intro__say">Take it a moment at a time, at whatever pace you like.</p></li>
    </ul>
    <div class="intro__foot">
      <p class="intro__note">Pause on any frame · read · play on</p>
      <button class="intro__begin" type="button">Begin →</button>
    </div>`
  document.body.appendChild(el)

  let gone = false
  const close = () => {
    if (gone) return
    gone = true
    el.classList.remove('is-on')
    try { localStorage.setItem(KEY, '1') } catch { /* nothing to remember, nothing to do */ }
    window.setTimeout(() => el.remove(), 900)
    off()
  }
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === ' ' || e.key.startsWith('Arrow') || e.key.startsWith('Page')) close() }
  const off = () => {
    window.removeEventListener('wheel', close)
    window.removeEventListener('touchstart', close)
    window.removeEventListener('keydown', onKey)
  }
  el.querySelector('.intro__begin')?.addEventListener('click', close)
  // the film itself dismisses it: pressing PLAY or NEXT is an answer to the question it asks
  player.onBusy(busy => { if (busy) close() })
  player.onChange(on => { if (on) close() })

  const show = () => {
    el.classList.add('is-on')
    window.addEventListener('wheel', close, { passive: true })
    window.addEventListener('touchstart', close, { passive: true })
    window.addEventListener('keydown', onKey)
  }
  if (document.documentElement.classList.contains('is-ready')) window.setTimeout(show, 700)
  else document.addEventListener('mtf:ready', () => window.setTimeout(show, 700), { once: true })
}
