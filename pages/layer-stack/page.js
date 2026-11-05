/* 分层架构图：各层从下向上堆叠入场，点击某层放大。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  hint: "点击任意一层放大 · Esc 返回",
  stagger: 260,          // 毫秒
  layers: []             // { name, desc, color, modules: [string | {name, note}] }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const COLORS = ["accent", "accent-2", "accent-3", "good", "bad"];
const CYCLE = COLORS.slice(0, 3);
let ac = null;            // 每次播放换一个，用来撤掉上一次挂在 window 上的监听

function normLayers() {
  const src = Array.isArray(cfg.layers) ? cfg.layers : [];
  return src.filter((l) => l && typeof l === "object").slice(0, 8).map((l, i) => {
    const c = String(l.color || "").replace(/^var\(--|\)$/g, "");
    const mods = (Array.isArray(l.modules) ? l.modules : []).map((m) => {
      if (typeof m === "string" || typeof m === "number") return { name: String(m), note: "" };
      if (m && typeof m === "object") return { name: String(m.name ?? ""), note: m.note ? String(m.note) : "" };
      return null;
    }).filter((m) => m && m.name).slice(0, 12);
    return {
      name: String(l.name ?? `第 ${i + 1} 层`),
      desc: l.desc ? String(l.desc) : "",
      color: COLORS.includes(c) ? c : CYCLE[i % CYCLE.length],
      modules: mods
    };
  });
}

player.play(async (r) => {
  if (ac) ac.abort();
  ac = new AbortController();
  const signal = ac.signal;
  stage.innerHTML = "";

  const layers = normLayers();
  const root = SC.el("root");
  const hasHead = cfg.eyebrow || cfg.title || cfg.subtitle;
  const head = SC.el("head", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1 class="sc-title">${SC.rich(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.rich(cfg.subtitle)}</p>` : ""}<div class="rule"></div>`);
  const stack = SC.el("stack");
  root.append(...(hasHead ? [head] : []), stack);
  if (cfg.hint && layers.length) root.append(SC.el("hint", SC.esc(cfg.hint)));
  stage.append(root);
  if (!hasHead) stack.style.left = "2.5em";

  if (!layers.length) {
    stack.append(SC.el("empty", "尚未配置 layers，请在 config.js 里添加。"));
    head.classList.add("in");
    return;
  }

  const els = layers.map((l, i) => {
    const e = SC.el("layer");
    e.tabIndex = 0; e.setAttribute("role", "button"); e.setAttribute("aria-pressed", "false");
    e.style.setProperty("--lc", `var(--${l.color})`);
    e.innerHTML = `<div class="lname"><span class="no">L${SC.pad(i + 1)}</span><b>${SC.esc(l.name)}</b>${l.desc ? `<i>${SC.esc(l.desc)}</i>` : ""}</div>
      <div class="mods">${l.modules.map((m, j) => `<div class="mod" style="--j:${j}"><span class="mn">${SC.esc(m.name)}</span>${m.note ? `<span class="mt">${SC.esc(m.note)}</span>` : ""}</div>`).join("")}</div>`;
    stack.append(e);
    return e;
  });

  /* 放大 / 恢复 */
  let cur = -1;
  const focus = (i) => {
    cur = i === cur ? -1 : i;
    stack.classList.toggle("zoom", cur >= 0);
    els.forEach((e, k) => { e.classList.toggle("on", k === cur); e.setAttribute("aria-pressed", String(k === cur)); });
  };
  els.forEach((e, i) => {
    e.addEventListener("click", (ev) => { ev.stopPropagation(); focus(i); });
    e.addEventListener("keydown", (ev) => { if (ev.key === "Enter") { ev.preventDefault(); focus(i); } });
  });
  root.addEventListener("click", () => { if (cur >= 0) focus(cur); });
  addEventListener("keydown", (ev) => { if (ev.key === "Escape" && cur >= 0) focus(cur); }, { signal });

  /* 入场：从最下面一层开始往上堆 */
  if (SC.reduce) { head.classList.add("in"); els.forEach((e) => e.classList.add("in")); return; }
  await r.wait(250);
  head.classList.add("in");
  await r.wait(350);
  const gap = Math.max(0, +cfg.stagger >= 0 ? +cfg.stagger : 260);
  for (let i = els.length - 1; i >= 0; i--) { els[i].classList.add("in"); await r.wait(gap); }
});
