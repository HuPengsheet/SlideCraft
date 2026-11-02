/* 代码演示：窗口里依次展示代码的几个状态，用行差异过渡。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "代码演示",
  file: "",
  windowTitle: "",
  lang: "",              // 默认语言，空则按 file 扩展名推断
  lineNumbers: true,
  holdMs: 2400,          // 每步停留毫秒
  steps: []              // { code, lang, caption, focus: [from, to], type }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

/* ---------- 极简语法高亮：按语言的有序规则逐位置匹配，没命中的字符按纯文本 ---------- */
const words = (s) => new Set(s.split(" "));
const JS_KW = words("const let var function return if else for while do switch case break continue new this class extends super import export default async await try catch finally throw typeof instanceof in delete void yield static null undefined true false interface type enum implements public private protected readonly");
const PY_KW = words("def class return if elif else for while in not and or is import from as with try except finally raise pass break continue lambda yield None True False global nonlocal async await del assert");
const SH_KW = words("if then else elif fi for while do done case esac in function return export local set unset source alias");
const ALIAS = { js: "js", javascript: "js", ts: "js", typescript: "js", jsx: "js", tsx: "js", mjs: "js", py: "python", python: "python", json: "json", sh: "bash", bash: "bash", shell: "bash", zsh: "bash", css: "css", html: "html", htm: "html", xml: "html", svg: "html" };
const LABEL = { js: "js", python: "python", json: "json", bash: "bash", css: "css", html: "html", text: "text" };
const nextCls = (id, kw, nx, cap = "type") => (kw.has(id) ? "kw" : nx === "(" ? "fn" : /^[A-Z]/.test(id) ? cap : "");

/* 规则 [sticky 正则, 类名 或 (匹配, 后一个非空白字符, 全文, 起点) => 类名]。每次高亮新建一份，状态放闭包里 */
const LANGS = {
  js: () => [
    [/\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y, "com"],
    [/"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\[\s\S]|[^`\\])*`?/y, "str"],
    [/0x[\da-f]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?/iy, "num"],
    [/[A-Za-z_$][\w$]*/y, (m, nx) => nextCls(m, JS_KW, nx)]
  ],
  python: () => [
    [/#[^\n]*/y, "com"],
    [/(?:[fFrRbB]{1,2})?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)/y, "str"],
    [/@[\w.]+/y, "fn"],
    [/\d+(?:\.\d+)?(?:e[+-]?\d+)?/iy, "num"],
    [/[A-Za-z_]\w*/y, (m, nx) => nextCls(m, PY_KW, nx)]
  ],
  json: () => [
    [/"(?:\\.|[^"\\\n])*"?/y, (m, nx) => (nx === ":" ? "prop" : "str")],
    [/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/iy, "num"],
    [/true|false|null/y, "kw"]
  ],
  bash: () => [
    [/(?<!\S)#[^\n]*/y, "com"],
    [/"(?:\\[\s\S]|[^"\\])*"?|'[^']*'?/y, "str"],
    [/\$\{[^}]*\}?|\$[A-Za-z_]\w*|\$[?#@*!$0-9]/y, "num"],
    [/(?<!\S)--?[A-Za-z][\w-]*/y, "prop"],
    [/\d+(?:\.\d+)?/y, "num"],
    [/[A-Za-z_][\w.\/-]*/y, (m, nx, src, at) => {
      if (SH_KW.has(m)) return "kw";
      const before = src.slice(0, at), cut = Math.max(before.lastIndexOf("\n"), before.lastIndexOf("|"), before.lastIndexOf(";"), before.lastIndexOf("&"));
      return /^\s*$/.test(before.slice(cut + 1)) ? "fn" : "";
    }]
  ],
  css: () => {
    const depth = (src, at) => { let d = 0; for (let i = 0; i < at; i++) d += src[i] === "{" ? 1 : src[i] === "}" ? -1 : 0; return d; };
    return [
      [/\/\*[\s\S]*?(?:\*\/|$)/y, "com"],
      [/"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/y, "str"],
      [/@[\w-]+/y, "kw"],
      [/#[\da-f]{3,8}\b/iy, (m, nx, src, at) => (depth(src, at) > 0 ? "num" : "type")],
      [/-?(?:\d+\.?\d*|\.\d+)(?:%|[a-z]+)?/iy, "num"],
      [/-{0,2}[A-Za-z_][\w-]*/y, (m, nx, src, at) => (depth(src, at) === 0 ? "type" : nx === ":" ? "prop" : "")]
    ];
  },
  html: () => {
    let inTag = false;
    return [
      [/<!--[\s\S]*?(?:-->|$)|<![A-Za-z][^>]*>?/y, "com"],
      [/<\/?[A-Za-z][\w:-]*/y, () => { inTag = true; return "kw"; }],
      [/\/?>/y, () => { inTag = false; return ""; }],
      [/"[^"]*"?|'[^']*'?/y, () => (inTag ? "str" : "")],
      [/[A-Za-z_:@][\w:.-]*/y, () => (inTag ? "prop" : "")]
    ];
  }
};
function langOf(name) { return ALIAS[String(name || "").toLowerCase().replace(/^\./, "")] || ""; }

/* 返回按行拆开的 HTML 数组，行数与 src.split("\n") 一致 */
function highlight(src, lang) {
  const rules = LANGS[lang] ? LANGS[lang]() : [];
  const toks = []; let buf = "", i = 0;
  const flush = () => { if (buf) toks.push([buf, ""]); buf = ""; };
  while (i < src.length) {
    let hit = null;
    for (const [re, cls] of rules) {
      re.lastIndex = i;
      const m = re.exec(src);
      if (m && m[0]) { hit = [m[0], cls]; break; }
    }
    if (!hit) { buf += src[i++]; continue; }
    flush();
    const text = hit[0];
    const end = i + text.length;
    let cls = hit[1];
    if (typeof cls === "function") { const nx = (/\S/.exec(src.slice(end)) || [""])[0]; cls = cls(text, nx, src, i); }
    toks.push([text, cls]); i = end;
  }
  flush();
  const lines = [""];
  for (const [text, cls] of toks) {
    text.split("\n").forEach((part, k) => {
      if (k > 0) lines.push("");
      if (part) lines[lines.length - 1] += cls ? `<span class="tk-${cls}">${SC.esc(part)}</span>` : SC.esc(part);
    });
  }
  return lines;
}

/* 行级 LCS 差异：返回 [{op:"keep"|"add"|"del", a, b}]，a、b 为旧、新行下标 */
function diffLines(A, B) {
  const n = A.length, m = B.length;
  const t = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) t[i][j] = A[i] === B[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
  const ops = []; let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && A[i] === B[j]) { ops.push({ op: "keep", a: i++, b: j++ }); }
    else if (j < m && (i >= n || t[i][j + 1] >= t[i + 1][j])) ops.push({ op: "add", b: j++ });
    else ops.push({ op: "del", a: i++ });
  }
  return ops;
}

/* ---------- 步骤整理 ---------- */
const baseLang = langOf(cfg.lang) || langOf((String(cfg.file || cfg.windowTitle || "").split(".").pop())) || "js";
const steps = (Array.isArray(cfg.steps) ? cfg.steps : []).map((s) => (typeof s === "string" ? { code: s } : s || {})).map((s) => {
  const code = String(s.code ?? "").replace(/\r\n?/g, "\n").replace(/\n+$/, "");
  const lang = s.lang ? langOf(s.lang) || "text" : baseLang;
  const f = Array.isArray(s.focus) && s.focus.length >= 2 && Number.isFinite(+s.focus[0]) && Number.isFinite(+s.focus[1]) ? [Math.min(+s.focus[0], +s.focus[1]), Math.max(+s.focus[0], +s.focus[1])] : null;
  return { code, lang, caption: s.caption || "", focus: f, type: s.type, lines: code.split("\n"), html: highlight(code, lang) };
});
const maxLines = Math.max(1, ...steps.map((s) => s.lines.length));
player.play(async (r) => {
  const title = cfg.file || cfg.windowTitle || "";
  stage.innerHTML = `<div class="win ${cfg.lineNumbers === false ? "nonum" : ""}"><div class="bar"><i></i><i></i><i></i><span class="ttl"></span><span class="lang"></span></div><div class="body"><div class="code"></div></div></div>
    <div class="cap"><span class="num"></span><span class="txt"></span><div class="dots"></div></div>`;
  SC.$(".ttl", stage).textContent = title;
  const body = SC.$(".body", stage), code = SC.$(".code", stage), langEl = SC.$(".lang", stage);
  const numEl = SC.$(".num", stage), txt = SC.$(".txt", stage), dotsEl = SC.$(".dots", stage);
  code.style.setProperty("--n", maxLines);
  if (!steps.length) { txt.textContent = "（没有可演示的步骤）"; return; }
  const dots = steps.map((_, i) => { const b = SC.el("", "", "button"); b.setAttribute("aria-label", "步骤 " + (i + 1)); dotsEl.append(b); return b; });
  const cursor = SC.el("cur", "", "span");
  let els = [], texts = [], idx = -1, busy = true;

  const mkLine = (cls = "") => SC.el("ln " + cls, "", "div");
  const setHtml = (el, h) => { if (el._h !== h) { el._h = h; el.innerHTML = h; } };
  /* 直接把内容画成给定的行（不做动画），复用已有元素 */
  const render = (lines, htmls) => {
    while (els.length > lines.length) els.pop().remove();
    while (els.length < lines.length) { const l = mkLine(); code.append(l); els.push(l); }
    els.forEach((l, i) => setHtml(l, htmls[i]));
    texts = lines.slice();
  };
  const clearAll = () => { code.innerHTML = ""; els = []; texts = []; };
  const label = (s) => { langEl.textContent = LABEL[s.lang] || "text"; };

  const focusOn = (s) => {
    els.forEach((l, i) => {
      const inF = !s.focus || (i + 1 >= s.focus[0] && i + 1 <= s.focus[1]);
      l.classList.toggle("dim", !inF);
      l.classList.toggle("fo", !!s.focus && inF);
    });
    if (body.scrollHeight <= body.clientHeight + 1) return;
    const t = s.focus ? els[Math.max(0, Math.min(els.length - 1, s.focus[0] - 1))] : null;
    body.scrollTo({ top: t ? Math.max(0, t.offsetTop - body.clientHeight / 3) : 0, behavior: SC.reduce ? "auto" : "smooth" });
  };

  /* 与上一状态做行差异：新增滑入并闪绿，删除闪红后收起，不变的原地不动 */
  const morph = async (s) => {
    const ops = diffLines(texts, s.lines);
    const next = [], gone = [];
    let prev = null;
    for (const o of ops) {
      if (o.op === "add") {
        const l = mkLine("add"); setHtml(l, s.html[o.b]);
        code.insertBefore(l, prev ? prev.nextSibling : code.firstChild);
        prev = l; next.push(l);
      } else {
        const l = els[o.a]; prev = l;
        if (o.op === "keep") { setHtml(l, s.html[o.b]); next.push(l); }
        else { l.classList.add("rm"); gone.push(l); }
      }
    }
    els = next; texts = s.lines.slice();
    focusOn(s);
    await r.wait(gone.length ? 750 : 500);
    gone.forEach((l) => l.remove());
    els.forEach((l) => l.classList.remove("add"));
  };

  /* 从空白逐字敲出，空白字符不占时间 */
  const typeIn = async (s) => {
    clearAll();
    if (SC.reduce) { render(s.lines, s.html); return; }
    const pos = []; for (let i = 0; i < s.code.length; i++) if (/\S/.test(s.code[i])) pos.push(i + 1);
    const dur = SC.clamp(pos.length * 38, 900, 3800);
    let shown = -1;
    render([""], [""]);
    await r.raf((dt, t) => {
      const k = Math.min(pos.length, Math.floor(SC.clamp(t * 1000 / dur, 0, 1) * pos.length));
      if (k !== shown) {
        shown = k;
        const part = k ? s.code.slice(0, pos[k - 1]) : "";
        render(part.split("\n"), highlight(part, s.lang));
        els[els.length - 1].append(cursor);
        body.scrollTop = body.scrollHeight;
      }
      return t * 1000 < dur;
    });
    cursor.remove();
    render(s.lines, s.html);
  };

  const mark = (i) => dots.forEach((d, k) => { d.classList.toggle("now", k === i); d.classList.toggle("past", k < i); });
  const caption = (i) => {
    const s = steps[i];
    numEl.textContent = `${SC.pad(i + 1)} / ${SC.pad(steps.length)}`;
    txt.innerHTML = s.caption ? SC.rich(s.caption) : "";
    txt.classList.remove("pop"); void txt.offsetWidth; txt.classList.add("pop");
    mark(i); label(s);
  };
  const go = async (i, fresh) => {
    const s = steps[i]; idx = i;
    caption(i);
    if (s.type === false && !els.length) { clearAll(); render(s.lines, s.html); focusOn(s); }
    else if (fresh || s.type === true || !els.length) { await typeIn(s); focusOn(s); }
    else await morph(s);
  };

  dots.forEach((d, i) => d.addEventListener("click", () => {
    if (busy || i === idx) return;
    busy = true; dotsEl.classList.remove("ready");
    r.spawn((async () => { await go(i, false); await r.wait(100); })()).finally(() => {
      if (r.live) { busy = false; dotsEl.classList.add("ready"); }
    });
  }));

  if (SC.reduce) {
    await go(steps.length - 1, true);
  } else {
    await r.wait(400);
    for (let i = 0; i < steps.length; i++) {
      await go(i, i === 0);
      await r.wait(Math.max(300, +cfg.holdMs || 2400));
    }
  }
  busy = false; dotsEl.classList.add("ready");
});
