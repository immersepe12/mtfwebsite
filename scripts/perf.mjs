#!/usr/bin/env node
/** Frame-time probe: scrolls the whole page at a realistic rate and reports jank per chapter. */
import puppeteer from 'puppeteer-core'
const base = process.argv[2] || 'http://localhost:5173/'
const dpr = +(process.argv[3] || 1.75)
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: dpr })
await page.goto(base, { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), { timeout: 20000 }).catch(() => {})
await new Promise(r => setTimeout(r, 1200))
// warm-up pass: shader compiles, first paints and any adaptive-DPR resizes happen here, not in the measurement
{
  const lim = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  for (let i = 0; i < Math.ceil(lim / 900); i++) { await page.mouse.wheel({ deltaY: 900 }); await new Promise(r => setTimeout(r, 26)) }
  await page.evaluate(() => window.__mtf.stage.scroll.lenis.scrollTo(0, { immediate: true }))
  await new Promise(r => setTimeout(r, 1400))
}
await page.evaluate(() => {
  window.__frames = []; window.__mark = []
  let last = performance.now()
  const loop = () => { const n = performance.now(); window.__frames.push(n - last); last = n
    const s = window.__mtf.stage, vh = innerHeight, y = window.__mtf.shared.scrollY
    const c = s.mounted.find(x => x.film ? (y >= x.top && y < x.top + x.height - vh) : (y + vh / 2 >= x.top && y + vh / 2 < x.top + x.height))
    window.__mark.push(c?.chapter.id || '?'); requestAnimationFrame(loop) }
  requestAnimationFrame(loop)
})
// scroll the whole page with real wheel events at a steady, human rate
const limit = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
const steps = Math.ceil(limit / 240)
for (let i = 0; i < steps; i++) { await page.mouse.wheel({ deltaY: 240 }); await new Promise(r => setTimeout(r, 34)) }
await new Promise(r => setTimeout(r, 600))
const out = await page.evaluate(() => {
  const f = window.__frames.slice(20), m = window.__mark.slice(20)
  const per = {}
  f.forEach((d, i) => { const k = m[i] || '?'; (per[k] = per[k] || []).push(d) })
  const stat = a => { const s = [...a].sort((x, y) => x - y); return { n: a.length, p50: +s[Math.floor(s.length * .5)].toFixed(1), p95: +s[Math.floor(s.length * .95)].toFixed(1), worst: +s[s.length - 1].toFixed(1), jank: +(100 * a.filter(d => d > 32).length / a.length).toFixed(1) } }
  const all = stat(f)
  return { all, per: Object.fromEntries(Object.entries(per).map(([k, v]) => [k, stat(v)])) }
})
await browser.close()
console.log(`DPR ${dpr} · overall p50 ${out.all.p50}ms  p95 ${out.all.p95}ms  worst ${out.all.worst}ms  frames>32ms ${out.all.jank}%`)
for (const [k, v] of Object.entries(out.per)) console.log(`  ${k.padEnd(10)} p50 ${String(v.p50).padStart(5)}  p95 ${String(v.p95).padStart(6)}  worst ${String(v.worst).padStart(6)}  jank ${String(v.jank).padStart(5)}%`)
