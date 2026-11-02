/* 前后对比滑块：可拖动分隔线 + 自动扫动 + 多组切换。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "前后对比",
  orientation: "horizontal",
  start: 50,
  sweep: true,
  before: null,          // { src, label, filter }
  after: null,
  pairs: []              // { before, after, title, orientation }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

player.play(async (r) => {
  const pairs = (Array.isArray(cfg.pairs) && cfg.pairs.length ? cfg.pairs : [{ before: cfg.before, after: cfg.after }])
    .filter((p) => p && p.before && p.after && p.before.src && p.after.src);
  stage.innerHTML = "";
  if (!pairs.length) return;

  const box = SC.el("cmp"), hdl = SC.el("hdl", "<b>◂▸</b>");
  hdl.tabIndex = 0; hdl.setAttribute("role", "slider"); hdl.setAttribute("aria-label", "对比分隔线");
  const nav = SC.el("nav");
  stage.append(box, nav);

  let idx = 0, pct = SC.clamp(+cfg.start || 50, 0, 100), vertical = false, touched = false;
  const setP = (v) => { pct = SC.clamp(v, 0, 100); box.style.setProperty("--p", pct + "%"); hdl.setAttribute("aria-valuenow", Math.round(pct)); };

  const layer = (cls, o) => {
    const l = SC.el("layer " + cls); l.append(SC.media(o.src, { alt: o.label || "" }));
    if (o.filter) l.firstChild.style.filter = o.filter;
    return l;
  };
  const show = (i) => {
    idx = (i + pairs.length) % pairs.length;
    const p = pairs[idx];
    vertical = (p.orientation || cfg.orientation) === "vertical";
    box.className = "cmp" + (vertical ? " v" : "");
    box.replaceChildren(layer("after", p.after), layer("before", p.before));
    for (const [c, o] of [["b", p.before], ["a", p.after]]) if (o.label) { const t = SC.el("lab " + c); t.textContent = o.label; box.append(t); }
    box.append(hdl);
    hdl.setAttribute("aria-orientation", vertical ? "vertical" : "horizontal");
    setP(cfg.start ?? 50);
    if (ttl) ttl.textContent = p.title || ""; if (cnt) cnt.textContent = `${idx + 1} / ${pairs.length}`;
  };

  let ttl = null, cnt = null;
  if (pairs.length > 1) {
    const prev = SC.el("", "‹", "button"), next = SC.el("", "›", "button");
    prev.setAttribute("aria-label", "上一组"); next.setAttribute("aria-label", "下一组");
    ttl = SC.el("ttl"); cnt = SC.el("", "", "span");
    prev.onclick = () => { touched = true; show(idx - 1); };
    next.onclick = () => { touched = true; show(idx + 1); };
    nav.append(prev, ttl, cnt, next);
  }

  /* 拖动：pointer events，鼠标与触摸通用 */
  const fromEvent = (e) => {
    const b = box.getBoundingClientRect();
    return vertical ? ((e.clientY - b.top) / b.height) * 100 : ((e.clientX - b.left) / b.width) * 100;
  };
  let dragging = false;
  box.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    dragging = touched = true; setP(fromEvent(e)); e.preventDefault();
    try { box.setPointerCapture(e.pointerId); } catch (_) { /* 合成事件或指针已失效时忽略 */ }
  });
  box.addEventListener("pointermove", (e) => { if (dragging) setP(fromEvent(e)); });
  const end = () => { dragging = false; };   // 捕获会在指针抬起时自动释放
  box.addEventListener("pointerup", end);
  box.addEventListener("pointercancel", end);
  hdl.addEventListener("keydown", (e) => {
    const k = e.key, dec = vertical ? "ArrowUp" : "ArrowLeft", inc = vertical ? "ArrowDown" : "ArrowRight";
    if (k === dec || k === inc) { touched = true; setP(pct + (k === inc ? 3 : -3)); e.preventDefault(); }
  });

  show(0);
  if (cfg.sweep === false || SC.reduce) return;

  /* 自动扫动：起点 → 一端 → 另一端 → 回到起点；用户一碰就停下并交出控制权 */
  await r.wait(600);
  if (touched) return;
  const s0 = pct, path = [s0, 6, 94, s0], seg = 1.1;     // 每段 1.1 秒
  await r.raf((dt, t) => {
    if (touched) return false;
    const i = Math.min(Math.floor(t / seg), path.length - 2), k = Math.min(t / seg - i, 1);
    setP(SC.lerp(path[i], path[i + 1], SC.ease.inOut(k)));
    return t < seg * (path.length - 1);
  });
});
