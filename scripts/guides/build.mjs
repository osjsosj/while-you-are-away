/*
 * Builds the search guides as plain static pages (no JavaScript), plus robots.txt and sitemap.xml.
 *   node scripts/guides/build.mjs
 * Output: public/guides/<slug>/index.html, public/guides/index.html, public/sitemap.xml, public/robots.txt
 * Vercel serves files before the app's catch-all route, so these load as real pages that search engines read directly.
 */
import fs from 'node:fs'
import path from 'node:path'
import { GUIDES } from './content.mjs'

const SITE = 'https://getwhileyouareaway.com'
const OUT = path.resolve('public/guides')
const today = new Date().toISOString().slice(0, 10)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const start = (slug) => `/interview?utm_source=guide&amp;utm_medium=${slug}`

const head = ({ title, description, url, schema }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:site_name" content="While You’re Away" />
<meta name="theme-color" content="#060B1A" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;1,7..72,400&family=Schibsted+Grotesk:wght@400;500;600&display=swap" />
<link rel="stylesheet" href="/guides/guides.css" />
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
</head>
<body>
<header class="g-top"><a class="g-mark" href="/"><span aria-hidden="true"></span>While You’re Away</a><a class="g-toplink" href="/guides/">Letter ideas</a></header>
`

const foot = (slug) => `<footer class="g-foot">
<p>While You’re Away is a letter box for the time apart. You write the letters, every word of them. We seal each one until its day and make the paper from your story. Free to plan and write. $9.99 once when you hand it over.</p>
<p><a href="/">Home</a> · <a href="/services">How it works</a> · <a href="/guides/">All letter ideas</a> · <a href="/privacy">Privacy</a></p>
</footer>
<a class="g-sticky" href="${start(slug)}">Start your letter box</a>
</body>
</html>
`

const cta = (slug) => `<aside class="g-cta">
<h2>Write them now. They open on their day.</h2>
<p>With While You’re Away, you plan the letters with a guide, write each one yourself, and hand over a private letter box. Every letter stays sealed until its moment, on paper made from your story, and they can write back to each one. It opens on their phone with nothing to install, even without signal.</p>
<a class="g-btn" href="${start(slug)}">Start your letter box</a>
<p class="g-small">Free to plan and write. $9.99 once when you hand it over.</p>
</aside>`

const related = (slug) => {
  const others = GUIDES.filter((g) => g.slug !== slug).slice(0, 4)
  return `<nav class="g-related" aria-label="More letter ideas"><h2>More letter ideas</h2><ul>${others.map((g) => `<li><a href="/guides/${g.slug}/">${esc(g.h1)}</a></li>`).join('')}</ul></nav>`
}

function page(g) {
  const url = `${SITE}/guides/${g.slug}/`
  const schema = g.steps
    ? { '@context': 'https://schema.org', '@type': 'HowTo', name: g.h1, description: g.description, step: g.steps.map(([name, text], i) => ({ '@type': 'HowToStep', position: i + 1, name, text })) }
    : { '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.description, dateModified: today, author: { '@type': 'Organization', name: 'While You’re Away' }, mainEntityOfPage: url }
  let body = `<main class="g">
<p class="g-kicker"><a href="/guides/">Letter ideas</a></p>
<h1>${esc(g.h1)}</h1>
<p class="g-lede">${esc(g.lede)}</p>
`
  if (g.steps) {
    body += `<ol class="g-steps">${g.steps.map(([h, t]) => `<li><h2>${esc(h)}</h2><p>${esc(t)}</p></li>`).join('')}</ol>\n`
  }
  for (const s of g.sections || []) {
    body += `<section class="g-sec"><h2>${esc(s.h)}</h2>`
    if (s.items) body += `<ul class="g-list">${s.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`
    if (s.body) body += `<p>${esc(s.body)}</p>`
    if (s.ask) body += `<p class="g-ask"><span>To start:</span> ${esc(s.ask)}</p>`
    body += `</section>\n`
  }
  if (g.tips) {
    body += `<section class="g-sec"><h2>A few things that help</h2><dl class="g-tips">${g.tips.map(([h, t]) => `<div><dt>${esc(h)}</dt><dd>${esc(t)}</dd></div>`).join('')}</dl></section>\n`
  }
  body += cta(g.slug) + '\n' + related(g.slug) + '\n</main>\n'
  return head({ title: g.title, description: g.description, url, schema }) + body + foot(g.slug)
}

function index() {
  const url = `${SITE}/guides/`
  const schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Letter ideas for the time apart', url }
  const body = `<main class="g">
<h1>Letter ideas for the time apart</h1>
<p class="g-lede">Ideas and questions for the letters you write before a goodbye: open when letters, deployment, college, long distance and study abroad. Every word stays yours.</p>
<ul class="g-index">${GUIDES.map((g) => `<li><a href="/guides/${g.slug}/"><span class="g-index-h">${esc(g.h1)}</span><span class="g-index-p">${esc(g.description)}</span></a></li>`).join('')}</ul>
${cta('index')}
</main>
`
  return head({ title: 'Letter Ideas for the Time Apart | While You’re Away', description: 'Open when letter ideas, what to write before a deployment, letters for a college freshman, long distance and study abroad goodbyes.', url, schema }) + body + foot('index')
}

fs.mkdirSync(OUT, { recursive: true })
for (const g of GUIDES) {
  fs.mkdirSync(path.join(OUT, g.slug), { recursive: true })
  fs.writeFileSync(path.join(OUT, g.slug, 'index.html'), page(g))
}
fs.writeFileSync(path.join(OUT, 'index.html'), index())

// the app's public pages and the guides; private pages (boxes, drafts, checkout) are left out on purpose
const pages = ['/', '/services', '/about', '/contact', '/terms', '/privacy', '/refunds', '/guides/', ...GUIDES.map((g) => `/guides/${g.slug}/`)]
fs.writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`)
fs.writeFileSync('public/robots.txt', `User-agent: *
Disallow: /b/
Disallow: /api/
Disallow: /editor
Disallow: /export
Disallow: /paywall
Disallow: /keepsake
Disallow: /preview
Disallow: /auth/
Disallow: /lab/

Sitemap: ${SITE}/sitemap.xml
`)
console.log(`built ${GUIDES.length} guides, index, sitemap (${pages.length} urls), robots.txt`)
