/* SlideCraft pages · core.js
 * 通用工具，挂在 window.SC 上。不依赖任何库，file:// 直接打开即可。 */
(() => {
const SC = (window.SC = window.SC || {});
SC.CANCEL = Symbol("cancel");               // 播放被重播中断时抛出，页面逻辑不需要处理
SC.params = new URLSearchParams(location.search);
SC.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* DOM */
SC.$ = (s, r = document) => r.querySelector(s);
SC.$$ = (s, r = document) => [...r.querySelectorAll(s)];
SC.esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
SC.el = (cls = "", html = "", tag = "div") => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
/* 行内标记：**粗体**、[[代码]]、`代码`。输入会先转义，可放心用于用户内容 */
SC.rich = (s) => SC.esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\[\[([^\]]+)\]\]|`([^`]+)`/g, (m, a, b) => `<code class="sc">${a || b}</code>`);

/* 数学 */
SC.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
SC.lerp = (a, b, t) => a + (b - a) * t;
SC.ease = { out: (t) => 1 - Math.pow(1 - t, 3), inOut: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), linear: (t) => t };
SC.pad = (n, w = 2) => String(n).padStart(w, "0");
SC.fmt = (n, { decimals = 0, sep = true } = {}) => {
  const s = Number(n).toFixed(decimals);
  if (!sep) return s;
  const [i, d] = s.split(".");
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (d ? "." + d : "");
};
/* 可复现的随机数（粒子等需要每次一样的场合） */
SC.rng = (seed = 1) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/* 配置合并：对象递归合并，数组整体替换 */
SC.merge = (a, b) => {
  if (Array.isArray(b) || typeof b !== "object" || b === null) return b === undefined ? a : b;
  const out = { ...(typeof a === "object" && a ? a : {}) };
  for (const k of Object.keys(b)) out[k] = SC.merge(out[k], b[k]);
  return out;
};

/* 媒体：.mp4/.webm/.mov 用 <video>（自动静音循环播放），其余用 <img>（png、jpg、webp、gif 均可） */
SC.isVideo = (src) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src || "");
SC.media = (src, { alt = "", cls = "" } = {}) => {
  if (SC.isVideo(src)) {
    const v = document.createElement("video");
    Object.assign(v, { src, muted: true, loop: true, autoplay: true, playsInline: true });
    v.className = cls; return v;
  }
  const i = document.createElement("img");
  i.src = src; i.alt = alt; i.className = cls; i.draggable = false; return i;
};

/* 需要播放上下文 r 的工具（r 是 player.play 回调收到的参数，支持暂停、倍速、重播中断） */
SC.countUp = (r, el, to, { from = 0, dur = 1600, decimals = 0, sep = true, prefix = "", suffix = "" } = {}) => {
  const set = (v) => { el.textContent = prefix + SC.fmt(v, { decimals, sep }) + suffix; };
  if (SC.reduce) { set(to); return Promise.resolve(); }
  set(from);
  return r.spawn(r.raf((dt, t) => { const p = Math.min(t * 1000 / dur, 1); set(SC.lerp(from, to, SC.ease.out(p))); return p < 1; }));
};
SC.type = async (r, el, text, per = 30) => {
  for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await r.wait(per); }
};
})();
