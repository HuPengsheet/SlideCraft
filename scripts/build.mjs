#!/usr/bin/env node
// Usage: node scripts/build.mjs decks/demo.json [out.html]
// Assembles one self-contained HTML from a deck spec: theme + layouts + data.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad2 = (n) => String(n).padStart(2, '0');

const lookup = (ctx, path) => {
  if (path === '.') return ctx['.'];
  return path.split('.').reduce((v, k) => (v == null ? v : v[k]), ctx);
};

// Template syntax: {{x}} escaped, {{{x}}} raw, {{#each path}}..{{/each}}, {{#if path}}..{{/if}}.
// Inside each: {{.}} is the item, {{i}} is 1-based index, {{n}} is the zero-padded index.
// Blocks do not nest.
function render(tpl, ctx) {
  return tpl
    .replace(/\{\{#each ([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, path, inner) => {
      const list = lookup(ctx, path) ?? [];
      return list
        .map((item, idx) => {
          const base = typeof item === 'object' && item !== null ? item : { '.': item };
          return render(inner, { ...base, '.': base['.'] ?? item, i: idx + 1, n: pad2(idx + 1) });
        })
        .join('');
    })
    .replace(/\{\{#if ([\w.]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, path, inner) =>
      lookup(ctx, path) ? render(inner, ctx) : '')
    .replace(/\{\{\{([\w.]+)\}\}\}/g, (_, path) => lookup(ctx, path) ?? '')
    .replace(/\{\{([\w.]+)\}\}/g, (_, path) => esc(lookup(ctx, path) ?? ''));
}

const specPath = process.argv[2];
if (!specPath) { console.error('usage: build.mjs <deck.json> [out.html]'); process.exit(1); }
const deck = JSON.parse(readFileSync(specPath, 'utf8'));
const theme = deck.theme;
const themeDir = `themes/${theme}`;
if (!existsSync(join(ROOT, themeDir))) { console.error(`unknown theme: ${theme}`); process.exit(1); }
const themeMeta = JSON.parse(read(`${themeDir}/theme.json`));

const used = [...new Set(deck.slides.map((s) => s.layout))];
const layoutCss = [];
for (const name of used) {
  if (!existsSync(join(ROOT, `layouts/${name}.html`))) { console.error(`unknown layout: ${name}`); process.exit(1); }
  if (existsSync(join(ROOT, `layouts/${name}.css`))) layoutCss.push(read(`layouts/${name}.css`));
}

// Derived fields so layouts stay logic-free.
function prep(s) {
  if (s.bars) {
    const max = Math.max(...s.bars.map((b) => Number(b.value)));
    s.bars = s.bars.map((b) => ({ ...b, pct: Math.round((Number(b.value) / max) * 100) }));
  }
  return s;
}

const slides = deck.slides.map(prep).map((s, idx) => {
  const body = render(read(`layouts/${s.layout}.html`), { ...s, total: pad2(deck.slides.length), page: pad2(idx + 1) });
  return `<section class="slide l-${s.layout}" data-label="${pad2(idx + 1)} ${esc(s.label ?? s.layout)}">\n${body}\n</section>`;
});

const fonts = themeMeta.fontsUrl
  ? `<link rel="preconnect" href="https://fonts.googleapis.com" />\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n<link href="${themeMeta.fontsUrl}" rel="stylesheet" />`
  : '';

const html = `<!doctype html>
<html lang="${deck.lang ?? 'zh-CN'}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(deck.title ?? 'SlideCraft deck')}</title>
${fonts}
<style>
/* tokens: ${theme} */
${read(`${themeDir}/tokens.css`)}
/* base */
${read('core/base.css')}
/* layouts */
${layoutCss.join('\n')}
/* decor: ${theme} */
${existsSync(join(ROOT, `${themeDir}/decor.css`)) ? read(`${themeDir}/decor.css`) : ''}
</style>
<script>
${read('runtime/deck-stage.js')}
</script>
</head>
<body class="theme-${theme}">
<deck-stage width="1920" height="1080">
${slides.join('\n\n')}
</deck-stage>
</body>
</html>
`;

const out = process.argv[3] ?? join(ROOT, 'dist', `${basename(specPath, '.json')}.html`);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`built ${out} (${deck.slides.length} slides, theme ${theme}, layouts: ${used.join(', ')})`);
