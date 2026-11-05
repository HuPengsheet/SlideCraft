/* 立方体翻面：CSS 3D。按顺序翻到每个面，之后可拖动，带惯性。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  size: 20,
  holdMs: 1800,
  turnMs: 1100,
  faces: []   // { title, text, image }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const num = (v, d) => (v !== null && v !== "" && Number.isFinite(+v) ? +v : d);
const RAD = Math.PI / 180;
let cleanup = null;

/* 六个面：名称、使整个立方体正对该面所需的 [rx, ry]（度），以及面本身的放置变换 */
const SIDES = [
  { to: [0, 0], put: (h) => `translateZ(${h}em)`, n: [0, 0, 1] },
  { to: [0, -90], put: (h) => `rotateY(90deg) translateZ(${h}em)`, n: [1, 0, 0] },
  { to: [0, -180], put: (h) => `rotateY(180deg) translateZ(${h}em)`, n: [0, 0, -1] },
  { to: [0, -270], put: (h) => `rotateY(-90deg) translateZ(${h}em)`, n: [-1, 0, 0] },
  { to: [-90, 0], put: (h) => `rotateX(90deg) translateZ(${h}em)`, n: [0, -1, 0] },
  { to: [90, 0], put: (h) => `rotateX(-90deg) translateZ(${h}em)`, n: [0, 1, 0] }
];

player.play(async (r) => {
  if (cleanup) cleanup();
  stage.innerHTML = "";

  const size = SC.clamp(num(cfg.size, 20), 8, 30), h = size / 2;
  const hold = Math.max(200, num(cfg.holdMs, 1800)), turn = Math.max(200, num(cfg.turnMs, 1100));
  const src = (Array.isArray(cfg.faces) ? cfg.faces : []).filter((f) => f && typeof f === "object").slice(0, 6);
  const faces = SIDES.map((_, i) => (src.length ? src[i % src.length] : null));
  const nReal = Math.min(src.length, 6) || 0;

  const glow = SC.el("glow fadein");
  const scene = SC.el("scene");
  const rig = SC.el("rig");
  const floor = SC.el("floor fadein");
  const cube = SC.el("cube");
  rig.append(cube); scene.append(rig);
  const head = (cfg.title || cfg.eyebrow) ? SC.el("head fadein", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1>${SC.esc(cfg.title)}</h1>` : ""}`) : null;
  const count = SC.el("count fadein");
  const hint = SC.el("hint", "拖动旋转");
  stage.append(glow, floor, scene);
  if (head) stage.append(head);
  if (nReal) stage.append(count);
  stage.append(hint);
  floor.style.top = `calc(46% + ${h * 1.1 + 3}em)`;

  const els = SIDES.map((s, i) => {
    const f = faces[i], el = SC.el("face" + (f && f.image ? "" : " txt"));
    el.style.width = el.style.height = size + "em";
    el.style.left = el.style.top = -h + "em";
    el.style.transform = s.put(h);
    if (f) {
      if (f.image) el.append(SC.media(String(f.image), { alt: String(f.title || "") }));
      if (f.title || f.text || !f.image) {
        el.append(SC.el("cap", `<div class="no">${SC.pad((i % Math.max(nReal, 1)) + 1)}</div>${f.title ? `<h2>${SC.esc(f.title)}</h2>` : ""}${f.text ? `<p>${SC.esc(f.text)}</p>` : ""}`));
      }
    }
    el.append(SC.el("hl"), SC.el("sh"));
    cube.append(el); return el;
  });

  /* 状态：rx ry 为当前角度，vx vy 为惯性角速度（度/秒） */
  const S = { rx: -18, ry: 28, vx: 0, vy: 0, drag: false, auto: !SC.reduce && nReal > 0, introDone: SC.reduce };
  let active = -1, T = 0;

  /* 光照：按每个面的法线转到视空间后，与光源方向的点积决定明暗 */
  const L = (() => { const v = [-.45, -.7, .55], m = Math.hypot(...v); return v.map((x) => x / m); })();
  function render(intro = 1) {
    const e = SC.ease.out(intro);
    const rx = S.rx, ry = S.ry;
    cube.style.transform = `translateY(${(1 - e) * -6}em) scale(${.86 + .14 * e}) rotateX(${rx}deg) rotateY(${ry}deg)`;
    const cx = Math.cos(rx * RAD), sx = Math.sin(rx * RAD), cyy = Math.cos(ry * RAD), syy = Math.sin(ry * RAD);
    let best = -2, bi = 0;
    SIDES.forEach((s, i) => {
      const [x, y, z] = s.n;
      /* 先绕 Y 再绕 X（与 CSS 书写顺序 rotateX rotateY 一致：外层 X 内层 Y） */
      const x1 = x * cyy + z * syy, z1 = -x * syy + z * cyy;
      const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      const d = x1 * L[0] + y2 * L[1] + z2 * L[2];
      els[i].lastChild.style.opacity = (SC.clamp(.5 - d * .6, 0, .62) * (z2 > 0 ? 1 : 0)).toFixed(3);
      els[i].firstChild && (els[i].children[els[i].children.length - 2].style.opacity = SC.clamp(d, 0, 1) * .12);
      if (z2 > best) { best = z2; bi = i; }
    });
    floor.style.transform = `scaleX(${.9 + Math.abs(Math.sin(ry * RAD * 2)) * .12})`;
    if (bi !== active && nReal) { active = bi; count.innerHTML = `<b>${SC.pad((bi % nReal) + 1)}</b> / ${SC.pad(nReal)}`; }
  }

  /* 指针拖动 */
  let last = null;
  const down = (ev) => { S.drag = true; S.auto = false; S.vx = S.vy = 0; last = [ev.clientX, ev.clientY, performance.now()]; scene.classList.add("drag"); hint.classList.remove("on"); try { scene.setPointerCapture(ev.pointerId); } catch (_) {} };
  const move = (ev) => {
    if (!S.drag || !last) return;
    const now = performance.now(), dt = Math.max(.001, (now - last[2]) / 1000);
    const k = .32 * (1600 / Math.max(300, stage.clientWidth));
    const dy = (ev.clientX - last[0]) * k, dx = -(ev.clientY - last[1]) * k;
    S.ry += dy; S.rx = SC.clamp(S.rx + dx, -85, 85);
    S.vy = SC.clamp(dy / dt, -600, 600) * .6 + S.vy * .4; S.vx = SC.clamp(dx / dt, -600, 600) * .6 + S.vx * .4;
    last = [ev.clientX, ev.clientY, now];
    if (!loopOn) render();
  };
  const up = () => { S.drag = false; last = null; scene.classList.remove("drag"); };
  scene.addEventListener("pointerdown", down);
  scene.addEventListener("pointermove", move);
  scene.addEventListener("pointerup", up);
  scene.addEventListener("pointercancel", up);

  let loopOn = true;
  cleanup = () => { loopOn = false; };

  if (SC.reduce) {
    [glow, floor, head, count].forEach((e) => e && e.classList.add("on"));
    render(1); loopOn = false; return;
  }
  render(0);
  requestAnimationFrame(() => { [glow, floor, head, count].forEach((e) => e && e.classList.add("on")); });

  /* 自动序列：每段 = 停留 + 翻转。序列走完后停在第一面，交给拖动。 */
  const seq = [];
  for (let i = 0; i < nReal; i++) seq.push(i);
  if (nReal > 1) seq.push(0);
  const unwrap = (from, to) => from + ((((to - from + 180) % 360) + 360) % 360 - 180);   // 最短路径
  let seg = 0, segT = 0, from = null, to = null;
  const IN = 1.2;

  await r.raf((dt, t) => {
    T = t;
    const intro = Math.min(1, t / IN);
    if (S.auto) {
      if (t < IN) { /* 开场：保持初始倾斜 */ }
      else {
        if (!to) { /* 第一个目标：正对第 0 面，略带俯视角 */
          from = [S.rx, S.ry]; to = [-14, unwrap(S.ry, 0)]; segT = 0; seg = 0;
        }
        segT += dt * 1000;
        const dur = (seg === 0 ? turn * 1.1 : turn), total = dur + hold;
        const p = SC.clamp(segT / dur, 0, 1), k = SC.ease.inOut(p);
        S.rx = SC.lerp(from[0], to[0], k); S.ry = SC.lerp(from[1], to[1], k);
        if (segT >= total) {
          seg++;
          if (seg >= seq.length) { S.auto = false; S.hintT = 0; hint.classList.add("on"); }
          else {
            const side = SIDES[seq[seg]].to;
            from = [S.rx, S.ry]; to = [side[0] === 0 ? -14 : side[0], unwrap(S.ry, side[1])];
            /* 上、下面不带俯仰偏置；ry 对上下面无意义，保持原值 */
            if (side[0] !== 0) to[1] = S.ry;
            segT = 0;
          }
        }
      }
    } else if (!S.drag) {
      const damp = Math.exp(-dt * 2.4);
      S.vx *= damp; S.vy *= damp;
      S.ry += S.vy * dt; S.rx = SC.clamp(S.rx + S.vx * dt, -85, 85);
    }
    render(intro);
    return true;
  });
});
