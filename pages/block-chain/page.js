/* 区块链：区块依次生成，哈希滚动计算后定格，再用链条连到上一个区块，并把上一块的哈希写进 prev 字段。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  title: "区块链",
  eyebrow: "", heading: "", subheading: "",
  startHeight: 0,
  difficulty: 4,
  mineMs: 1400,
  seed: 11,
  blocks: []             // { data, hash }
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const HEX = "0123456789abcdef";
const HLEN = 16;

player.play(async (r) => {
  const blocks = (cfg.blocks || []).slice(0, 5);
  const diff = SC.clamp(Math.round(Number(cfg.difficulty) || 4), 1, 6);
  const rnd = SC.rng(Number(cfg.seed) || 11);
  const randHex = (n) => Array.from({ length: n }, () => HEX[Math.floor(rnd() * 16)]).join("");
  const finals = blocks.map((b) => {
    const h = String(b.hash || "").toLowerCase().replace(/[^0-9a-f]/g, "");
    return h ? h.slice(0, HLEN).padEnd(HLEN, "0") : "0".repeat(diff) + randHex(HLEN - diff);
  });
  const nonces = blocks.map(() => 10000 + Math.floor(rnd() * 89999));
  const h0 = Math.round(Number(cfg.startHeight) || 0);
  const fmt = (h) => {                                            // 开头的 0 高亮
    const m = h.match(/^0*/)[0].length;
    return `<span class="z">${h.slice(0, m)}</span>${h.slice(m)}`;
  };

  const head = (cfg.eyebrow || cfg.heading || cfg.subheading) ? `<div class="hd">
    ${cfg.eyebrow ? `<div class="sc-eyebrow">${SC.esc(cfg.eyebrow)}</div>` : ""}
    ${cfg.heading ? `<h1 class="sc-title">${SC.esc(cfg.heading)}</h1>` : ""}
    ${cfg.subheading ? `<p class="sc-sub">${SC.esc(cfg.subheading)}</p>` : ""}</div>` : "";
  const fit = Math.min(1, 54 / (blocks.length * 11.2 + Math.max(0, blocks.length - 1) * 2.8));
  stage.innerHTML = `${head}<div class="chain" style="font-size:${fit.toFixed(3)}em">${blocks.map((b, i) => `
    ${i ? `<div class="link"><i></i><i></i></div>` : ""}
    <div class="blk sc-card">
      <div class="top"><span class="no">#${h0 + i}</span><span class="st">等待</span></div>
      <div class="data">${SC.esc(b.data)}</div>
      <div class="fld prev"><span class="k">prev</span><span class="v">${i ? "—" : "0".repeat(HLEN)}</span></div>
      <div class="fld nonce"><span class="k">nonce</span><span class="v">0</span></div>
      <div class="fld hash"><span class="k">hash</span><span class="v">${"·".repeat(HLEN)}</span></div>
    </div>`).join("")}</div>`;

  const els = [...stage.querySelectorAll(".blk")], links = [...stage.querySelectorAll(".link")];
  const fast = SC.reduce;
  const mineS = fast ? 0 : SC.clamp(Number(cfg.mineMs) || 1400, 300, 6000) / 1000;
  await r.wait(fast ? 0 : 700);

  for (let i = 0; i < blocks.length; i++) {
    const el = els[i];
    const st = SC.$(".st", el), hv = SC.$(".fld.hash .v", el), nv = SC.$(".fld.nonce .v", el), prev = SC.$(".fld.prev", el);
    if (i) {
      links[i - 1].classList.add("on");
      await r.wait(fast ? 0 : 450);
    }
    el.classList.add("on");
    if (i) { SC.$(".v", prev).innerHTML = fmt(finals[i - 1]); prev.classList.add("lit"); }
    await r.wait(fast ? 0 : 400);
    el.classList.add("mining"); st.textContent = "计算中…";

    /* 哈希滚动：随进度从左往右逐位定格，nonce 同步增长 */
    const fin = finals[i], nonce = nonces[i];
    if (mineS > 0) {
      let acc = 0;
      await r.raf((dt, t) => {
        const p = Math.min(1, t / mineS);
        acc += dt;
        if (acc > 0.045 || p >= 1) {
          acc = 0;
          const fixed = Math.floor(HLEN * Math.pow(p, 1.6));
          hv.textContent = fin.slice(0, fixed) + randHex(HLEN - fixed);
          nv.textContent = Math.floor(nonce * p);
        }
        return p < 1;
      });
    }
    hv.innerHTML = fmt(fin); nv.textContent = nonce;
    el.classList.remove("mining"); el.classList.add("sealed"); st.textContent = "✓ 已上链";
    await r.wait(fast ? 0 : 350);
  }
});
