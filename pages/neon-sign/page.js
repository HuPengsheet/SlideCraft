/* 霓虹招牌通电：灯管文字逐段亮起，带外发光；某个字接触不良，反复闪烁。
 * 配置见 config.js。这里的 DEFAULTS 是没写 config 时的默认值。 */
const DEFAULTS = {
  theme: "dark",
  title: "霓虹招牌通电",
  lines: [{ text: "OPEN", color: 1 }],
  sub: "",
  flicker: null,         // { line, char }，从 0 开始；null 时取第一行最后一个字
  wall: "brick",
  stepMs: 140            // 每段灯管点亮的间隔，毫秒
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const COLORS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)"];

player.play(async (r) => {
  const w = (ms) => r.wait(SC.reduce ? 0 : ms);
  const lines = (cfg.lines || []).slice(0, 3);
  const chars = [];
  stage.innerHTML = `<div class="wall ${cfg.wall === "plain" ? "" : "brick"}"></div><div class="glow"></div>
    <div class="sign">${lines.map((ln) => {
      const color = COLORS[(Math.round(Number(ln.color) || 1) - 1 + 3) % 3];
      const html = [...String(ln.text || "")].map((c) => {
        const span = `<span class="ch" style="--c:${color}">${c === " " ? "&nbsp;" : SC.esc(c)}</span>`;
        return span;
      }).join("");
      return `<p class="ln">${html}</p>`;
    }).join("")}${cfg.sub ? `<p class="sub">${SC.esc(cfg.sub)}</p>` : ""}</div>`;
  SC.$$(".ln", stage).forEach((ln) => SC.$$(".ch", ln).forEach((ch) => chars.push(ch)));

  const f = cfg.flicker || { line: 0, char: Math.max(0, [...String(lines[0]?.text || "")].filter((c) => c !== " ").length - 1) };
  const bad = SC.$$(".ln", stage)[f.line] ? [...SC.$$(".ln", stage)[f.line].querySelectorAll(".ch")][f.char] : null;

  await w(400);
  SC.$(".glow", stage).classList.add("on");
  let next = 2.4;
  for (const ch of chars) {
    ch.classList.add("on");
    if (ch === bad && !SC.reduce) { ch.classList.remove("on"); ch.classList.add("bad"); await w(cfg.stepMs); ch.classList.remove("bad"); ch.classList.add("on"); }
    await w(cfg.stepMs);
  }
  if (cfg.sub) SC.$(".sub", stage).classList.add("on");

  /* 接触不良：每隔一两秒快速闪几下再稳住 */
  if (bad && !SC.reduce) {
    const flick = async () => {
      for (let i = 0; i < 3; i++) { bad.classList.toggle("bad"); bad.classList.toggle("on"); await w(60 + Math.random() * 120); }
      bad.classList.add("on"); bad.classList.remove("bad");
    };
    r.spawn(r.raf((dt, t) => { if (t > next) { next = t + 0.9 + Math.random() * 1.6; r.spawn(flick()); } }));
  }
});
