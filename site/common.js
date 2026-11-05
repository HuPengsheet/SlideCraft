(() => {
const $ = (s, r = document) => r.querySelector(s);
const cats = window.SITE.cats;
const all = cats.flatMap((c, ci) => c.items.map((i) => ({ ...i, cat: c.name, ci })));
const bySlug = Object.fromEntries(all.map((i) => [i.slug, i]));
const NO_SHARED = new Set(["gallery", "chat-sim"]);      // 没接入共用底座，不支持主题和速度参数
const THEMES = ["dark", "light", "paper", "neon", "terminal"];
const SPEEDS = [0.5, 1, 2, 4];
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad = (n) => String(n).padStart(2, "0");
const summary = (p) => p.split(/[。！]/)[0] + "。";

const MODAL_HTML = `<div class="modal" id="modal" hidden>
  <div class="m-back" data-close></div>
  <div class="m-box" role="dialog" aria-modal="true" aria-labelledby="mTitle">
    <div class="m-head">
      <div><span class="m-cat" id="mCat"></span><h2 id="mTitle"></h2></div>
      <div class="m-nav"><button id="mPrev" aria-label="上一个">←</button><button id="mNext" aria-label="下一个">→</button><button data-close aria-label="关闭">✕</button></div>
    </div>
    <div class="m-body">
      <div class="m-view"><div class="screen"><iframe id="mFrame" title="预览" allow="autoplay"></iframe></div></div>
      <aside class="m-side">
        <div class="ctl"><span>主题</span><div class="chips" id="mThemes"></div></div>
        <div class="ctl"><span>速度</span><div class="chips" id="mSpeeds"></div></div>
        <div class="ctl"><button class="btn sm" id="mReplay">重播</button><a class="btn sm" id="mOpen" target="_blank" rel="noopener">新窗口打开</a></div>
        <div class="prompt"><div class="p-head"><b>提示词</b><button class="btn sm solid" id="mCopy">复制</button></div><p id="mPrompt"></p></div>
        <p class="hint">← → 切换 · Esc 关闭</p>
      </aside>
    </div>
  </div>
</div>`;
document.body.insertAdjacentHTML("beforeend", MODAL_HTML);

/* ---------- 弹窗查看器 ---------- */
let cur = null, theme = "dark", speed = 1;
const modal = $("#modal"), mFrame = $("#mFrame");
$("#mThemes").innerHTML = THEMES.map((t) => `<button class="chip" data-t="${t}">${t}</button>`).join("");
$("#mSpeeds").innerHTML = SPEEDS.map((s) => `<button class="chip" data-s="${s}">${s}×</button>`).join("");

function frameUrl(slug) {
  const base = `../pages/${slug}/index.html`;
  return NO_SHARED.has(slug) ? base : `${base}?theme=${theme}&speed=${speed}`;
}
function renderModal() {
  const shared = !NO_SHARED.has(cur.slug);
  $("#mCat").textContent = `${pad(cur.ci + 1)} · ${cur.cat}`;
  $("#mTitle").textContent = cur.title;
  $("#mPrompt").textContent = cur.prompt;
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
  const b = $("#mCopy"), done = (t) => { b.textContent = t; setTimeout(() => (b.textContent = "复制"), 1300); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(cur.prompt).then(() => done("已复制"), () => done("复制失败"));
  else done("复制失败");
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
window.SC2 = { $, cats, all, bySlug, esc, pad, summary, openModal, THEMES };
})();
