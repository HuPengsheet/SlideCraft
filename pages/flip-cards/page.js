/* 翻转卡片：入场后依次翻一遍，之后点击或悬停翻转。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  hint: null,            // null = 按 flipOn 自动生成
  columns: 0,            // 0 = 自动
  flipOn: "click",       // click | hover
  preview: true,
  cards: []              // { front: string | {title,kicker,icon,image}, back: string | {title,text}, color }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const COLORS = ["accent", "accent-2", "accent-3", "good", "bad"];
const P = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONS = {
  spark: P('<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>'),
  layers: P('<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>'),
  chart: P('<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'),
  shield: P('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
  bolt: P('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
  globe: P('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'),
  cube: P('<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/>'),
  clock: P('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')
};
let ac = null;

const str = (v) => (v == null ? "" : String(v));
function normCards() {
  return (Array.isArray(cfg.cards) ? cfg.cards : []).filter((c) => c != null).slice(0, 12).map((c, i) => {
    const o = typeof c === "object" ? c : { front: c };
    const f = o.front && typeof o.front === "object" ? o.front : { title: o.front };
    const b = o.back && typeof o.back === "object" ? o.back : { text: o.back };
    const col = str(o.color).replace(/^var\(--|\)$/g, "");
    return { title: str(f.title), kicker: str(f.kicker), icon: ICONS[f.icon] ? f.icon : "", image: typeof f.image === "string" ? f.image : "",
      bt: str(b.title), text: str(b.text), color: COLORS.includes(col) ? col : COLORS[i % 3] };
  });
}

/* 背面文字自动缩小，仍放不下则截断 */
function fitText(el) {
  let fs = 0.9;
  el.style.setProperty("--bf", fs + "em");
  while (el.scrollHeight > el.clientHeight + 1 && fs > 0.55) { fs -= 0.05; el.style.setProperty("--bf", fs.toFixed(2) + "em"); }
  if (el.scrollHeight > el.clientHeight + 1) {
    const full = el.textContent; let lo = 0, hi = full.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      el.textContent = full.slice(0, mid).trimEnd() + "…";
      if (el.scrollHeight > el.clientHeight + 1) hi = mid - 1; else lo = mid;
    }
    el.textContent = full.slice(0, lo).trimEnd() + "…";
  }
}

player.play(async (r) => {
  if (ac) ac.abort();
  ac = new AbortController();
  stage.innerHTML = "";

  const cards = normCards(), hover = cfg.flipOn === "hover";
  const root = SC.el("root"), hasHead = cfg.eyebrow || cfg.title || cfg.subtitle;
  const head = SC.el("head", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1 class="sc-title">${SC.rich(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.rich(cfg.subtitle)}</p>` : ""}`);
  const grid = SC.el("grid");
  root.append(...(hasHead ? [head] : []), grid);
  const hint = cfg.hint == null ? (hover ? "鼠标移到卡片上查看背面" : "点击卡片翻转") : cfg.hint;
  if (hint && cards.length) root.append(SC.el("hint", SC.esc(hint)));
  stage.append(root);
  if (!cards.length) { root.append(SC.el("empty", "尚未配置 cards，请在 config.js 里添加。")); head.classList.add("in"); return; }

  /* 布局：先定列数，再让卡片尽量大 */
  const n = cards.length;
  const cols = Math.min(n, Math.max(1, Math.floor(+cfg.columns) || (n <= 3 ? n : n === 4 ? 4 : n <= 8 ? Math.ceil(n / 2) : Math.ceil(n / 3))), 6);
  const rows = Math.ceil(n / cols), gap = 1.6;
  const top = hasHead ? 17 : 4, bottom = hint ? 5 : 4, aw = 100 - 12, ah = 56.25 - top - bottom;
  const w = Math.max(8, Math.min((aw - (cols - 1) * gap) / cols, ((ah - (rows - 1) * gap) / rows) * 0.8, 24));
  const h = Math.min(w * 1.25, (ah - (rows - 1) * gap) / rows);
  const K = .625;   // 上面按 100 单位宽计算，输出时乘 K
  grid.style.top = top * K + "em"; grid.style.bottom = bottom * K + "em";
  grid.style.paddingInline = (100 - cols * w - (cols - 1) * gap) / 2 * K + "em";
  grid.style.gap = gap * K + "em";

  let interactive = false;
  const els = cards.map((c, i) => {
    const e = SC.el("card", "", "button");
    e.style.cssText = `width:${w * K}em;height:${h * K}em;--i:${i};--c:var(--${c.color})`;
    e.setAttribute("aria-label", c.title || `卡片 ${i + 1}`);
    e.setAttribute("aria-pressed", "false");
    const front = SC.el("face front");
    if (c.image) {
      const pic = SC.el("pic"), m = SC.media(c.image);
      m.addEventListener("error", () => m.replaceWith(SC.el("miss")), { once: true });
      pic.append(m); front.append(pic);
    } else if (c.icon) front.append(SC.el("ico", ICONS[c.icon]));
    else front.append(SC.el("num", SC.pad(i + 1)));
    front.insertAdjacentHTML("beforeend", `${c.kicker ? `<div class="kick">${SC.esc(c.kicker)}</div>` : ""}<h3>${SC.esc(c.title)}</h3>`);
    const back = SC.el("face back", `${c.bt ? `<h4>${SC.esc(c.bt)}</h4>` : ""}<div class="txt"></div>`);
    back.lastChild.textContent = c.text;
    e.append(Object.assign(SC.el("inner"), {}));
    SC.$(".inner", e).append(front, back);
    grid.append(e);
    return e;
  });
  const setFlip = (e, v) => { e.classList.toggle("flip", v); e.setAttribute("aria-pressed", String(v)); };
  els.forEach((e) => {
    let hov = false;   // 鼠标悬停已翻开时，随后的点击不再翻回去
    e.addEventListener("click", () => { if (!interactive || (hover && hov)) return; setFlip(e, !e.classList.contains("flip")); });
    if (hover) {
      e.addEventListener("pointerenter", (ev) => { if (interactive && ev.pointerType === "mouse") { hov = true; setFlip(e, true); } });
      e.addEventListener("pointerleave", (ev) => { if (ev.pointerType === "mouse") { hov = false; if (interactive) setFlip(e, false); } });
    }
  });
  const fitAll = () => els.forEach((e) => { const t = SC.$(".txt", e); const full = t.dataset.full ?? (t.dataset.full = t.textContent); t.textContent = full; fitText(t); });
  fitAll();

  if (SC.reduce) { head.classList.add("in"); els.forEach((e) => e.classList.add("in")); interactive = true; return; }
  await r.wait(250);
  head.classList.add("in");
  els.forEach((e) => e.classList.add("in"));
  await r.wait(600 + n * 80);
  if (cfg.preview !== false) {
    const gap = Math.max(140, 3000 / n > 320 ? 320 : 3000 / n);
    for (const e of els) { setFlip(e, true); r.spawn(r.wait(1100).then(() => setFlip(e, false))); await r.wait(gap); }
    await r.wait(1300);
  }
  interactive = true;
});
