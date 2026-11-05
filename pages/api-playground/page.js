/* 接口调试：请求逐项填好，自动点击发送，响应逐行展开，状态码与耗时滚动。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "",
  subtitle: "",
  sendLabel: "发送",
  latencyMs: 120,
  request: { method: "GET", url: "", headers: {} },
  response: { status: 200, statusText: "" }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

const TEXTS = { 200: "OK", 201: "Created", 202: "Accepted", 204: "No Content", 301: "Moved Permanently", 302: "Found", 304: "Not Modified", 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 409: "Conflict", 422: "Unprocessable Entity", 429: "Too Many Requests", 500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable" };
const MAX_LINES = 120;

/* 对象或字符串 -> { text, json }。非 JSON 的字符串原样保留 */
function toText(v) {
  if (v == null || v === "") return { text: "", json: false };
  if (typeof v === "string") {
    try { const o = JSON.parse(v); if (o && typeof o === "object") return { text: JSON.stringify(o, null, 2), json: true }; } catch (e) { /* 不是 JSON */ }
    return { text: v, json: false };
  }
  try { const t = JSON.stringify(v, null, 2); if (t !== undefined) return { text: t, json: true }; } catch (e) { /* 循环引用等 */ }
  return { text: String(v), json: false };
}

/* 单行 JSON 高亮，输入先转义 */
function hlLine(line, json) {
  if (!json) return SC.esc(line);
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}\[\],]/g;
  let out = "", last = 0, m;
  while ((m = re.exec(line))) {
    out += SC.esc(line.slice(last, m.index));
    const t = m[0];
    if (m[1] !== undefined) out += m[2] ? `<span class="j-k">${SC.esc(m[1])}</span>${SC.esc(m[2])}` : `<span class="j-s">${SC.esc(t)}</span>`;
    else if (m[3]) out += `<span class="j-b">${t}</span>`;
    else if (/^[{}\[\],]$/.test(t)) out += `<span class="j-p">${t}</span>`;
    else out += `<span class="j-n">${t}</span>`;
    last = m.index + t.length;
  }
  return out + SC.esc(line.slice(last));
}

function codeBlock(v) {
  const { text, json } = toText(v);
  let lines = text === "" ? [] : text.split("\n");
  if (lines.length > MAX_LINES) lines = lines.slice(0, MAX_LINES).concat(["…"]);
  const box = SC.el("code sc-scroll");
  box.innerHTML = lines.map((l) => `<div class="cl"><span>${hlLine(l, json)}</span></div>`).join("");
  return { box, lines: SC.$$(".cl", box), bytes: new TextEncoder().encode(text).length };
}

const objEntries = (o) => (o && typeof o === "object" && !Array.isArray(o) ? Object.entries(o) : []);
const bytesLabel = (n) => (n < 1024 ? n + " B" : (n / 1024).toFixed(1) + " KB");

player.play(async (r) => {
  const req = cfg.request && typeof cfg.request === "object" ? cfg.request : {};
  const res = cfg.response && typeof cfg.response === "object" ? cfg.response : {};
  const method = String(req.method || "GET").toUpperCase();
  const url = String(req.url ?? "");
  const status = Number.isFinite(+res.status) && +res.status > 0 ? Math.round(+res.status) : 200;
  const sText = res.statusText != null && res.statusText !== "" ? String(res.statusText) : TEXTS[status] || "";
  const latency = Number.isFinite(+cfg.latencyMs) ? Math.max(0, Math.round(+cfg.latencyMs)) : 120;
  const w = (ms) => (SC.reduce ? Promise.resolve() : r.wait(ms));
  const live = () => r.live;

  stage.innerHTML = "";
  const head = SC.el("head", `${cfg.title ? `<h1 class="sc-title">${SC.esc(cfg.title)}</h1>` : ""}${cfg.subtitle ? `<p class="sc-sub">${SC.esc(cfg.subtitle)}</p>` : ""}`);
  if (!head.firstChild) head.style.display = "none";
  const panes = SC.el("panes");
  stage.append(head, panes);

  /* 请求 */
  const reqBody = codeBlock(req.body);
  const hdrs = objEntries(req.headers).slice(0, 12);
  const reqPane = SC.el("pane req", `<div class="ph">请求 · REQUEST</div>
    <div class="urlbar"><span class="method m-${SC.esc(method.toLowerCase().replace(/[^a-z]/g, ""))}">${SC.esc(method)}</span><div class="url"></div><button class="send">${SC.esc(cfg.sendLabel || "发送")}</button></div>
    ${hdrs.length ? `<div class="sec">HEADERS</div><div class="hdrs sc-scroll">${hdrs.map(([k, v]) => `<div class="hr"><b>${SC.esc(k)}:</b><span>${SC.esc(v)}</span></div>`).join("")}</div>` : ""}
    ${reqBody.lines.length ? `<div class="sec">BODY</div>` : ""}`);
  if (reqBody.lines.length) reqPane.append(reqBody.box); else reqPane.append(SC.el("code", "")); 
  const urlEl = SC.$(".url", reqPane), sendBtn = SC.$(".send", reqPane);

  /* 响应 */
  const resBody = codeBlock(res.body);
  const sCls = status < 300 ? "" : status < 400 ? "c3" : "c4";
  const resPane = SC.el("pane res idle", `<div class="ph">响应 · RESPONSE</div>
    <div class="stat"><div><div class="lbl">状态码</div><div class="big ${sCls}" data-k="status">0</div></div>
      <div class="st">${SC.esc(sText)}</div>
      <div><div class="lbl">耗时</div><div class="mid" data-k="latency">0<small>ms</small></div></div>
      <div><div class="lbl">大小</div><div class="mid" data-k="size">—</div></div></div>
    <div class="wait"><div class="bar"></div><div>等待响应…</div></div>
    ${resBody.lines.length ? `<div class="sec">BODY</div>` : ""}`);
  resPane.append(resBody.lines.length ? resBody.box : SC.el("code", ""));
  panes.append(reqPane, resPane);
  const statEl = SC.$(".stat", resPane), bigEl = SC.$('[data-k="status"]', resPane);
  const latEl = SC.$('[data-k="latency"]', resPane), sizeEl = SC.$('[data-k="size"]', resPane);
  const setLat = (v) => { latEl.firstChild.textContent = SC.fmt(v); };
  let busy = true;

  /* 响应阶段，可重复演示 */
  const respond = async () => {
    busy = true; sendBtn.disabled = true;
    resBody.lines.forEach((l) => l.classList.remove("on"));
    statEl.classList.remove("on"); bigEl.textContent = "0"; setLat(0); sizeEl.textContent = "—";
    resPane.classList.remove("idle"); resPane.classList.add("pending");
    await w(SC.clamp(latency, 350, 1400));
    if (!live()) return;
    resPane.classList.remove("pending");
    statEl.classList.add("on");
    sizeEl.textContent = bytesLabel(resBody.bytes);
    const jobs = [SC.countUp(r, bigEl, status, { dur: 800, sep: false }), SC.countUp(r, latEl.firstChild, latency, { dur: 1000 })];
    /* countUp 写 textContent；耗时单位在 small 里，所以对文本节点操作 */
    const lines = resBody.lines;
    await w(500);
    for (const l of lines) { l.classList.add("on"); resBody.box.scrollTop = resBody.box.scrollHeight; await w(Math.min(110, 1800 / Math.max(lines.length, 1))); }
    await Promise.all(jobs);
    if (!live()) return;
    bigEl.textContent = String(status); setLat(latency);
    busy = false; sendBtn.disabled = false;
  };
  sendBtn.addEventListener("click", () => { if (!busy) { sendBtn.blur(); r.spawn(respond()); } });

  /* 入场与请求填写 */
  if (SC.reduce) {
    head.classList.add("on"); reqPane.classList.add("on"); resPane.classList.add("on");
    urlEl.textContent = url;
    SC.$$(".hr", reqPane).forEach((e) => e.classList.add("on"));
    reqBody.lines.forEach((l) => l.classList.add("on"));
    resPane.classList.remove("idle");
    resBody.lines.forEach((l) => l.classList.add("on"));
    statEl.classList.add("on"); bigEl.textContent = String(status); setLat(latency); sizeEl.textContent = bytesLabel(resBody.bytes);
    busy = false; return;
  }
  await r.wait(250); head.classList.add("on");
  await r.wait(350); reqPane.classList.add("on");
  await r.wait(250); resPane.classList.add("on");
  await r.wait(500);
  urlEl.classList.add("typing");
  await SC.type(r, urlEl, url, Math.max(8, Math.min(30, 1400 / Math.max(url.length, 1))));
  urlEl.classList.remove("typing");
  for (const h of SC.$$(".hr", reqPane)) { h.classList.add("on"); await r.wait(160); }
  for (const l of reqBody.lines) { l.classList.add("on"); reqBody.box.scrollTop = reqBody.box.scrollHeight; await r.wait(Math.min(90, 1500 / reqBody.lines.length)); }
  await r.wait(500);
  sendBtn.classList.add("hot"); await r.wait(450);
  sendBtn.classList.add("press"); await r.wait(160);
  sendBtn.classList.remove("press"); await r.wait(200);
  sendBtn.classList.remove("hot");
  await respond();
});
