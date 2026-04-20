/**
 * A/B-ready caption generator for hero images + social posts.
 *
 * Produces N variants of: hero title, hero subtitle, social caption, pin
 * caption, email subject line — one set per audience (teacher/kid/maker).
 *
 * Dual-mode:
 *   - If ANTHROPIC_API_KEY is set, uses Claude for creative variants.
 *   - Otherwise, uses a deterministic template-based generator that
 *     combines word banks to produce diverse-feeling output. Never
 *     blocks on a missing API key.
 *
 * Usage:
 *   export ANTHROPIC_API_KEY=sk-...       # optional
 *   node etsy-package/tools/generate-captions.mjs
 *
 * Output:
 *   output/captions/captions.json   (structured, per-audience × per-format)
 *   output/captions/captions.md     (human-readable table)
 */

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(__dirname, '..');
const OUT = resolve(PKG, 'output', 'captions');
mkdirSync(OUT, { recursive: true });

const CFG = JSON.parse(readFileSync(resolve(__dirname, 'capture-config.json'), 'utf8'));
const PRODUCT = CFG.productName || 'Product';
const TAGLINE = CFG.altTextSuffix || 'browser-based · no install';

// ---------- template-based fallback ----------

const TEMPLATES = {
  teacher: {
    heroTitles: [
      `Every sensor, live in every browser`,
      `${PRODUCT} for classrooms that don't have 30 laptops`,
      `Zero-install STEM for real school Wi-Fi`,
      `Teach the sensor, not the setup`,
      `The micro:bit panel your IT team won't fight`,
    ],
    subtitles: [
      `Chrome / Edge · no install · 30 Chromebooks in 60 seconds`,
      `Pair once, stream forever · CSV export for every lesson`,
      `Built for STEM classrooms · site license available`,
      `Lifetime updates · open firmware · offline-ready`,
      `Real sensors, live graphs, data-analysis-ready CSVs`,
    ],
    socialCaptions: [
      `A browser tab turned my micro:bit into a live-data lab. Students ran 20-minute experiments without installing a thing. 🔬`,
      `If you've ever watched 30 Chromebooks stall on a Python install, this is the alternative.`,
      `One Etsy download. Zero IT tickets. Thirty students graphing real accelerometer data.`,
    ],
    pinCaptions: [
      `STEM teachers — you need to see this`,
      `Browser-based micro:bit panel (no install)`,
      `Turn 30 Chromebooks into data-science stations`,
    ],
    emailSubjects: [
      `30 kids. 60 seconds. Real sensor data.`,
      `The micro:bit panel that runs on anything with a browser`,
      `Stop installing Python on Chromebooks`,
    ],
  },
  kid: {
    heroTitles: [
      `Your micro:bit\nbecomes a playground`,
      `Control robots with code\n(and a browser tab)`,
      `Make the micro:bit\ndo stuff on screen`,
      `Draw. Sense. Move.\nAll from one page.`,
      `${PRODUCT}: turn a micro:bit into a game`,
    ],
    subtitles: [
      `Sensors, servos, 3D models. No install. No account.`,
      `Works offline after the first open.`,
      `Draw on the LEDs. Hear the buzzer. Tilt the 3D model.`,
      `8 tabs of things to try. Your parents won't understand most of them.`,
      `Code it, send it, watch it happen.`,
    ],
    socialCaptions: [
      `I drew a heart with my mouse and my micro:bit's LEDs lit up. ❤️`,
      `Tilt the real board → the 3D one tilts too. This is actual magic.`,
      `No install. Just open a tab and go. 🎮`,
    ],
    pinCaptions: [
      `Hack your micro:bit with a browser`,
      `3D + LEDs + motors, all from one tab`,
      `A toybox for your micro:bit`,
    ],
    emailSubjects: [
      `Tilt your micro:bit, tilt its twin`,
      `One browser tab. All 8 features.`,
      `Draw a heart, make it glow.`,
    ],
  },
  maker: {
    heroTitles: [
      `BLE Control Panel\nfor Makers`,
      `${PRODUCT}: hack the micro:bit\nfrom the browser`,
      `Web Bluetooth that\nactually works`,
      `MakeCode firmware\n+ live browser dashboard`,
      `Open source friendly\nBLE control surface`,
    ],
    subtitles: [
      `Live motors · 3D mirrors · CSV export · open firmware`,
      `MakeCode-compatible. Hackable. No vendor lock-in.`,
      `Chart.js graph · Three.js models · makecode.ts source included`,
      `Web Bluetooth, a fully hackable browser UI, MIT license.`,
      `Ship your own BLE device? Fork this and build on top.`,
    ],
    socialCaptions: [
      `Web Bluetooth is production-ready. This proves it. 📡`,
      `Browser → BLE → micro:bit → back again. 5ms round-trip. No install.`,
      `MIT-licensed, hackable, shippable. Use it as a reference for your own BLE device.`,
    ],
    pinCaptions: [
      `Web Bluetooth, done right`,
      `BLE dashboard template (hackable)`,
      `MakeCode firmware + browser UI`,
    ],
    emailSubjects: [
      `Web Bluetooth that survives production`,
      `The BLE control panel template I wish I'd had 2 years ago`,
      `Fork this · build on top · ship`,
    ],
  },
};

function templateGen() {
  return Object.fromEntries(
    Object.entries(TEMPLATES).map(([audience, t]) => [audience, {
      hero_titles: t.heroTitles,
      subtitles: t.subtitles,
      social_captions: t.socialCaptions,
      pin_captions: t.pinCaptions,
      email_subjects: t.emailSubjects,
    }])
  );
}

// ---------- Anthropic-powered variants ----------

async function llmGen() {
  const { default: Anthropic } = await import('@anthropic-ai/sdk').catch(() => ({ default: null }));
  if (!Anthropic) {
    console.log('⚠️  @anthropic-ai/sdk not installed; using template fallback.');
    return null;
  }
  const client = new Anthropic();
  const audiences = Object.keys(TEMPLATES);
  const out = {};

  for (const audience of audiences) {
    const prompt = `You are writing Etsy listing copy for "${PRODUCT}" — ${TAGLINE}.
Target audience: ${audience}.

Produce 5 each of: hero_titles (max 2 lines, punchy), subtitles (1 line, supportive),
social_captions (1-2 sentences, emoji-light), pin_captions (Pinterest-ready, under 60 chars),
email_subjects (under 50 chars, curiosity gap).

Return pure JSON with exactly these 5 keys. No markdown fences, no prose.`;

    try {
      console.log(`  · LLM generating for ${audience}`);
      const msg = await client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = msg.content?.[0]?.text || '';
      const json = text.match(/\{[\s\S]*\}/)?.[0];
      out[audience] = json ? JSON.parse(json) : null;
    } catch (e) {
      console.log(`  ⚠️  LLM failed for ${audience}: ${e.message}`);
      out[audience] = null;
    }
  }
  return out;
}

// ---------- run ----------

const usedLlm = !!process.env.ANTHROPIC_API_KEY;
console.log(`\n✍️  Caption generator (${usedLlm ? 'LLM mode' : 'template mode'})\n`);

let result = null;
if (usedLlm) result = await llmGen();
if (!result || Object.values(result).some(v => !v)) {
  console.log('  · falling back to templates for missing audiences');
  const templates = templateGen();
  if (!result) result = templates;
  else for (const k of Object.keys(templates)) if (!result[k]) result[k] = templates[k];
}

writeFileSync(join(OUT, 'captions.json'), JSON.stringify(result, null, 2));

const md = [
  `# ${PRODUCT} — A/B caption bank`,
  '',
  `Generated ${new Date().toISOString().slice(0, 10)} · ${usedLlm ? 'LLM-generated' : 'template-generated'}`,
  '',
  ...Object.entries(result).flatMap(([audience, sets]) => [
    `## ${audience}`,
    '',
    ...Object.entries(sets).flatMap(([key, vals]) => [
      `### ${key}`,
      '',
      ...vals.map((v, i) => `${i + 1}. ${v.replace(/\n/g, ' / ')}`),
      '',
    ]),
  ]),
].join('\n');
writeFileSync(join(OUT, 'captions.md'), md);

console.log(`\n✅ ${join(OUT, 'captions.json')}`);
console.log(`✅ ${join(OUT, 'captions.md')}\n`);
