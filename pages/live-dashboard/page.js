/* 实时监控面板：图块按固定频率刷新（种子随机游走），到 incidentAt 时某图块闪红并弹出告警。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  seed: 7,
  tickMs: 800,
  incidentAt: 14,
  incidentTicks: 8,
  panels: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const HIST = 40, BARS = 14;

player.play(async (r) => {
  const rawPanels = (Array.isArray(cfg.panels) ? cfg.panels : []).filter((p) => p && typeof p === "object").slice(0, 12);
  const tickMs = Math.max(100, Number.isFinite(+cfg.tickMs) ? +cfg.tickMs : 800);
  const incAt = Math.round(Number.isFinite(+cfg.incidentAt) ? +cfg.incidentAt : 14);
  const incLen = Math.max(1, Math.round(Number.isFinite(+cfg.incidentTicks) ? +cfg.incidentTicks : 8));
  const rnd = SC.rng(Math.round(+cfg.seed) || 7);

  const panels = rawPanels.map((p) => {
    const type = ["line", "bar", "number", "status"].includes(p.type) ? p.type : "line";
    let lo = Array.isArray(p.range) ? +p.range[0] : 0, hi = Array.isArray(p.range) ? +p.range[1] : 100;
    if (!Number.isFinite(lo)) lo = 0; if (!Number.isFinite(hi)) hi = lo + 100;
    if (hi < lo) [lo, hi] = [hi, lo]; if (hi === lo) hi = lo + 1;
    const items = (Array.isArray(p.items) && p.items.length ? p.items : ["服务 A", "服务 B", "服务 C"]).slice(0, 8).map(String);
    return { type, title: String(p.title ?? ""), unit: p.unit == null ? "" : String(p.unit), lo, hi, items, v: lo + (hi - lo) * (.35 + rnd() * .2), hist: [], prev: 0 };
  });
  const incIdx = (() => {
    const n = Math.round(+cfg.incidentPanel);
    if (Number.isFinite(n) && cfg.incidentPanel !== undefined && n >= 0 && n < panels.length && panels[n].type !== "status") return n;
    return panels.findIndex((p) => p.type !== "status");
  })();
  const dec = (p) => ((p.hi - p.lo) <= 10 ? 2 : (p.hi - p.lo) <= 100 ? 1 : 0);
  const show = (p, v) => SC.fmt(v, { decimals: dec(p) });

  /* 数据：向区间中部回归的随机游走 */
  let tick = 0, incident = false, incidentLeft = 0, warm = true;
  const step = () => {
    tick++;
    if (!warm && incAt > 0 && tick === incAt && incIdx >= 0) { incident = true; incidentLeft = incLen; }
    else if (incident && --incidentLeft <= 0) incident = false;
    panels.forEach((p, i) => {
      p.prev = p.v;
      const span = p.hi - p.lo, mid = p.lo + span * .45;
      if (incident && i === incIdx) p.v = Math.min(p.hi, p.lo + span * (.9 + rnd() * .1));
      else {
        p.v += (mid - p.v) * .08 + (rnd() - .5) * span * .12;
        p.v = SC.clamp(p.v, p.lo + span * .03, p.lo + span * (incident && i === incIdx ? 1 : .8));
      }
      p.hist.push(p.v); if (p.hist.length > HIST) p.hist.shift();
    });
  };
  for (let i = 0; i < HIST; i++) step(); // 预热历史
  tick = 0; incident = false; incidentLeft = 0; warm = false; // 预热不计入周期

  /* DOM */
  stage.innerHTML = "";
  const top = SC.el("top", `<div>${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}</div><div class="chip"><i></i><span>运行正常</span><em>T+00:00</em></div>`);
  const chip = SC.$(".chip", top), chipTxt = SC.$("span", chip), chipT = SC.$("em", chip);
  const cols = panels.length <= 1 ? 1 : panels.length <= 2 ? 2 : panels.length <= 6 ? 3 : 4;
  const grid = SC.el("grid"); grid.style.setProperty("--cols", cols);
  const toast = SC.el("toast", `<i>!</i><div><b>严重告警</b><span></span></div>`);
  stage.append(top, grid, toast);
  if (!panels.length) grid.textContent = "（没有图块）";

  const nodes = panels.map((p) => {
    const el = SC.el("pn", `<div class="ph"><span class="pt">${SC.esc(p.title)}</span><span class="pv"></span></div><div class="pb"></div>`);
    const pb = SC.$(".pb", el), pv = SC.$(".pv", el);
    const n = { el, pv };
    if (p.type === "line") {
      pb.innerHTML = `<svg class="ln" viewBox="0 0 100 40" preserveAspectRatio="none"><path class="gl" d="M0 10H100M0 20H100M0 30H100"/><path class="ar"/><path class="pl"/></svg>`;
      n.ar = SC.$(".ar", pb); n.pl = SC.$(".pl", pb);
    } else if (p.type === "bar") {
      pb.innerHTML = `<div class="bars">${"<i></i>".repeat(BARS)}</div>`; n.bars = SC.$$("i", pb);
    } else if (p.type === "number") {
      pb.innerHTML = `<div class="num"><div class="d"></div><div class="tr"><b></b></div></div>`;
      n.d = SC.$(".d", pb); n.fill = SC.$("b", pb);
    } else {
      pb.innerHTML = `<div class="stl">${p.items.map((t) => `<div class="si"><i></i><span>${SC.esc(t)}</span><em>正常</em></div>`).join("")}</div>`;
      n.si = SC.$$(".si", pb);
    }
    grid.append(el); return n;
  });

  const render = () => {
    panels.forEach((p, i) => {
      const n = nodes[i], frac = (v) => SC.clamp((v - p.lo) / (p.hi - p.lo), 0, 1);
      if (p.type === "status") {
        n.si.forEach((s, k) => { const bad = incident && k === n.si.length - 1; s.classList.toggle("bad", bad); SC.$("em", s).textContent = bad ? "异常" : "正常"; });
        n.pv.textContent = incident ? "1 项异常" : "全部正常";
        return;
      }
      n.pv.innerHTML = `${show(p, p.v)}<small>${SC.esc(p.unit)}</small>`;
      if (p.type === "line") {
        const pts = p.hist.map((v, k) => [(k / (HIST - 1)) * 100, 38 - frac(v) * 36]);
        const d = pts.map((q, k) => (k ? "L" : "M") + q[0].toFixed(2) + " " + q[1].toFixed(2)).join("");
        n.pl.setAttribute("d", d); n.ar.setAttribute("d", d + "L100 40L0 40Z");
      } else if (p.type === "bar") {
        const h = p.hist.slice(-BARS);
        n.bars.forEach((b, k) => { const v = h[k - (BARS - h.length)]; b.style.height = v === undefined ? "0%" : Math.max(3, frac(v) * 100) + "%"; });
      } else {
        const ch = p.prev ? ((p.v - p.prev) / Math.abs(p.prev)) * 100 : 0;
        n.d.textContent = `${ch >= 0 ? "+" : "-"}${Math.abs(ch).toFixed(1)}% 较上一周期`;
        n.d.classList.toggle("dn", ch < 0);
        n.fill.style.width = frac(p.v) * 100 + "%";
      }
    });
    stage.dataset.tick = tick;
    const mm = Math.floor((tick * tickMs) / 60000), ss = Math.floor((tick * tickMs) / 1000) % 60;
    chipT.textContent = `T+${SC.pad(mm)}:${SC.pad(ss)}`;
    if (incIdx >= 0) {
      const wasAlert = nodes[incIdx].el.classList.contains("alert");
      nodes[incIdx].el.classList.toggle("alert", incident);
      chip.classList.toggle("bad", incident); chipTxt.textContent = incident ? "1 个告警" : "运行正常";
      if (incident && !wasAlert) {
        const p = panels[incIdx];
        SC.$("span", toast).textContent = `${p.title || "图块"} 达到 ${show(p, p.v)}${p.unit}，超过正常范围`;
        toast.classList.add("on"); toastLeft = 5;
      }
    }
    if (toastLeft > 0 && --toastLeft === 0) toast.classList.remove("on");
  };
  let toastLeft = 0;

  const tickOnce = () => { step(); render(); };
  render();

  if (SC.reduce) {
    while (tick < (incAt > 0 ? incAt + 2 : 3)) tickOnce();
    top.classList.add("on"); nodes.forEach((n) => n.el.classList.add("on"));
    return;
  }

  await r.wait(250); top.classList.add("on");
  await r.wait(350);
  for (const n of nodes) { n.el.classList.add("on"); await r.wait(180); }
  await r.wait(400);
  /* 持续刷新，直到重播顶替；不 await，这样 done 事件照常发出 */
  let acc = 0;
  r.spawn(r.raf((dt) => {
    acc += dt * 1000;
    while (acc >= tickMs) { acc -= tickMs; tickOnce(); }
    return true;
  }));
});
