/* 引言轮播：逐字显示引文，署名滑入，底部进度条与圆点。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  eyebrow: "",
  layout: "center",   // center | split
  holdMs: 4200,       // 每条停留总时长，毫秒
  quotes: []          // { text, by, role, avatar }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const CJK = /[㐀-鿿぀-ヿ가-힯]/;
const TOK = /[㐀-鿿぀-ヿ가-힯，。！？、；：“”‘’（）《》—…]|[^\s㐀-鿿぀-ヿ가-힯，。！？、；：“”‘’（）《》—…]+|\s+/g;
const hash = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const gradient = (name) => {
  const rnd = SC.rng(hash(name)), c = ["var(--accent)", "var(--accent-2)", "var(--accent-3)"];
  const a = Math.floor(rnd() * 3), b = (a + 1 + Math.floor(rnd() * 2)) % 3;
  return `linear-gradient(${Math.floor(rnd() * 360)}deg, ${c[a]}, ${c[b]})`;
};
const sizeClass = (t) => {
  const w = Array.from(t).reduce((a, ch) => a + (CJK.test(ch) ? 1 : .55), 0);
  return w <= 18 ? "s1" : w <= 40 ? "s2" : w <= 76 ? "s3" : "s4";
};
const ARR = (d) => `<svg viewBox="0 0 16 16"><path d="${d}"/></svg>`;

let ctl = null;   // 当前这次播放的控制句柄，键盘监听只绑一次
addEventListener("keydown", (e) => {
  if (!ctl || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "ArrowRight") { e.preventDefault(); ctl.step(1); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); ctl.step(-1); }
});

player.play(async (r) => {
  ctl = null;
  const quotes = (Array.isArray(cfg.quotes) ? cfg.quotes : []).filter((q) => q && typeof q === "object" && q.text !== undefined && q.text !== null && String(q.text).trim()).slice(0, 30);
  const n = quotes.length;
  const layout = cfg.layout === "split" ? "split" : "center";
  const hold = Math.max(1200, +cfg.holdMs || 4200);
  const label = cfg.eyebrow || cfg.title || "";

  stage.innerHTML = `<div class="top"><div class="sc-eyebrow">${SC.esc(label)}</div><div class="cnt"></div></div>
    <div class="main ${layout}"></div>
    <div class="foot"><div class="bars">${quotes.map(() => `<div class="bar"><i></i></div>`).join("")}</div>
    <div class="nav"><div class="dots"></div><div class="arrs"></div></div></div>`;
  if (!n) return;
  const main = SC.$(".main", stage), cnt = SC.$(".cnt", stage), dotsBox = SC.$(".dots", stage), arrs = SC.$(".arrs", stage);
  stage.style.setProperty("--hold", hold + "ms");

  const bars = SC.$$(".bar", stage);
  const dots = quotes.map((q, i) => {
    const d = SC.el("dot", "", "button"); d.type = "button"; d.setAttribute("aria-label", `第 ${i + 1} 条`);
    d.addEventListener("click", () => go(i, true)); dotsBox.append(d); return d;
  });
  if (n > 1) for (const [dir, path] of [[-1, "M10 3L5 8l5 5"], [1, "M6 3l5 5-5 5"]]) {
    const b = SC.el("arr", ARR(path), "button"); b.type = "button"; b.setAttribute("aria-label", dir < 0 ? "上一条" : "下一条");
    b.addEventListener("click", () => step(dir)); arrs.append(b);
  }

  let cur = -1, tok = 0, interacted = false;

  const avatar = (q) => {
    const av = SC.el("av"), mono = () => { av.replaceChildren(SC.el("", "", "span")); av.firstChild.textContent = Array.from(String(q.by || "?").trim())[0] || "?"; av.style.background = gradient(q.by); };
    if (q.avatar) { const im = SC.media(q.avatar, { alt: q.by || "" }); im.addEventListener("error", mono); av.append(im); } else mono();
    return av;
  };

  /* 渲染第 i 条；返回逐字出现的异步函数 */
  const render = (i, instant) => {
    cur = i; const q = quotes[i];
    const text = String(q.text);
    const cjk = CJK.test(text);
    const toks = text.match(TOK) || [text];
    const qEl = SC.el(`q ${sizeClass(text)}`, "", "p");
    const words = [];
    toks.forEach((t) => {
      if (/^\s+$/.test(t)) { qEl.append(SC.el("sp", SC.esc(t === "\n" ? " " : " "), "span")); return; }
      const w = SC.el("w", "", "span"); w.textContent = t; qEl.append(w); words.push(w);
    });
    const by = SC.el("by");
    by.append(avatar(q));
    by.insertAdjacentHTML("beforeend", `<div class="bl"><b>${SC.esc(q.by ?? "")}</b>${q.role ? `<i>${SC.esc(q.role)}</i>` : ""}</div>`);
    const qm = SC.el("qm", "“");
    const slide = SC.el("slide");
    if (layout === "split") {
      const pane = SC.el("pane"); pane.append(qm, by);
      const body = SC.el("body"); body.append(qEl);
      slide.append(pane, body);
    } else slide.append(qm, qEl, by);
    main.replaceChildren(slide);

    cnt.innerHTML = `<b>${SC.pad(i + 1)}</b> / ${SC.pad(n)}`;
    dots.forEach((d, k) => d.classList.toggle("cur", k === i));
    const runNow = !interacted && !SC.reduce;
    bars.forEach((b, k) => {
      b.classList.remove("run", "done");
      if (k < i || (k === i && !runNow)) b.classList.add("done");
      else if (k === i) { void b.offsetWidth; b.classList.add("run"); }
    });
    if (instant) { words.forEach((w) => w.classList.add("on")); by.classList.add("on"); return null; }
    const per = SC.clamp(Math.min(1700, hold * .45) / Math.max(words.length, 1), 18, cjk ? 70 : 150);
    return async (my) => {
      await r.wait(250);
      for (const w of words) { if (my !== tok) return; w.classList.add("on"); await r.wait(per); }
      if (my !== tok) return;
      await r.wait(120);
      if (my === tok) by.classList.add("on");
    };
  };

  const show = (i) => {
    const my = ++tok;
    const run = render(i, SC.reduce);
    if (run) r.spawn(run(my));
  };
  const go = (i, user) => {
    if (!r.live) return;
    if (user) interacted = true;
    if (i === cur && user) { interacted = true; bars.forEach((b, k) => { if (k === cur) { b.classList.remove("run"); b.classList.add("done"); } }); return; }
    show(((i % n) + n) % n);
  };
  const step = (d) => { interacted = true; show((cur + d + n) % n); };
  ctl = { step };

  if (SC.reduce) { show(0); return; }
  for (let i = 0; i < n && !interacted; i++) {
    show(i);
    for (let t = 0; t < hold && !interacted; t += 100) await r.wait(100);
  }
});
