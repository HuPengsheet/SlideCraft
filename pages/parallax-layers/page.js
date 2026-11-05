/* 视差分层：多层按深度位移，鼠标驱动，空闲时自动漂移。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  titleDepth: 0.55,
  auto: true,
  strength: 2.6,         // em
  seed: 11,
  layers: []             // { src, depth, fit, opacity, blur }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const MAXSHIFT = 4;      // em，与 CSS 里 .shift 的 inset 一致，保证边缘不露底
let ac = null;
const num = (v, d, a, b) => (Number.isFinite(+v) && v !== null && v !== "" ? SC.clamp(+v, a, b) : d);

/* 没有素材时画一幅分层山景，颜色全部来自主题变量 */
function ridge(rnd, base, amp, step, rough) {
  const pts = []; let ph1 = rnd() * 6, ph2 = rnd() * 6;
  for (let x = -5; x <= 165; x += step) {
    const y = base - amp * (.5 + .35 * Math.sin(x / 22 + ph1) + .25 * Math.sin(x / 9 + ph2)) - rnd() * rough;
    pts.push([x, y]);
  }
  return "M-5 95 L" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L") + " L165 95 Z";
}
function scenery(seed) {
  const rnd = SC.rng(Math.floor(+seed) || 11);
  const svg = (inner) => `<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg>`;
  const f = (c) => `style="fill:${c}"`;
  const stars = Array.from({ length: 34 }, () => `<circle cx="${(rnd() * 160).toFixed(1)}" cy="${(rnd() * 48).toFixed(1)}" r="${(.2 + rnd() * .45).toFixed(2)}" style="fill:var(--fg);opacity:${(.25 + rnd() * .5).toFixed(2)}"/>`).join("");
  const trees = [];
  for (let x = -4; x < 166; x += 7 + rnd() * 9) {
    const h = 14 + rnd() * 18, w = 3.2 + rnd() * 2.4, y = 92;
    trees.push(`M${(x - w).toFixed(1)} ${y} L${x.toFixed(1)} ${(y - h).toFixed(1)} L${(x + w).toFixed(1)} ${y} Z`);
    trees.push(`M${(x - w * .8).toFixed(1)} ${(y - h * .35).toFixed(1)} L${x.toFixed(1)} ${(y - h * 1.02).toFixed(1)} L${(x + w * .8).toFixed(1)} ${(y - h * .35).toFixed(1)} Z`);
  }
  return [
    { depth: 0, html: svg(`<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--bg)"/><stop offset=".6" style="stop-color:color-mix(in srgb, var(--accent-2) 28%, var(--bg))"/><stop offset="1" style="stop-color:color-mix(in srgb, var(--accent) 38%, var(--bg))"/></linearGradient></defs><rect width="160" height="90" fill="url(#sk)"/>${stars}`) },
    { depth: .12, html: svg(`<circle cx="104" cy="44" r="15" style="fill:var(--accent);opacity:.18"/><circle cx="104" cy="44" r="9" style="fill:var(--accent)"/>`) },
    { depth: .28, blur: .15, html: svg(`<path d="${ridge(rnd, 62, 22, 6, 3)}" ${f("color-mix(in srgb, var(--accent-3) 34%, var(--bg))")}/>`) },
    { depth: .46, html: svg(`<path d="${ridge(rnd, 70, 22, 5, 3)}" ${f("color-mix(in srgb, var(--accent-2) 32%, var(--bg))")}/>`) },
    { depth: .7, html: svg(`<path d="${ridge(rnd, 80, 20, 4, 2)}" ${f("color-mix(in srgb, var(--accent-3) 38%, var(--page-bg))")}/>`) },
    { depth: 1, html: svg(`<path d="M-5 92 L-5 82 Q40 76 80 84 T165 80 L165 92 Z" ${f("color-mix(in srgb, var(--accent-3) 22%, var(--page-bg))")}/><path d="${trees.join(" ")}" ${f("color-mix(in srgb, var(--accent-3) 18%, var(--page-bg))")}/>`) }
  ];
}

function userLayers() {
  return (Array.isArray(cfg.layers) ? cfg.layers : []).filter((l) => l && typeof l === "object" && typeof l.src === "string" && l.src).slice(0, 12).map((l, i, a) => ({
    src: l.src, depth: num(l.depth, a.length > 1 ? .1 + i * (.9 / (a.length - 1)) : .3, 0, 1.3),
    fit: l.fit === "contain" ? "contain" : "cover", opacity: num(l.opacity, 1, 0, 1), blur: num(l.blur, 0, 0, 3)
  }));
}

player.play(async (r) => {
  if (ac) ac.abort();
  ac = new AbortController();
  stage.innerHTML = "";

  const scene = SC.el("scene");
  const defs = userLayers();
  const specs = defs.length ? defs : scenery(cfg.seed);
  const layers = specs.map((l) => {
    const lay = SC.el("lay"), sh = SC.el("shift");
    lay.style.setProperty("--d", l.depth);
    if (l.opacity != null) lay.style.setProperty("--op", l.opacity);
    if (l.fit) lay.style.setProperty("--fit", l.fit);
    if (l.blur) sh.style.setProperty("--blur", l.blur + "em");
    if (l.src) {
      const m = SC.media(l.src); if (l.blur) m.classList.add("blur");
      m.addEventListener("error", () => m.replaceWith(SC.el("miss")), { once: true });
      sh.append(m);
    } else {
      sh.innerHTML = l.html;
      if (l.blur) sh.firstChild.classList.add("blur");
    }
    lay.append(sh); scene.append(lay);
    return { lay, sh, depth: l.depth };
  });
  scene.append(SC.el("vig"));

  /* 标题层 */
  const tdepth = num(cfg.titleDepth, .55, 0, 1.3);
  let tl = null;
  if (cfg.eyebrow || cfg.title || cfg.subtitle) {
    const wrap = SC.el("titlewrap"), lay = SC.el("lay"), sh = SC.el("shift");
    sh.innerHTML = `<div class="tt">${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1>${SC.rich(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p>${SC.rich(cfg.subtitle)}</p>` : ""}</div>`;
    lay.append(sh); wrap.append(lay); scene.append(wrap);
    tl = { lay, sh, depth: tdepth };
  }
  stage.append(scene);
  const all = tl ? [...layers, tl] : layers;

  /* 位移 */
  const strength = num(cfg.strength, 2.6, 0, 4);
  const cur = { x: 0, y: 0 }, tgt = { x: 0, y: 0 };
  let lastMove = -1e9;
  const apply = () => {
    for (const l of all) {
      const k = Math.min(MAXSHIFT, l.depth * strength);
      l.sh.style.transform = `translate(${(-cur.x * k * .625).toFixed(3)}em, ${(-cur.y * k * .375).toFixed(3)}em)`;
    }
  };
  scene.addEventListener("pointermove", (e) => {
    const b = scene.getBoundingClientRect();
    tgt.x = SC.clamp(((e.clientX - b.left) / b.width) * 2 - 1, -1, 1);
    tgt.y = SC.clamp(((e.clientY - b.top) / b.height) * 2 - 1, -1, 1);
    lastMove = performance.now();
    if (SC.reduce) { cur.x = tgt.x; cur.y = tgt.y; apply(); }
  });
  scene.addEventListener("pointerleave", () => { lastMove = performance.now() - 1500; });

  const drift = cfg.auto !== false && !SC.reduce;
  const loop = r.raf((dt, t) => {
    const active = performance.now() - lastMove < 2500;
    if (active) { /* 跟随指针 */ }
    else if (drift) { tgt.x = Math.sin(t * .45) * .8; tgt.y = Math.cos(t * .33) * .6; }
    const k = 1 - Math.exp(-dt * 4);
    cur.x += (tgt.x - cur.x) * k; cur.y += (tgt.y - cur.y) * k;
    apply();
    return true;
  });
  if (!SC.reduce) r.spawn(loop);
  apply();

  /* 入场：由远到近，最后是标题 */
  if (SC.reduce) { all.forEach((l) => l.lay.classList.add("in")); return; }
  await r.wait(200);
  for (const l of layers) { l.lay.classList.add("in"); await r.wait(380); }
  if (tl) { await r.wait(150); tl.lay.classList.add("in"); }
});
