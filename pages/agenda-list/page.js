/* 议程目录：大号序号配标题逐项入场，当前项高亮，其余变淡。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  current: 0,
  showTime: true,
  stagger: 110,
  items: []     // 字符串，或 { title, time, note }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

player.play(async (r) => {
  const items = (Array.isArray(cfg.items) ? cfg.items : [])
    .map((it) => (typeof it === "string" || typeof it === "number" ? { title: String(it) } : it))
    .filter((it) => it && typeof it === "object" && String(it.title ?? "").trim() !== "")
    .slice(0, 60)
    .map((it) => ({ title: String(it.title), time: it.time ? String(it.time) : "", note: it.note ? String(it.note) : "" }));
  const n = items.length;
  const cur = Number.isFinite(+cfg.current) && +cfg.current >= 1 && +cfg.current <= n ? Math.round(+cfg.current) : 0;
  const cols = n > 16 ? 3 : n > 8 ? 2 : 1, rows = Math.max(1, Math.ceil(n / cols));
  const showTime = cfg.showTime !== false;
  const hasHead = !!(cfg.eyebrow || cfg.title || cfg.subtitle);

  stage.innerHTML = `${hasHead ? `<div class="side">
      ${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}
      ${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}
      ${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}</div>` : ""}
    <ol class="list${rows > 6 ? " dense" : ""}${rows > 9 ? " nonote" : ""}${hasHead ? "" : " solo"}" style="--cols:${cols};--rows:${rows}"></ol>`;
  const list = SC.$(".list", stage);
  const els = items.map((it, i) => {
    const li = SC.el("item", `<span class="no">${SC.pad(i + 1)}</span>
      <span class="body"><span class="ti">${SC.esc(it.title)}</span>${it.note ? `<span class="nt">${SC.esc(it.note)}</span>` : ""}</span>
      ${showTime && it.time ? `<span class="tm">${SC.esc(it.time)}</span>` : ""}`, "li");
    if (i + 1 === cur) li.dataset.current = "1";
    list.append(li); return li;
  });
  if (!n) list.append(SC.el("empty", "暂无议程", "li"));

  let kk = 1;
  for (let g = 0; g < 14; g++) {
    const last = els.reduce((m, e) => Math.max(m, e.offsetTop + e.offsetHeight), 0);
    if (last <= list.clientHeight || kk < .2) break;
    kk *= .9; list.style.setProperty("--k", kk.toFixed(3));
  }

  const settle = () => { if (cur) { list.classList.add("focus"); els[cur - 1].classList.add("cur"); } };
  if (SC.reduce) { els.forEach((e) => e.classList.add("in")); settle(); return; }

  await r.wait(300);
  const gap = Math.max(0, Number.isFinite(+cfg.stagger) ? +cfg.stagger : 110);
  for (const e of els) { e.classList.add("in"); await r.wait(gap); }
  await r.wait(500);
  settle();
});
