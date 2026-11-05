/* 评价墙：多列评价卡片，相邻列反向缓慢滚动，悬停某列暂停。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  columns: 3,
  speed: 2.2,      // em/秒
  items: []        // { name, text, role, rating, avatar }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const hash = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const initials = (name) => {
  const s = String(name || "?").trim();
  if (/[㐀-鿿]/.test(s)) return s.slice(-2);
  const w = s.split(/\s+/).filter(Boolean);
  return ((w[0]?.[0] || "?") + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
};
const gradient = (name) => {
  const rnd = SC.rng(hash(name));
  const c = ["var(--accent)", "var(--accent-2)", "var(--accent-3)"];
  const a = Math.floor(rnd() * 3), b = (a + 1 + Math.floor(rnd() * 2)) % 3;
  return `linear-gradient(${Math.floor(rnd() * 360)}deg, ${c[a]}, ${c[b]})`;
};
const STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.5 6 20.9l1.3-6.7-5-4.7 6.8-.8z"/></svg>';
const stars = (n) => `<span class="stars">${[1, 2, 3, 4, 5].map((i) => STAR.replace("<svg", `<svg class="${i <= n ? "on" : ""}"`)).join("")}</span>`;

function avatar(it) {
  const av = SC.el("av");
  const mono = () => { av.replaceChildren(SC.el("mono", SC.esc(initials(it.name)))); av.style.background = gradient(it.name); };
  if (it.avatar) { const img = SC.media(String(it.avatar), { alt: it.name }); img.addEventListener("error", mono); av.append(img); } else mono();
  return av;
}

player.play(async (r) => {
  const items = (Array.isArray(cfg.items) ? cfg.items : [])
    .filter((it) => it && typeof it === "object" && String(it.text ?? "").trim() !== "")
    .map((it) => ({ name: String(it.name ?? "匿名用户"), text: String(it.text), role: it.role ? String(it.role) : "", avatar: it.avatar,
      rating: it.rating === undefined || it.rating === null || it.rating === "" || !Number.isFinite(+it.rating) ? null : SC.clamp(Math.round(+it.rating), 0, 5) }));
  const hasHead = !!(cfg.eyebrow || cfg.title || cfg.subtitle);
  const nCols = SC.clamp(Math.round(+cfg.columns) || 3, 1, hasHead ? 3 : 5);
  const speed = Number.isFinite(+cfg.speed) ? Math.max(0, +cfg.speed) : 2.2;

  const rated = items.filter((i) => i.rating !== null);
  const avg = rated.length ? rated.reduce((s, i) => s + i.rating, 0) / rated.length : 0;
  stage.innerHTML = "";
  if (hasHead) {
    stage.append(SC.el("side", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}
      ${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}
      ${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}
      ${rated.length ? `<div class="avg"><b>${avg.toFixed(1)}</b><span>平均评分 · ${items.length} 条</span></div>${stars(Math.round(avg))}` : ""}`));
  }
  const cols = SC.el("cols");
  stage.append(cols);
  if (!items.length) { cols.append(SC.el("empty", "暂无评价")); }

  const card = (it) => SC.el("card", `${it.rating !== null ? stars(it.rating) : ""}<p>${SC.rich(it.text)}</p>`);
  const cardFull = (it) => {
    const c = card(it);
    const who = SC.el("who"); who.append(avatar(it));
    who.append(SC.el("meta", `<div class="nm">${SC.esc(it.name)}</div>${it.role ? `<div class="rl">${SC.esc(it.role)}</div>` : ""}`));
    c.append(who); return c;
  };

  const cols_ = [];
  if (items.length) {
    for (let c = 0; c < nCols; c++) {
      const col = SC.el("col"), track = SC.el("track");
      col.append(track); cols.append(col);
      const mine = items.filter((_, i) => i % nCols === c);
      cols_.push({ col, track, mine: mine.length ? mine : items, dir: c % 2 === 0 ? -1 : 1, y: 0, h: 0, hover: false });
      col.addEventListener("mouseenter", () => { cols_[c].hover = true; });
      col.addEventListener("mouseleave", () => { cols_[c].hover = false; });
    }
  }

  const fill = () => {
    const em = parseFloat(getComputedStyle(stage).fontSize) || 16;
    for (const c of cols_) {
      c.track.replaceChildren();
      const first = c.mine.map(cardFull);
      c.track.append(...first);
      const one = c.track.offsetHeight;               // 一组的高度（含 margin-bottom）
      c.h = one;
      const need = c.col.clientHeight * 2 + one;
      let guard = 0;
      while (c.track.offsetHeight < need && guard++ < 40) c.track.append(...c.mine.map(cardFull));
      c.h = one;
      c.em = em;
    }
  };
  fill();
  const place = (c) => {
    if (!c.h) return;
    c.y = ((c.y % c.h) + c.h) % c.h;
    c.track.style.transform = `translate3d(0, ${(c.dir < 0 ? -c.y : c.y - c.h).toFixed(2)}px, 0)`;
  };
  cols_.forEach((c, i) => { c.y = c.h * (.12 + .21 * i); place(c); });

  requestAnimationFrame(() => { stage.querySelector(".side")?.classList.add("in"); cols.classList.add("in"); });
  if (SC.reduce || !cols_.length) { stage.querySelector(".side")?.classList.add("in"); cols.classList.add("in"); return; }

  /* 常驻滚动：一直跑到下一次重播把它中断。幅度由 ramp 在开场淡入 */
  let ramp = 0, lastW = stage.clientWidth;
  await r.raf((dt) => {
    ramp = Math.min(1, ramp + dt / 1.2);
    if (stage.clientWidth !== lastW) { lastW = stage.clientWidth; const ys = cols_.map((c) => c.y / (c.h || 1)); fill(); cols_.forEach((c, i) => { c.y = ys[i] * c.h; }); }
    for (const c of cols_) {
      if (!c.hover) c.y += speed * c.em * dt * SC.ease.out(ramp);
      place(c);
    }
  });
});
