/* 转化漏斗：梯形分段按数值定宽，依次扫入，数值滚动，阶段间显示转化率。
 * 配置见 config.js。这里的 DEFAULTS 是没写 config 时的默认值。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  stages: [],            // { label, value, note }
  scale: "linear",       // linear | sqrt
  orientation: "vertical",
  showRate: true,
  unit: "",
  note: "",
  stagger: 650,          // 阶段之间的间隔，毫秒
  countDuration: 1200    // 数值滚动时长，毫秒
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const stages = (Array.isArray(cfg.stages) ? cfg.stages : []).filter((s) => s && typeof s === "object").slice(0, 10).map((s, i) => {
  const v = parseFloat(s.value);
  return { label: String(s.label ?? `阶段 ${i + 1}`), value: Number.isFinite(v) && v > 0 ? v : 0, note: s.note ? String(s.note) : "" };
});
const N = stages.length;
const horiz = cfg.orientation === "horizontal";
const vmax = Math.max(0, ...stages.map((s) => s.value));
const decOf = (v) => (Number.isInteger(v) ? 0 : 1);
const dec = Math.max(0, ...stages.map((s) => decOf(s.value)));
const w = stages.map((s) => {
  if (!vmax) return 0.1;
  const f = cfg.scale === "sqrt" ? Math.sqrt(s.value / vmax) : s.value / vmax;
  return Math.max(0.06, f);
});
const color = (i) => `color-mix(in srgb, var(--accent) ${N > 1 ? Math.round(100 * (1 - i / (N - 1))) : 100}%, var(--accent-2))`;
const rate = (i) => (i > 0 && stages[i - 1].value > 0 ? (stages[i].value / stages[i - 1].value) * 100 : null);
const overall = N > 1 && stages[0].value > 0 ? (stages[N - 1].value / stages[0].value) * 100 : null;
const pct = (v) => (v == null ? "—" : SC.fmt(v, { decimals: 1 }) + "%");
const ARROW = `<svg viewBox="0 0 16 16"><path d="M8 2v11M3.5 8.5 8 13l4.5-4.5"/></svg>`;
const ARROW_R = `<svg viewBox="0 0 16 16"><path d="M2 8h11M8.5 3.5 13 8l-4.5 4.5"/></svg>`;

function seg(i) {
  const a = w[i] * 50, b = (i + 1 < N ? w[i + 1] : w[i] * 0.72) * 50;   // 半宽，百分比
  const pts = horiz
    ? `0,${50 - a} 100,${50 - b} 100,${50 + b} 0,${50 + a}`
    : `${50 - a},0 ${50 + a},0 ${50 + b},100 ${50 - b},100`;
  /* 相邻段之间留一条细缝 */
  return `<svg class="seg" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon class="fill" points="${pts}" vector-effect="non-scaling-stroke"/><polygon class="sheen" points="${pts}"/></svg>`;
}

function build() {
  const defs = `<svg width="0" height="0" style="position:absolute"><defs>
    <linearGradient id="sheenV" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
    <linearGradient id="sheenH" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs></svg>`;
  const head = `<div class="head"><div>${cfg.title ? `<h1 class="sc-title rise">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub rise" style="--d:.12s">${SC.esc(cfg.subtitle)}</p>` : ""}</div>
    ${cfg.showRate !== false && overall != null ? `<div class="total rise" style="--d:.25s"><div class="k">整体转化</div><div class="v">0.0%</div></div>` : ""}</div>`;
  const vs = (horiz ? 2.4 : 2.9) - Math.max(0, N - 5) * 0.15;
  const rows = stages.map((s, i) => {
    const r = rate(i);
    const chip = cfg.showRate !== false && i > 0
      ? `<span class="chip" style="--hw:${(w[i] * 100).toFixed(1)}">${horiz ? ARROW_R : ARROW}${pct(r)}</span>` : "";
    return `<div class="row" style="--c:${color(i)}">
      <div class="lab"><div class="ix">${SC.pad(i + 1)}</div><div class="nm">${SC.esc(s.label)}</div>${s.note ? `<div class="nt">${SC.esc(s.note)}</div>` : ""}</div>
      <div class="shape">${seg(i)}${chip}</div>
      <div class="val"><span class="n">${SC.fmt(s.value, { decimals: dec })}</span>${cfg.unit ? `<span class="u">${SC.esc(cfg.unit)}</span>` : ""}</div></div>`;
  }).join("");
  return `${defs}${head}<div class="body" style="--n:${Math.max(N, 1)};--vs:${vs}em">${rows}</div>${cfg.note ? `<div class="note rise" style="--d:.4s">${SC.rich(cfg.note)}</div>` : ""}`;
}

player.play(async (r) => {
  stage.className = "stage " + (horiz ? "horizontal" : "vertical");
  stage.innerHTML = build();
  const rows = SC.$$(".row", stage);
  const totalEl = SC.$(".total .v", stage);
  const show = (i, animate) => {
    const row = rows[i];
    row.classList.add("on");
    const chip = SC.$(".chip", row); if (chip) chip.classList.add("on");
    const n = SC.$(".n", row);
    if (animate) return SC.countUp(r, n, stages[i].value, { dur: cfg.countDuration, decimals: dec });
    n.textContent = SC.fmt(stages[i].value, { decimals: dec });
  };
  if (SC.reduce) {
    rows.forEach((_, i) => show(i, false));
    if (totalEl) totalEl.textContent = pct(overall);
    return;
  }
  rows.forEach((row) => SC.$$(".n", row).forEach((n) => (n.textContent = SC.fmt(0, { decimals: dec }))));
  const stag = Math.max(100, parseFloat(cfg.stagger) || 650);
  await r.wait(700);
  const jobs = [];
  for (let i = 0; i < N; i++) {
    jobs.push(show(i, true));
    await r.wait(stag);
  }
  if (totalEl) jobs.push(SC.countUp(r, totalEl, overall, { dur: 1200, decimals: 1, suffix: "%" }));
  await Promise.all(jobs);
});
