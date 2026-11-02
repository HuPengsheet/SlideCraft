/* 倒计时：翻页牌或普通数字块。配置见 config.js。
 * target 用真实时间；没有 target 时用 demo.seconds 和播放器时钟。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  target: "",                       // ISO 日期字符串
  demo: { seconds: 90 },            // 没有 target 时从 N 秒开始
  units: ["d", "h", "m", "s"],
  labels: { d: "天", h: "时", m: "分", s: "秒" },
  style: "flip",                    // flip | plain
  doneText: "时间到！",
  urgentBelow: 10
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const SIZE = { d: 86400, h: 3600, m: 60, s: 1 };
const ORDER = ["d", "h", "m", "s"];
const units = ORDER.filter((u) => (cfg.units || []).includes(u));
if (!units.length) units.push("m", "s");
const targetMs = cfg.target ? Date.parse(cfg.target) : NaN;
const useTarget = !isNaN(targetMs);
if (cfg.target && !useTarget) console.warn("countdown: target 无法解析，改用 demo", cfg.target);

/* 把剩余秒数拆成各单位：最大的单位吸收更高级的部分 */
function split(total) {
  const out = {};
  let rest = Math.max(0, total);
  for (const u of units) { out[u] = Math.floor(rest / SIZE[u]); rest -= out[u] * SIZE[u]; }
  return out;
}

/* 翻页牌的单个数字 */
function makeDigit(style) {
  const d = SC.el("dg");
  if (style === "flip") d.innerHTML = `<i class="up"><b></b></i><i class="dn"><b></b></i><i class="fu"><b></b></i><i class="fd"><b></b></i>`;
  d._v = "";
  return d;
}
function setDigit(d, v, style) {
  if (d._v === v) return;
  const old = d._v;
  d._v = v;
  if (style !== "flip") { d.textContent = v; return; }
  const [up, dn, fu, fd] = SC.$$("b", d);
  if (old === "" || SC.reduce) { up.textContent = dn.textContent = fu.textContent = fd.textContent = v; return; }
  dn.textContent = fu.textContent = old;
  up.textContent = fd.textContent = v;
  d.classList.remove("go"); void d.offsetWidth; d.classList.add("go");
  clearTimeout(d._t);
  d.onanimationend = (e) => { if (e.target === fd) { dn.textContent = v; d.classList.remove("go"); } };
}

player.play(async (r) => {
  const style = cfg.style === "plain" ? "plain" : "flip";
  const labels = { ...DEFAULTS.labels, ...(cfg.labels || {}) };
  const total0 = useTarget ? Math.ceil((targetMs - Date.now()) / 1000) : (cfg.demo?.seconds ?? 60);
  const first = split(total0);

  stage.className = "stage " + style;
  stage.innerHTML = `
    ${(cfg.title || cfg.subtitle) ? `<div class="head">${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}</div>` : ""}
    <div class="units"></div>
    <div class="done-box">${SC.esc(cfg.doneText || "")}</div>`;
  const box = SC.$(".units", stage);

  const slots = {};
  for (const u of units) {
    const width = Math.max(2, String(first[u]).length);
    const el = SC.el("unit", `<div class="digits"></div><div class="lab">${SC.esc(labels[u] ?? u)}</div>`);
    const digits = SC.$(".digits", el);
    slots[u] = Array.from({ length: width }, () => { const d = makeDigit(style); digits.append(d); return d; });
    box.append(el);
  }

  const render = (total) => {
    const v = split(total);
    for (const u of units) {
      const s = SC.pad(v[u], slots[u].length);
      slots[u].forEach((d, i) => setDigit(d, s[s.length - slots[u].length + i] ?? "0", style));
    }
    stage.classList.toggle("urgent", cfg.urgentBelow > 0 && total <= cfg.urgentBelow && total > 0);
  };

  const finish = () => {
    stage.classList.remove("urgent");
    stage.classList.add("done");
    const rnd = SC.rng(11);
    const c = SC.el("confetti", Array.from({ length: 44 }, () =>
      `<i style="--x:${(rnd() * 100).toFixed(1)};--d:${(3 + rnd() * 3).toFixed(2)};--w:${(rnd() * 6).toFixed(2)};--r:${Math.round(360 + rnd() * 540)}deg"></i>`).join(""));
    stage.append(c);
  };

  render(total0);
  if (total0 <= 0) { finish(); return; }

  let shown = total0;
  await r.raf((dt, t) => {
    const remain = useTarget ? Math.ceil((targetMs - Date.now()) / 1000) : Math.ceil(total0 - t);
    if (remain !== shown) { shown = remain; render(remain); }
    if (remain <= 0) { finish(); return false; }
  });
});
