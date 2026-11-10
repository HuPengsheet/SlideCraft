(() => {
const { $, cats, all, esc, pad, summary, openModal } = window.SC2;
$("#total").textContent = all.length;
$("#ncat").textContent = cats.length;

/* ---------- 分类与卡片 ---------- */
$("#gallery").innerHTML = cats.map((c, ci) => `
  <section class="sec" id="c${ci}" data-ci="${ci}">
    <div class="sec-head"><span class="no">${pad(ci + 1)}</span><h2>${esc(c.name)}</h2><span class="n">${c.items.length} 个</span></div>
    <div class="grid">${c.items.map((i) => `
      <button class="card" data-s="${i.slug}" data-t="${esc([i.title, i.prompt, i.slug, c.name].join(" ").toLowerCase())}">
        <div class="thumb">
          <img class="poster" src="posters/${i.slug}.jpg" alt="${esc(i.title)}" loading="lazy" decoding="async">
          <span class="tag">点击运行</span>
        </div>
        <div class="body"><h3>${esc(i.title)}</h3><p>${esc(summary(i.prompt))}</p></div>
      </button>`).join("")}
    </div>
  </section>`).join("");

const nav = $("#cats");
nav.innerHTML = `<button class="category-link is-active" data-ci="all"><span>全部</span><small>${all.length}</small></button>` +
  cats.map((c, ci) => `<button class="category-link" data-ci="${ci}"><span>${esc(c.name)}</span><small>${c.items.length}</small></button>`).join("");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function ensureLive(card) {
  const th = $(".thumb", card);
  if ($(".live", th)) return;
  const im = new Image();
  im.className = "live"; im.alt = ""; im.decoding = "async";
  im.src = `../previews/pages/${card.dataset.s}.webp`;
  im.onload = () => im.classList.add("on");
  th.insertBefore(im, $(".tag", th));
}

/* 进入屏幕附近的卡片自动播放，离开后回收，避免整页动图同时解码 */
if (!reducedMotion.matches) {
  const auto = new IntersectionObserver((es) => es.forEach((en) => {
    const card = en.target;
    if (en.isIntersecting) ensureLive(card);
    else { const l = $(".live", card); if (l) l.remove(); }
  }), { rootMargin: "120px 0px" });
  document.querySelectorAll(".card").forEach((c) => auto.observe(c));
}

/* 悬停或聚焦时也可加载动图。 */
$("#gallery").addEventListener("pointerover", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  ensureLive(card);
});
$("#gallery").addEventListener("focusin", (e) => {
  const card = e.target.closest(".card");
  if (card) ensureLive(card);
});
$("#gallery").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) openModal(c.dataset.s); });

/* 入场动画 */
const io = new IntersectionObserver((es) => es.forEach((en) => {
  if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
}), { rootMargin: "0px 0px -6% 0px" });
document.querySelectorAll(".card").forEach((c, i) => { c.style.setProperty("--d", (i % 3) * 70 + "ms"); io.observe(c); });

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
const setActive = (match) => document.querySelectorAll(".category-link").forEach((p) => p.classList.toggle("is-active", match(p)));
nav.addEventListener("click", (e) => {
  const b = e.target.closest(".category-link");
  if (!b) return;
  filterCi = b.dataset.ci;
  setActive((p) => p === b);
  applyFilter();
  if (!matchMedia("(min-width: 901px)").matches) b.scrollIntoView({ inline: "center", block: "nearest", behavior: reducedMotion.matches ? "instant" : "smooth" });
  const intro = $(".intro");
  const y = intro.getBoundingClientRect().bottom + scrollY - 90;
  if (scrollY > y) scrollTo({ top: Math.max(0, y), behavior: reducedMotion.matches ? "instant" : "smooth" });
});
$("#q").addEventListener("input", applyFilter);

/* ⌘K / Ctrl+K 聚焦搜索 */
$("#kbd").textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K";
addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#q").focus(); $("#q").select(); }
});

/* 滚动到某一类时，高亮对应的分类按钮（仅在“全部”模式下）；回到页首时高亮“全部” */
let spyCi = null;
const atTop = () => scrollY < $("#gallery").offsetTop - 200;
function syncActive() {
  if (filterCi !== "all") return;
  const ci = atTop() || spyCi === null ? "all" : spyCi;
  setActive((p) => p.dataset.ci === ci);
}
const spy = new IntersectionObserver((es) => {
  const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
  if (vis) spyCi = vis.target.dataset.ci;
  syncActive();
}, { rootMargin: "-30% 0px -60% 0px" });
document.querySelectorAll(".sec").forEach((s) => spy.observe(s));
addEventListener("scroll", syncActive, { passive: true });

/* 支持 gallery.html#cat=N 直达某一类（从 1 开始） */
const m = location.hash.match(/^#cat=(\d+)/);
if (m && cats[+m[1] - 1]) { const b = document.querySelector(`.category-link[data-ci="${+m[1] - 1}"]`); if (b) b.click(); }
})();
