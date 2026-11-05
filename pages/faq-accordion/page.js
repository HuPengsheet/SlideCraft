/* 问答折叠：问题依次入场，自动逐项展开收起，播放后可点击展开。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  autoOpen: true,
  holdMs: 1800,
  exclusive: true,
  items: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const CHEV = `<svg viewBox="0 0 16 16"><path d="M3.5 6l4.5 4.5L12.5 6"/></svg>`;

player.play(async (r) => {
  const items = (Array.isArray(cfg.items) ? cfg.items : []).filter((x) => x && typeof x === "object").slice(0, 30);
  const exclusive = cfg.exclusive !== false;
  const hold = Math.max(200, Number.isFinite(+cfg.holdMs) ? +cfg.holdMs : 1800);

  stage.innerHTML = "";
  const side = SC.el("side", `<div class="bar"></div>${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}`);
  const list = SC.el("list nolock");
  stage.append(side, list);
  if (!items.length) { list.textContent = "（没有问题）"; side.classList.add("on"); return; }

  const els = items.map((x, i) => {
    const e = SC.el("it", `<button class="q" aria-expanded="false"><span class="n">${SC.pad(i + 1)}</span><span class="t">${SC.rich(x.q ?? "")}</span>${CHEV}</button><div class="a"><div><p>${SC.rich(x.a ?? "")}</p></div></div>`);
    list.append(e); return e;
  });
  const setOpen = (e, v) => { e.classList.toggle("open", v); SC.$(".q", e).setAttribute("aria-expanded", String(v)); };
  const open = (e) => {
    if (exclusive) els.forEach((o) => o !== e && setOpen(o, false));
    setOpen(e, true);
    /* 展开动画结束后把它滚到可见 */
    setTimeout(() => {
      const top = e.offsetTop - list.offsetTop, bot = top + e.offsetHeight;
      if (bot > list.scrollTop + list.clientHeight) list.scrollTo({ top: bot - list.clientHeight + 8, behavior: SC.reduce ? "auto" : "smooth" });
      else if (top < list.scrollTop) list.scrollTo({ top: Math.max(0, top - 8), behavior: SC.reduce ? "auto" : "smooth" });
    }, 560);
  };
  let interactive = false;
  els.forEach((e) => SC.$(".q", e).addEventListener("click", () => {
    if (!interactive) return;
    if (e.classList.contains("open")) setOpen(e, false); else open(e);
    SC.$(".q", e).blur();
  }));

  if (SC.reduce) { side.classList.add("on"); els.forEach((e) => e.classList.add("on")); open(els[0]); interactive = true; list.classList.remove("nolock"); return; }

  await r.wait(250); side.classList.add("on");
  await r.wait(400);
  for (const e of els) { e.classList.add("on"); await r.wait(180); }
  await r.wait(500);
  if (cfg.autoOpen !== false) {
    for (const e of els) {
      open(e); await r.wait(hold);
      setOpen(e, false); await r.wait(450);
    }
    open(els[0]);
  }
  interactive = true;
});
