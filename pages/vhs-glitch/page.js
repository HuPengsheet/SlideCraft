/* 录像带故障：雪花噪点中画面出现，之后偶发横向撕裂、色彩偏移和滚过的噪点条；角落是播放标识和时间码。
 * 配置见 config.js。这里的 DEFAULTS 是没写 config 时的默认值。 */
const DEFAULTS = {
  theme: "dark",
  title: "录像带故障",
  eyebrow: "",
  heading: "REWIND",
  subheading: "",
  osd: "PLAY ▶",
  date: "",
  clock: "",
  counterStart: "0:00:00",
  intensity: 1,
  seed: 5
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const parseTc = (s) => String(s || "0").split(":").map(Number).reduce((a, v) => a * 60 + (v || 0), 0);
const fmtTc = (sec) => {
  const f = Math.floor((sec % 1) * 30), s = Math.floor(sec);
  return `${Math.floor(s / 3600)}:${SC.pad(Math.floor(s / 60) % 60)}:${SC.pad(s % 60)}:${SC.pad(f)}`;
};

player.play(async (r) => {
  const k = SC.clamp(Number(cfg.intensity) || 1, 0.3, 2);
  const content = `<div class="pic-in">
    ${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}
    <h1 class="hd">${SC.esc(cfg.heading)}</h1>
    ${cfg.subheading ? `<p class="sb">${SC.esc(cfg.subheading)}</p>` : ""}</div>`;
  stage.innerHTML = `<div class="tape">
    <div class="pic">${content}</div>
    ${Array.from({ length: 4 }, () => `<div class="slice">${content}</div>`).join("")}
    <canvas class="noise" width="192" height="108"></canvas>
    <div class="band"></div><div class="scan"></div><div class="vig"></div>
    <div class="osd tl blink">${SC.esc(cfg.osd || "")}</div>
    <div class="osd tr">SP</div>
    <div class="osd bl">${SC.esc(cfg.date || "")}${cfg.clock ? "<br>" + SC.esc(cfg.clock) : ""}</div>
    <div class="osd br"></div>
  </div>`;
  const pic = SC.$(".pic", stage), slices = SC.$$(".slice", stage), band = SC.$(".band", stage);
  const tl = SC.$(".osd.tl", stage), tc = SC.$(".osd.br", stage), canvas = SC.$(".noise", stage);
  const ctx = canvas.getContext("2d"), img = ctx.createImageData(canvas.width, canvas.height);
  const tc0 = parseTc(cfg.counterStart);

  const drawNoise = (rows = null) => {
    const d = img.data, W = canvas.width, H = canvas.height;
    for (let y = 0; y < H; y++) {
      const streak = Math.random() < 0.025 ? 120 : 0;
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4, v = Math.min(255, Math.random() * 255 + streak);
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  };

  if (SC.reduce) {
    pic.style.opacity = 1; tl.classList.remove("blink");
    drawNoise(); canvas.style.opacity = .08; tc.textContent = fmtTc(tc0);
    return;
  }

  /* 故障节奏预先排好：每 1.2 到 3 秒一次，每次 0.15 到 0.45 秒 */
  const rnd = SC.rng(Number(cfg.seed) || 5), bursts = [];
  for (let t = 3; t < 120; t += 1.2 + rnd() * 1.8) bursts.push([t, t + 0.15 + rnd() * 0.3]);

  let frame = 0, lastGlitch = -1, bandY = -3.75;
  const glitch = (on, strong) => {
    slices.forEach((s) => {
      const show = on && Math.random() < (strong ? 0.9 : 0.6);
      s.classList.toggle("on", show);
      if (!show) return;
      const top = Math.random() * 88, h = 2 + Math.random() * (strong ? 16 : 9);
      s.style.clipPath = `inset(${top.toFixed(1)}% 0 ${Math.max(0, 100 - top - h).toFixed(1)}% 0)`;
      s.style.transform = `translateX(${((Math.random() - 0.5) * 4.4 * k).toFixed(2)}em)`;
    });
    stage.style.setProperty("--sx", on ? `${(0.25 + Math.random() * 0.55 * k).toFixed(2)}em` : "0.08em");
    pic.style.transform = on && Math.random() < 0.4 ? `translateY(${((Math.random() - 0.5) * .75).toFixed(2)}em)` : "";
  };

  r.spawn(r.raf((dt, t) => {
    frame++;
    /* 0 到 1.3 秒满屏雪花，1.3 到 2.4 秒画面浮现，之后雪花只剩一层薄薄的底 */
    const fade = SC.clamp((t - 1.3) / 1.1, 0, 1);
    pic.style.opacity = fade.toFixed(3);
    canvas.style.opacity = (1 - fade * 0.97).toFixed(3);
    if (frame % 2 === 0) drawNoise();
    if (t > 2.6) tl.classList.remove("blink");

    const inBurst = (t > 1.3 && t < 2.6) || bursts.some(([a, b]) => t >= a && t < b);
    if (inBurst && t - lastGlitch > 0.06) { glitch(true, t < 2.6); lastGlitch = t; }
    else if (!inBurst && lastGlitch >= 0) { glitch(false); lastGlitch = -1; }

    bandY += dt * 9; if (bandY > 39) bandY = -3.75;
    band.style.transform = `translateY(${bandY.toFixed(2)}em)`;
    tc.textContent = fmtTc(tc0 + Math.max(0, t - 1.3));
  }));
  await r.wait(2800);
});
