/* 矩形树图：squarified 布局，面积正比于数值，同组同色系，依次缩放入场。配置见 config.js。 */
const DEFAULTS = { theme: "dark", title: "", subtitle: "", unit: "", totalLabel: "合计", items: [], note: "", stagger: 60 };
const { cfg, player, stage } = SC.init(DEFAULTS);

const PALETTE = ["var(--accent)", "var(--accent-2)", "var(--accent-3)", "var(--good)"];
const unit = String(cfg.unit ?? "");

/* 数据 */
const items = [];
(Array.isArray(cfg.items) ? cfg.items : []).forEach((it, i) => {
  if (!it || typeof it !== "object") return;
  const v = parseFloat(it.value);
  if (!Number.isFinite(v) || v <= 0) return;
  items.push({ name: String(it.name ?? `项目 ${i + 1}`), value: v, group: it.group != null && it.group !== "" ? String(it.group) : "", idx: i });
});
const total = items.reduce((a, b) => a + b.value, 0);
const hasGroups = items.some((i) => i.group);
const groups = [];
if (hasGroups) {
  const m = new Map();
  items.forEach((it) => { const g = it.group || "其他"; it.group = g; if (!m.has(g)) { const o = { name: g, items: [], value: 0 }; m.set(g, o); groups.push(o); } const o = m.get(g); o.items.push(it); o.value += it.value; });
  groups.sort((a, b) => b.value - a.value);
  groups.forEach((g, gi) => { g.base = PALETTE[gi % PALETTE.length]; g.items.sort((a, b) => b.value - a.value || a.idx - b.idx); });
} else {
  const sorted = [...items].sort((a, b) => b.value - a.value || a.idx - b.idx);
  groups.push({ name: "", items: sorted, value: total, base: PALETTE[0], flat: true });
}

/* squarified：list 里每项带面积 a，结果写入 r:{x,y,w,h} */
function squarify(list, x, y, w, h) {
  list = list.slice();
  while (list.length) {
    const short = Math.min(w, h);
    const worst = (row, s) => { const mx = Math.max(...row.map((i) => i.a)), mn = Math.min(...row.map((i) => i.a)); return Math.max(short * short * mx / (s * s), s * s / (short * short * mn)); };
    let row = [list[0]], s = list[0].a, i = 1;
    while (i < list.length) {
      const ns = s + list[i].a, nr = row.concat(list[i]);
      if (worst(nr, ns) <= worst(row, s)) { row = nr; s = ns; i++; } else break;
    }
    const last = i >= list.length;
    const th = last ? (w >= h ? w : h) : s / short;
    if (w >= h) { const tw = last ? w : th; let cy = y; row.forEach((it) => { const hh = it.a / tw; it.r = { x, y: cy, w: tw, h: hh }; cy += hh; }); x += tw; w -= tw; }
    else { const tt = last ? h : th; let cx = x; row.forEach((it) => { const ww = it.a / tt; it.r = { x: cx, y, w: ww, h: tt }; cx += ww; }); y += tt; h -= tt; }
    list = list.slice(row.length);
  }
}

const pctOf = (v) => (total > 0 ? v / total * 100 : 0);
const fmtV = (v) => SC.fmt(v, { decimals: v % 1 ? 1 : 0 }) + unit;

function build() {
  const head = `<div class="top"><div>${cfg.title ? `<h1 class="sc-title rise">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub rise" style="--d:.12s">${SC.esc(cfg.subtitle)}</p>` : ""}</div>${items.length ? `<div class="big rise" style="--d:.2s"><b id="tot">0</b><span>${SC.esc(cfg.totalLabel ?? "")}</span></div>` : ""}</div>`;
  const legend = hasGroups ? `<div class="legend rise" style="--d:.5s">${groups.map((g) => `<span style="--b:${g.base}"><i></i>${SC.esc(g.name)}<em>${pctOf(g.value).toFixed(0)}%</em></span>`).join("")}</div>` : "<div></div>";
  const foot = `<div class="foot">${legend}${cfg.note ? `<p class="note rise" style="--d:.5s">${SC.rich(cfg.note)}</p>` : ""}</div>`;
  return `${head}<div class="plot rise" style="--d:.25s" id="plot">${items.length ? "" : `<div class="empty">暂无数据</div>`}</div>${foot}<div class="tip" id="tip"></div>`;
}

player.play(async (r) => {
  stage.className = "stage" + (SC.reduce ? " nomo" : "");
  stage.innerHTML = build();
  const plot = SC.$("#plot", stage), tot = SC.$("#tot", stage), tip = SC.$("#tip", stage);
  const em = parseFloat(getComputedStyle(stage).fontSize) || 16;
  const PW = plot.clientWidth / em, PH = plot.clientHeight / em;
  const tiles = [];

  if (items.length && PW > 0 && PH > 0) {
    /* 第一层分组，第二层组内；面积严格按数值比例 */
    groups.forEach((g) => { g.a = g.value / total * PW * PH; });
    if (groups.length > 1 || !groups[0].flat) squarify(groups, 0, 0, PW, PH); else groups[0].r = { x: 0, y: 0, w: PW, h: PH };
    let order = 0;
    groups.forEach((g) => {
      const k = g.r.w * g.r.h / g.value;
      g.items.forEach((it) => { it.a = it.value * k; });
      squarify(g.items, g.r.x, g.r.y, g.r.w, g.r.h);
      g.items.forEach((it, j) => {
        const gi = groups.indexOf(g), n = g.items.length;
        const mixp = g.flat ? 24 + 26 * ((j % 4) / 3) : 22 + 30 * (1 - (n > 1 ? j / (n - 1) : 0));
        const base = g.flat ? PALETTE[j % PALETTE.length] : g.base;
        it.c = `color-mix(in srgb, ${base} ${mixp.toFixed(0)}%, var(--surface))`; it.b = base; it.gi = gi;
      });
    });
    const all = groups.flatMap((g) => g.items).sort((a, b) => b.value - a.value);
    const per = SC.clamp(+cfg.stagger >= 0 ? +cfg.stagger : 60, 0, 400);
    const step = Math.min(per, 2400 / all.length) / 1000;
    all.forEach((it, k) => {
      const { x, y, w, h } = it.r, e = SC.el("tile");
      e.style.cssText = `left:${(x / PW * 100).toFixed(3)}%;top:${(y / PH * 100).toFixed(3)}%;width:${(w / PW * 100).toFixed(3)}%;height:${(h / PH * 100).toFixed(3)}%;--c:${it.c};--b:${it.b};--d:${(0.5 + k * step).toFixed(3)}`;
      e.dataset.i = tiles.length;
      /* 标签：放不下就隐藏；字号随矩形大小 */
      const f = SC.clamp(Math.sqrt(w * h) / 9, 0.72, 2.1);
      const cjk = [...it.name].reduce((a, ch) => a + (ch.charCodeAt(0) > 255 ? 1 : 0.58), 0);
      const room = (w - 1.4) / f;
      const showName = h >= 2.3 * f && w >= 3 && room >= Math.min(cjk, 2.2);
      if (showName) {
        e.innerHTML = `<div class="n" style="font-size:${f.toFixed(2)}em">${SC.esc(it.name)}</div>`;
        if (h >= 3.2 + f * 1.3 && w >= 5.2) e.innerHTML += `<div class="v">${SC.esc(fmtV(it.value))} · ${pctOf(it.value).toFixed(1)}%</div>`;
      }
      plot.append(e); tiles.push({ it, e });
    });
  }
  const hl = (e) => { tiles.forEach((t) => t.e.classList.toggle("hl", t.e === e)); plot.classList.toggle("has-hl", !!e); };
  plot.addEventListener("mousemove", (ev) => {
    const e = ev.target.closest(".tile");
    if (!e || !plot.classList.contains("ready")) { hl(null); tip.classList.remove("show"); return; }
    const it = tiles[+e.dataset.i].it; hl(e);
    tip.innerHTML = `${it.group ? SC.esc(it.group) + " / " : ""}${SC.esc(it.name)}<b>${SC.esc(fmtV(it.value))}</b><i>${pctOf(it.value).toFixed(1)}%</i>`;
    tip.classList.add("show");
    const s = stage.getBoundingClientRect(), k = s.width / stage.offsetWidth || 1, w = tip.offsetWidth * k;
    tip.style.left = SC.clamp(ev.clientX - s.left + 14, 4, s.width - w - 4) / k + "px";
    tip.style.top = Math.max(4, ev.clientY - s.top - 14 - tip.offsetHeight * k) / k + "px";
  });
  plot.addEventListener("mouseleave", () => { hl(null); tip.classList.remove("show"); });

  if (SC.reduce) { plot.classList.add("ready"); if (tot) tot.textContent = SC.fmt(total) + unit; return; }
  await r.wait(500);
  if (tot) SC.countUp(r, tot, total, { dur: 2000, suffix: unit });
  await r.wait(600 + Math.min(2400, tiles.length * (+cfg.stagger >= 0 ? +cfg.stagger : 60)) + 400);
  plot.classList.add("ready");
});
