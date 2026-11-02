/* 文字揭示：大字逐句出现，每句可选不同效果。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "文字揭示",
  effect: "fade",        // type | mask | words | glitch | fade
  align: "left",         // left | center | right
  size: "xl",            // xl | l | m
  hold: 1600,            // 每句停留，毫秒
  showProgress: true,
  lines: []              // { text, effect, hold, emphasis }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const EFFECTS = ["type", "mask", "words", "glitch", "fade"];

/* text[from, to) 转成 HTML，emphasis 区间 [s, e) 套 <em> */
function html(text, from, to, emph) {
  const s = emph ? text.indexOf(emph) : -1, e = s + (emph ? emph.length : 0);
  if (s < 0) return SC.esc(text.slice(from, to));
  let out = "";
  const cut = (a, b, em) => { a = Math.max(a, from); b = Math.min(b, to); if (b > a) out += em ? `<em>${SC.esc(text.slice(a, b))}</em>` : SC.esc(text.slice(a, b)); };
  cut(0, s, false); cut(s, e, true); cut(e, text.length, false);
  return out;
}

/* 切词：优先 Intl.Segmenter（中文分词），否则按空格，再否则逐字 */
function tokens(text) {
  if (window.Intl && Intl.Segmenter) {
    return [...new Intl.Segmenter("zh", { granularity: "word" }).segment(text)].map((x) => ({ s: x.segment, i: x.index }));
  }
  const out = []; let i = 0;
  for (const m of text.matchAll(/\s+|\S+/g)) { out.push({ s: m[0], i: m.index }); i = m.index + m[0].length; }
  return out.length > 1 ? out : [...text].map((c, k) => ({ s: c, i: k }));
}

player.play(async (r) => {
  const size = ["xl", "l", "m"].includes(cfg.size) ? cfg.size : "xl";
  const align = ["left", "center", "right"].includes(cfg.align) ? cfg.align : "left";
  stage.className = `stage ${size} ${align}`;
  stage.innerHTML = "";
  const lines = (cfg.lines || []).filter((l) => l && l.text);
  const slot = SC.el("slot");
  stage.append(slot);
  let prog = [];
  if (cfg.showProgress && lines.length) {
    const bar = SC.el("prog");
    prog = lines.map(() => { const i = SC.el("", "<b></b>", "i"); bar.append(i); return i; });
    stage.append(bar);
  }

  await r.wait(SC.reduce ? 0 : 400);
  for (let n = 0; n < lines.length; n++) {
    const L = lines[n], text = String(L.text);
    const fx = EFFECTS.includes(L.effect) ? L.effect : EFFECTS.includes(cfg.effect) ? cfg.effect : "fade";
    const hold = L.hold ?? cfg.hold ?? 1600;
    slot.innerHTML = "";
    const line = SC.el("line");
    slot.append(line);
    prog.forEach((p, k) => { p.classList.toggle("done", k < n); p.classList.remove("cur"); });
    if (prog[n]) { prog[n].style.setProperty("--dur", (hold + 800) / 1000 + "s"); }

    if (SC.reduce) {
      line.innerHTML = html(text, 0, text.length, L.emphasis);
    } else if (fx === "type") {
      const caret = SC.el("caret", "", "i");
      const body = SC.el("", "", "span");
      line.append(body, caret);
      for (let i = 1; i <= text.length; i++) { body.innerHTML = html(text, 0, i, L.emphasis); await r.wait(70); }
    } else if (fx === "mask") {
      const m = SC.el("mask", `<span>${html(text, 0, text.length, L.emphasis)}</span>`);
      line.append(m);
      void m.offsetWidth;
      m.classList.add("on");
      await r.wait(900);
    } else if (fx === "words") {
      const s = text.indexOf(L.emphasis || "\u0000"), e = s + (L.emphasis || "").length;
      const spans = tokens(text).map((t) => {
        const w = SC.el("w", html(t.s, 0, t.s.length, null), "span");
        if (s >= 0 && t.i < e && t.i + t.s.length > s) w.innerHTML = `<em>${SC.esc(t.s)}</em>`;
        line.append(w); return w;
      });
      void line.offsetWidth;
      for (const w of spans) { w.classList.add("on"); if (w.textContent.trim()) await r.wait(90); }
      await r.wait(500);
    } else if (fx === "glitch") {
      const g = SC.el("glitch", html(text, 0, text.length, L.emphasis), "span");
      g.dataset.text = text;
      line.append(g);
      await r.wait(900);
    } else {
      const f = SC.el("fade", html(text, 0, text.length, L.emphasis));
      line.append(f);
      void f.offsetWidth;
      f.classList.add("on");
      await r.wait(1000);
    }

    const last = n === lines.length - 1;
    if (prog[n]) prog[n].classList.add("cur");
    await r.wait(hold);
    if (last) { prog.forEach((p) => { p.classList.remove("cur"); p.classList.add("done"); }); break; }
    line.classList.add("out");
    await r.wait(SC.reduce ? 0 : 450);
  }
});
