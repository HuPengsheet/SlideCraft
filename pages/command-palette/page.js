/* 命令面板：弹出，逐字输入，实时过滤并高亮，选中并执行。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  appName: "工作台",
  shortcut: "Ctrl K",
  placeholder: "输入命令或搜索…",
  typeMs: 90,
  all: [],
  queries: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);

/* 返回命中的字符下标集合；不命中返回 null */
function match(text, q) {
  if (!q) return [];
  const t = text.toLowerCase(), s = q.toLowerCase();
  const at = t.indexOf(s);
  if (at >= 0) return Array.from({ length: s.length }, (_, i) => at + i);
  const hit = []; let j = 0;
  for (let i = 0; i < t.length && j < s.length; i++) if (t[i] === s[j]) { hit.push(i); j++; }
  return j === s.length ? hit : null;
}
function hl(text, idx) {
  const set = new Set(idx);
  let out = "", open = false;
  [...text].forEach((ch, i) => {
    const on = set.has(i);
    if (on && !open) out += "<mark>"; if (!on && open) out += "</mark>";
    open = on; out += SC.esc(ch);
  });
  return out + (open ? "</mark>" : "");
}
/* 按 title+sub 过滤；title 里命中的字符高亮，仅在 sub 命中时 title 不高亮 */
function filter(all, q) {
  const out = [];
  for (const c of all) {
    const mt = match(c.title, q);
    const ms = mt ? null : match(c.sub, q);
    if (mt || ms) out.push({ c, mt: mt || [], ms: ms || (mt ? match(c.sub, q) || [] : []) });
  }
  return out;
}

player.play(async (r) => {
  stage.innerHTML = "";
  const all = (Array.isArray(cfg.all) ? cfg.all : [])
    .filter((c) => c && typeof c === "object" && c.title)
    .map((c) => ({ title: String(c.title), sub: String(c.sub || ""), group: String(c.group || ""), key: String(c.key || "") }));
  const queries = (Array.isArray(cfg.queries) ? cfg.queries : []).filter((q) => q && typeof q === "object");

  const app = SC.el("app", `<div class="tb"><i></i><i></i><i></i><b></b></div><div class="bd"><div class="sd"><div class="sk a"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div></div><div class="mn"><div class="sk a"></div><div class="sk" style="width:90%"></div><div class="sk" style="width:70%"></div><div class="sk" style="height:7em;border-radius:.8em"></div></div></div>`);
  SC.$("b", app).textContent = cfg.appName || "";
  const veil = SC.el("veil");
  const pal = SC.el("pal", `<div class="in-row"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><div class="q"></div><span class="kbd"></span></div><div class="list"></div><div class="ft"><span><b>↑↓</b>选择</span><span><b>Enter</b>执行</span><span><b>Esc</b>关闭</span></div>`);
  const toast = SC.el("toast", `<i></i><span></span>`);
  stage.append(app, veil, pal, toast);
  SC.$(".kbd", pal).textContent = cfg.shortcut || "";
  const qEl = SC.$(".q", pal), list = SC.$(".list", pal);

  let text = "", sel = -1, shown = [];
  const render = () => {
    qEl.classList.toggle("ph", !text);
    qEl.innerHTML = (text ? SC.esc(text) : SC.esc(cfg.placeholder || "")) + '<span class="caret"></span>';
    pal.dataset.query = text;
    shown = filter(all, text);
    list.innerHTML = "";
    if (!shown.length) { list.append(SC.el("empty", all.length ? "没有匹配的命令" : "暂无命令")); return; }
    let lastG = null;
    shown.forEach((s, i) => {
      if (s.c.group && s.c.group !== lastG) { const g = SC.el("grp"); g.textContent = s.c.group; list.append(g); }
      lastG = s.c.group;
      const row = SC.el("row" + (i === sel ? " sel" : ""), `<span class="ic"></span><div class="tx"><div class="t"></div><div class="sub"></div></div>`);
      SC.$(".ic", row).textContent = [...s.c.title][0] || "";
      SC.$(".t", row).innerHTML = hl(s.c.title, s.mt);
      SC.$(".sub", row).innerHTML = hl(s.c.sub, s.ms);
      if (s.c.key) { const k = SC.el("kbd"); k.textContent = s.c.key; row.append(k); }
      row.dataset.i = i;
      list.append(row);
    });
    const cur = SC.$(".row.sel", list);
    if (cur) {
      const top = cur.offsetTop - 4, bot = cur.offsetTop + cur.offsetHeight + 4;
      if (bot > list.clientHeight + list.scrollTop) list.scrollTop = bot - list.clientHeight;
      if (top < list.scrollTop) list.scrollTop = top;
    }
  };
  const open = () => { veil.classList.add("on"); pal.classList.add("on"); };
  const close = () => { veil.classList.remove("on"); pal.classList.remove("on"); };

  if (SC.reduce || !queries.length) {
    text = queries.length ? String(queries[queries.length - 1].text || "") : "";
    render(); open();
    if (queries.length) {
      const q = queries[queries.length - 1];
      sel = Math.max(0, pickIndex(q)); render();
      const row = SC.$(".row.sel", list);
      if (row) { row.classList.add("flash"); }
      showToast(q);
    }
    return;
  }

  function pickIndex(q) {
    if (typeof q.pick === "string") { const i = shown.findIndex((s) => s.c.title === q.pick); return i; }
    return SC.clamp(Math.floor(+q.pick) || 0, 0, Math.max(0, shown.length - 1));
  }
  function showToast(q) {
    const s = shown[sel];
    SC.$("span", toast).textContent = q.toast || (s ? "已执行：" + s.c.title : "");
    toast.classList.add("on");
  }

  await r.wait(400);
  for (let qi = 0; qi < queries.length; qi++) {
    const q = queries[qi], last = qi === queries.length - 1;
    text = ""; sel = -1; render(); open();
    await r.wait(600);
    const full = [...String(q.text || "")];
    for (let i = 1; i <= full.length; i++) {
      text = full.slice(0, i).join(""); sel = -1; render();
      await r.wait(Math.max(20, +cfg.typeMs || 90));
    }
    await r.wait(500);
    if (!shown.length) { await r.wait(900); if (!last) { close(); await r.wait(500); } continue; }
    const target = Math.max(0, pickIndex(q));
    for (let i = 0; i <= target; i++) { sel = i; render(); await r.wait(260); }
    await r.wait(400);
    const row = SC.$(".row.sel", list);
    if (row) row.classList.add("flash");
    await r.wait(300);
    showToast(q);
    await r.wait(1500);
    if (!last) { toast.classList.remove("on"); close(); await r.wait(600); }
  }
});
