/* 流程图：节点依次出现，连线随后画出，光点沿连线流动。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "流程图",
  eyebrow: "",
  heading: "",
  layout: "free",        // "free" 用节点自带 x、y；"row" 给缺少坐标的节点自动排布
  columns: 5,            // row 布局每行个数
  nodeMs: 600,           // 节点出现间隔，毫秒
  flowMs: 2200,          // 光点走完一条线的时间，毫秒
  loopFlow: true,        // 搭建后光点是否持续流动
  nodes: [],             // { id, label, sub, icon, x, y, kind }
  edges: []              // { from, to, label, curve }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const NS = "http://www.w3.org/2000/svg";
const W = 160, H = 90;   // SVG 坐标系，与舞台 16:9 一致，1 单位 = 舞台宽度的 0.625%

/* 没写坐标的节点：row 布局下均匀排布，否则落在舞台中央 */
function place(nodes) {
  const auto = nodes.filter((n) => n.x == null || n.y == null);
  const cols = Math.max(1, Math.min(cfg.columns || 5, auto.length));
  const rows = Math.ceil(auto.length / cols);
  auto.forEach((n, i) => {
    if (cfg.layout !== "row") { n._x = 50; n._y = 50; return; }
    const row = Math.floor(i / cols), c = i % cols;
    const inRow = cols;   // 每行沿用同一列网格，保持对齐
    n._x = 10 + 80 * (inRow === 1 ? 0.5 : c / (inRow - 1));
    n._y = rows === 1 ? 50 : 25 + 55 * (row / (rows - 1));
  });
  nodes.forEach((n) => { if (n.x != null && n.y != null) { n._x = +n.x; n._y = +n.y; } });
}

/* 从中心 c 朝 toward 方向走，直到离开半宽 hw、半高 hh 的矩形，再多留 gap */
function clip(c, toward, hw, hh, gap) {
  const dx = toward.x - c.x, dy = toward.y - c.y, len = Math.hypot(dx, dy) || 1;
  const k = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  const s = k * len + gap;
  return { x: c.x + (dx / len) * s, y: c.y + (dy / len) * s };
}

player.play(async (r) => {
  stage.innerHTML = "";
  const nodes = cfg.nodes.map((n) => ({ ...n }));
  place(nodes);
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  if (cfg.eyebrow || cfg.heading) {
    stage.append(SC.el("head", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.heading ? `<h1 class="sc-title">${SC.esc(cfg.heading)}</h1>` : ""}`));
  }
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "edges");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("preserveAspectRatio", "none");
  stage.append(svg);

  /* 节点 */
  for (const n of nodes) {
    const kind = ["accent", "muted"].includes(n.kind) ? n.kind : "";
    n.dom = SC.el(`node sc-card ${kind}`, `${n.icon ? `<div class="ic">${SC.esc(n.icon)}</div>` : ""}<div class="lb">${SC.esc(n.label)}</div>${n.sub ? `<div class="sb">${SC.esc(n.sub)}</div>` : ""}`);
    n.dom.style.left = n._x + "%"; n.dom.style.top = n._y + "%";
    stage.append(n.dom);
  }
  /* 量出节点实际尺寸（换算成 SVG 单位），用来让连线停在边框外 */
  const sr = stage.getBoundingClientRect();
  for (const n of nodes) {
    n.hw = (n.dom.offsetWidth / (sr.width || 1)) * W / 2;
    n.hh = (n.dom.offsetHeight / (sr.height || 1)) * H / 2;
    n.c = { x: n._x * W / 100, y: n._y * H / 100 };
  }

  /* 连线 */
  const edges = [];
  for (const e of cfg.edges) {
    const a = byId[e.from], b = byId[e.to];
    if (!a || !b) continue;
    let ctrl = null, ta = b.c, tb = a.c;
    if (e.curve) {
      const dx = b.c.x - a.c.x, dy = b.c.y - a.c.y, len = Math.hypot(dx, dy) || 1;
      ctrl = { x: (a.c.x + b.c.x) / 2 - (dy / len) * len * 0.22, y: (a.c.y + b.c.y) / 2 + (dx / len) * len * 0.22 };
      ta = ctrl; tb = ctrl;
    }
    const p0 = clip(a.c, ta, a.hw, a.hh, 0.8), p1 = clip(b.c, tb, b.hw, b.hh, 1.6);
    const d = ctrl ? `M${p0.x} ${p0.y}Q${ctrl.x} ${ctrl.y} ${p1.x} ${p1.y}` : `M${p0.x} ${p0.y}L${p1.x} ${p1.y}`;
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", d); path.setAttribute("class", "edge");
    svg.append(path);
    const len = path.getTotalLength();
    path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    /* 箭头：沿终点切线方向画一个小三角 */
    const q = path.getPointAtLength(Math.max(0, len - 0.4)), ang = Math.atan2(p1.y - q.y, p1.x - q.x);
    const arrow = document.createElementNS(NS, "path");
    const s = 1.3, rot = (da, k) => `${p1.x - Math.cos(ang + da) * k},${p1.y - Math.sin(ang + da) * k}`;
    arrow.setAttribute("d", `M${p1.x} ${p1.y}L${rot(0.45, s * 1.4)}L${rot(-0.45, s * 1.4)}Z`);
    arrow.setAttribute("class", "arrow");
    svg.append(arrow);
    let label = null;
    if (e.label) {
      const m = path.getPointAtLength(len / 2);
      label = SC.el("elabel", SC.esc(e.label));
      label.style.left = (m.x / W * 100) + "%"; label.style.top = (m.y / H * 100) + "%";
      stage.append(label);
    }
    edges.push({ e, a, b, path, len, arrow, label });
  }

  const reveal = (ed) => { ed.path.style.strokeDashoffset = 0; ed.arrow.classList.add("on"); ed.label && ed.label.classList.add("on"); };
  const draw = (ed) => SC.reduce ? (reveal(ed), Promise.resolve())
    : r.spawn(r.raf((dt, t) => {
        const p = SC.ease.inOut(Math.min(t * 1000 / 600, 1));
        ed.path.style.strokeDashoffset = ed.len * (1 - p);
        if (p >= 1) { ed.arrow.classList.add("on"); ed.label && ed.label.classList.add("on"); }
        return p < 1;
      }));

  /* 搭建：节点逐个出现，两端都已出现的连线随即画出 */
  const shown = new Set(), drawn = new Set(), jobs = [];
  await r.wait(300);
  for (const n of nodes) {
    n.dom.classList.add("on"); shown.add(n.id);
    for (const ed of edges) {
      if (!drawn.has(ed) && shown.has(ed.a.id) && shown.has(ed.b.id)) { drawn.add(ed); jobs.push(draw(ed)); }
    }
    await r.wait(SC.reduce ? 0 : cfg.nodeMs);
  }
  await Promise.all(jobs);
  if (SC.reduce || !edges.length) return;

  /* 光点：每条线两个点（错开半程），沿路径用 getPointAtLength 移动 */
  const dots = [];
  edges.forEach((ed, i) => {
    for (let k = 0; k < (cfg.loopFlow ? 2 : 1); k++) {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("r", 0.7); c.setAttribute("class", "dot" + (k ? " d2" : ""));
      c.style.opacity = 0; svg.append(c);
      dots.push({ ed, c, phase: k * 0.5 + (cfg.loopFlow ? i * 0.13 : 0), delay: cfg.loopFlow ? 0 : i * 0.35 });
    }
  });
  const flowS = Math.max(200, cfg.flowMs) / 1000;
  await r.raf((dt, t) => {
    let alive = false;
    for (const d of dots) {
      const u = (t - d.delay) / flowS + d.phase;
      if (!cfg.loopFlow && (u < 0 || u >= 1)) { d.c.style.opacity = 0; if (u < 1) alive = true; continue; }
      alive = true;
      const f = ((u % 1) + 1) % 1, pt = d.ed.path.getPointAtLength(d.ed.len * f);
      d.c.setAttribute("cx", pt.x); d.c.setAttribute("cy", pt.y);
      d.c.style.opacity = Math.min(1, f * 8, (1 - f) * 8);
    }
    return cfg.loopFlow || alive;
  });
});
