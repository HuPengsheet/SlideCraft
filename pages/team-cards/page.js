/* 团队卡片：卡片依次入场，聚光灯轮流点亮每个人；播放后悬停或点击可展开。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  eyebrow: "",
  layout: null,        // "row" | "grid"，null 为自动
  spotlightMs: 1800,   // 每人聚焦时长，毫秒
  stagger: 140,        // 卡片入场间隔，毫秒
  people: []           // { name, role, bio, photo, tags }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const hash = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const initials = (name) => {
  const s = String(name || "?").trim();
  if (/[㐀-鿿]/.test(s)) return s.slice(-2);
  const w = s.split(/\s+/).filter(Boolean);
  return ((w[0]?.[0] || "?") + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
};
/* 按姓名生成固定的渐变：从三种强调色里取两种，角度也由姓名决定 */
const gradient = (name) => {
  const rnd = SC.rng(hash(name));
  const c = ["var(--accent)", "var(--accent-2)", "var(--accent-3)"];
  const a = Math.floor(rnd() * 3), b = (a + 1 + Math.floor(rnd() * 2)) % 3;
  return `linear-gradient(${Math.floor(rnd() * 360)}deg, ${c[a]}, ${c[b]})`;
};

function avatar(p) {
  const av = SC.el("av");
  const mono = () => { av.replaceChildren(SC.el("mono", SC.esc(initials(p.name)))); av.style.background = gradient(p.name); };
  if (p.photo) {
    const img = SC.media(p.photo, { alt: p.name });
    img.addEventListener("error", mono);
    av.append(img);
  } else mono();
  return av;
}

player.play(async (r) => {
  const people = (Array.isArray(cfg.people) ? cfg.people : []).filter((p) => p && typeof p === "object" && p.name).slice(0, 8);
  const n = people.length;
  const want = cfg.layout === "row" || cfg.layout === "grid" ? cfg.layout : n <= 4 ? "row" : "grid";
  const layout = want === "row" && n > 5 ? "grid" : want;   // 一排放不下 6 人以上，自动改网格
  const cols = n <= 2 ? Math.max(n, 1) : n === 4 ? 2 : n <= 6 ? 3 : 4;

  const head = (cfg.eyebrow || cfg.title || cfg.subtitle)
    ? `<div class="head">${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}</div>` : "";
  stage.innerHTML = `${head}<div class="cards ${layout}" style="--c:${cols}"></div>`;
  const box = SC.$(".cards", stage);

  const cards = people.map((p) => {
    const c = SC.el("card");
    c.tabIndex = 0;
    c.append(avatar(p));
    c.insertAdjacentHTML("beforeend", `<div class="nm">${SC.esc(p.name)}</div>${p.role ? `<div class="rl">${SC.esc(p.role)}</div>` : ""}
      ${p.bio ? `<div class="bio"><p>${SC.rich(p.bio)}</p></div>` : ""}
      ${Array.isArray(p.tags) && p.tags.length ? `<div class="tags">${p.tags.map((t) => `<span>${SC.esc(t)}</span>`).join("")}</div>` : ""}`);
    box.append(c); return c;
  });

  let cur = -1, pinned = -1;
  const setActive = (i) => { cur = i; cards.forEach((c, k) => c.classList.toggle("act", k === i)); };

  const makeLive = () => {
    cards.forEach((c, i) => {
      c.classList.add("live");
      c.addEventListener("mouseenter", () => { if (r.live && pinned < 0) setActive(i); });
      c.addEventListener("mouseleave", () => { if (r.live && pinned < 0) setActive(-1); });
      c.addEventListener("focus", () => { if (r.live && pinned < 0) setActive(i); });
      c.addEventListener("blur", () => { if (r.live && pinned < 0) setActive(-1); });
      c.addEventListener("click", () => {
        if (!r.live) return;
        if (pinned === i) { pinned = -1; setActive(i); } else { pinned = i; setActive(i); }
      });
      c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); c.click(); } });
    });
  };

  if (!n) return;
  if (SC.reduce) { cards.forEach((c) => c.classList.add("in")); makeLive(); return; }

  await r.wait(350);
  for (const c of cards) { c.classList.add("in"); await r.wait(+cfg.stagger >= 0 ? +cfg.stagger : 140); }
  await r.wait(500);
  const hold = Math.max(300, +cfg.spotlightMs || 1800);
  for (let i = 0; i < n; i++) { setActive(i); await r.wait(hold); }
  setActive(-1);
  await r.wait(500);
  makeLive();
});
