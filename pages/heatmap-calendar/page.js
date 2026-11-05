/* 热力日历：按周成列、按星期成行，格子按列依次点亮，悬停显示日期和数值。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark", title: "", subtitle: "", start: null, end: null, data: {}, demoSeed: null,
  levels: 5, max: null, weekStart: 1, unit: "次", totalLabel: "合计", note: "", duration: 2600
};
const { cfg, player, stage } = SC.init(DEFAULTS);

const DAY = 864e5, MAXDAYS = 1100;
const ISO = /^(\d{4})-(\d{1,2})-(\d{1,2})/;
const parse = (s) => {
  if (typeof s !== "string") return null;
  const m = ISO.exec(s.trim()); if (!m) return null;
  const d = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  return Number.isFinite(d) ? d : null;
};
const key = (t) => { const d = new Date(t); return `${d.getUTCFullYear()}-${SC.pad(d.getUTCMonth() + 1)}-${SC.pad(d.getUTCDate())}`; };

/* 数据 */
const raw = cfg.data && typeof cfg.data === "object" && !Array.isArray(cfg.data) ? cfg.data : {};
const vals = new Map();
for (const [k, v] of Object.entries(raw)) { const t = parse(k), n = parseFloat(v); if (t != null && Number.isFinite(n) && n > 0) vals.set(key(t), n); }

let end = parse(cfg.end), start = parse(cfg.start);
if (end == null) end = start != null && !vals.size && !cfg.demoSeed ? start + 364 * DAY : vals.size ? Math.max(...[...vals.keys()].map(parse)) : Date.UTC(2025, 11, 31);
if (start == null) start = end - 364 * DAY;
if (end < start) [start, end] = [end, start];
if ((end - start) / DAY + 1 > MAXDAYS) start = end - (MAXDAYS - 1) * DAY;
const nDays = Math.round((end - start) / DAY) + 1;

/* 演示数据：种子决定，工作日更密，周末与几个假期降温，带少量连续高峰 */
if (!vals.size && Number.isFinite(+cfg.demoSeed) && cfg.demoSeed !== null && cfg.demoSeed !== "") {
  const rnd = SC.rng(+cfg.demoSeed);
  let mood = 0.6;
  for (let i = 0; i < nDays; i++) {
    const t = start + i * DAY, d = new Date(t), dow = d.getUTCDay(), md = (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
    mood = SC.clamp(mood + (rnd() - .5) * .25, .15, 1);
    const off = dow === 0 || dow === 6 ? .22 : 1;
    const hol = (md >= 128 && md <= 204) || (md >= 1001 && md <= 1007) ? .12 : 1;
    const v = Math.round(rnd() * 14 * mood * off * hol * (rnd() < .06 ? 2 : 1));
    if (v > 0) vals.set(key(t), v);
  }
}

/* 布局：周列 */
const weekStart = cfg.weekStart === 0 ? 0 : 1;
const dowOf = (t) => (new Date(t).getUTCDay() - weekStart + 7) % 7;
const first = dowOf(start);
const days = [];
for (let i = 0; i < nDays; i++) {
  const t = start + i * DAY, v = vals.get(key(t)) || 0;
  days.push({ t, v, col: Math.floor((i + first) / 7), row: (i + first) % 7 });
}
const W = days[days.length - 1].col + 1;
const L = SC.clamp(Math.round(+cfg.levels) || 5, 2, 7);
const vmax = Math.max(...days.map((d) => d.v), 0);
const cmax = +cfg.max > 0 ? +cfg.max : vmax;
const lvl = (v) => (v <= 0 || cmax <= 0 ? 0 : SC.clamp(Math.ceil((v / cmax) * L), 1, L));
const LCLS = L === 5 ? [0, 1, 2, 3, 4, 5] : Array.from({ length: L + 1 }, (_, i) => (i === 0 ? 0 : Math.round(1 + ((i - 1) / Math.max(1, L - 1)) * 6)));
const unit = String(cfg.unit ?? "次");
const total = days.reduce((a, d) => a + d.v, 0);
const active = days.filter((d) => d.v > 0).length;
let streak = 0, cur = 0;
days.forEach((d) => { cur = d.v > 0 ? cur + 1 : 0; streak = Math.max(streak, cur); });
const best = days.reduce((a, d) => (d.v > a.v ? d : a), { v: 0 });
const WD = ["日", "一", "二", "三", "四", "五", "六"];
const label = (t) => { const d = new Date(t); return `${d.getUTCFullYear()} 年 ${d.getUTCMonth() + 1} 月 ${d.getUTCDate()} 日 周${WD[d.getUTCDay()]}`; };

function build() {
  const cells = days.map((d, i) => `<div class="cell l${LCLS[lvl(d.v)]}" data-i="${i}" style="grid-column:${d.col + 2};grid-row:${d.row + 2}"></div>`).join("");
  /* 月份标签 */
  const ml = []; let lastCol = -9, lastM = -1;
  days.forEach((d) => {
    const dt = new Date(d.t), m = dt.getUTCMonth();
    if (m !== lastM && (dt.getUTCDate() <= 7 || ml.length === 0)) {
      if (d.col - lastCol >= 3 && d.col <= W - 2 || ml.length === 0) { ml.push(`<span class="ml" style="grid-column:${d.col + 2} / span 3;grid-row:1">${m + 1}月</span>`); lastCol = d.col; }
      lastM = m;
    }
  });
  const wl = [1, 3, 5].map((r) => `<span class="wl" style="grid-column:1;grid-row:${r + 2}">周${WD[(r + weekStart) % 7]}</span>`).join("");
  const w = `min(100%, ${(W * 2.6 + 3).toFixed(1)}em)`;
  const legend = Array.from({ length: L + 1 }, (_, i) => `<i class="l${LCLS[i]}"></i>`).join("");
  return `
  <div class="top">
    <div>${cfg.title ? `<h1 class="sc-title rise">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub rise" style="--d:.12s">${SC.esc(cfg.subtitle)}</p>` : ""}</div>
    <div class="big rise" style="--d:.2s"><b id="tot">0</b><span>${SC.esc(cfg.totalLabel ?? "合计")}</span></div>
  </div>
  <div class="panel rise" style="--d:.3s">
    <div class="cal" style="width:${w};grid-template-columns:1.8em repeat(${W}, 1fr)">${ml.join("")}${wl}${cells}</div>
    <div class="foot">
      <div class="stats"><span><b>${active}</b>活跃天数</span><span><b>${streak}</b>最长连续</span><span><b>${SC.fmt(best.v)}</b>单日最高</span></div>
      <div class="lg"><span>少</span>${legend}<span>多</span></div>
    </div>
  </div>
  ${cfg.note ? `<p class="note rise" style="--d:.5s">${SC.rich(cfg.note)}</p>` : ""}
  <div class="tip" id="tip"></div>`;
}

player.play(async (r) => {
  stage.className = "stage" + (SC.reduce ? " nomo" : "");
  stage.innerHTML = build();
  const cells = SC.$$(".cell", stage), tot = SC.$("#tot", stage), tip = SC.$("#tip", stage), panel = SC.$(".panel", stage);
  const showTip = (e) => {
    const c = e.target.closest(".cell"); if (!c || !c.classList.contains("on")) { tip.classList.remove("show"); return; }
    const d = days[+c.dataset.i];
    tip.innerHTML = `${SC.esc(label(d.t))}<b>${d.v > 0 ? SC.fmt(d.v) + " " + SC.esc(unit) : "无数据"}</b>`;
    const s = stage.getBoundingClientRect(), b = c.getBoundingClientRect(), k = s.width / stage.offsetWidth || 1;
    const tw = tip.offsetWidth * k;
    const x = SC.clamp(b.left + b.width / 2 - s.left - tw / 2, 4, s.width - tw - 4);
    tip.style.left = x / k + "px"; tip.style.top = (b.top - s.top) / k - tip.offsetHeight - 6 + "px";
    tip.classList.add("show");
  };
  panel.addEventListener("mouseover", showTip);
  panel.addEventListener("mouseleave", () => tip.classList.remove("show"));
  if (SC.reduce) { cells.forEach((c) => c.classList.add("on")); tot.textContent = SC.fmt(total); return; }
  await r.wait(900);
  SC.countUp(r, tot, total, { dur: Math.max(600, +cfg.duration || 2600) });
  const dur = Math.max(400, +cfg.duration || 2600) / 1000;
  let shown = 0;
  await r.raf((dt, t) => {
    const p = Math.min(t / dur, 1), upto = Math.ceil(SC.ease.inOut(p) * W);
    while (shown < days.length && days[shown].col < upto) cells[shown++].classList.add("on");
    return p < 1;
  });
  while (shown < days.length) cells[shown++].classList.add("on");
});
