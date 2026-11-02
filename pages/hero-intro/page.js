/* 开场封面：动态背景 + 标题入场。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  backdrop: "particles",   // particles | gradient | grid | rings
  reveal: "letter",        // letter | mask
  eyebrow: "",
  title: "",               // \n 换行
  subtitle: "",
  footer: "",
  particles: { count: 70, link: 0.14, seed: 7 }  // link: 连线距离，占画布宽度的比例
};

const { cfg, player, stage } = SC.init(DEFAULTS);

function backdropHTML(kind) {
  if (kind === "gradient") return `<div class="bd"><i class="blob"></i><i class="blob"></i><i class="blob"></i></div>`;
  if (kind === "grid") return `<div class="bd"><div class="gridwrap"><div class="plane"></div></div></div>`;
  if (kind === "rings") return `<div class="bd">${[0, 1, 2, 3, 4].map((k) => `<i class="ring" style="--k:${k}"></i>`).join("")}</div>`;
  return `<div class="bd"><canvas></canvas></div>`;
}

/* 粒子：位置、速度由 SC.rng 生成；颜色每次从 CSS 变量读取，主题切换后重播即生效 */
function runParticles(r, canvas) {
  const o = { ...DEFAULTS.particles, ...(cfg.particles || {}) };
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = canvas.width = Math.round(stage.clientWidth * dpr);
  const H = canvas.height = Math.round(stage.clientHeight * dpr);
  const ctx = canvas.getContext("2d");
  const cs = getComputedStyle(stage);
  const dot = cs.getPropertyValue("--accent").trim() || "#fff";
  const line = cs.getPropertyValue("--accent-3").trim() || dot;
  const rnd = SC.rng(o.seed);
  const ps = Array.from({ length: o.count }, () => ({
    x: rnd() * W, y: rnd() * H, a: rnd() * Math.PI * 2, v: (6 + rnd() * 14) * dpr, r: (1 + rnd() * 1.8) * dpr
  }));
  const maxD = o.link * W;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = line; ctx.lineWidth = dpr;
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
      if (d < maxD) { ctx.globalAlpha = (1 - d / maxD) * .35; ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y); ctx.stroke(); }
    }
    ctx.globalAlpha = .85; ctx.fillStyle = dot;
    for (const p of ps) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
  };
  draw();
  if (SC.reduce) return;
  r.spawn(r.raf((dt) => {
    for (const p of ps) {
      p.x += Math.cos(p.a) * p.v * dt; p.y += Math.sin(p.a) * p.v * dt;
      if (p.x < 0) p.x += W; else if (p.x > W) p.x -= W;
      if (p.y < 0) p.y += H; else if (p.y > H) p.y -= H;
    }
    draw();
  }));
}

player.play(async (r) => {
  const mask = cfg.reveal === "mask";
  const lines = String(cfg.title || "").split("\n");
  const titleHTML = lines.map((ln) => mask
    ? `<span class="ln"><span>${SC.esc(ln)}</span></span>`
    : `<span style="display:block">${[...ln].map((c) => `<span class="ch">${c === " " ? "&nbsp;" : SC.esc(c)}</span>`).join("")}</span>`).join("");
  stage.innerHTML = `${backdropHTML(cfg.backdrop)}
    <div class="content">
      ${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}
      <h1 class="hero">${titleHTML}</h1>
      ${cfg.subtitle ? `<p class="sub">${SC.esc(cfg.subtitle)}</p>` : ""}
    </div>
    ${cfg.footer ? `<div class="foot">${SC.esc(cfg.footer)}</div>` : ""}`;

  const canvas = SC.$("canvas", stage);
  if (canvas) runParticles(r, canvas);

  const show = (el) => el && el.classList.add("on");
  await r.wait(SC.reduce ? 0 : 300);
  show(SC.$(".sc-eyebrow", stage));
  await r.wait(SC.reduce ? 0 : 350);
  if (mask) {
    for (const ln of SC.$$(".hero .ln", stage)) { show(ln); await r.wait(SC.reduce ? 0 : 220); }
  } else {
    for (const ch of SC.$$(".hero .ch", stage)) { show(ch); await r.wait(SC.reduce ? 0 : 55); }
  }
  await r.wait(SC.reduce ? 0 : 300);
  show(SC.$(".sub", stage));
  await r.wait(SC.reduce ? 0 : 500);
  show(SC.$(".foot", stage));
});
