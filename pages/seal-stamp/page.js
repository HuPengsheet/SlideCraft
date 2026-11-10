/* 印章盖下：印章从上方压下、回弹后抬起，纸面留下带斑驳纹理的红印，可依次盖多枚。配置见 config.js。 */
const DEFAULTS = {
  theme: "paper",
  title: "印章盖下",
  eyebrow: "",
  heading: "",
  subtitle: "",
  seals: [{ text: "鉴定", style: "zhu" }],
  gap: 650,
  seed: 5
};

const { cfg, player, stage } = SC.init(DEFAULTS);

/* 印文排布：传统印章从右列读起，4 字为右上、右下、左上、左下 */
function glyphs(text, round) {
  const c = [...String(text || "")].slice(0, 4);
  const T = (ch, x, y, s, sx = 1) =>
    `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" dominant-baseline="central" transform="translate(${x} ${y}) scale(${sx} 1) translate(${-x} ${-y})">${SC.esc(ch)}</text>`;
  if (c.length >= 4 || c.length === 3) {
    const s = round ? 30 : 38, a = round ? 30 : 28, b = round ? 70 : 72;
    const pos = c.length === 4 ? [[b, a], [b, b], [a, a], [a, b]] : [[b, 50], [a, a], [a, b]];
    return c.map((ch, i) => T(ch, pos[i][0], pos[i][1] + 1, c.length === 3 && i === 0 ? s * 1.25 : s)).join("");
  }
  if (c.length === 2) return T(c[0], 50, round ? 31 : 29, round ? 32 : 40, round ? 1.25 : 1.6) + T(c[1], 50, round ? 69 : 71, round ? 32 : 40, round ? 1.25 : 1.6);
  return c.length ? T(c[0], 50, 52, round ? 58 : 70) : "";
}

function sealSVG(s, i, seed) {
  const round = s.shape === "round", bai = s.style === "bai";
  const id = `s${i}`, frame = round ? `<circle cx="50" cy="50" r="46"/>` : `<rect x="4" y="4" width="92" height="92" rx="3"/>`;
  const txt = glyphs(s.text, round);
  const body = bai
    ? `<mask id="${id}k" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><g fill="#fff">${frame}</g><g fill="#000">${txt}</g></mask>
       <g mask="url(#${id}k)" fill="currentColor">${frame}</g>`
    : `<g fill="none" stroke="currentColor" stroke-width="5">${round ? `<circle cx="50" cy="50" r="44"/>` : `<rect x="6" y="6" width="88" height="88" rx="2"/>`}</g><g fill="currentColor">${txt}</g>`;
  return `<svg viewBox="0 0 100 100"><defs>
    <filter id="${id}f" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="${seed}" result="n1"/>
      <feDisplacementMap in="SourceGraphic" in2="n1" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency=".08" numOctaves="3" seed="${seed + 7}" result="n2"/>
      <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3.2 0 0 0 2.75" result="m"/>
      <feComposite in="d" in2="m" operator="in"/>
    </filter></defs>
    <g filter="url(#${id}f)">${body}</g></svg>`;
}

player.play(async (r) => {
  const seals = (Array.isArray(cfg.seals) ? cfg.seals : []).slice(0, 5);
  const seed = Math.round(Number(cfg.seed) || 5), gap = SC.clamp(Number(cfg.gap) || 650, 0, 4000);
  const eyebrow = String(cfg.eyebrow || "").slice(0, 30), heading = String(cfg.heading || "").slice(0, 16), sub = String(cfg.subtitle || "").slice(0, 60);
  stage.innerHTML = `<div class="paper"></div><div class="wrap">
    <div class="head">${eyebrow ? `<div class="sc-eyebrow">${SC.esc(eyebrow)}</div>` : ""}${heading ? `<h1>${SC.esc(heading)}</h1>` : ""}${sub ? `<p class="sc-sub">${SC.esc(sub)}</p>` : ""}</div>
    <div class="row${seals.length > 3 ? " many" : ""}">${seals.map((s, i) => `<div class="slot">
      <div class="imprint" style="transform:rotate(${((i * 37 + seed * 13) % 9) - 4}deg)">${sealSVG(s, i, seed * 17 + i * 5)}</div>
      ${s.label ? `<div class="lab">${SC.esc(s.label)}</div>` : ""}
      <div class="shadow"></div><div class="stamp"><div class="body"></div><div class="face"></div></div></div>`).join("")}</div></div>`;

  const head = SC.$$(".head > *", stage), slots = SC.$$(".slot", stage);
  if (!seals.length) SC.$(".row", stage).remove();
  if (SC.reduce) {
    head.forEach((e) => e.classList.add("on"));
    slots.forEach((sl) => { SC.$(".imprint", sl).style.opacity = .92; const l = SC.$(".lab", sl); if (l) l.classList.add("on"); });
    return;
  }
  for (const e of head) { e.classList.add("on"); await r.wait(260); }
  await r.wait(350);

  const DROP = .38, PRESS = .22, LIFT = .5;
  for (const sl of slots) {
    const st = SC.$(".stamp", sl), sh = SC.$(".shadow", sl), im = SC.$(".imprint", sl), lab = SC.$(".lab", sl);
    const base = im.style.transform;
    st.style.opacity = 1;
    await r.raf((dt, t) => {
      if (t < DROP) {                                 // 落下
        const p = t / DROP, y = -7 * (1 - p * p);
        st.style.transform = `translateY(${y}em)`;
        sh.style.opacity = .25 + .75 * p; sh.style.transform = `scale(${1.6 - .6 * p})`;
      } else if (t < DROP + PRESS) {                  // 压实、回弹
        const p = (t - DROP) / PRESS, sq = Math.sin(p * Math.PI) * .07;
        st.style.transform = `translateY(${sq * 1.6}em) scaleY(${1 - sq})`;
        im.style.opacity = .92;
        im.style.transform = `${base} scale(${1 + .04 * (1 - p)})`;
      } else {                                        // 抬起离开
        const p = Math.min(1, (t - DROP - PRESS) / LIFT), e = SC.ease.inOut(p);
        st.style.transform = `translateY(${-8 * e}em)`;
        st.style.opacity = 1 - p; sh.style.opacity = 1 - p;
        im.style.transform = base;
      }
      return t < DROP + PRESS + LIFT;
    });
    st.style.opacity = 0; sh.style.opacity = 0;
    if (lab) lab.classList.add("on");
    await r.wait(gap);
  }
});
