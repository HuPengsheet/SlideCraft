/* 思维导图：中心向两侧辐射，贝塞尔分支逐层长出，每层一个强调色。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  eyebrow: "",
  center: "中心主题",
  branches: [],
  maxDepth: 5,
  maxNodes: 150,
  staggerMs: 90
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const NS = "http://www.w3.org/2000/svg";
const SW = 100 / 1.6, SH = SW * 9 / 16;   // 舞台尺寸，单位 em
const COLORS = ["var(--accent-2)", "var(--accent-3)", "var(--good)", "var(--fg-soft)"];

/* 规整配置：字符串或对象都接受，坏数据跳过，层数与节点数封顶，环状引用不会死循环 */
function normalize() {
  const maxDepth = SC.clamp(Math.floor(+cfg.maxDepth) || 5, 1, 8);
  let budget = SC.clamp(Math.floor(+cfg.maxNodes) || 150, 1, 1000);
  const build = (b, depth) => {
    if (b == null || budget <= 0) return null;
    const isObj = typeof b === "object";
    const label = String(isObj ? (b.label ?? b.name ?? "") : b).trim();
    if (!label) return null;
    budget--;
    const node = { label, depth, kids: [] };
    if (isObj && Array.isArray(b.children) && depth < maxDepth) {
      for (const c of b.children) { const k = build(c, depth + 1); if (k) { k.parent = node; node.kids.push(k); } }
    }
    return node;
  };
  const c = cfg.center;
  const root = { label: String((c && typeof c === "object" ? c.label : c) || "中心主题"), sub: c && typeof c === "object" ? String(c.sub || "") : "", depth: 0, kids: [] };
  budget--;
  for (const b of Array.isArray(cfg.branches) ? cfg.branches : []) { const k = build(b, 1); if (k) { k.parent = root; root.kids.push(k); } }
  return root;
}
const leaves = (n) => (n.kids.length ? n.kids.reduce((s, k) => s + leaves(k), 0) : 1);
const walk = (n, fn) => { fn(n); n.kids.forEach((k) => walk(k, fn)); };

player.play(async (r) => {
  stage.innerHTML = "";
  const root = normalize();
  const hasHead = !!(cfg.eyebrow || cfg.title);
  if (hasHead) stage.append(SC.el("head", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}`));

  /* 分成左右两侧：按顺序切一刀，使两侧叶子数最接近 */
  const tops = root.kids, counts = tops.map(leaves), total = counts.reduce((a, b) => a + b, 0);
  let best = tops.length, bestDiff = Infinity, acc = 0;
  for (let k = 0; k <= tops.length; k++) {
    if (k > 0) acc += counts[k - 1];
    const diff = Math.abs(acc - (total - acc)) + (k === 0 && tops.length > 1 ? 1e6 : 0);
    if (diff < bestDiff) { bestDiff = diff; best = k; }
  }
  if (tops.length > 1) best = SC.clamp(best, 1, tops.length - 1);
  const sides = [{ dir: 1, list: tops.slice(0, best) }, { dir: -1, list: tops.slice(best).reverse() }];   // 左侧自下而上，整体顺时针

  const world = SC.el("world");
  world.style.width = SW + "em"; world.style.left = "0"; world.style.top = "0";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "mm-edges");
  world.append(svg);
  stage.append(world);

  /* 建节点并测量（单位 em） */
  const fs = parseFloat(getComputedStyle(stage).fontSize) || 16;
  const all = [];
  const mk = (n) => {
    const cls = n.depth === 0 ? "root" : n.depth === 1 ? "d1" : "dn" + (n.depth >= 4 ? " deep" : "");
    n.color = n.depth === 0 ? "var(--accent)" : COLORS[Math.min(n.depth - 1, COLORS.length - 1)];
    n.dom = SC.el(`n ${cls}`);
    n.dom.style.setProperty("--c", n.color);
    const s = document.createElement("span"); s.textContent = n.label; n.dom.append(s);
    n.dom.title = n.label;
    if (n.sub) { const sm = document.createElement("small"); sm.textContent = n.sub; n.dom.append(sm); }
    world.append(n.dom); all.push(n);
  };
  mk(root); root.dir = 0;
  for (const s of sides) for (const t of s.list) walk(t, (n) => { n.dir = s.dir; mk(n); });
  for (const n of all) { n.w = n.dom.offsetWidth / fs; n.h = n.dom.offsetHeight / fs; }

  /* 行布局：叶子占一行，父节点取首尾子节点的中点 */
  const pitch = Math.max(2.4, ...all.filter((n) => n.depth > 0).map((n) => n.h + 0.7));
  const place = (list) => {
    let row = 0;
    const rec = (n) => {
      if (!n.kids.length) { n.row = row++; return; }
      n.kids.forEach(rec);
      n.row = (n.kids[0].row + n.kids[n.kids.length - 1].row) / 2;
    };
    list.forEach(rec);
    return row;
  };
  const GAP1 = 4.2, GAP = 2.6;
  root.cx = 0; root.cy = 0;
  for (const s of sides) {
    const nrows = place(s.list);
    const maxD = Math.max(0, ...s.list.map((t) => { let m = 0; walk(t, (n) => (m = Math.max(m, n.depth))); return m; }));
    const colW = []; s.list.forEach((t) => walk(t, (n) => (colW[n.depth] = Math.max(colW[n.depth] || 0, n.w))));
    const colX = []; let x = root.w / 2 + GAP1;
    for (let d = 1; d <= maxD; d++) { colX[d] = x; x += (colW[d] || 0) + GAP; }
    s.list.forEach((t) => walk(t, (n) => {
      n.cy = (n.row - (nrows - 1) / 2) * pitch;
      n.near = s.dir * colX[n.depth];                      // 靠近中心一侧的边
      n.far = s.dir * (colX[n.depth] + n.w);
      n.cx = (n.near + n.far) / 2;
    }));
  }

  /* 范围、缩放、居中 */
  let x0 = -root.w / 2, x1 = root.w / 2, y0 = -root.h / 2, y1 = root.h / 2;
  for (const n of all) { x0 = Math.min(x0, n.cx - n.w / 2); x1 = Math.max(x1, n.cx + n.w / 2); y0 = Math.min(y0, n.cy - n.h / 2); y1 = Math.max(y1, n.cy + n.h / 2); }
  const pad = 0.6, ox = -x0 + pad, oy = -y0 + pad, ww = x1 - x0 + pad * 2, wh = y1 - y0 + pad * 2;
  const rTop = hasHead ? 7.6 : 1.6, rW = SW - 4, rH = SH - rTop - 1.8;
  const sc = Math.min(rW / ww, rH / wh, 1.25);
  world.style.width = ww + "em"; world.style.height = wh + "em";
  world.style.left = (SW - ww * sc) / 2 + "em"; world.style.top = rTop + (rH - wh * sc) / 2 + "em";
  world.style.transform = `scale(${sc})`;
  svg.setAttribute("width", ww * fs); svg.setAttribute("height", wh * fs);
  svg.style.width = ww + "em"; svg.style.height = wh + "em";
  svg.setAttribute("viewBox", `0 0 ${ww} ${wh}`);
  for (const n of all) {
    n.dom.style.left = n.cx - n.w / 2 + ox + "em"; n.dom.style.top = n.cy - n.h / 2 + oy + "em";
  }

  /* 连线：父节点靠近子节点一侧的边中点 → 子节点近侧边中点 */
  for (const n of all) {
    if (!n.parent) continue;
    const p = n.parent;
    const ax = (p.depth === 0 ? n.dir * p.w / 2 : p.dir * (Math.abs(p.far))) + ox, ay = p.cy + oy;
    const bx = n.near + ox, by = n.cy + oy, mx = (ax + bx) / 2;
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", `M${ax} ${ay}C${mx} ${ay} ${mx} ${by} ${bx} ${by}`);
    path.setAttribute("class", "edge");
    path.style.stroke = n.color;
    path.style.strokeWidth = [0, .26, .18, .13, .1, .08, .08, .08, .08][n.depth] ?? .08;
    svg.append(path);
    const len = path.getTotalLength() || 100;
    path.style.setProperty("--len", len);
    n.edge = path;
  }

  /* 逐层生长 */
  const byDepth = [];
  for (const n of all) (byDepth[n.depth] = byDepth[n.depth] || []).push(n);
  const show = (n, i, step) => { n.dom.style.setProperty("--dl", i * step + "ms"); n.dom.classList.add("on"); if (n.edge) { n.edge.style.setProperty("--dl", Math.max(0, i * step - 80) + "ms"); n.edge.classList.add("on"); } };
  if (SC.reduce) { all.forEach((n) => show(n, 0, 0)); }
  else {
    await r.wait(300);
    show(root, 0, 0);
    await r.wait(500);
    for (let d = 1; d < byDepth.length; d++) {
      const lv = byDepth[d] || [];
      const step = Math.min(Math.max(10, +cfg.staggerMs || 90), 1100 / Math.max(1, lv.length));
      lv.forEach((n, i) => show(n, i, step));
      await r.wait(lv.length * step + 650);
    }
  }

  /* 悬停：高亮祖先与子孙 */
  const link = (n) => {
    n.dom.addEventListener("mouseenter", () => {
      const set = new Set();
      for (let a = n; a; a = a.parent) set.add(a);
      walk(n, (k) => set.add(k));
      for (const k of all) { k.dom.classList.toggle("hl", set.has(k)); k.edge && k.edge.classList.toggle("hl", set.has(k)); }
      world.classList.add("focus");
    });
    n.dom.addEventListener("mouseleave", () => world.classList.remove("focus"));
  };
  all.forEach(link);
});
