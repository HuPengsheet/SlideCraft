/* 排行榜竞赛：横向条形随时间重新排序。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  unit: "",
  decimals: 0,
  topN: 8,
  frameMs: 1200,         // 每帧时长，毫秒
  note: "",
  frames: []             // { label, values: { 名称: 数值 } }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

player.play(async (r) => {
  const frames = (cfg.frames || []).filter((f) => f && typeof f === "object");
  const N = frames.length;
  const head = (cfg.title || cfg.subtitle)
    ? `<div class="head">${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}</div>` : "";
  stage.innerHTML = `${head}<div class="race"><div class="frame-label"></div></div>${cfg.note ? `<p class="note">${SC.esc(cfg.note)}</p>` : ""}`;
  if (!N) return;

  const top = Math.max(1, Math.floor(+cfg.topN) || 8);
  const race = SC.$(".race", stage), flabel = SC.$(".frame-label", stage);
  race.style.setProperty("--top", top);
  const dec = cfg.decimals || 0;

  /* 名称（按首次出现顺序）与逐帧数值（缺失则沿用上一帧） */
  const names = [];
  frames.forEach((f) => Object.keys(f.values || {}).forEach((n) => { if (!names.includes(n)) names.push(n); }));
  let prev = {};
  const vals = frames.map((f) => {
    const o = {};
    names.forEach((n) => { const v = f.values?.[n]; o[n] = Number.isFinite(+v) && v !== null && v !== "" ? +v : (prev[n] ?? 0); });
    prev = o; return o;
  });

  const rows = {};
  names.forEach((n, i) => {
    const row = SC.el("row", `<div class="name">${SC.esc(n)}</div><div class="track"><div class="fill"></div><div class="val"></div></div>`);
    row.style.setProperty("--c", ["var(--accent)", "var(--accent-2)", "var(--accent-3)"][i % 3]);
    row.style.opacity = 0;
    race.append(row);
    rows[n] = { row, fill: SC.$(".fill", row), val: SC.$(".val", row), y: top, ready: false };
  });

  const valuesAt = (pos) => {
    const i = Math.min(Math.floor(pos), N - 1), u = pos - i;
    if (i >= N - 1 || u <= 0) return vals[Math.min(i, N - 1)];
    const o = {};
    names.forEach((n) => { o[n] = SC.lerp(vals[i][n], vals[i + 1][n], u); });
    return o;
  };

  let smax = 0, lastLabel = null, first = true;
  /* snap=true 时位置不做平滑，直接到位 */
  const render = (pos, dt, snap) => {
    const cur = valuesAt(pos);
    const order = [...names].sort((a, b) => cur[b] - cur[a] || names.indexOf(a) - names.indexOf(b));
    const max = Math.max(1e-9, cur[order[0]] || 0);
    smax = first || snap ? max : smax + (max - smax) * (1 - Math.exp(-dt * 6));
    const k = snap ? 1 : 1 - Math.exp(-dt * 10);
    order.forEach((n, rank) => {
      const o = rows[n];
      o.y = !o.ready || snap ? Math.min(rank, top) : o.y + (rank - o.y) * k;
      o.ready = true;
      const w = SC.clamp(cur[n] / smax, 0, 1) * 100;
      o.row.style.transform = `translateY(${o.y * 100}%)`;
      o.row.style.opacity = SC.clamp(top - o.y, 0, 1);
      o.row.style.zIndex = 100 - rank;
      o.fill.style.width = w + "%";
      o.val.style.left = w + "%";
      o.val.textContent = SC.fmt(cur[n], { decimals: dec }) + (cfg.unit || "");
    });
    first = false;
    const lab = String(frames[SC.clamp(Math.round(pos), 0, N - 1)].label ?? "");
    if (lab !== lastLabel) { flabel.textContent = lab; lastLabel = lab; }
  };

  if (SC.reduce) { render(N - 1, 0, true); return; }
  render(0, 0, true);
  await r.wait(500);
  const per = Math.max(50, +cfg.frameMs || 1200) / 1000;
  await r.raf((dt, t) => {
    const pos = Math.min(t / per, N - 1);
    render(pos, dt, false);
    return t / per < N - 1 + 0.8;   // 到达末帧后再停留一小段，让排序收敛
  });
  render(N - 1, 0, true);
});
