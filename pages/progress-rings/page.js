/* 进度环组：嵌套圆环从 12 点钟顺时针填充，外环先启动，中心显示主指标。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "进度环组",
  eyebrow: "",
  heading: "",
  subheading: "",
  stagger: 400,
  rings: [],
  center: { ring: 0, label: "" }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const NS = "http://www.w3.org/2000/svg";
const COLORS = ["accent", "accent-2", "accent-3", "good", "bad"];
const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };

const rings = (Array.isArray(cfg.rings) ? cfg.rings : []).slice(0, 5).filter((x) => x && typeof x === "object").map((x, i) => {
  const goal = num(x.goal, 100) > 0 ? num(x.goal, 100) : 100;
  const c = COLORS.includes(x.color) ? x.color : COLORS[i % 3];
  return { label: String(x.label ?? "").slice(0, 30), value: Math.max(0, num(x.value, 0)), goal, unit: x.unit ? String(x.unit).slice(0, 8) : "",
    decimals: SC.clamp(Math.round(num(x.decimals, 0)), 0, 3), color: `var(--${c})` };
});

player.play(async (r) => {
  const heading = String(cfg.heading || "").slice(0, 60), sub = String(cfg.subheading || "").slice(0, 120), eyebrow = String(cfg.eyebrow || "").slice(0, 40);
  stage.innerHTML = "";
  const n = rings.length;
  if (!n && !(heading || sub || eyebrow)) return;

  /* 圆环几何（viewBox 200）：环宽随环数收窄，由外向内排布 */
  const sw = n <= 3 ? 18 : n === 4 ? 15 : 13, gap = 5, R0 = 100 - sw / 2 - 2;
  const radius = (i) => R0 - i * (sw + gap);
  const innerD = (radius(Math.max(0, n - 1)) - sw / 2 - 4) * 2 / 200 * 27;   // 中心可用直径，em
  const ci = SC.clamp(Math.round(num(cfg.center && cfg.center.ring, 0)), 0, Math.max(0, n - 1));
  const cr = rings[ci];

  let svg = "";
  rings.forEach((g, i) => {
    const rr = radius(i), C = 2 * Math.PI * rr;
    svg += `<circle class="base" cx="100" cy="100" r="${rr}" stroke="${g.color}" stroke-width="${sw}"/>
      <circle class="arc" data-c="${C.toFixed(3)}" cx="100" cy="100" r="${rr}" stroke="${g.color}" style="color:${g.color}" stroke-width="${sw}" stroke-dasharray="0 ${C.toFixed(3)}" transform="rotate(-90 100 100)"/>`;
  });
  const bigLen = cr ? SC.fmt(cr.value, { decimals: cr.decimals }).length + (cr.unit ? 1.5 : 0) : 3;
  const fs = SC.clamp(Math.min(innerD * 0.9 / (bigLen * 0.62), 4.4), 1.2, 4.4);
  const centerLabel = String((cfg.center && cfg.center.label) || (cr && cr.label) || "").slice(0, 30);
  const ring = n ? `<div class="ringbox"><svg viewBox="0 0 200 200" aria-hidden="true">${svg}</svg>
      <div class="ctr" style="--fs:${fs.toFixed(2)}em;--pad:${(27 - innerD) / 2 + 0.6}em"><div class="big"><span class="n"></span>${cr && cr.unit && innerD > 8 ? `<small>${SC.esc(cr.unit)}</small>` : ""}</div>${centerLabel ? `<div class="cl">${SC.esc(centerLabel)}</div>` : ""}</div></div>` : "";
  const legend = n ? `<div class="legend">${rings.map((g) => `<div class="row sc-card" style="color:${g.color}"><i></i>
      <div class="tx"><div class="nm" style="color:var(--fg)">${SC.esc(g.label)}</div><div class="vv" style="color:var(--fg-soft)"><span class="lv"></span> / ${SC.esc(SC.fmt(g.goal, { decimals: g.decimals }))} ${SC.esc(g.unit)}</div></div>
      <div class="pc"><span class="p"></span>%</div></div>`).join("")}</div>` : "";
  const headHTML = (heading || sub || eyebrow) ? `<div class="head">${eyebrow ? `<div class="sc-eyebrow">${SC.esc(eyebrow)}</div>` : ""}${heading ? `<h1 class="sc-title">${SC.esc(heading)}</h1>` : ""}${sub ? `<p class="sc-sub">${SC.esc(sub)}</p>` : ""}</div>` : "";
  stage.innerHTML = ring + `<div class="side">${headHTML}${legend}</div>`;

  const arcs = SC.$$(".arc", stage), rows = SC.$$(".row", stage), nEl = SC.$(".n", stage);
  const set = (i, v) => {
    const g = rings[i], C = +arcs[i].dataset.c, f = SC.clamp(v / g.goal, 0, 1);
    const len = f * C;
    arcs[i].setAttribute("stroke-dasharray", `${len.toFixed(3)} ${(C - len + 1).toFixed(3)}`);
    arcs[i].style.opacity = len < 0.05 ? 0 : 1;      // 零长度的圆端点会露出一个点，隐藏
    SC.$(".lv", rows[i]).textContent = SC.fmt(v, { decimals: g.decimals });
    SC.$(".p", rows[i]).textContent = Math.round(v / g.goal * 100);
    if (i === ci && nEl) nEl.textContent = SC.fmt(v, { decimals: g.decimals });
  };
  rings.forEach((g, i) => set(i, 0));
  if (SC.reduce) { rings.forEach((g, i) => { set(i, g.value); rows[i].classList.add("on"); }); return; }

  await r.wait(350);
  const jobs = [], stagger = Math.max(0, num(cfg.stagger, 400));
  for (let i = 0; i < n; i++) {
    const g = rings[i];
    rows[i].classList.add("on");
    jobs.push(r.spawn(r.raf((dt, t) => {
      const p = Math.min(t * 1000 / 1700, 1);
      set(i, g.value * (1 - Math.pow(1 - p, 4)));
      return p < 1;
    })));
    await r.wait(stagger);
  }
  await Promise.all(jobs);
});
