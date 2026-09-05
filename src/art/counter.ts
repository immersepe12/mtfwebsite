/**
 * §9.8 The counter — nine rolling mono digits (Opałka's count), DOM not SVG: returns an HTML string.
 * Each digit is a 10-glyph vertical strip inside an overflow-hidden 1em box; `setValue` rolls the strips,
 * leading zeros sit at 30%, groups of three are set apart by a thin gap. `freeze()` stops the roll,
 * `dissolve()` hands the number to `.tess-out` (tile-wise, never a fade).
 *
 *   counter()                  → HTML string   (.glyph--counter, font from --font-mono, tabular)
 *   setValue(root, n)          → rolls to n (0 … 999 999 999)
 *   freeze(root) / dissolve(root)
 */
export function counter(): string {
  const strip = `<span class="strip">${'0123456789'.split('').map(d => `<b class="g">${d}</b>`).join('')}</span>`
  const digits = Array.from({ length: 9 }, (_, i) => `<span class="digit${i < 8 ? ' is-lead' : ''}" data-i="${i}" style="--d:0">${strip}</span>`).join('')
  return `<div class="glyph glyph--counter tnum" aria-hidden="true" style="--go:0">
  <style>
    .glyph--counter { display: inline-flex; align-items: flex-start; font-family: var(--font-mono, ui-monospace, Menlo, monospace); font-weight: 400; font-variant-numeric: tabular-nums; line-height: 1; white-space: nowrap; transition: -webkit-mask-size var(--dur-8, 2.2s) var(--ease-set, ease), mask-size var(--dur-8, 2.2s) var(--ease-set, ease), opacity var(--dur-8, 2.2s) linear; }
    .glyph--counter .digit { display: block; position: relative; height: 1em; overflow: hidden; transition: opacity .32s linear; }
    .glyph--counter .digit[data-i="3"], .glyph--counter .digit[data-i="6"] { margin-left: .22em; }
    .glyph--counter .digit.is-lead { opacity: .3; }
    .glyph--counter .strip { display: block; transform: translateY(calc(var(--d, 0) * -1em)); transition: transform .26s var(--ease-press, cubic-bezier(.22,1,.36,1)); will-change: transform; }
    .glyph--counter .g { display: block; height: 1em; font-weight: inherit; font-style: normal; }
    .glyph--counter.is-frozen .strip, .glyph--counter.is-frozen .digit { transition: none; }
    @media (prefers-reduced-motion: reduce) { .glyph--counter .strip { transition: none; } }
  </style>${digits}</div>`
}

export function setValue(root: HTMLElement, n: number): void {
  const v = Math.max(0, Math.min(999_999_999, Math.floor(n)))
  const s = String(v).padStart(9, '0')
  const lead = 8 - String(v).length + 1 // digits before the first significant one
  root.querySelectorAll<HTMLElement>('.digit').forEach((el, i) => {
    el.style.setProperty('--d', s[i])
    el.classList.toggle('is-lead', i < lead)
  })
}

export function freeze(root: HTMLElement): void { root.classList.add('is-frozen') }

export function dissolve(root: HTMLElement): void { root.classList.add('is-frozen', 'tess-out'); requestAnimationFrame(() => root.style.setProperty('--go', '1')) }
