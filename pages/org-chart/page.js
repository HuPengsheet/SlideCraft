/* 组织架构树：逐层展开，点击折叠/展开子树，节点多时自动缩放进舞台。配置见 config.js。 */
const DEFAULTS = { theme: "dark", title: "", subtitle: "", root: null, direction: "down", edge: "elbow", compact: false, note: "", levelDelay: 450 };
const { cfg, player, stage } = SC.init(DEFAULTS);

const MAXN = 300;
const COLORS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)", "var(--good)"];
const right = cfg.direction === "right";
const compact = cfg.compact === true;
const curve = cfg.edge === "curve";
const CW = compact ? 9 : 12.5, CH = compact ? 2.8 : 3.8;       // 卡片尺寸，em
const GB = compact ? 1 : 1.6, GD = compact ? 2.6 : 3.4;        // 同层间距、层间距，em
const BS = right ? CH : CW, DS = right ? CW : CH;               // 沿宽度轴、深度轴的卡片尺寸

function buildTree() {
  let n = 0;
  const walk = (o, depth, parent) => {
    if (n >= MAXN || !o || typeof o !== "object") return null;
    n++;
    const node = { name: o.name == null || o.name === "" ? "未命名" : String(o.name), role: o.role ? String(o.role) : "", depth, parent, kids: [], collapsed: o.collapsed === true, id: n - 1 };
    if (depth < 12 && Array.isArray(o.children)) o.children.forEach((c) => { const k = walk(c, depth + 1, node); if (k) node.kids.push(k); });
    return node;
  };
  return walk(cfg.root, 0, null);
}
const count = (n) => 1 + n.kids.reduce((a, k) => a + count(k), 0);

player.play(async (r) => {
  stage.className = "stage" + (SC.reduce ? " nomo" : "") + (compact ? " cp" : "");
  const root = buildTree();
  const head = (cfg.title || cfg.subtitle) ? `<div class="top">${cfg.title ? `<h1 class="sc-title rise">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub rise" style="--d:.12s">${SC.esc(cfg.subtitle)}</p>` : ""}</div>` : "";
  stage.innerHTML = `${head}<div class="plot rise" style="--d:.2s" id="plot">${root ? "" : `<div class="empty">暂无数据</div>`}</div>${cfg.note ? `<p class="note rise" style="--d:.5s">${SC.rich(cfg.note)}</p>` : ""}`;
  if (!root) return;
  const plot = SC.$("#plot", stage);
  const world = SC.el("world"), NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "edges");
  world.append(svg); plot.append(world);

  const all = [];
  (function collect(n) { all.push(n); n.kids.forEach(collect); })(root);
  all.forEach((n) => {
    const e = SC.el("card" + (n === root ? " root" : "") + (n.kids.length ? " has" : ""));
    e.style.cssText = `width:${CW}em;height:${CH}em;--c:${COLORS[n.depth % COLORS.length]}`;
    e.innerHTML = `<div class="av">${SC.esc([...n.name][0] || "?")}</div><div class="tx"><div class="nm">${SC.esc(n.name)}</div>${n.role ? `<div class="rl">${SC.esc(n.role)}</div>` : ""}</div><span class="bd" hidden></span>`;
    e.title = n.role ? `${n.name} · ${n.role}` : n.name;
    if (n.kids.length) { e.tabIndex = 0; e.setAttribute("role", "button"); e.setAttribute("aria-expanded", String(!n.collapsed)); }
    n.el = e; world.append(e);
  });
  const vis = (n) => !n.parent || (!n.parent.collapsed && vis(n.parent));
  const em = parseFloat(getComputedStyle(stage).fontSize) || 16;

  function layout(animateEdges) {
    /* 自底向上算子树宽度 */
    const sw = new Map();
    (function calc(n) {
      const ks = n.collapsed ? [] : n.kids; ks.forEach(calc);
      sw.set(n, ks.length ? Math.max(BS, ks.reduce((a, k) => a + sw.get(k), 0) + GB * (ks.length - 1)) : BS);
    })(root);
    const pos = new Map();
    (function place(n, start) {
      const ks = n.collapsed ? [] : n.kids, w = sw.get(n);
      const center = start + w / 2;
      pos.set(n, { b: center - BS / 2, d: n.depth * (DS + GD) });
      let s = start + (w - (ks.reduce((a, k) => a + sw.get(k), 0) + GB * Math.max(0, ks.length - 1))) / 2;
      ks.forEach((k) => { place(k, s); s += sw.get(k) + GB; });
    })(root, 0);
    const shown = all.filter(vis);
    const maxD = Math.max(...shown.map((n) => n.depth));
    const WB = sw.get(root), WD = maxD * (DS + GD) + DS;
    const Wm = right ? WD : WB, Hm = right ? WB : WD;
    /* 隐藏节点收拢到最近的可见祖先 */
    all.forEach((n) => {
      let a = n; while (!vis(a)) a = a.parent;
      const p = pos.get(a), x = right ? p.d : p.b, y = right ? p.b : p.d;
      n.el.style.left = x + "em"; n.el.style.top = y + "em";
      const hid = !vis(n);
      n.el.classList.toggle("hid", hid);
      const bd = n.el.querySelector(".bd");
      if (n.kids.length && n.collapsed) { bd.hidden = false; bd.textContent = "+" + (count(n) - 1); } else bd.hidden = true;
      if (n.kids.length) n.el.setAttribute("aria-expanded", String(!n.collapsed));
      n.p = p;
    });
    /* 连线 */
    svg.setAttribute("viewBox", `0 0 ${Wm} ${Hm}`); svg.style.width = Wm + "em"; svg.style.height = Hm + "em";
    const f = (v) => v.toFixed(2);
    svg.innerHTML = shown.filter((n) => n.parent).map((n) => {
      const a = n.parent.p, b = n.p;
      const ax = right ? a.d + DS : a.b + BS / 2, ay = right ? a.b + BS / 2 : a.d + DS;
      const bx = right ? b.d : b.b + BS / 2, by = right ? b.b + BS / 2 : b.d;
      let d;
      if (right) { const mx = (ax + bx) / 2; d = curve ? `M${f(ax)} ${f(ay)}C${f(mx)} ${f(ay)} ${f(mx)} ${f(by)} ${f(bx)} ${f(by)}` : `M${f(ax)} ${f(ay)}H${f(mx)}V${f(by)}H${f(bx)}`; }
      else { const my = (ay + by) / 2; d = curve ? `M${f(ax)} ${f(ay)}C${f(ax)} ${f(my)} ${f(bx)} ${f(my)} ${f(bx)} ${f(by)}` : `M${f(ax)} ${f(ay)}V${f(my)}H${f(bx)}V${f(by)}`; }
      return `<path class="edge" pathLength="1" d="${d}" style="--d:${animateEdges ? (n.depth * ((+cfg.levelDelay || 450) / 1000) + 0.3).toFixed(2) : 0}"/>`;
    }).join("");
    /* 缩放居中 */
    const pw = plot.clientWidth / em, ph = plot.clientHeight / em;
    const k = Math.min(1, pw / Wm, ph / Hm) || 1;
    world.style.width = Wm + "em"; world.style.height = Hm + "em";
    world.style.transform = `translate(${((pw - Wm * k) / 2).toFixed(2)}em, ${((ph - Hm * k) / 2).toFixed(2)}em) scale(${k.toFixed(4)})`;
  }
  /* world 的 translate 用 em，需要 world 自身字号等于舞台字号：继承即可 */

  const toggle = (n) => { if (!n.kids.length) return; n.collapsed = !n.collapsed; stage.classList.add("settled"); layout(false); };
  world.addEventListener("click", (e) => { const c = e.target.closest(".card"); const n = c && all.find((x) => x.el === c); if (n) toggle(n); });
  world.addEventListener("keydown", (e) => { if (e.key !== "Enter") return; const c = e.target.closest(".card"); const n = c && all.find((x) => x.el === c); if (n) { e.preventDefault(); toggle(n); } });

  layout(true);
  if (SC.reduce) { all.forEach((n) => n.el.classList.add("on")); stage.classList.add("settled"); return; }
  const gap = Math.max(0, +cfg.levelDelay >= 0 ? +cfg.levelDelay : 450);
  await r.wait(600);
  const maxDepth = Math.max(...all.map((n) => n.depth));
  for (let d = 0; d <= maxDepth; d++) {
    all.filter((n) => n.depth === d && vis(n)).forEach((n, i) => { n.el.style.transitionDelay = `${(i * 0.04 / r.speed).toFixed(2)}s`; n.el.classList.add("on"); });
    await r.wait(gap);
  }
  await r.wait(600);
  all.forEach((n) => { n.el.style.transitionDelay = ""; n.el.classList.add("on"); });
  stage.classList.add("settled");
});
