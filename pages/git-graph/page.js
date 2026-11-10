/* Git 分支图：主干从左向右生长，分支分叉、提交点依次亮起，最后合并并打上版本标签。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "Git 分支图",
  eyebrow: "",
  heading: "",
  subheading: "",
  stepMs: 650,
  seed: 7,
  branches: [],          // { name }
  commits: []            // { id, branch, msg, from, merge, tag, hash }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const NS = "http://www.w3.org/2000/svg";
const W = 1600, H = 900;
const PALETTE = ["var(--accent-2)", "var(--accent-3)", "var(--good)", "var(--bad)", "var(--fg-soft)"];

function svg(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.append(e);
  return e;
}

player.play(async (r) => {
  const branches = (cfg.branches || []).filter((b) => b && b.name).slice(0, 5);
  const rowOf = {}, colorOf = {};
  let k = 0;
  branches.forEach((b, i) => {
    rowOf[b.name] = i;
    colorOf[b.name] = /^(main|master|trunk)$/.test(b.name) ? "var(--accent)" : PALETTE[k++ % PALETTE.length];
  });
  const commits = (cfg.commits || []).filter((c) => c && c.id && c.branch in rowOf).slice(0, 14);

  const head = (cfg.eyebrow || cfg.heading || cfg.subheading) ? `<div class="hd">
    ${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}
    ${cfg.heading ? `<h1 class="sc-title">${SC.esc(cfg.heading)}</h1>` : ""}
    ${cfg.subheading ? `<p class="sc-sub">${SC.esc(cfg.subheading)}</p>` : ""}</div>` : "";
  stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"></svg>${head}`;
  const root = SC.$("svg", stage);
  const gGuide = svg("g", {}, root), gEdge = svg("g", {}, root), gDot = svg("g", {}, root), gLab = svg("g", {}, root);

  /* 布局：每个提交一列，每条分支一行 */
  const n = branches.length, m = commits.length;
  const gap = n > 1 ? Math.min(170, 400 / (n - 1)) : 0;
  const rowY = (i) => 560 - gap * (n - 1) / 2 + i * gap;
  const x0 = 310, x1 = 1400, step = m > 1 ? (x1 - x0) / (m - 1) : 0;
  const rnd = SC.rng(Number(cfg.seed) || 7);
  const byId = {};
  commits.forEach((c, i) => {
    byId[c.id] = { ...c, i, x: x0 + i * step, y: rowY(rowOf[c.branch]), row: rowOf[c.branch],
      hash: String(c.hash || Array.from({ length: 7 }, () => "0123456789abcdef"[Math.floor(rnd() * 16)]).join("")).slice(0, 8),
      dirs: [], outSame: false };
  });

  /* 连线：同分支的上一个提交、分叉起点、合并来源 */
  const edges = [], lastOn = {};
  for (const c0 of commits) {
    const c = byId[c0.id];
    const prev = lastOn[c.branch];
    if (prev) edges.push({ a: prev, b: c, color: colorOf[c.branch] });
    else if (c.from && byId[c.from] && byId[c.from].i < c.i) edges.push({ a: byId[c.from], b: c, color: colorOf[c.branch] });
    if (c.merge && lastOn[c.merge] && c.merge !== c.branch) edges.push({ a: lastOn[c.merge], b: c, color: colorOf[c.merge], merge: true });
    lastOn[c.branch] = c;
  }
  for (const e of edges) {
    if (e.a.row !== e.b.row) { e.a.dirs.push(Math.sign(e.b.row - e.a.row)); e.b.dirs.push(Math.sign(e.a.row - e.b.row)); }
    else e.a.outSame = true;
  }

  const pathOf = (a, b) => {
    if (a.y === b.y) return `M${a.x} ${a.y}L${b.x} ${b.y}`;
    const xa = Math.max(a.x, b.x - step * 0.9), kx = b.x - xa;
    return `M${a.x} ${a.y}L${xa} ${a.y}C${xa + kx * 0.65} ${a.y} ${b.x - kx * 0.35} ${b.y} ${b.x} ${b.y}`;
  };
  for (const e of edges) {
    const span = Math.max(1, (e.b.x - e.a.x) / (step || 1));
    e.dur = SC.clamp(0.3 + span * 0.12, 0.35, 0.9);
    e.el = svg("path", { class: "edge", d: pathOf(e.a, e.b), pathLength: 1, style: `--c:${e.color};--d:${e.dur}s` }, gEdge);
  }

  /* 分支标签与行内虚线 */
  const pills = {};
  branches.forEach((b, i) => {
    const y = rowY(i), c = colorOf[b.name];
    const guide = svg("line", { class: "guide", x1: 260, y1: y, x2: 1560, y2: y }, gGuide);
    const g = svg("g", { class: "bp", style: `--c:${c}` }, gLab);
    const rect = svg("rect", { x: 40, y: y - 20, height: 40, rx: 20 }, g);
    const t = svg("text", { x: 56, y: y + 7 }, g);
    t.textContent = b.name.length > 16 ? b.name.slice(0, 15) + "…" : b.name;
    pills[b.name] = { g, guide, rect, t };
  });
  for (const p of Object.values(pills)) {
    const w = Math.min(200, p.t.getComputedTextLength() + 32);
    p.rect.setAttribute("width", w);
    p.guide.setAttribute("x1", 40 + w + 14);
  }

  /* 提交点、提交信息、版本标签 */
  for (const c0 of commits) {
    const c = byId[c0.id], col = colorOf[c.branch];
    const up = c.dirs.filter((d) => d < 0).length, down = c.dirs.filter((d) => d > 0).length;
    c.side = up > down ? 1 : down > up ? -1 : (c.row === 0 ? -1 : 1);           // 1 在下方，-1 在上方
    c.dot = svg("circle", { class: "dot" + (c.merge ? " merge" : ""), cx: c.x, cy: c.y, r: 13, style: `--c:${col}` }, gDot);
    c.lab = svg("g", { class: "lab", style: `--dy:${c.side * -8}px` }, gLab);
    const msg = String(c.msg || "");
    const tm = svg("text", { class: "msg", x: c.x, y: c.side > 0 ? c.y + 46 : c.y - 50 }, c.lab);
    tm.textContent = msg.length > 8 ? msg.slice(0, 7) + "…" : msg;
    const th = svg("text", { class: "hash", x: c.x, y: c.side > 0 ? c.y + 70 : c.y - 26 }, c.lab);
    th.textContent = c.hash;
    if (c.tag) {
      c.tagEl = svg("g", { class: "tag", style: "--dy:0px" }, gLab);
      const rect = svg("rect", { height: 34, rx: 8 }, c.tagEl);
      const tt = svg("text", {}, c.tagEl);
      tt.textContent = String(c.tag).slice(0, 14);
      const w = tt.getComputedTextLength() + 26;
      let tx = c.x + 26, ty = c.y;
      if (c.outSame) { tx = c.x - w / 2; ty = c.y - c.side * 46; }
      rect.setAttribute("x", tx); rect.setAttribute("y", ty - 17); rect.setAttribute("width", w);
      tt.setAttribute("x", tx + 13); tt.setAttribute("y", ty + 6);
    }
  }

  const fast = SC.reduce;
  const stepMs = fast ? 0 : SC.clamp(Number(cfg.stepMs) || 650, 200, 3000);
  await r.wait(fast ? 0 : 500);
  for (const c0 of commits) {
    const c = byId[c0.id];
    const p = pills[c.branch];
    if (!p.g.classList.contains("on")) { p.g.classList.add("on"); p.guide.classList.add("on"); }
    const inc = edges.filter((e) => e.b === c);
    inc.forEach((e) => e.el.classList.add("on"));
    const d = inc.length ? Math.max(...inc.map((e) => e.dur)) : 0;
    await r.wait(fast ? 0 : d * 850);
    c.dot.classList.add("on");
    c.lab.classList.add("on");
    if (c.tagEl) c.tagEl.classList.add("on");
    await r.wait(stepMs * 0.5);
  }
  const last = commits.length && byId[commits[commits.length - 1].id];
  if (last && !fast) {
    svg("circle", { class: "head on", cx: last.x, cy: last.y, r: 13, style: `--c:${colorOf[last.branch]}` }, gDot);
  }
});
