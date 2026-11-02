/* 步骤导览：截图上逐步聚光，旁边显示编号说明。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "步骤导览",
  image: "",             // 截图；也可用 media
  media: "",
  stepMs: 3600,          // 每步停留，毫秒
  steps: []              // { x, y, w, h, title, text, side }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const tour = { ready: false, go: null, cur: 0 };

function autoSide(s) {
  if (s.x + s.w + 32 <= 100) return "right";
  if (s.x >= 32) return "left";
  return s.y + s.h < 58 ? "bottom" : "top";
}

/* 播放结束后：方向键与圆点跳转。监听只注册一次 */
addEventListener("keydown", (e) => {
  if (!tour.ready || !tour.go) return;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") tour.go(tour.cur + 1);
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") tour.go(tour.cur - 1);
});

player.play(async (r) => {
  tour.ready = false; tour.go = null;
  stage.innerHTML = "";
  const steps = cfg.steps || [];
  const src = cfg.image || cfg.media;
  if (src) stage.append(SC.media(src, { cls: "shot" }));
  const spot = SC.el("spot");
  const nav = SC.el("nav");
  const dots = steps.map((_, i) => {
    const b = SC.el("", "", "button"); b.setAttribute("aria-label", "第 " + (i + 1) + " 步");
    b.onclick = () => tour.ready && tour.go && tour.go(i);
    nav.append(b); return b;
  });
  const counter = SC.el("", "", "span"); nav.append(counter);
  stage.append(spot, nav);
  if (!steps.length) return;

  let call = null;
  const show = (i) => {
    const s = steps[i], side = s.side || autoSide(s);
    tour.cur = i;
    Object.assign(spot.style, { left: s.x + "%", top: s.y + "%", width: s.w + "%", height: s.h + "%" });
    spot.classList.add("on");
    if (call) call.remove();
    call = SC.el("call sc-card", `<div class="num">${i + 1}</div><h2>${SC.esc(s.title || "")}</h2>${s.text ? `<p>${SC.rich(s.text)}</p>` : ""}`);
    const cx = SC.clamp(s.x + s.w / 2, 18, 82), cy = SC.clamp(s.y + s.h / 2, 18, 78), g = 1.8;
    const pos = {
      right: [s.x + s.w + g, cy, "0,-50%"], left: [s.x - g, cy, "-100%,-50%"],
      bottom: [cx, s.y + s.h + g * 1.6, "-50%,0"], top: [cx, s.y - g * 1.6, "-50%,-100%"]
    }[side] || [s.x + s.w + g, cy, "0,-50%"];
    Object.assign(call.style, { left: pos[0] + "%", top: pos[1] + "%", transform: `translate(${pos[2]})` });
    stage.append(call);
    dots.forEach((d, k) => { d.classList.toggle("on", k === i); d.classList.toggle("past", k < i); });
    counter.textContent = (i + 1) + " / " + steps.length;
  };

  await r.wait(SC.reduce ? 0 : 500);
  for (let i = 0; i < steps.length; i++) {
    show(i);
    await r.wait(cfg.stepMs);
  }
  /* 播完：开放手动浏览 */
  tour.go = (i) => { if (r.live) show(SC.clamp(i, 0, steps.length - 1)); };
  tour.ready = true;
  nav.classList.add("ready");
});
