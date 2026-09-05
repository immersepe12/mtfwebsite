#!/usr/bin/env node
/** Lightweight accessibility + structure audit of the running site (no external deps). */
import puppeteer from 'puppeteer-core'
const base = process.argv[2] || 'http://localhost:5173/'
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto(base, { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), { timeout: 20000 }).catch(() => {})
const report = await page.evaluate(() => {
  const out = []
  const h1 = document.querySelectorAll('h1'); out.push(`h1 count: ${h1.length} (${[...h1].map(h => h.textContent.trim().slice(0, 40)).join(' | ')})`)
  const chapters = [...document.querySelectorAll('section.chapter')]
  for (const c of chapters) { const h = c.querySelector('h1, h2'); if (!h) out.push(`MISSING heading in #${c.id}`) }
  out.push(`chapters: ${chapters.length}; h2: ${document.querySelectorAll('h2').length}`)
  const imgs = [...document.querySelectorAll('img')]; const noAlt = imgs.filter(i => !i.hasAttribute('alt')); out.push(`img: ${imgs.length}, missing alt: ${noAlt.length}`)
  const ctrls = [...document.querySelectorAll('a, button')]
  const unnamed = ctrls.filter(el => !(el.getAttribute('aria-label') || el.textContent.trim() || el.querySelector('img[alt]')))
  out.push(`links/buttons: ${ctrls.length}, without accessible name: ${unnamed.length}${unnamed.length ? ' → ' + unnamed.slice(0, 8).map(e => e.outerHTML.slice(0, 80)).join(' || ') : ''}`)
  const ids = [...document.querySelectorAll('[id]')].map(e => e.id); const dup = ids.filter((id, i) => ids.indexOf(id) !== i); out.push(`duplicate ids: ${[...new Set(dup)].slice(0, 10).join(', ') || 'none'}`)
  const svgNoAria = [...document.querySelectorAll('svg')].filter(s => !s.hasAttribute('aria-hidden') && !s.querySelector('title') && !s.getAttribute('role')); out.push(`decorative svg without aria-hidden/title: ${svgNoAria.length}`)
  const inputs = [...document.querySelectorAll('input, select, textarea')]; const unl = inputs.filter(i => !(i.labels && i.labels.length) && !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby')); out.push(`form controls: ${inputs.length}, unlabelled: ${unl.length}`)
  out.push(`lang: ${document.documentElement.lang}; title: ${document.title.slice(0, 60)}`)
  out.push(`skip link: ${!!document.querySelector('a.skip')}; nav aria-hidden: ${document.getElementById('site-nav')?.getAttribute('aria-hidden')}`)
  out.push(`scrollWidth: ${document.documentElement.scrollWidth} (viewport 1440)`)
  const stubs = [...document.querySelectorAll('.stub')]; out.push(`stub markers left: ${stubs.length}`)
  const lorem = document.body.innerText.match(/lorem|TODO|FIXME|placeholder text/i); out.push(`lorem/todo in text: ${lorem ? lorem[0] : 'none'}`)
  const hilton = document.body.innerText.match(/Hilton/); out.push(`'Hilton' present (must not be): ${hilton ? 'YES' : 'no'}`)
  const singers = ['Ira Losco', 'Kurt Calleja', 'Michela Pace', 'Gaia Cauchi', 'Destiny', 'Kevin Borg', 'Amber Bondin', 'Sebastian Calleja'].filter(n => document.body.innerText.includes(n)); out.push(`singer names present (must not be): ${singers.join(', ') || 'none'}`)
  return out
})
console.log(report.join('\n'))
await browser.close()
