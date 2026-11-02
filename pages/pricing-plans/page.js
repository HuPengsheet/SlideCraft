/* 价格方案：卡片依次升起，价格滚动，功能逐条打勾；播放后可切换月付/年付。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "价格方案",
  subtitle: "",
  billing: { options: [], default: 0, note: "" },
  currency: "¥",
  plans: []              // { name, desc, price, unit, features, highlight, badge, cta }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const CHECK = `<svg viewBox="0 0 16 16"><path pathLength="1" d="M3 8.5l3.2 3.2L13 4.6"/></svg>`;
const CROSS = `<svg viewBox="0 0 16 16"><path pathLength="1" d="M4 8h8"/></svg>`;

player.play(async (r) => {
  const plans = (Array.isArray(cfg.plans) ? cfg.plans : []).filter((p) => p && typeof p === "object").slice(0, 4);
  const opts = (Array.isArray(cfg.billing && cfg.billing.options) ? cfg.billing.options : []).map(String);
  let col = SC.clamp(Math.round(+(cfg.billing && cfg.billing.default) || 0), 0, Math.max(0, opts.length - 1));
  const cur = cfg.currency == null ? "¥" : String(cfg.currency);

  /* 取某方案在某周期的价格：数字或文字 */
  const priceOf = (p, c) => {
    const v = Array.isArray(p.price) ? (p.price[c] ?? p.price[0]) : p.price;
    return v === "" || v == null ? "—" : Number.isFinite(+v) ? +v : String(v);
  };
  const show = (el, v) => { el.textContent = typeof v === "number" ? SC.fmt(v) : v; };

  stage.innerHTML = "";
  const head = SC.el("head", `${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}`);
  stage.append(head);
  let tg = null, seg = null, btns = [];
  if (opts.length > 1) {
    tg = SC.el("tg", `<div class="seg lock" style="--n:${opts.length};--i:${col}"><i class="th"></i>${opts.map((o, i) => `<button class="${i === col ? "on" : ""}">${SC.esc(o)}</button>`).join("")}</div>${cfg.billing.note ? `<span class="tnote">${SC.esc(cfg.billing.note)}</span>` : ""}`);
    stage.append(tg); seg = SC.$(".seg", tg); btns = SC.$$("button", seg);
  }
  const wrap = SC.el("cards");
  stage.append(wrap);
  if (!plans.length) { wrap.textContent = "（没有方案）"; return; }

  const cards = plans.map((p) => {
    const feats = (Array.isArray(p.features) ? p.features : []).map((f) => (typeof f === "string" ? { text: f } : f || {}));
    const card = SC.el("card" + (p.highlight ? " hl" : ""), `${p.badge ? `<div class="badge">${SC.esc(p.badge)}</div>` : ""}
      <div class="nm">${SC.esc(p.name ?? "")}</div><div class="ds">${SC.esc(p.desc ?? "")}</div>
      <div class="pr"><span class="cur">${SC.esc(cur)}</span><span class="amt"></span><span class="un">${SC.esc(p.unit ?? "/月")}</span></div>
      <ul>${feats.map((f) => `<li class="${f.off ? "off" : ""}">${f.off ? CROSS : CHECK}<span>${SC.rich(f.text ?? "")}</span></li>`).join("")}</ul>
      <div class="sp"></div><button class="cta">${SC.esc(p.cta || "选择" + (p.name ?? ""))}</button>`);
    const amt = SC.$(".amt", card);
    card._amt = amt; card._p = p;
    wrap.append(card); return card;
  });

  /* 自动适配：整体缩放到放得下，价格过宽时单独缩小 */
  const fit = () => {
    const em = parseFloat(getComputedStyle(wrap).fontSize) || 16;
    const need = Math.max(...cards.map((c) => c.scrollHeight));
    const avail = wrap.clientHeight - 3.6 * em;
    wrap.style.setProperty("--k", SC.clamp(avail / need, .55, 1).toFixed(3));
    for (const c of cards) {
      let pk = cards.length >= 4 ? 2.4 : 3;
      c.style.setProperty("--pk", pk);
      const longest = [...Array(Math.max(opts.length, 1)).keys()].map((i) => priceOf(c._p, i)).map((v) => (typeof v === "number" ? SC.fmt(v) : v)).sort((a, b) => b.length - a.length)[0];
      show(c._amt, longest);
      const pr = SC.$(".pr", c);
      for (let n = 0; n < 8 && pr.scrollWidth > pr.clientWidth + 1; n++) { pk *= .9; c.style.setProperty("--pk", pk.toFixed(3)); }
    }
    wrap.classList.add("fit");
  };
  fit();
  const hide = (c) => { const v = priceOf(c._p, col); c._amt.parentNode.firstChild.style.display = typeof v === "number" ? "" : "none"; };
  cards.forEach((c) => { hide(c); c._amt.classList.toggle("txt", typeof priceOf(c._p, col) === "string"); show(c._amt, typeof priceOf(c._p, col) === "number" ? 0 : priceOf(c._p, col)); c._v = 0; });

  /* 价格补间：同一元素上新的补间会顶掉旧的 */
  const tween = (c, to, dur = 900) => {
    const el = c._amt, tok = (c._tok = (c._tok || 0) + 1);
    el.classList.toggle("txt", typeof to === "string");
    c._amt.parentNode.firstChild.style.display = typeof to === "number" ? "" : "none";
    if (typeof to !== "number") { show(el, to); return Promise.resolve(); }
    const from = c._v || 0;
    if (SC.reduce || from === to) { c._v = to; show(el, to); return Promise.resolve(); }
    return r.spawn(r.raf((dt, t) => {
      if (c._tok !== tok) return false;
      const p = Math.min(t * 1000 / dur, 1);
      c._v = SC.lerp(from, to, SC.ease.out(p)); show(el, Math.round(c._v));
      return p < 1;
    }));
  };

  const setCol = (i) => {
    col = i; seg.style.setProperty("--i", i);
    btns.forEach((b, k) => b.classList.toggle("on", k === i));
    cards.forEach((c) => tween(c, priceOf(c._p, i)));
  };
  btns.forEach((b, i) => b.addEventListener("click", () => { if (!seg.classList.contains("lock") && i !== col) setCol(i); b.blur(); }));

  const reveal = async (c) => {
    c.classList.add("on");
    await r.wait(350);
    const to = priceOf(c._p, col);
    const lis = SC.$$("li", c);
    r.spawn((async () => { for (const li of lis) { li.classList.add("on"); await r.wait(170); } })());
    await tween(c, to, 1300);
    await r.wait(Math.max(0, lis.length * 170 - 1300) + 300);
  };

  if (SC.reduce) {
    head.classList.add("on"); tg && tg.classList.add("on");
    cards.forEach((c) => { c.classList.add("on"); SC.$$("li", c).forEach((li) => li.classList.add("on")); tween(c, priceOf(c._p, col)); });
  } else {
    await r.wait(300); head.classList.add("on");
    await r.wait(400); tg && tg.classList.add("on");
    await r.wait(400);
    const jobs = [];
    for (const c of cards) { jobs.push(r.spawn(reveal(c))); await r.wait(260); }
    await Promise.all(jobs);
    if (!r.live) return;
  }
  seg && seg.classList.remove("lock");
});
