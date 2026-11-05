/* 行情滚动条：横向无缝滚动，价格定时跳动并闪烁，下方实时折线。配置见 config.js。 */
const DEFAULTS = { theme: "dark", eyebrow: "", title: "", subtitle: "", symbols: [], volatility: 0.35, seed: 1, tickMs: 900, scrollSpeed: 5, chart: true, indexLabel: "综合指数", note: "" };
const { cfg, player, stage } = SC.init(DEFAULTS);

const syms = [];
(Array.isArray(cfg.symbols) ? cfg.symbols : []).forEach((s, i) => {
  if (!s || typeof s !== "object") return;
  const p = parseFloat(s.price); if (!Number.isFinite(p) || p <= 0) return;
  const c = parseFloat(s.change);
  syms.push({ code: String(s.code ?? `S${i + 1}`), p0: p, ch0: Number.isFinite(c) ? SC.clamp(c, -90, 900) : 0 });
});
const VOL = SC.clamp(Number.isFinite(parseFloat(cfg.volatility)) ? parseFloat(cfg.volatility) : 0.35, 0, 5);
const TICK = Math.max(150, parseFloat(cfg.tickMs) || 900);
const SPEEDEM = Math.max(0, Number.isFinite(parseFloat(cfg.scrollSpeed)) ? parseFloat(cfg.scrollSpeed) : 5);
const showChart = cfg.chart !== false && syms.length > 0;
const N = 80;   // 折线点数

const dec = (p) => (p >= 1000 ? 1 : p >= 10 ? 2 : p >= 1 ? 3 : 4);
const fp = (p) => SC.fmt(p, { decimals: dec(p) });
const fc = (c) => (c >= 0 ? "+" : "−") + Math.abs(c).toFixed(2) + "%";

function itemHtml(s, k) {
  return `<div class="it ${s.ch >= 0 ? "up" : "dn"}" data-k="${k}"><span class="cd">${SC.esc(s.code)}</span><span class="px">${fp(s.p)}</span><span class="ch">${fc(s.ch)}</span></div>`;
}

player.play(async (r) => {
  stage.className = "stage" + (SC.reduce ? " nomo" : "");
  const rnd = SC.rng(Math.round(parseFloat(cfg.seed)) || 1);
  const st = syms.map((s) => ({ ...s, open: s.p0 / (1 + s.ch0 / 100), p: s.p0, ch: s.ch0 }));
  const indexOf = () => (st.length ? st.reduce((a, s) => a + (s.p / s.open) * 100, 0) / st.length : 100);
  const idxNow = indexOf();

  /* 折线历史：以当前指数为终点，反向随机游走 */
  const hist = [idxNow];
  { let v = idxNow; for (let i = 1; i < N; i++) { v += (rnd() - 0.5) * VOL * 1.6 + (100 - v) * 0.01 * 0.3; hist.unshift(v); } }
  const idxOpen = 100;

  /* DOM */
  const copies = st.length ? Math.max(1, Math.ceil(160 / (st.length * 18))) : 1;   // 一组至少覆盖舞台宽度（约 160em）
  const setHtml = () => Array.from({ length: copies }, () => st.map((s, k) => itemHtml(s, k)).join("")).join("");
  const head = `<div class="top"><div>${cfg.eyebrow ? `<div class="sc-eyebrow rise">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1 class="sc-title rise" style="--d:.1s">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub rise" style="--d:.2s">${SC.esc(cfg.subtitle)}</p>` : ""}</div>${showChart ? `<div class="big rise" style="--d:.3s"><b id="ix"></b><span id="ic"></span><small>${SC.esc(cfg.indexLabel ?? "")}</small></div>` : ""}</div>`;
  const band = st.length
    ? `<div class="band rise" style="--d:.4s"><div class="belt" id="belt"><div class="set">${setHtml()}</div><div class="set">${setHtml()}</div></div></div>`
    : `<div class="band rise"><div class="empty">暂无行情</div></div>`;
  const chart = showChart ? `<div class="panel rise" style="--d:.6s"><div class="yl" id="yl"><span></span><span></span><span></span></div><div class="cv"><div class="reveal" style="position:absolute;inset:0"><svg id="svg" viewBox="0 0 1000 100" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.38"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></linearGradient></defs><line class="grid" x1="0" x2="1000" y1="0" y2="0"/><line class="grid" x1="0" x2="1000" y1="50" y2="50"/><line class="grid" x1="0" x2="1000" y1="100" y2="100"/><path class="ar" id="ar" fill="url(#g)"/><path class="ln" id="ln"/></svg><i class="dot" id="dot"></i></div></div></div>` : "";
  stage.innerHTML = `${head}${band}${chart}${cfg.note ? `<p class="note rise" style="--d:.8s">${SC.rich(cfg.note)}</p>` : ""}`;

  const belt = SC.$("#belt", stage);
  const itemsOf = (k) => SC.$$(`.it[data-k="${k}"]`, stage);
  const ix = SC.$("#ix", stage), ic = SC.$("#ic", stage), yl = SC.$$("#yl span", stage);
  const ln = SC.$("#ln", stage), ar = SC.$("#ar", stage), dot = SC.$("#dot", stage);

  function drawChart() {
    if (!ln) return;
    let lo = Math.min(...hist), hi = Math.max(...hist);
    const pad = Math.max((hi - lo) * 0.18, 0.05); lo -= pad; hi += pad;
    const pts = hist.map((v, i) => [i / (N - 1) * 1000, 100 - (v - lo) / (hi - lo) * 100]);
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2; d += ` C${cx.toFixed(1)} ${y0.toFixed(2)} ${cx.toFixed(1)} ${y1.toFixed(2)} ${x1.toFixed(1)} ${y1.toFixed(2)}`; }
    ln.setAttribute("d", d); ar.setAttribute("d", `${d} L1000 100 L0 100 Z`);
    const last = pts[pts.length - 1];
    dot.style.left = "100%"; dot.style.top = last[1].toFixed(2) + "%";
    [hi, (hi + lo) / 2, lo].forEach((v, i) => { yl[i].textContent = v.toFixed(2); });
    const v = hist[hist.length - 1], c = (v / idxOpen - 1) * 100;
    ix.textContent = v.toFixed(2); ic.textContent = fc(c); ic.className = c >= 0 ? "up" : "dn";
    ix.className = ""; 
  }
  drawChart();

  /* 一次跳动。flash=false 时只更新不闪烁 */
  function tick(flash) {
    st.forEach((s, k) => {
      if (rnd() > 0.6) return;
      const drift = (s.open - s.p) / s.open * 0.05;   // 轻微回归，防止漂太远
      const prev = s.p;
      s.p = Math.max(s.open * 0.2, s.p * (1 + (rnd() - 0.5) * 2 * VOL / 100 + drift));
      s.ch = (s.p / s.open - 1) * 100;
      const dir = s.p >= prev ? "good" : "bad";
      itemsOf(k).forEach((el) => {
        el.className = "it " + (s.ch >= 0 ? "up" : "dn");
        el.querySelector(".px").textContent = fp(s.p);
        el.querySelector(".ch").textContent = fc(s.ch);
        if (flash && el.animate) el.querySelector(".ch").animate([{ background: `color-mix(in srgb, var(--${dir}) 38%, transparent)` }, { background: "transparent" }], { duration: 900 / player.speed, easing: "ease-out" });
        if (flash && el.animate) el.querySelector(".px").animate([{ color: `var(--${dir})` }, { color: "inherit" }], { duration: 900 / player.speed, easing: "ease-out" });
      });
    });
    hist.push(indexOf()); hist.shift(); drawChart();
  }

  if (SC.reduce) return;

  /* 连续运行：滚动 + 定时跳动。被重播取代后自动结束 */
  let off = 0, acc = 0, setW = 0, measure = 0;
  r.spawn(r.raf((dt) => {
    if (belt) {
      if (measure-- <= 0) { setW = belt.firstElementChild.offsetWidth; measure = 30; }
      off = setW > 0 ? (off + dt * SPEEDEM * (parseFloat(getComputedStyle(stage).fontSize) || 16)) % setW : 0;
      belt.style.transform = `translateX(${-off.toFixed(1)}px)`;
    }
    acc += dt * 1000;
    while (acc >= TICK) { acc -= TICK; tick(true); }
    return true;
  }));
  await r.wait(2600);
});
