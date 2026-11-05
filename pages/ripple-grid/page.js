/* 波纹点阵：canvas 圆点阵列，多个圆形波叠加。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  gridSize: 64,
  origin: "center",
  speed: 0.35,
  autoPulse: 1600
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const num = (v, d) => (v !== null && v !== "" && Number.isFinite(+v) ? +v : d);
let cleanup = null;

player.play(async (r) => {
  if (cleanup) cleanup();
  stage.innerHTML = "";

  const cols = Math.round(SC.clamp(num(cfg.gridSize, 64), 12, 120));
  const speed = Math.max(0.02, num(cfg.speed, 0.35));
  const autoMs = Math.max(0, num(cfg.autoPulse, 1600));
  const o = cfg.origin;
  const followMouse = o === "mouse";
  const fixed = o && typeof o === "object" ? [SC.clamp(num(o.x, .5), 0, 1), SC.clamp(num(o.y, .5), 0, 1)] : [.5, .5];

  const canvas = SC.el("rg", "", "canvas");
  const veil = SC.el("veil");
  const copy = SC.el("copy", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1>${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p>${SC.esc(cfg.subtitle)}</p>` : ""}`);
  stage.append(canvas, veil);
  if (cfg.title || cfg.eyebrow || cfg.subtitle) stage.append(copy);
  const ctx = canvas.getContext("2d");
  canvas.dataset.pulses = "0";

  const probe = document.createElement("canvas").getContext("2d");
  const root = getComputedStyle(document.documentElement);
  const rgb = (name, fb) => {
    probe.fillStyle = "#888"; probe.fillStyle = root.getPropertyValue(name).trim() || fb;
    const m = probe.fillStyle;
    if (m[0] === "#") return [parseInt(m.slice(1, 3), 16), parseInt(m.slice(3, 5), 16), parseInt(m.slice(5, 7), 16)];
    const q = m.match(/[\d.]+/g) || [136, 136, 136]; return [+q[0], +q[1], +q[2]];
  };
  const C = { bg: rgb("--bg", "#111"), soft: rgb("--fg-soft", "#999"), line: rgb("--line", "#444"), a1: rgb("--accent", "#e8b84a"), a2: rgb("--accent-2", "#d77757"), a3: rgb("--accent-3", "#6f93c8") };
  const col = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const lightBg = (C.bg[0] * 299 + C.bg[1] * 587 + C.bg[2] * 114) / 1000 > 140;
  const rest = mix(C.bg, C.soft, lightBg ? .55 : .5);
  /* 能量 0 到 1 的色带：静止灰 → accent-3 → accent → accent-2 */
  const NB = 10;
  const ramp = Array.from({ length: NB + 1 }, (_, i) => { const t = i / NB; return t < .4 ? mix(rest, C.a3, t / .4) : t < .75 ? mix(C.a3, C.a1, (t - .4) / .35) : mix(C.a1, C.a2, (t - .75) / .25); });
  const fills = ramp.map((c) => col(c, 1));

  let W = 1, H = 1, dpr = 1, rows = 1, gap = 1, ox = 0, oy = 0, xs = [], ys = [];
  const fit = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
    W = canvas.width = Math.round(w * dpr); H = canvas.height = Math.round(h * dpr);
    /* 点数按舞台面积自适应：间距由列数决定，总数上限 6000 */
    let c = cols; gap = W / c; rows = Math.max(1, Math.ceil(H / gap));
    while (c * rows > 6000) { c--; gap = W / c; rows = Math.max(1, Math.ceil(H / gap)); }
    ox = (W - (c - 1) * gap) / 2; oy = (H - (rows - 1) * gap) / 2;
    xs = Array.from({ length: c }, (_, i) => ox + i * gap); ys = Array.from({ length: rows }, (_, j) => oy + j * gap);
  };
  fit();

  const pulses = []; let T = 0, made = 0, mouse = [.5, .5];
  const emit = (fx, fy) => {
    pulses.push({ x: fx * W, y: fy * H, t0: T }); made++;
    canvas.dataset.pulses = String(made);
    if (pulses.length > 10) pulses.shift();
  };

  const bucketPaths = Array.from({ length: NB + 1 }, () => []);
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const base = Math.max(.9, gap * .1), unit = speed * W;
    const act = [];
    for (const p of pulses) {
      const age = T - p.t0, rad = age * unit, life = Math.max(W, H) * 1.1 / unit;
      if (age < 0 || age > life) continue;
      act.push([p.x, p.y, rad, gap * 2.6, 1 - age / life]);
    }
    for (const b of bucketPaths) b.length = 0;
    for (let j = 0; j < ys.length; j++) {
      const y = ys[j];
      for (let i = 0; i < xs.length; i++) {
        const x = xs[i]; let e = 0;
        for (const a of act) {
          const d = Math.hypot(x - a[0], y - a[1]) - a[2], u = d / a[3];
          if (u > -3 && u < 2.2) e += Math.exp(-u * u) * a[4] * (u < 0 ? 1 : 1);   // 前沿陡，后缘拖尾
        }
        if (e > 1) e = 1;
        const bi = Math.round(e * NB);
        bucketPaths[bi].push(x, y, base * (1 + e * 3.2) * (0.9 + 0.1 * e));
      }
    }
    for (let b = 0; b <= NB; b++) {
      const arr = bucketPaths[b]; if (!arr.length) continue;
      ctx.fillStyle = fills[b]; ctx.beginPath();
      for (let k = 0; k < arr.length; k += 3) { ctx.moveTo(arr[k] + arr[k + 2], arr[k + 1]); ctx.arc(arr[k], arr[k + 1], arr[k + 2], 0, 7); }
      ctx.fill();
    }
  }

  /* 指针 */
  const toFrac = (ev) => { const rc = canvas.getBoundingClientRect(); return [SC.clamp((ev.clientX - rc.left) / Math.max(1, rc.width), 0, 1), SC.clamp((ev.clientY - rc.top) / Math.max(1, rc.height), 0, 1)]; };
  const onMove = (ev) => { mouse = toFrac(ev); };
  const onDown = (ev) => { const [fx, fy] = toFrac(ev); mouse = [fx, fy]; emit(fx, fy); if (!live) draw(); };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);

  let live = true;
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => { fit(); draw(); }) : null;
  if (ro) ro.observe(stage);
  cleanup = () => { live = false; if (ro) ro.disconnect(); };

  const origin = () => (followMouse ? mouse : fixed);

  if (SC.reduce) {
    /* 静态帧：一个已扩散到一半的波 */
    const [fx, fy] = origin(); T = .9 / speed * .5; pulses.push({ x: fx * W, y: fy * H, t0: 0 }); made++;
    canvas.dataset.pulses = String(made);
    draw(); canvas.classList.add("on"); copy.classList.add("on"); live = false; return;
  }
  draw();
  requestAnimationFrame(() => { canvas.classList.add("on"); copy.classList.add("on"); });
  let nextAuto = 0.5;

  await r.raf((dt, t) => {
    T = t;
    if (autoMs > 0 && T >= nextAuto) { const [fx, fy] = origin(); emit(fx, fy); nextAuto = T + autoMs / 1000; }
    draw();
    return true;
  });
});
