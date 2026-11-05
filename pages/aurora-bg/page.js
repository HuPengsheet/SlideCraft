/* 极光背景：低分辨率 canvas 上画漂移的渐变色块，放大后天然柔和。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  blobs: 5,
  speed: 1,
  blur: 1,
  grain: 0.14,
  seed: 7
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const num = (v, d) => (v !== null && v !== "" && Number.isFinite(+v) ? +v : d);
let cleanup = null;

/* 噪点贴图：固定种子，只生成一次，作为静态 CSS 背景，所以不会闪 */
function grainURL(seed) {
  const n = 128, c = document.createElement("canvas"); c.width = c.height = n;
  const g = c.getContext("2d"), img = g.createImageData(n, n), rnd = SC.rng(seed);
  for (let i = 0; i < n * n; i++) { const v = (rnd() * 255) | 0; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
}

player.play(async (r) => {
  if (cleanup) cleanup();
  stage.innerHTML = "";

  const nBlobs = Math.round(SC.clamp(num(cfg.blobs, 5), 2, 9));
  const speed = Math.max(0, num(cfg.speed, 1));
  const soft = SC.clamp(num(cfg.blur, 1), .5, 2);
  const grain = SC.clamp(num(cfg.grain, .14), 0, .5);
  const seed = Math.round(num(cfg.seed, 7));

  const canvas = SC.el("au", "", "canvas");
  const grainEl = SC.el("grain");
  const veil = SC.el("veil");
  const copy = SC.el("copy", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1>${SC.esc(cfg.title)}</h1>` : ""}${cfg.title && cfg.subtitle ? `<div class="rule"></div>` : ""}${cfg.subtitle ? `<p>${SC.esc(cfg.subtitle)}</p>` : ""}`);
  stage.append(canvas, veil, grainEl, copy);
  if (grain > 0) { grainEl.style.backgroundImage = `url(${grainURL(seed + 99)})`; grainEl.style.opacity = grain * 2.2; } else grainEl.remove();
  const ctx = canvas.getContext("2d");

  /* 颜色：每次播放从 CSS 变量读取 */
  const probe = document.createElement("canvas").getContext("2d");
  const root = getComputedStyle(document.documentElement);
  const rgb = (name, fb) => {
    probe.fillStyle = "#888"; probe.fillStyle = root.getPropertyValue(name).trim() || fb;
    const m = probe.fillStyle;
    if (m[0] === "#") return [parseInt(m.slice(1, 3), 16), parseInt(m.slice(3, 5), 16), parseInt(m.slice(5, 7), 16)];
    const q = m.match(/[\d.]+/g) || [136, 136, 136]; return [+q[0], +q[1], +q[2]];
  };
  const C = { bg: rgb("--bg", "#111"), a: [rgb("--accent", "#e8b84a"), rgb("--accent-2", "#d77757"), rgb("--accent-3", "#6f93c8")] };
  const col = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const lightBg = (C.bg[0] * 299 + C.bg[1] * 587 + C.bg[2] * 114) / 1000 > 140;

  /* 色块：位置、轨道、相位全部由种子决定 */
  const rnd = SC.rng(seed);
  const blobs = Array.from({ length: nBlobs }, (_, i) => ({
    c: C.a[i % 3],
    x: .12 + rnd() * .76, y: .15 + rnd() * .7,
    ax: .12 + rnd() * .2, ay: .1 + rnd() * .18,
    fx: .05 + rnd() * .07, fy: .04 + rnd() * .07,
    px: rnd() * 6.283, py: rnd() * 6.283,
    rad: (.26 + rnd() * .2) * (.9 + soft * .25),
    stretch: 1.2 + rnd() * .9,
    tilt: (rnd() - .5) * .9,
    al: (lightBg ? .62 : .7) * (.75 + rnd() * .35)
  }));

  let W = 1, H = 1;
  const fit = () => {
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight), s = 220 / Math.max(w, 1);   // 约 220 像素宽，放大后即模糊
    W = canvas.width = Math.max(48, Math.round(w * Math.min(s, 1))); H = canvas.height = Math.max(27, Math.round(h * Math.min(s, 1)));
  };
  fit();

  function draw(T) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = col(C.bg, 1); ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = lightBg ? "source-over" : "screen";
    for (const b of blobs) {
      const x = (b.x + Math.sin(T * b.fx * 6.283 + b.px) * b.ax) * W;
      const y = (b.y + Math.cos(T * b.fy * 6.283 + b.py) * b.ay) * H;
      const rad = b.rad * W * (1 + .12 * Math.sin(T * b.fx * 9 + b.py));
      ctx.setTransform(b.stretch, b.tilt, 0, 1, x, y);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
      g.addColorStop(0, col(b.c, b.al)); g.addColorStop(.35 + .15 * soft * .5, col(b.c, b.al * .45)); g.addColorStop(1, col(b.c, 0));
      ctx.fillStyle = g; ctx.fillRect(-rad, -rad, rad * 2, rad * 2);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  let T = 0;
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => { fit(); draw(T); }) : null;
  if (ro) ro.observe(stage);
  cleanup = () => { if (ro) ro.disconnect(); };

  draw(0);
  if (SC.reduce) { canvas.classList.add("on"); copy.classList.add("on"); return; }
  requestAnimationFrame(() => { canvas.classList.add("on"); copy.classList.add("on"); });

  /* 单一动画循环，只在被重播取代时结束 */
  await r.raf((dt, t) => { T = t * speed; draw(T); return true; });
});
