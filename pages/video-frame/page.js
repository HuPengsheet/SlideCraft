/* 设备相框视频：笔记本/手机/电视外框 + 3D 倾斜浮动 + 标注线。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  device: "laptop",
  src: "",
  images: [],
  holdMs: 2600,
  tilt: { x: 5, y: -12 },
  float: true,
  callouts: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const media = (src) => {
  const m = SC.media(src);
  m.addEventListener("error", () => { m.style.visibility = "hidden"; });
  return m;
};

player.play(async (r) => {
  stage.innerHTML = "";
  const device = ["laptop", "phone", "tv"].includes(cfg.device) ? cfg.device : "laptop";
  const slides = (cfg.src ? [cfg.src] : Array.isArray(cfg.images) ? cfg.images : []).filter((s) => typeof s === "string" && s);
  const callouts = (Array.isArray(cfg.callouts) ? cfg.callouts : []).filter((c) => c && typeof c === "object");
  const tilt = { x: +(cfg.tilt && cfg.tilt.x) || 0, y: +(cfg.tilt && cfg.tilt.y) || 0 };

  const head = SC.el("head");
  if (cfg.title) head.append(SC.el("", "", "h1"));
  if (cfg.subtitle) head.append(SC.el("", "", "p"));
  if (cfg.title) head.firstChild.textContent = cfg.title;
  if (cfg.subtitle) head.lastChild.textContent = cfg.subtitle;

  const scene = SC.el(`scene ${device}${cfg.float === false ? " nofloat" : ""}`);
  const flt = SC.el("float"), rig = SC.el("rig"), dev = SC.el("dev");
  const bezel = SC.el("bezel"), wrap = SC.el("screenwrap"), screen = SC.el("screen");
  const setTilt = (dx = 0, dy = 0) => { rig.style.setProperty("--ry", tilt.y + dy); rig.style.setProperty("--rx", tilt.x + dx); };
  setTilt();

  const layers = slides.map((s) => { const l = SC.el("lay"); l.append(media(s)); screen.append(l); return l; });
  if (!layers.length) screen.append(SC.el("ph", "<i></i><i></i><i></i><i></i>"));
  wrap.append(screen);
  const cos = callouts.map((c) => {
    const x = SC.clamp(+c.x || 0, 0, 100), y = SC.clamp(+c.y || 0, 0, 100);
    const e = SC.el(`co ${x < 50 ? "l" : "r"}`, `<div class="ln"></div><div class="dot"></div><div class="lb"></div>`);
    e.style.setProperty("--x", x); e.style.setProperty("--y", y);
    SC.$(".lb", e).innerHTML = SC.rich(c.label || "");
    e.dataset.slide = Number.isInteger(c.slide) ? c.slide : "";
    wrap.append(e); return e;
  });
  bezel.append(wrap);
  if (device === "phone") bezel.append(SC.el("notch"));
  else bezel.append(SC.el("cam"));
  dev.append(bezel);
  if (device === "laptop") dev.append(SC.el("base"));
  else if (device === "tv") dev.append(SC.el("stand"), SC.el("foot"));
  rig.append(dev); flt.append(rig); scene.append(flt);
  stage.append(head, scene);

  /* 鼠标移动时外框跟着轻微转动；每次重播会先清空 stage，所以旧监听随节点消失 */
  stage.onpointermove = (e) => {
    const b = stage.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width - .5, py = (e.clientY - b.top) / b.height - .5;
    setTilt(-py * 6, px * 8);
  };
  stage.onpointerleave = () => setTilt();

  const showSlide = (i) => layers.forEach((l, j) => l.classList.toggle("on", j === i));
  const showCallouts = async (i) => {
    const match = cos.filter((e) => e.dataset.slide === "" || +e.dataset.slide === i);
    cos.forEach((e) => { if (!match.includes(e)) e.classList.remove("in"); });
    for (const e of match) {
      e.classList.add("in");
      if (!SC.reduce) await r.wait(380);
    }
  };

  showSlide(0);
  if (SC.reduce) {
    head.classList.add("in"); scene.classList.add("in");
    showSlide(Math.max(0, layers.length - 1));
    await showCallouts(Math.max(0, layers.length - 1));
    return;
  }
  await r.wait(150);
  head.classList.add("in"); scene.classList.add("in");
  await r.wait(1000);
  const n = Math.max(1, layers.length);
  for (let i = 0; i < n; i++) {
    showSlide(i);
    await r.wait(500);
    await showCallouts(i);
    if (i < n - 1) await r.wait(cfg.holdMs);
  }
});
