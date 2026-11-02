/* 雷达图：同心圈与轴线淡入，各系列多边形从圆心依次长出，顶点弹出。
 * 配置见 config.js。这里的 DEFAULTS 是没写 config 时的默认值。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  axes: [],              // { label, max }
  max: null,             // 全局最大值，null 为自动
  series: [],            // { name, values[], color }
  rings: 5,              // 同心圈数，1 到 10
  fill: 0.18,            // 填充不透明度
  legend: true,
  valueLabels: false,
  note: "",
  stagger: 450,          // 系列之间的间隔，毫秒
  duration: 1400         // 单个系列生长时长，毫秒
};

const { cfg, player, stage } = SC.init(DEFAULTS);

/* ---- 数据整理：任何输入都降级，不抛错 ---- */
const objs = (a) => (Array.isArray(a) ? a.filter((x) => x && typeof x === "object") : []);
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
const niceCeil = (m) => {
  if (!(m > 0)) return 100;
  const p = Math.pow(10, Math.floor(Math.log10(m)));
  return [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((k) => k * p).find((v) => v >= m - 1e-9) || m;
};
const PALETTE = ["var(--accent)", "var(--accent-2)", "var(--accent-3)", "var(--good)", "var(--bad)", "var(--fg-soft)"];

const series = objs(cfg.series).map((s, i) => ({
  name: String(s.name ?? `系列 ${i + 1}`),
  values: Array.isArray(s.values) ? s.values.map(num) : [],
  color: typeof s.color === "string" && s.color ? s.color : PALETTE[i % PALETTE.length]
}));
let axes = objs(cfg.axes).slice(0, 12).map((a) => ({ label: String(a.label ?? ""), max: num(a.max) > 0 ? num(a.max) : 0 }));
if (!axes.length) {
  const k = Math.min(12, Math.max(0, ...series.map((s) => s.values.length)));
  axes = Array.from({ length: k }, (_, i) => ({ label: `#${i + 1}`, max: 0 }));
}
while (axes.length < 3) axes.push({ label: "", max: 0 });
const N = axes.length;
const allVals = series.flatMap((s) => s.values);
const gMax = num(cfg.max) > 0 ? num(cfg.max) : niceCeil(Math.max(0, ...allVals));
const RINGS = SC.clamp(Math.round(num(cfg.rings)) || 5, 1, 10);
const FILL = SC.clamp(Number.isFinite(parseFloat(cfg.fill)) ? parseFloat(cfg.fill) : 0.18, 0, 1);
series.forEach((s) => {
  s.f = axes.map((a, j) => SC.clamp((s.values[j] ?? 0) / (a.max || gMax), 0, 1));
});

/* ---- 几何 ---- */
const R = 45;
const ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / N;
const pt = (i, f, extra = 0) => [Math.cos(ang(i)) * (R * f + extra), Math.sin(ang(i)) * (R * f + extra)];
const str = (pts) => pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
const ring = (k) => str(axes.map((_, i) => pt(i, k / RINGS)));

function buildHTML() {
  const rings = Array.from({ length: RINGS }, (_, k) =>
    `<polygon class="ring${k === RINGS - 1 ? " outer" : ""}" style="--i:${RINGS - 1 - k}" points="${ring(k + 1)}"/>`).join("");
  const spokes = axes.map((_, i) => { const [x, y] = pt(i, 1); return `<line class="spoke" style="--i:${RINGS + 1}" x1="0" y1="0" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}"/>`; }).join("");
  const labels = axes.map((a, i) => {
    const [x, y] = pt(i, 1, 5), c = Math.cos(ang(i)), s = Math.sin(ang(i));
    const anchor = c > 0.3 ? "start" : c < -0.3 ? "end" : "middle";
    const dy = s < -0.3 ? -1.5 : s > 0.3 ? 1.5 : 0;
    return `<text class="alabel" style="--i:${RINGS + 3}" x="${x.toFixed(2)}" y="${(y + dy).toFixed(2)}" text-anchor="${anchor}" dominant-baseline="central">${SC.esc(a.label)}</text>`;
  }).join("");
  const sers = series.map((s, k) => {
    const dots = s.f.map((f, j) => { const [x, y] = pt(j, f); return `<circle class="dot" style="--j:${j}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.7"/>`; }).join("");
    const vls = s.f.map((f, j) => {
      const [x, y] = pt(j, f, 3.6), c = Math.cos(ang(j));
      return `<text class="vl" x="${x.toFixed(2)}" y="${y.toFixed(2)}" text-anchor="${c > 0.3 ? "start" : c < -0.3 ? "end" : "middle"}" dominant-baseline="central">${SC.esc(SC.fmt(s.values[j] ?? 0, { decimals: Number.isInteger(s.values[j] ?? 0) ? 0 : 1 }))}</text>`;
    }).join("");
    return `<g class="ser" data-k="${k}" style="--c:${SC.esc(s.color)}"><polygon class="poly" points="${str(axes.map(() => [0, 0]))}"/><g class="dots">${dots}</g><g class="vls">${vls}</g></g>`;
  }).join("");
  const head = `${cfg.title ? `<h1 class="sc-title rise">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub rise" style="--d:.12s">${SC.esc(cfg.subtitle)}</p>` : ""}`;
  const legend = cfg.legend !== false && series.length
    ? `<div class="legend">${series.map((s, k) => `<button class="lg rise" data-k="${k}" aria-pressed="true" style="--c:${SC.esc(s.color)}"><i></i><span>${SC.esc(s.name)}</span></button>`).join("")}</div>` : "";
  return `<div class="side"><div>${head}</div>${legend}${cfg.note ? `<div class="note rise" style="--d:1s">${SC.rich(cfg.note)}</div>` : ""}</div>
    <div class="plot"><svg class="radar" viewBox="-88 -60 176 120" preserveAspectRatio="xMidYMid meet">
      <g class="grid">${rings}${spokes}</g><circle class="core" style="--i:${RINGS}" r="1"/>
      <g class="labels">${labels}</g><g class="sers" style="--fill:${FILL}">${sers}</g></svg></div>`;
}

player.play(async (r) => {
  stage.className = "stage" + (SC.reduce ? " nomo" : "") + (cfg.valueLabels ? " vlon" : "");
  stage.innerHTML = buildHTML();
  let ready = false;

  const root = SC.$(".sers", stage);
  const items = series.map((s, k) => ({
    s, k, g: SC.$(`.ser[data-k="${k}"]`, stage), poly: SC.$(`.ser[data-k="${k}"] .poly`, stage),
    lg: SC.$(`.lg[data-k="${k}"]`, stage), p: -1, popped: false, off: false
  }));
  items.forEach((it) => { if (it.lg) it.lg.style.animationDelay = `calc(${(0.7 + it.k * 0.12).toFixed(2)}s / var(--speed))`; });
  const full = (it) => it.poly.setAttribute("points", str(it.s.f.map((f, j) => pt(j, f))));

  /* 交互：播放结束后才启用 */
  const setHl = (k) => {
    root.classList.toggle("hasHl", k >= 0);
    items.forEach((it) => { const on = it.k === k; it.g.classList.toggle("hl", on); if (it.lg) it.lg.classList.toggle("hl", on); });
  };
  items.forEach((it) => {
    const enter = () => { if (ready && !it.off) setHl(it.k); };
    const leave = () => { if (ready) setHl(-1); };
    it.g.addEventListener("pointerenter", enter);
    it.g.addEventListener("pointerleave", leave);
    if (it.lg) {
      it.lg.addEventListener("pointerenter", enter);
      it.lg.addEventListener("pointerleave", leave);
      it.lg.addEventListener("focus", enter);
      it.lg.addEventListener("blur", leave);
      it.lg.addEventListener("click", () => {
        if (!ready) return;
        it.off = !it.off;
        it.g.classList.toggle("off", it.off);
        it.lg.classList.toggle("off", it.off);
        it.lg.setAttribute("aria-pressed", String(!it.off));
        setHl(it.off ? -1 : it.k);
      });
    }
  });

  if (SC.reduce) {
    items.forEach((it) => { full(it); it.g.classList.add("grow", "pop"); });
    ready = true; return;
  }

  await r.wait(RINGS * 100 + 600);
  const T = Math.max(0.2, num(cfg.duration) / 1000), S = Math.max(0, num(cfg.stagger) / 1000);
  const total = Math.max(0, items.length - 1) * S + T;
  await r.raf((dt, t) => {
    items.forEach((it) => {
      const p = SC.clamp((t - it.k * S) / T, 0, 1);
      if (p === it.p) return;
      it.p = p;
      if (p > 0) it.g.classList.add("grow");
      const e = SC.ease.out(p);
      it.poly.setAttribute("points", str(it.s.f.map((f, j) => pt(j, f * e))));
      if (p >= 1 && !it.popped) { it.popped = true; it.g.classList.add("pop"); }
    });
    return t < total;
  });
  await r.wait(items.length ? 700 : 0);
  ready = true;
});
