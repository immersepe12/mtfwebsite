#!/usr/bin/env node
/**
 * Pacing/pop probe: walks the page in fixed pixel steps and reports, per step, how much the world's mood
 * actually moves. Large spikes are the "glitch" — a lot of animation crammed into a little scroll.
 *   node scripts/pace.mjs [url] [stepPx] [viewport]
 */
import puppeteer from 'puppeteer-core'
const base = process.argv[2] || 'http://localhost:5173/'
const STEP = +(process.argv[3] || 150)
const vpName = process.argv[4] || 'desktop'
const vp = vpName === 'mobile' ? { w: 390, h: 844 } : { w: 1440, h: 900 }
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: vp.w, height: vp.h })
await page.goto(base, { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), { timeout: 20000 }).catch(() => {})
await new Promise(r => setTimeout(r, 800))
const limit = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
const read = () => page.evaluate(() => {
  const s = window.__mtf.stage, w = window.__mtf.world, vh = innerHeight, y = window.__mtf.shared.scrollY
  const m = s.computeMood(y, vh)
  const cur = s.mounted.find(x => x.film ? (y >= x.top && y < x.top + x.height - vh) : (y + vh / 2 >= x.top && y + vh / 2 < x.top + x.height))
  const vis = [...document.querySelectorAll('#app .pin__frame *')].filter(e => { const cs = getComputedStyle(e); return cs.opacity !== '0' && cs.visibility !== 'hidden' && e.getBoundingClientRect().width > 0 }).length
  return { id: cur?.chapter.id, p: cur ? s.progressOf(cur, y, vh) : 0, cam: [m.camX, m.camY, m.camZ, m.camTilt, m.camYaw, m.fov], sky: [...m.skyTop, ...m.skyBottom], sun: [m.sunX, m.sunY, m.sunZ, m.sunRadius, m.sunHeat], tess: [m.tess, m.tessForm, m.tessSpread], fx: [m.mosaic, m.veil, m.p4, m.bloom, m.warmth], vis, dpr: w ? w.shared.dpr : 0 }
})
const dist = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0)
let prev = null, rows = []
for (let y = 0; y <= limit; y += STEP) {
  await page.evaluate(y => { window.__mtf.stage.scroll.lenis.scrollTo(y, { immediate: true }); window.__mtf.ScrollTrigger.update() }, y)
  await new Promise(r => setTimeout(r, 90))
  const s = await read()
  if (prev) rows.push({ y, id: s.id, p: s.p, cam: dist(s.cam, prev.cam), sky: dist(s.sky, prev.sky), sun: dist(s.sun, prev.sun), tess: dist(s.tess, prev.tess), fx: dist(s.fx, prev.fx), dvis: Math.abs(s.vis - prev.vis) })
  prev = s
}
await browser.close()
const worst = (key, n = 8) => [...rows].sort((a, b) => b[key] - a[key]).slice(0, n)
  .map(r => `    ${String(r.y).padStart(6)}px ${(r.id || '?').padEnd(9)} p${r.p.toFixed(2)}  ${key}=${r[key].toFixed(2)}`).join('\n')
const stat = k => { const v = rows.map(r => r[k]); const mean = v.reduce((a, b) => a + b, 0) / v.length; return `${k}: mean ${mean.toFixed(3)}  max ${Math.max(...v).toFixed(2)}  (${(Math.max(...v) / (mean || 1)).toFixed(0)}× mean)` }
console.log(`steps ${rows.length} of ${STEP}px over ${limit}px\n${['cam','sky','sun','tess','fx','dvis'].map(stat).join('\n')}`)
for (const k of ['cam', 'tess', 'fx', 'dvis']) console.log(`\n  worst ${k} steps:\n${worst(k)}`)
