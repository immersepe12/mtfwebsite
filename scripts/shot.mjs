#!/usr/bin/env node
/**
 * Headless screenshot of the running dev server using the system Chrome (WebGL on).
 *   node scripts/shot.mjs "<url>" <out.png> [width] [height] [settleMs]
 *   node scripts/shot.mjs "http://localhost:5173/?chapter=hero&p=0.5" shots/hero-050.png 1440 900
 *   node scripts/shot.mjs "http://localhost:5173/?chapter=hero&p=0.5" shots/hero-050-m.png 390 844
 * Also prints console errors/warnings from the page so agents can catch runtime failures.
 */
import puppeteer from 'puppeteer-core'
const [url = 'http://localhost:5173/', out = 'shots/shot.png', w = '1440', h = '900', settle = '2600'] = process.argv.slice(2)
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const browser = await puppeteer.launch({
  executablePath: chrome, headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', `--window-size=${w},${h}`],
})
const page = await browser.newPage()
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1, isMobile: +w < 820, hasTouch: +w < 820 })
const logs = []
page.on('console', m => { if (['error', 'warning'].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`) })
page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`))
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
// wait for the curtain to open, then settle
await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), { timeout: 20000 }).catch(() => logs.push('[warn] is-ready never set'))
await new Promise(r => setTimeout(r, +settle))
await page.screenshot({ path: out, type: out.endsWith('.jpg') ? 'jpeg' : 'png', quality: out.endsWith('.jpg') ? 86 : undefined })
console.log(`saved ${out}`)
if (logs.length) console.log(logs.slice(0, 20).join('\n'))
await browser.close()
