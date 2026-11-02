/* 无限跑马灯：纯 CSS 动效，不需要 play()。
 * 无缝循环 = 一组条目复制两份，轨道平移 -50%。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  gap: 3,              // em
  pauseOnHover: true,
  fade: true,
  rows: []             // { items, direction, speed, style }
};

const { cfg, stage } = SC.init(DEFAULTS);

function itemEl(it, style) {
  if (typeof it === "string") it = { text: it };
  if (it.src) {
    const d = SC.el("it img");
    d.append(SC.media(it.src, { alt: it.text || "" }));
    return d;
  }
  return SC.el("it", SC.esc(it.text ?? ""));
}

function buildGroup(items, style, copies) {
  const g = SC.el("grp");
  for (let c = 0; c < copies; c++) for (const it of items) g.append(itemEl(it, style));
  return g;
}

stage.classList.toggle("fade", cfg.fade !== false);
stage.classList.toggle("pause", cfg.pauseOnHover !== false);
stage.style.setProperty("--gap", (cfg.gap ?? 3) + "em");
stage.innerHTML = `${cfg.title ? `<div class="head"><h1 class="sc-title">${SC.esc(cfg.title)}</h1>${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}</div>` : ""}<div class="rows"></div>`;
const rows = SC.$(".rows", stage);

for (const row of cfg.rows || []) {
  const items = (row.items || []).filter((x) => x != null && x !== "");
  if (!items.length) continue;
  const style = row.style || "text";
  const wrap = SC.el(`row st-${style}${row.direction === "right" ? " rev" : ""}`);
  wrap.style.setProperty("--dur", (row.speed || 30) + "s");
  const track = SC.el("track");
  // 先放一份测量宽度，不足舞台宽度就整组重复，保证每份至少铺满一屏
  const g1 = buildGroup(items, style, 1);
  track.append(g1); wrap.append(track); rows.append(wrap);
  const w = g1.getBoundingClientRect().width || 1;
  const copies = Math.max(1, Math.ceil(stage.getBoundingClientRect().width / w));
  if (copies > 1) g1.replaceWith(buildGroup(items, style, copies));
  const a = track.firstElementChild;
  const b = a.cloneNode(true);
  b.setAttribute("aria-hidden", "true");
  for (const v of SC.$$("video", b)) { v.muted = true; v.play().catch(() => {}); }  // cloneNode 不会复制 muted
  track.append(b);
}
