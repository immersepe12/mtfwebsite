#!/usr/bin/env node
/**
 * Simulates real wheel scrolling (not jumps) and tiles the frames, so the film can be judged the way a
 * visitor actually experiences it: how much happens per notch of the wheel.
 *   node scripts/wheel.mjs <chapterId> [notchesPerFrame] [frames] [deltaY]
 */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import { execSync } from 'node:child_process'
const [id = 'rudder', per = '6', frames = '12', delta = '100'] = process.argv.slice(2)
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
fs.rmSync('shots/wheel', { recursive: true, force: true }); fs.mkdirSync('shots/wheel', { recursive: true })
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto(`http://localhost:5173/?chapter=${id}&p=0&nohold`, { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), { timeout: 20000 }).catch(() => {})
await new Promise(r => setTimeout(r, 2500))
const start = await page.evaluate(() => window.__mtf.shared.scrollY)
for (let f = 0; f < +frames; f++) {
  for (let i = 0; i < +per; i++) { await page.mouse.wheel({ deltaY: +delta }); await new Promise(r => setTimeout(r, 55)) }
  await new Promise(r => setTimeout(r, 420))
  await page.screenshot({ path: `shots/wheel/f${String(f).padStart(2, '0')}.png` })
}
const end = await page.evaluate(() => window.__mtf.shared.scrollY)
await browser.close()
execSync(`ffmpeg -v error -y -framerate 1 -i shots/wheel/f%02d.png -vf "scale=430:-1,tile=4x3:padding=2:color=black" -frames:v 1 shots/wheel-${id}.jpg`)
console.log(`shots/wheel-${id}.jpg — ${frames} frames, ${per} notches (${+per * +delta}px of wheel) each; travelled ${Math.round(end - start)}px`)
