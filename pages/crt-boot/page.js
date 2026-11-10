/* CRT 开机：亮点拉成横线，再展开成画面；扫描线、暗角、闪烁，随后打出自检文字和大标题。
 * 配置见 config.js。这里的 DEFAULTS 是没写 config 时的默认值。 */
const DEFAULTS = {
  theme: "dark",
  title: "CRT 开机",
  heading: "SLIDECRAFT",
  subheading: "READY.",
  bootLines: ["SC-BIOS v2.6", "MEMORY TEST ... OK"],
  typeMs: 20,
  holdMs: 600,           // 自检文字停留时长，毫秒
  brand: "SC-1986",
  flicker: true
};

const { cfg, player, stage } = SC.init(DEFAULTS);

player.play(async (r) => {
  const w = (ms) => r.wait(SC.reduce ? 0 : ms);
  stage.innerHTML = `<div class="tv">
    <div class="screen">
      <div class="raster">
        <div class="boot"></div>
        <div class="main"><h1 class="hd"><span class="tx"></span><i class="cur" hidden></i></h1><p class="sb"></p></div>
        <div class="roll"></div>
      </div>
      <div class="scan"></div><div class="vig"></div><div class="glass"></div>
    </div>
    <span class="brandmark">${SC.esc(cfg.brand || "")}</span><i class="led"></i>
  </div>`;
  const raster = SC.$(".raster", stage), boot = SC.$(".boot", stage), tx = SC.$(".tx", stage);
  const cur = SC.$(".cur", stage), sb = SC.$(".sb", stage), led = SC.$(".led", stage), roll = SC.$(".roll", stage);

  /* 开机：亮点 → 横线 → 整屏，白光退去 */
  await w(500);
  led.classList.add("on");
  raster.className = "raster s0"; await w(260);
  raster.className = "raster s0 s1"; await w(380);
  raster.className = "raster s0 s1 s2"; await w(140);
  raster.classList.add("s3");

  /* 持续的轻微闪烁和缓慢下移的亮带 */
  if (cfg.flicker !== false && !SC.reduce) {
    const rnd = SC.rng(7);
    let y = 0;
    r.spawn(r.raf((dt, t) => {
      raster.style.setProperty("--fl", (0.965 + rnd() * 0.05 + Math.sin(t * 47) * 0.01).toFixed(3));
      y += dt * 7.5; if (y > 45) y = 0;
      roll.style.transform = `translateY(${y.toFixed(2)}em)`;
    }));
  }

  await w(500);
  for (const line of (cfg.bootLines || []).slice(0, 8)) {
    const d = SC.el("ln"); boot.append(d);
    if (SC.reduce) d.textContent = String(line); else await SC.type(r, d, String(line), cfg.typeMs);
    await w(160);
  }
  await w(cfg.holdMs);
  boot.classList.add("off");          // 文字淡出时留下一点荧光余晖
  await w(450);

  cur.hidden = false;
  const h = String(cfg.heading || "");
  if (SC.reduce) tx.textContent = h; else await SC.type(r, tx, h, 85);
  await w(250);
  if (cfg.subheading) { sb.textContent = cfg.subheading; sb.classList.add("on"); }
});
