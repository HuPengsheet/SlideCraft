/* 便当格：混合尺寸的仪表盘格子，从左上角依次缩放入场。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  eyebrow: "",
  columns: 4,        // 列数 1 到 8
  rows: null,        // 行数，null 为自动
  gap: 1.1,          // 间距，em
  stagger: 90,       // 相邻格子出现间隔，毫秒
  tiles: []          // 见 config.js
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const SIZES = { stat: [1, 1], text: [1, 1], image: [2, 2], spark: [2, 1], list: [1, 2], quote: [1, 1] };
const TYPES = Object.keys(SIZES);
const int = (v, d, lo, hi) => { const n = Math.round(+v); return Number.isFinite(n) && v !== null && v !== "" ? SC.clamp(n, lo, hi) : d; };

/* 把格子排进网格：先放写了 col/row 的，再把其余的按顺序放到第一个放得下的位置 */
function pack(tiles, cols, fixedRows) {
  const used = new Set();
  const free = (c, r, w, h) => { for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) if (used.has(x + "," + y)) return false; return true; };
  const take = (c, r, w, h) => { for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) used.add(x + "," + y); };
  const maxRows = fixedRows || 40;
  const placed = [], pending = [];
  tiles.forEach((t) => {
    const [dw, dh] = SIZES[t.type];
    t._w = int(t.w, dw, 1, cols); t._h = int(t.h, dh, 1, maxRows);
    const c = int(t.col, 0, 1, cols), r = int(t.row, 0, 1, maxRows);
    if (c && r && c + t._w - 1 <= cols && free(c, r, t._w, t._h)) { t._c = c; t._r = r; take(c, r, t._w, t._h); placed.push(t); }
    else pending.push(t);
  });
  pending.forEach((t) => {
    for (let r = 1; r <= maxRows + 40; r++) {
      let hit = false;
      for (let c = 1; c + t._w - 1 <= cols; c++) if (free(c, r, t._w, t._h)) { t._c = c; t._r = r; take(c, r, t._w, t._h); hit = true; break; }
      if (hit) break;
    }
    if (!t._c) { t._c = 1; t._r = 1; }
    placed.push(t);
  });
  let rows = 1; placed.forEach((t) => { rows = Math.max(rows, t._r + t._h - 1); });
  if (fixedRows) { rows = fixedRows; return { rows, tiles: placed.filter((t) => t._r <= fixedRows) }; }
  return { rows, tiles: placed };
}

const ARROW = {
  up: '<svg viewBox="0 0 12 12"><path d="M6 10V2M2.5 5.5L6 2l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg viewBox="0 0 12 12"><path d="M6 2v8M2.5 6.5L6 10l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  flat: '<svg viewBox="0 0 12 12"><path d="M2 6h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};
const num = (v) => { const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/,/g, "")); return Number.isFinite(n) ? n : null; };
const decOf = (t, v) => {
  if (Number.isInteger(+t.decimals) && t.decimals !== "" && t.decimals !== null) return SC.clamp(+t.decimals, 0, 6);
  const m = String(v).match(/\.(\d+)/); return m ? Math.min(m[1].length, 6) : 0;
};
const deltaHTML = (t) => {
  if (t.delta === undefined || t.delta === null || t.delta === "") return "";
  let s = typeof t.delta === "number" ? (t.delta > 0 ? "+" : "") + t.delta + "%" : String(t.delta);
  const neg = /^\s*[-−]/.test(s), pos = /^\s*\+/.test(s);
  const dir = t.trend === "up" || t.trend === "down" ? t.trend : neg ? "down" : pos ? "up" : "flat";
  return `<div class="delta ${dir}">${ARROW[dir]}<span>${SC.esc(s)}</span></div>`;
};
/* 数字显示：能解析成数字则可滚动，否则原样显示 */
const bigHTML = (t) => {
  const n = num(t.value);
  return `<div class="big">${SC.esc(t.prefix || "")}<span class="n">${n === null ? SC.esc(t.value ?? "") : ""}</span>${t.unit ? `<small>${SC.esc(t.unit)}</small>` : ""}</div>`;
};
const sparkSVG = (data, w, h) => {
  const d = (Array.isArray(data) ? data : []).map(num).filter((x) => x !== null);
  if (d.length < 2) return "";
  const pad = 6, mn = Math.min(...d), mx = Math.max(...d), span = mx - mn || 1;
  const pts = d.map((v, i) => [pad + (w - pad * 2) * i / (d.length - 1), pad + (h - pad * 2) * (1 - (v - mn) / span)]);
  let p = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2;
    p += ` C${cx.toFixed(1)} ${y0.toFixed(1)} ${cx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  const len = Math.ceil(pts.reduce((a, q, i) => a + (i ? Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]) : 0), 0) * 1.25 + 10);
  return `<svg viewBox="0 0 ${w} ${h}" style="--len:${len}"><path class="ar" d="${p} L${last[0].toFixed(1)} ${h} L${pts[0][0].toFixed(1)} ${h} Z"/><path class="ln" d="${p}"/><circle class="dt" cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="${(h * .045 + 2.5).toFixed(1)}"/></svg>`;
};
const CHECK = '<svg viewBox="0 0 12 12"><path pathLength="1" d="M2.5 6.3l2.4 2.4 4.6-5"/></svg>';

function build(t) {
  const el = SC.el(`tile ${t.type}${t.accent ? " accent" : ""}`);
  el.style.gridColumn = `${t._c} / span ${t._w}`; el.style.gridRow = `${t._r} / span ${t._h}`;
  const ty = t.type;
  if (ty === "stat") {
    el.innerHTML = `${t.label ? `<div class="lab">${SC.esc(t.label)}</div>` : ""}<div>${bigHTML(t)}${deltaHTML(t)}</div>`;
  } else if (ty === "spark") {
    el.innerHTML = `<div class="top"><div>${t.label ? `<div class="lab">${SC.esc(t.label)}</div>` : ""}<div style="margin-top:.4em">${bigHTML(t)}</div></div>${deltaHTML(t)}</div><div class="sp"></div>`;
  } else if (ty === "list") {
    const items = (Array.isArray(t.items) ? t.items : []).map((i) => (i && typeof i === "object" ? i : { text: i })).filter((i) => i.text !== undefined && i.text !== null);
    el.innerHTML = `${t.heading ? `<h3>${SC.esc(t.heading)}</h3>` : ""}<div class="rows">${items.map((i) => `<div class="row${i.done === false ? " nock" : ""}"><span class="box">${CHECK}</span><span>${SC.esc(i.text)}</span></div>`).join("")}</div>`;
  } else if (ty === "image") {
    if (t.src) {
      const m = SC.media(t.src, { alt: t.caption || "" });
      m.addEventListener("error", () => m.remove());
      el.append(m);
    }
    if (t.caption) el.append(SC.el("cap", SC.esc(t.caption)));
  } else if (ty === "quote") {
    el.innerHTML = `<div class="qm">“</div><p>${SC.esc(t.text ?? "")}</p>${t.by ? `<div class="by">${SC.esc(t.by)}</div>` : ""}`;
  } else {
    el.innerHTML = `${t.eyebrow ? `<div class="eb">${SC.esc(t.eyebrow)}</div>` : '<div class="bar"></div>'}${t.heading ? `<h3>${SC.esc(t.heading)}</h3>` : ""}<p>${SC.rich(t.body ?? t.text ?? "")}</p>`;
  }
  return el;
}

/* 按格子宽度缩放大数字，避免溢出 */
function fitBig(el) {
  const big = SC.$(".big", el); if (!big) return;
  const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
  const avail = el.clientWidth - fs * 2.6 - (el.classList.contains("spark") ? el.clientWidth * .18 : 0);
  const chars = Math.max(2, big.textContent.length + 1);
  const base = el.classList.contains("spark") ? 2.1 : 2.8;
  const want = Math.min(base, (avail / fs) / (chars * .62));
  el.style.setProperty("--vs", Math.max(1.2, want).toFixed(2) + "em");
}

player.play(async (r) => {
  const cols = int(cfg.columns, 4, 1, 8);
  const tiles = (Array.isArray(cfg.tiles) ? cfg.tiles : []).filter((t) => t && typeof t === "object").slice(0, 60)
    .map((t) => ({ ...t, type: TYPES.includes(t.type) ? t.type : "text" }));
  const layout = pack(tiles, cols, cfg.rows ? int(cfg.rows, 0, 1, 40) : 0);
  const gap = Number.isFinite(+cfg.gap) ? SC.clamp(+cfg.gap, 0, 4) : 1.1;

  const head = (cfg.eyebrow || cfg.title || cfg.subtitle)
    ? `<div class="head">${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}</div>` : "";
  stage.innerHTML = `${head}<div class="grid" style="--c:${cols};--r:${layout.rows};--gap:${gap}em"></div>`;
  const grid = SC.$(".grid", stage);

  const nodes = layout.tiles.map((t) => { const el = build(t); grid.append(el); return { t, el }; });
  nodes.forEach(({ t, el }) => {
    fitBig(el);
    const n = SC.$(".n", el), v = num(t.value);
    if (n && v !== null) n.textContent = SC.fmt(v, { decimals: decOf(t, t.value) });
    const sp = SC.$(".sp", el);
    if (sp && sp.clientWidth > 4) sp.innerHTML = sparkSVG(t.data, Math.round(sp.clientWidth), Math.round(sp.clientHeight));
  });
  const order = nodes.slice().sort((a, b) => (a.t._r + a.t._c) - (b.t._r + b.t._c) || a.t._r - b.t._r);

  const reveal = (t, el) => {
    el.classList.add("on");
    const n = SC.$(".n", el), v = num(t.value);
    if (n && v !== null) r.spawn(SC.countUp(r, n, v, { dur: 1500, decimals: decOf(t, t.value) }));
    if (t.type === "list") r.spawn((async () => {
      for (const row of SC.$$(".row", el)) {
        row.classList.add("in"); await r.wait(180);
        if (!row.classList.contains("nock")) row.classList.add("ck");
        await r.wait(220);
      }
    })());
  };

  if (SC.reduce) {
    order.forEach(({ t, el }) => { el.classList.add("on"); SC.$$(".row", el).forEach((w) => w.classList.add("in", ...(w.classList.contains("nock") ? [] : ["ck"]))); });
    grid.classList.add("ready"); return;
  }
  await r.wait(300);
  for (const { t, el } of order) { reveal(t, el); await r.wait(+cfg.stagger >= 0 ? +cfg.stagger : 90); }
  await r.wait(2200);
  grid.classList.add("ready");
});
