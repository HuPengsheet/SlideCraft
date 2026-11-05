/* 3D 标签球：文字标签均匀分布在球面上自转，鼠标靠近加速并倾斜，靠前的更大更亮。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  radius: 0.36,    // 占舞台高度的比例
  speed: 0.35,     // 弧度/秒
  tags: []         // 字符串，或 { text, weight, url }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const num = (v, d) => (v !== null && v !== "" && v !== undefined && Number.isFinite(+v) ? +v : d);
const CAM = 3;     // 相机距离（球半径为 1）

player.play(async (r) => {
  stage.innerHTML = "";
  const raw = (Array.isArray(cfg.tags) ? cfg.tags : [])
    .map((t) => (typeof t === "string" || typeof t === "number" ? { text: String(t) } : t))
    .filter((t) => t && typeof t === "object" && String(t.text ?? "").trim() !== "")
    .slice(0, 80);
  const n = raw.length;
  const hasHead = !!(cfg.eyebrow || cfg.title || cfg.subtitle);

  const canvas = SC.el("sphere", "", "canvas");
  stage.append(canvas);
  let hud = null;
  if (hasHead) {
    hud = SC.el("hud", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}
      ${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}
      ${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}`);
    stage.append(hud);
    requestAnimationFrame(() => hud.classList.add("in"));
  }
  const ctx = canvas.getContext("2d");

  /* 颜色和字体：每次播放从 CSS 变量读取 */
  const probe = document.createElement("canvas").getContext("2d");
  const root = getComputedStyle(document.documentElement);
  const rgb = (name, fb) => {
    probe.fillStyle = "#888"; probe.fillStyle = root.getPropertyValue(name).trim() || fb;
    const m = probe.fillStyle;
    if (m[0] === "#") return [parseInt(m.slice(1, 3), 16), parseInt(m.slice(3, 5), 16), parseInt(m.slice(5, 7), 16)];
    const q = m.match(/[\d.]+/g) || [136, 136, 136]; return [+q[0], +q[1], +q[2]];
  };
  const C = { fg: rgb("--fg", "#eee"), soft: rgb("--fg-soft", "#999"), a1: rgb("--accent", "#e8b84a"), a2: rgb("--accent-2", "#d77757"), a3: rgb("--accent-3", "#6f93c8"), line: rgb("--line", "#444") };
  const col = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const family = root.getPropertyValue("--font-display").trim() || "sans-serif";

  /* 斐波那契球面均匀分布；权重按固定种子打乱后分配，避免大字挤在一处 */
  const rnd = SC.rng(7);
  const order = raw.map((_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const ws = raw.map((t) => Math.max(0, num(t.weight, 1)));
  const wmin = Math.min(...ws), wmax = Math.max(...ws);
  const ga = Math.PI * (3 - Math.sqrt(5));
  const tags = raw.map((t, k) => {
    const i = order[k], y = n === 1 ? 0 : 1 - (i + .5) * 2 / n, rr = Math.sqrt(Math.max(0, 1 - y * y)), th = i * ga;
    const w01 = wmax > wmin ? (ws[k] - wmin) / (wmax - wmin) : .5;
    const text = String(t.text).trim(); const chars = [...text];
    const url = /^https?:\/\//i.test(String(t.url ?? "")) ? String(t.url) : "";
    const accent = [C.a2, C.a3][Math.floor(rnd() * 2)];
    return { text: chars.length > 14 ? chars.slice(0, 13).join("") + "…" : text, url, w01, p: [Math.cos(th) * rr, y, Math.sin(th) * rr],
      color: w01 > .66 ? C.a1 : w01 > .33 ? C.fg : (rnd() < .3 ? accent : C.soft), z: 0, size: 0, rect: null, sx: 0, sy: 0 };
  });
  const avgChars = n ? tags.reduce((s, t) => s + [...t.text].length, 0) / n : 1;

  /* 尺寸 */
  let W = 0, H = 0, dpr = 1, em = 16, cx = 0, cy = 0, R = 0, lastKey = "";
  const fit = () => {
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
    dpr = Math.min(devicePixelRatio || 1, 2);
    const key = w + "x" + h + "@" + dpr;
    if (key === lastKey) return false;
    lastKey = key;
    W = canvas.width = Math.round(w * dpr); H = canvas.height = Math.round(h * dpr);
    em = (parseFloat(getComputedStyle(stage).fontSize) || 16) * dpr;
    cx = W * (hasHead ? .6 : .5); cy = H * .54;
    R = H * SC.clamp(num(cfg.radius, .36), .15, .45);
    return true;
  };
  fit();

  /* 视角：速度驱动的增量旋转 */
  const base = Math.max(0, num(cfg.speed, .35)) * (SC.reduce ? 0 : 1);
  let vx = base, vy = 0, hover = null, mouse = null, T = 0;
  const intro = SC.reduce ? 99 : 0;
  T = intro;

  const toLocal = (e) => { const b = canvas.getBoundingClientRect(); return [(e.clientX - b.left) / b.width * W, (e.clientY - b.top) / b.height * H]; };
  canvas.addEventListener("pointermove", (e) => { mouse = toLocal(e); });
  canvas.addEventListener("pointerleave", () => { mouse = null; hover = null; canvas.style.cursor = ""; });
  canvas.addEventListener("click", (e) => {
    const m = toLocal(e), t = pick(m);
    if (t && t.url) window.open(t.url, "_blank", "noopener");
  });
  function pick(m) {
    let best = null;
    for (const t of tags) {
      const q = t.rect;
      if (q && m[0] >= q[0] && m[0] <= q[0] + q[2] && m[1] >= q[1] && m[1] <= q[1] + q[3] && t.z > -.2 && (!best || t.z > best.z)) best = t;
    }
    return best;
  }

  const rotate = (dt) => {
    const a = vx * dt, b = vy * dt, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
    for (const t of tags) {
      let [x, y, z] = t.p;
      const x1 = x * ca + z * sa, z1 = -x * sa + z * ca;          // 绕 y 轴
      const y2 = y * cb - z1 * sb, z2 = y * sb + z1 * cb;         // 绕 x 轴
      const l = Math.hypot(x1, y2, z2) || 1;
      t.p = [x1 / l, y2 / l, z2 / l];
    }
  };

  const baseFs = n ? Math.sqrt((4 * Math.PI * (R / em) * (R / em) / n) * .32 / (Math.max(1, avgChars) * 1.1)) : 1;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    /* 球体底光和外圈 */
    const g = ctx.createRadialGradient(cx - R * .25, cy - R * .3, R * .1, cx, cy, R * 1.25);
    g.addColorStop(0, col(C.a1, .10)); g.addColorStop(.7, col(C.a1, .03)); g.addColorStop(1, col(C.a1, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, 7); ctx.fill();
    ctx.strokeStyle = col(C.line, .55); ctx.lineWidth = Math.max(1, dpr);
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, 0, 7); ctx.stroke();

    const fmax = em * 2.1;
    for (const [k, t] of tags.entries()) {
      const p = SC.ease.out(SC.clamp((T - .2 - k * .035) / 1.1, 0, 1));
      const rad = R * (.25 + .75 * p);
      const z = t.p[2];
      const s = CAM / (CAM - z);                                   // 透视：前 1.5，后 0.75
      t.z = z; t.sx = cx + t.p[0] * rad * s; t.sy = cy + t.p[1] * rad * s;
      t.size = Math.min(fmax, em * baseFs * (.8 + .6 * t.w01)) * s * (.6 + .4 * p);
      t.alpha = (.22 + .78 * (z + 1) / 2) * p;
    }
    const sorted = tags.slice().sort((a, b) => a.z - b.z);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const t of sorted) {
      if (t.alpha < .01) { t.rect = null; continue; }
      const isH = t === hover;
      ctx.font = `${t.w01 > .5 || isH ? 700 : 500} ${t.size.toFixed(1)}px ${family}`;
      const w = ctx.measureText(t.text).width;
      t.rect = [t.sx - w / 2, t.sy - t.size * .6, w, t.size * 1.2];
      ctx.fillStyle = col(isH ? C.a1 : t.color, isH ? 1 : t.alpha);
      ctx.fillText(t.text, t.sx, t.sy);
      if (isH && t.url) { ctx.fillRect(t.sx - w / 2, t.sy + t.size * .55, w, Math.max(1, dpr)); }
    }
  }

  canvas.__probe = () => tags.map((t) => ({ text: t.text, z: t.z, size: t.size, x: t.p[0] }));   // 测试用
  draw();
  if (!n) return;

  /* 常驻循环：一直画到下一次重播把它中断 */
  await r.raf((dt) => {
    if (fit()) draw();
    if (!SC.reduce) T += dt;
    let tx = base, ty = 0;
    if (mouse) {
      const dx = SC.clamp((mouse[0] - cx) / (R * 1.4), -1, 1), dy = SC.clamp((mouse[1] - cy) / (R * 1.4), -1, 1);
      const near = Math.hypot(dx, dy) < 1.2 ? 1 : .4;
      tx = base + dx * 2.2 * near; ty = -dy * 1.6 * near;
      hover = pick(mouse);
      canvas.style.cursor = hover && hover.url ? "pointer" : "";
      if (hover) { tx *= .35; ty *= .35; }
    }
    const k = Math.min(1, dt * 3);
    vx += (tx - vx) * k; vy += (ty - vy) * k;
    rotate(dt);
    draw();
  });
});
