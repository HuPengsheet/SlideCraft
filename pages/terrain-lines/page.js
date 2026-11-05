/* 山脉线条：逐行折线 + 噪声高度，背景色填充实现遮挡。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  lines: 38,
  amplitude: 1,
  speed: 1.2,
  seed: 11
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const num = (v, d) => (v !== null && v !== "" && Number.isFinite(+v) ? +v : d);
let cleanup = null;

/* 带种子的二维 value noise */
function makeNoise(seed) {
  const hash = (x, y) => { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 1442695041); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const sm = (t) => t * t * (3 - 2 * t);
  const n2 = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = sm(x - xi), fy = sm(y - yi);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
  return (x, y) => (n2(x, y) * .56 + n2(x * 2.1 + 17, y * 2.1 + 5) * .30 + n2(x * 4.3 + 3, y * 4.3 + 41) * .14);
}

player.play(async (r) => {
  if (cleanup) cleanup();
  stage.innerHTML = "";

  const N = Math.round(SC.clamp(num(cfg.lines, 38), 8, 80));
  const amp = SC.clamp(num(cfg.amplitude, 1), 0, 3);
  const speed = num(cfg.speed, 1.2);
  const seed = Math.round(num(cfg.seed, 11));
  const noise = makeNoise(seed);

  const canvas = SC.el("tl", "", "canvas");
  const copy = SC.el("copy", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1>${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p>${SC.esc(cfg.subtitle)}</p>` : ""}`);
  stage.append(canvas);
  if (cfg.title || cfg.eyebrow || cfg.subtitle) stage.append(copy);
  const ctx = canvas.getContext("2d");

  const probe = document.createElement("canvas").getContext("2d");
  const root = getComputedStyle(document.documentElement);
  const rgb = (name, fb) => {
    probe.fillStyle = "#888"; probe.fillStyle = root.getPropertyValue(name).trim() || fb;
    const m = probe.fillStyle;
    if (m[0] === "#") return [parseInt(m.slice(1, 3), 16), parseInt(m.slice(3, 5), 16), parseInt(m.slice(5, 7), 16)];
    const q = m.match(/[\d.]+/g) || [136, 136, 136]; return [+q[0], +q[1], +q[2]];
  };
  const C = { bg: rgb("--bg", "#111"), fg: rgb("--fg", "#eee"), a1: rgb("--accent", "#e8b84a"), a2: rgb("--accent-2", "#d77757"), a3: rgb("--accent-3", "#6f93c8") };
  const col = (c, a = 1) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const bgFill = col(C.bg);

  let W = 1, H = 1, dpr = 1;
  const fit = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.width = Math.max(1, Math.round(stage.clientWidth * dpr)); H = canvas.height = Math.max(1, Math.round(stage.clientHeight * dpr));
  };
  fit();

  const PTS = 110;
  let scroll = 0;
  canvas.dataset.order = "";
  function draw() {
    ctx.fillStyle = bgFill; ctx.fillRect(0, 0, W, H);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    const fl = Math.floor(scroll), f = scroll - fl;
    const k = W / 1600;
    const ys = [];
    /* i 从 0（最远）到 N（最近）：先画远处，近处的填充遮住它 */
    for (let i = 0; i <= N; i++) {
      const u = (i + f) / N;                         // 0 远，1 近
      const per = Math.pow(u, 1.7);
      const baseY = H * (.30 + .64 * per);
      const half = W * (.26 + .30 * u);
      const x0 = W / 2 - half, x1 = W / 2 + half;
      const zw = i - fl;                             // 世界行号：整数，随滚动整体后移
      const peak = amp * H * (.10 + .20 * u);
      ctx.beginPath();
      for (let p = 0; p <= PTS; p++) {
        const s = p / PTS, x = x0 + (x1 - x0) * s, c = (s - .5) * 2;
        const env = Math.exp(-c * c * 3.2);          // 中间高，两侧压低
        const n = noise(s * 5.2 + 40, zw * .33);
        const hh = Math.max(0, (n - .22)) * 1.7 * env * peak;
        const y = baseY - hh;
        if (p === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      if (i === 0 || true) ys.push(baseY);
      /* 填充：沿折线下方封闭到画面底部 */
      ctx.lineTo(x1, H + 4); ctx.lineTo(x0, H + 4); ctx.closePath();
      ctx.fillStyle = bgFill; ctx.fill();
      const fade = SC.clamp(u * 1.3, 0, 1) * SC.clamp((1 - u) * 14 + .2, 0, 1) ;
      const hue = u < .5 ? mix(C.a3, C.a1, u * 2) : mix(C.a1, C.a2, (u - .5) * 2);
      const lc = mix(C.bg, mix(hue, C.fg, u * .5), SC.clamp(.12 + u * .88, 0, 1) * Math.min(1, (u + .08) * 6));
      ctx.strokeStyle = col(lc);
      ctx.lineWidth = Math.max(1, (1 + u * 1.7) * k * dpr);
      ctx.stroke();
    }
    canvas.dataset.order = ys.map((y) => Math.round(y)).join(",");
  }

  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => { fit(); draw(); }) : null;
  if (ro) ro.observe(stage);
  cleanup = () => { if (ro) ro.disconnect(); };

  draw();
  if (SC.reduce) { canvas.classList.add("on"); copy.classList.add("on"); return; }
  requestAnimationFrame(() => { canvas.classList.add("on"); copy.classList.add("on"); });

  await r.raf((dt, t) => { scroll = t * speed; draw(); return true; });
});
