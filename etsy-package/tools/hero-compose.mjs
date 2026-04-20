/**
 * A/B hero image compositor — JSON-driven, Playwright-rendered.
 *
 * Etsy allows 10 listing images. The image order influences search ranking
 * and Etsy's own A/B thumbnail experiment picks the best-performing hero.
 * Ship 2-5 hero variants from a single spec file; Etsy decides the winner.
 *
 * Reads `hero-specs.json` (same folder). Each spec becomes a composite
 * Etsy-thumbnail-sized (1500x1500) PNG combining:
 *   - A themed background
 *   - One or two app screenshots overlaid at an angle
 *   - A product title + subtitle
 *   - A compatibility badge ("Chrome / Edge" etc.)
 *
 * Usage:
 *   node etsy-package/tools/hero-compose.mjs [specName]
 *     (default = all specs in hero-specs.json)
 *
 * Output:
 *   output/heroes/<specName>.png
 */

import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(__dirname, '..');
const SHOTS = resolve(PKG, 'output', 'screenshots');
const OUT = resolve(PKG, 'output', 'heroes');
const TMP = resolve(OUT, '_tmp');
const SPECS_PATH = resolve(__dirname, 'hero-specs.json');
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

if (!existsSync(SPECS_PATH)) {
  console.error(`❌ hero-specs.json missing at ${SPECS_PATH}`);
  process.exit(1);
}

const { heroes } = JSON.parse(readFileSync(SPECS_PATH, 'utf8'));
const ONLY = process.argv[2];

const THEMES = {
  stealth: { bg: '#0a0e12', accent: '#00ff88',  text: '#e8ffe8', subtext: '#6b7a85' },
  neon:    { bg: '#050b1a', accent: '#00ff88',  text: '#ccffee', subtext: '#7ac8a8' },
  arctic:  { bg: '#e6eef4', accent: '#0077cc',  text: '#0a2540', subtext: '#567' },
  blaze:   { bg: '#1a0b05', accent: '#ff6b35',  text: '#ffeecc', subtext: '#aa7755' },
};

function compositeHtml(spec) {
  const t = THEMES[spec.theme] || THEMES.stealth;
  const accent = spec.accentColor || t.accent;
  const shots = (spec.screenshots || []).map(f => join(SHOTS, f).replace(/\\/g, '/'));
  const badge = spec.badge || 'Chrome / Edge · No install';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  @import url('https://fonts.googleapis.com/css2?family=Righteous&family=Orbitron:wght@500;700&family=Inter:wght@400;600;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1500px; height: 1500px; overflow: hidden; }
  body {
    background: ${t.bg};
    color: ${t.text};
    font-family: Inter, -apple-system, Segoe UI, sans-serif;
    position: relative;
  }
  .grid-bg {
    position: absolute; inset: 0;
    background-image:
      radial-gradient(circle at 20% 20%, ${accent}22 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, ${accent}11 0%, transparent 55%);
  }
  .overlay-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(${accent}08 1px, transparent 1px),
      linear-gradient(90deg, ${accent}08 1px, transparent 1px);
    background-size: 80px 80px;
    opacity: 0.6;
  }
  .content {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    padding: 60px 80px;
    z-index: 2;
  }
  .title {
    font-family: Orbitron, Inter, sans-serif;
    font-size: 100px;
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin-top: 20px;
    max-width: 1100px;
    color: ${accent};
    text-shadow: 0 4px 24px ${accent}55;
  }
  .subtitle {
    font-size: 38px;
    font-weight: 600;
    line-height: 1.25;
    color: ${t.text};
    margin-top: 24px;
    max-width: 1200px;
  }
  .shots {
    flex: 1;
    display: flex; align-items: center; justify-content: center;
    gap: 40px;
    margin: 40px 0;
    position: relative;
  }
  .shot {
    flex: 1;
    max-height: 720px;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 18px 60px rgba(0,0,0,0.55), 0 0 0 2px ${accent}44;
    transform: perspective(1800px) rotateY(-6deg);
  }
  .shot:nth-child(2) { transform: perspective(1800px) rotateY(8deg) translateY(40px); }
  .shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .badge {
    position: absolute; top: 60px; right: 80px;
    background: ${accent}; color: #000;
    padding: 12px 24px; border-radius: 999px;
    font-weight: 800; font-size: 22px;
    letter-spacing: 0.04em;
    box-shadow: 0 8px 24px ${accent}66;
  }
  .footer {
    display: flex; align-items: center; justify-content: space-between;
    font-size: 22px; color: ${t.subtext};
    padding-top: 20px; border-top: 1px solid ${accent}33;
  }
  .footer strong { color: ${accent}; letter-spacing: 0.06em; }
</style></head>
<body>
  <div class="grid-bg"></div>
  <div class="overlay-grid"></div>
  <div class="content">
    <div class="badge">${badge}</div>
    <div class="title">${spec.title || 'Product'}</div>
    <div class="subtitle">${spec.subtitle || ''}</div>
    <div class="shots">
      ${shots.map(s => `<div class="shot"><img src="file://${s}"></div>`).join('\n      ')}
    </div>
    <div class="footer">
      <div>${spec.footerLeft || 'Lifetime updates'}</div>
      <div><strong>${spec.footerRight || 'Etsy'}</strong></div>
    </div>
  </div>
</body></html>`;
}

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 1500 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  console.log(`\n🎨 Composing ${heroes.length} hero(es) @ 1500×1500\n`);
  for (const h of heroes) {
    if (ONLY && ONLY !== h.name) continue;
    const html = compositeHtml(h);
    const htmlPath = join(TMP, `${h.name}.html`);
    writeFileSync(htmlPath, html);
    await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800); // let fonts settle
    const out = join(OUT, `${h.name}.png`);
    await page.screenshot({ path: out });
    console.log(`  ✓ ${h.name}.png`);
  }
  await ctx.close();
} finally {
  await browser.close();
}

rmSync(TMP, { recursive: true, force: true });
console.log(`\n✅ ${OUT}\n`);
