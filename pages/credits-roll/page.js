/* 片尾滚动字幕：匀速上滚，停在结束标题。配置见 config.js。 */
const DEFAULTS = { theme: "dark", scrollSpeed: 4, groups: [], endTitle: "", endSub: "" };
const { cfg, player, stage } = SC.init(DEFAULTS);

player.play(async (r) => {
  stage.innerHTML = "";
  const groups = (Array.isArray(cfg.groups) ? cfg.groups : []).filter((g) => g && typeof g === "object");
  const person = (p) => {
    if (p && typeof p === "object") return { role: String(p.role ?? "").trim(), name: String(p.name ?? "").trim() };
    return { role: "", name: String(p ?? "").trim() };
  };
  const html = groups.map((g) => {
    const rows = (Array.isArray(g.people) ? g.people : []).map(person).filter((p) => p.name || p.role).map((p) =>
      p.role ? `<div class="row"><span class="role">${SC.esc(p.role)}</span><span class="name">${SC.esc(p.name)}</span></div>`
        : `<div class="row solo"><span class="name">${SC.esc(p.name)}</span></div>`).join("");
    return `<section class="grp">${g.title ? `<div class="gt">${SC.esc(g.title)}</div>` : ""}${rows}</section>`;
  }).join("");
  const et = String(cfg.endTitle ?? "").trim();
  const end = et || cfg.endSub ? `<section class="end"><div class="t">${et.split("\n").map((l) => SC.esc(l)).join("<br>")}</div>${cfg.endSub ? `<div class="s">${SC.esc(cfg.endSub)}</div>` : ""}<i class="bar"></i></section>` : "";
  stage.innerHTML = `<div class="view"><div class="roll">${html}${end}</div></div>`;
  const roll = SC.$(".roll", stage);
  const H = stage.clientHeight, em = parseFloat(getComputedStyle(stage).fontSize) || 16;
  const last = roll.lastElementChild;
  /* 终点：最后一块的中心对齐舞台中心（只有分组时对齐其底部偏上） */
  const lastCenter = last ? last.offsetTop + last.offsetHeight / 2 : 0;
  const y0 = H;                       // 起点：整块在舞台下方
  const y1 = Math.min(H / 2 - lastCenter, y0);
  const dist = y0 - y1;
  const set = (y) => { roll.style.transform = `translateY(${y}px)`; };
  if (SC.reduce || !last) { set(y1); return; }
  const v = SC.clamp(+cfg.scrollSpeed || 4, .5, 30) * em;   // px/s
  set(y0);
  await r.wait(400);
  const ease = Math.min(dist, 6 * em);          // 最后一段减速
  let y = y0;
  await r.raf((dt) => {
    const rem = y - y1;
    const s = rem < ease ? Math.max(.06, rem / ease) : 1;
    y -= v * s * dt;
    if (y <= y1 + .3) { set(y1); return false; }
    set(y);
  });
  set(y1);
});
