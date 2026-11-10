/* 书法逐笔书写：楷体大字按笔顺写出（笔画路径在遮罩里逐笔描出，露出字形），最后落款与印章淡入。
 * 配置见 config.js。笔画坐标按 0 到 100 的方格手写，只覆盖内置字；其余字用横笔扫过显出。 */
const DEFAULTS = {
  theme: "paper",
  title: "书法逐笔书写",
  text: "山水之间",
  eyebrow: "",
  sign: "",
  seal: "",
  per: 460
};

const { cfg, player, stage } = SC.init(DEFAULTS);

/* 每个字的笔画：一笔是若干点 [x, y]，按书写方向排列 */
const STROKES = {
  "山": [[[49, 22], [49, 70]], [[25, 52], [25, 76], [70, 69]], [[76, 47], [76, 70], [74, 84]]],
  "水": [[[47, 18], [47, 76], [45, 89], [38, 82]], [[14, 44], [37, 42], [26, 62], [10, 77]], [[80, 30], [58, 49]], [[54, 47], [70, 63], [88, 72]]],
  "之": [[[40, 20], [50, 29]], [[15, 46], [63, 34], [44, 50], [28, 63]], [[14, 74], [32, 68], [60, 80], [88, 81]]],
  "间": [[[30, 20], [37, 29]], [[27, 30], [27, 84]], [[39, 25], [75, 24], [76, 84], [64, 80]], [[40, 42], [40, 76]], [[40, 42], [58, 41], [60, 76]], [[42, 56], [56, 55]], [[42, 74], [58, 73]]],
  "一": [[[12, 50], [88, 50]]],
  "十": [[[18, 38], [82, 38]], [[50, 14], [50, 88]]],
  "大": [[[16, 36], [84, 36]], [[50, 14], [22, 86]], [[50, 46], [84, 86]]],
  "天": [[[22, 22], [78, 22]], [[14, 42], [86, 42]], [[50, 22], [24, 88]], [[50, 48], [82, 86]]],
  "永": [[[52, 14], [46, 30]], [[18, 40], [82, 40]], [[50, 26], [50, 74], [40, 90]], [[50, 52], [22, 78]], [[54, 52], [84, 80]]]
};

const toPath = (pts) => pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");

/* 没有笔画数据的字：几条横笔从上到下扫过，也能显出字形 */
const fallback = () => Array.from({ length: 5 }, (_, i) => [[6, 16 + i * 17], [94, 16 + i * 17]]);

player.play(async (r) => {
  const chars = [...String(cfg.text || "")].slice(0, 8);
  const eyebrow = String(cfg.eyebrow || "").slice(0, 20), sign = String(cfg.sign || "").slice(0, 16), seal = String(cfg.seal || "").slice(0, 2);
  const per = SC.clamp(Number(cfg.per) || 460, 120, 2000);
  stage.innerHTML = `<div class="paper"></div>
    ${eyebrow ? `<div class="sc-eyebrow">${SC.esc(eyebrow)}</div>` : ""}
    <div class="tt"><div class="row" style="--h:${Math.min(14, 52 / Math.max(1, chars.length) - .3).toFixed(2)}em">${chars.map((c, i) => {
      const strokes = (STROKES[c] || fallback()).map((s) => `<path d="${toPath(s)}"/>`).join("");
      return `<svg viewBox="0 0 100 100" aria-label="${SC.esc(c)}"><defs><mask id="m${i}" maskUnits="userSpaceOnUse">${strokes}</mask></defs>
        <text x="50" y="54" font-size="86" text-anchor="middle" dominant-baseline="central" fill="currentColor" mask="url(#m${i})">${SC.esc(c)}</text></svg>`;
    }).join("")}</div></div>
    ${(sign || seal) ? `<div class="sign">${sign ? `<span class="name">${SC.esc(sign)}</span>` : ""}${seal ? `<span class="seal">${SC.esc(seal)}</span>` : ""}</div>` : ""}`;

  const paths = SC.$$("mask path", stage);
  paths.forEach((p) => { p.setAttribute("fill", "none"); p.setAttribute("stroke", "#fff"); p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round"); p.setAttribute("stroke-width", "17"); });
  const lens = paths.map((p) => p.getTotalLength());
  paths.forEach((p, i) => { p.style.strokeDasharray = lens[i]; p.style.strokeDashoffset = lens[i]; });

  const eb = SC.$(".sc-eyebrow", stage);
  if (SC.reduce) {
    paths.forEach((p) => (p.style.strokeDashoffset = 0));
    if (eb) eb.classList.add("on");
    const sg = SC.$(".sign", stage); if (sg) sg.classList.add("on");
    return;
  }
  if (eb) { await r.wait(200); eb.classList.add("on"); }
  /* 长笔画慢一些；整体超过 7 秒时按比例压缩 */
  const durs = lens.map((len) => (per * (0.55 + Math.min(len, 140) / 140)) / 1000);
  const total = durs.reduce((a, d) => a + d + 0.09, 0), k = total > 7 ? 7 / total : 1;
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i], len = lens[i], dur = durs[i] * k;
    await r.raf((dt, t) => { p.style.strokeDashoffset = len * (1 - SC.ease.out(Math.min(1, t / dur))); return t < dur; });
    await r.wait(90 * k);
  }
  const sg = SC.$(".sign", stage);
  if (sg) { await r.wait(350); sg.classList.add("on"); }
});
