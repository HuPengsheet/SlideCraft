/* Claude Code 终端模拟引擎。要换对话，只改 conversation.js。 */
(() => {
const C = window.CHAT;
const $ = (s) => document.querySelector(s);
const log = $("#log"), txt = $("#txt"), spin = $("#spin");
const SPEEDS = [1, 2, 4];
const CANCEL = Symbol("cancel");
let si = 0, paused = false, epoch = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/* 所有停顿都走这里：支持倍速、暂停；重播后旧的流程会在这里被终止 */
async function wait(ms) {
  const e = epoch;
  await sleep(ms / SPEEDS[si]);
  while (paused) await sleep(80);
  if (e !== epoch) throw CANCEL;
}
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const el = (cls, h = "") => { const d = document.createElement("div"); d.className = cls; d.innerHTML = h; return d; };

/* 把 conversation.js 里的 script 文本解析成步骤列表 */
function parse(src) {
  const steps = [], lines = src.replace(/\r/g, "").split("\n");
  let para = [], tool = null;
  const flush = () => { if (para.length) steps.push({ t: "text", text: para.join("\n") }); para = []; };
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (ln.startsWith("~~~")) {
      flush();
      const code = { lang: ln.slice(3).trim() }, buf = [];
      while (++i < lines.length && !lines[i].startsWith("~~~")) buf.push(lines[i]);
      code.text = buf.join("\n");
      if (tool) tool.code = code; else steps.push({ t: "code", ...code });
    } else if (ln.startsWith("> ")) { flush(); tool = null; steps.push({ t: "user", text: ln.slice(2) }); }
    else if (ln.startsWith("! ")) {
      flush();
      const m = ln.slice(2).match(/^([^(]+?)\s*(?:\((.*)\))?$/) || [0, ln.slice(2), ""];
      tool = { t: "tool", name: m[1], args: m[2] || "", results: [], code: null };
      steps.push(tool);
    } else if (ln.startsWith("= ")) { if (tool) tool.results.push(ln.slice(2)); }
    else if (ln.startsWith("@wait ")) { flush(); tool = null; steps.push({ t: "wait", ms: +ln.slice(6) || 0 }); }
    else if (!ln.trim()) { flush(); tool = null; }
    else { tool = null; para.push(ln); }
  }
  flush();
  return steps;
}

/* 行内标记：**粗体**、[[行内代码]]、`行内代码` */
function html(s) {
  return esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\[\[([^\]]+)\]\]|`([^`]+)`/g, (m, a, b) => `<code>${a || b}</code>`);
}
/* 流式输出时按原文字符推进，再整体渲染，保证标记不会中途闪烁 */
function visibleCount(s) { return s.replace(/\*\*|\[\[|\]\]|`/g, "").length; }
function prefix(s, n) {
  let out = "", seen = 0, i = 0;
  while (i < s.length && seen < n) {
    const m = s.slice(i).match(/^(\*\*|\[\[|\]\]|`)/);
    if (m) { out += m[0]; i += m[0].length; continue; }
    out += s[i++]; seen++;
  }
  /* 补齐未闭合的标记，让半截文字也能正确渲染 */
  if ((out.match(/\*\*/g) || []).length % 2) out += "**";
  if ((out.match(/\[\[/g) || []).length > (out.match(/\]\]/g) || []).length) out += "]]";
  if ((out.match(/`/g) || []).length % 2) out += "`";
  return out;
}
async function typeInto(node, s, perChar = 14) {
  const n = visibleCount(s);
  for (let i = 1; i <= n; i++) { node.innerHTML = html(prefix(s, i)); await wait(perChar); }
  node.innerHTML = html(s);
}

const MASCOT = `<svg class="mascot" viewBox="0 0 24 14" aria-hidden="true"><g class="b">
  <rect x="3" y="0" width="18" height="9"/><rect x="0" y="3" width="3" height="3"/><rect x="21" y="3" width="3" height="3"/>
  <rect x="4" y="9" width="2" height="4"/><rect x="8" y="9" width="2" height="4"/><rect x="14" y="9" width="2" height="4"/><rect x="18" y="9" width="2" height="4"/></g>
  <g class="e"><rect x="7" y="3" width="2" height="3"/><rect x="15" y="3" width="2" height="3"/></g></svg>`;

function welcome() {
  const w = el("welcome");
  w.innerHTML = `<span class="wt">Claude Code v${esc(C.version)}</span>
    <div class="wl"><b>Welcome back!</b>${MASCOT}<div class="sub">${esc(C.model)}<br>${esc(C.cwd)}</div></div>
    <div class="wr"><h4>Tips for getting started</h4><div>${esc(C.tips)}</div><hr><h4>Recent activity</h4><div>${esc(C.recent)}</div></div>`;
  return w;
}

/* 转圈状态：“Cooking… (12s · ↓ 1.2k tokens)”，计时随倍速走 */
const GLYPHS = ["✻", "✽", "✶", "✳", "✢", "·"];
const VERBS = ["Thinking", "Pondering", "Cooking", "Brewing", "Mulling", "Churning"];
let timer = null, elapsed = 0, tokens = 0, verb = "", gi = 0;
const fmtTok = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n));
function spinStart() {
  spinStop(); elapsed = 0; tokens = 0; gi = 0;
  verb = VERBS[Math.floor(Math.random() * VERBS.length)];
  const draw = () => { spin.textContent = `${GLYPHS[gi++ % GLYPHS.length]} ${verb}… (${Math.floor(elapsed)}s · ↓ ${fmtTok(tokens)} tokens)`; };
  draw();
  timer = setInterval(() => { if (!paused) { elapsed += 0.12 * SPEEDS[si]; draw(); } }, 120);
}
function spinStop() { if (timer) clearInterval(timer); timer = null; spin.textContent = ""; }
function endTurn() {
  if (!timer) return;
  const s = Math.max(1, Math.round(elapsed));
  spinStop();
  log.append(el("done", `✻ Worked for ${s}s`));
}

/* 各类步骤的渲染 */
async function userStep(s) {
  for (const ch of s.text) { txt.textContent += ch; await wait(45); }
  await wait(400);
  txt.textContent = "";
  const u = el("user"); u.textContent = s.text; log.append(u);
}
async function textStep(s) {
  tokens += Math.round(visibleCount(s.text) / 2);
  const row = el("msg", '<span class="dot">●</span><div class="c"></div>');
  log.append(row);
  await typeInto(row.querySelector(".c"), s.text);
  await wait(250);
}
async function codeBlock(code, host) {
  const pre = document.createElement("pre"); pre.className = "code";
  host.append(pre);
  for (const l of code.text.split("\n")) {
    const d = document.createElement("span");
    d.className = "ln" + (code.lang === "diff" ? (l[0] === "+" ? " add" : l[0] === "-" ? " del" : "") : "");
    d.textContent = l || " "; pre.append(d);
    await wait(70);
  }
}
async function toolStep(s) {
  tokens += 40;
  const row = el("msg tool run", `<span class="dot">●</span><div class="c"><b>${esc(s.name)}</b>${s.args ? "(" + esc(s.args) + ")" : ""}</div>`);
  log.append(row);
  await wait(1000);
  row.classList.remove("run");
  let first = true;
  for (const r of s.results) {
    log.append(el("res" + (first ? "" : " cont"), `<span class="el">⎿</span><div>${html(r)}</div>`));
    first = false; await wait(180);
  }
  if (s.code) await codeBlock(s.code, log);
  await wait(300);
}

async function play() {
  const e = ++epoch;
  paused = false; syncPause(); spinStop();
  log.innerHTML = ""; txt.textContent = "";
  log.append(welcome(), el("notice", esc(C.notice)));
  try {
    await wait(900);
    for (const s of parse(C.script)) {
      if (s.t === "user") {
        endTurn();
        await userStep(s);
        spinStart();
        await wait(1400);
      } else if (s.t === "text") await textStep(s);
      else if (s.t === "tool") await toolStep(s);
      else if (s.t === "code") { await codeBlock(s, log); await wait(300); }
      else if (s.t === "wait") await wait(s.ms);
    }
    endTurn();
    if (C.loop) { await wait(4000); play(); }
  } catch (err) {
    if (err !== CANCEL) throw err;
  }
}

/* 控制：暂停、重播、倍速；空格暂停，R 重播 */
const bPause = $("#bPause"), bReplay = $("#bReplay"), bSpeed = $("#bSpeed");
function syncPause() { bPause.textContent = paused ? "继续" : "暂停"; }
const togglePause = () => { paused = !paused; syncPause(); };
bPause.onclick = () => { togglePause(); bPause.blur(); };
bReplay.onclick = () => { bReplay.blur(); play(); };
bSpeed.onclick = () => { si = (si + 1) % SPEEDS.length; bSpeed.textContent = SPEEDS[si] + "×"; bSpeed.blur(); };
addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); togglePause(); }
  else if (e.key === "r" || e.key === "R") play();
});
addEventListener("keyup", (e) => { if (e.code === "Space") e.preventDefault(); });

document.title = "Claude Code 模拟";
$("#wtitle").textContent = C.windowTitle;
$("#eff").textContent = `${C.effort} · /effort`;
play();
})();
