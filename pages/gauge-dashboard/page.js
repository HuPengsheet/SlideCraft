/* 仪表盘：半环仪表，指针/弧线从零摆动到目标值，带过冲，区间三色。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "仪表盘",
  eyebrow: "",
  heading: "",
  subheading: "",
  columns: 0,
  style: "needle",       // needle | arc
  overshoot: 0.35,
  stagger: 300,
  gauges: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const NS = "http://www.w3.org/2000/svg";
const CX = 100, CY = 100, R = 66, A0 = -135, A1 = 135;
const TONE = {
  good: "var(--good)", bad: "var(--bad)",
  warn: "color-mix(in srgb, var(--good) 40%, var(--bad) 60%)"
};
const pt = (a, r) => [CX + r * Math.sin(a * Math.PI / 180), CY - r * Math.cos(a * Math.PI / 180)];
const arc = (a, b, r) => {
  const [x0, y0] = pt(a, r), [x1, y1] = pt(b, r);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};
const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };

const gauges = (Array.isArray(cfg.gauges) ? cfg.gauges : []).slice(0, 8).filter((g) => g && typeof g === "object").map((g) => {
  let min = num(g.min, 0), max = num(g.max, 100);
  if (max <= min) max = min + 100;
  const value = SC.clamp(num(g.value, min), min, max);
  const span = max - min;
  let zones = (Array.isArray(g.zones) ? g.zones : []).map((z) => z && ({ from: num(z.from, NaN), to: num(z.to, NaN), tone: TONE[z.tone] ? z.tone : "good" }))
    .filter((z) => z && Number.isFinite(z.from) && Number.isFinite(z.to) && z.to > z.from);
  if (!zones.length) zones = [{ from: min, to: min + span * .6, tone: "good" }, { from: min + span * .6, to: min + span * .85, tone: "warn" }, { from: min + span * .85, to: max, tone: "bad" }];
  return {
    label: String(g.label ?? "").slice(0, 40), note: g.note ? String(g.note).slice(0, 60) : "", unit: g.unit ? String(g.unit).slice(0, 8) : "",
    decimals: SC.clamp(Math.round(num(g.decimals, 0)), 0, 3), min, max, value, zones
  };
});

player.play(async (r) => {
  const heading = String(cfg.heading || "").slice(0, 60), sub = String(cfg.subheading || "").slice(0, 120), eyebrow = String(cfg.eyebrow || "").slice(0, 40);
  stage.innerHTML = ((heading || sub || eyebrow) ? `<div class="head">${eyebrow ? `<div class="sc-eyebrow">${SC.esc(eyebrow)}</div>` : ""}${heading ? `<h1 class="sc-title">${SC.esc(heading)}</h1>` : ""}${sub ? `<p class="sc-sub">${SC.esc(sub)}</p>` : ""}</div>` : "") + `<div class="grid"></div>`;
  const grid = SC.$(".grid", stage);
  const n = gauges.length;
  if (!n) return;

  const cols = SC.clamp(Math.round(num(cfg.columns, 0)) || Math.min(n, 4), 1, n);
  const rowsN = Math.ceil(n / cols);
  const availH = 56.25 / 1.6 - 7 - ((heading || sub || eyebrow) ? 7.5 : 0) - 1.6 * (rowsN - 1);
  const availW = 100 / 1.6 - 8 - 1.6 * (cols - 1);
  const gw = Math.max(6, Math.min(16, availW / cols, (availH / rowsN - 4.2) / 0.82));
  grid.style.setProperty("--cols", cols); grid.style.setProperty("--gw", gw.toFixed(2) + "em");

  const useArc = cfg.style === "arc";
  const over = SC.clamp(num(cfg.overshoot, 0.35), 0, 1);
  const frac = (g, v) => (v - g.min) / (g.max - g.min);
  const toneAt = (g, v) => { const z = g.zones.find((z) => v >= z.from && v <= z.to) || g.zones[g.zones.length - 1]; return TONE[z.tone]; };
  /* easeOutBack：最后会回到 1，中途冲过头 */
  const back = (t) => { const c1 = 1.2 + over * 2.4, c3 = c1 + 1; return over === 0 ? SC.ease.out(t) : 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

  const cards = gauges.map((g) => {
    const bands = g.zones.map((z) => {
      const a = A0 + SC.clamp(frac(g, z.from), 0, 1) * (A1 - A0), b = A0 + SC.clamp(frac(g, z.to), 0, 1) * (A1 - A0);
      return b > a ? `<path class="band" d="${arc(a, b, R + 11)}" stroke="${TONE[z.tone]}" stroke-width="3"/>` : "";
    }).join("");
    const ticks = Array.from({ length: 11 }, (_, i) => { const a = A0 + i * (A1 - A0) / 10, [x0, y0] = pt(a, R - 9), [x1, y1] = pt(a, R - (i % 5 ? 13 : 16)); return `<line class="tick" x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"/>`; }).join("");
    const [lx, ly] = pt(A0, R), [rx] = pt(A1, R);
    const d = SC.fmt(g.value, { decimals: g.decimals });
    const fs = Math.max(13, 27 - Math.max(0, d.length + g.unit.length - 5) * 2.6);
    const card = SC.el("card sc-card", `
      <svg viewBox="0 0 200 170" aria-hidden="true">
        ${bands}
        <path class="track" d="${arc(A0, A1, R)}" stroke-width="10"/>
        <path class="val" d="${arc(A0, A1, R)}" stroke-width="10" pathLength="100" stroke-dasharray="0 100"/>
        ${useArc ? "" : ticks}
        <text class="lim" x="${lx.toFixed(1)}" y="${(ly + 15).toFixed(1)}">${SC.esc(SC.fmt(g.min, { decimals: g.decimals, sep: false }))}</text>
        <text class="lim" x="${rx.toFixed(1)}" y="${(ly + 15).toFixed(1)}">${SC.esc(SC.fmt(g.max, { decimals: g.decimals, sep: false }))}</text>
        ${useArc ? "" : `<g class="nd" transform="rotate(${A0} ${CX} ${CY})"><polygon class="needle" points="${CX - 3.2},${CY + 2} ${CX},${CY - R + 6} ${CX + 3.2},${CY + 2} ${CX},${CY + 12}"/></g><circle class="hub" cx="${CX}" cy="${CY}" r="6"/>`}
        <text class="num" x="${CX}" y="${useArc ? 112 : 136}" font-size="${useArc ? fs + 4 : fs}"><tspan class="n"></tspan>${g.unit ? `<tspan class="u" dx="2">${SC.esc(g.unit)}</tspan>` : ""}</text>
      </svg>
      <div class="lab">${SC.esc(g.label)}${g.note ? `<small>${SC.esc(g.note)}</small>` : ""}</div>`);
    grid.append(card);
    return card;
  });

  const setState = (g, card, f, shown) => {
    const val = SC.$(".val", card), nd = SC.$(".nd", card), nEl = SC.$(".n", card), tone = toneAt(g, shown);
    val.setAttribute("stroke-dasharray", `${(SC.clamp(f, 0, 1) * 100).toFixed(3)} 100`);
    val.style.stroke = tone;
    val.style.opacity = f > 0.002 ? 1 : 0;
    if (nd) nd.setAttribute("transform", `rotate(${(A0 + f * (A1 - A0)).toFixed(3)} ${CX} ${CY})`);
    nEl.textContent = SC.fmt(shown, { decimals: g.decimals });
    nEl.style.fill = tone;
  };
  const final = () => gauges.forEach((g, i) => setState(g, cards[i], SC.clamp(frac(g, g.value), 0, 1), g.value));
  gauges.forEach((g, i) => setState(g, cards[i], 0, g.min));

  if (SC.reduce) { cards.forEach((c) => c.classList.add("on")); final(); return; }

  await r.wait(300);
  const jobs = [];
  const stagger = Math.max(0, num(cfg.stagger, 300)), dur = 1700;
  for (let i = 0; i < n; i++) {
    const g = gauges[i], card = cards[i], target = SC.clamp(frac(g, g.value), 0, 1);
    card.classList.add("on");
    jobs.push(r.spawn((async () => {
      await r.wait(250);
      await r.raf((dt, t) => {
        const p = Math.min(t * 1000 / dur, 1);
        const f = target * back(p), shown = SC.lerp(g.min, g.value, SC.ease.out(p));
        setState(g, card, f, shown);
        return p < 1;
      });
      setState(g, card, target, g.value);
    })()));
    await r.wait(stagger);
  }
  await Promise.all(jobs);
});
