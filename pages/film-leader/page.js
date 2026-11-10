/* 老电影片头：5 到 1 的倒数圈，扇形扫过、十字线、胶片划痕与灰尘，倒数结束后画面切到标题卡。
 * 配置见 config.js。这里的 DEFAULTS 是没写 config 时的默认值。 */
const DEFAULTS = {
  theme: "dark",
  title: "老电影片头",
  from: 5,
  eyebrow: "",
  heading: "第一幕",
  subheading: "",
  beatMs: 1000,          // 每个数字停留的时长，毫秒
  grain: 1,
  sepia: false
};

const { cfg, player, stage } = SC.init(DEFAULTS);

player.play(async (r) => {
  const w = (ms) => r.wait(SC.reduce ? 0 : ms);
  const from = SC.clamp(Math.round(Number(cfg.from) || 5), 2, 9);
  const k = SC.clamp(Number(cfg.grain) || 1, 0, 2);
  stage.innerHTML = `
    <div class="leader">
      <div class="wedge"></div><div class="ring"></div><div class="cross"></div>
      <div class="num"></div><div class="marks"><i></i><i></i><i></i><i></i></div>
    </div>
    <div class="card"><div class="frame">
      ${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}
      <h1 class="hd">${SC.esc(cfg.heading)}</h1>
      ${cfg.subheading ? `<p class="sb">${SC.esc(cfg.subheading)}</p>` : ""}
    </div></div>
    <canvas class="scratches"></canvas><canvas class="dust"></canvas><div class="flick"></div>`;
  const leader = SC.$(".leader", stage), wedge = SC.$(".wedge", stage), num = SC.$(".num", stage);
  const card = SC.$(".card", stage), flick = SC.$(".flick", stage);
  const scv = SC.$(".scratches", stage), dcv = SC.$(".dust", stage);
  const sctx = scv.getContext("2d"), dctx = dcv.getContext("2d");
  const rnd = SC.rng(13);
  const scratches = Array.from({ length: Math.round(5 * k) }, () => ({ x: rnd(), w: 0.4 + rnd() * 1.4, a: 0.15 + rnd() * 0.35 }));
  const dust = Array.from({ length: Math.round(90 * k) }, () => ({ x: rnd(), y: rnd(), r: 0.3 + rnd() * 1.6, a: rnd() }));

  const drawScratches = () => {
    const w = scv.width, h = scv.height;
    sctx.clearRect(0, 0, w, h); sctx.fillStyle = "rgba(255,255,255,.85)";
    scratches.forEach((s) => { if (rnd() < 0.35) return; sctx.globalAlpha = s.a * (0.5 + rnd() * 0.5); sctx.fillRect(s.x * w, 0, s.w, h); });
    sctx.globalAlpha = 1;
  };
  const drawDust = () => {
    const w = dcv.width, h = dcv.height;
    dctx.clearRect(0, 0, w, h); dctx.fillStyle = "#fff";
    dust.forEach((d) => { if (d.a < 0.55) return; dctx.globalAlpha = (d.a - 0.55) * 1.6; dctx.beginPath(); dctx.arc(d.x * w, d.y * h, d.r, 0, 6.28); dctx.fill(); });
    dctx.globalAlpha = 1;
  };

  const beat = Math.max(300, Number(cfg.beatMs) || 1000);
  const sweep = (dur) => {
    if (SC.reduce) { wedge.style.setProperty("--p", "100%"); return Promise.resolve(); }
    return r.raf((dt, t) => { const p = Math.min(t * 1000 / dur, 1); wedge.style.setProperty("--p", (p * 100).toFixed(1) + "%"); return p < 1; });
  };

  if (!SC.reduce) r.spawn(r.raf((dt, t) => {
    if (scv.width !== stage.clientWidth) { scv.width = dcv.width = stage.clientWidth; scv.height = dcv.height = stage.clientHeight; }
    dust.forEach((d) => { d.a = (d.a + dt * (0.4 + d.r * 0.3)) % 1; });
    drawScratches(); drawDust();
    flick.style.opacity = (Math.random() < 0.035 ? 0.25 + Math.random() * 0.35 : Math.random() * 0.05).toFixed(3);
  }));

  for (let n = from; n >= 1; n--) {
    num.textContent = n;
    wedge.style.setProperty("--p", "0%");
    await sweep(beat * 0.85);
    await w(beat * 0.15);
  }
  flick.style.opacity = .9; await w(90); flick.style.opacity = 0;
  leader.classList.add("gone"); card.classList.add("on");
  await w(1600);
});
