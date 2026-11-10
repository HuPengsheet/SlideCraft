/* 黑胶唱片：唱片从封套里滑出并旋转，唱臂落下，右侧歌词随节拍逐行高亮滚动。
 * 配置见 config.js。这里的 DEFAULTS 是没写 config 时的默认值。 */
const DEFAULTS = {
  theme: "dark",
  title: "黑胶唱片",
  album: "ALBUM",
  artist: "",
  side: "SIDE A",
  label: "",
  lines: [],
  beatMs: 820,
  duration: "3:42",
  rpm: 33.3              // 唱片转速，转/分钟
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const ARM_REST = 4, ARM_PLAY = 28;   // 唱臂角度：停放位、落针位（度）

player.play(async (r) => {
  const w = (ms) => r.wait(SC.reduce ? 0 : ms);
  const lines = (cfg.lines || []).slice(0, 12).map(String);
  const totalSec = (() => { const [m, s] = String(cfg.duration || "0:00").split(":").map(Number); return (m || 0) * 60 + (s || 0); })();
  stage.innerHTML = `
    <div class="rec"><div class="disc"><div class="lbl"><b>${SC.esc(cfg.label || cfg.album)}</b><small>${SC.esc(cfg.side || "")}</small></div></div><div class="sheen"></div></div>
    <div class="sleeve"><span class="sl-side">${SC.esc(cfg.side || "")}</span><h1 class="sl-al">${SC.esc(cfg.album)}</h1>${cfg.artist ? `<p class="sl-ar">${SC.esc(cfg.artist)}</p>` : ""}</div>
    <div class="arm"><div class="rod"></div><div class="base"></div></div>
    <div class="panel">
      <div class="np sc-eyebrow"><span class="eq">${"<i></i>".repeat(4)}</span>NOW PLAYING</div>
      <h2 class="ttl">${SC.esc(cfg.album)}</h2>${cfg.artist ? `<p class="art">${SC.esc(cfg.artist)}</p>` : ""}
      <div class="lyr"><div class="lyr-in">${lines.map((l) => `<div class="ln">${SC.esc(l)}</div>`).join("")}</div></div>
      <div class="pb"><span class="cur">0:00</span><span class="bar"><i></i></span><span>${SC.esc(cfg.duration || "")}</span></div>
    </div>`;
  const rec = SC.$(".rec", stage), disc = SC.$(".disc", stage), sleeve = SC.$(".sleeve", stage);
  const arm = SC.$(".arm", stage), rod = SC.$(".rod", stage), panel = SC.$(".panel", stage);
  const inner = SC.$(".lyr-in", stage), lns = SC.$$(".ln", stage), eq = SC.$$(".eq i", stage);
  const bar = SC.$(".pb .bar i", stage), cur = SC.$(".pb .cur", stage);
  const center = (i) => { const el = lns[i]; inner.style.transform = `translateY(${-(el.offsetTop + el.offsetHeight / 2)}px)`; };
  if (lns.length) center(0);

  await w(300);
  sleeve.classList.add("on");
  await w(700);
  rec.classList.add("out");
  arm.classList.add("on");
  panel.classList.add("on");
  await w(1100);

  /* 唱片开始转：一秒内加速到目标转速；落针后唱臂随进度缓慢内移 */
  let angle = 0, spin = 0, progress = 0, playing = false;
  const target = (Number(cfg.rpm) || 33.3) * 6;     // 度/秒
  if (!SC.reduce) r.spawn(r.raf((dt, t) => {
    spin = Math.min(target, spin + target * dt);
    angle = (angle + spin * dt) % 360;
    disc.style.transform = `rotate(${angle.toFixed(2)}deg)`;
    if (playing) eq.forEach((e, k) => { e.style.transform = `scaleY(${(0.35 + 0.65 * Math.abs(Math.sin(t * (5 + k * 1.7) + k))).toFixed(3)})`; });
  }));
  rod.style.setProperty("--a", ARM_PLAY + "deg");
  await w(1100);

  playing = true;
  const n = lns.length, beat = Math.max(200, Number(cfg.beatMs) || 820);
  for (let i = 0; i < n; i++) {
    lns.forEach((el, k) => { el.classList.toggle("on", k === i); el.classList.toggle("past", k < i); });
    center(i);
    progress = (i + 1) / n;
    bar.style.width = (progress * 38).toFixed(1) + "%";           // 只播了这一面的前一段
    const sec = Math.round(totalSec * progress * 0.38);
    cur.textContent = `${Math.floor(sec / 60)}:${SC.pad(sec % 60)}`;
    rod.style.setProperty("--a", (ARM_PLAY + progress * 3).toFixed(2) + "deg");
    await w(beat);
  }
});
