/* 动感字幕：预告片式的快节奏文字。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  beatMs: 900,
  background: "solid",   // solid | flash
  finale: "stack",       // stack | none
  lines: []              // { text, style, color }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const STYLES = ["punch", "slide", "echo", "split", "outline"];
const COLORS = { fg: "--fg", accent: "--accent", "accent-2": "--accent-2", "accent-3": "--accent-3" };

/* 把 el（.k-txt）的字号调到刚好放进 maxW × maxH。先量单行宽度，放不下（字号过小）就换行再逐步缩小 */
function fit(el, maxW, maxH) {
  const stagePx = parseFloat(getComputedStyle(stage).fontSize) || 16;
  el.classList.remove("wrap"); el.style.width = ""; el.style.fontSize = "10em";
  const w = el.offsetWidth || 1;
  let em = 10 * maxW / w;
  if (em >= 4.2) { el.style.fontSize = Math.min(em, 15) + "em"; return; }
  el.classList.add("wrap"); el.style.width = maxW + "px";
  em = 5.5;
  for (let i = 0; i < 40; i++) {
    el.style.fontSize = em + "em";
    if (el.offsetHeight <= maxH && el.scrollWidth <= maxW + 1) break;
    em *= .92; if (em < .8) break;
  }
}

/* 构造一句的 DOM（不含动画类之外的状态）。i 用来给随机数播种 */
function buildText(text, style, i, d) {
  const el = SC.el("k-txt");
  const t = SC.el("k-t");
  if (style === "split") {
    const rnd = SC.rng(101 + i * 37);
    [...text].forEach((ch, k) => {
      if (ch === " ") { t.append(document.createTextNode(" ")); return; }
      const s = SC.el("k-ch"); s.textContent = ch;
      const a = rnd() * Math.PI * 2, dist = 8 + rnd() * 14;
      s.style.cssText = `--dx:${(Math.cos(a) * dist).toFixed(2)}em;--dy:${(Math.sin(a) * dist * .6).toFixed(2)}em;--rot:${((rnd() - .5) * 240).toFixed(0)}deg;--i:${k}`;
      t.append(s);
    });
  } else t.textContent = text;
  el.append(t);
  if (style === "echo") for (let k = 1; k <= 4; k++) { const e = SC.el("k-e"); e.textContent = text; e.style.setProperty("--k", k); e.setAttribute("aria-hidden", "true"); el.append(e); }
  return el;
}

player.play(async (r) => {
  stage.innerHTML = "";
  stage.style.removeProperty("--c");
  const beat = Math.max(200, Number(cfg.beatMs) || 900);
  const lines = (Array.isArray(cfg.lines) ? cfg.lines : []).filter((l) => l && l.text !== undefined && l.text !== null && String(l.text).trim() !== "")
    .map((l, i) => ({
      text: String(l.text).replace(/\s*\n\s*/g, " "),
      style: STYLES.includes(l.style) ? l.style : STYLES[i % STYLES.length],
      color: COLORS[l.color] ? l.color : "fg"
    }));
  if (!lines.length) return;
  const cssCol = (c) => `var(${COLORS[c]})`;
  const d = SC.clamp(beat * .5 / 1000, .25, .6);       // 单个入场动画的基准时长，秒
  stage.style.setProperty("--d", d + "s");
  const sw = () => stage.clientWidth, sh = () => stage.clientHeight;

  const stack = () => {
    const box = SC.el("k-stack");
    const rows = lines.map((l, i) => {
      const row = SC.el("k-row" + (l.style === "outline" ? " o" : ""));
      const el = buildText(l.text, "plain", i, d); el.style.setProperty("--c", cssCol(l.color)); el.style.setProperty("--i", i);
      row.append(el); box.append(row); return el;
    });
    stage.append(box);
    const maxW = sw() * .86, maxH = sh() * .86;
    rows.forEach((el) => fit(el, maxW, maxH / Math.max(1, rows.length)));
    for (let pass = 0; pass < 3; pass++) {
      const total = rows.reduce((s, el) => s + el.offsetHeight, 0);
      if (total <= maxH) break;
      const f = maxH / total * .98;
      rows.forEach((el) => { el.style.fontSize = parseFloat(el.style.fontSize) * f + "em"; });
    }
    return box;
  };

  if (SC.reduce) { stack(); return; }

  const mkCount = () => { const c = SC.el("k-count"); stage.append(c); return c; };
  const count = mkCount();
  await r.wait(beat * .4);

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i], dir = i % 2 ? -1 : 1;
    SC.$$(".k-line, .k-flash, .k-beat", stage).forEach((n) => n.remove());
    const holder = SC.el(`k-line ${l.style}`);
    holder.style.setProperty("--c", cssCol(l.color));
    holder.style.setProperty("--dir", dir);
    const el = buildText(l.text, l.style, i, d);
    holder.append(el);
    stage.insertBefore(holder, count);
    fit(el, sw() * (l.style === "echo" ? .7 : .86), sh() * .8);
    if (l.style === "slide") {
      const rnd = SC.rng(7 + i);
      for (let k = 0; k < 6; k++) {
        const s = SC.el("streak"); s.style.top = (30 + rnd() * 40).toFixed(1) + "%";
        s.style.setProperty("--sd", (rnd() * .12).toFixed(3) + "s"); s.style.width = (35 + rnd() * 40).toFixed(0) + "%";
        s.style.left = dir > 0 ? "0" : "auto"; s.style.right = dir > 0 ? "auto" : "0";
        holder.append(s);
      }
    }
    if (cfg.background === "flash") {
      const f = SC.el("k-flash"); f.style.setProperty("--c", l.color === "fg" ? "var(--accent)" : cssCol(l.color));
      stage.insertBefore(f, holder);
    }
    const bar = SC.el("k-beat"); bar.style.setProperty("--beat", `calc(${beat / 1000}s / var(--speed))`);
    stage.append(bar);
    count.innerHTML = `<b>${SC.pad(i + 1)}</b> / ${SC.pad(lines.length)}`;
    await r.wait(beat);
  }

  SC.$$(".k-line, .k-flash, .k-beat, .k-count", stage).forEach((n) => n.remove());
  if (cfg.finale === "none") {
    // 保留最后一句，不再变化
    const l = lines[lines.length - 1];
    const holder = SC.el(`k-line`); const el = buildText(l.text, "plain", 0, d);
    el.style.setProperty("--c", cssCol(l.color)); holder.append(el); stage.append(holder);
    fit(el, sw() * .86, sh() * .8);
    return;
  }
  if (cfg.background === "flash") { const f = SC.el("k-flash"); stage.append(f); }
  stack();
  await r.wait(beat * 2);
});
