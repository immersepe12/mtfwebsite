#!/usr/bin/env node
/**
 * Walk every mounted chapter at p = 0, 0.5, 0.9 on desktop (1440×900) and mobile (390×844), save PNGs to shots/qa/,
 * and report console errors + per-chapter overflow (horizontal scroll) problems.
 *   node scripts/qa.mjs [baseUrl] [onlyChapterId]
 */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const base = process.argv[2] || 'http://localhost:5173/'
const only = process.argv[3]
const viewports = (process.argv[4] || 'desktop,mobile').split(',')
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
fs.mkdirSync('shots/qa', { recursive: true })
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] })
const report = []
for (const vp of [{ n: 'desktop', w: 1440, h: 900 }, { n: 'mobile', w: 390, h: 844 }].filter(v => viewports.includes(v.n))) {
  const page = await browser.newPage()
  await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1, isMobile: vp.w < 820, hasTouch: vp.w < 820 })
  const errs = []
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  page.on('pageerror', e => errs.push('pageerror: ' + e.message))
  await page.goto(base, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), { timeout: 20000 }).catch(() => errs.push('is-ready never set'))
  await new Promise(r => setTimeout(r, 800))
  const chapters = await page.evaluate(() => (window.__mtf?.stage?.mounted || []).map(m => ({ id: m.chapter.id, top: m.top, height: m.height, film: !!m.film, travel: window.__mtf.stage.travelOf(m, window.innerHeight) })))
  const docW = await page.evaluate(() => document.documentElement.scrollWidth)
  if (docW > vp.w + 1) report.push(`[${vp.n}] HORIZONTAL OVERFLOW: document.scrollWidth=${docW} > ${vp.w}`)
  for (const c of chapters) {
    if (only && only !== 'all' && !only.split(',').includes(c.id)) continue
    for (const p of [0, 0.5, 0.9]) {
      const y = c.film ? c.top + c.travel * p : c.top + c.height * p
      await page.evaluate((y) => { window.__mtf.stage.scroll.lenis.scrollTo(y, { immediate: true }); window.__mtf.ScrollTrigger.update() }, y)
      await new Promise(r => setTimeout(r, 1400))
      const file = `shots/qa/${vp.n}-${c.id}-${String(p).replace('.', '')}.png`
      await page.screenshot({ path: file })
      report.push(`${file}`)
    }
  }
  if (errs.length) report.push(`[${vp.n}] console errors:\n  ` + [...new Set(errs)].slice(0, 15).join('\n  '))
  await page.close()
}
await browser.close()
console.log(report.join('\n'))
