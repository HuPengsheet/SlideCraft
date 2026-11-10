(() => {
const { $, cats, all, esc, pad, summary, openModal, t, pick, searchText, onLang } = window.SC2;
const nav = $("#cats");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let filterCi = "all";
let spyCi = null;
let observers = [];

/* ---------- 构建（语言切换时整体重建） ---------- */
function build() {
  observers.forEach((o) => o.disconnect());
  observers = [];
  $("#total").textContent = all.length;
  $("#ncat").textContent = cats.length;

  $("#gallery").innerHTML = cats.map((c, ci) => `
    <section class="sec" id="c${ci}" data-ci="${ci}">
      <div class="sec-head"><span class="no">${pad(ci + 1)}</span><h2>${esc(pick(c, "name"))}</h2><span class="n"></span></div>
      <div class="grid">${c.items.map((i) => `
        <button class="card" data-s="${i.slug}" data-t="${esc(searchText(i, c))}">
          <div class="thumb">
            <img class="poster" src="posters/${i.slug}.jpg" alt="${esc(pick(i, "title"))}" loading="lazy" decoding="async">
            <span class="tag">${t("run")}</span>
          </div>
          <div class="body"><h3>${esc(pick(i, "title"))}</h3><p>${esc(summary(pick(i, "prompt")))}</p></div>
        </button>`).join("")}
      </div>
    </section>`).join("");

  nav.innerHTML = `<button class="category-link" data-ci="all"><span>${t("navAll")}</span><small>${all.length}</small></button>` +
    cats.map((c, ci) => `<button class="category-link" data-ci="${ci}"><span>${esc(pick(c, "name"))}</span><small>${c.items.length}</small></button>`).join("");

  wireObservers();
  applyFilter();
  setActive((p) => p.dataset.ci === String(filterCi));
  syncActive();
}

/* 动图：进入屏幕附近自动播放，离开后回收 */
function ensureLive(card) {
  const th = $(".thumb", card);
  if ($(".live", th)) return;
  const im = new Image();
  im.className = "live"; im.alt = ""; im.decoding = "async";
  im.src = `../previews/pages/${card.dataset.s}.webp`;
  im.onload = () => im.classList.add("on");
  th.insertBefore(im, $(".tag", th));
}

function wireObservers() {
  if (!reducedMotion.matches) {
    const auto = new IntersectionObserver((es) => es.forEach((en) => {
      const card = en.target;
      if (en.isIntersecting) ensureLive(card);
      else { const l = $(".live", card); if (l) l.remove(); }
    }), { rootMargin: "120px 0px" });
    document.querySelectorAll(".card").forEach((c) => auto.observe(c));
    observers.push(auto);
  }

  /* 入场动画 */
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".card").forEach((c, i) => { c.style.setProperty("--d", (i % 3) * 70 + "ms"); io.observe(c); });
  observers.push(io);

  /* 滚动到某一类时，高亮对应的分类按钮 */
  const spy = new IntersectionObserver((es) => {
    const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (vis) spyCi = vis.target.dataset.ci;
    syncActive();
  }, { rootMargin: "-30% 0px -60% 0px" });
  document.querySelectorAll(".sec").forEach((s) => spy.observe(s));
  observers.push(spy);
}

/* ---------- 筛选、搜索、滚动高亮 ---------- */
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
    $(".n", sec).textContent = t("count")(n);
    shown += n;
  });
  $("#empty").hidden = shown > 0;
}
const setActive = (match) => document.querySelectorAll(".category-link").forEach((p) => p.classList.toggle("is-active", match(p)));
function syncActive() {
  if (filterCi !== "all") return;
  const atTop = scrollY < $("#gallery").offsetTop - 200;
  const ci = atTop || spyCi === null ? "all" : spyCi;
  setActive((p) => p.dataset.ci === ci);
}

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
addEventListener("scroll", syncActive, { passive: true });

/* 卡片点击、悬停预载（事件委托，只绑一次） */
$("#gallery").addEventListener("pointerover", (e) => { const card = e.target.closest(".card"); if (card) ensureLive(card); });
$("#gallery").addEventListener("focusin", (e) => { const card = e.target.closest(".card"); if (card) ensureLive(card); });
$("#gallery").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) openModal(c.dataset.s); });

/* ⌘K / Ctrl+K 聚焦搜索 */
$("#kbd").textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K";
addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#q").focus(); $("#q").select(); }
});

/* ---------- 启动 ---------- */
build();
onLang(build);

/* 支持 gallery.html#cat=N 直达某一类（从 1 开始） */
const m = location.hash.match(/^#cat=(\d+)/);
if (m && cats[+m[1] - 1]) { const b = document.querySelector(`.category-link[data-ci="${+m[1] - 1}"]`); if (b) b.click(); }
})();
