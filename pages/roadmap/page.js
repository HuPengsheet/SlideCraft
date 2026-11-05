/* 产品路线图：季度列 × 泳道，计划块按季度从左向右入场。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  eyebrow: "",
  quarters: [],
  now: null,
  lanes: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const SW = 100 / 1.6, SH = SW * 9 / 16;           // 舞台尺寸，单位 em
const LANE_COLORS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)", "var(--good)"];
const STATUS_TEXT = { done: "已完成", doing: "进行中", todo: "计划中" };

/* 规整配置：坏数据跳过，缺字段补默认 */
function normalize() {
  const qs = (Array.isArray(cfg.quarters) ? cfg.quarters : []).map((q) => String(q ?? "").trim()).filter(Boolean);
  const idxOf = (v, dflt = 0) => {
    if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.floor(v));
    if (typeof v === "string") { const i = qs.indexOf(v.trim()); if (i >= 0) return i; const n = parseInt(v, 10); if (Number.isFinite(n) && String(n) === v.trim()) return Math.max(0, n); }
    return dflt;
  };
  const lanes = (Array.isArray(cfg.lanes) ? cfg.lanes : []).filter((l) => l && typeof l === "object").map((l, li) => {
    const items = (Array.isArray(l.items) ? l.items : []).filter((it) => it && typeof it === "object" && String(it.title ?? "").trim()).map((it) => {
      const p = Number.isFinite(+it.progress) && it.progress !== "" && it.progress != null ? SC.clamp(+it.progress, 0, 100) : null;
      let st = ["done", "doing", "todo"].includes(it.status) ? it.status : p == null ? "todo" : p >= 100 ? "done" : "doing";
      return { title: String(it.title).trim(), note: String(it.note ?? ""), q: idxOf(it.q), span: Math.max(1, Math.floor(+it.span) || 1), status: st, progress: st === "done" ? 100 : p ?? 0 };
    });
    return { name: String(l.name ?? ""), color: LANE_COLORS[li % LANE_COLORS.length], items };
  });
  let n = qs.length;
  for (const l of lanes) for (const it of l.items) n = Math.max(n, it.q + it.span);
  n = Math.min(Math.max(n, 1), 16);
  while (qs.length < n) qs.push("Q" + (qs.length + 1));
  qs.length = n;
  for (const l of lanes) for (const it of l.items) { it.q = Math.min(it.q, n - 1); it.span = Math.min(it.span, n - it.q); }
  const now = cfg.now == null || cfg.now === "" ? -1 : idxOf(cfg.now, -1);
  return { qs, lanes, now: now >= n ? -1 : now };
}

player.play(async (r) => {
  stage.innerHTML = "";
  const { qs, lanes, now } = normalize();
  const QN = qs.length;
  const hasHead = !!(cfg.eyebrow || cfg.title);
  if (hasHead) stage.append(SC.el("head", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}`));

  /* 模型坐标（em）：板宽 BW，左侧泳道名 LW，顶部列标题 HH */
  const BW = SW - 8, LW = 8.5, HH = 2.4, colW = (BW - LW) / QN, IH = 3.3, GAP = .6, PAD = .8;
  let y = HH;
  for (const l of lanes) {
    const rowEnd = [];
    for (const it of [...l.items].sort((a, b) => a.q - b.q)) {
      let row = rowEnd.findIndex((e) => e <= it.q);
      if (row < 0) { row = rowEnd.length; rowEnd.push(0); }
      rowEnd[row] = it.q + it.span; it.row = row;
    }
    const rows = Math.max(1, rowEnd.length);
    l.y = y; l.h = PAD * 2 + rows * IH + (rows - 1) * GAP;
    y += l.h + GAP;
  }
  const BH = Math.max(y - GAP, HH + 4);
  const top = hasHead ? 7.6 : 1.6, availW = SW - 6, availH = SH - top - 1.8;
  const sc = Math.min(1, availW / BW, availH / BH);

  const world = SC.el("world");
  world.style.width = BW + "em"; world.style.height = BH + "em";
  world.style.left = (SW - BW * sc) / 2 + "em"; world.style.top = top + (availH - BH * sc) / 2 + "em";
  world.style.transform = `scale(${sc})`;
  stage.append(world);
  const px = (v) => v / BW * 100 + "%", py = (v) => v / BH * 100 + "%";
  const put = (e, x, yy, w, h) => { e.style.left = px(x); e.style.top = py(yy); if (w != null) e.style.width = px(w); if (h != null) e.style.height = py(h); return e; };
  const fast = SC.reduce;
  const dl = (e, ms) => e.style.setProperty("--dl", ms + "ms");

  const staged = [];   // [元素, 延迟 ms]
  /* 泳道底板与名称 */
  lanes.forEach((l, i) => {
    const b = put(SC.el("band"), 0, l.y, BW, l.h); dl(b, i * 80); world.append(b); staged.push(b);
    const n = SC.el("ln", `<i></i><span></span>`); n.style.setProperty("--c", l.color);
    n.querySelector("span").textContent = l.name; n.title = l.name;
    put(n, 0, l.y, LW - .5, l.h); dl(n, i * 80 + 120); world.append(n); staged.push(n);
  });
  /* 列线与列标题 */
  qs.forEach((q, i) => {
    const x = LW + i * colW;
    if (i > 0) { const v = put(SC.el("vl"), x, HH, null, BH - HH); world.append(v); staged.push(v); }
    const h = put(SC.el("qh" + (i === now ? " now" : "")), x, 0, colW, HH - .4); h.style.lineHeight = py(HH - .4); h.style.height = py(HH - .4); h.textContent = q; h.title = q;
    dl(h, i * 60); world.append(h); staged.push(h);
  });

  /* 计划块 */
  const cards = [];
  lanes.forEach((l) => l.items.forEach((it) => {
    const e = SC.el(`it ${it.status}`);
    e.style.setProperty("--c", l.color); e.style.setProperty("--p", it.progress + "%");
    const mark = it.status === "done" ? `<span class="ck"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>` : it.status === "doing" ? `<span class="dt"></span>` : "";
    e.innerHTML = `<div class="t">${mark}<b></b></div><div class="s"></div>${it.status === "doing" ? `<div class="pg"><i></i></div>` : ""}`;
    e.querySelector("b").textContent = it.title;
    e.querySelector(".s").textContent = it.status === "doing" ? `${STATUS_TEXT.doing} ${Math.round(it.progress)}%` : STATUS_TEXT[it.status];
    e.title = it.title + (it.note ? "\n" + it.note : "");
    put(e, LW + it.q * colW + .2, l.y + PAD + it.row * (IH + GAP), it.span * colW - .4, IH);
    world.append(e); cards.push({ e, it });
  }));

  /* 现在标记 */
  let nowline = null, nowtag = null;
  if (now >= 0) {
    const x = LW + (now + .5) * colW;
    nowline = put(SC.el("nowline"), x, HH - .2, null, BH - HH + .2);
    nowtag = put(SC.el("nowtag", "NOW"), x, HH - 1.6, null, null);
    world.append(nowline, nowtag);
  }

  if (fast) {
    [...staged, ...cards.map((c) => c.e), nowline, nowtag].forEach((e) => e && e.classList.add("on"));
    return;
  }
  await r.wait(250);
  staged.forEach((e) => e.classList.add("on"));
  await r.wait(600);
  nowline && nowline.classList.add("on"); nowtag && nowtag.classList.add("on");
  /* 按起始列从左向右，同一列内按泳道顺序 */
  const order = cards.map((c, i) => ({ ...c, i })).sort((a, b) => a.it.q - b.it.q || a.i - b.i);
  const step = Math.min(160, 2600 / Math.max(1, order.length));
  order.forEach((c, k) => { dl(c.e, k * step); c.e.classList.add("on"); });
  await r.wait(order.length * step + 1700);
});
