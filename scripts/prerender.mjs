/**
 * Pre-renderer: crawls every URL in the live sitemap with a real browser,
 * captures the fully JS-rendered HTML, and writes it to dist/prerender/.
 *
 * nginx then tries these files before falling back to the SPA shell, so
 * crawlers (Bing, Facebook, WhatsApp) receive complete meta tags without
 * needing to execute JavaScript themselves.
 *
 * Output layout for a URL like https://www.sivanaltar.com/he/Blogs:
 *   dist/prerender/he/Blogs/index.html   ← matched by try_files /prerender$uri/index.html
 *   dist/prerender/he/Blogs.html         ← matched by try_files /prerender$uri.html
 *
 * Usage (CI): node scripts/prerender.mjs
 * Local:      npm install playwright && npx playwright install chromium && node scripts/prerender.mjs
 */

import { chromium } from 'playwright';
import https from 'https';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE    = 'https://www.sivanaltar.com';
const OUT_DIR = path.join(__dirname, '..', 'dist', 'prerender');

// ─── helpers ────────────────────────────────────────────────────────────────

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end',  ()    => resolve(body));
    }).on('error', reject);
  });
}

/** Pull every <loc> from the sitemap XML, return unique URLs. */
function parseSitemapUrls(xml) {
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return [...new Set(matches.map(m => m[1].trim()))];
}

/**
 * Write the HTML to two paths so nginx can serve it via either
 *   try_files /prerender$uri/index.html   (no trailing slash needed)
 *   try_files /prerender$uri.html
 */
function saveHtml(urlPath, html) {
  // e.g. /he/BlogPost/i-started-growing-roots  →  .../he/BlogPost/i-started-growing-roots/index.html
  const folderIndex = path.join(OUT_DIR, urlPath, 'index.html');
  fs.mkdirSync(path.dirname(folderIndex), { recursive: true });
  fs.writeFileSync(folderIndex, html, 'utf8');

  // e.g.  →  .../he/BlogPost/i-started-growing-roots.html
  const dotHtml = path.join(OUT_DIR, urlPath + '.html');
  fs.mkdirSync(path.dirname(dotHtml), { recursive: true });
  fs.writeFileSync(dotHtml, html, 'utf8');
}

// ─── main ────────────────────────────────────────────────────────────────────

console.log(`Fetching sitemap from ${SITE}/sitemap.xml …`);
const xml  = await httpsGet(`${SITE}/sitemap.xml`);
const urls = parseSitemapUrls(xml);
console.log(`Found ${urls.length} unique URLs to pre-render\n`);

const browser = await chromium.launch();

let ok = 0, fail = 0;

for (const url of urls) {
  process.stdout.write(`  ${url} … `);
  const page = await browser.newPage();
  try {
    // networkidle: no more than 0 in-flight requests for 500 ms — enough
    // for the React app to finish its API calls and update the DOM.
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Extra settle time in case a slow API call finishes just after networkidle.
    await page.waitForTimeout(500);

    const html    = await page.content();
    const urlPath = new URL(url).pathname;
    saveHtml(urlPath, html);
    console.log('✓');
    ok++;
  } catch (err) {
    console.log(`✗  (${err.message})`);
    fail++;
  } finally {
    await page.close();
  }
}

await browser.close();

console.log(`\nPre-render done: ${ok} succeeded, ${fail} failed`);
if (fail > 0) process.exit(1); // fail the CI step so the problem is visible
