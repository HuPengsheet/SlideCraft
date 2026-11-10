(() => {
const $ = (s, r = document) => r.querySelector(s);
const items = REEL.items;
const N = items.length;
const DUR = REEL.dur * 1000, INTRO = REEL.intro * 1000, OUTRO = REEL.outro * 1000;

const stage = $("#stage"), intro = $("#intro"), seg = $("#seg"), outro = $("#outro");
const panel = $("#panel"), frames = [...document.querySelectorAll(".fr")];
const dashes = $("#dashes"), introDots = $("#introDots"), outroDots = $("#outroDots");

items.forEach((it, i) => {
  const c = it.pal[1];
  dashes.insertAdjacentHTML("beforeend", `<i style="--c:${c}" data-i="${i}"></i>`);
  introDots.insertAdjacentHTML("beforeend", `<i style="--c:${c}"></i>`);
  outroDots.insertAdjacentHTML("beforeend", `<i style="--c:${c}">${String(i + 1).padStart(2, "0")}</i>`);
});

function url(it) {
  return `../pages/${it.slug}/index.html?theme=${REEL.theme}&speed=1&controls=0&loop=1`;
}
function fill(it, i) {
  $("#pNum").textContent = String(i + 1).padStart(2, "0");
  $("#pTitle").textContent = it.title;
  $("#pEn").textContent = it.en;
  $("#pDesc").textContent = it.desc;
  $("#pTags").innerHTML = it.tags.map((t) => `<span>${t}</span>`).join("");
  $("#pPal").innerHTML = it.pal.map((c) => `<i style="background:${c}"></i>`).join("");
  stage.style.setProperty("--acc", it.pal[1]);
  document.querySelectorAll(".dashes i").forEach((d, k) => {
    d.classList.toggle("seen", k < i);
    d.classList.toggle("now", k === i);
    d.style.setProperty("--c", items[k].pal[1]);
  });
}

let idx = -1, clock = 0, last = 0, running = false, raf = 0, shown = null;

function show(scene) {
  if (shown === scene) return;
  shown = scene;
  [intro, seg, outro].forEach((s) => s.classList.toggle("on", s === scene));
}

function go(i) {
  idx = i;
  const it = items[i];
  const next = frames.find((f) => !f.classList.contains("cur")) || frames[0];
  const cur = frames.find((f) => f.classList.contains("cur"));
  next.src = url(it);
  next.classList.add("cur");
  if (cur) { cur.classList.remove("cur"); setTimeout(() => { if (!cur.classList.contains("cur")) cur.removeAttribute("src"); }, 700); }
  panel.classList.add("swap");
  setTimeout(() => { fill(it, i); panel.classList.remove("swap"); }, 260);
  show(seg);
}

function tick(t) {
  if (!running) return;
  raf = requestAnimationFrame(tick);
  if (!last) last = t;
  clock += t - last; last = t;

  if (clock < INTRO) { show(intro); return; }
  const body = clock - INTRO;
  const total = N * DUR;
  if (body >= total) { show(outro); if (body >= total + OUTRO) clock = 0; return; }
  const i = Math.min(N - 1, Math.floor(body / DUR));
  if (i !== idx) go(i);
  const p = (body - i * DUR) / DUR;
  $("#pFill").style.width = (p * 100).toFixed(1) + "%";
  const s = Math.floor(p * REEL.dur);
  $("#pTime").textContent = `00:${String(s).padStart(2, "0")} / 00:${String(REEL.dur).padStart(2, "0")}`;
}

function start() {
  cancelAnimationFrame(raf);
  idx = -1; clock = 0; last = 0; running = true; shown = null;
  frames.forEach((f) => { f.classList.remove("cur"); f.removeAttribute("src"); });
  requestAnimationFrame(tick);
}
function setPaused(v) { running = !v; last = 0; if (running) raf = requestAnimationFrame(tick); else cancelAnimationFrame(raf); }

addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); setPaused(running); }
  else if (e.key === "r" || e.key === "R") start();
  else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const i = Math.max(0, Math.min(N - 1, (idx < 0 ? 0 : idx) + dir));
    clock = INTRO + i * DUR + 1; last = 0;
    if (!running) { running = true; raf = requestAnimationFrame(tick); }
  }
});

start();
})();
