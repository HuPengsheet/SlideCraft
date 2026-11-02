/* 3D 轮播：coverflow / ring。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  eyebrow: "",
  style: "coverflow",   // coverflow | ring
  autoMs: 3200,         // 0 关闭自动切换
  startIndex: 0,
  items: []             // { src, title, note }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
let cleanup = null;
const RAD_ = Math.PI / 180;

player.play(async (r) => {
  if (cleanup) cleanup();
  stage.innerHTML = "";
  const items = (Array.isArray(cfg.items) ? cfg.items : []).filter((it) => it && it.src);
  const n = items.length;
  const ring = cfg.style === "ring";
  const autoMs = Math.max(0, Number(cfg.autoMs) || 0);

  const head = (cfg.title || cfg.eyebrow) ? SC.el("head", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1>${SC.esc(cfg.title)}</h1>` : ""}`) : null;
  const scene = SC.el("scene" + (ring ? " ring" : ""));
  const info = SC.el("info", `<div class="t"></div><div class="n"></div>`);
  const dots = SC.el("dots");
  const count = SC.el("count");
  if (head) stage.append(head);
  stage.append(scene, info);
  if (!n) return;
  stage.append(count);
  if (n > 1) stage.append(dots);
  const tEl = SC.$(".t", info), nEl = SC.$(".n", info);

  const cards = items.map((it, i) => {
    const c = SC.el("card");
    c.append(SC.media(it.src, { alt: it.title || "" }));
    c.dataset.i = i; scene.append(c); return c;
  });
  const dotEls = items.map((_, i) => { const d = SC.el("", "", "i"); d.onclick = () => go(i); dots.append(d); return d; });

  const wrap = (v) => ((v % n) + n) % n;
  let pos = wrap(Math.round(Number(cfg.startIndex) || 0)), target = pos;   // pos 为连续位置
  let lastAuto = 0, active = -1, idleT = 0, T = 0, intro = SC.reduce ? 1 : 0, swapTimer = 0;
  const step = 360 / n;
  const radius = () => Math.max(26, 11.5 / Math.tan(Math.PI / Math.max(n, 3)) * 1.08);

  function layout() {
    const e = SC.ease.out(intro), R = radius();
    cards.forEach((c, i) => {
      let d = i - pos; d = d - Math.round(d / n) * n;           // 到中心的有符号距离，落在 [-n/2, n/2]
      const ad = Math.abs(d);
      let tf, op, z;
      if (ring) {
        tf = `translate3d(0,0,${-R}em) rotateY(${d * step * e}deg) translateZ(${R}em) scale(${1 + .12 * Math.max(0, 1 - ad)})`;
        const front = Math.cos(d * step * RAD_);
        op = SC.clamp(.35 + .65 * front, .3, 1) * Math.min(1, e * 1.5);
        z = Math.round(front * 100);
        c.style.filter = `brightness(${(.45 + .55 * Math.max(0, front)).toFixed(3)})`;
      } else {
        const s = SC.clamp(d, -1, 1), sign = Math.sign(d) || 0;
        const x = (s * 9.5 + (d - s) * 3.4) * e, tz = -(Math.min(ad, 1) * 9 + Math.max(0, ad - 1) * 2.5) * e;
        tf = `translate3d(${x}em,0,${tz}em) rotateY(${-s * 52 * e}deg) scale(${1 + .3 * Math.max(0, 1 - ad)})`;
        op = ad > 3.2 ? 0 : SC.clamp(1 - Math.max(0, ad - 2) * .8, 0, 1) * Math.min(1, e * 1.5);
        z = Math.round(100 - ad * 10);
        c.style.filter = `brightness(${(1 - Math.min(ad, 2) * .22).toFixed(3)})`;
      }
      c.style.transform = tf; c.style.opacity = op.toFixed(3); c.style.zIndex = z;
      c.style.pointerEvents = op < .05 ? "none" : "";
      c.classList.toggle("side", Math.round(d) !== 0);
    });
    const a = wrap(Math.round(pos));
    if (a !== active) setActive(a);
  }

  function setActive(a) {
    const first = active < 0;
    active = a; stage.dataset.active = a;
    const it = items[a];
    dotEls.forEach((d, i) => d.classList.toggle("on", i === a));
    count.innerHTML = `<b>${SC.pad(a + 1)}</b> / ${SC.pad(n)}`;
    const apply = () => { tEl.textContent = it.title || ""; nEl.textContent = it.note || ""; info.classList.remove("swap"); };
    if (first || SC.reduce) { apply(); return; }
    info.classList.add("swap");
    clearTimeout(swapTimer); swapTimer = setTimeout(apply, 300 / player.speed);
  }

  function go(i) { target = Math.round(pos) + (() => { let d = i - wrap(Math.round(pos)); return d - Math.round(d / n) * n; })(); touch(); }
  function nudge(k) { target = Math.round(target) + k; touch(); }
  function touch() { idleT = T + Math.max(autoMs * 2, 4000) / 1000; lastAuto = idleT; }

  /* 输入 */
  const onKey = (e) => {
    if (e.key === "ArrowRight") { nudge(1); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { nudge(-1); e.preventDefault(); }
  };
  addEventListener("keydown", onKey);
  let drag = null, moved = false;
  const pxPerCard = () => (stage.clientWidth / 100) * (ring ? 14 : 12);
  scene.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, pos, t: performance.now(), lx: e.clientX, lt: performance.now(), v: 0 }; moved = false;
    scene.classList.add("drag"); try { scene.setPointerCapture(e.pointerId); } catch (_) {}
  });
  scene.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 6) moved = true;
    if (!moved) return;
    const now = performance.now();
    drag.v = (-(e.clientX - drag.lx) / pxPerCard()) / Math.max(.008, (now - drag.lt) / 1000) * .5 + drag.v * .5;
    drag.lx = e.clientX; drag.lt = now;
    pos = drag.pos - dx / pxPerCard(); target = pos; touch();
  });
  const end = (e) => {
    if (!drag) return;
    const wasMoved = moved, v = drag.v; drag = null; scene.classList.remove("drag");
    if (wasMoved) { target = Math.round(pos + SC.clamp(v, -6, 6) * .25); touch(); }
    else if (e && e.type === "pointerup") {
      const card = document.elementFromPoint(e.clientX, e.clientY)?.closest?.(".card");
      if (card) { const i = +card.dataset.i; if (i !== active) go(i); }
    }
  };
  scene.addEventListener("pointerup", end);
  scene.addEventListener("pointercancel", end);

  let live = true;
  cleanup = () => { live = false; removeEventListener("keydown", onKey); clearTimeout(swapTimer); };

  layout();
  if (SC.reduce) return;

  /* 单一循环：开场展开、缓动到目标、自动切换。被重播取代时结束 */
  await r.raf((dt, t) => {
    T = t; intro = Math.min(1, t / 1.1);
    if (!drag) {
      const k = 1 - Math.exp(-dt * 7);
      pos += (target - pos) * k;
      if (Math.abs(target - pos) < 1e-3) pos = target;
      if (autoMs && n > 1 && T > 1.2 && T > idleT && Math.abs(target - pos) < .02) {
        if (T - Math.max(lastAuto, idleT - 0) >= autoMs / 1000) { target = Math.round(target) + 1; lastAuto = T; }
      }
    }
    layout();
    return live;
  });
});
