/* 数字对比：左右两个大数字加 VS，下方对比条按比例分段，差值用箭头和百分比标出。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  left: { label: "", value: 0, unit: "", prefix: "" },
  right: { label: "", value: 0, unit: "", prefix: "" },
  higherIsBetter: true,
  duration: 1800,
  delta: { show: true, decimals: 1, label: "" }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const numOr = (v, d) => (v !== null && v !== "" && v !== undefined && Number.isFinite(+v) ? +v : d);
const decOf = (v) => { const s = String(v); const i = s.indexOf("."); return i < 0 ? 0 : Math.min(4, s.length - i - 1); };

player.play(async (r) => {
  const side = (o) => {
    o = o && typeof o === "object" ? o : {};
    const value = numOr(o.value, 0);
    return { label: String(o.label ?? ""), unit: String(o.unit ?? ""), prefix: String(o.prefix ?? ""), value, dec: SC.clamp(Math.round(numOr(o.decimals, decOf(value))), 0, 6) };
  };
  const L = side(cfg.left), R = side(cfg.right);
  const higher = cfg.higherIsBetter !== false;
  const dcfg = cfg.delta && typeof cfg.delta === "object" ? cfg.delta : {};
  const showDelta = dcfg.show !== false;
  const dDec = SC.clamp(Math.round(numOr(dcfg.decimals, 1)), 0, 4);
  const diff = R.value - L.value;
  const pct = L.value !== 0 ? diff / Math.abs(L.value) * 100 : null;
  const dir = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  const tone = dir === "flat" ? "flat" : (dir === "up") === higher ? "good" : "bad";

  const fs = (s) => {   // 数字过长时缩小，避免超出半屏（宽度按每个数字约 0.62 倍字号估算）
    const num = SC.fmt(s.value, { decimals: s.dec });
    const units = num.length * .62 + [...s.prefix].length * .4 + ([...s.unit].length * .3 + (s.unit ? .25 : 0));
    return Math.min(1, 19 / (8 * Math.max(units, 1)));
  };
  const total = Math.abs(L.value) + Math.abs(R.value);
  const share = total > 0 ? Math.abs(L.value) / total * 100 : 50;
  const arrow = dir === "up" ? '<path d="M12 19V5M5 12l7-7 7 7"/>' : dir === "down" ? '<path d="M12 5v14M5 12l7 7 7-7"/>' : '<path d="M5 12h14"/>';
  const fmtPct = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + SC.fmt(Math.abs(v), { decimals: dDec }) + "%";
  const absTxt = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + SC.fmt(Math.abs(v), { decimals: Math.max(L.dec, R.dec) });

  const block = (cls, s) => `<div class="blk ${cls}" style="--k:${fs(s).toFixed(3)}">
      <div class="lab">${SC.esc(s.label)}</div>
      <div class="val"><span class="pre">${SC.esc(s.prefix)}</span><span class="n"></span>${s.unit ? `<small>${SC.esc(s.unit)}</small>` : ""}</div></div>`;
  const head = (cfg.eyebrow || cfg.title || cfg.subtitle)
    ? `<div class="head">${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}</div>` : "";

  stage.innerHTML = `${head}
    <div class="duel">${block("l", L)}<div class="vs"><span>VS</span></div>${block("r", R)}</div>
    <div class="foot">
      ${showDelta ? `<div class="delta ${tone}"><svg viewBox="0 0 24 24">${arrow}</svg><b class="dv" data-delta="${pct === null ? "" : pct}"></b><span>${SC.esc(dcfg.label || "")}</span></div>` : ""}
      <div class="cmp" style="--s:${share}%"><div class="seg a"></div><div class="seg b"></div></div>
      <div class="cap"><span>${SC.esc(L.label)}</span><span>${SC.esc(R.label)}</span></div>
    </div>`;
  const nl = SC.$(".l .n", stage), nr = SC.$(".r .n", stage), dv = SC.$(".dv", stage), cmp = SC.$(".cmp", stage);
  const setN = (el, s, v) => { el.textContent = SC.fmt(v, { decimals: s.dec }); };
  const deltaText = (t) => (pct === null ? absTxt(diff * t) : fmtPct(pct * t));
  setN(nl, L, SC.reduce ? L.value : 0); setN(nr, R, SC.reduce ? R.value : 0);
  if (dv) dv.textContent = SC.reduce ? deltaText(1) : deltaText(0);
  cmp.style.setProperty("--s", SC.reduce ? share + "%" : "50%");

  if (SC.reduce) { stage.classList.add("in", "fin"); return; }

  await r.wait(300);
  stage.classList.add("in");
  await r.wait(500);
  const dur = Math.max(200, numOr(cfg.duration, 1800));
  const jobs = [
    SC.countUp(r, nl, L.value, { dur, decimals: L.dec }),
    SC.countUp(r, nr, R.value, { dur, decimals: R.dec })
  ];
  cmp.style.setProperty("--s", share + "%");
  if (dv) jobs.push(r.spawn(r.raf((dt, t) => { const p = Math.min(1, t * 1000 / dur); dv.textContent = deltaText(SC.ease.out(p)); return p < 1; })));
  await Promise.all(jobs);
  setN(nl, L, L.value); setN(nr, R, R.value); if (dv) dv.textContent = deltaText(1);
  stage.classList.add("fin");
});
