#!/usr/bin/env node
/** Film strip: scroll the whole page in N steps, capture small frames, tile them with ffmpeg → shots/strip-<vp>.jpg */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import { execSync } from 'node:child_process'
const base = process.argv[2] || 'http://localhost:5173/'
const N = +(process.argv[3] || 60)
const vpName = process.argv[4] || 'desktop'
const vp = vpName === 'mobile' ? { w: 390, h: 844 } : { w: 1440, h: 900 }
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
fs.rmSync('shots/strip', { recursive: true, force: true }); fs.mkdirSync('shots/strip', { recursive: true })
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1, isMobile: vp.w < 820, hasTouch: vp.w < 820 })
const errs = []
page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
await page.goto(base, { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), { timeout: 20000 }).catch(() => {})
await new Promise(r => setTimeout(r, 800))
const limit = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
for (let i = 0; i < N; i++) {
  const y = Math.round((limit * i) / (N - 1))
  await page.evaluate(y => { window.__mtf.stage.scroll.lenis.scrollTo(y, { immediate: true }); window.__mtf.ScrollTrigger.update() }, y)
  await new Promise(r => setTimeout(r, 1100))
  await page.screenshot({ path: `shots/strip/f${String(i).padStart(3, '0')}.png` })
}
await browser.close()
const cols = vpName === 'mobile' ? 10 : 6, rows = Math.ceil(N / cols)
const tw = vpName === 'mobile' ? 130 : 360
execSync(`ffmpeg -v error -y -framerate 1 -i shots/strip/f%03d.png -vf "scale=${tw}:-1,tile=${cols}x${rows}:padding=2:color=black" -frames:v 1 shots/strip-${vpName}.jpg`)
console.log(`shots/strip-${vpName}.jpg (${N} frames, ${limit}px)`); if (errs.length) console.log('console errors:\n' + [...new Set(errs)].slice(0, 10).join('\n'))
