/* 四象限矩阵：十字线先画出，象限依次高亮；list 列要点，scatter 按坐标落点。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  eyebrow: "",
  mode: "list",
  axes: {},
  quadrants: [],
  points: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const PALETTE = ["accent", "accent-2", "accent-3", "good"];
const ALLOWED = ["accent", "accent-2", "accent-3", "good", "bad"];

function normalize() {
  const qs = [0, 1, 2, 3].map((i) => {
    const q = (Array.isArray(cfg.quadrants) ? cfg.quadrants[i] : null) || {};
    const o = typeof q === "object" ? q : { title: q };
    return {
      title: String(o.title ?? ""),
      color: "var(--" + (ALLOWED.includes(o.color) ? o.color : PALETTE[i]) + ")",
      items: (Array.isArray(o.items) ? o.items : []).map((s) => String((s && typeof s === "object" ? s.text : s) ?? "").trim()).filter(Boolean).slice(0, 40)
    };
  });
  const pts = (Array.isArray(cfg.points) ? cfg.points : []).filter((p) => p && typeof p === "object" && Number.isFinite(+p.x) && Number.isFinite(+p.y) && p.x !== null && p.y !== null)
    .slice(0, 80).map((p) => {
      const x = SC.clamp(+p.x, 0, 100), y = SC.clamp(+p.y, 0, 100);
      const q = (y >= 50 ? 0 : 2) + (x >= 50 ? 1 : 0);
      return { label: String(p.label ?? ""), x: SC.clamp(x, 3, 97), y: SC.clamp(y, 3, 97), q };
    });
  const ax = cfg.axes && typeof cfg.axes === "object" ? cfg.axes : {};
  const g = (a, k) => String((ax[a] && ax[a][k]) ?? "");
  return { qs, pts, axes: { xl: g("x", "low"), xh: g("x", "high"), yl: g("y", "low"), yh: g("y", "high") }, scatter: cfg.mode === "scatter" };
}

player.play(async (r) => {
  stage.innerHTML = "";
  const { qs, pts, axes, scatter } = normalize();
  if (cfg.eyebrow || cfg.title) stage.append(SC.el("head", `${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}`));
  const mx = SC.el("mx"); stage.append(mx);
  const hl = SC.el("cross h"), vl = SC.el("cross v"); mx.append(hl, vl);

  const axEls = [];
  const addAx = (cls, txt, css) => { if (!txt) return; const e = SC.el("ax " + cls); const s = document.createElement("span"); s.textContent = txt; e.append(s); Object.assign(e.style, css); mx.append(e); axEls.push(e); };
  addAx("l", axes.yh, { top: "0", height: "50%" }); addAx("l", axes.yl, { top: "50%", height: "50%" });
  addAx("b", axes.xl, { left: "0" }); addAx("b", axes.xh, { left: "50%" });

  const cells = qs.map((q, i) => {
    const c = SC.el(`cell q${i} ${scatter ? "sc" : ""}`);
    c.style.left = i % 2 ? "50%" : "0"; c.style.top = i < 2 ? "0" : "50%"; c.style.setProperty("--c", q.color);
    const inn = SC.el("in"); c.append(inn);
    const h = document.createElement("h3"); h.innerHTML = `<b>${"0" + (i + 1)}</b><span></span>`; h.lastChild.textContent = q.title; if (!q.title) h.style.display = "none";
    inn.append(h);
    if (!scatter) {
      const ul = document.createElement("ul");
      q.items.forEach((t) => { const li = document.createElement("li"); li.textContent = t; ul.append(li); });
      inn.append(ul); c.ul = ul;
    }
    mx.append(c); return c;
  });

  /* 列表模式：内容超出象限时逐步缩小字号 */
  if (!scatter) for (const c of cells) {
    let f = 1; c.ul.style.fontSize = f + "em";
    while (c.ul.scrollHeight > c.ul.clientHeight + 1 && f > .5) { f -= .05; c.ul.style.fontSize = f + "em"; }
  }

  /* 散点：先落点，再为标签挑一个不压住别的标签和圆点的位置 */
  const ptEls = pts.map((p) => {
    const e = SC.el("pt"); e.style.left = p.x + "%"; e.style.top = 100 - p.y + "%"; e.style.setProperty("--c", qs[p.q].color);
    e.innerHTML = "<i></i><b></b>"; e.lastChild.textContent = p.label; e.title = p.label; if (!p.label) e.lastChild.style.display = "none";
    mx.append(e); e.p = p; return e;
  });
  if (ptEls.length) {
    const box = mx.getBoundingClientRect(), fsz = parseFloat(getComputedStyle(stage).fontSize) || 16, gap = .9 * fsz;
    const taken = ptEls.map((e) => { const b = e.firstChild.getBoundingClientRect(); return { l: b.left - 3, r: b.right + 3, t: b.top - 3, b: b.bottom + 3 }; });
    const hit = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
    const dots = taken.slice();
    for (const e of ptEls) {
      const lab = e.lastChild; if (!e.p.label) continue;
      const w = lab.offsetWidth, h = lab.offsetHeight, c = e.getBoundingClientRect();
      const cands = [[gap, -h / 2], [-gap - w, -h / 2], [-w / 2, -gap - h], [-w / 2, gap], [gap, -gap - h], [gap, gap - 2], [-gap - w, -gap - h], [-gap - w, gap - 2]];
      let pick = null;
      for (const [dx, dy] of cands) {
        const rc = { l: c.left + dx, r: c.left + dx + w, t: c.top + dy, b: c.top + dy + h };
        if (rc.l < box.left || rc.r > box.right || rc.t < box.top || rc.b > box.bottom) continue;
        if (taken.some((t, k) => t !== undefined && ptEls[k] !== e && hit(rc, t)) || dots.some((d, k) => ptEls[k] !== e && hit(rc, d))) continue;
        pick = [dx, dy, rc]; break;
      }
      if (!pick) { const [dx, dy] = cands[0]; pick = [dx, dy, { l: c.left + dx, r: c.left + dx + w, t: c.top + dy, b: c.top + dy + h }]; }
      const lf = parseFloat(getComputedStyle(lab).fontSize) || fsz;
      lab.style.left = pick[0] / lf + "em"; lab.style.top = pick[1] / lf + "em";
      taken[ptEls.indexOf(e)] = { l: pick[2].l - 3, r: pick[2].r + 3, t: pick[2].t - 3, b: pick[2].b + 3 };
    }
  }

  const setSpot = (i) => {
    cells.forEach((c, k) => { c.classList.toggle("spot", k === i); c.classList.toggle("dim", i >= 0 && k !== i); });
    ptEls.forEach((e) => e.classList.toggle("dim", i >= 0 && e.p.q !== i));
  };
  const showQuad = (i) => {
    cells[i].classList.add("on", "show");
    cells[i].querySelectorAll("li").forEach((li, k) => li.style.setProperty("--dl", k * 140 + "ms"));
    ptEls.filter((e) => e.p.q === i).forEach((e, k) => { e.style.setProperty("--dl", k * 140 + "ms"); e.classList.add("on"); });
  };
  const interactive = () => {
    cells.forEach((c, i) => {
      c.addEventListener("mouseenter", () => { mx.classList.add("focus"); c.classList.add("hov"); ptEls.forEach((e) => e.classList.toggle("hov", e.p.q === i)); });
      c.addEventListener("mouseleave", () => { mx.classList.remove("focus"); c.classList.remove("hov"); });
    });
    ptEls.forEach((e) => {
      e.addEventListener("mouseenter", () => { mx.classList.add("focus"); e.classList.add("hov"); cells[e.p.q].classList.add("hov"); ptEls.forEach((o) => o !== e && o.classList.remove("hov")); });
      e.addEventListener("mouseleave", () => { mx.classList.remove("focus"); e.classList.remove("hov"); cells[e.p.q].classList.remove("hov"); });
    });
  };

  if (SC.reduce) { hl.classList.add("on"); vl.classList.add("on"); axEls.forEach((e) => e.classList.add("on")); [0, 1, 2, 3].forEach(showQuad); interactive(); return; }
  await r.wait(300);
  hl.classList.add("on"); vl.classList.add("on");
  await r.wait(900);
  axEls.forEach((e) => e.classList.add("on"));
  await r.wait(500);
  for (let i = 0; i < 4; i++) {
    setSpot(i); showQuad(i);
    const n = scatter ? ptEls.filter((e) => e.p.q === i).length : qs[i].items.length;
    await r.wait(900 + n * 140);
  }
  setSpot(-1);
  await r.wait(600);
  interactive();
});
