/* 媒体墙：网格入场、待机摆动、悬停倾斜、灯箱。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  columns: 4,
  aspect: "16/9",
  fit: "cover",          // cover | contain
  gap: 0.9,              // em
  stagger: 55,           // 毫秒
  sway: true,
  tilt: true,
  items: []              // { src, name, note }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const items = (cfg.items || []).filter((it) => it && it.src);
const cols = Math.max(1, Math.min(cfg.columns || 4, items.length || 1));
const rowsN = Math.ceil(items.length / cols);
const ratio = (() => {
  const [a, b] = String(cfg.aspect || "16/9").split("/").map(Number);
  return a > 0 ? a / (b > 0 ? b : 1) : 16 / 9;
})();

stage.innerHTML = `
  <div class="head">${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}${items.length ? `<span class="cnt">${items.length} 项</span>` : ""}</div>
  <div class="area"><div class="wall"></div></div>
  <div class="lb" role="dialog" aria-modal="true">
    <button class="close" aria-label="关闭">✕</button>
    <button class="prev" aria-label="上一个">‹</button>
    <figure><figcaption></figcaption></figure>
    <button class="next" aria-label="下一个">›</button>
    <div class="hint">← → 切换 · Esc 关闭</div>
  </div>`;
const wall = SC.$(".wall", stage), area = SC.$(".area", stage), lb = SC.$(".lb", stage);
stage.classList.toggle("sway", cfg.sway !== false && !SC.reduce);
stage.style.setProperty("--fit", cfg.fit === "contain" ? "contain" : "cover");

/* 让整面墙刚好放进可用区域 */
function fitWall() {
  const em = parseFloat(getComputedStyle(stage).fontSize);
  const g = (cfg.gap ?? 0.9) * em;
  const aw = area.clientWidth, ah = area.clientHeight;
  let cw = (aw - (cols - 1) * g) / cols;
  if (rowsN * cw / ratio + (rowsN - 1) * g > ah) cw = (ah - (rowsN - 1) * g) * ratio / rowsN;
  wall.style.width = Math.max(0, cols * cw + (cols - 1) * g) + "px";
}
addEventListener("resize", fitWall);

player.play(async (r) => {
  wall.innerHTML = "";
  wall.style.setProperty("--cols", cols);
  wall.style.setProperty("--gap", (cfg.gap ?? 0.9) + "em");
  wall.style.setProperty("--ar", ratio);
  const cards = items.map((it, i) => {
    const b = SC.el(`card`, "", "button");
    b.style.cssText = `--i:${i};--c:${i % cols};--r:${Math.floor(i / cols)}`;
    b.dataset.i = i;
    b.setAttribute("aria-label", it.name || `第 ${i + 1} 项`);
    b.append(SC.media(it.src, { alt: it.name || "" }));
    b.insertAdjacentHTML("beforeend", `<span class="glare"></span><span class="no">${SC.pad(i + 1)}</span>${it.name || it.note ? `<span class="cap"><b>${SC.esc(it.name || "")}</b><span>${SC.esc(it.note || "")}</span></span>` : ""}`);
    wall.append(b); return b;
  });
  fitWall();
  await r.wait(SC.reduce ? 0 : 250);
  for (const c of cards) { c.classList.add("in"); await r.wait(SC.reduce ? 0 : cfg.stagger); }
});

/* 悬停倾斜与高光（事件委托，不随重播重建） */
if (cfg.tilt !== false && !SC.reduce) {
  const MAX = 9;
  wall.addEventListener("pointermove", (e) => {
    const c = e.target.closest(".card"); if (!c) return;
    const b = c.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    c.style.setProperty("--ry", ((x - .5) * 2 * MAX).toFixed(2) + "deg");
    c.style.setProperty("--rx", ((.5 - y) * 2 * MAX).toFixed(2) + "deg");
    c.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
    c.style.setProperty("--my", (y * 100).toFixed(1) + "%");
  });
  wall.addEventListener("pointerout", (e) => {
    const c = e.target.closest(".card");
    if (!c || c.contains(e.relatedTarget)) return;
    c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg");
  });
}

/* 灯箱 */
let cur = 0;
function show(i, dir = 0) {
  if (!items.length) return;
  cur = (i + items.length) % items.length;
  const it = items[cur];
  const fig = SC.$("figure", lb);
  SC.$$("figure > img, figure > video", lb).forEach((n) => n.remove());
  const m = SC.media(it.src, { alt: it.name || "" });
  if (m.tagName === "VIDEO") m.controls = true;
  if (dir && !SC.reduce) m.classList.add(dir > 0 ? "go-next" : "go-prev");
  fig.prepend(m);
  SC.$("figcaption", lb).innerHTML = `${SC.pad(cur + 1)}${it.name ? " · " + SC.esc(it.name) : ""}${it.note ? `<span>${SC.esc(it.note)}</span>` : ""}`;
}
function open(i) { show(i); lb.classList.add("on"); }
function close() {
  lb.classList.remove("on");
  SC.$$("figure > video", lb).forEach((v) => v.remove());   // 停止灯箱里的视频
}
const isOpen = () => lb.classList.contains("on");
wall.addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) open(+c.dataset.i); });
lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
SC.$(".close", lb).onclick = close;
SC.$(".prev", lb).onclick = () => show(cur - 1, -1);
SC.$(".next", lb).onclick = () => show(cur + 1, 1);
addEventListener("keydown", (e) => {
  if (!isOpen()) return;
  if (e.key === "Escape") close();
  else if (e.key === "ArrowLeft") show(cur - 1, -1);
  else if (e.key === "ArrowRight") show(cur + 1, 1);
});
