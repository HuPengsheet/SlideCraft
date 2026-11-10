(() => {
const $ = (s, r = document) => r.querySelector(s);
const cats = window.SITE.cats;
const all = cats.flatMap((c, ci) => c.items.map((i) => ({ ...i, cat: c.name, catEn: c.nameEn, ci })));
const bySlug = Object.fromEntries(all.map((i) => [i.slug, i]));
const NO_SHARED = new Set(["gallery", "chat-sim"]);      // 没接入共用底座，不支持主题和速度参数
const THEMES = ["dark", "light", "paper", "neon", "terminal"];
const SPEEDS = [0.5, 1, 2, 4];
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad = (n) => String(n).padStart(2, "0");

/* ---------- 语言 ---------- */
const I18N = {
  zh: {
    title: "效果展示 · SlideCraft", h1: "效果展示", lede: "按用途分类浏览。点任意一张卡片，就能在弹窗里实时运行，并拿到对应的 AI 提示词。",
    statEffects: "效果", statCats: "类别", statThemes: "主题", navAll: "全部", catHead: "分类",
    note1: "SlideCraft · 纯 HTML、CSS 与 JS，无需构建", note2: "支持 5 套主题、倍速、暂停与重播",
    searchLabel: "搜索效果", searchPh: "搜索名称、用途，例如：地球、图表、打字", empty: "没有找到匹配的效果，换个词试试。",
    run: "点击运行", count: (n) => `${n} 个`, toggle: "EN", github: "GitHub",
    mTheme: "主题", mSpeed: "速度", replay: "重播", openNew: "新窗口打开", prompt: "提示词", copy: "复制",
    copied: "已复制", copyFail: "复制失败", hint: "← → 切换 · Esc 关闭", prev: "上一个", next: "下一个", close: "关闭",
    preview: "预览", dialogCat: "效果分类",
  },
  en: {
    title: "Effects · SlideCraft", h1: "Effects", lede: "Browse by purpose. Click any card to run it live in a dialog and get the matching AI prompt.",
    statEffects: "Effects", statCats: "Categories", statThemes: "Themes", navAll: "All", catHead: "Categories",
    note1: "SlideCraft · Pure HTML, CSS and JS, no build step", note2: "5 themes, speed control, pause and replay",
    searchLabel: "Search effects", searchPh: "Search by name or use, e.g. globe, chart, typing", empty: "No effects match. Try another keyword.",
    run: "Click to run", count: (n) => `${n}`, toggle: "中文", github: "GitHub",
    mTheme: "Theme", mSpeed: "Speed", replay: "Replay", openNew: "Open in new tab", prompt: "Prompt", copy: "Copy",
    copied: "Copied", copyFail: "Copy failed", hint: "← → navigate · Esc close", prev: "Previous", next: "Next", close: "Close",
    preview: "Preview", dialogCat: "Category",
  },
};
let lang = (() => {
  const saved = localStorage.getItem("sc-lang");
  if (saved === "zh" || saved === "en") return saved;
  return /^zh/i.test(navigator.language || "") ? "zh" : "en";
})();
const t = (k) => I18N[lang][k];
/* 取双语字段：pick(item, "title") 在英文下返回 item.titleEn */
const pick = (o, k) => (lang === "en" ? o[k + "En"] : o[k]);
/* 卡片说明：取提示词的第一句。中文按句号、感叹号切，英文按句号切 */
const summary = (p) => {
  const cut = lang === "en" ? p.split(/(?<=[.!?])\s/)[0] : p.split(/[。！]/)[0] + "。";
  return cut;
};
const searchText = (i, c) => [i.title, i.titleEn, i.prompt, i.promptEn, i.slug, c.name, c.nameEn].join(" ").toLowerCase();

const MODAL_HTML = `<div class="modal" id="modal" hidden>
  <div class="m-back" data-close></div>
  <div class="m-box" role="dialog" aria-modal="true" aria-labelledby="mTitle">
    <div class="m-head">
      <div><span class="m-cat" id="mCat"></span><h2 id="mTitle"></h2></div>
      <div class="m-nav"><button id="mPrev" data-i18n-aria="prev" aria-label="上一个">←</button><button id="mNext" data-i18n-aria="next" aria-label="下一个">→</button><button data-close data-i18n-aria="close" aria-label="关闭">✕</button></div>
    </div>
    <div class="m-body">
      <div class="m-view"><div class="screen"><iframe id="mFrame" data-i18n-title="preview" title="预览" allow="autoplay"></iframe></div></div>
      <aside class="m-side">
        <div class="ctl"><span data-i18n="mTheme">主题</span><div class="chips" id="mThemes"></div></div>
        <div class="ctl"><span data-i18n="mSpeed">速度</span><div class="chips" id="mSpeeds"></div></div>
        <div class="ctl"><button class="btn sm" id="mReplay" data-i18n="replay">重播</button><a class="btn sm" id="mOpen" target="_blank" rel="noopener" data-i18n="openNew">新窗口打开</a></div>
        <div class="prompt"><div class="p-head"><b data-i18n="prompt">提示词</b><button class="btn sm solid" id="mCopy" data-i18n="copy">复制</button></div><p id="mPrompt"></p></div>
        <p class="hint" data-i18n="hint">← → 切换 · Esc 关闭</p>
      </aside>
    </div>
  </div>
</div>`;
document.body.insertAdjacentHTML("beforeend", MODAL_HTML);

/* ---------- 弹窗查看器 ---------- */
let cur = null, theme = "dark", speed = 1;
const modal = $("#modal"), mFrame = $("#mFrame");
$("#mThemes").innerHTML = THEMES.map((x) => `<button class="chip" data-t="${x}">${x}</button>`).join("");
$("#mSpeeds").innerHTML = SPEEDS.map((s) => `<button class="chip" data-s="${s}">${s}×</button>`).join("");

function frameUrl(slug) {
  const base = `../pages/${slug}/index.html`;
  return NO_SHARED.has(slug) ? base : `${base}?theme=${theme}&speed=${speed}`;
}
function renderModal() {
  const shared = !NO_SHARED.has(cur.slug);
  $("#mCat").textContent = `${pad(cur.ci + 1)} · ${pick(cur, "cat")}`;
  $("#mTitle").textContent = pick(cur, "title");
  $("#mPrompt").textContent = pick(cur, "prompt");
  mFrame.src = frameUrl(cur.slug);
  $("#mOpen").href = frameUrl(cur.slug);
  document.querySelectorAll("#mThemes .chip").forEach((b) => b.classList.toggle("on", b.dataset.t === theme));
  document.querySelectorAll("#mSpeeds .chip").forEach((b) => b.classList.toggle("on", +b.dataset.s === speed));
  $("#mThemes").parentElement.hidden = $("#mSpeeds").parentElement.hidden = !shared;
  history.replaceState(null, "", "#view=" + cur.slug);
}
function openModal(slug) {
  cur = bySlug[slug]; if (!cur) return;
  modal.hidden = false; document.body.style.overflow = "hidden";
  renderModal();
}
function closeModal() {
  modal.hidden = true; document.body.style.overflow = ""; mFrame.src = "about:blank";
  history.replaceState(null, "", location.pathname + location.search);
}
const step = (k) => openModal(all[(all.indexOf(bySlug[cur.slug]) + k + all.length) % all.length].slug);

modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
$("#mPrev").onclick = () => step(-1);
$("#mNext").onclick = () => step(1);
$("#mThemes").onclick = (e) => { const b = e.target.closest(".chip"); if (b) { theme = b.dataset.t; renderModal(); } };
$("#mSpeeds").onclick = (e) => { const b = e.target.closest(".chip"); if (b) { speed = +b.dataset.s; renderModal(); } };
$("#mReplay").onclick = () => {
  if (NO_SHARED.has(cur.slug)) mFrame.src = frameUrl(cur.slug);
  else mFrame.contentWindow.postMessage({ sc: "cmd", cmd: "replay" }, "*");
};
$("#mCopy").onclick = () => {
  const b = $("#mCopy"), done = (k) => { b.textContent = t(k); setTimeout(() => (b.textContent = t("copy")), 1300); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(pick(cur, "prompt")).then(() => done("copied"), () => done("copyFail"));
  else done("copyFail");
};
addEventListener("keydown", (e) => {
  if (modal.hidden) return;
  if (e.key === "Escape") closeModal();
  else if (e.key === "ArrowLeft") step(-1);
  else if (e.key === "ArrowRight") step(1);
});
const fromHash = () => { const m = location.hash.match(/^#view=([\w-]+)/); if (m && bySlug[m[1]]) openModal(m[1]); };
addEventListener("hashchange", () => { if (modal.hidden) fromHash(); });
fromHash();

/* ---------- 语言切换 ---------- */
const listeners = [];
function applyStatic() {
  document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  const tog = $("#langToggle"); if (tog) tog.textContent = t("toggle");
}
function setLang(next) {
  if (next !== "zh" && next !== "en") return;
  lang = next;
  localStorage.setItem("sc-lang", next);
  applyStatic();
  if (!modal.hidden) renderModal();
  listeners.forEach((fn) => fn());
}
const tog = $("#langToggle");
if (tog) tog.addEventListener("click", () => setLang(lang === "zh" ? "en" : "zh"));
applyStatic();

window.SC2 = {
  $, cats, all, bySlug, esc, pad, summary, openModal, THEMES, searchText,
  t, pick, lang: () => lang, onLang: (fn) => listeners.push(fn),
};
})();
