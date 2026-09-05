/**
 * §9.17 Instrument frame — a 1 px `--rule` frame inset 4%, four 12 px corner crosshairs, a mono label slot
 * top-left, a coordinates slot bottom-right and an optional 72-tick ruler along the bottom. HTML string;
 * wraps any plate (position the parent `relative`). Every rule draws with `--draw` 0 → 1 (default 1):
 * four separate rules from the corners outward, never a bordered box.
 *
 *   frame({ label, coords, ruler })   → HTML string       setDraw(root, p) → sets --draw
 */
export function frame({ label = '', coords = '', ruler = false }: { label?: string; coords?: string; ruler?: boolean } = {}): string {
  const cross = (cls: string) => `<svg class="fr-cross ${cls}" aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke-width="1" style="stroke:var(--cross,#FFF9EA)"><line x1="6" y1="0" x2="6" y2="12"/><line x1="0" y1="6" x2="12" y2="6"/></svg>`
  const ticks = ruler ? `<svg class="fr-ruler" viewBox="0 0 720 12" preserveAspectRatio="none" fill="none" stroke-width="1" style="stroke:var(--rule-strong,#FFF9EA)">${Array.from({ length: 73 }, (_, i) => `<line x1="${i * 10}" y1="12" x2="${i * 10}" y2="${i % 6 === 0 ? 0 : i % 3 === 0 ? 5 : 8}" vector-effect="non-scaling-stroke" style="--i:${i}"/>`).join('')}</svg>` : ''
  return `<div class="glyph glyph--frame${ruler ? ' has-ruler' : ''}" aria-hidden="true" style="--draw:1">
  <style>
    .glyph--frame { position: absolute; inset: 4%; pointer-events: none; }
    .glyph--frame .fr { position: absolute; background: var(--rule, rgba(255,249,234,.22)); }
    .glyph--frame .fr--t { top: 0; left: 0; right: 0; height: 1px; transform-origin: left; transform: scaleX(var(--draw)); }
    .glyph--frame .fr--r { top: 0; right: 0; bottom: 0; width: 1px; transform-origin: top; transform: scaleY(var(--draw)); }
    .glyph--frame .fr--b { bottom: 0; left: 0; right: 0; height: 1px; transform-origin: right; transform: scaleX(var(--draw)); }
    .glyph--frame .fr--l { top: 0; left: 0; bottom: 0; width: 1px; transform-origin: bottom; transform: scaleY(var(--draw)); }
    .glyph--frame .fr-cross { position: absolute; opacity: var(--draw); }
    .glyph--frame .fr-cross--tl { top: -6px; left: -6px; } .glyph--frame .fr-cross--tr { top: -6px; right: -6px; }
    .glyph--frame .fr-cross--bl { bottom: -6px; left: -6px; } .glyph--frame .fr-cross--br { bottom: -6px; right: -6px; }
    .glyph--frame .fr-label, .glyph--frame .fr-coords { position: absolute; font: 500 var(--fs-index, .5625rem) / 1 var(--font-mono, ui-monospace, monospace); letter-spacing: var(--ls-index, .24em); text-transform: uppercase; font-variant-numeric: tabular-nums; color: var(--fg-muted, currentColor); white-space: nowrap; opacity: var(--draw); }
    .glyph--frame .fr-label { top: 10px; left: 12px; } .glyph--frame .fr-coords { bottom: 10px; right: 12px; }
    .glyph--frame.has-ruler .fr-coords { bottom: 18px; }
    .glyph--frame .fr-ruler { position: absolute; left: 0; right: 0; bottom: 0; height: 12px; width: 100%; clip-path: inset(0 calc((1 - var(--draw)) * 100%) 0 0); }
  </style>
  <i class="fr fr--t"></i><i class="fr fr--r"></i><i class="fr fr--b"></i><i class="fr fr--l"></i>
  ${cross('fr-cross--tl')}${cross('fr-cross--tr')}${cross('fr-cross--bl')}${cross('fr-cross--br')}
  <span class="fr-label index">${label}</span><span class="fr-coords index">${coords}</span>${ticks}
</div>`
}

export function setDraw(root: HTMLElement, p: number): void { root.style.setProperty('--draw', Math.min(1, Math.max(0, p)).toFixed(4)) }
