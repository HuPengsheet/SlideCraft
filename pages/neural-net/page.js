/* 神经网络前向传播：信号脉冲沿连线逐层流过，连线粗细与亮度代表权重，输出层概率最高的节点高亮。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "神经网络前向传播",
  eyebrow: "", heading: "", subheading: "",
  pulseMs: 900,
  seed: 5,
  layers: []             // { name, nodes: [string | { label, value }] }
};

const { cfg, player, stage } = SC.init(DEFAULTS);

player.play(async (r) => {
  const layers = (cfg.layers || []).slice(0, 6).map((l) => ({
    name: String(l.name || ""),
    nodes: (l.nodes || []).slice(0, 8).map((n) => typeof n === "string" ? { label: n } : { label: n.label || "", value: n.value })
  })).filter((l) => l.nodes.length);
  if (layers.length < 2) { stage.innerHTML = ""; return; }

  const head = (cfg.eyebrow || cfg.heading || cfg.subheading) ? `<div class="hd">
    ${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}
    ${cfg.heading ? `<h1 class="sc-title">${SC.esc(cfg.heading)}</h1>` : ""}
    ${cfg.subheading ? `<p class="sc-sub">${SC.esc(cfg.subheading)}</p>` : ""}</div>` : "";
  stage.innerHTML = `<canvas></canvas>${head}` + layers.map((l, i) => `
    <div class="col" style="left:${(10 + i * 68 / (layers.length - 1)).toFixed(2)}%">
      <div class="name">${SC.esc(l.name)}</div>
      <div class="stack">${l.nodes.map((n) => `<div class="node">${n.value != null ? `<span class="prob"></span>` : ""}<span class="lab">${SC.esc(n.label)}</span></div>`).join("")}</div>
    </div>`).join("") + `<div class="badge" id="badge"></div>`;

  const cols = [...stage.querySelectorAll(".col")];
  const nodes = cols.map((c) => [...c.querySelectorAll(".node")]);
  const canvas = SC.$("canvas", stage), ctx = canvas.getContext("2d");
  const cs = getComputedStyle(stage);
  const accent = cs.getPropertyValue("--accent").trim();
  const soft = cs.getPropertyValue("--fg-soft").trim();

  const rnd = SC.rng(Number(cfg.seed) || 5);
  const edges = [];
  for (let i = 0; i < layers.length - 1; i++) {
    nodes[i].forEach((a) => nodes[i + 1].forEach((b) => edges.push({ a, b, w: 0.12 + rnd() * 0.88, layer: i })));
  }
  const center = (el) => {
    const s = stage.getBoundingClientRect(), b = el.getBoundingClientRect();
    return { x: b.left - s.left + b.width / 2, y: b.top - s.top + b.height / 2 };
  };

  const pulses = [];
  let alive = true, clock = 0;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  r.spawn(r.raf((dt, tt) => {
    clock = tt;
    const w = stage.clientWidth, h = stage.clientHeight;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (const e of edges) {
      const A = center(e.a), B = center(e.b);
      ctx.strokeStyle = soft; ctx.globalAlpha = 0.08 + e.w * 0.28; ctx.lineWidth = 0.6 + e.w * 2.2;
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      e.A = A; e.B = B;
    }
    ctx.globalAlpha = 1; ctx.fillStyle = accent;
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i], t = SC.clamp((clock - p.t0) / p.dur, 0, 1);
      const e = p.edge;
      if (!e.A || clock < p.t0) continue;
      const x = e.A.x + (e.B.x - e.A.x) * t, y = e.A.y + (e.B.y - e.A.y) * t;
      ctx.globalAlpha = 0.35 + e.w * 0.65;
      ctx.beginPath(); ctx.arc(x, y, 3.2 + e.w * 2.4, 0, 7); ctx.fill();
      if (t >= 1) { pulses.splice(i, 1); if (!p.done) { p.done = true; p.onArrive && p.onArrive(); } }
    }
    ctx.globalAlpha = 1;
    return alive;
  }));

  const fast = SC.reduce;
  const pulseMs = fast ? 1 : SC.clamp(Number(cfg.pulseMs) || 900, 300, 4000);
  await r.wait(fast ? 0 : 600);
  nodes[0].forEach((n) => n.classList.add("lit"));
  for (let i = 0; i < layers.length - 1; i++) {
    const arrived = [];
    edges.filter((e) => e.layer === i).forEach((e, k) => {
      pulses.push({ edge: e, t0: clock + (fast ? 0 : k * 0.018), dur: pulseMs / 1000,
        onArrive: () => { e.b.classList.add("lit", "hot"); setTimeout(() => e.b.classList.remove("hot"), 260); } });
      arrived.push(pulseMs + k * 18);
    });
    await r.wait(Math.max(...arrived) + 120);
  }

  /* 输出层：显示概率，点亮最大的那个 */
  const out = layers[layers.length - 1].nodes;
  let best = 0;
  out.forEach((n, i) => { if ((n.value ?? 0) > (out[best].value ?? 0)) best = i; });
  nodes[nodes.length - 1].forEach((el, i) => {
    const p = el.querySelector(".prob");
    if (p && out[i].value != null) p.textContent = Math.round(out[i].value * 100);
    el.classList.add("show");
  });
  await r.wait(fast ? 0 : 300);
  const win = nodes[nodes.length - 1][best];
  win.classList.add("win");
  const badge = SC.$("#badge", stage);
  badge.textContent = `${out[best].label || "结果"} · ${Math.round((out[best].value ?? 1) * 100)}%`;
  const s = stage.getBoundingClientRect(), b = win.getBoundingClientRect();
  badge.style.left = (b.right - s.left + 14) + "px";
  badge.style.top = (b.top - s.top + b.height / 2 - badge.offsetHeight / 2) + "px";
  badge.classList.add("on");
  alive = false;
});
