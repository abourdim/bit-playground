/**
 * Convert MARKETING-GUIDE.md → MARKETING-GUIDE.html with a clean,
 * print-friendly stylesheet. Designed for sellers who'd rather
 * scroll through the guide in a browser than squint at raw markdown.
 *
 * Requires: pandoc on PATH.
 *
 * Usage:
 *   node etsy-package/tools/build-marketing-guide-html.mjs
 */

import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(__dirname, '..');
const MD = resolve(PKG, 'MARKETING-GUIDE.md');
const HTML = resolve(PKG, 'MARKETING-GUIDE.html');

if (!existsSync(MD)) { console.error(`❌ ${MD} missing`); process.exit(1); }

const CSS = `
  :root { color-scheme: light dark; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 880px;
    margin: 0 auto;
    padding: 40px 24px 80px;
    line-height: 1.55;
    color: #1a1d24;
    background: #fafbfc;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #0a0e12; color: #e8ecef; }
    a { color: #00ff88; }
    code { background: #161b22; }
    pre { background: #161b22; border-color: #30363d; }
    table th { background: #161b22; }
    blockquote { border-color: #30363d; color: #9ca3af; }
    hr { border-color: #30363d; }
  }
  h1 {
    font-size: 2.2em;
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin: 0 0 8px;
    padding-bottom: 8px;
    border-bottom: 3px solid #00ff88;
  }
  h2 {
    font-size: 1.5em;
    margin-top: 2.2em;
    padding-top: 0.8em;
    border-top: 1px solid #e1e4e8;
    letter-spacing: -0.01em;
  }
  h3 {
    font-size: 1.15em;
    margin-top: 1.5em;
    color: #008855;
  }
  @media (prefers-color-scheme: dark) {
    h2 { border-color: #30363d; }
    h3 { color: #00ff88; }
  }
  p, li { font-size: 15px; }
  code {
    background: #f2f4f7;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 13px;
  }
  pre {
    background: #f6f8fa;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 12px 16px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
  }
  pre code { background: none; padding: 0; font-size: inherit; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 14px;
  }
  th, td {
    text-align: left;
    padding: 10px 12px;
    border-bottom: 1px solid #e1e4e8;
    vertical-align: top;
  }
  th {
    background: #f2f4f7;
    font-weight: 700;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #576574;
  }
  @media (prefers-color-scheme: dark) {
    td, th { border-color: #30363d; }
    th { color: #9ca3af; }
    code { color: #e8ecef; }
  }
  blockquote {
    margin: 16px 0;
    padding: 12px 18px;
    border-left: 4px solid #00884a;
    background: rgba(0, 255, 136, 0.06);
    color: #4a5258;
    border-radius: 0 6px 6px 0;
  }
  hr { border: 0; border-top: 2px dashed #d1d5db; margin: 3em 0; }
  a { color: #006644; text-decoration: none; border-bottom: 1px solid transparent; }
  a:hover { border-bottom-color: currentColor; }

  /* Floating TOC */
  .toc-float {
    position: fixed; top: 20px; right: 20px;
    width: 260px; max-height: 80vh; overflow-y: auto;
    background: rgba(255,255,255,0.96); border: 1px solid #d1d5db;
    border-radius: 8px; padding: 16px 18px;
    font-size: 12px; line-height: 1.6;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    display: none;
  }
  @media (min-width: 1280px) { .toc-float { display: block; } }
  @media (prefers-color-scheme: dark) {
    .toc-float { background: rgba(22,27,34,0.96); border-color: #30363d; }
  }
  .toc-float h4 { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; }
  .toc-float ol { margin: 0; padding-left: 20px; }

  @media print {
    body { background: #fff; color: #000; max-width: none; padding: 10mm; font-size: 11pt; }
    h1, h2, h3 { page-break-after: avoid; break-after: avoid; }
    tr, pre, blockquote { page-break-inside: avoid; break-inside: avoid; }
    .toc-float { display: none; }
    a { color: #000; border-bottom: none; }
  }
`;

console.log('📄 Pandoc md → html …');
const body = execFileSync('pandoc', [
  MD,
  '-f', 'gfm',
  '-t', 'html5',
  '--no-highlight',
], { encoding: 'utf8' });

// Build a small floating TOC from H2 headings.
const h2s = [...body.matchAll(/<h2[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)]
  .map(m => ({ id: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }));
const tocHtml = h2s.length ? `
<nav class="toc-float" aria-label="Quick contents">
  <h4>Contents</h4>
  <ol>
    ${h2s.map(h => `<li><a href="#${h.id}">${h.text}</a></li>`).join('\n    ')}
  </ol>
</nav>` : '';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Marketing Asset Guide — bit-playground</title>
<style>${CSS}</style>
</head>
<body>
${tocHtml}
<main>
${body}
</main>
</body>
</html>`;

writeFileSync(HTML, html);
console.log(`✅ ${HTML}`);
