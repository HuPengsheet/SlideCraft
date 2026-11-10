/* 卷轴展开：两根画轴从中间向左右滚开，卷面随之露出，标题与条目依次浮现。配置见 config.js。 */
const DEFAULTS = {
  theme: "paper",
  title: "卷轴展开",
  eyebrow: "",
  heading: "春华秋实",
  items: [],
  width: 52,
  duration: 2600
};

const { cfg, player, stage } = SC.init(DEFAULTS);

player.play(async (r) => {
  const full = SC.clamp(Number(cfg.width) || 52, 30, 56);
  const dur = SC.clamp(Number(cfg.duration) || 2600, 400, 8000) / 1000;
  const items = (Array.isArray(cfg.items) ? cfg.items : []).slice(0, 4);
  const eyebrow = String(cfg.eyebrow || "").slice(0, 30), heading = String(cfg.heading || "").slice(0, 12);
  stage.innerHTML = `<div class="room"></div>
    <div class="scroll" style="--full:${full}em;--open:0em">
      <div class="shadow"></div>
      <div class="sheet"><div class="content">
        ${eyebrow ? `<div class="sc-eyebrow">${SC.esc(eyebrow)}</div>` : ""}
        ${heading ? `<h1>${SC.esc(heading)}</h1>` : ""}
        ${items.length ? `<div class="rule"></div><div class="items">${items.map((it) => `<div class="item">
          ${it.tag ? `<i>${SC.esc(it.tag)}</i>` : ""}<b>${SC.esc(it.name)}</b>${it.desc ? `<span>${SC.esc(it.desc)}</span>` : ""}</div>`).join("")}</div>` : ""}
      </div></div>
      <div class="rod" style="--x:0em"></div><div class="rod" style="--x:0em"></div>
    </div>`;
  const sc = SC.$(".scroll", stage), [rl, rr] = SC.$$(".rod", stage), its = SC.$$(".item", stage);
  const set = (p) => {
    const w = full * p;
    sc.style.setProperty("--open", w + "em");
    rl.style.setProperty("--x", -(w / 2 + 0.5) + "em");
    rr.style.setProperty("--x", w / 2 + 0.5 + "em");
  };
  if (SC.reduce) { set(1); its.forEach((e) => e.classList.add("on")); return; }
  set(0.02);
  await r.wait(400);
  await r.raf((dt, t) => { set(0.02 + 0.98 * SC.ease.inOut(Math.min(1, t / dur))); return t < dur; });
  for (const e of its) { await r.wait(260); e.classList.add("on"); }
});
