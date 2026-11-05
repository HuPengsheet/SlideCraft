/* 桑基图：节点逐列出现，带子沿流向依次展开，悬停高亮。配置见 config.js。 */
const DEFAULTS = { theme: "dark", title: "", subtitle: "", unit: "", totalLabel: "总流量", nodes: [], links: [], note: "", linkStagger: 140 };
const { cfg, player, stage } = SC.init(DEFAULTS);

const VW = 1000, VH = 520, ML = 150, MR = 150, NW = 16, PAD = 14;
const PALETTE = ["var(--accent)", "var(--accent-2)", "var(--accent-3)", "var(--good)", "var(--bad)"];
const unit = String(cfg.unit ?? "");

/* ---- 数据整理 ---- */
const nodes = [], byId = new Map();
const addNode = (id, name, color) => {
  id = String(id);
  if (byId.has(id)) return byId.get(id);
  const n = { id, name: name == null || name === "" ? id : String(name), color: color ? String(color) : null, idx: nodes.length, in: 0, out: 0, depth: 0 };
  nodes.push(n); byId.set(id, n); return n;
};
(Array.isArray(cfg.nodes) ? cfg.nodes : []).forEach((n) => {
  if (n == null) return;
  if (typeof n === "object") { if (n.id != null) addNode(n.id, n.name, n.color); } else addNode(n);
});
const lmap = new Map();
(Array.isArray(cfg.links) ? cfg.links : []).forEach((l) => {
  if (!l || typeof l !== "object" || l.from == null || l.to == null) return;
  const v = parseFloat(l.value);
  if (!Number.isFinite(v) || v <= 0 || String(l.from) === String(l.to)) return;
  const a = addNode(l.from), b = addNode(l.to), k = a.idx + ">" + b.idx;
  if (lmap.has(k)) lmap.get(k).value += v; else lmap.set(k, { s: a, t: b, value: v });
});
let links = [...lmap.values()];

/* 列：Kahn 拓扑 + 最长路径；成环的回边丢弃 */
{
  const indeg = new Map(nodes.map((n) => [n, 0]));
  links.forEach((l) => indeg.set(l.t, indeg.get(l.t) + 1));
  const q = nodes.filter((n) => indeg.get(n) === 0), done = new Set();
  while (q.length) {
    const n = q.shift(); done.add(n);
    links.filter((l) => l.s === n).forEach((l) => {
      l.t.depth = Math.max(l.t.depth, n.depth + 1);
      indeg.set(l.t, indeg.get(l.t) - 1);
      if (indeg.get(l.t) === 0) q.push(l.t);
    });
  }
  links = links.filter((l) => done.has(l.s) && done.has(l.t));
}
links.forEach((l) => { l.s.out += l.value; l.t.in += l.value; });
nodes.forEach((n) => { n.val = Math.max(n.in, n.out); n.color = n.color || PALETTE[n.idx % PALETTE.length]; });
const used = nodes.filter((n) => n.val > 0 || cfg.nodes?.length);
const ncols = used.length ? Math.max(...used.map((n) => n.depth)) + 1 : 0;
const cols = Array.from({ length: ncols }, (_, c) => used.filter((n) => n.depth === c));
const hasFlow = links.length > 0;

/* ---- 布局 ---- */
const colX = (c) => (ncols === 1 ? VW / 2 - NW / 2 : ML + c * ((VW - ML - MR - NW) / (ncols - 1)));
const maxN = Math.max(1, ...cols.map((c) => c.length));
const GAP = Math.min(18, (VH - 2 * PAD) * 0.3 / Math.max(1, maxN - 1));
const H = VH - 2 * PAD;
let K = Infinity;
cols.forEach((c) => { const s = c.reduce((a, n) => a + n.val, 0); if (s > 0) K = Math.min(K, (H - GAP * (c.length - 1)) / s); });
if (!Number.isFinite(K)) K = 1;
cols.forEach((col, c) => {
  if (c > 0) {   /* 按来源节点中心的加权平均排序，减少交叉 */
    col.forEach((n) => { const ins = links.filter((l) => l.t === n); const w = ins.reduce((a, l) => a + l.value, 0); n.bary = w ? ins.reduce((a, l) => a + (l.s.y + l.s.h / 2) * l.value, 0) / w : 1e9 + n.idx; });
    col.sort((a, b) => a.bary - b.bary || a.idx - b.idx);
  }
  const tot = col.reduce((a, n) => a + Math.max(n.val * K, 0.5), 0) + GAP * (col.length - 1);
  let y = PAD + Math.max(0, (H - tot) / 2);
  col.forEach((n) => { n.h = Math.max(n.val * K, 0.5); n.y = y; n.x = colX(c); y += n.h + GAP; });
});
/* 带子的纵向位置 */
nodes.forEach((n) => { n.oy = 0; n.iy = 0; });
[...links].sort((a, b) => a.t.y - b.t.y).forEach((l) => { l.w = Math.max(l.value * K, 0.6); });
used.forEach((n) => {
  links.filter((l) => l.s === n).sort((a, b) => a.t.y - b.t.y).forEach((l) => { l.y0 = n.y + n.oy + l.w / 2; n.oy += l.value * K; });
  links.filter((l) => l.t === n).sort((a, b) => a.s.y - b.s.y).forEach((l) => { l.y1 = n.y + n.iy + l.w / 2; n.iy += l.value * K; });
});
const total = cols.length ? cols[0].reduce((a, n) => a + n.out, 0) : 0;

/* 文字宽度估算，用来截断 */
const tw = (s, fs) => [...s].reduce((a, ch) => a + (ch.charCodeAt(0) > 255 ? 1 : 0.58) * fs, 0);
const fit = (s, fs, max) => { if (tw(s, fs) <= max) return s; let out = ""; for (const ch of s) { if (tw(out + ch + "…", fs) > max) break; out += ch; } return out + "…"; };
const f1 = (n) => n.toFixed(2);

function svg() {
  if (!used.length) return "";
  const ls = links.map((l, i) => {
    const x0 = l.s.x + NW, x1 = l.t.x, cx = (x0 + x1) / 2;
    return `<path class="link" data-i="${i}" pathLength="1" d="M${f1(x0)} ${f1(l.y0)} C${f1(cx)} ${f1(l.y0)} ${f1(cx)} ${f1(l.y1)} ${f1(x1)} ${f1(l.y1)}" stroke-width="${f1(l.w)}" style="--c:${l.s.color};--d:${(1.0 + l.s.depth * 0.5 + i * (Math.max(0, +cfg.linkStagger) || 140) / 1000).toFixed(2)}"/>`;
  }).join("");
  const ns = cols.map((col, c) => col.map((n) => {
    const left = c === 0 && ncols > 1, right = c === ncols - 1;
    const anchor = left ? "end" : "start", x = left ? n.x - 10 : n.x + NW + 10;
    const maxW = left ? ML - 18 : right ? MR - 18 : 120;
    const cy = n.y + n.h / 2;
    const showName = n.h >= 8, showVal = n.h >= 30;
    n.id_ = n.idx;
    const txt = showName ? `<text class="nm" x="${f1(x)}" y="${f1(showVal ? cy - 2 : cy + 5)}" text-anchor="${anchor}">${SC.esc(fit(n.name, 15, maxW))}</text>` : "";
    const val = showVal ? `<text class="vl" x="${f1(x)}" y="${f1(cy + 15)}" text-anchor="${anchor}">${SC.esc(SC.fmt(n.val, { decimals: n.val % 1 ? 1 : 0 }) + unit)}</text>` : "";
    return `<g class="node" data-n="${n.idx}" style="--c:${n.color};--d:${(c * 0.5).toFixed(2)}"><rect x="${f1(n.x)}" y="${f1(n.y)}" width="${NW}" height="${f1(n.h)}" rx="3"/>${txt}${val}</g>`;
  }).join("")).join("");
  return `<svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet"><g class="links">${ls}</g><g class="nodes">${ns}</g></svg>`;
}

function build() {
  const head = `<div class="top"><div>${cfg.title ? `<h1 class="sc-title rise">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub rise" style="--d:.12s">${SC.esc(cfg.subtitle)}</p>` : ""}</div>${hasFlow ? `<div class="big rise" style="--d:.2s"><b id="tot">0</b><span>${SC.esc(cfg.totalLabel ?? "")}</span></div>` : ""}</div>`;
  const body = used.length ? svg() : `<div class="empty">暂无数据</div>`;
  return `${head}<div class="plot rise" style="--d:.25s">${body}</div>${cfg.note ? `<p class="note rise" style="--d:.5s">${SC.rich(cfg.note)}</p>` : ""}<div class="tip" id="tip"></div>`;
}

player.play(async (r) => {
  stage.className = "stage" + (SC.reduce ? " nomo" : "");
  stage.innerHTML = build();
  const tot = SC.$("#tot", stage), tip = SC.$("#tip", stage), plot = SC.$(".plot", stage);
  const linkEls = SC.$$(".link", stage), nodeEls = SC.$$(".node", stage);
  const root = SC.$("svg", stage);
  const hl = (set) => { linkEls.forEach((e, i) => e.classList.toggle("hl", set.has(i))); root?.classList.toggle("has-hl", set.size > 0); };
  const place = (e, html) => {
    tip.innerHTML = html; tip.classList.add("show");
    const s = stage.getBoundingClientRect(), k = s.width / stage.offsetWidth || 1;
    const w = tip.offsetWidth * k;
    tip.style.left = SC.clamp(e.clientX - s.left + 14, 4, s.width - w - 4) / k + "px";
    tip.style.top = Math.max(4, e.clientY - s.top - 14 - tip.offsetHeight * k) / k + "px";
  };
  const pct = (v, t) => (t > 0 ? `<i>${(v / t * 100).toFixed(1)}%</i>` : "");
  plot.addEventListener("mousemove", (e) => {
    const l = e.target.closest(".link"), nd = e.target.closest(".node");
    if (l) {
      const d = links[+l.dataset.i]; hl(new Set([+l.dataset.i]));
      place(e, `${SC.esc(d.s.name)} → ${SC.esc(d.t.name)}<b>${SC.esc(SC.fmt(d.value, { decimals: d.value % 1 ? 1 : 0 }) + unit)}</b>${pct(d.value, d.s.out)}`);
    } else if (nd) {
      const n = nodes[+nd.dataset.n], s = new Set();
      links.forEach((d, i) => { if (d.s === n || d.t === n) s.add(i); }); hl(s);
      place(e, `${SC.esc(n.name)}<b>${SC.esc(SC.fmt(n.val, { decimals: n.val % 1 ? 1 : 0 }) + unit)}</b><i>流入 ${SC.esc(SC.fmt(n.in))} · 流出 ${SC.esc(SC.fmt(n.out))}</i>`);
    } else { hl(new Set()); tip.classList.remove("show"); }
  });
  plot.addEventListener("mouseleave", () => { hl(new Set()); tip.classList.remove("show"); });

  if (SC.reduce) { if (tot) tot.textContent = SC.fmt(total) + unit; stage.classList.add("on", "done"); return; }
  await r.wait(500);
  stage.classList.add("on");
  if (tot) SC.countUp(r, tot, total, { dur: 2200, suffix: unit });
  const end = 1.0 + Math.max(0, ncols - 1) * 0.5 + links.length * (Math.max(0, +cfg.linkStagger) || 140) / 1000 + 1.2;
  await r.wait(end * 1000);
  stage.classList.add("done");
});
