/* 轨道地图：中心节点 + 同心轨道上缓慢转动的卫星。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  center: { label: "", sub: "" },
  orbits: [],            // { name, speed, items: [{ label, note, mark }] }
  tilt: 35,              // 0 到 60 度
  labels: "always",      // "always" | "hover"
  noteMs: 1300           // 自动演示时每个卫星的高亮时长
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const NS = "http://www.w3.org/2000/svg";
const W = 160, H = 90, CX = 80, CY = 44;          // SVG 坐标，与 16:9 舞台一致
const RADII = { 1: [26], 2: [18, 30], 3: [14, 24, 32] };
const SPEEDS = [8, -6, 4];
const COLORS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)"];

/* 整理配置：坏数据降级为空而不是抛错 */
function model() {
  const orbits = (Array.isArray(cfg.orbits) ? cfg.orbits : []).filter((o) => o && typeof o === "object").slice(0, 3);
  const nr = orbits.length;
  return orbits.map((o, ri) => ({
    name: o.name || "ORBIT " + SC.pad(ri + 1),
    speed: Number.isFinite(+o.speed) && o.speed !== "" && o.speed != null ? +o.speed : SPEEDS[ri],
    r: RADII[nr][ri], color: COLORS[ri],
    items: (Array.isArray(o.items) ? o.items : []).map((it) => (typeof it === "string" ? { label: it } : it || {})).map((it) => ({
      label: String(it.label ?? ""), note: it.note ? String(it.note) : "",
      mark: String(it.mark ?? Array.from(String(it.label ?? "?"))[0] ?? "?").slice(0, 2)
    }))
  }));
}

player.play(async (r) => {
  const orbits = model();
  const tilt = SC.clamp(Number.isFinite(+cfg.tilt) ? +cfg.tilt : 35, 0, 60);
  const squash = Math.cos(tilt * Math.PI / 180);
  const center = typeof cfg.center === "string" ? { label: cfg.center } : cfg.center || {};

  stage.innerHTML = "";
  stage.classList.toggle("lh", cfg.labels === "hover");
  if (cfg.title || cfg.subtitle) {
    stage.append(SC.el("head", `${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}`));
  }
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "map");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.innerHTML = orbits.map((o) => `<g class="ring" style="--rc:${o.color}"><ellipse class="band" cx="${CX}" cy="${CY}" rx="${o.r}" ry="${o.r * squash}"/><ellipse class="line" pathLength="1" cx="${CX}" cy="${CY}" rx="${o.r}" ry="${o.r * squash}"/></g>`).join("")
    + `<line class="beam" x1="${CX}" y1="${CY}" x2="${CX}" y2="${CY}"/>`;
  stage.append(svg);
  const beam = SC.$(".beam", svg), rings = SC.$$(".ring", svg);

  const core = SC.el("core", `<b>${SC.esc(center.label || "")}</b>${center.sub ? `<small>${SC.esc(center.sub)}</small>` : ""}`);
  core.style.top = (CY / H * 100) + "%";
  stage.append(core);

  const card = SC.el("card", `<div class="ci"></div>`);
  stage.append(card);
  const ci = SC.$(".ci", card);

  /* 卫星 */
  const sats = [];
  orbits.forEach((o, ri) => o.items.forEach((it, i) => {
    const dom = SC.el("sat", `<div class="in"><div class="dot">${SC.esc(it.mark)}</div></div><div class="lab">${SC.esc(it.label)}</div>`);
    dom.style.setProperty("--rc", o.color);
    const s = { o, it, dom, ri, i, a0: i / o.items.length * 360 + ri * 37, x: 0, y: 0 };
    sats.push(s); stage.append(dom);
  }));

  let clock = 0, live = false, held = null, active = null;
  const place = () => {
    for (const s of sats) {
      const a = (s.a0 + s.o.speed * clock) * Math.PI / 180;
      const sn = Math.sin(a), depth = (sn + 1) / 2;           // sn 为正：在轨道前侧（屏幕下方）
      s.x = CX + s.o.r * Math.cos(a); s.y = CY + s.o.r * squash * sn;
      s.dom.style.left = `calc(${s.x / W * 100}% - 1.5em)`;
      s.dom.style.top = `calc(${s.y / H * 100}% - 1.5em)`;
      s.dom.style.zIndex = tilt > 1 && sn < 0 ? 3 : 7;       // 后侧在中心节点之下
      const sc = 1 + (depth - .5) * .28 * (tilt / 60);
      s.dom.style.transform = `scale(${sc.toFixed(3)})`;
      s.dom.style.opacity = tilt > 1 ? (.72 + .28 * depth).toFixed(2) : 1;
    }
    if (active) { beam.setAttribute("x2", active.x); beam.setAttribute("y2", active.y); }
  };

  const show = (s) => {
    if (active === s) return;
    if (active) active.dom.classList.remove("hl");
    active = s;
    beam.classList.toggle("on", !!s);
    card.classList.toggle("on", !!s);
    if (!s) return;
    s.dom.classList.add("hl");
    card.style.setProperty("--rc", s.o.color);
    ci.innerHTML = `<div class="k"><i>${SC.esc(s.it.mark)}</i>${SC.esc(s.o.name)}</div><div class="t">${SC.esc(s.it.label)}</div>${s.it.note ? `<p class="n">${SC.rich(s.it.note)}</p>` : ""}`;
    beam.style.setProperty("--rc", s.o.color);
    ci.classList.remove("pop"); void ci.offsetWidth; ci.classList.add("pop");
    place();
  };

  for (const s of sats) {
    s.dom.addEventListener("mouseenter", () => { if (!live) return; held = s; show(s); });
    s.dom.addEventListener("mouseleave", () => { if (held === s) held = null; if (live) show(null); });
  }

  place();
  /* 环境转动：整个播放期间持续；重播时旧循环被 epoch 终止 */
  if (!SC.reduce) r.spawn(r.raf((dt) => { if (!held) { clock += dt; place(); } }));

  if (SC.reduce) {
    core.classList.add("on"); rings.forEach((g) => g.classList.add("draw")); sats.forEach((s) => s.dom.classList.add("on"));
    live = true; return;
  }

  await r.wait(300);
  core.classList.add("on");
  await r.wait(700);
  for (const g of rings) { g.classList.add("draw"); await r.wait(450); }
  await r.wait(400);
  for (const s of sats) { s.dom.classList.add("on"); await r.wait(110); }
  await r.wait(600);
  for (const s of sats) {
    show(s);
    await r.wait(s.it.note ? +cfg.noteMs || 1300 : 500);
  }
  show(null);
  live = true;
});
