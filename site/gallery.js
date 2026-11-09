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
        <h3>${esc(i.title)}</h3>
        <p>${esc(summary(i.prompt))}</p>
      </button>`).join("")}
    </div>
  </section>`).join("");

const pills = $("#pills");
pills.innerHTML = `<button class="pill on" data-ci="all">全部<small>${all.length}</small></button>` +
  cats.map((c, ci) => `<button class="pill" data-ci="${ci}">${esc(c.name)}<small>${c.items.length}</small></button>`).join("");

const pillsPrev = $("#pillsPrev"), pillsNext = $("#pillsNext");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
function updatePillArrows() {
  pillsPrev.disabled = pills.scrollLeft <= 1;
  pillsNext.disabled = pills.scrollWidth - pills.clientWidth - pills.scrollLeft <= 1;
}
function scrollPills(left) {
  pills.scrollBy({ left, behavior: reducedMotion.matches ? "instant" : "smooth" });
}
pillsPrev.onclick = () => scrollPills(-pills.clientWidth * .8);
pillsNext.onclick = () => scrollPills(pills.clientWidth * .8);
pills.addEventListener("scroll", updatePillArrows, { passive: true });
new ResizeObserver(updatePillArrows).observe(pills);
updatePillArrows();

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
pills.addEventListener("click", (e) => {
  const b = e.target.closest(".pill");
  if (!b) return;
  filterCi = b.dataset.ci;
  document.querySelectorAll(".pill").forEach((p) => p.classList.toggle("on", p === b));
  applyFilter();
  const viewport = pills.getBoundingClientRect();
  const bounds = b.getBoundingClientRect();
  if (bounds.left < viewport.left) scrollPills(bounds.left - viewport.left);
  else if (bounds.right > viewport.right) scrollPills(bounds.right - viewport.right);
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

/* 支持 gallery.html#cat=N 直达某一类（从 1 开始） */
const m = location.hash.match(/^#cat=(\d+)/);
if (m && cats[+m[1] - 1]) { const b = document.querySelector(`.pill[data-ci="${+m[1] - 1}"]`); if (b) b.click(); }
})();
