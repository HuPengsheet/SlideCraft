/* 表单向导：输入框逐字自动填写，点击下一步时内容滑出滑入，最后显示提交成功。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  typeMs: 55,
  nextLabel: "下一步",
  submitLabel: "提交",
  success: { title: "提交成功", text: "", summary: true },
  steps: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);

player.play(async (r) => {
  const steps = (Array.isArray(cfg.steps) ? cfg.steps : []).filter((s) => s && typeof s === "object").slice(0, 6).map((s) => ({
    title: String(s.title ?? ""), desc: String(s.desc ?? ""),
    fields: (Array.isArray(s.fields) ? s.fields : []).filter((f) => f && typeof f === "object").slice(0, 5).map((f) => ({
      label: String(f.label ?? ""), value: String(f.value ?? ""), type: ["password", "textarea"].includes(f.type) ? f.type : "text"
    }))
  }));
  const succ = cfg.success && typeof cfg.success === "object" ? cfg.success : {};
  const typeMs = Math.max(5, Number.isFinite(+cfg.typeMs) ? +cfg.typeMs : 55);
  const w = (ms) => (SC.reduce ? Promise.resolve() : r.wait(ms));

  stage.innerHTML = "";
  const head = SC.el("head", `${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}`);
  if (!head.firstChild) head.style.display = "none";
  const bar = SC.el("steps");
  const card = SC.el("card");
  stage.append(head, bar, card);

  const n = steps.length;
  const sps = steps.map((s, i) => { const e = SC.el("sp", `<span class="dot">${i + 1}</span><span class="nm">${SC.esc(s.title)}</span>`); bar.append(e); return e; });
  if (!n) bar.style.display = "none";

  /* 各步骤面板常驻 DOM，输入内容保留 */
  const slides = steps.map((s, i) => {
    const el = SC.el("slide after");
    el.innerHTML = `<h2>${SC.esc(s.title)}</h2>${s.desc ? `<p class="desc">${SC.esc(s.desc)}</p>` : ""}<div class="fields"></div><div class="acts"><button class="btn pri">${SC.esc(i === n - 1 ? cfg.submitLabel || "提交" : cfg.nextLabel || "下一步")}</button></div>`;
    const box = SC.$(".fields", el);
    const inputs = s.fields.map((f) => {
      const row = SC.el("fld", `<label>${SC.esc(f.label)}</label>`);
      const inp = document.createElement(f.type === "textarea" ? "textarea" : "input");
      if (f.type !== "textarea") inp.type = f.type === "password" ? "password" : "text";
      inp.readOnly = true; inp.tabIndex = -1; inp.value = "";
      row.append(inp); box.append(row); return { row, inp, f };
    });
    card.append(el);
    return { el, inputs, btn: SC.$(".btn", el) };
  });

  /* 成功页 */
  const ok = SC.el("slide ok after", `<svg viewBox="0 0 80 80"><circle class="halo" cx="40" cy="40" r="38"/><circle class="ring" pathLength="1" cx="40" cy="40" r="34"/><path class="tick" pathLength="1" d="M26 41l9 9 19-20"/></svg>
    <h2>${SC.esc(succ.title || "提交成功")}</h2>${succ.text ? `<p class="desc">${SC.esc(succ.text)}</p>` : ""}<div class="sum"></div>`);
  if (succ.summary !== false) {
    SC.$(".sum", ok).innerHTML = steps.flatMap((s) => s.fields).map((f) => `<div><b>${SC.esc(f.label)}</b><span>${f.type === "password" ? "•".repeat(Math.min(f.value.length, 12)) : SC.esc(f.value)}</span></div>`).join("");
  }
  card.append(ok);

  let cur = -1;
  const all = [...slides.map((s) => s.el), ok];
  const goto = (i) => { /* i = n 表示成功页 */
    cur = i;
    all.forEach((el, k) => { el.classList.toggle("before", k < i); el.classList.toggle("after", k > i); });
    sps.forEach((e, k) => { e.classList.toggle("done", k < i); e.classList.toggle("cur", k === i); });
    sps.forEach((e, k) => { const d = SC.$(".dot", e); d.textContent = k < i ? "✓" : String(k + 1); });
    if (i === n) ok.classList.add("go"); else ok.classList.remove("go");
  };
  const final = () => { slides.forEach((s) => s.inputs.forEach((x) => { x.inp.value = x.f.value; })); goto(n); };

  sps.forEach((e, k) => e.addEventListener("click", () => { if (e.classList.contains("done") && done) goto(k); }));
  let done = false;

  if (!n) { head.classList.add("on"); card.classList.add("on"); card.append(SC.el("slide", "（没有步骤）")); return; }
  if (SC.reduce) { head.classList.add("on"); bar.classList.add("on"); card.classList.add("on"); final(); done = true; return; }

  await r.wait(250); head.classList.add("on");
  await r.wait(300); bar.classList.add("on");
  await r.wait(300); card.classList.add("on");
  goto(0);
  await r.wait(700);

  for (let i = 0; i < n; i++) {
    const s = slides[i];
    if (i > 0) { goto(i); await r.wait(800); }
    for (const x of s.inputs) {
      x.row.classList.add("focus"); await r.wait(300);
      for (let c = 1; c <= x.f.value.length; c++) { x.inp.value = x.f.value.slice(0, c); await r.wait(typeMs); }
      await r.wait(250); x.row.classList.remove("focus");
    }
    await r.wait(400);
    s.btn.classList.add("hot"); await r.wait(400);
    s.btn.classList.add("press"); await r.wait(160);
    s.btn.classList.remove("press"); await r.wait(200);
    s.btn.classList.remove("hot");
  }
  goto(n);
  await r.wait(2000);
  done = true;
});
