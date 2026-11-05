/* Logo 揭示：描边 → 填充 → 高光扫过。配置见 config.js。 */
const DEFAULTS = { theme: "dark", logo: "", text: "LOGO", tagline: "", style: "stroke" };
const { cfg, player, stage } = SC.init(DEFAULTS);

const NS = "http://www.w3.org/2000/svg";
const isPath = (s) => /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+$/.test(s) && /[A-Za-z]/.test(s) && (s.match(/\d/g) || []).length >= 4;
const prog = (t, a, b) => SC.clamp((t - a) / (b - a), 0, 1);
const px = (v) => (v + "").trim();

/* 构造一个形状元素（path 或 text）。 */
function shape(kind, src, attrs) {
  const e = document.createElementNS(NS, kind === "path" ? "path" : "text");
  if (kind === "path") e.setAttribute("d", src);
  else {
    e.textContent = src;
    e.setAttribute("x", 0); e.setAttribute("y", 0);
    e.setAttribute("text-anchor", "middle"); e.setAttribute("dominant-baseline", "central");
    e.setAttribute("font-size", 120); e.setAttribute("font-weight", 800);
    e.style.fontFamily = "var(--font-display)";
  }
  for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
  return e;
}

/* 亮度，用来挑选高光色 */
const lum = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 1; const x = c.getContext("2d", { willReadFrequently: true });
  return (col) => { try { x.clearRect(0, 0, 1, 1); x.fillStyle = "#000"; x.fillStyle = col; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; return d[0] * .3 + d[1] * .59 + d[2] * .11; } catch (e) { return 128; } };
})();

player.play(async (r) => {
  stage.innerHTML = "";
  const cs = getComputedStyle(stage);
  const v = (n, f) => cs.getPropertyValue(n).trim() || f;
  const fg = v("--fg", "#fff"), bg = v("--bg", "#000"), acc = v("--accent", "#fff"), acc2 = v("--accent-2", acc);
  const shine = lum(fg) > lum(bg) ? fg : bg;
  const style = ["stroke", "burst", "wipe"].includes(cfg.style) ? cfg.style : "stroke";

  const tagText = String(cfg.tagline || "").trim();
  stage.innerHTML = `<div class="bgrid"></div><div class="glow"></div><div class="mark"></div>` +
    (tagText ? `<div class="tag"><i></i><span>${SC.esc(tagText)}</span><i></i></div>` : "");
  const mark = SC.$(".mark", stage), glow = SC.$(".glow", stage), tag = SC.$(".tag", stage);
  const lines = tag ? SC.$$("i", tag) : [];

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  mark.append(svg);
  const scene = document.createElementNS(NS, "g"); svg.append(scene);

  /* 先把形状放进去量尺寸；path 量不出来就退回文字 */
  const raw = String(cfg.logo ?? "").trim();
  const fallback = String(cfg.text || "").trim() || "LOGO";
  let kind = raw && isPath(raw) ? "path" : "text";
  let src = kind === "path" ? raw : (raw || fallback);
  const probe = () => {
    const e = shape(kind, src); scene.append(e);
    let b = null; try { b = e.getBBox(); } catch (err) { b = null; }
    e.remove(); return b;
  };
  let bb = probe();
  if (!bb || !(bb.width > 0.5) || !(bb.height > 0.5)) { kind = "text"; src = raw && !isPath(raw) ? raw : fallback; bb = probe(); }
  if (!bb || !(bb.width > 0.5)) bb = { x: -200, y: -60, width: 400, height: 120 };
  /* 文字太长时缩小字号，使宽高比不超出舞台承载 */
  let scale = 1;
  if (kind === "text") { const maxW = 120 * 11; if (bb.width > maxW) scale = maxW / bb.width; }
  const pad = Math.max(bb.width, bb.height) * .12;
  const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
  const vw = bb.width + pad * 2, vh = bb.height + pad * 2;
  svg.setAttribute("viewBox", `${cx - vw / 2} ${cy - vh / 2} ${vw} ${vh}`);
  if (kind === "text") scene.setAttribute("data-s", scale);
  const big = Math.max(vw, vh);
  const sw = big * .012 + .6;

  /* 渐变高光 */
  const defs = document.createElementNS(NS, "defs");
  const gid = "sh" + Math.floor(Math.random() * 1e6);
  defs.innerHTML = `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${bb.width * .35}" y2="0">
      <stop offset="0" stop-color="${SC.esc(shine)}" stop-opacity="0"/><stop offset=".5" stop-color="${SC.esc(shine)}" stop-opacity=".85"/><stop offset="1" stop-color="${SC.esc(shine)}" stop-opacity="0"/></linearGradient>
    <clipPath id="${gid}c"><rect x="${cx - vw / 2}" y="${cy - vh}" width="0" height="${vh * 2}"/></clipPath>`;
  svg.prepend(defs);
  const clipRect = defs.querySelector("rect");

  const sparks = document.createElementNS(NS, "g"); sparks.setAttribute("fill", "none"); sparks.setAttribute("stroke-linecap", "round");
  const fillG = document.createElementNS(NS, "g");
  const fillE = shape(kind, src, { fill: acc, stroke: "none" });
  const fillE2 = shape(kind, src, { fill: fg, stroke: "none" });   // 叠一层 fg，用渐变色 fill 的透明度混出层次
  fillE.style.opacity = 1; fillE2.style.opacity = 0;
  fillG.append(fillE, fillE2);
  const stroke = shape(kind, src, { fill: "none", stroke: fg, "stroke-width": sw, "stroke-linejoin": "round", "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 });
  const sheen = shape(kind, src, { fill: `url(#${gid})`, stroke: "none" });
  const shineG = document.createElementNS(NS, "g"); shineG.append(sheen);
  const lead = document.createElementNS(NS, "line");
  lead.setAttribute("stroke", acc2); lead.setAttribute("stroke-width", sw * 1.2); lead.setAttribute("y1", cy - vh / 2); lead.setAttribute("y2", cy + vh / 2); lead.style.opacity = 0;
  const ring = document.createElementNS(NS, "circle"); ring.setAttribute("fill", "none"); ring.setAttribute("stroke", acc); ring.setAttribute("stroke-width", sw); ring.setAttribute("cx", cx); ring.setAttribute("cy", cy); ring.style.opacity = 0;
  scene.append(sparks, fillG, stroke, shineG, lead, ring);
  const tr = (s) => `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`;
  if (kind === "text") for (const e of [fillE, fillE2, stroke, sheen]) e.setAttribute("transform", tr(scale));

  const rnd = SC.rng(11);
  const sp = Array.from({ length: 28 }, (_, i) => ({ a: (i / 28) * Math.PI * 2 + rnd() * .2, l: .05 + rnd() * .12, d: .45 + rnd() * .35, c: i % 3 === 0 ? fg : i % 3 === 1 ? acc : acc2 }));
  const spEls = sp.map((s) => { const l = document.createElementNS(NS, "line"); l.setAttribute("stroke", s.c); l.setAttribute("stroke-width", sw * .9); sparks.append(l); return l; });

  /* 一个函数按时间 t（秒）画出整个画面 */
  const gradLine = svg.querySelector("linearGradient");
  const frame = (t) => {
    const dr = SC.ease.inOut(prog(t, .2, 1.8));
    const fl = SC.ease.out(prog(t, 1.5, 2.2));
    stroke.setAttribute("stroke-dashoffset", style === "stroke" ? 1 - dr : 0);
    let strokeOp = 1, fillOp = 0, sc = 1, fx = 0;
    if (style === "stroke") { fillOp = fl; strokeOp = 1 - .6 * fl; }
    else if (style === "burst") {
      const b = prog(t, .35, .65), bo = SC.ease.out(prog(t, .35, 1.7));
      fillOp = b; strokeOp = (1 - b) * .8; stroke.setAttribute("stroke-dashoffset", 0);
      sc = t < .35 ? 1.5 : 1 + .5 * Math.pow(1 - SC.ease.out(prog(t, .35, 1.0)), 2) * (1 - b * .2);
      sc = SC.lerp(1.6, 1, SC.ease.out(prog(t, .2, .9)));
      fx = bo;
    } else {
      const w = SC.ease.inOut(prog(t, .2, 1.9));
      clipRect.setAttribute("width", vw * w);
      fillG.setAttribute("clip-path", `url(#${gid}c)`);
      fillOp = 1; strokeOp = 1 - .6 * w; stroke.setAttribute("stroke-dashoffset", 0);
      const ex = cx - vw / 2 + vw * w; // 擦除前沿
      lead.setAttribute("x1", ex); lead.setAttribute("x2", ex); lead.style.opacity = w > 0 && w < 1 ? 1 : 0;
      fx = w;
    }
    if (style === "burst" && t < .2) { fillOp = 0; sc = 1.6; }
    stroke.style.opacity = strokeOp;
    if (style !== "wipe") fillG.removeAttribute("clip-path");
    fillG.style.opacity = style === "wipe" ? 1 : fillOp;
    fillE2.style.opacity = SC.clamp(prog(t, 1.6, 2.4) * .35, 0, .35);
    scene.setAttribute("transform", style === "burst" ? tr(sc) : "");
    /* 爆裂：火花与冲击环 */
    if (style === "burst") {
      const k = prog(t, .35, 1.4), e = SC.ease.out(k);
      sp.forEach((s, i) => { const r0 = big * (.18 + s.d * .55 * e), r1 = r0 + big * s.l * (1 - k);
        spEls[i].setAttribute("x1", cx + Math.cos(s.a) * r0); spEls[i].setAttribute("y1", cy + Math.sin(s.a) * r0 * .6);
        spEls[i].setAttribute("x2", cx + Math.cos(s.a) * r1); spEls[i].setAttribute("y2", cy + Math.sin(s.a) * r1 * .6);
        spEls[i].style.opacity = k > 0 && k < 1 ? 1 - k : 0; });
      ring.setAttribute("r", big * (.1 + .6 * e)); ring.style.opacity = k > 0 && k < 1 ? (1 - k) * .8 : 0;
    }
    /* 高光 */
    const sh = prog(t, 2.2, 3.2), se = SC.ease.inOut(sh);
    const gx = bb.x - bb.width * .4 + (bb.width * 1.8) * se;
    gradLine.setAttribute("x1", gx); gradLine.setAttribute("x2", gx + bb.width * .35);
    gradLine.setAttribute("gradientTransform", `skewX(-20)`);
    shineG.style.opacity = sh > 0 && sh < 1 ? 1 : 0;
    const clipId = `${gid}s`;
    /* 光晕与背景 */
    glow.style.opacity = SC.clamp(.12 * prog(t, .2, 1.8) + .22 * fl + (style === "burst" ? .3 * Math.pow(1 - prog(t, .35, 1.2), 2) * (t > .35 ? 1 : 0) : 0), 0, .6);
    /* 标语 */
    const tg = SC.ease.out(prog(t, 2.5, 3.4));
    if (tag) {
      tag.style.opacity = tg; tag.style.transform = `translateY(${(1 - tg) * 1.2}em)`;
      tag.firstElementChild && lines.forEach((l) => (l.style.transform = `scaleX(${tg})`));
      tag.querySelector("span").style.letterSpacing = `${SC.lerp(.7, .4, tg)}em`;
    }
  };

  /* 擦除时形状只在 clip 内显示，高光限定在形状上，所以不需要额外 clip */
  if (SC.reduce) { frame(10); return; }
  frame(0);
  await r.raf((dt, t) => { frame(t); return t < 3.6; });
  frame(10);
});
