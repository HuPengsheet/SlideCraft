/* 浏览器 / 手机演示：画面序列 + 假光标移动与点击 + 淡入淡出切换。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "浏览器演示",
  device: "browser",     // "browser" | "phone"
  tabs: false,           // 是否显示全部标签页
  hold: 1200,            // 光标走完后的停留毫秒
  cursorSpeed: 800,      // 光标每段默认耗时毫秒
  screens: []            // { src, url, title, caption, cursor:[{x,y,click,ms,pause}] }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const ARROW = `<svg viewBox="0 0 24 24"><path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.6 L11.2 13.3 L18 13 Z"/></svg>`;
const host = (u) => String(u || "").replace(/^[a-z]+:\/\//i, "").split("/")[0];

player.play(async (r) => {
  const screens = (cfg.screens || []).filter((s) => s && s.src);
  const phone = cfg.device === "phone";
  stage.innerHTML = "";
  if (!screens.length) return;

  const dev = SC.el(`dev ${phone ? "phone" : "browser"}`);
  let chrome = null;
  if (phone) dev.append(SC.el("notch"));
  else {
    chrome = SC.el("", `<div class="tabs"><div class="dots"><i></i><i></i><i></i></div></div><div class="addr"><span></span></div>`);
    dev.append(...chrome.children);
  }
  const screen = SC.el("screen");
  dev.append(screen);
  const cap = SC.el("cap off");
  stage.append(dev, cap);

  const urlEl = SC.$(".addr span", dev), tabsEl = SC.$(".tabs", dev);
  const tabEls = [];
  if (tabsEl) {
    screens.forEach((s, i) => {
      if (!cfg.tabs && i) return;
      const t = SC.el("tab", "", "div"); t.textContent = s.title || host(s.url) || "新标签页";
      tabsEl.append(t); tabEls[i] = t;
    });
  }
  const layers = screens.map((s) => {
    const l = SC.el("scr"); l.append(SC.media(s.src, { alt: s.caption || "" })); screen.append(l); return l;
  });
  const cur = SC.el("cur", ARROW); cur.style.opacity = 0; screen.append(cur);

  let pos = { x: 50, y: 50 }, shown = false;
  const place = (x, y) => { pos = { x, y }; cur.style.left = x + "%"; cur.style.top = y + "%"; };
  const ripple = () => {
    const e = SC.el("rip"); e.style.left = pos.x + "%"; e.style.top = pos.y + "%"; screen.append(e);
    setTimeout(() => e.remove(), 1200 / player.speed);
  };
  const move = async (p) => {
    const x = SC.clamp(+p.x || 0, 0, 100), y = SC.clamp(+p.y || 0, 0, 100), from = pos;
    if (!shown) { place(x, y); cur.style.opacity = 1; shown = true; }
    else if (SC.reduce) place(x, y);
    else {
      const ms = p.ms ?? cfg.cursorSpeed;
      await r.raf((dt, t) => { const k = Math.min(t * 1000 / ms, 1), e = SC.ease.inOut(k); place(SC.lerp(from.x, x, e), SC.lerp(from.y, y, e)); return k < 1; });
    }
    await r.wait(p.pause ?? 250);
    if (p.click) { ripple(); await r.wait(450); }
  };

  await r.wait(300);
  for (let i = 0; i < screens.length; i++) {
    const s = screens[i];
    layers.forEach((l, j) => l.classList.toggle("on", j === i));
    tabEls.forEach((t, j) => t && t.classList.toggle("on", cfg.tabs ? j === i : true));
    if (!cfg.tabs && tabEls[0]) tabEls[0].textContent = s.title || host(s.url) || "新标签页";
    if (urlEl) urlEl.textContent = s.url || "";
    cap.textContent = s.caption || ""; cap.classList.toggle("off", !s.caption);
    await r.wait(800);
    for (const p of Array.isArray(s.cursor) ? s.cursor : []) await move(p || {});
    await r.wait(cfg.hold);
  }
  cur.style.opacity = 0;
});
