/* 折扇展开：合拢的扇骨由中间向两边旋开成扇形，扇面随之铺开，大字和条目在被扇面覆盖后显出。配置见 config.js。 */
const DEFAULTS = {
  theme: "paper",
  title: "折扇展开",
  heading: "清风徐来",
  items: [],
  caption: "",
  ribs: 15,
  spread: 150
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const R = 23, R0 = 8, TAIL = 1.3;                      // 扇面外半径、内半径、扇骨伸出枢轴的长度（em）
const pt = (r, a) => [r * Math.sin(a), -r * Math.cos(a)];
const f = (n) => n.toFixed(3);

player.play(async (r) => {
  const n = Math.round(SC.clamp(Number(cfg.ribs) || 15, 9, 25));
  const S = SC.clamp(Number(cfg.spread) || 150, 90, 170) * Math.PI / 180;
  const heading = [...String(cfg.heading || "")].slice(0, 6);
  const items = (Array.isArray(cfg.items) ? cfg.items : []).slice(0, 6).map((s) => String(s).slice(0, 6));
  const caption = String(cfg.caption || "").slice(0, 40);

  /* 大字沿弧排列，每字占的角度由字号和半径决定 */
  const HR = 14.6, HS = Math.min(3.6, (S * 0.62 * HR) / Math.max(1, heading.length) / 1.15);
  const hStep = (HS * 1.15) / HR;
  const hChars = heading.map((c, i) => ({ c, a: (i - (heading.length - 1) / 2) * hStep }));
  const IR = 20.3, iSpan = S * 0.78;
  const iList = items.map((s, i) => ({ s, a: items.length > 1 ? -iSpan / 2 + (i * iSpan) / (items.length - 1) : 0 }));
  const rot = (a, r0) => { const [x, y] = pt(r0, a); return `transform="translate(${f(x)} ${f(y)}) rotate(${f(a * 180 / Math.PI)})"`; };

  stage.innerHTML = `<div class="room"></div><div class="fan"><svg viewBox="-24 -24 48 48">
    <g class="ribs">${Array.from({ length: n }, () => `<line class="rib"/>`).join("")}</g>
    <g class="leaves">${Array.from({ length: n - 1 }, (_, i) => `<path class="${i % 2 ? "leaf-b" : "leaf-a"}"/>`).join("")}</g>
    <path class="rim"/>
    <g>${hChars.map((h) => `<text class="hd" font-size="${f(HS)}" text-anchor="middle" dominant-baseline="central" ${rot(h.a, HR)}>${SC.esc(h.c)}</text>`).join("")}</g>
    <g>${iList.map((it) => `<circle class="dot" r=".28" ${rot(it.a, IR - 1.6)}/><text class="it" font-size="1.3" text-anchor="middle" dominant-baseline="central" letter-spacing=".15" ${rot(it.a, IR)}>${SC.esc(it.s)}</text>`).join("")}</g>
    <line class="guard"/><line class="guard"/>
    <circle class="pin" r=".55"/>
  </svg></div>${caption ? `<div class="cap">${SC.esc(caption)}</div>` : ""}`;

  const ribs = SC.$$(".rib", stage), leaves = SC.$$(".leaves path", stage), rim = SC.$(".rim", stage), guards = SC.$$(".guard", stage);
  const hd = SC.$$(".hd", stage), dots = SC.$$(".dot", stage), its = SC.$$(".it", stage), cap = SC.$(".cap", stage);
  const step = S / (n - 1);

  /* p：0 合拢 → 1 展开；tilt：合拢时整把扇子微微偏一点，展开时回正 */
  const set = (p, tilt) => {
    const ang = Array.from({ length: n }, (_, i) => (-S / 2 + i * step) * p + tilt);
    ribs.forEach((l, i) => {
      const [x1, y1] = pt(-TAIL, ang[i]), [x2, y2] = pt(R0 + 0.4, ang[i]);
      l.setAttribute("x1", f(x1)); l.setAttribute("y1", f(y1)); l.setAttribute("x2", f(x2)); l.setAttribute("y2", f(y2));
    });
    leaves.forEach((path, i) => {
      const a1 = ang[i], a2 = ang[i + 1], [ax, ay] = pt(R0, a1), [bx, by] = pt(R, a1), [cx, cy] = pt(R, a2), [dx, dy] = pt(R0, a2);
      path.setAttribute("d", `M${f(ax)} ${f(ay)}L${f(bx)} ${f(by)}A${R} ${R} 0 0 1 ${f(cx)} ${f(cy)}L${f(dx)} ${f(dy)}A${R0} ${R0} 0 0 0 ${f(ax)} ${f(ay)}Z`);
    });
    const a0 = ang[0], a1 = ang[n - 1], [px, py] = pt(R - .15, a0), [qx, qy] = pt(R - .15, a1);
    rim.setAttribute("d", `M${f(px)} ${f(py)}A${R - .15} ${R - .15} 0 0 1 ${f(qx)} ${f(qy)}`);
    [a0, a1].forEach((a, k) => {
      const [x1, y1] = pt(-TAIL, a), [x2, y2] = pt(R + .3, a), g = guards[k];
      g.setAttribute("x1", f(x1)); g.setAttribute("y1", f(y1)); g.setAttribute("x2", f(x2)); g.setAttribute("y2", f(y2));
    });
    const half = (S / 2) * p;                         // 被扇面盖住的字才显出
    hChars.forEach((h, i) => { if (Math.abs(h.a + 0) < half - hStep * .4) hd[i].classList.add("on"); });
  };

  if (SC.reduce) {
    set(1, 0);
    [...hd, ...dots, ...its].forEach((e) => e.classList.add("on"));
    if (cap) cap.classList.add("on");
    return;
  }
  set(0, -0.12);
  await r.wait(500);
  const OPEN = 2.4;
  await r.raf((dt, t) => {
    const k = Math.min(1, t / OPEN), e = SC.ease.inOut(k);
    set(e, -0.12 * (1 - SC.ease.out(k)));
    return t < OPEN;
  });
  set(1, 0);
  for (let i = 0; i < its.length; i++) { await r.wait(240); dots[i].classList.add("on"); its[i].classList.add("on"); }
  if (cap) { await r.wait(400); cap.classList.add("on"); }
});
