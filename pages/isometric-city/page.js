/* 等距城市：canvas 画家算法，三明度面，镜头缓慢旋转。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  grid: 12,
  heightMap: null,
  seed: 5,
  highlight: [],
  rotate: 5
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const num = (v, d) => (v !== null && v !== "" && Number.isFinite(+v) ? +v : d);
let cleanup = null;

function valueNoise(seed) {
  const rnd = SC.rng(seed), tab = Array.from({ length: 64 * 64 }, rnd);
  const g = (x, y) => tab[((y & 63) * 64) + (x & 63)];
  const sm = (t) => t * t * (3 - 2 * t);
  return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = sm(x - xi), fy = sm(y - yi);
    const a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; };
}

/* 清洗 heightMap；没有则按种子生成 */
function buildMap() {
  const hm = cfg.heightMap;
  if (Array.isArray(hm) && hm.some((row) => Array.isArray(row) && row.length)) {
    const rows = hm.slice(0, 24).map((row) => (Array.isArray(row) ? row.slice(0, 24) : []));
    const n = Math.max(rows.length, ...rows.map((x) => x.length));
    return Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => {
      const v = Math.round(num(rows[y] && rows[y][x], 0)); return SC.clamp(v, 0, 12);
    }));
  }
  const n = Math.round(SC.clamp(num(cfg.grid, 12), 3, 24)), seed = Math.round(num(cfg.seed, 5)), nz = valueNoise(seed), rnd = SC.rng(seed + 1);
  return Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => {
    const dx = (x - (n - 1) / 2) / (n / 2), dy = (y - (n - 1) / 2) / (n / 2), d = Math.hypot(dx, dy);
    const v = nz(x * .45, y * .45) * (1.15 - d * .8) * 10 + rnd() * 1.2 - 0.6;
    return v < 1.3 ? 0 : SC.clamp(Math.round(v), 1, 12);
  }));
}

player.play(async (r) => {
  if (cleanup) cleanup();
  stage.innerHTML = "";

  const map = buildMap(), n = map.length;
  const rot = num(cfg.rotate, 5);
  const hl = new Set();
  for (const h of (Array.isArray(cfg.highlight) ? cfg.highlight : [])) if (h && Number.isInteger(+h.x) && Number.isInteger(+h.y) && h.x >= 0 && h.y >= 0 && h.x < n && h.y < n) hl.add(h.y * n + h.x);

  const blocks = [];
  const mid = (n - 1) / 2;
  map.forEach((row, y) => row.forEach((hgt, x) => { if (hgt > 0) blocks.push({ x: x - mid, y: y - mid, h: hgt, hl: hl.has(y * n + x), d: Math.hypot(x - mid, y - mid) }); }));
  const order = blocks.slice().sort((a, b) => a.d - b.d);
  order.forEach((b, i) => { b.delay = (i / Math.max(1, order.length)) * 2.2 + (b.d * 0.02); });
  const maxH = Math.max(1, ...blocks.map((b) => b.h));

  const canvas = SC.el("ic", "", "canvas");
  const copy = SC.el("copy", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1>${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p>${SC.esc(cfg.subtitle)}</p>` : ""}`);
  stage.append(canvas);
  if (cfg.title || cfg.eyebrow || cfg.subtitle) stage.append(copy);
  canvas.dataset.blocks = String(blocks.length);
  canvas.dataset.drawn = "0";
  const ctx = canvas.getContext("2d");

  const probe = document.createElement("canvas").getContext("2d");
  const root = getComputedStyle(document.documentElement);
  const rgb = (name, fb) => {
    probe.fillStyle = "#888"; probe.fillStyle = root.getPropertyValue(name).trim() || fb;
    const m = probe.fillStyle;
    if (m[0] === "#") return [parseInt(m.slice(1, 3), 16), parseInt(m.slice(3, 5), 16), parseInt(m.slice(5, 7), 16)];
    const q = m.match(/[\d.]+/g) || [136, 136, 136]; return [+q[0], +q[1], +q[2]];
  };
  const C = { bg: rgb("--bg", "#111"), surface: rgb("--surface", "#222"), fg: rgb("--fg", "#eee"), line: rgb("--line", "#444"), a1: rgb("--accent", "#e8b84a") };
  const rgbs = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const lightBg = (C.bg[0] * 299 + C.bg[1] * 587 + C.bg[2] * 114) / 1000 > 140;
  /* 面颜色 = 基色按明度 l 在“暗端”与“亮端”之间插值。亮背景：基色是 surface，暗端偏 fg；暗背景：暗端是 bg 偏深 */
  const shade = (base, l) => lightBg ? mix(mix(base, C.fg, .55), base, l) : mix(mix(base, C.bg, .55), mix(base, C.fg, .22), l);
  const LIGHT = (() => { const v = [-.5, -.8], m = Math.hypot(...v); return v.map((x) => x / m); })();

  let W = 1, H = 1, dpr = 1;
  const fit = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = canvas.width = Math.max(1, Math.round(stage.clientWidth * dpr)); H = canvas.height = Math.max(1, Math.round(stage.clientHeight * dpr)); };
  fit();

  let T = 0, ang = 28 * Math.PI / 180;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const ca = Math.cos(ang), sa = Math.sin(ang);
    /* 单元边长（像素）：保证旋转后的整张网格和最高方块都放得进右侧区域 */
    const diag = n * Math.SQRT2;
    const cell = Math.min(W * .62 / (diag * .87), H * .86 / (diag * .5 + maxH * .42 * 1.0 + .6));
    const hu = cell * .42;                              // 每层高度
    const cx = W * .66, cy = H * .64;
    const proj = (x, y, z) => { const rx = x * ca - y * sa, ry = x * sa + y * ca; return [cx + (rx - ry) * cell * .866, cy + (rx + ry) * cell * .5 - z * hu, rx + ry]; };

    /* 地面光晕与地台 */
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cell * n * .9);
    g.addColorStop(0, `rgba(${C.a1[0] | 0},${C.a1[1] | 0},${C.a1[2] | 0},${lightBg ? .14 : .2})`); g.addColorStop(1, `rgba(${C.a1[0] | 0},${C.a1[1] | 0},${C.a1[2] | 0},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, cell * n * .9, 0, 7); ctx.fill();
    const e = n / 2 + .5;
    const corners = [[-e, -e], [e, -e], [e, e], [-e, e]].map(([x, y]) => proj(x, y, 0));
    ctx.beginPath(); corners.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    ctx.fillStyle = rgbs(mix(C.bg, C.surface, .7)); ctx.fill();
    ctx.strokeStyle = rgbs(mix(C.bg, C.line, .9)); ctx.lineWidth = Math.max(1, dpr); ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const t = -e + 1 + (i - 1) * 1 + 0, a = proj(-e + i, -e, 0), b = proj(-e + i, e, 0), c2 = proj(-e, -e + i, 0), d = proj(e, -e + i, 0);
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(c2[0], c2[1]); ctx.lineTo(d[0], d[1]);
    }
    ctx.stroke();
    ctx.strokeStyle = rgbs(mix(C.line, C.fg, .25)); ctx.lineWidth = Math.max(1, 1.4 * dpr);
    ctx.beginPath(); corners.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.stroke();

    /* 画家算法：按旋转后的 rx+ry 从远到近 */
    const list = [];
    for (const b of blocks) {
      const rx = b.x * ca - b.y * sa, ry = b.x * sa + b.y * ca;
      list.push([rx + ry, b]);
    }
    list.sort((a, b) => a[0] - b[0]);
    const base = [C.surface, C.a1], drawn = [];
    let count = 0;
    for (const [, b] of list) {
      const p = SC.clamp((T - b.delay) / .9, 0, 1);
      if (p <= 0) continue;
      const k = 1 + 1.7 * (p - 1) * (p - 1) * (p - 1) * 0;   // 保留位置：线性前先用 easeOut 带轻微过冲
      const ep = p >= 1 ? 1 : 1 - Math.pow(1 - p, 3) + Math.sin(p * Math.PI) * .06;
      const top = b.h * ep, s = .44, x0 = b.x - s, x1 = b.x + s, y0 = b.y - s, y1 = b.y + s;
      const bc = b.hl ? C.a1 : C.surface;
      const P = (x, y, z) => proj(x, y, z);
      /* 四个侧面：法线为屏幕上可见（rx+ry 方向朝观众）才画 */
      const sides = [
        { n: [0, 1], q: [[x0, y1], [x1, y1]] },
        { n: [1, 0], q: [[x1, y1], [x1, y0]] },
        { n: [0, -1], q: [[x1, y0], [x0, y0]] },
        { n: [-1, 0], q: [[x0, y0], [x0, y1]] }
      ];
      for (const sd of sides) {
        const nx = sd.n[0] * ca - sd.n[1] * sa, ny = sd.n[0] * sa + sd.n[1] * ca;
        if (nx + ny <= 0.001) continue;                 // 背向镜头
        const l = SC.clamp(.5 + .5 * (nx * LIGHT[0] + ny * LIGHT[1]) * 1.0, 0, 1) * .6 + .1;
        const A = P(sd.q[0][0], sd.q[0][1], 0), B = P(sd.q[1][0], sd.q[1][1], 0), A2 = P(sd.q[0][0], sd.q[0][1], top), B2 = P(sd.q[1][0], sd.q[1][1], top);
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(B2[0], B2[1]); ctx.lineTo(A2[0], A2[1]); ctx.closePath();
        ctx.fillStyle = rgbs(shade(bc, b.hl ? l : l * .9)); ctx.fill();
        ctx.strokeStyle = rgbs(mix(shade(bc, l), C.bg, .35)); ctx.lineWidth = Math.max(1, .8 * dpr); ctx.stroke();
      }
      const t1 = P(x0, y0, top), t2 = P(x1, y0, top), t3 = P(x1, y1, top), t4 = P(x0, y1, top);
      ctx.beginPath(); ctx.moveTo(t1[0], t1[1]); ctx.lineTo(t2[0], t2[1]); ctx.lineTo(t3[0], t3[1]); ctx.lineTo(t4[0], t4[1]); ctx.closePath();
      ctx.fillStyle = rgbs(shade(bc, 1)); ctx.fill();
      ctx.strokeStyle = rgbs(mix(shade(bc, 1), C.fg, .25)); ctx.lineWidth = Math.max(1, .9 * dpr); ctx.stroke();
      count++;
    }
    canvas.dataset.drawn = String(count);
  }

  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => { fit(); draw(); }) : null;
  if (ro) ro.observe(stage);
  cleanup = () => { if (ro) ro.disconnect(); };

  if (SC.reduce) { T = 99; draw(); canvas.classList.add("on"); copy.classList.add("on"); return; }
  draw();
  requestAnimationFrame(() => { canvas.classList.add("on"); copy.classList.add("on"); });
  await r.raf((dt, t) => { T = t; ang += rot * Math.PI / 180 * dt; draw(); return true; });
});
