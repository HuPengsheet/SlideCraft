/* 手机长图滚动：真实 scrollTop 匀速滚动，在停留点出现批注气泡。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  image: "",
  speed: 0.45,
  stops: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const MOCK = `<div class="m">
  <div class="bar"><span class="logo">Nova</span><span class="av"></span></div>
  <h2>把想法变成<br>可演示的页面</h2><p>几分钟完成设计、预览与分享，无需任何额外工具。</p><span class="btn">立即开始</span>
  <div class="hero"></div>
  <div class="sec">核心能力</div>
  <div class="grid">
    <div class="tile"><i></i><b>模板</b><span>上百套可选</span></div>
    <div class="tile"><i></i><b>协作</b><span>多人同时编辑</span></div>
    <div class="tile"><i></i><b>动效</b><span>一键加入过渡</span></div>
    <div class="tile"><i></i><b>导出</b><span>PDF 或网页</span></div>
  </div>
  <div class="sec">本周数据</div>
  <div class="chart"><i style="height:35%"></i><i style="height:55%"></i><i style="height:42%"></i><i style="height:78%"></i><i style="height:64%"></i><i style="height:92%"></i><i style="height:70%"></i></div>
  <div class="sec">最近动态</div>
  <div class="row"><span class="th"></span><div><b>季度汇报已更新</b><span>10 分钟前</span></div></div>
  <div class="row"><span class="th"></span><div><b>新成员加入项目</b><span>1 小时前</span></div></div>
  <div class="row"><span class="th"></span><div><b>导出任务已完成</b><span>昨天</span></div></div>
  <div class="row"><span class="th"></span><div><b>模板库新增 12 套</b><span>周一</span></div></div>
  <div class="sec">方案</div>
  <div class="price"><span>个人版</span><strong>免费</strong></div>
  <div class="price"><span>团队版</span><strong>29 / 月</strong></div>
  <div class="foot">已是最新内容</div>
</div>`;

player.play(async (r) => {
  stage.innerHTML = "";
  const rig = SC.el("rig"), phone = SC.el("phone"), vp = SC.el("vp"), long = SC.el("long");
  const sb = SC.el("sb");
  const useImg = typeof cfg.image === "string" && cfg.image;
  let img = null;
  if (useImg) {
    img = SC.media(cfg.image);
    long.append(img);
  } else long.innerHTML = MOCK;
  vp.append(long, sb);
  phone.append(vp, SC.el("notch"));
  rig.append(phone);
  stage.append(rig);

  /* 等图片载入才能知道总高度；失败或超时就换成内置长页面 */
  if (img && img.tagName === "IMG" && !img.complete) {
    await Promise.race([
      new Promise((res) => { img.onload = res; img.onerror = res; }),
      r.wait(4000)
    ]);
  }
  if (img && ((img.tagName === "IMG" && !img.naturalHeight) || (img.tagName === "VIDEO" && img.error))) {
    long.innerHTML = MOCK;
  }

  const maxScroll = () => Math.max(0, vp.scrollHeight - vp.clientHeight);
  const syncBar = () => {
    const m = maxScroll(), room = vp.clientHeight - sb.offsetHeight - 120;
    sb.style.setProperty("--sy", (m ? (vp.scrollTop / m) * Math.max(room, 0) : 0) + "px");
  };
  vp.addEventListener("scroll", syncBar);

  const stops = (Array.isArray(cfg.stops) ? cfg.stops : [])
    .filter((s) => s && typeof s === "object")
    .map((s) => ({ y: SC.clamp(+s.y || 0, 0, 100), label: String(s.label || ""), hold: Math.max(0, +s.hold || 2200) }))
    .sort((a, b) => a.y - b.y);
  const notes = stops.map((s, i) => {
    const e = SC.el(`note ${i % 2 ? "l" : "r"}`, `<div class="no"></div><div class="tx"></div>`);
    SC.$(".no", e).textContent = String(i + 1).padStart(2, "0");
    SC.$(".tx", e).innerHTML = SC.rich(s.label.length > 60 ? s.label.slice(0, 59) + "…" : s.label);
    e.style.setProperty("--ty", (30 + ((i * 23) % 40)) + "%");
    rig.append(e); return e;
  });

  const target = (s) => maxScroll() * s.y / 100;
  if (SC.reduce) {
    rig.classList.add("in");
    vp.scrollTop = stops.length ? target(stops[stops.length - 1]) : maxScroll();
    if (notes.length) notes[notes.length - 1].classList.add("on");
    syncBar();
    return;
  }

  await r.wait(100);
  rig.classList.add("in");
  await r.wait(900);

  const scrollTo = (to) => {
    const from = vp.scrollTop, dist = Math.abs(to - from);
    if (dist < 1) return Promise.resolve();
    const dur = dist / (Math.max(0.05, +cfg.speed || 0.45) * vp.clientHeight);   /* 秒 */
    return r.raf((dt, t) => {
      const k = Math.min(t / dur, 1);
      /* 匀速为主，只在两端轻微缓入缓出 */
      const e = SC.lerp(k, SC.ease.inOut(k), 0.35);
      vp.scrollTop = SC.lerp(from, to, e);
      return k < 1;
    });
  };

  if (!stops.length) { await scrollTo(maxScroll()); return; }
  for (let i = 0; i < stops.length; i++) {
    await scrollTo(target(stops[i]));
    notes[i].classList.add("on");
    await r.wait(stops[i].hold);
    if (i < stops.length - 1) notes[i].classList.remove("on");
  }
});
