/* 项目排期：分组标题、条形依次生长、进度填充、今天线扫过、里程碑菱形。
 * 配置见 config.js。这里的 DEFAULTS 是没写 config 时的默认值。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  unit: "week",          // week | month | day
  start: null,           // 数字或 ISO 日期
  rows: [],              // { name, group, start, end, progress, milestone }
  today: null,
  note: "",
  rowStagger: 0          // 0 = 按行数自动
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const unit = ["week", "month", "day"].includes(cfg.unit) ? cfg.unit : "week";
const ISO = /^(\d{4})-(\d{2})-(\d{2})/;
const DAY = 864e5;
const parse = (v) => {                       // -> {iso:Date(UTC)} | {n:number} | null
  if (typeof v === "string") {
    const m = ISO.exec(v.trim());
    if (m) { const d = Date.UTC(+m[1], +m[2] - 1, +m[3]); if (Number.isFinite(d)) return { iso: d }; }
    const n = parseFloat(v); return Number.isFinite(n) ? { n } : null;
  }
  return typeof v === "number" && Number.isFinite(v) ? { n: v } : null;
};
const rawRows = (Array.isArray(cfg.rows) ? cfg.rows : []).filter((r) => r && typeof r === "object");
const parsed = rawRows.map((r) => ({ r, s: parse(r.start), e: parse(r.end) }));
const isoAll = [parse(cfg.start), parse(cfg.today), ...parsed.flatMap((p) => [p.s, p.e])].filter((p) => p && p.iso != null).map((p) => p.iso);
let base = null;
if (isoAll.length) {
  const cs = parse(cfg.start);
  base = cs && cs.iso != null ? cs.iso : Math.min(...isoAll);
  if (unit === "month") { const d = new Date(base); base = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1); }
}
const dim = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const toUnit = (p, end) => {
  if (!p) return null;
  if (p.iso == null) return p.n;
  const t = p.iso + (end ? DAY : 0);
  if (unit === "day") return (t - base) / DAY;
  if (unit === "week") return (t - base) / DAY / 7;
  const a = new Date(base), b = new Date(t);
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth()) + (b.getUTCDate() - 1) / dim(b.getUTCFullYear(), b.getUTCMonth());
};

/* 行整理：坏行跳过 */
const rows = [];
parsed.forEach(({ r, s, e }, i) => {
  const ms = r.milestone === true;
  let a = toUnit(s, false), b = toUnit(e, true);
  if (a == null && b != null && ms) a = b;
  if (a == null) return;
  if (ms) b = a;
  else if (b == null) b = a + 1;
  if (b < a) [a, b] = [b, a];
  const pr = parseFloat(r.progress);
  rows.push({ name: String(r.name ?? `任务 ${i + 1}`), group: r.group ? String(r.group) : "", a, b, ms, pr: Number.isFinite(pr) ? SC.clamp(pr, 0, 100) : null });
});
const startCfg = toUnit(parse(cfg.start), false);
const todayV = toUnit(parse(cfg.today), false);
let A0 = startCfg != null ? startCfg : rows.length ? Math.floor(Math.min(...rows.map((r) => r.a))) : 0;
let A1 = rows.length ? Math.ceil(Math.max(...rows.map((r) => r.b), A0 + 1)) : A0 + 8;
if (A1 <= A0) A1 = A0 + 1;
const L = A1 - A0;
const pos = (v) => ((SC.clamp(v, A0, A1) - A0) / L) * 100;

/* 刻度文字 */
const tickText = (v) => {
  if (base == null) return unit === "month" ? `${(((Math.floor(v) - 1) % 12) + 12) % 12 + 1}月` : unit === "week" ? `W${Math.floor(v)}` : `D${Math.floor(v)}`;
  const d = new Date(base);
  if (unit === "month") { d.setUTCMonth(d.getUTCMonth() + Math.round(v)); return `${d.getUTCFullYear() % 100}/${SC.pad(d.getUTCMonth() + 1)}`; }
  d.setUTCDate(d.getUTCDate() + Math.round(v * (unit === "week" ? 7 : 1)));
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
};

/* 分组 */
const groups = [], gi = new Map();
rows.forEach((r) => { if (r.group && !gi.has(r.group)) { gi.set(r.group, groups.length); groups.push(r.group); } });
const COLORS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)", "var(--good)"];
const colorOf = (g) => (gi.has(g) ? COLORS[gi.get(g) % COLORS.length] : COLORS[0]);
const ordered = [];
if (groups.length) {
  groups.forEach((g) => { ordered.push({ g }); rows.filter((r) => r.group === g).forEach((r) => ordered.push({ r })); });
  rows.filter((r) => !r.group).forEach((r) => ordered.push({ r }));
} else rows.forEach((r) => ordered.push({ r }));

const showToday = todayV != null && todayV >= A0 && todayV <= A1;

function build() {
  const step = Math.max(1, Math.ceil(L / 14));
  const ticks = [];
  for (let v = A0, k = 0; v <= A1 + 1e-9; v += step, k++) ticks.push(`<span class="tick" style="--i:${k};left:${pos(v).toFixed(2)}%">${SC.esc(tickText(v))}</span>`);
  const gl = [];
  const gstep = L > 30 ? step : 1;
  for (let v = A0; v <= A1 + 1e-9; v += gstep) gl.push(`<i class="gl" style="left:${pos(v).toFixed(2)}%"></i>`);
  const body = ordered.map((o) => {
    if (o.g) return `<div class="row grp" style="--c:${colorOf(o.g)}"><div class="gn">${SC.esc(o.g)}</div></div>`;
    const r = o.r, c = colorOf(r.group);
    const w = Math.max(0.6, pos(r.b) - pos(r.a));
    return `<div class="row${r.ms ? " ms" : ""}" style="--c:${c}">
      <div class="nm"><span>${SC.esc(r.name)}</span>${!r.ms && r.pr != null ? `<em>${Math.round(r.pr)}%</em>` : ""}</div>
      <div class="tr"><div class="bar" style="left:${pos(r.a).toFixed(2)}%;width:${w.toFixed(2)}%;--p:${r.pr ?? 0}%"><i></i></div><div class="dia" style="left:${pos(r.a).toFixed(2)}%"></div></div></div>`;
  }).join("");
  const head = (cfg.title || cfg.subtitle) ? `<div class="head">${cfg.title ? `<h1 class="sc-title rise">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub rise" style="--d:.12s">${SC.esc(cfg.subtitle)}</p>` : ""}</div>` : "";
  return `${head}<div class="card sc-card rise" style="--d:.2s">
    <div class="axis"><div></div><div class="ticks">${ticks.join("")}</div></div>
    <div class="rows"><div class="ov"><div class="grid">${gl.join("")}</div><div class="past"></div>${showToday ? `<div class="today"><b>今天</b></div>` : ""}</div>${body}</div></div>
    ${cfg.note ? `<div class="note rise" style="--d:.5s">${SC.rich(cfg.note)}</div>` : ""}`;
}

player.play(async (r) => {
  stage.className = "stage" + (SC.reduce ? " nomo" : "");
  stage.innerHTML = build();
  const els = SC.$$(".rows .row", stage);
  const line = SC.$(".today", stage), past = SC.$(".past", stage);
  const setToday = (f) => {
    if (!line) return;
    const x = pos(A0 + (todayV - A0) * f);
    line.style.left = x + "%"; past.style.width = x + "%";
  };
  if (SC.reduce) {
    els.forEach((e) => e.classList.add("on"));
    if (line) { line.style.opacity = 1; setToday(1); }
    return;
  }
  await r.wait(900);
  const gap = parseFloat(cfg.rowStagger) > 0 ? +cfg.rowStagger : SC.clamp(2400 / Math.max(1, els.length), 90, 260);
  for (const e of els) { e.classList.add("on"); await r.wait(gap); }
  await r.wait(600);
  if (line) {
    line.style.opacity = 1;
    await r.raf((dt, t) => { const p = Math.min(t / 1.6, 1); setToday(SC.ease.inOut(p)); return p < 1; });
  }
});
