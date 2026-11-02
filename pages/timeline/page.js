/* 时间线：事件沿线逐个出现，最新节点高亮并显示详情。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  orientation: "horizontal",   // horizontal | vertical
  autoAdvanceMs: 1600,         // 每个事件停留时间，毫秒
  highlight: null,             // 播放结束后停在第几个事件（从 0 开始）
  events: []                   // { when, title, text, image }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

player.play(async (r) => {
  const events = (cfg.events || []).filter((e) => e && typeof e === "object");
  const n = events.length;
  const vertical = cfg.orientation === "vertical";
  const head = (cfg.title || cfg.subtitle)
    ? `<div class="head">${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}</div>` : "";
  stage.innerHTML = `${head}<div class="main ${vertical ? "vertical" : "horizontal"}">
    <div class="track" style="--n:${Math.max(n, 1)}"><div class="rail"><i></i></div></div><div class="detail"></div></div>`;
  if (!n) return;

  const track = SC.$(".track", stage), detail = SC.$(".detail", stage);
  const nodes = events.map((e, i) => {
    const b = SC.el("node", `<span class="when">${SC.esc(e.when)}</span><span class="dot"></span><span class="ttl">${SC.esc(e.title)}</span>`, "button");
    b.type = "button";
    track.append(b);
    return b;
  });

  let cur = -1, done = false;
  const select = (i) => {
    cur = i;
    nodes.forEach((nd, k) => nd.classList.toggle("cur", k === i));
    const e = events[i];
    const card = SC.el("card sc-card", `<div class="txt"><div class="cw">${SC.esc(e.when)}</div><h2>${SC.esc(e.title)}</h2>${e.text ? `<p>${SC.rich(e.text)}</p>` : ""}</div>`);
    if (e.image) card.append(SC.media(e.image, { alt: e.title, cls: "media" }));
    detail.replaceChildren(card);
  };
  const setFill = (i) => track.style.setProperty("--p", n > 1 ? i / (n - 1) : 1);
  nodes.forEach((nd, i) => nd.addEventListener("click", () => { if (done && r.live) { select(i); } }));

  const hl = Number.isInteger(+cfg.highlight) && cfg.highlight !== null && cfg.highlight !== "" ? SC.clamp(+cfg.highlight, 0, n - 1) : n - 1;
  const finish = () => { done = true; track.classList.add("clickable"); stage.classList.add("clickable"); };

  if (SC.reduce) { nodes.forEach((nd) => nd.classList.add("on")); setFill(n - 1); select(hl); finish(); return; }

  await r.wait(400);
  const step = Math.max(100, +cfg.autoAdvanceMs || 1600);
  for (let i = 0; i < n; i++) {
    nodes[i].classList.add("on");
    setFill(i);
    select(i);
    await r.wait(step);
  }
  if (hl !== n - 1) { select(hl); }
  finish();
});
