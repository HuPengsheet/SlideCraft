/* 分屏标题入场：竖带依次滑入，合成完整画面。配置见 config.js。 */
const DEFAULTS = { theme: "dark", bands: 7, direction: "alternate", title: "", subtitle: "", image: "", stagger: 110 };
const { cfg, player, stage } = SC.init(DEFAULTS);

const prog = (t, a, b) => SC.clamp((t - a) / (b - a), 0, 1);

player.play(async (r) => {
  stage.innerHTML = "";
  const n = SC.clamp(Math.round(+cfg.bands) || 7, 2, 16);
  const dir = ["up", "down", "alternate", "center"].includes(cfg.direction) ? cfg.direction : "alternate";
  const stg = SC.clamp(+cfg.stagger >= 0 ? +cfg.stagger : 110, 0, 600) / 1000;
  const lines = String(cfg.title ?? "").split("\n");
  const longest = Math.max(1, ...lines.map((l) => [...l].length));
  const fs = SC.clamp(46 / longest, 3, 7.4);
  const img = String(cfg.image || "").trim();

  /* 每条带里放一份完整合成图，按带序号左移，拼起来就是整幅画面 */
  const copyHTML = `<span class="bar"></span><div class="ttl" style="font-size:${fs}em">${lines.map((l) => SC.esc(l)).join("<br>")}</div>${cfg.subtitle ? `<p class="sub">${SC.esc(cfg.subtitle)}</p>` : ""}`;
  const bands = [], seps = [];
  for (let i = 0; i < n; i++) {
    const b = SC.el("band");
    b.style.left = (i * 100 / n) + "%"; b.style.width = (100 / n + (i < n - 1 ? .05 : 0)) + "%";
    b.innerHTML = `<div class="comp">
      <div class="img"></div><div class="fx"></div><div class="scrim"></div>
      <div class="copy"><div style="padding:0 7em;width:100%">${copyHTML}</div></div></div>`;
    stage.append(b); bands.push(b);
    if (img) { const el = SC.$(".img", b); el.style.backgroundImage = `url(${JSON.stringify(img)})`; }
    else SC.$(".img", b).remove();
  }
  /* 带内合成图的宽度必须等于舞台宽度：用 JS 按实际像素设定，避免百分比取整误差 */
  const fit = () => {
    const W = stage.clientWidth;
    bands.forEach((b, i) => { const c = SC.$(".comp", b); c.style.width = W + "px"; c.style.left = -(b.offsetLeft) + "px"; });
  };
  fit();
  for (let i = 1; i < n; i++) { const s = SC.el("sep"); s.style.left = (i * 100 / n) + "%"; stage.append(s); seps.push(s); }
  /* 窗口大小变化时重新对齐；每次播放只绑一次 */
  if (!window.__tsFit) { window.__tsFit = true; addEventListener("resize", () => window.__tsRefit && window.__tsRefit()); }
  window.__tsRefit = fit;

  const dur = .9;
  const offs = bands.map((_, i) => {
    const up = dir === "up" || (dir === "alternate" && i % 2 === 0) || (dir === "center" && i % 2 === 0);
    return up ? 1 : -1;
  });
  const order = (i) => dir === "center" ? Math.abs(i - (n - 1) / 2) : i;
  const total = dur + order(dir === "center" ? 0 : n - 1) * stg;
  const show = (t) => {
    bands.forEach((b, i) => {
      const e = SC.ease.out(prog(t, .2 + order(i) * stg, .2 + order(i) * stg + dur));
      b.style.transform = `translateY(${(1 - e) * 100 * offs[i]}%)`;
      b.style.opacity = prog(t, .2 + order(i) * stg, .2 + order(i) * stg + .15);
    });
    const f = 1 - SC.ease.inOut(prog(t, total + .5, total + 1.2));
    seps.forEach((s) => { s.style.opacity = t > .2 ? .35 * f : 0; });
  };
  if (SC.reduce) { show(99); return; }
  show(0);
  await r.raf((dt, t) => { show(t); return t < total + 1.4; });
  show(99);
});
