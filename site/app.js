(() => {
const $ = (s, r = document) => r.querySelector(s);
const cats = window.SITE.cats;
const all = cats.flatMap((c, ci) => c.items.map((i) => ({ ...i, cat: c.name, ci })));
const bySlug = Object.fromEntries(all.map((i) => [i.slug, i]));
const NO_SHARED = new Set(["gallery", "chat-sim"]);      // 没接入共用底座，不支持主题和速度参数
const THEMES = ["dark", "light", "paper", "neon", "terminal"];
const SPEEDS = [0.5, 1, 2, 4];
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const summary = (p) => p.split(/[。！]/)[0] + "。";

$("#total").textContent = all.length;
$("#ncat").textContent = cats.length;

/* ---------- 分类与卡片 ---------- */
const pad = (n) => String(n).padStart(2, "0");
$("#gallery").innerHTML = cats.map((c, ci) => `
  <section class="sec" id="c${ci}" data-ci="${ci}">
    <div class="sec-head"><span class="no">${pad(ci + 1)}</span><h2>${esc(c.name)}</h2><span class="n">${c.items.length} 个</span></div>
    <div class="grid">${c.items.map((i) => `
      <button class="card" data-s="${i.slug}" data-t="${esc((i.title + i.prompt + i.slug).toLowerCase())}">
        <div class="thumb">
          <img class="poster" src="posters/${i.slug}.jpg" alt="${esc(i.title)}" loading="lazy" decoding="async">
          <img class="live" alt="" decoding="async">
          <span class="tag">点击运行</span>
        </div>
        <h3>${esc(i.title)}</h3>
        <p>${esc(summary(i.prompt))}</p>
      </button>`).join("")}
    </div>
  </section>`).join("");

$("#pills").innerHTML = `<button class="pill on" data-ci="all">全部<small>${all.length}</small></button>` +
  cats.map((c, ci) => `<button class="pill" data-ci="${ci}">${esc(c.name)}<small>${c.items.length}</small></button>`).join("");

/* 悬停时才加载动图，避免 73 个动图同时解码 */
$("#gallery").addEventListener("pointerover", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const live = $(".live", card);
  if (!live.src) live.src = `../previews/pages/${card.dataset.s}.webp`;
});
$("#gallery").addEventListener("focusin", (e) => {
  const card = e.target.closest(".card");
  if (card && !$(".live", card).src) $(".live", card).src = `../previews/pages/${card.dataset.s}.webp`;
});
$("#gallery").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) openModal(c.dataset.s); });

/* 入场动画 */
const io = new IntersectionObserver((es) => es.forEach((en) => {
  if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
}), { rootMargin: "0px 0px -6% 0px" });
document.querySelectorAll(".card").forEach((c, i) => { c.style.transitionDelay = (i % 3) * 70 + "ms"; io.observe(c); });

/* ---------- 筛选、搜索、滚动高亮 ---------- */
let filterCi = "all";
function applyFilter() {
  const q = $("#q").value.trim().toLowerCase();
  let shown = 0;
  document.querySelectorAll(".sec").forEach((sec) => {
    const inCat = filterCi === "all" || sec.dataset.ci === String(filterCi);
    let n = 0;
    sec.querySelectorAll(".card").forEach((card) => {
      const ok = inCat && (!q || card.dataset.t.includes(q));
      card.hidden = !ok;
      if (ok) n++;
    });
    sec.hidden = n === 0;
    $(".n", sec).textContent = n + " 个";
    shown += n;
  });
  $("#empty").hidden = shown > 0;
}
$("#pills").addEventListener("click", (e) => {
  const b = e.target.closest(".pill");
  if (!b) return;
  filterCi = b.dataset.ci;
  document.querySelectorAll(".pill").forEach((p) => p.classList.toggle("on", p === b));
  applyFilter();
  if (filterCi !== "all") scrollTo({ top: $("#bar").offsetTop - 56, behavior: "smooth" });
});
$("#q").addEventListener("input", applyFilter);

const top = $(".top");
addEventListener("scroll", () => top.classList.toggle("stuck", scrollY > 8), { passive: true });

/* 滚动到某一类时，高亮对应的分类按钮（仅在“全部”模式下） */
const spy = new IntersectionObserver((es) => {
  if (filterCi !== "all") return;
  const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
  if (!vis) return;
  document.querySelectorAll(".pill").forEach((p) => p.classList.toggle("on", p.dataset.ci === vis.target.dataset.ci || (p.dataset.ci === "all" && scrollY < $("#gallery").offsetTop - 200)));
}, { rootMargin: "-30% 0px -60% 0px" });
document.querySelectorAll(".sec").forEach((s) => spy.observe(s));

/* ---------- 首屏：小图墙 ---------- */
const wall = $("#wall");
wall.innerHTML = all.map((i) => `
  <button class="tile" data-s="${i.slug}" aria-label="${esc(i.title)}">
    <img class="poster" src="posters/${i.slug}.jpg" alt="" decoding="async">
    <img class="live" alt="" decoding="async">
    <b>${esc(i.title)}</b>
  </button>`).join("");
const tiles = [...wall.children];
const wio = new IntersectionObserver((es) => es.forEach((en) => {
  if (en.isIntersecting) { en.target.classList.add("in"); wio.unobserve(en.target); }
}));
tiles.forEach((t, k) => { t.style.transitionDelay = Math.min(k * 14, 700) + "ms"; wio.observe(t); });
wall.addEventListener("click", (e) => { const t = e.target.closest(".tile"); if (t) openModal(t.dataset.s); });
wall.addEventListener("pointerover", (e) => {
  const t = e.target.closest(".tile"), l = t && $(".live", t);
  if (l && !l.src) l.src = `../previews/pages/${t.dataset.s}.webp`;
});

/* 按屏幕大小算列数，让整面墙刚好放进首屏；窄屏不强求一屏，固定 4 列 */
function fitWall() {
  const gap = 6, w = wall.clientWidth, n = tiles.length;
  if (innerWidth < 700) { wall.style.gridTemplateColumns = "repeat(4, 1fr)"; return; }
  const avail = innerHeight - wall.getBoundingClientRect().top - scrollY - 18;
  let cols = Math.max(6, Math.ceil(w / 190));
  for (; cols < 22; cols++) {
    const tw = (w - gap * (cols - 1)) / cols, rows = Math.ceil(n / cols);
    if (rows * (tw * 9 / 16) + gap * (rows - 1) <= avail) break;
  }
  wall.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
}
fitWall();
addEventListener("resize", fitWall);

/* 墙上同时有几块在播放动图，轮流更换，让整面墙“活”着 */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
function wallPlay() {
  if (reduce || document.hidden || !$("#modal").hidden) return;
  const vh = innerHeight;
  const seen = tiles.filter((t) => { const r = t.getBoundingClientRect(); return r.bottom > 0 && r.top < vh && !t.matches(":hover"); });
  const playing = tiles.filter((t) => t.classList.contains("play"));
  if (playing.length >= 6 || !seen.length) return;
  const t = seen[Math.floor(Math.random() * seen.length)];
  if (t.classList.contains("play")) return;
  const l = $(".live", t);
  const on = () => { t.classList.add("play"); setTimeout(() => t.classList.remove("play"), 4200); };
  if (l.src) on(); else { l.onload = on; l.src = `../previews/pages/${t.dataset.s}.webp`; }
}
setInterval(wallPlay, 700);
$("#shuffle").onclick = () => openModal(all[Math.floor(Math.random() * all.length)].slug);

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
})();
