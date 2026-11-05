/* 粒子成字：离屏 canvas 取点，粒子飞向目标，鼠标排斥。配置见 config.js。 */
const DEFAULTS = { theme: "dark", text: "SlideCraft", caption: "", particleCount: 0, size: 14, scatter: 9, seed: 7 };
const { cfg, player, stage } = SC.init(DEFAULTS);

const prog = (t, a, b) => SC.clamp((t - a) / (b - a), 0, 1);
const mouse = { x: -1e5, y: -1e5, on: false, burst: 0 };   // 画布像素坐标，只绑一次
let toCanvas = null;
const setMouse = (e) => {
  const c = SC.$("canvas", stage); if (!c) return;
  const b = c.getBoundingClientRect();
  mouse.x = (e.clientX - b.left) / b.width * c.width; mouse.y = (e.clientY - b.top) / b.height * c.height; mouse.on = true;
};
stage.addEventListener("pointermove", setMouse);
stage.addEventListener("pointerdown", (e) => { setMouse(e); mouse.burst = 1; });
stage.addEventListener("pointerleave", () => { mouse.on = false; mouse.x = mouse.y = -1e5; });

player.play(async (r) => {
  stage.innerHTML = "";
  mouse.burst = 0;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const cv = document.createElement("canvas");
  const W = cv.width = Math.max(2, Math.round(stage.clientWidth * dpr));
  const H = cv.height = Math.max(2, Math.round(stage.clientHeight * dpr));
  stage.append(cv);
  const cap = String(cfg.caption || "").trim();
  const capEl = SC.el("cap", SC.esc(cap)); if (cap) stage.append(capEl);
  const hint = SC.el("hint", ""); stage.append(hint);
  const g = cv.getContext("2d");
  const cs = getComputedStyle(stage);
  const v = (n) => cs.getPropertyValue(n).trim() || "#fff";
  const cols = [v("--fg"), v("--accent"), v("--accent-2")];
  const em = stage.clientWidth * 0.016 * dpr;

  /* 1. 离屏绘制文字，读像素 */
  const lines = String(cfg.text ?? "").split("\n").filter((l, i, a) => l.length || a.length === 1);
  if (!lines.length || !lines.join("").trim()) lines.splice(0, lines.length, "SlideCraft");
  const off = document.createElement("canvas"); off.width = W; off.height = H;
  const o = off.getContext("2d", { willReadFrequently: true });
  const fam = cs.getPropertyValue("--font-display").trim() || "sans-serif";
  let fs = SC.clamp(+cfg.size || 14, 3, 40) * em;
  const font = (s) => `800 ${s}px ${fam}`;
  o.font = font(fs);
  const wmax = Math.max(...lines.map((l) => o.measureText(l).width), 1);
  fs = Math.min(fs, fs * (W * 0.86) / wmax, (H * 0.6) / (lines.length * 1.15));
  o.font = font(fs); o.textAlign = "center"; o.textBaseline = "middle"; o.fillStyle = "#fff";
  const lh = fs * 1.15, y0 = H * 0.46 - (lines.length - 1) * lh / 2;
  lines.forEach((l, i) => o.fillText(l, W / 2, y0 + i * lh));
  const data = o.getImageData(0, 0, W, H).data;
  let filled = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 128) filled++;
  const area = stage.clientWidth * stage.clientHeight;
  const cap0 = +cfg.particleCount > 0 ? +cfg.particleCount : SC.clamp(area / 260, 1500, 4500);
  const count = Math.min(cap0, 8000);
  const step = Math.max(1, Math.round(Math.sqrt(filled / Math.max(count, 1))));
  const pts = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 128) pts.push([x + (step > 1 ? 0 : 0), y]);
  const rnd = SC.rng(+cfg.seed || 7);
  /* 洗牌，让释放顺序随机 */
  for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
  const scatter = Math.max(0, +cfg.scatter >= 0 ? +cfg.scatter : 9) * em;
  const n = pts.length;
  const px = new Float32Array(n), py = new Float32Array(n), vx = new Float32Array(n), vy = new Float32Array(n);
  const tx = new Float32Array(n), ty = new Float32Array(n), dl = new Float32Array(n), sz = new Float32Array(n), cl = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    tx[i] = pts[i][0]; ty[i] = pts[i][1];
    const a = rnd() * Math.PI * 2, d = (.5 + rnd() * .6) * Math.max(W, H);
    px[i] = W / 2 + Math.cos(a) * d; py[i] = H / 2 + Math.sin(a) * d;
    dl[i] = rnd() * 0.9; sz[i] = (.7 + rnd() * .7) * Math.max(1, step * .55) * (dpr > 1 ? 1 : 1.1);
    const k = rnd(); cl[i] = k < .72 ? 0 : k < .9 ? 1 : 2;
  }
  const draw = () => {
    g.clearRect(0, 0, W, H);
    for (let c = 0; c < 3; c++) {
      g.fillStyle = cols[c]; g.beginPath();
      for (let i = 0; i < n; i++) if (cl[i] === c) { const s = sz[i]; g.rect(px[i] - s / 2, py[i] - s / 2, s, s); }
      g.fill();
    }
  };
  const settle = () => { for (let i = 0; i < n; i++) { px[i] = tx[i]; py[i] = ty[i]; } draw(); };
  hint.textContent = scatter > 0 ? "" : ""; hint.remove();
  if (SC.reduce) { settle(); capEl.classList.add("on"); }

  /* 2. 物理：弹簧回位 + 鼠标排斥。组装阶段 await，之后保持同一个循环交互 */
  const loop = (t0) => (dt, t) => {
    const k = 60, damp = Math.pow(.0009, dt);
    const R = scatter, R2 = R * R;
    if (mouse.burst) { mouse.burst = 0; for (let i = 0; i < n; i++) { const a = rnd() * 6.283, s = (4 + rnd() * 10) * em; vx[i] += Math.cos(a) * s * 8; vy[i] += Math.sin(a) * s * 8; } }
    for (let i = 0; i < n; i++) {
      if (t < dl[i]) continue;
      let ax = (tx[i] - px[i]) * k, ay = (ty[i] - py[i]) * k;
      if (R > 0 && mouse.on) {
        const dx = px[i] - mouse.x, dy = py[i] - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > .01) { const d = Math.sqrt(d2), f = (1 - d / R) * 90 * em; ax += dx / d * f * 14; ay += dy / d * f * 14; }
      }
      vx[i] = (vx[i] + ax * dt) * damp; vy[i] = (vy[i] + ay * dt) * damp;
      px[i] += vx[i] * dt; py[i] += vy[i] * dt;
    }
    draw();
  };
  if (SC.reduce) {
    if (scatter > 0) r.spawn(r.raf(() => { /* 只在被打散时重画 */ if (mouse.on || mouse.burst) loop()(1 / 60, 9); }));
    return;
  }
  draw();
  const step1 = loop();
  await r.raf((dt, t) => { step1(Math.min(dt, 1 / 30), t); if (t > 1.4) capEl.classList.add("on"); return t < 3; });
  capEl.classList.add("on");
  if (scatter > 0) {
    /* 停留后保持交互；重播时 epoch 变化会让这个循环自行结束 */
    r.spawn(r.raf((dt) => { step1(Math.min(dt, 1 / 30), 99); }));
  }
});
