/* 决策树：从问题出发，沿选中的路径点亮并展开，其余变暗；演示后可点击自选。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  eyebrow: "",
  root: null,
  demo: null,
  stepMs: 1100,
  maxDepth: 7,
  maxNodes: 120
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const NS = "http://www.w3.org/2000/svg";
const SW = 100 / 1.6, SH = SW * 9 / 16;
const COLORS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)"];
const TONE = { good: "var(--good)", bad: "var(--bad)" };

/* 规整为统一节点：{ q|res, kids:[{label, node}] }；层数与节点数封顶 */
function normalize() {
  const maxDepth = SC.clamp(Math.floor(+cfg.maxDepth) || 7, 1, 10);
  let budget = SC.clamp(Math.floor(+cfg.maxNodes) || 120, 1, 400);
  const result = (res, depth) => {
    const o = res && typeof res === "object" ? res : { title: res };
    budget--;
    return { depth, res: true, title: String(o.title ?? o.text ?? "暂无结论"), text: o.title != null ? String(o.text ?? "") : "", tone: o.tone, kids: [] };
  };
  const build = (n, depth) => {
    budget--;
    const node = { depth, res: false, title: String(n.question ?? n.title ?? "").trim() || "（未命名问题）", text: String(n.detail ?? ""), kids: [] };
    if (!Array.isArray(n.options)) return node;
    n.options.forEach((o, i) => {
      if (!o || typeof o !== "object" || budget <= 0) return;
      const label = String(o.label ?? "").trim() || "选项" + (i + 1);
      let child;
      if (o.next && typeof o.next === "object" && depth + 1 < maxDepth) child = build(o.next, depth + 1);
      else if (o.result != null || !o.next) child = result(o.result ?? "暂无结论", depth + 1);
      else child = result("已到最大层数", depth + 1);
      child.parent = node; child.label = label; node.kids.push(child);
    });
    return node;
  };
  const rootCfg = cfg.root && typeof cfg.root === "object" ? cfg.root : { question: "请在 config.js 中填写 root" };
  return build(rootCfg, 0);
}

player.play(async (r) => {
  stage.innerHTML = "";
  const root = normalize();
  const all = [];
  (function walk(n) { all.push(n); n.kids.forEach(walk); })(root);
  const hasHead = !!(cfg.eyebrow || cfg.title);
  if (hasHead) stage.append(SC.el("head", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}`));

  /* 布局：列 = 深度，叶子占一行，父节点取子节点中点 */
  const D = Math.max(...all.map((n) => n.depth)) + 1;
  const NW = 11, NH = 4.4, GX = 7.2, PITCH = NH + .9;
  let row = 0;
  (function place(n) {
    if (!n.kids.length) { n.row = row++; return; }
    n.kids.forEach(place);
    n.row = (n.kids[0].row + n.kids[n.kids.length - 1].row) / 2;
  })(root);
  const BW = D * NW + (D - 1) * GX, BH = (row - 1) * PITCH + NH;
  const top = hasHead ? 7.8 : 2, availW = SW - 7, availH = SH - top - 4;
  const sc = Math.min(1.2, availW / BW, availH / BH);
  const world = SC.el("world");
  world.style.width = BW + "em"; world.style.height = BH + "em";
  world.style.left = (SW - BW * sc) / 2 + "em"; world.style.top = top + (availH - BH * sc) / 2 + "em";
  world.style.transform = `scale(${sc})`;
  stage.append(world);
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "lk"); svg.setAttribute("viewBox", `0 0 ${BW} ${BH}`); svg.setAttribute("preserveAspectRatio", "none");
  world.append(svg);
  const px = (v) => v / BW * 100 + "%", py = (v) => v / BH * 100 + "%";

  for (const n of all) {
    n.x = n.depth * (NW + GX); n.y = n.row * PITCH;
    n.color = n.res ? (TONE[n.tone] || "var(--accent)") : COLORS[n.depth % COLORS.length];
    const d = SC.el(`nd ${n.res ? "res" : ""}`);
    d.style.setProperty("--c", n.color);
    d.style.left = px(n.x); d.style.top = py(n.y); d.style.width = px(NW); d.style.height = py(NH);
    d.innerHTML = `<div class="k">${n.res ? "结论" : "问题"}</div><div class="t"></div>${n.text ? `<div class="d"></div>` : ""}`;
    d.querySelector(".t").textContent = n.title; if (n.text) d.querySelector(".d").textContent = n.text;
    d.title = n.title + (n.text ? "\n" + n.text : "");
    world.append(d); n.dom = d;
    if (n.parent) {
      const p = n.parent, ax = p.x + NW, ay = p.y + NH / 2, bx = n.x, by = n.y + NH / 2, mx = (ax + bx) / 2;
      n.edge = document.createElementNS(NS, "path");
      n.edge.setAttribute("d", `M${ax} ${ay}C${mx} ${ay} ${mx} ${by} ${bx} ${by}`); n.edge.setAttribute("class", "e");
      svg.append(n.edge);
      n.lab = SC.el("ol"); n.lab.textContent = n.label; n.lab.title = n.label;
      n.lab.style.left = px(mx); n.lab.style.top = py((ay + by) / 2);
      world.append(n.lab);
    }
  }
  const crumb = SC.el("crumb"); stage.append(crumb);
  const hint = SC.el("hint", "点击节点或选项，自选路径"); stage.append(hint);

  /* 状态：chosen 记录每个问题选了第几个孩子；路径 = 从根沿 chosen 往下 */
  const chosen = new Map();
  let live = true;
  const pathOf = () => { const p = [root]; for (let n = root; chosen.has(n);) { n = n.kids[chosen.get(n)]; p.push(n); } return p; };
  const render = () => {
    const path = new Set(pathOf());
    const crumbs = [];
    for (const n of all) {
      const act = path.has(n), show = !n.parent || path.has(n.parent);
      n.dom.classList.toggle("show", show); n.dom.classList.toggle("act", act);
      if (n.edge) { n.edge.classList.toggle("show", show); n.edge.classList.toggle("act", act); n.lab.classList.toggle("show", show); n.lab.classList.toggle("act", act); }
    }
    pathOf().forEach((n, i) => crumbs.push((i ? `<b>${SC.esc(n.label)}</b> → ` : "") + SC.esc(n.title)));
    crumb.innerHTML = crumbs.join(" · ");
    crumb.classList.add("show");
  };
  const choose = (child) => {
    const p = child.parent; if (!p) return;
    const i = p.kids.indexOf(child);
    if (chosen.get(p) === i) return;
    const clear = (n) => { chosen.delete(n); n.kids.forEach(clear); };
    p.kids.forEach(clear);
    chosen.set(p, i);
    render();
  };
  const interactive = () => {
    for (const n of all) {
      n.dom.addEventListener("click", () => { if (live && n.dom.classList.contains("show")) choose(n); });
      if (n.lab) n.lab.addEventListener("click", () => { if (live && n.lab.classList.contains("show")) choose(n); });
    }
    hint.classList.add("show");
  };

  /* 演示：每一步选一个孩子 */
  const demo = Array.isArray(cfg.demo) ? cfg.demo : [];
  const steps = [];
  for (let n = root, d = 0; n.kids.length; d++) {
    const w = demo[d];
    let i = typeof w === "number" ? Math.floor(w) : n.kids.findIndex((k) => k.label === String(w));
    if (!(i >= 0 && i < n.kids.length)) i = 0;
    steps.push([n, i]); n = n.kids[i];
  }
  if (SC.reduce) { steps.forEach(([n, i]) => chosen.set(n, i)); render(); interactive(); return; }
  await r.wait(300);
  render();
  const gap = Math.max(300, +cfg.stepMs || 1100);
  for (const [n, i] of steps) {
    await r.wait(gap);
    chosen.set(n, i); render();
  }
  await r.wait(600);
  interactive();
});
