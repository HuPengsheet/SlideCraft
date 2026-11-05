/* 词云：按权重定字号，螺旋布局加碰撞检测，词语按权重从高到低淡入。配置见 config.js。
 * 布局只依赖配置、种子和文字实测尺寸，同样的配置每次结果一致。 */
const DEFAULTS = {
  theme: "dark",
  title: "词云",
  heading: "",
  subheading: "",
  shape: "ellipse",      // ellipse | rect
  seed: 7,
  scale: 1,
  stagger: 0,            // 0 = 自动
  words: []              // 字符串或 { text, weight }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const W = 100 / 1.6, H = 56.25 / 1.6;

const words = (Array.isArray(cfg.words) ? cfg.words : []).slice(0, 120)
  .map((w, i) => {
    const o = (w && typeof w === "object") ? w : { text: w };
    const wt = Number(o.weight);
    return { i, text: String(o.text ?? "").trim().slice(0, 24), weight: wt > 0 && isFinite(wt) ? wt : 1 };
  })
  .filter((w) => w.text);

function layout(measure, shape, seed, scale) {
  const hasHead = !!(cfg.heading || cfg.subheading);
  const area = { x0: 3, x1: W - 3, y0: hasHead ? 9.5 : 3, y1: H - 3 };
  const cx = (area.x0 + area.x1) / 2, cy = (area.y0 + area.y1) / 2;
  const rx = (area.x1 - area.x0) / 2, ry = (area.y1 - area.y0) / 2;
  const sorted = words.slice().sort((a, b) => b.weight - a.weight || a.i - b.i);
  const wmax = sorted[0].weight, wmin = sorted[sorted.length - 1].weight;
  const base = sorted.map((w) => {
    const t = wmax === wmin ? 0.5 : Math.pow((Math.log(w.weight) - Math.log(wmin)) / (Math.log(wmax) - Math.log(wmin) || 1), 0.8);
    return { ...w, size: (1.2 + t * 5.4) * scale };
  });
  let k = 1, placed = [];
  for (; k > 0.3; k *= 0.9) {
    placed = []; let fail = 0;
    const rnd = SC.rng(seed);
    for (const w of base) {
      const size = w.size * k, rank = w.rank;
      const m = measure(w.text, size, w.tier);
      const bw = m.w + 0.5 + size * 0.1, bh = m.h + 0.3 + size * 0.06;   // 含留白
      const dir = rnd() < 0.5 ? 1 : -1, th0 = rnd() * Math.PI * 2;
      let ok = null;
      for (let s = 0; s < 1800 && !ok; s++) {
        const th = th0 + dir * s * 0.12, r = s / 1800 * 1.25;
        let c = Math.cos(th), sn = Math.sin(th);
        if (shape === "rect") { const q = Math.max(Math.abs(c), Math.abs(sn)); c /= q; sn /= q; }
        const x = cx + c * r * rx, y = cy + sn * r * ry;
        const l = x - bw / 2, rt = x + bw / 2, t = y - bh / 2, b = y + bh / 2;
        if (l < area.x0 || rt > area.x1 || t < area.y0 || b > area.y1) continue;
        if (shape !== "rect") {
          const ex = Math.max(Math.abs(l - cx), Math.abs(rt - cx)) / rx, ey = Math.max(Math.abs(t - cy), Math.abs(b - cy)) / ry;
          if (ex * ex + ey * ey > 1.0) continue;
        }
        if (placed.some((p) => l < p.r && rt > p.l && t < p.b && b > p.t)) continue;
        ok = { l, r: rt, t, b };
        placed.push({ ...ok, w, size, x, y, bw, bh });
      }
      if (!ok) fail++;
    }
    if (!fail) break;
    if (k * 0.9 <= 0.3) break;
  }
  return placed;
}

player.play(async (r) => {
  const heading = String(cfg.heading || "").slice(0, 60), sub = String(cfg.subheading || "").slice(0, 120);
  stage.innerHTML = ((heading || sub) ? `<div class="head">${heading ? `<h1 class="sc-title">${SC.esc(heading)}</h1>` : ""}${sub ? `<p class="sc-sub">${SC.esc(sub)}</p>` : ""}</div>` : "") +
    `<div class="cloud"></div><div class="meas"></div>`;
  const cloud = SC.$(".cloud", stage), meas = SC.$(".meas", stage);
  if (!words.length) return;

  /* 分级：前 12% 强调色，之后 30% 正文色，再 25% 蓝色，其余次要色 */
  const order = words.slice().sort((a, b) => b.weight - a.weight || a.i - b.i);
  const n = order.length;
  order.forEach((w, idx) => {
    const f = idx / n;
    w.tier = (f < 0.12 || idx === 0) ? 0 : f < 0.42 ? 1 : f < 0.67 ? 2 : 3;
  });
  const emPx = parseFloat(getComputedStyle(stage).fontSize) || 16;
  const wt = [800, 700, 600, 500];
  const measure = (text, size, tier) => {
    const s = document.createElement("span");
    s.textContent = text; s.style.fontSize = size + "em"; s.style.fontWeight = wt[tier];
    meas.append(s);
    const res = { w: s.offsetWidth / emPx, h: s.offsetHeight / emPx };
    s.remove(); return res;
  };
  const placed = layout(measure, cfg.shape === "rect" ? "rect" : "ellipse", Number(cfg.seed) || 7, SC.clamp(Number(cfg.scale) || 1, 0.5, 1.5));
  meas.remove();

  const spans = placed.map((p) => {
    const wd = SC.el("wd");
    wd.style.left = p.x.toFixed(3) + "em"; wd.style.top = p.y.toFixed(3) + "em";
    const w = SC.el("w t" + p.w.tier, SC.esc(p.w.text), "span");
    w.style.fontSize = p.size.toFixed(3) + "em";
    if (p.w.tier === 3) w.style.setProperty("--o", ".85");
    wd.append(w); cloud.append(wd); return w;
  });
  if (SC.reduce) { spans.forEach((s) => s.classList.add("on")); return; }
  const gap = Number(cfg.stagger) > 0 ? Number(cfg.stagger) : Math.min(140, 2400 / spans.length);
  await r.wait(350);
  for (const s of spans) { s.classList.add("on"); await r.wait(gap); }
  await r.wait(900);
});
