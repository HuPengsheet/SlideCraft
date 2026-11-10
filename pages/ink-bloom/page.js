/* 水墨晕染标题：墨滴落下，在纸面上晕开（canvas），标题由模糊到清晰逐字显出。配置见 config.js。 */
const DEFAULTS = {
  theme: "paper",
  title: "墨韵",
  eyebrow: "",
  subtitle: "",
  drops: [{ x: .3, y: .4, size: .26 }, { x: .72, y: .64, size: .2 }, { x: .5, y: .55, size: .42, ink: .3 }],
  gap: 520,
  seed: 7
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const FALL = 0.45, GROW = 2.6, CREEP = 5;   // 秒：下落、主要晕开、之后缓慢洇开

function makeBloom(d, i, rnd) {
  const harm = () => {
    const h = [];
    for (let k = 2; k <= 7; k++) h.push({ k, a: (0.13 / k) * (0.4 + rnd()), ph: rnd() * 6.283 });
    for (let k = 0; k < 4; k++) h.push({ k: 9 + Math.floor(rnd() * 14), a: 0.012 + rnd() * 0.02, ph: rnd() * 6.283 });
    return h;
  };
  const layers = Array.from({ length: 6 }, (_, L) => ({ rf: 1 - L * 0.13 + (rnd() - .5) * .05, a: 0.07 + L * 0.075, blur: 0.07 - L * 0.01,
    dx: (rnd() - .5) * .12, dy: (rnd() - .5) * .12, harm: harm() }));
  const spat = Array.from({ length: 6 + Math.floor(rnd() * 9) }, () => ({ ang: rnd() * 6.283, dist: 1.02 + rnd() * .6, r: .008 + rnd() * .03 }));
  const fibers = Array.from({ length: 46 }, () => ({ ang: rnd() * 6.283, len: .03 + rnd() * .08 }));
  return {
    x: SC.clamp(Number(d.x) || .5, 0, 1), y: SC.clamp(Number(d.y) || .5, 0, 1),
    size: SC.clamp(Number(d.size) || .2, .01, .8), ink: SC.clamp(d.ink == null ? 1 : Number(d.ink) || 1, .1, 1),
    accent: d.color === "accent", t0: i * SC.clamp(Number(cfg.gap) || 520, 80, 3000) / 1000, layers, spat, fibers, outer: layers[0]
  };
}

const radiusAt = (layer, th) => {
  let s = 1;
  for (const h of layer.harm) s += h.a * Math.sin(h.k * th + h.ph);
  return s;
};

player.play(async (r) => {
  const title = String(cfg.title || "").slice(0, 12), sub = String(cfg.subtitle || "").slice(0, 60), eyebrow = String(cfg.eyebrow || "").slice(0, 30);
  stage.innerHTML = `<div class="paper"></div><canvas></canvas><div class="veil"></div><div class="tt">
    ${eyebrow ? `<div class="sc-eyebrow">${SC.esc(eyebrow)}</div>` : ""}
    ${title ? `<h1 class="ttl">${[...title].map((c) => `<span class="ch">${SC.esc(c)}</span>`).join("")}</h1>` : ""}
    ${sub ? `<p class="sc-sub">${SC.esc(sub)}</p>` : ""}</div>`;
  const cv = SC.$("canvas", stage), ctx = cv.getContext("2d");
  const cs = getComputedStyle(stage);
  const INK = cs.getPropertyValue("--fg").trim() || "#222", RED = cs.getPropertyValue("--bad").trim() || "#b5523c";
  const rnd = SC.rng(Number(cfg.seed) || 7);
  const blooms = (Array.isArray(cfg.drops) ? cfg.drops : []).slice(0, 16).map((d, i) => makeBloom(d, i, rnd));
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0, T = 0;

  const shape = (b, layer, R, s) => {
    const cx = b.x * W, cy = b.y * H;
    ctx.beginPath();
    for (let k = 0; k <= 120; k++) {
      const th = (k / 120) * 6.283, rr = R * layer.rf * s * radiusAt(layer, th);
      const x = cx + layer.dx * R * s + Math.cos(th) * rr, y = cy + layer.dy * R * s + Math.sin(th) * rr;
      k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  };

  function drawBloom(b, t) {
    const R = b.size * W, col = b.accent ? RED : INK, lt = t - b.t0;
    if (lt <= 0) return;
    ctx.fillStyle = ctx.strokeStyle = col;
    if (lt < FALL) {                                 // 下落中的墨滴
      const p = lt / FALL, y = SC.lerp(-0.06 * H, b.y * H, p * p), rx = Math.max(3 * dpr, R * .05);
      ctx.globalAlpha = .9 * b.ink; ctx.filter = "none";
      ctx.beginPath(); ctx.ellipse(b.x * W, y, rx, rx * (1 + 2.2 * (1 - p)), 0, 0, 6.283); ctx.fill();
      return;
    }
    const gt = lt - FALL, g = 1 - Math.pow(1 - Math.min(1, gt / GROW), 3);
    const s = 0.12 + 0.88 * g + 0.035 * Math.min(1, Math.max(0, gt - GROW) / CREEP);
    for (const L of b.layers) {                      // 由外向内，越往里越浓
      ctx.filter = `blur(${Math.max(0.5, R * L.blur * (0.4 + 0.6 * g))}px)`;
      ctx.globalAlpha = L.a * b.ink * (0.55 + 0.45 * g);
      shape(b, L, R, s); ctx.fill();
    }
    ctx.filter = `blur(${Math.max(.5, R * .006)}px)`;  // 干后的墨边稍深
    ctx.globalAlpha = .07 * b.ink * g; ctx.lineWidth = Math.max(1, R * .006);
    shape(b, b.layers[1], R, s); ctx.stroke();
    ctx.filter = "none";
    if (g > .55) {                                   // 纸纤维方向的细丝
      ctx.globalAlpha = .1 * b.ink * (g - .55) / .45; ctx.lineWidth = Math.max(.6, dpr * .7);
      ctx.beginPath();
      for (const f of b.fibers) {
        const r0 = R * b.layers[1].rf * s * radiusAt(b.layers[1], f.ang) * .96, r1 = r0 + R * f.len * s;
        ctx.moveTo(b.x * W + Math.cos(f.ang) * r0, b.y * H + Math.sin(f.ang) * r0);
        ctx.lineTo(b.x * W + Math.cos(f.ang + .04) * r1, b.y * H + Math.sin(f.ang + .04) * r1);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = .7 * b.ink * Math.min(1, gt * 5);   // 落地溅出的墨点
    for (const p of b.spat) {
      const d = R * p.dist * (0.3 + 0.7 * Math.min(1, gt * 3));
      ctx.beginPath(); ctx.arc(b.x * W + Math.cos(p.ang) * d, b.y * H + Math.sin(p.ang) * d, Math.max(1, R * p.r), 0, 6.283); ctx.fill();
    }
  }

  function draw(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const b of blooms) drawBloom(b, t);
    ctx.globalAlpha = 1; ctx.filter = "none";
  }
  const setup = () => { if (!cv.isConnected) return ro.disconnect(); W = cv.width = Math.round(stage.clientWidth * dpr); H = cv.height = Math.round(stage.clientHeight * dpr); draw(T); };
  const ro = new ResizeObserver(setup); ro.observe(stage);
  setup();

  const lastImpact = blooms.length ? blooms[blooms.length - 1].t0 + FALL : 0;
  const revealText = async () => {
    const veil = SC.$(".veil", stage), eb = SC.$(".sc-eyebrow", stage), chars = SC.$$(".ch", stage), sb = SC.$(".sc-sub", stage);
    if (SC.reduce) { [veil, eb, sb, ...chars].forEach((e) => e && e.classList.add("on")); return; }
    await r.wait(Math.min(lastImpact, 1.6) * 1000 + 300);
    veil.classList.add("on");
    if (eb) eb.classList.add("on");
    for (const c of chars) { c.classList.add("on"); await r.wait(260); }
    await r.wait(700);
    if (sb) sb.classList.add("on");
  };
  const text = r.spawn(revealText());
  if (SC.reduce) { T = lastImpact + GROW + CREEP; draw(T); }
  else await r.raf((dt, t) => { T = t; draw(t); return t < lastImpact + GROW + CREEP; });
  await text;
});
