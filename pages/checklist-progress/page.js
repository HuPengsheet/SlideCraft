/* 清单进度：逐项勾选（勾号描边绘制），已完成项加删除线，左侧总进度同步增长。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  eyebrow: "",
  title: "",
  subtitle: "",
  stepMs: 380,
  stagger: 60,
  doneLabel: "全部完成",
  items: []            // 字符串，或 { text, done, note }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const num = (v, d) => (v !== null && v !== "" && Number.isFinite(+v) ? +v : d);

player.play(async (r) => {
  const items = (Array.isArray(cfg.items) ? cfg.items : [])
    .map((it) => (typeof it === "string" || typeof it === "number" ? { text: String(it) } : it))
    .filter((it) => it && typeof it === "object" && String(it.text ?? "").trim() !== "")
    .slice(0, 60)
    .map((it) => ({ text: String(it.text), note: it.note ? String(it.note) : "", done: it.done === true }));
  const n = items.length;
  const cols = n > 28 ? 3 : n > 12 ? 2 : 1, rows = Math.max(1, Math.ceil(n / cols));

  stage.innerHTML = `
    <div class="side">
      ${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}
      ${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}
      ${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}
      <div class="pct"><span class="pv">0</span><small>%</small></div>
      <div class="meter"><i></i></div>
      <div class="tally"></div>
    </div>
    <div class="list${rows > 11 ? " dense" : ""}" style="--cols:${cols};--rows:${rows}"></div>`;
  const list = SC.$(".list", stage), pv = SC.$(".pv", stage), bar = SC.$(".meter i", stage), tally = SC.$(".tally", stage);

  const rowEls = items.map((it) => {
    const row = SC.el("row", `<span class="box"><svg viewBox="0 0 24 24"><path d="M6.5 12.5l3.8 3.8 7.2-8"/></svg></span>
      <span class="txt"><span class="tx">${SC.esc(it.text)}</span>${it.note ? `<div class="nt">${SC.esc(it.note)}</div>` : ""}</span>`);
    list.append(row); return row;
  });

  /* 按实际排版高度缩小字号，直到放进列表区域 */
  let kk = 1;
  for (let g = 0; g < 14; g++) {
    const last = rowEls.reduce((m, e) => Math.max(m, e.offsetTop + e.offsetHeight), 0);
    if (last <= list.clientHeight || kk < .2) break;
    kk *= .9; list.style.setProperty("--k", kk.toFixed(3));
  }

  const state = items.map(() => false);
  let shown = 0, target = 0, live = true;      // 显示值（缓动）与目标值
  const paint = () => {
    const done = state.filter(Boolean).length;
    target = n ? done / n * 100 : 0;
    bar.style.width = target + "%";
    stage.classList.toggle("all", n > 0 && done === n);
    tally.innerHTML = n ? (done === n ? `<b>${SC.esc(cfg.doneLabel)}</b> · ${n} 项` : `已完成 <b>${done}</b> / ${n} 项`) : "暂无事项";
    if (SC.reduce) { shown = target; pv.textContent = Math.round(shown); }
  };
  const setDone = (i, v) => { state[i] = v; rowEls[i].classList.toggle("done", v); paint(); };
  paint();

  /* 百分比的缓动只用一个循环，避免多个动画互相覆盖 */
  if (!SC.reduce) {
    r.spawn(r.raf((dt) => {
      shown += (target - shown) * Math.min(1, dt * 7);
      if (Math.abs(target - shown) < .05) shown = target;
      pv.textContent = Math.round(shown);
      return live;
    }));
  }

  const makeLive = () => rowEls.forEach((row, i) => row.addEventListener("click", () => { if (r.live) setDone(i, !state[i]); }));

  if (SC.reduce) {
    rowEls.forEach((row, i) => { row.classList.add("in"); if (items[i].done) setDone(i, true); });
    makeLive(); return;
  }

  await r.wait(300);
  const gap = Math.max(0, num(cfg.stagger, 60));
  for (const row of rowEls) { row.classList.add("in"); await r.wait(gap); }
  await r.wait(450);
  const step = Math.max(40, num(cfg.stepMs, 380));
  for (let i = 0; i < n; i++) if (items[i].done) { setDone(i, true); await r.wait(step); }
  await r.wait(700);      // 让百分比收敛到最终值
  makeLive();
});
