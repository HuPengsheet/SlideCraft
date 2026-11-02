/* 动画图表：柱状 / 折线 / 环形，由 type 选择。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  type: "bar",           // bar | line | donut
  unit: "",
  labels: [],            // 横轴类别 / 环形扇区名
  series: [],            // { name, data[] }
  legend: true,
  valueLabels: true,
  area: false,           // 折线面积填充
  decimals: null,        // null = 按数据自动
  duration: 1800,        // 动画时长，毫秒
  note: ""
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const COLORS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)"];
const color = (i) => COLORS[i % 3];
const colorOpacity = (i) => [1, 0.6, 0.35][Math.min(2, Math.floor(i / 3))];
const num = (v) => (Number.isFinite(+v) && +v > 0 ? +v : 0);

/* 纵轴取整：约 5 格，步长取 1 / 2 / 2.5 / 5 × 10^k */
function niceScale(max) {
  if (!(max > 0)) return { top: 1, step: 0.2 };
  const raw = max / 5, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  return { top: Math.ceil(max / step - 1e-9) * step, step };
}

player.play(async (r) => {
  const type = ["bar", "line", "donut"].includes(cfg.type) ? cfg.type : "bar";
  const labels = cfg.labels || [];
  const series = (cfg.series || []).map((s, i) => ({
    name: s.name || `系列 ${i + 1}`,
    data: labels.map((_, j) => num((s.data || [])[j]))
  }));
  const all = series.flatMap((s) => s.data);
  const autoDec = Math.max(0, ...(cfg.series || []).flatMap((s) => (s.data || []).map((v) => {
    const t = String(v), k = t.indexOf("."); return k < 0 ? 0 : Math.min(2, t.length - k - 1);
  })));
  const dec = cfg.decimals ?? autoDec;
  const fmt = (v) => SC.fmt(v, { decimals: dec });
  const unit = cfg.unit ? SC.esc(cfg.unit) : "";

  const head = (cfg.title || cfg.subtitle)
    ? `<div class="head">${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}</div>` : "";
  const note = cfg.note ? `<p class="note">${SC.esc(cfg.note)}</p>` : "";
  const swatch = (i) => `<i style="background:${color(i)};opacity:${colorOpacity(i)}"></i>`;

  /* items: { delay, dur, set(p) }，p 为 0..1 的原始进度 */
  const items = [];
  let svg = "", legend = "", chartCls = type;

  if (type === "donut") {
    const s0 = series[0] || { name: "", data: [] };
    const total = s0.data.reduce((a, b) => a + b, 0);
    const C = 2 * Math.PI * 140;
    let acc = 0;
    const segs = s0.data.map((v, i) => { const a = total ? acc / total : 0; acc += v; return { v, s: a, e: total ? acc / total : 0, i }; });
    svg = `<svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="140" fill="none" class="grid" style="stroke-width:44"/>
      <g transform="rotate(-90 200 200)">${segs.map((g) => `<circle class="seg" cx="200" cy="200" r="140" fill="none" stroke="${color(g.i)}" stroke-opacity="${colorOpacity(g.i)}" stroke-width="44" stroke-dasharray="0 ${C}" stroke-dashoffset="${-g.s * C}"/>`).join("")}</g>
      <text class="tot" x="200" y="205" text-anchor="middle">${fmt(0)}</text>
      <text class="totl" x="200" y="238" text-anchor="middle">${cfg.unit ? "合计 · " + SC.esc(cfg.unit) : "合计"}</text></svg>`;
    chartCls = "donut";
    legend = cfg.legend ? `<div class="legend side">${segs.map((g) => `<div class="it">${swatch(g.i)}<span>${SC.esc(labels[g.i] ?? "")}</span><span class="v">${cfg.valueLabels ? `<b>${fmt(g.v)}${unit}</b>` : ""}${total ? (g.v / total * 100).toFixed(1) : "0.0"}%</span></div>`).join("")}</div>` : "";
  } else {
    const W = 1000, H = 400, L = 64, R = 16, T = 24, B = 44, iw = W - L - R, ih = H - T - B;
    const { top, step } = niceScale(Math.max(0, ...all));
    const y = (v) => T + ih * (1 - v / top);
    const nL = labels.length || 1, nS = series.length || 1;
    const cx = (j) => L + iw * (j + 0.5) / nL;
    let g = "";
    for (let v = 0; v <= top + step / 1e6; v += step) {
      const yy = y(v);
      g += `<line class="${v === 0 ? "axis" : "grid"}" x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}"/><text x="${L - 10}" y="${yy + 4}" text-anchor="end">${SC.fmt(+v.toFixed(6), { decimals: step < 1 ? 1 : 0 })}</text>`;
    }
    g += labels.map((t, j) => `<text class="cl" x="${cx(j)}" y="${H - 16}" text-anchor="middle">${SC.esc(t)}</text>`).join("");
    let body = "";
    if (type === "bar") {
      const gw = iw / nL * 0.62, bw = gw / nS;
      series.forEach((s, si) => s.data.forEach((v, j) => {
        const x = cx(j) - gw / 2 + si * bw + bw * 0.06;
        body += `<rect class="b" x="${x}" y="${y(0)}" width="${bw * 0.88}" height="0" rx="3" fill="${color(si)}" fill-opacity="${colorOpacity(si)}"/>`
          + (cfg.valueLabels ? `<text class="vl b-v" x="${x + bw * 0.44}" y="${y(v) - 8}" text-anchor="middle" opacity="0">${fmt(v)}</text>` : "");
      }));
    } else {
      series.forEach((s, si) => {
        const pts = s.data.map((v, j) => [cx(j), y(v)]);
        const d = pts.map((p, j) => (j ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("");
        body += (cfg.area && pts.length ? `<path class="ar" d="${d}L${pts[pts.length - 1][0]} ${y(0)}L${pts[0][0]} ${y(0)}Z" fill="${color(si)}" fill-opacity="0"/>` : "")
          + `<path class="ln" d="${d}" fill="none" stroke="${color(si)}" stroke-opacity="${colorOpacity(si)}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>`
          + pts.map((p, j) => `<circle class="pt" cx="${p[0]}" cy="${p[1]}" r="0" fill="var(--bg)" stroke="${color(si)}" stroke-width="3"/>`
            + (cfg.valueLabels ? `<text class="vl pv" x="${p[0]}" y="${p[1] - 14}" text-anchor="middle" opacity="0">${fmt(s.data[j])}</text>` : "")).join("");
      });
    }
    svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${g}${body}</svg>`;
    legend = cfg.legend && series.length ? `<div class="legend">${series.map((s, i) => `<span>${swatch(i)}${SC.esc(s.name)}</span>`).join("")}</div>` : "";
  }

  stage.innerHTML = `${head}<div class="chart ${chartCls}">${svg}${type === "donut" ? legend : ""}</div>${type === "donut" ? "" : legend}${note}`;

  /* 绑定动画 */
  const dur = cfg.duration, q = (s) => SC.$$(s, stage);
  if (type === "bar") {
    const rects = q("rect.b"), vls = q(".b-v");
    const nL = labels.length || 1, y0 = +rects[0]?.getAttribute("y"), ihh = 400 - 24 - 44;
    const top = niceScale(Math.max(0, ...all)).top;
    let k = 0;
    series.forEach((s, si) => s.data.forEach((v, j) => {
      const idx = k++, rect = rects[idx], vl = vls[idx], h = ihh * v / top;
      items.push({ delay: j * 160 + si * 90, dur: dur * 0.55, set(p) {
        const e = SC.ease.out(p); rect.setAttribute("height", h * e); rect.setAttribute("y", y0 - h * e);
        if (vl) vl.setAttribute("opacity", SC.clamp((p - 0.6) / 0.4, 0, 1));
      } });
    }));
  } else if (type === "line") {
    const lns = q("path.ln"), ars = q("path.ar"), pts = q("circle.pt"), pvs = q(".pv");
    series.forEach((s, si) => {
      const ln = lns[si], len = ln.getTotalLength(), n = s.data.length, ar = cfg.area ? ars[si] : null;
      ln.style.strokeDasharray = len; ln.style.strokeDashoffset = len;
      items.push({ delay: si * 250, dur: dur * 0.8, set(p) {
        ln.style.strokeDashoffset = len * (1 - p);
        if (ar) ar.setAttribute("fill-opacity", 0.18 * SC.ease.out(p));
        s.data.forEach((_, j) => {
          const f = n > 1 ? 0.88 * j / (n - 1) : 0, pp = SC.clamp((p - f) / 0.12, 0, 1), k = si * n + j;
          pts[k].setAttribute("r", 6 * SC.ease.out(pp) * (pp < 1 ? 1.3 : 1));
          if (pvs[k]) pvs[k].setAttribute("opacity", pp);
        });
      } });
    });
  } else {
    const segs = q("circle.seg"), tot = SC.$(".tot", stage), vs = q(".legend .v");
    const total = (series[0]?.data || []).reduce((a, b) => a + b, 0), C = 2 * Math.PI * 140;
    const data = series[0]?.data || [];
    let acc = 0;
    const span = data.map((v) => { const s = total ? acc / total : 0; acc += v; return [s, total ? acc / total : 0]; });
    items.push({ delay: 0, dur, set(p) {
      const u = SC.ease.inOut(p);
      span.forEach(([s, e], i) => { segs[i].setAttribute("stroke-dasharray", `${SC.clamp((u - s) / (e - s || 1), 0, 1) * (e - s) * C} ${C}`); });
      tot.textContent = fmt(total * u);
      vs.forEach((el) => { el.style.opacity = SC.clamp((p - 0.7) / 0.3, 0, 1); });
    } });
  }

  if (SC.reduce) { items.forEach((it) => it.set(1)); return; }
  items.forEach((it) => it.set(0));
  await r.wait(300);
  await r.raf((dt, t) => {
    let done = true;
    for (const it of items) { const p = SC.clamp((t * 1000 - it.delay) / it.dur, 0, 1); it.set(p); if (p < 1) done = false; }
    return !done;
  });
});
