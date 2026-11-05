/* 泳道流程图：步骤放进对应角色的泳道，光点沿箭头走过，下一步随之点亮。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  eyebrow: "",
  flowMs: 800,
  lanes: [],
  steps: [],
  links: null
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const NS = "http://www.w3.org/2000/svg";
const SW = 100 / 1.6, SH = SW * 9 / 16;
const COLORS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)", "var(--good)"];

function normalize() {
  let lanes = (Array.isArray(cfg.lanes) ? cfg.lanes : []).map((l) => String((l && typeof l === "object" ? l.name : l) ?? "").trim());
  const raw = (Array.isArray(cfg.steps) ? cfg.steps : []).filter((s) => s && typeof s === "object" && s.id != null && String(s.label ?? "").trim());
  const steps = [], seen = new Set();
  raw.slice(0, 80).forEach((s, i) => {
    const id = String(s.id);
    if (seen.has(id)) return; seen.add(id);
    let lane = typeof s.lane === "number" ? Math.floor(s.lane) : lanes.indexOf(String(s.lane ?? ""));
    if (!(lane >= 0)) lane = 0;
    lane = Math.min(lane, 19);
    const col = Number.isFinite(+s.col) && s.col !== "" && s.col != null ? SC.clamp(Math.floor(+s.col), 0, 15) : Math.min(i, 15);
    steps.push({ id, label: String(s.label).trim(), lane, col, kind: ["start", "end", "decision"].includes(s.kind) ? s.kind : "", idx: steps.length });
  });
  const nl = Math.max(lanes.length, ...steps.map((s) => s.lane + 1), 1);
  while (lanes.length < nl) lanes.push("");
  const byId = Object.fromEntries(steps.map((s) => [s.id, s]));
  let links = [];
  if (Array.isArray(cfg.links)) {
    for (const l of cfg.links) {
      if (!l || typeof l !== "object") continue;
      const a = byId[String(l.from)], b = byId[String(l.to)];
      if (a && b && a !== b) links.push({ a, b, label: String(l.label ?? "") });
    }
  } else {
    const sorted = [...steps].sort((x, y) => x.col - y.col || x.idx - y.idx);
    for (let i = 1; i < sorted.length; i++) links.push({ a: sorted[i - 1], b: sorted[i], label: "" });
  }
  return { lanes, steps, links };
}

player.play(async (r) => {
  stage.innerHTML = "";
  const { lanes, steps, links } = normalize();
  const hasHead = !!(cfg.eyebrow || cfg.title);
  if (hasHead) stage.append(SC.el("head", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}`));

  const NC = Math.max(1, ...steps.map((s) => s.col + 1));
  const BW = SW - 8, LW = 8, colW = (BW - LW) / NC;
  const NW = SC.clamp(colW * .78, 2.5, 11), NH = 3.2, VG = .7, PAD = 1;
  /* 同泳道同列堆叠 */
  const slot = {};
  for (const s of steps) { const k = s.lane + ":" + s.col; s.slot = slot[k] = (slot[k] ?? -1) + 1; }
  const laneY = []; let y = 0;
  lanes.forEach((_, li) => {
    const n = Math.max(1, ...steps.filter((s) => s.lane === li).map((s) => s.slot + 1));
    laneY[li] = { y, h: PAD * 2 + n * NH + (n - 1) * VG, n }; y += laneY[li].h + .5;
  });
  const BH = Math.max(y - .5, 6);
  const top = hasHead ? 7.6 : 1.6, availW = SW - 6, availH = SH - top - 1.8;
  const sc = Math.min(1.3, availW / BW, availH / BH);

  const world = SC.el("world");
  world.style.width = BW + "em"; world.style.height = BH + "em";
  world.style.left = (SW - BW * sc) / 2 + "em"; world.style.top = top + (availH - BH * sc) / 2 + "em";
  world.style.transform = `scale(${sc})`;
  stage.append(world);
  const px = (v) => v / BW * 100 + "%", py = (v) => v / BH * 100 + "%";
  const put = (e, x, yy, w, h) => { e.style.left = px(x); e.style.top = py(yy); if (w != null) e.style.width = px(w); if (h != null) e.style.height = py(h); return e; };

  const early = [];
  lanes.forEach((nm, i) => {
    const b = put(SC.el("band"), 0, laneY[i].y, BW, laneY[i].h); b.style.setProperty("--dl", i * 80 + "ms"); world.append(b); early.push(b);
    const l = SC.el("ln", "<i></i><span></span>"); l.style.setProperty("--c", COLORS[i % 4]); l.querySelector("span").textContent = nm; l.title = nm;
    put(l, 0, laneY[i].y, LW - .5, laneY[i].h); l.style.setProperty("--dl", i * 80 + 100 + "ms"); world.append(l); early.push(l);
  });
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "lk"); svg.setAttribute("viewBox", `0 0 ${BW} ${BH}`); svg.setAttribute("preserveAspectRatio", "none");
  world.append(svg);

  for (const s of steps) {
    const d = SC.el(`n ${s.kind}`); d.style.setProperty("--c", COLORS[s.lane % 4]);
    d.innerHTML = "<span></span>"; d.firstChild.textContent = s.label; d.title = s.label;
    s.w = NW; s.h = NH;
    s.x = LW + s.col * colW + (colW - NW) / 2;
    const ly = laneY[s.lane]; s.y = ly.y + PAD + s.slot * (NH + VG);
    put(d, s.x, s.y, NW, NH); world.append(d); s.dom = d;
  }

  /* 箭头路径：正向走折线，同列走竖线，回退绕到下方 */
  const mkArrow = (x, yy, dx, dy) => {
    const a = document.createElementNS(NS, "path"), s = .55, px_ = -dy, py_ = dx;
    a.setAttribute("d", `M${x} ${yy}L${x - dx * s * 1.6 + px_ * s * .7} ${yy - dy * s * 1.6 + py_ * s * .7}L${x - dx * s * 1.6 - px_ * s * .7} ${yy - dy * s * 1.6 - py_ * s * .7}Z`);
    a.setAttribute("class", "ar"); return a;
  };
  for (const l of links) {
    const { a, b } = l; let d, end, mid;
    const ax = a.x + a.w, ay = a.y + a.h / 2, bx = b.x, by = b.y + b.h / 2;
    if (b.col > a.col) {
      const xm = ax + Math.max(.6, (bx - ax) / 2);
      d = `M${ax} ${ay}H${xm}V${by}H${bx}`; end = [bx, by, 1, 0]; mid = [xm, (ay + by) / 2];
    } else if (b.col === a.col) {
      const down = b.y > a.y, x = a.x + a.w / 2, y1 = down ? a.y + a.h : a.y, y2 = down ? b.y : b.y + b.h;
      d = `M${x} ${y1}V${y2}`; end = [x, y2, 0, down ? 1 : -1]; mid = [x, (y1 + y2) / 2];
    } else {
      const x1 = a.x + a.w / 2, y1 = a.y + a.h, x2 = b.x + b.w / 2, y2 = b.y + b.h, yb = Math.max(y1, y2) + .45;
      d = `M${x1} ${y1}V${yb}H${x2}V${y2}`; end = [x2, y2, 0, -1]; mid = [(x1 + x2) / 2, yb];
    }
    l.path = document.createElementNS(NS, "path"); l.path.setAttribute("d", d); l.path.setAttribute("class", "e"); svg.append(l.path);
    l.len = l.path.getTotalLength() || 1;
    l.path.style.strokeDasharray = l.len; l.path.style.strokeDashoffset = l.len;
    l.arrow = mkArrow(...end); svg.append(l.arrow);
    if (l.label) { l.lab = SC.el("el"); l.lab.textContent = l.label; l.lab.title = l.label; l.lab.style.left = px(mid[0]); l.lab.style.top = py(mid[1]); world.append(l.lab); }
  }

  const lightNode = (s) => s.dom.classList.add("on");
  const lightLink = (l) => { l.path.style.strokeDashoffset = 0; l.path.classList.add("lit"); l.arrow.classList.add("lit"); l.lab && l.lab.classList.add("lit"); };

  const ready = () => {
    steps.forEach((s) => {
      s.dom.addEventListener("mouseenter", () => {
        const hl = new Set([s]);
        for (const l of links) { const on = l.a === s || l.b === s; l.path.classList.toggle("hl", on); if (on) { hl.add(l.a); hl.add(l.b); } }
        steps.forEach((k) => k.dom.classList.toggle("hl", hl.has(k)));
        world.classList.add("focus");
      });
      s.dom.addEventListener("mouseleave", () => world.classList.remove("focus"));
    });
  };

  if (SC.reduce) { early.forEach((e) => e.classList.add("on")); steps.forEach(lightNode); links.forEach(lightLink); ready(); return; }
  await r.wait(250);
  early.forEach((e) => e.classList.add("on"));
  await r.wait(700);

  const dur = Math.max(150, +cfg.flowMs || 800) / 1000;
  const travel = (l) => {
    const dot = document.createElementNS(NS, "circle"); dot.setAttribute("r", .45); dot.setAttribute("class", "dot"); svg.append(dot);
    l.arrow.classList.remove("lit");
    return r.spawn(r.raf((dt, t) => {
      const p = Math.min(t / dur, 1), f = SC.ease.inOut(p), pt = l.path.getPointAtLength(l.len * f);
      dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y);
      l.path.style.strokeDashoffset = l.len * (1 - f); l.path.classList.add("lit");
      if (p >= 1) { dot.remove(); l.arrow.classList.add("lit"); l.lab && l.lab.classList.add("lit"); return false; }
      if (l.lab && p > .4) l.lab.classList.add("lit");
      return true;
    }));
  };
  const incoming = new Set(links.map((l) => l.b));
  let frontier = steps.filter((s) => !incoming.has(s));
  if (!frontier.length && steps.length) frontier = [steps[0]];
  frontier.sort((p, q) => p.col - q.col || p.idx - q.idx);
  const lit = new Set(frontier), done = new Set();
  for (const s of frontier) { lightNode(s); await r.wait(200); }
  while (frontier.length) {
    const next = [], jobs = [];
    for (const l of links) {
      if (done.has(l) || !frontier.includes(l.a)) continue;
      done.add(l);
      const isNew = !lit.has(l.b);
      if (isNew) { lit.add(l.b); next.push(l.b); }
      jobs.push(travel(l).then(() => { if (isNew) lightNode(l.b); }));
    }
    await Promise.all(jobs);
    await r.wait(150);
    frontier = next;
  }
  /* 孤立的步骤与没走到的箭头直接点亮 */
  steps.filter((s) => !lit.has(s)).forEach(lightNode);
  links.filter((l) => !done.has(l)).forEach(lightLink);
  ready();
});
