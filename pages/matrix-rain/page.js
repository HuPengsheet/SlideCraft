/* 字符雨：canvas 多列下落，头部亮，尾部渐暗。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "字符雨",
  charset: "code",
  density: 0.7,
  speed: 1,
  size: 1.1,
  seed: 11,
  mode: "avoid",
  eyebrow: "",
  subtitle: ""
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const SETS = {
  digits: "0123456789",
  binary: "01",
  code: "0123456789ABCDEF<>{}[]()=+-*/;:#$%&|^~?",
  hanzi: "数据流光云端智能网络算法代码系统信息模型计算存储安全节点链路矩阵深度学习感知",
  katakana: "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789"
};
const chars = (() => {
  const raw = String(cfg.charset ?? "");
  const s = SETS[raw] || raw.replace(/\s/g, "");
  return [...(s || SETS.code)].slice(0, 400);
})();
const wide = chars.some((c) => c.charCodeAt(0) > 0x2e80);

player.play(async (r) => {
  const title = String(cfg.title || "").slice(0, 40), sub = String(cfg.subtitle || "").slice(0, 80), eyebrow = String(cfg.eyebrow || "").slice(0, 40);
  stage.innerHTML = `<canvas></canvas><div class="vig"></div>` + ((title || sub || eyebrow) ? `<div class="tt">
    ${eyebrow ? `<div class="sc-eyebrow">${SC.esc(eyebrow)}</div>` : ""}
    ${title ? `<h1 class="ttl">${[...title].map((c) => `<span class="ch scr">${SC.esc(c)}</span>`).join("")}</h1>` : ""}
    ${sub ? `<p class="sc-sub">${SC.esc(sub)}</p>` : ""}</div>` : "");
  const canvas = SC.$("canvas", stage), ctx = canvas.getContext("2d");
  const cs = getComputedStyle(stage);
  const head = cs.getPropertyValue("--fg").trim() || "#fff";
  const body = cs.getPropertyValue("--accent").trim() || "#0f0";
  const mono = cs.getPropertyValue("--font-mono").trim() || "monospace";

  const rnd = SC.rng(Number(cfg.seed) || 11);
  const density = SC.clamp(Number(cfg.density) || 0.7, 0.2, 1);
  const speed = SC.clamp(Number(cfg.speed) || 1, 0.2, 4);
  const sizeEm = SC.clamp(Number(cfg.size) || 1.1, 0.7, 2.5);
  const overlay = cfg.mode === "overlay";

  const dpr = Math.min(devicePixelRatio || 1, 2);
  let cw = 0, ch = 0, cell = 0, rows = 0, cols = [], hole = null;
  const emPx = () => parseFloat(cs.fontSize) || 16;
  const holeRect = () => {
    const t = SC.$(".ttl", stage) || SC.$(".tt", stage);
    if (!t || overlay) return null;
    const a = stage.getBoundingClientRect(), b = t.getBoundingClientRect(), pad = emPx() * 1.2;
    return { l: b.left - a.left - pad, r: b.right - a.left + pad, t: b.top - a.top - pad * 0.6, b: b.bottom - a.top + pad * 0.6 };
  };
  function reset(c, first) {
    c.on = rnd() < density; c.v = (7 + rnd() * 12) * speed; c.len = 8 + Math.floor(rnd() * 16);
    c.y = first ? -rnd() * rows * 1.3 : -c.len - rnd() * rows * 0.6;
    c.g = Array.from({ length: rows + c.len + 2 }, () => chars[Math.floor(rnd() * chars.length)]);
  }
  const setup = () => {
    cw = stage.clientWidth; ch = stage.clientHeight;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    cell = emPx() * sizeEm * (wide ? 1.15 : 0.9);
    const n = Math.max(1, Math.floor(cw / cell));
    rows = Math.ceil(ch / cell) + 1;
    hole = holeRect();
    const old = cols; cols = [];
    for (let i = 0; i < n; i++) {
      if (old[i]) { cols.push(old[i]); continue; }
      const c = { on: true, y: 0, v: 0, len: 0, g: [] };
      reset(c, true); cols.push(c);
    }
  };
  setup();
  let lastW = cw;

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.font = `${cell * 0.95}px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const ox = (cw - cols.length * cell) / 2;
    cols.forEach((c, i) => {
      if (!c.on) return;
      const x = ox + (i + 0.5) * cell, hy = Math.floor(c.y);
      for (let k = 0; k < c.len; k++) {
        const row = hy - k; if (row < 0 || row >= rows) continue;
        const y = (row + 0.5) * cell;
        let a = k === 0 ? 1 : Math.pow(1 - k / c.len, 1.6) * 0.85;
        if (hole && x > hole.l && x < hole.r && y > hole.t && y < hole.b) a *= 0.04;
        if (a < 0.02) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = k === 0 ? head : body;
        ctx.fillText(c.g[(row + k * 7) % c.g.length], x, y);
      }
    });
    ctx.globalAlpha = 1;
  };
  const advance = (dt) => {
    for (const c of cols) {
      c.y += c.v * dt;
      if (c.on && rnd() < dt * 3) c.g[Math.floor(rnd() * c.g.length)] = chars[Math.floor(rnd() * chars.length)];
      if (c.y - c.len > rows) reset(c);
    }
  };

  /* 标题乱码逐字定格 */
  const spans = SC.$$(".ch", stage), real = spans.map((s) => s.textContent);
  const subEl = SC.$(".tt .sc-sub", stage);
  const unlock = () => { spans.forEach((s, i) => { s.textContent = real[i]; s.className = "ch lock"; }); if (subEl) subEl.classList.add("on"); };

  if (SC.reduce) {
    for (let i = 0; i < 120; i++) advance(0.05);
    unlock(); hole = holeRect(); draw(); return;
  }
  for (let i = 0; i < 60; i++) advance(0.05);      // 预热，开场就有雨
  r.spawn(r.raf((dt, t) => {
    if (stage.clientWidth !== lastW) { lastW = stage.clientWidth; setup(); }
    advance(dt); draw();
    const el = t - 0.5;
    spans.forEach((s, i) => {
      if (s.classList.contains("lock")) return;
      if (el > 0.35 + i * 0.12) { s.textContent = real[i]; s.className = "ch lock"; }
      else if (el > 0 && real[i].trim()) s.textContent = chars[Math.floor(rnd() * chars.length)];
    });
    if (el > 0.6 + spans.length * 0.12 && subEl) subEl.classList.add("on");
  }));
});
