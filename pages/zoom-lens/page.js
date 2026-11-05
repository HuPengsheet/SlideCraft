/* 放大镜细节：圆形放大镜沿点位移动，之后可拖动。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  image: "",
  zoom: 3,
  hold: 2200,
  hint: "拖动放大镜，或点击编号",
  spots: []              // { x, y (百分比), label, note }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const FW = 40, FH = 22.5, LD = 8.75;   // 画框与放大镜尺寸（em），与 CSS 一致
const num = (v, d) => (v !== null && v !== "" && Number.isFinite(+v) ? +v : d);

/* 没有图时的线框示意 */
function wireframe() {
  return `<svg class="wire base" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="left:0;top:0;width:100%;height:100%">
    <rect width="160" height="90" style="fill:var(--surface)"/>
    <rect x="0" y="0" width="160" height="9" style="fill:var(--line)"/><circle cx="5" cy="4.5" r="1.3" style="fill:var(--accent-2)"/><circle cx="10" cy="4.5" r="1.3" style="fill:var(--accent)"/><circle cx="15" cy="4.5" r="1.3" style="fill:var(--good)"/>
    <rect x="0" y="9" width="30" height="81" style="fill:color-mix(in srgb, var(--line) 50%, var(--surface))"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="5" y="${16 + i * 8}" width="${14 + (i * 5) % 11}" height="2.4" rx="1.2" style="fill:var(--fg-soft);opacity:.6"/>`).join("")}
    <rect x="38" y="16" width="62" height="6" rx="1" style="fill:var(--fg)"/><rect x="38" y="26" width="44" height="2.6" rx="1.3" style="fill:var(--fg-soft)"/>
    <rect x="108" y="16" width="44" height="30" rx="2" style="fill:color-mix(in srgb, var(--accent) 40%, var(--surface))"/>
    <rect x="38" y="54" width="34" height="28" rx="2" style="fill:var(--bg);stroke:var(--line);stroke-width:.4"/><rect x="76" y="54" width="34" height="28" rx="2" style="fill:var(--bg);stroke:var(--line);stroke-width:.4"/><rect x="114" y="54" width="38" height="28" rx="2" style="fill:color-mix(in srgb, var(--accent-3) 35%, var(--surface))"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${42 + (i % 3) * 3}" y="${59 + i * 2.8}" width="${22 - (i % 3) * 3}" height="1.1" rx=".5" style="fill:var(--fg-soft);opacity:.55"/>`).join("")}
  </svg>`;
}
function mediaEl(src, cls) {
  if (!src || typeof src !== "string") { const w = SC.el("", wireframe()).firstChild; w.classList.add(cls); return w; }
  const m = SC.media(src); m.classList.add(cls);
  m.addEventListener("error", () => { const w = SC.el("", wireframe()).firstChild; w.classList.add(cls); m.replaceWith(w); w.style.cssText = m.style.cssText + ";left:0;top:0;width:100%;height:100%"; }, { once: true });
  return m;
}

player.play(async (r) => {
  stage.innerHTML = "";
  const spots = (Array.isArray(cfg.spots) ? cfg.spots : []).filter((s) => s && typeof s === "object").slice(0, 8).map((s, i) => ({
    x: SC.clamp(num(s.x, 50), 0, 100), y: SC.clamp(num(s.y, 50), 0, 100), label: s.label == null ? `点位 ${i + 1}` : String(s.label), note: s.note == null ? "" : String(s.note)
  }));
  const zoom = SC.clamp(num(cfg.zoom, 3), 1.5, 8), hold = Math.max(300, num(cfg.hold, 2200));

  const root = SC.el("root"), frame = SC.el("frame"), side = SC.el("side");
  const lens = SC.el("lens"), copy = mediaEl(cfg.image, "copy");
  lens.append(copy, SC.el("cross"));
  frame.append(mediaEl(cfg.image, "base"), SC.el("dim"));
  const pins = spots.map((s, i) => {
    const p = SC.el("pin", String(i + 1), "button");
    p.style.cssText = `left:${s.x}%;top:${s.y}%`; p.setAttribute("aria-label", s.label);
    frame.append(p); return p;
  });
  frame.append(lens);
  const cur = SC.el("cur"), dots = SC.el("dots", spots.map(() => "<i></i>").join(""));
  side.innerHTML = `<div class="hd">${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1 class="sc-title">${SC.rich(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.rich(cfg.subtitle)}</p>` : ""}</div>`;
  if (spots.length) side.append(cur, dots);
  root.append(frame, side);
  if (cfg.hint && spots.length) root.append(SC.el("hint", SC.esc(cfg.hint)));
  stage.append(root);

  const pos = { x: spots.length ? spots[0].x : 50, y: spots.length ? spots[0].y : 50 };
  let active = -1, token = 0, userMoved = false;
  const render = () => {
    const px = pos.x / 100 * FW, py = pos.y / 100 * FH;
    lens.style.left = (px - LD / 2) + "em"; lens.style.top = (py - LD / 2) + "em";
    copy.style.width = FW * zoom + "em"; copy.style.height = FH * zoom + "em";
    copy.style.left = (LD / 2 - px * zoom) + "em"; copy.style.top = (LD / 2 - py * zoom) + "em";
  };
  const setActive = (i) => {
    if (i === active || !spots[i]) return;
    active = i;
    const s = spots[i];
    cur.innerHTML = `<span class="k">${SC.pad(i + 1)} / ${SC.pad(spots.length)}</span><b>${SC.esc(s.label)}</b>${s.note ? `<p>${SC.esc(s.note)}</p>` : ""}`;
    cur.classList.remove("swap"); void cur.offsetWidth; if (!SC.reduce) cur.classList.add("swap");
    [...dots.children].forEach((d, k) => d.classList.toggle("on", k === i));
    pins.forEach((p, k) => p.classList.toggle("on", k === i));
  };
  const nearest = () => {
    let bi = -1, bd = 1e9;
    spots.forEach((s, i) => { const d = Math.hypot((s.x - pos.x) * FW / 100, (s.y - pos.y) * FH / 100); if (d < bd) { bd = d; bi = i; } });
    return bd < LD * .55 ? bi : -1;
  };
  const moveTo = (i, dur = 1000) => {
    const my = ++token, from = { ...pos }, to = spots[i];
    setActive(i);
    if (SC.reduce) { pos.x = to.x; pos.y = to.y; render(); return Promise.resolve(); }
    return r.spawn(r.raf((dt, t) => {
      if (my !== token) return false;
      const k = SC.ease.inOut(Math.min(t * 1000 / dur, 1));
      pos.x = SC.lerp(from.x, to.x, k); pos.y = SC.lerp(from.y, to.y, k); render();
      return k < 1;
    }));
  };

  /* 拖动 */
  let drag = null;
  lens.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    token++; userMoved = true;
    const b = frame.getBoundingClientRect();
    drag = { dx: (e.clientX - b.left) / b.width * 100 - pos.x, dy: (e.clientY - b.top) / b.height * 100 - pos.y };
    lens.classList.add("drag"); e.preventDefault();
    try { lens.setPointerCapture(e.pointerId); } catch (_) { /* 合成事件时忽略 */ }
  });
  lens.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const b = frame.getBoundingClientRect();
    pos.x = SC.clamp((e.clientX - b.left) / b.width * 100 - drag.dx, 0, 100);
    pos.y = SC.clamp((e.clientY - b.top) / b.height * 100 - drag.dy, 0, 100);
    render();
    const n = nearest(); if (n >= 0) setActive(n);
  });
  const end = () => { drag = null; lens.classList.remove("drag"); };
  lens.addEventListener("pointerup", end);
  lens.addEventListener("pointercancel", end);
  pins.forEach((p, i) => p.addEventListener("click", () => { userMoved = true; moveTo(i, 700); }));
  [...dots.children].forEach((d, i) => d.addEventListener("click", () => { userMoved = true; moveTo(i, 700); }));

  render();
  if (spots.length) setActive(0);
  if (SC.reduce) { frame.classList.add("in"); side.classList.add("in"); lens.classList.add("in"); return; }

  await r.wait(250);
  frame.classList.add("in"); side.classList.add("in");
  await r.wait(700);
  lens.classList.add("in");
  if (spots.length < 2) return;
  await r.wait(hold * .6);
  for (let i = 1; i <= spots.length && !userMoved; i++) {
    await moveTo(i % spots.length, 1000);
    if (userMoved) break;
    await r.wait(hold);
  }
});
