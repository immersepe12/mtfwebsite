#!/usr/bin/env node
/**
 * Overlap detector: walks every chapter at several scroll positions and widths and reports pairs of visible
 * text blocks whose boxes intersect. Text that collides is the one fault a reader always notices.
 *   node scripts/overlap.mjs [url] [widths]
 */
import puppeteer from 'puppeteer-core'
const base = process.argv[2] || 'http://localhost:5173/'
const widths = (process.argv[3] || '1440x900,1920x1080,390x844').split(',').map(s => s.split('x').map(Number))
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] })
const found = []
for (const [w, h] of widths) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 820, hasTouch: w < 820 })
  await page.goto(base, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), { timeout: 20000 }).catch(() => {})
  await new Promise(r => setTimeout(r, 1500))
  const chapters = await page.evaluate(() => window.__mtf.stage.mounted.map(m => ({ id: m.chapter.id, top: m.top, film: !!m.film, travel: window.__mtf.stage.travelOf(m, innerHeight) })))
  for (const c of chapters) {
    for (const p of [0.12, 0.25, 0.4, 0.55, 0.7, 0.85]) {
      await page.evaluate(y => { window.__mtf.stage.scroll.lenis.scrollTo(y, { immediate: true }); window.__mtf.ScrollTrigger.update() }, c.top + (c.film ? c.travel : c.travel) * p)
      await new Promise(r => setTimeout(r, 520))   // the film's timeline and the overlap resolver both settle on the ticker
      const hits = await page.evaluate(() => {
        // ask the browser: this also excludes anything inside a content-visibility-skipped section
        const vis = (e) => {
          if (e.checkVisibility && !e.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true })) return false
          let o = 1
          for (let n = e; n && n !== document.body; n = n.parentElement) { const c = getComputedStyle(n); if (c.visibility === 'hidden') return false; o *= +c.opacity }
          if (o < 0.5) return false
          const r = e.getBoundingClientRect(); return r.width > 12 && r.height > 6 && r.bottom > 4 && r.top < innerHeight - 4 }
        const текст = (e) => (e.textContent || '').trim().length > 1
        // the rect of the text a reader can actually see: each text node's box, only if its own element chain is
        // visible, clipped by every overflow-hidden ancestor (a masked line waiting below its mask is not on screen)
        const textRect = (e) => {
          let u = null
          const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT)
          for (let n = w.nextNode(); n; n = w.nextNode()) {
            if (!(n.textContent || '').trim()) continue
            const par = n.parentElement
            if (!par || par.closest('[aria-hidden="true"]') || !vis(par)) continue
            const rg = document.createRange(); rg.selectNodeContents(n)
            let r = rg.getBoundingClientRect(); let l = r.left, t = r.top, rt = r.right, bt = r.bottom
            for (let a = par; a && a !== document.body; a = a.parentElement) {
              const cs = getComputedStyle(a)
              if (cs.overflow !== 'visible' || cs.overflowY !== 'visible' || cs.clipPath !== 'none') { const c = a.getBoundingClientRect(); l = Math.max(l, c.left); t = Math.max(t, c.top); rt = Math.min(rt, c.right); bt = Math.min(bt, c.bottom) }
            }
            if (rt - l < 4 || bt - t < 4) continue
            u = u ? { left: Math.min(u.left, l), top: Math.min(u.top, t), right: Math.max(u.right, rt), bottom: Math.max(u.bottom, bt) } : { left: l, top: t, right: rt, bottom: bt }
          }
          return u
        }
        const blocks = []
        for (const frame of document.querySelectorAll('#app .pin__frame, #app .ch-inner')) {
          for (const e of frame.querySelectorAll('h1, h2, h3, p, li, .chip, .stat__n, .tile__t, .voice__name, button, a')) {
            if (!текст(e) || !vis(e)) continue
            if (e.closest('[aria-hidden="true"]')) continue
            let parentCounted = false
            for (const b of blocks) if (b.el.contains(e) || e.contains(b.el)) { parentCounted = true; break }
            if (parentCounted) continue
            const r = textRect(e)
            if (!r || r.bottom < 4 || r.top > innerHeight - 4) continue
            blocks.push({ el: e, r, t: (e.textContent || '').trim().slice(0, 46) })
          }
        }
        const out = []
        for (let i = 0; i < blocks.length; i++) for (let j = i + 1; j < blocks.length; j++) {
          const a = blocks[i].r, b = blocks[j].r
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left)
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
          if (ox > 8 && oy > 6) out.push({ a: blocks[i].t, b: blocks[j].t, ox: Math.round(ox), oy: Math.round(oy) })
        }
        return out
      })
      for (const hit of hits) found.push({ w, id: c.id, p, ...hit })
    }
  }
  await page.close()
}
await browser.close()
if (!found.length) console.log('no text overlaps found')
else {
  const byCh = {}
  for (const f of found) (byCh[`${f.id} @${f.w}`] = byCh[`${f.id} @${f.w}`] || []).push(f)
  console.log(`${found.length} overlapping pairs in ${Object.keys(byCh).length} chapter/width combinations:\n`)
  for (const [k, v] of Object.entries(byCh)) {
    console.log(`  ${k}  (${v.length})`)
    for (const f of v.slice(0, 3)) console.log(`     p${f.p}  "${f.a}"  ×  "${f.b}"   ${f.ox}×${f.oy}px`)
  }
}
