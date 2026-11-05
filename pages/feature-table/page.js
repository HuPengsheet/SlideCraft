/* 功能对比表：逐行点亮，推荐列高亮并带徽标，行数多时自动缩小行高。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  highlight: -1,
  badge: "推荐",
  rowMs: 380,
  columns: [],
  rows: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const YES = `<svg class="y" viewBox="0 0 16 16"><path pathLength="1" d="M3 8.5l3.2 3.2L13 4.6"/></svg>`;
const NO = `<svg class="n" viewBox="0 0 16 16"><path pathLength="1" d="M4.5 8h7"/></svg>`;

player.play(async (r) => {
  const cols = (Array.isArray(cfg.columns) ? cfg.columns : []).slice(0, 6).map((c) => (c && typeof c === "object" ? { name: String(c.name ?? ""), sub: String(c.sub ?? "") } : { name: String(c ?? ""), sub: "" }));
  const nc = cols.length;
  const rows = (Array.isArray(cfg.rows) ? cfg.rows : []).filter((x) => x && typeof x === "object").slice(0, 60);
  const hlRaw = cfg.highlight == null || cfg.highlight === "" ? -1 : Math.round(+cfg.highlight);
  const hl = Number.isInteger(hlRaw) && hlRaw >= 0 && hlRaw < nc ? hlRaw : -1;
  const rowMs = Math.max(30, Number.isFinite(+cfg.rowMs) ? +cfg.rowMs : 380);

  stage.innerHTML = "";
  const head = SC.el("head", `${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}`);
  if (!head.firstChild) head.style.display = "none";
  const tbl = SC.el("tbl"); tbl.style.setProperty("--nc", nc);
  const th = SC.el("tr th", `<div></div>${cols.map((c, i) => `<div class="${i === hl ? "hl" : ""}" ${i === hl ? `data-badge="${SC.esc(cfg.badge || "推荐")}"` : ""}><div class="cn" title="${SC.esc(c.name)}">${SC.esc(c.name)}</div>${c.sub ? `<div class="cs">${SC.esc(c.sub)}</div>` : ""}</div>`).join("")}`);
  const body = SC.el("body");
  tbl.append(th, body);
  stage.append(head, tbl);

  const cell = (v, i) => {
    const cls = i === hl ? " hl" : "";
    if (v === true || v === "true" || v === "yes") return `<div class="c${cls}">${YES}</div>`;
    if (v === false || v == null || v === "" || v === "-" || v === "no" || v === "false") return `<div class="c${cls}">${NO}</div>`;
    return `<div class="c t${cls}"><span title="${SC.esc(v)}">${SC.esc(v)}</span></div>`;
  };
  const els = rows.map((x) => {
    const vals = Array.isArray(x.values) ? x.values : [];
    const e = SC.el("tr row", `<div class="c l"><span title="${SC.esc(x.label)}">${SC.esc(x.label ?? "")}</span></div>${cols.map((_, i) => cell(vals[i], i)).join("")}`);
    body.append(e); return e;
  });
  if (!rows.length) body.append(SC.el("c", "（没有功能行）"));

  /* 行多时缩小字号：每行至少约 1.9 倍字号的高度 */
  const fit = () => {
    tbl.style.setProperty("--k", 1);
    const em = parseFloat(getComputedStyle(tbl).fontSize) || 16;
    const avail = body.clientHeight;
    if (rows.length) tbl.style.setProperty("--k", SC.clamp(avail / rows.length / (2.1 * em), .38, 1).toFixed(3));
  };
  fit();

  if (SC.reduce) { head.classList.add("on"); tbl.classList.add("on"); els.forEach((e) => e.classList.add("on")); return; }
  await r.wait(250); head.classList.add("on");
  await r.wait(350); tbl.classList.add("on");
  fit();
  await r.wait(600);
  const step = Math.min(rowMs, 4000 / Math.max(rows.length, 1));
  for (let i = 0; i < els.length; i++) {
    els.forEach((e, k) => e.classList.toggle("cur", k === i));
    els[i].classList.add("on"); await r.wait(step);
  }
  els.forEach((e) => e.classList.remove("cur"));
});
