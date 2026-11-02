/* 数字滚动：几个大数字依次出现并滚动到目标值。
 * 配置见 config.js。这里的 DEFAULTS 是没写 config 时的默认值。 */
const DEFAULTS = {
  theme: "dark",
  title: "数字滚动",
  eyebrow: "",
  heading: "",
  subheading: "",
  stagger: 350,          // 相邻数字出现的间隔，毫秒
  duration: 1800,        // 单个数字滚动时长，毫秒
  items: []              // { value, label, unit, prefix, decimals, note, progress }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

player.play(async (r) => {
  const n = cfg.items.length;
  const head = (cfg.eyebrow || cfg.heading || cfg.subheading)
    ? `<div>${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}
       ${cfg.heading ? `<h1 class="sc-title">${SC.esc(cfg.heading)}</h1>` : ""}
       ${cfg.subheading ? `<p class="sc-sub">${SC.esc(cfg.subheading)}</p>` : ""}</div>` : "";
  stage.innerHTML = `${head}<div class="grid" style="--cols:${Math.min(n, cfg.columns || 3)}"></div>`;
  const grid = SC.$(".grid", stage);

  const nodes = cfg.items.map((it) => {
    const d = SC.el("item sc-card", `
      <div class="val"><span class="n"></span>${it.unit ? `<small>${SC.esc(it.unit)}</small>` : ""}</div>
      <div class="bar"><i style="--w:${SC.clamp(it.progress ?? 100, 0, 100)}%"></i></div>
      <div class="lab">${SC.esc(it.label)}</div>
      ${it.note ? `<div class="note">${SC.esc(it.note)}</div>` : ""}`);
    SC.$(".n", d).textContent = (it.prefix || "") + SC.fmt(it.from ?? 0, { decimals: it.decimals || 0 });
    grid.append(d); return d;
  });

  await r.wait(400);
  const jobs = [];
  for (let i = 0; i < n; i++) {
    const it = cfg.items[i];
    nodes[i].classList.add("on");
    jobs.push(SC.countUp(r, SC.$(".n", nodes[i]), it.value, {
      from: it.from ?? 0, dur: cfg.duration, decimals: it.decimals || 0, prefix: it.prefix || ""
    }));
    await r.wait(cfg.stagger);
  }
  await Promise.all(jobs);
});
