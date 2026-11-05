(() => {
const { $, cats, all, esc, openModal } = window.SC2;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
$("#total").textContent = all.length;
$("#s1").textContent = all.length;
$("#s2").textContent = cats.length;
$("#shuffle").onclick = () => openModal(all[Math.floor(Math.random() * all.length)].slug);

/* 海报墙：分成几列，相邻两列反向滚动；每列内容复制一份，实现无缝循环 */
const wall = $("#wall");
let cols = 0;
const tileHtml = (i) => `<button class="tile" data-s="${i.slug}" aria-label="${esc(i.title)}">
  <img class="poster" src="posters/${i.slug}.jpg" alt="" decoding="async"><b>${esc(i.title)}</b></button>`;
function buildWall() {
  const n = innerWidth > 1100 ? 5 : 4;
  if (n === cols) return;
  cols = n;
  const buckets = Array.from({ length: n }, () => []);
  all.forEach((i, k) => buckets[k % n].push(i));
  wall.innerHTML = buckets.map((items, c) => {
    const html = items.map(tileHtml).join("");
    return `<div class="col" style="animation-delay:${c * 70}ms"><div class="strip" style="--d:${52 + c * 9}s;--dir:${c % 2 ? "reverse" : "normal"}">${html}${html}</div></div>`;
  }).join("");
}
buildWall();
addEventListener("resize", buildWall);
wall.addEventListener("click", (e) => { const t = e.target.closest(".tile"); if (t) openModal(t.dataset.s); });
wall.addEventListener("pointerover", (e) => {
  const t = e.target.closest(".tile");
  if (t) ensureLive(t);
});

function ensureLive(t) {
  let l = $(".live", t);
  if (!l) {
    l = new Image();
    l.className = "live"; l.alt = ""; l.decoding = "async";
    l.src = `../previews/pages/${t.dataset.s}.webp`;
    t.insertBefore(l, $("b", t));
  }
  return l;
}

/* 墙上同时有几块在播放动图，轮流更换 */
function wallPlay() {
  if (reduce || document.hidden || !$("#modal").hidden) return;
  const tiles = [...wall.querySelectorAll(".tile")];
  const vis = tiles.filter((t) => { const r = t.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && !t.matches(":hover"); });
  if (!vis.length || wall.querySelectorAll(".tile.play").length >= 4) return;
  const t = vis[Math.floor(Math.random() * vis.length)];
  if (t.classList.contains("play")) return;
  const on = () => { t.classList.add("play"); setTimeout(() => t.classList.remove("play"), 4200); };
  const l = ensureLive(t);
  if (l.complete && l.naturalWidth) on(); else l.onload = on;
}
setInterval(wallPlay, 800);
})();
