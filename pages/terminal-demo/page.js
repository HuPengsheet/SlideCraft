/* 终端演示：按脚本回放命令输入、输出、进度条。配置见 config.js。 */
const DEFAULTS = {
  theme: "terminal",
  title: "终端演示",
  windowTitle: "bash",
  prompt: "$ ",
  promptColor: "good",
  typeSpeed: 45,         // 每个字符毫秒
  lineDelay: 90,         // 输出行之间的间隔毫秒
  cursor: true,          // 结尾保留闪烁光标
  script: []             // 步骤数组，见 config.js
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const NAMED = { good: "--good", bad: "--bad", accent: "--accent", "accent-2": "--accent-2", "accent-3": "--accent-3", soft: "--fg-soft", fg: "--fg" };
const color = (c) => (c ? (NAMED[c] ? `var(${NAMED[c]})` : c) : "");
const span = (text, c, cls = "") => {
  const s = SC.el(cls, "", "span"); s.textContent = text ?? "";
  if (c) s.style.color = color(c);
  return s;
};

player.play(async (r) => {
  stage.innerHTML = `<div class="win"><div class="bar"><i></i><i></i><i></i><b></b></div><div class="body"></div></div>`;
  SC.$(".bar b", stage).textContent = cfg.windowTitle || "";
  const body = SC.$(".body", stage);
  const cursor = SC.el("cur", "", "span");
  const fast = SC.reduce;
  const newLine = () => { const l = SC.el("ln"); body.append(l); body.scrollTop = body.scrollHeight; return l; };
  const typeInto = async (el, text, per) => {
    if (fast || !per) { el.textContent = text; return; }
    for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await r.wait(per); }
  };

  await r.wait(400);
  for (const st of cfg.script || []) {
    if (!st) continue;
    switch (st.type) {
      case "cmd": {
        const l = newLine();
        l.append(span(cfg.prompt, cfg.promptColor, "ps"));
        const t = span("", ""); l.append(t, cursor);
        await r.wait(250);
        await typeInto(t, String(st.text ?? ""), cfg.typeSpeed);
        await r.wait(st.delay ?? 300);
        cursor.remove();
        break;
      }
      case "out": {
        const l = newLine();
        const segs = Array.isArray(st.segs) ? st.segs : [{ text: st.text, color: st.color }];
        for (const sg of segs) {
          const s = span("", sg.color ?? st.color); l.append(s);
          if (st.stream) { l.append(cursor); await typeInto(s, String(sg.text ?? ""), cfg.typeSpeed * 0.6); cursor.remove(); }
          else s.textContent = sg.text ?? "";
        }
        body.scrollTop = body.scrollHeight;
        await r.wait(st.stream ? 200 : cfg.lineDelay);
        break;
      }
      case "progress": {
        const l = newLine(), w = st.width || 30, ms = Math.max(1, st.ms || 1500);
        const draw = (p) => {
          const n = Math.round(w * p);
          l.textContent = `${st.label ? st.label + " " : ""}[${"█".repeat(n)}${"░".repeat(w - n)}] ${String(Math.round(p * 100)).padStart(3)}%` + (p >= 1 && st.doneText ? " " + st.doneText : "");
        };
        l.style.color = color(st.color || "accent-3");
        if (fast) draw(1);
        else { draw(0); await r.raf((dt, t) => { const p = Math.min(t * 1000 / ms, 1); draw(p); body.scrollTop = body.scrollHeight; return p < 1; }); }
        await r.wait(150);
        break;
      }
      case "wait": await r.wait(st.ms ?? 500); break;
      case "clear": body.innerHTML = ""; break;
      default: break; // 未知类型直接跳过
    }
  }
  if (cfg.cursor !== false) { const l = newLine(); l.append(span(cfg.prompt, cfg.promptColor, "ps"), cursor); }
});
