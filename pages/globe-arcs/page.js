/* 全球连线：正交投影的旋转地球 + 大圆弧线。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  rotateSpeed: 12,   // 度/秒，0 静止
  tilt: 18,          // 度
  startLon: 100,     // 开场正对观众的经度
  pulse: true,
  labels: true,
  cities: [],        // { name, lat, lon, main }
  arcs: []           // { from, to }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const RAD = Math.PI / 180;
const num = (v, d) => (Number.isFinite(+v) && v !== null && v !== "" ? +v : d);

/* 球面上的单位向量 */
const vec = (lat, lon) => { const a = lat * RAD, o = lon * RAD; return [Math.cos(a) * Math.sin(o), Math.sin(a), Math.cos(a) * Math.cos(o)]; };

/* 斐波那契点阵：整个球面均匀的点 */
const FIB = (() => {
  const n = 1500, out = new Float32Array(n * 3), ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i + .5) * 2 / n, rr = Math.sqrt(1 - y * y), th = i * ga;
    out[i * 3] = Math.cos(th) * rr; out[i * 3 + 1] = y; out[i * 3 + 2] = Math.sin(th) * rr;
  }
  return out;
})();

/* 经纬网：每 30 度一条，折线上采样点 */
const GRAT = (() => {
  const lines = [];
  for (let lat = -60; lat <= 60; lat += 30) { const l = []; for (let lon = 0; lon <= 360; lon += 6) l.push(vec(lat, lon)); lines.push(l); }
  for (let lon = 0; lon < 360; lon += 30) { const l = []; for (let lat = -90; lat <= 90; lat += 6) l.push(vec(lat, lon)); lines.push(l); }
  return lines;
})();

/* 大圆插值，t 从 0 到 1，半径沿途抬高 lift（相对球半径） */
function arcPoints(a, b, lift, steps = 56) {
  let d = SC.clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
  const om = Math.acos(d), s = Math.sin(om), pts = [];
  const bb = b;   // s 接近 0（同点或对跖点）时退化成不插值，只抬高
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; let p;
    if (s < 1e-4) p = a.slice();
    else { const k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s; p = [a[0] * k1 + bb[0] * k2, a[1] * k1 + bb[1] * k2, a[2] * k1 + bb[2] * k2]; }
    const h = 1 + lift * Math.sin(Math.PI * t) * Math.min(1, om / 1.2 + .15);
    pts.push([p[0] * h, p[1] * h, p[2] * h]);
  }
  return pts;
}

let cleanup = null;

player.play(async (r) => {
  if (cleanup) cleanup();
  stage.innerHTML = "";

  /* 数据清洗：坏数据直接丢掉，不抛错 */
  const cities = (Array.isArray(cfg.cities) ? cfg.cities : []).filter((c) => c && Number.isFinite(+c.lat) && Number.isFinite(+c.lon) && c.lat !== null && c.lon !== null)
    .map((c) => ({ name: String(c.name ?? ""), lat: SC.clamp(+c.lat, -90, 90), lon: +c.lon, main: !!c.main, v: vec(SC.clamp(+c.lat, -90, 90), +c.lon) }));
  const find = (n) => cities.find((c) => c.name.trim().toLowerCase() === String(n ?? "").trim().toLowerCase());
  const arcs = [];
  for (const a of (Array.isArray(cfg.arcs) ? cfg.arcs : [])) {
    const f = a && find(a.from), t = a && find(a.to);
    if (f && t && f !== t) arcs.push({ f, t, pts: arcPoints(f.v, t.v, .26) });
  }

  const hud = SC.el("hud", `<div class="bar"></div>${cfg.title ? `<h1>${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p>${SC.esc(cfg.subtitle)}</p>` : ""}`);
  const meta = SC.el("meta", `<div><b class="n1">0</b><span>节点</span></div><div><b class="n2">0</b><span>链路</span></div>`);
  const canvas = SC.el("gl", "", "canvas");
  const veil = SC.el("veil");
  stage.append(canvas, veil, hud);
  if (cities.length) stage.append(meta);
  const ctx = canvas.getContext("2d");

  /* 颜色：每次播放从 CSS 变量读取。借一个画布把任意 CSS 颜色归一成 rgb */
  const probe = document.createElement("canvas").getContext("2d");
  const root = getComputedStyle(document.documentElement);
  const rgb = (name, fb) => {
    probe.fillStyle = "#888"; probe.fillStyle = root.getPropertyValue(name).trim() || fb;
    const m = probe.fillStyle;
    if (m[0] === "#") return [parseInt(m.slice(1, 3), 16), parseInt(m.slice(3, 5), 16), parseInt(m.slice(5, 7), 16)];
    const q = m.match(/[\d.]+/g) || [136, 136, 136]; return [+q[0], +q[1], +q[2]];
  };
  const C = { bg: rgb("--bg", "#111"), surface: rgb("--surface", "#222"), fg: rgb("--fg", "#eee"), soft: rgb("--fg-soft", "#999"), a1: rgb("--accent", "#e8b84a"), a2: rgb("--accent-2", "#d77757"), line: rgb("--line", "#444") };
  const col = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const family = root.getPropertyValue("--font-display").trim() || "sans-serif";
  const lightBg = (C.bg[0] * 299 + C.bg[1] * 587 + C.bg[2] * 114) / 1000 > 140;

  /* 尺寸 */
  let W = 0, H = 0, dpr = 1, cx = 0, cy = 0, R = 0, k = 1;
  const fit = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
    W = canvas.width = Math.round(w * dpr); H = canvas.height = Math.round(h * dpr);
    cx = W * .64; cy = H * .53; R = Math.min(H * .34, W * .27); k = W / 1600;
  };
  fit();

  /* 视角状态 */
  const S = { lon: num(cfg.startLon, 100), tilt: num(cfg.tilt, 18), vel: 0, drag: false, t: 0 };
  const auto = num(cfg.rotateSpeed, 12);
  const pulse = cfg.pulse !== false, showLabels = cfg.labels !== false;
  let intro = SC.reduce ? 1 : 0;     // 开场进度 0 到 1
  let T = 0;                         // 播放时间，秒

  const view = (v, cy_, sy_, ct, st) => {
    const x1 = v[0] * cy_ - v[2] * sy_, z1 = v[0] * sy_ + v[2] * cy_;
    return [x1, v[1] * ct - z1 * st, v[1] * st + z1 * ct];
  };

  function draw() {
    const e = SC.ease.out(intro), Rr = R * (.86 + .14 * e);
    const yaw = S.lon * RAD, tl = S.tilt * RAD;
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), ct = Math.cos(tl), st = Math.sin(tl);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round"; ctx.lineJoin = "round";

    /* 外圈光晕 */
    let g = ctx.createRadialGradient(cx, cy, Rr * .9, cx, cy, Rr * 1.55);
    g.addColorStop(0, col(C.a1, lightBg ? .22 : .28)); g.addColorStop(.35, col(C.a1, .07)); g.addColorStop(1, col(C.a1, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, Rr * 1.55, 0, 7); ctx.fill();

    /* 球体 */
    g = ctx.createRadialGradient(cx - Rr * .35, cy - Rr * .4, Rr * .1, cx, cy, Rr);
    g.addColorStop(0, col(mix(C.surface, C.fg, lightBg ? 0 : .06), 1)); g.addColorStop(1, col(mix(C.bg, C.surface, .5), 1));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, Rr, 0, 7); ctx.fill();

    /* 经纬网 */
    ctx.strokeStyle = col(C.soft, lightBg ? .3 : .26); ctx.lineWidth = Math.max(1, k * 1.1 * dpr);
    ctx.beginPath();
    for (const line of GRAT) {
      let pen = false;
      for (const v of line) {
        const p = view(v, cyw, syw, ct, st);
        if (p[2] < 0) { pen = false; continue; }
        const x = cx + p[0] * Rr, y = cy - p[1] * Rr;
        if (pen) ctx.lineTo(x, y); else { ctx.moveTo(x, y); pen = true; }
      }
    }
    ctx.stroke();

    /* 点阵：按深度分 4 档透明度 */
    const dotCol = lightBg ? C.fg : mix(C.fg, C.a1, .25);
    for (let b = 0; b < 4; b++) {
      ctx.fillStyle = col(dotCol, (.18 + b * .17) * (lightBg ? .9 : 1));
      const lo = b / 4, hi = (b + 1) / 4, rad = (.9 + b * .35) * k * dpr;
      ctx.beginPath();
      for (let i = 0; i < FIB.length; i += 3) {
        const p = view([FIB[i], FIB[i + 1], FIB[i + 2]], cyw, syw, ct, st);
        if (p[2] <= lo || p[2] > hi) continue;
        const x = cx + p[0] * Rr, y = cy - p[1] * Rr;
        ctx.moveTo(x + rad, y); ctx.arc(x, y, rad, 0, 7);
      }
      ctx.fill();
    }

    /* 大气层：边缘更亮 */
    g = ctx.createRadialGradient(cx, cy, Rr * .78, cx, cy, Rr * 1.06);
    g.addColorStop(0, col(C.a1, 0)); g.addColorStop(.72, col(C.a1, lightBg ? .12 : .16)); g.addColorStop(.93, col(C.a1, .55)); g.addColorStop(1, col(C.a1, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, Rr * 1.06, 0, 7); ctx.fill();
    ctx.strokeStyle = col(C.a1, .65); ctx.lineWidth = Math.max(1, 1.4 * k * dpr);
    ctx.beginPath(); ctx.arc(cx, cy, Rr, 0, 7); ctx.stroke();

    /* 弧线 */
    const lw = Math.max(1, 1.8 * k * dpr);
    arcs.forEach((a, ai) => {
      const t0 = 1.0 + ai * .45, dur = 1.9;
      const p = SC.clamp((T - t0) / dur, 0, 1);
      if (SC.reduce ? false : p <= 0) return;
      const prog = SC.reduce ? 1 : SC.ease.inOut(p), n = a.pts.length - 1;
      let head = prog * n;
      if (p >= 1 && pulse && !SC.reduce) head = (((T - t0 - dur) * .35 + ai * .17) % 1.6) / 1.6 * (n + 14);
      const pr = a.pts.map((v) => { const q = view(v, cyw, syw, ct, st); return [cx + q[0] * Rr, cy - q[1] * Rr, q[2], q[0] * q[0] + q[1] * q[1]]; });
      const vis = (q) => q[2] > 0 || q[3] > 1.0;           // 正面，或位于轮廓之外（抬高部分）
      const drawn = p >= 1 ? n : head;
      for (let i = 0; i < n && i < drawn; i++) {
        const A = pr[i], B = pr[i + 1];
        if (!vis(A) || !vis(B)) continue;
        const d = Math.abs(i + .5 - head), near = SC.clamp(1 - d / 12, 0, 1);
        const base = p >= 1 ? .3 : .5;
        ctx.strokeStyle = col(mix(C.a1, C.fg, near * .7), base + near * .6);
        ctx.lineWidth = lw * (1 + near * 1.1);
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
      }
      if (p > 0 && (p < 1 || pulse) && !SC.reduce) {
        const i = Math.min(n - 1, Math.max(0, Math.floor(head))), f = head - i;
        if (head <= n && head >= 0) {
          const A = pr[i], B = pr[i + 1];
          if (vis(A) && vis(B)) {
            const x = SC.lerp(A[0], B[0], f), y = SC.lerp(A[1], B[1], f), rr = 9 * k * dpr;
            const gg = ctx.createRadialGradient(x, y, 0, x, y, rr);
            gg.addColorStop(0, col(C.fg, 1)); gg.addColorStop(.3, col(C.a1, .8)); gg.addColorStop(1, col(C.a1, 0));
            ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
          }
        }
      }
    });

    /* 城市 */
    const cand = [];
    cities.forEach((c, i) => {
      const p = view(c.v, cyw, syw, ct, st);
      if (p[2] <= 0.02) return;
      const pop = SC.reduce ? 1 : SC.ease.out(SC.clamp((T - .6 - i * .12) / .6, 0, 1));
      if (pop <= 0) return;
      const x = cx + p[0] * Rr, y = cy - p[1] * Rr, col1 = c.main ? C.a2 : C.a1;
      const fade = SC.clamp(p[2] * 4, 0, 1), s = (c.main ? 5.2 : 3.6) * k * dpr * pop;
      if (pulse && !SC.reduce) {
        for (let j = 0; j < 2; j++) {
          const ph = ((T * .55 + i * .31 + j * .5) % 1);
          const rx = (4 + ph * 22) * k * dpr * (c.main ? 1.3 : 1), ry = rx * Math.max(.18, p[2]);
          ctx.strokeStyle = col(col1, (1 - ph) * .7 * fade * pop);
          ctx.lineWidth = Math.max(1, 1.4 * k * dpr);
          ctx.beginPath(); ctx.ellipse(x, y, rx, ry, Math.atan2(-p[1], p[0]) + Math.PI / 2, 0, 7); ctx.stroke();
        }
      }
      const gg = ctx.createRadialGradient(x, y, 0, x, y, s * 3);
      gg.addColorStop(0, col(col1, .6 * fade)); gg.addColorStop(1, col(col1, 0));
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, s * 3, 0, 7); ctx.fill();
      ctx.fillStyle = col(col1, fade); ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
      ctx.fillStyle = col(C.bg, .85 * fade); ctx.beginPath(); ctx.arc(x, y, s * .38, 0, 7); ctx.fill();
      if (showLabels && c.name && pop > .9) cand.push({ c, x, y, z: p[2], s });
    });

    /* 标签：主城市优先，再按朝向；不压rim、不互相重叠 */
    if (cand.length) {
      cand.sort((a, b) => (b.c.main - a.c.main) || (b.z - a.z));
      const fs = Math.round(15 * k * dpr);
      ctx.font = `600 ${fs}px ${family}`; ctx.textBaseline = "middle";
      const placed = [];
      for (const q of cand) {
        if (q.z < .22) continue;
        const w = ctx.measureText(q.c.name).width, h = fs * 1.3, gap = q.s + 6 * k * dpr;
        for (const side of [1, -1]) {
          const x0 = side > 0 ? q.x + gap : q.x - gap - w, y0 = q.y - h / 2;
          const inside = [[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h]].every(([px, py]) => Math.hypot(px - cx, py - cy) < Rr * .97);
          if (!inside) continue;
          if (placed.some((b) => x0 < b[2] + 4 && x0 + w > b[0] - 4 && y0 < b[3] + 2 && y0 + h > b[1] - 2)) continue;
          placed.push([x0, y0, x0 + w, y0 + h]);
          ctx.textAlign = side > 0 ? "left" : "right";
          const al = SC.clamp((q.z - .22) * 3, 0, 1);
          ctx.lineWidth = 4 * k * dpr; ctx.strokeStyle = col(C.bg, .8 * al); ctx.strokeText(q.c.name, side > 0 ? x0 : x0 + w, q.y);
          ctx.fillStyle = col(q.c.main ? C.a2 : C.fg, al); ctx.fillText(q.c.name, side > 0 ? x0 : x0 + w, q.y);
          break;
        }
      }
    }
  }

  /* 指针拖动 */
  let last = null;
  const down = (ev) => { S.drag = true; S.vel = 0; last = [ev.clientX, ev.clientY, performance.now()]; canvas.classList.add("drag"); try { canvas.setPointerCapture(ev.pointerId); } catch (_) {} };
  const move = (ev) => {
    if (!S.drag || !last) return;
    const rect = canvas.getBoundingClientRect(), pxR = Math.max(1, (R / dpr) * (rect.width / (W / dpr)));
    const now = performance.now(), dx = ev.clientX - last[0], dy = ev.clientY - last[1], dt = Math.max(.001, (now - last[2]) / 1000);
    const dl = -dx / pxR / RAD;   // 向右拖，地表向右走，正对观众的经度减小
    S.lon += dl; S.tilt = SC.clamp(S.tilt + dy / pxR / RAD * .6, -55, 75);
    S.vel = SC.clamp(dl / dt, -240, 240) * .6 + S.vel * .4;
    last = [ev.clientX, ev.clientY, now];
    if (!live) draw();
  };
  const up = () => { S.drag = false; last = null; canvas.classList.remove("drag"); };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  let live = true;
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => { fit(); draw(); }) : null;
  if (ro) ro.observe(stage);
  cleanup = () => { live = false; if (ro) ro.disconnect(); };

  /* HUD 入场 */
  const n1 = SC.$(".n1", meta), n2 = SC.$(".n2", meta);
  n1.textContent = cities.length; n2.textContent = arcs.length;
  draw();
  if (SC.reduce) {
    canvas.classList.add("on"); hud.classList.add("on"); meta.classList.add("on");
    live = false; return;
  }
  requestAnimationFrame(() => { canvas.classList.add("on"); hud.classList.add("on"); meta.classList.add("on"); });
  r.spawn(SC.countUp(r, n1, cities.length, { dur: 1400 }));
  r.spawn(SC.countUp(r, n2, arcs.length, { dur: 1400 }));

  /* 单一动画循环：开场旋入 → 自转 + 惯性。只在被重播取代时结束 */
  await r.raf((dt, t) => {
    T = t; intro = Math.min(1, t / 1.6);
    if (!S.drag) {
      S.vel *= Math.exp(-dt * 2.2);
      S.lon += (-auto + S.vel) * dt;
    }
    draw();
    return true;
  });
});
