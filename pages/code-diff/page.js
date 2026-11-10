/* 代码 Diff：删除行变红并收起，新增行变绿并展开，顶部的 +/- 统计与行号同步变化。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "代码 Diff",
  eyebrow: "", heading: "",
  file: "",
  stepMs: 650,
  approve: "",
  lines: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);

/* 转义后再把 {{ }} 换成高亮片段 */
const mark = (s) => SC.esc(s).replace(/\{\{(.+?)\}\}/g, '<span class="hl">$1</span>');
const plain = (s) => s.replace(/\{\{(.+?)\}\}/g, "$1");

player.play(async (r) => {
  const lines = (cfg.lines || []).slice(0, 18).map((raw) => {
    const s = String(raw ?? "");
    const k = s[0] === "+" ? "add" : s[0] === "-" ? "del" : "ctx";
    return { k, text: s.slice(1) };
  });
  const total = { add: lines.filter((l) => l.k === "add").length, del: lines.filter((l) => l.k === "del").length };

  const head = (cfg.eyebrow || cfg.heading) ? `<div class="hd">
    ${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}
    ${cfg.heading ? `<h1 class="sc-title">${SC.esc(cfg.heading)}</h1>` : ""}</div>` : "";
  stage.innerHTML = `${head}<div class="win sc-card">
    <div class="bar"><span class="file">${SC.esc(cfg.file || "diff")}</span><span class="sp"></span>
      <span class="add">+0</span><span class="del">−0</span><span class="meter">${"<i></i>".repeat(5)}</span></div>
    <div class="code"></div>
    <div class="foot">${cfg.approve ? `<b>✓ ${SC.esc(cfg.approve)}</b>` : ""}</div>
  </div>`;
  const code = SC.$(".code", stage);

  /* 一开始只显示旧版本：未改动和删除行可见，新增行收起 */
  const rows = lines.map((l) => {
    const el = SC.el("ln" + (l.k === "add" ? " add pending" : ""), `<span class="n o"></span><span class="n w"></span><span class="s"> </span><span class="t">${l.k === "add" ? mark(l.text) : SC.esc(plain(l.text))}</span>`);
    code.append(el);
    return { ...l, el, gone: false, shown: l.k !== "add" };
  });

  /* 旧行号（删除行与未改动行编号）、新行号（新增行与未改动行编号）。随动画推进重新计算 */
  const renumber = () => {
    let o = 0, w = 0;
    for (const row of rows) {
      const [no, nw] = row.el.querySelectorAll(".n");
      if (row.k === "ctx") { no.textContent = ++o; nw.textContent = ++w; }
      else if (row.k === "del") { no.textContent = ++o; nw.textContent = ""; }
      else { no.textContent = ""; nw.textContent = row.shown ? ++w : ""; }
    }
  };
  renumber();

  const statAdd = SC.$(".bar .add", stage), statDel = SC.$(".bar .del", stage), meter = [...stage.querySelectorAll(".meter i")];
  let nAdd = 0, nDel = 0;
  const updateStats = () => {
    statAdd.textContent = "+" + nAdd; statDel.textContent = "−" + nDel;
    const sum = total.add + total.del || 1;
    const g = Math.round(5 * nAdd / sum), rr = Math.round(5 * nDel / sum);
    meter.forEach((m, i) => { m.className = i < g ? "g" : i < g + rr ? "r" : ""; });
  };

  const fast = SC.reduce;
  const stepMs = fast ? 0 : SC.clamp(Number(cfg.stepMs) || 650, 150, 4000);
  await r.wait(fast ? 0 : 900);

  /* 按块处理：相邻的删除行先变红并收起，再展开相邻的新增行 */
  for (let i = 0; i < rows.length;) {
    if (rows[i].k === "ctx") { i++; continue; }
    let j = i;
    while (j < rows.length && rows[j].k !== "ctx") j++;
    const block = rows.slice(i, j);
    const dels = block.filter((b) => b.k === "del"), adds = block.filter((b) => b.k === "add");
    for (const d of dels) {
      d.el.classList.add("del");
      d.el.querySelector(".s").textContent = "−";
      d.el.querySelector(".t").innerHTML = mark(d.text);
      nDel++; updateStats();
      await r.wait(stepMs * 0.45);
    }
    await r.wait(stepMs * 0.5);
    for (const a of adds) {
      a.el.classList.remove("pending");
      a.el.querySelector(".s").textContent = "+";
      a.shown = true; nAdd++; renumber(); updateStats();
      await r.wait(stepMs * 0.55);
    }
    await r.wait(stepMs * 0.4);
    for (const d of dels) { d.el.classList.add("gone"); d.gone = true; }
    await r.wait(stepMs * 0.6);
    i = j;
  }
  if (cfg.approve) { await r.wait(fast ? 0 : 400); SC.$(".foot", stage).classList.add("on"); }
});
