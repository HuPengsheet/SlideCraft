/* 章节转场页：大序号滚动 + 标题。配置见 config.js。 */
const DEFAULTS = { theme: "dark", index: 1, digits: 2, label: "CHAPTER", title: "", subtitle: "", variant: "blocks" };
const { cfg, player, stage } = SC.init(DEFAULTS);

const prog = (t, a, b) => SC.clamp((t - a) / (b - a), 0, 1);

player.play(async (r) => {
  stage.innerHTML = "";
  const variant = ["blocks", "lines", "grid"].includes(cfg.variant) ? cfg.variant : "blocks";
  const n = Math.round(+cfg.index);
  const numeric = Number.isFinite(n) && n >= 0 && n < 1e6;
  const digits = SC.clamp(Math.round(+cfg.digits) || 0, 0, 6);
  const text = numeric ? String(n).padStart(digits, "0") : String(cfg.index ?? "").slice(0, 6);
  const title = String(cfg.title ?? "");
  const label = cfg.label === undefined || cfg.label === null ? "CHAPTER" : String(cfg.label);

  const bg = variant === "lines" ? Array.from({ length: 9 }, (_, i) => `<i class="ln" style="top:${i * 12 - 4}%;animation-delay:${-i * 1.3}s"></i>`).join("")
    : variant === "grid" ? `<i class="gr"></i><i class="shade"></i>`
    : `<i class="blk"></i><i class="blk"></i><i class="blk"></i>`;
  /* 每一位是一列 0..9 竖排的数字条，用 translateY 滚到目标位 */
  const cols = [...text].map((ch) => {
    const d = /\d/.test(ch);
    return `<span class="col"><b data-d="${d ? ch : ""}">${d ? Array.from({ length: 10 }, (_, k) => `<i>${k}</i>`).join("") : `<i>${SC.esc(ch)}</i>`}</b></span>`;
  }).join("");
  const lines = title.split("\n");
  const longest = Math.max(1, ...lines.map((l) => [...l].length));
  const total = Math.max(1, [...title].length);
  const fs = SC.clamp(Math.min(26 / longest, 14 / Math.sqrt(total)), 1.4, 4.4);
  const sfs = [...String(cfg.subtitle || '')].length > 30 ? 1 : 1.4;
  stage.innerHTML = `<div class="bg">${bg}</div>
    <div class="num" style="--nf:${SC.clamp(30 / (Math.max(text.length, 1) * .62), 6, 22)}em" aria-label="${SC.esc(text)}">${cols}</div>
    <div class="txt">
      ${label ? `<span class="sc-eyebrow">${SC.esc(label)}</span>` : ""}
      <h1 class="ttl" style="font-size:${fs}em">${lines.map((l) => SC.esc(l)).join("<br>")}</h1>
      ${cfg.subtitle ? `<p class="sub" style="font-size:${sfs}em">${SC.esc(cfg.subtitle)}</p>` : ""}
    </div>`;
  const bgEl = SC.$(".bg", stage), kids = SC.$$(".txt > *", stage);
  const bs = SC.$$(".col > b", stage);
  const setCols = (p) => bs.forEach((b, i) => {
    if (b.dataset.d === "") return;
    const e = SC.ease.out(prog(p, i * .08, 1));
    b.style.transform = `translateY(${-(+b.dataset.d) * e}em)`;
  });
  const show = (t) => {
    bgEl.style.opacity = SC.ease.out(prog(t, 0, .6));
    setCols(prog(t, .1, 1.7));
    kids.forEach((k, i) => { const e = SC.ease.out(prog(t, .9 + i * .22, 1.6 + i * .22)); k.style.opacity = e; k.style.transform = `translateY(${(1 - e) * .8}em)`; });
  };
  if (SC.reduce) { show(9); return; }
  show(0);
  await r.raf((dt, t) => { show(t); return t < 2.5; });
  show(9);
});
