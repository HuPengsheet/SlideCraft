/* 拍立得散落：相片从屏外抛入落在桌面上，点击拉到最前。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  hint: "点击照片拉到最前",
  seed: 7,
  spread: 0.5,
  stagger: 220,          // 毫秒
  photos: []             // { src, caption }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const K = .625;           // 布局按 100 单位宽计算，输出 em 时乘 K（舞台宽 62.5em）
const W = 13, H = 15.6;   // 相片基准尺寸，与 CSS 一致（em）
let ac = null;

function placeholder(box, media) {
  const m = SC.el("miss", "无图片");
  box.append(m);
  if (media) media.remove();
}
function mediaBox(src) {
  const box = SC.el("ph");
  if (!src || typeof src !== "string") { placeholder(box); return box; }
  const m = SC.media(src);
  m.addEventListener("error", () => placeholder(box, m), { once: true });
  box.append(m);
  return box;
}

player.play(async (r) => {
  if (ac) ac.abort();
  ac = new AbortController();
  const signal = ac.signal;
  stage.innerHTML = "";

  const photos = (Array.isArray(cfg.photos) ? cfg.photos : []).filter((p) => p && typeof p === "object").slice(0, 24);
  const root = SC.el("root");
  const hasHead = cfg.eyebrow || cfg.title || cfg.subtitle;
  const head = SC.el("head", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1 class="sc-title">${SC.rich(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.rich(cfg.subtitle)}</p>` : ""}<div class="rule"></div>`);
  root.append(SC.el("shade"));
  if (hasHead) root.append(head);
  if (cfg.hint && photos.length) root.append(SC.el("hint", SC.esc(cfg.hint)));
  stage.append(root);
  if (!photos.length) {
    root.append(SC.el("empty", "尚未配置 photos，请在 config.js 里添加。"));
    head.classList.add("in");
    return;
  }

  /* 布局：在可用区域里选一个网格，使相片尽量大；格子随机分配，位置与角度全部来自固定种子 */
  const n = photos.length, rnd = SC.rng(Math.floor(+cfg.seed) || 7);
  const spread = SC.clamp(Number.isFinite(+cfg.spread) ? +cfg.spread : .5, 0, 1);
  const ax = hasHead ? 26 : 3, ay = 3.2, aw = 97 - ax, ah = 56.25 - 2 * ay;
  let best = { s: 0, cols: 1, rows: n };
  for (let c = 1; c <= n; c++) {
    const rows = Math.ceil(n / c), s = Math.min(aw / c / W, ah / rows / H);
    if (s > best.s) best = { s, cols: c, rows };
  }
  const s = SC.clamp(best.s * 1.12, .3, 1.15);
  const { cols, rows } = best, cw = aw / cols, ch = ah / rows;
  const cells = Array.from({ length: cols * rows }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  const tilt = 3 + 10 * spread, areaCx = ax + aw / 2, areaCy = ay + ah / 2;
  const sf = Math.min(2.2, (ah * 0.92) / H, (aw * 0.6) / W);

  const els = photos.map((p, i) => {
    const cell = cells[i], col = cell % cols, row = Math.floor(cell / cols);
    const rot = (rnd() - .5) * 2 * tilt;
    const rad = Math.abs(rot) * Math.PI / 180;
    const hw = (W * Math.cos(rad) + H * Math.sin(rad)) / 2 * s, hh = (W * Math.sin(rad) + H * Math.cos(rad)) / 2 * s;
    let cx = ax + cw * (col + .5) + (rnd() - .5) * cw * .5 * spread;
    let cy = ay + ch * (row + .5) + (rnd() - .5) * ch * .5 * spread;
    cx = SC.clamp(cx, ax + Math.min(hw, aw / 2), ax + aw - Math.min(hw, aw / 2));
    cy = SC.clamp(cy, ay + Math.min(hh, ah / 2), ay + ah - Math.min(hh, ah / 2));
    /* 抛入方向：从舞台外某个方向飞来，并带额外旋转 */
    const ang = rnd() * Math.PI * 2, dist = 70 + rnd() * 20;
    const e = SC.el("pol");
    e.tabIndex = 0; e.setAttribute("role", "button"); e.setAttribute("aria-pressed", "false");
    const cap = p.caption == null ? "" : String(p.caption);
    e.setAttribute("aria-label", cap || `相片 ${i + 1}`);
    e.style.cssText = `left:${(cx * K).toFixed(2)}em;top:${(cy * K).toFixed(2)}em;--rot:${rot.toFixed(2)}deg;--s:${s.toFixed(3)};--sf:${sf.toFixed(3)};` +
      `--fx:${(Math.cos(ang) * dist * K).toFixed(1)}em;--fy:${(Math.sin(ang) * dist * K).toFixed(1)}em;--spin:${((rnd() - .5) * 120).toFixed(0)}deg;` +
      `--dx:${((areaCx - cx) * K).toFixed(2)}em;--dy:${((areaCy - cy) * K).toFixed(2)}em;z-index:${i + 1}`;
    e.append(mediaBox(p.src), SC.el("cap", cap ? `<span>${SC.esc(cap)}</span>` : ""));
    root.append(e);
    return e;
  });

  /* 点击拉到最前 */
  let top = n + 1, cur = null;
  const setFront = (e) => {
    if (cur) { cur.classList.remove("front"); cur.setAttribute("aria-pressed", "false"); }
    cur = e === cur ? null : e;
    if (cur) { cur.style.zIndex = ++top; cur.classList.add("front"); cur.setAttribute("aria-pressed", "true"); }
    root.classList.toggle("zoom", !!cur);
  };
  els.forEach((e) => {
    e.addEventListener("click", (ev) => { ev.stopPropagation(); setFront(e); });
    e.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); setFront(e); } });
  });
  root.addEventListener("click", () => { if (cur) setFront(cur); });
  addEventListener("keydown", (ev) => { if (ev.key === "Escape" && cur) setFront(cur); }, { signal });

  if (SC.reduce) { head.classList.add("in"); els.forEach((e) => e.classList.add("in")); return; }
  await r.wait(250);
  head.classList.add("in");
  await r.wait(300);
  const gap = Math.max(0, +cfg.stagger >= 0 ? +cfg.stagger : 220);
  for (const e of els) { e.classList.add("in"); await r.wait(gap); }
});
