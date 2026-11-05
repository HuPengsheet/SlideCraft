/* 通知堆叠：卡片滑入，旧的下沉缩小淡出。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  position: "top-right",
  intervalMs: 1300,
  maxVisible: 3,
  items: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const P = (d) => `<svg viewBox="0 0 24 24">${d}</svg>`;
const ICONS = {
  mail: P('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
  bell: P('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 21h4"/>'),
  cart: P('<path d="M3 4h3l2.5 11h9.5l2-8H7"/><circle cx="10" cy="19" r="1.2"/><circle cx="17" cy="19" r="1.2"/>'),
  chat: P('<path d="M4 5h16v11H10l-5 4v-4H4z"/>'),
  alert: P('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>'),
  check: P('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>'),
  card: P('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>'),
  truck: P('<path d="M2 6h12v10H2zM14 10h4l4 3v3h-8"/><circle cx="6.5" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>'),
  user: P('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'),
  cloud: P('<path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 11a3.5 3.5 0 0 1-.5 7z"/>')
};
const TONES = ["accent", "accent-2", "accent-3", "good", "bad"];

player.play(async (r) => {
  stage.innerHTML = "";
  const items = (Array.isArray(cfg.items) ? cfg.items : []).filter((x) => x && typeof x === "object");
  const maxV = SC.clamp(Math.round(+cfg.maxVisible) || 3, 1, 5);
  const pos = { "top-right": "tr", "top-left": "tl", "bottom-right": "br", "bottom-left": "bl", center: "c" }[cfg.position] || "tr";
  const isTop = pos[0] !== "b";
  const dir = isTop ? 1 : -1;

  const copy = SC.el(`copy ${pos === "c" ? "mid" : pos[1] === "r" ? "left" : "right"}`);
  if (cfg.title || cfg.subtitle) {
    copy.innerHTML = `<div class="cnt"></div><h1></h1><p></p>`;
    SC.$("h1", copy).textContent = cfg.title || "";
    SC.$("p", copy).textContent = cfg.subtitle || "";
    stage.append(copy);
  }
  const cnt = SC.$(".cnt", copy);

  const deck = SC.el(`deck ${pos} ${isTop ? "top" : "bot"}`);
  const more = SC.el("more");
  deck.append(more);
  stage.append(deck);
  deck.style.setProperty("--dir", dir);

  const cards = [];
  const layout = () => {
    const n = cards.length;
    cards.forEach((c, i) => {
      const d = n - 1 - i;
      c.style.setProperty("--d", Math.min(d, maxV));
      c.classList.toggle("gone", d >= maxV);
    });
    const hidden = Math.max(0, n - maxV);
    more.textContent = `还有 ${hidden} 条`;
    more.classList.toggle("on", hidden > 0);
    if (cnt) cnt.textContent = n ? `${SC.pad(n)} / ${SC.pad(items.length)}` : "";
  };
  const make = (it) => {
    const tone = TONES.includes(it.tone) ? it.tone : "accent";
    const c = SC.el("card enter");
    c.style.setProperty("--tone", `var(--${tone})`);
    c.style.setProperty("--dir", dir);
    const app = String(it.app || "");
    c.innerHTML = `<div class="ic"></div><div class="bd"><div class="tp"><span></span><span></span></div><h3></h3><p></p></div>`;
    const ic = SC.$(".ic", c);
    if (ICONS[it.icon]) ic.innerHTML = ICONS[it.icon]; else ic.textContent = (app || String(it.title || "!")).trim().slice(0, 1);
    const [a, t] = SC.$$(".tp span", c);
    a.textContent = app; t.textContent = it.time || "";
    SC.$("h3", c).textContent = it.title || "";
    SC.$("p", c).textContent = it.text || "";
    const side = pos === "c" ? 0 : pos[1] === "r" ? 1 : -1;
    c.style.setProperty("--from", side ? side * 30 + "em" : "0");
    c.style.setProperty("--fy", side ? "0" : -dir * 2 + "em");
    return c;
  };
  const push = (it) => {
    const c = make(it);
    deck.append(c); cards.push(c);
    c.offsetWidth;                       /* 强制回流，让 enter 状态生效后再过渡 */
    c.classList.remove("enter");
    layout();
  };

  if (SC.reduce) {
    copy.classList.add("in");
    items.forEach(push);
    return;
  }
  await r.wait(200);
  copy.classList.add("in");
  await r.wait(700);
  for (let i = 0; i < items.length; i++) {
    push(items[i]);
    if (i < items.length - 1) await r.wait(Math.max(200, +cfg.intervalMs || 1300));
  }
});
