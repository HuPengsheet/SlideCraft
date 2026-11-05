/* 弹幕墙：文字从右向左飞过，多条轨道，同轨道不重叠。配置见 config.js。
 * 所有坐标用 em（舞台宽 62.5em，高约 35.16em），缩放窗口时不用重算。 */
const DEFAULTS = {
  theme: "dark",
  title: "弹幕墙",
  eyebrow: "",
  heading: "",
  subheading: "",
  lanes: 7,
  speed: 1,
  density: 0.6,
  seed: 3,
  items: []              // 字符串或 { text, highlight, by }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const W = 100 / 1.6, H = 56.25 / 1.6;
const TINTS = ["--accent-3", "--accent-2", "--good", "--accent"];

const items = (Array.isArray(cfg.items) ? cfg.items : []).slice(0, 300)
  .map((it) => (typeof it === "string" || typeof it === "number") ? { text: String(it) } : (it && typeof it === "object" ? it : null))
  .filter((it) => it && String(it.text ?? "").trim())
  .map((it) => ({ text: String(it.text).trim().slice(0, 120), hl: !!it.highlight, by: it.by ? String(it.by).slice(0, 24) : "" }));

player.play(async (r) => {
  const heading = String(cfg.heading || "").slice(0, 60), sub = String(cfg.subheading || "").slice(0, 120), eyebrow = String(cfg.eyebrow || "").slice(0, 40);
  stage.innerHTML = `<div class="layer"></div>` + ((heading || sub || eyebrow) ? `<div class="head"><div class="hd">
      ${eyebrow ? `<div class="sc-eyebrow">${SC.esc(eyebrow)}</div>` : ""}
      ${heading ? `<h1 class="sc-title">${SC.esc(heading)}</h1>` : ""}
      ${sub ? `<p class="sc-sub">${SC.esc(sub)}</p>` : ""}</div></div>` : "");
  const layer = SC.$(".layer", stage), hd = SC.$(".hd", stage);

  const rnd = SC.rng(Number(cfg.seed) || 3);
  const speed = SC.clamp(Number(cfg.speed) || 1, 0.2, 4);
  const density = SC.clamp(Number.isFinite(+cfg.density) ? +cfg.density : 0.6, 0, 1);
  const usable = H - 4;
  const nLanes = SC.clamp(Math.round(Number(cfg.lanes)) || 7, 1, Math.max(1, Math.floor(usable / 3.6)));
  const pitch = usable / nLanes;
  const lanes = Array.from({ length: nLanes }, (_, i) => ({ y: 2 + pitch * (i + 0.5), list: [], delay: rnd() * 2.2 }));

  let queue = [], clock = 0, cursor = 0, tint = 0;
  const next = () => {
    if (!queue.length) {
      queue = items.slice();
      for (let i = queue.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [queue[i], queue[j]] = [queue[j], queue[i]]; }
    }
    return queue.pop();
  };

  const place = (o) => { o.el.style.transform = `translate3d(${o.x.toFixed(3)}em,0,0)`; };
  const spawn = (lane, last) => {
    const it = next();
    const el = SC.el("dm", `<div class="pill${it.hl ? " hl" : ""}" style="--c:var(${TINTS[tint++ % TINTS.length]})"><span class="tx">${SC.esc(it.text)}</span>${it.by ? `<span class="by">${SC.esc(it.by)}</span>` : ""}</div>`);
    el.style.top = lane.y.toFixed(3) + "em";
    const o = { el, x: W + 1, v: 0, w: 0, gap: 0 };
    place(o); layer.append(el);
    const emPx = parseFloat(getComputedStyle(stage).fontSize) || 16;
    o.w = el.firstChild.offsetWidth / emPx;
    let v = 7.5 * speed * (0.85 + rnd() * 0.3) * (it.hl ? 0.85 : 1);
    if (last) v = Math.min(v, last.v);         // 不比前一条快，保证追不上
    o.v = v; o.gap = 2.5 + (1 - density) * 14 + rnd() * 3;
    lane.list.push(o);
  };
  const step = (dt) => {
    clock += dt;
    for (const lane of lanes) {
      for (const o of lane.list) { o.x -= o.v * dt; place(o); }
      while (lane.list.length && lane.list[0].x + lane.list[0].w < -1) lane.list.shift().el.remove();
    }
    if (!items.length) return;
    for (let k = 0; k < nLanes; k++) {
      const idx = (cursor + k) % nLanes, lane = lanes[idx];
      if (clock < lane.delay) continue;
      const last = lane.list[lane.list.length - 1];
      if (last && last.x + last.w + last.gap > W) continue;
      spawn(lane, last); cursor = idx + 1; break;
    }
  };

  if (SC.reduce) {                              // 静态：预演 12 秒后定格
    for (let i = 0; i < 240; i++) step(0.05);
    layer.classList.add("on"); if (hd) hd.classList.add("on");
    return;
  }
  await r.wait(250);
  if (hd) hd.classList.add("on");
  await r.wait(500);
  layer.classList.add("on");
  r.spawn(r.raf((dt) => { step(dt); }));         // 一直飞，直到重播接管
});
