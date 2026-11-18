/* Converts an image to WebP with the installed Chrome (no image libraries needed).
 *   node scripts/shots/to-webp.mjs <in.png> <out.webp> [maxWidth] [quality 0-1] */
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const [, , input, output, maxW = '2048', q = '0.82'] = process.argv
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const page = await browser.newPage()
const data = fs.readFileSync(input).toString('base64')
const ext = path.extname(input).slice(1).replace('jpg', 'jpeg')
const url = await page.evaluate(async (src, mw, quality) => {
  const img = new Image()
  img.src = src
  await img.decode()
  const scale = Math.min(1, mw / img.naturalWidth)
  const c = document.createElement('canvas')
  c.width = Math.round(img.naturalWidth * scale)
  c.height = Math.round(img.naturalHeight * scale)
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/webp', quality)
}, `data:image/${ext};base64,${data}`, Number(maxW), Number(q))
fs.writeFileSync(output, Buffer.from(url.split(',')[1], 'base64'))
console.log(output, fs.statSync(output).size, 'bytes')
await browser.close()
