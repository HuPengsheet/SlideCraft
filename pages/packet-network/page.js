/* 网络数据包：拓扑图上的数据包沿连线穿梭，经过节点时节点闪一下，丢包变红后重传。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "网络数据包",
  eyebrow: "", heading: "", subheading: "",
  hopMs: 700,
  nodes: [], links: [], traffic: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);

player.play(async (r) => {
  const nodes = (cfg.nodes || []).filter((n) => n && n.id).slice(0, 8);
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const links = (cfg.links || []).filter((l) => byId[l.from] && byId[l.to] && l.from !== l.to).slice(0, 16);
  const traffic = (cfg.traffic || []).filter((t) => (t.path || []).every((id) => byId[id])).slice(0, 10);

  const head = (cfg.eyebrow || cfg.heading || cfg.subheading) ? `<div class="hd">
    ${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}
    ${cfg.heading ? `<h1 class="sc-title">${SC.esc(cfg.heading)}</h1>` : ""}
    ${cfg.subheading ? `<p class="sc-sub">${SC.esc(cfg.subheading)}</p>` : ""}</div>` : "";
  stage.innerHTML = `<canvas></canvas>${head}` + nodes.map((n) => `
    <div class="node kind-${SC.esc(n.kind || "client")}" data-id="${SC.esc(n.id)}" style="left:${SC.clamp(+n.x || 50, 4, 96)}%;top:${SC.clamp(+n.y || 50, 8, 92)}%">
      <div class="box">${SC.esc(n.icon || "●")}</div>
      <div class="name">${SC.esc(n.label || n.id)}</div>
      ${n.sub ? `<div class="sub">${SC.esc(n.sub)}</div>` : ""}
    </div>`).join("") + `<div class="log"></div>`;

  const elOf = Object.fromEntries(nodes.map((n) => [n.id, stage.querySelector(`.node[data-id="${n.id}"]`)]));
  const canvas = SC.$("canvas", stage), ctx = canvas.getContext("2d");
  const cs = getComputedStyle(stage);
  const line = cs.getPropertyValue("--line").trim();
  const accent = cs.getPropertyValue("--accent").trim();
  const bad = cs.getPropertyValue("--bad").trim();
  const center = (id) => {
    const s = stage.getBoundingClientRect(), b = elOf[id].querySelector(".box").getBoundingClientRect();
    return { x: b.left - s.left + b.width / 2, y: b.top - s.top + b.height / 2 };
  };

  const packets = [];
  let alive = true, clock = 0;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  r.spawn(r.raf((dt, tt) => {
    clock = tt;
    const w = stage.clientWidth, h = stage.clientHeight;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = line; ctx.lineWidth = 2; ctx.setLineDash([7, 9]);
    for (const l of links) {
      const a = center(l.from), b = center(l.to);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i], t = SC.clamp((clock - p.t0) / p.dur, 0, 1) * p.end;
      const a = center(p.from), b = center(p.to);
      const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      ctx.globalAlpha = p.lost ? 1 - Math.max(0, t / p.end - 0.6) * 2.2 : 1;
      ctx.fillStyle = p.lost ? bad : accent;
      const s = w / 80;
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = s * 1.2;
      ctx.beginPath(); ctx.roundRect(x - s * 0.7, y - s * 0.5, s * 1.4, s, s * 0.2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      if (t >= p.end) { packets.splice(i, 1); if (!p.done) { p.done = true; p.onArrive && p.onArrive(); } }
    }
    return alive;
  }));

  const log = SC.$(".log", stage);
  const note = (text, cls) => {
    const d = SC.el(cls || "", SC.esc(text));
    log.append(d);
    while (log.children.length > 5) log.firstChild.remove();
  };
  const flash = (id) => { const e = elOf[id]; e.classList.add("flash"); setTimeout(() => e.classList.remove("flash"), 300); };

  const fast = SC.reduce;
  const hopMs = fast ? 1 : SC.clamp(Number(cfg.hopMs) || 700, 200, 4000);
  const hop = (from, to, lost) => new Promise((res) => {
    packets.push({ from, to, t0: clock, dur: hopMs / 1000 * (lost ? 0.6 : 1), end: lost ? 0.55 : 1, lost, onArrive: res });
  });

  await r.wait(fast ? 0 : 500);
  for (const t of traffic) {
    const path = t.path;
    note(`${t.label || "packet"}  ${path[0]} → ${path[path.length - 1]}`);
    let dropped = false;
    for (let i = 0; i < path.length - 1; i++) {
      const lose = t.drop && !dropped && i === path.length - 2;
      await hop(path[i], path[i + 1], lose);
      if (!lose) flash(path[i + 1]);
      if (lose) {
        dropped = true;
        note(`✕ 丢包 ${path[i]} → ${path[i + 1]}，重传`, "bad");
        await r.wait(fast ? 0 : 500);
        for (let j = 0; j < path.length - 1; j++) { await hop(path[j], path[j + 1], false); flash(path[j + 1]); }
        note(`✓ 重传成功`, "good");
        break;
      }
    }
    if (!dropped) note(`✓ 送达 ${path[path.length - 1]}`, "good");
    await r.wait(fast ? 0 : 260);
  }
  alive = false;
});
