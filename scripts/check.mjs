#!/usr/bin/env node
// Usage: node scripts/check.mjs dist/demo.html
// Injects a layout probe into a copy of the built deck and runs it in headless Chrome.
// Reports, per slide, elements that extend past the 1920x1080 canvas or whose content is clipped.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const src = resolve(process.argv[2]);
const probe = `<script>
window.addEventListener('load', () => setTimeout(() => {
  const out = [];
  document.querySelectorAll('deck-stage > .slide').forEach((s, i) => {
    const r = s.getBoundingClientRect();
    const issues = [];
    s.querySelectorAll('*').forEach((el) => {
      if (el.closest('.deco') || el.classList.contains('deco')) return;
      const b = el.getBoundingClientRect();
      if (!b.width && !b.height) return;
      const name = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '');
      if (b.right > r.right + 1 || b.bottom > r.bottom + 1 || b.left < r.left - 1 || b.top < r.top - 1)
        issues.push('out-of-canvas ' + name + ' [' + Math.round(b.left - r.left) + ',' + Math.round(b.top - r.top) + ',' + Math.round(b.right - r.left) + ',' + Math.round(b.bottom - r.top) + ']');
      if (el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflow !== 'visible')
        issues.push('clipped ' + name);
    });
    out.push(String(i + 1).padStart(2, '0') + ' ' + s.dataset.label + ': ' + (issues.length ? '\\n    ' + issues.join('\\n    ') : 'ok'));
  });
  const pre = document.createElement('pre'); pre.id = 'probe'; pre.textContent = out.join('\\n');
  document.body.appendChild(pre);
}, 600));
</script>`;
const tmp = src.replace(/\.html$/, '.probe.html');
writeFileSync(tmp, readFileSync(src, 'utf8').replace('</body>', probe + '</body>'));
let dom;
try {
  dom = execFileSync('google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', '--window-size=1920,1080',
    '--virtual-time-budget=5000', '--dump-dom', 'file://' + tmp], { encoding: 'utf8', maxBuffer: 1 << 26 });
} finally {
  rmSync(tmp, { force: true });
}
const m = dom.match(/<pre id="probe">([\s\S]*?)<\/pre>/);
console.log(m ? m[1].replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&') : 'probe produced no output');
