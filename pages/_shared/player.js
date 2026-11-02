/* SlideCraft pages · player.js
 * 播放器 + 初始化。依赖 core.js。
 *
 * 页面写法：
 *   const { cfg, player, stage } = SC.init(DEFAULTS);   // DEFAULTS 与 window.PAGE_CONFIG、URL 参数合并
 *   player.play(async (r) => {                          // 每次播放/重播都会重新执行
 *     stage.innerHTML = "";
 *     await r.wait(500);                                // 支持暂停、倍速、重播中断
 *     await r.raf((dt, t) => t < 2);                    // 逐帧；返回 false 结束
 *   });
 *
 * 只用 CSS 动画的页面不需要 play()，调用 SC.init 即可获得主题、控制条、暂停与倍速（--speed）。
 *
 * URL 参数：theme=light  speed=2  loop=1  controls=0  autoplay=0
 * postMessage（父页面控制 iframe）：iframe.contentWindow.postMessage({sc:"cmd", cmd:"replay"|"pause"|"resume"|"speed", value:2}, "*")
 * 页面播放完毕会向父页面发送 {sc:"done"}，加载完发送 {sc:"ready"}。 */
(() => {
const SC = window.SC;
const SPEEDS = [1, 2, 4, 0.5];

class Player {
  constructor({ speed = 1, loop = false, controls = true, autoplay = true, loopDelay = 3000 } = {}) {
    Object.assign(this, { speed, loop, autoplay, loopDelay, paused: false, epoch: 0, fn: null });
    document.documentElement.style.setProperty("--speed", speed);
    if (controls) this.buildControls();
    this.bindKeys();
    this.bindMessages();
  }

  /* 注册并（默认）立即开始播放 */
  play(fn) { this.fn = fn; if (this.autoplay) this.start(); return this; }

  async start() {
    if (!this.fn) return;
    const e = ++this.epoch;
    this.setPaused(false);
    try {
      await this.fn(this.ctx(e));
      if (e !== this.epoch) return;
      this.emit("done");
      if (this.loop) { await this.ctx(e).wait(this.loopDelay); this.start(); }
    } catch (err) { if (err !== SC.CANCEL) throw err; }
  }

  /* 播放上下文：页面逻辑里所有等待都走它，才能被暂停、倍速、重播控制 */
  ctx(e) {
    const p = this, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const r = {
      get speed() { return p.speed; },
      async wait(ms) {
        await sleep(ms / p.speed);
        while (p.paused) await sleep(80);
        if (e !== p.epoch) throw SC.CANCEL;
      },
      /* 逐帧：fn(dt, t)，dt 与 t 单位为秒，已按倍速缩放、暂停时不走；fn 返回 false 时结束 */
      raf(fn) {
        return new Promise((res, rej) => {
          let last = performance.now(), t = 0;
          const tick = (now) => {
            if (e !== p.epoch) return rej(SC.CANCEL);
            /* rAF 的 now 是本帧起始时间，第一帧可能早于 performance.now()，所以 dt 要夹在 0 以上 */
            let dt = Math.max(0, Math.min((now - last) / 1000, 0.1)); last = now;
            if (!p.paused) { dt *= p.speed; t += dt; if (fn(dt, t) === false) return res(); }
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      /* 不 await 的并发任务用它包一层，被重播中断时不会报未处理的 rejection */
      spawn(promise) { return promise.catch((err) => { if (err !== SC.CANCEL) throw err; }); },
      get live() { return e === p.epoch; }
    };
    return r;
  }

  setPaused(v) {
    this.paused = v;
    document.documentElement.classList.toggle("paused", v);
    if (this.bPause) this.bPause.textContent = v ? "继续" : "暂停";
  }
  setSpeed(s) {
    this.speed = s;
    document.documentElement.style.setProperty("--speed", s);
    if (this.bSpeed) this.bSpeed.textContent = s + "×";
  }
  cycleSpeed() { this.setSpeed(SPEEDS[(SPEEDS.indexOf(this.speed) + 1) % SPEEDS.length] ?? 1); }
  emit(type) { if (parent !== window) parent.postMessage({ sc: type }, "*"); }

  buildControls() {
    const box = SC.el("sc-ctl");
    const mk = (label, fn) => { const b = SC.el("", label, "button"); b.onclick = () => { fn(); b.blur(); }; box.append(b); return b; };
    this.bPause = mk("暂停", () => this.setPaused(!this.paused));
    mk("重播", () => this.start());
    this.bSpeed = mk(this.speed + "×", () => this.cycleSpeed());
    document.body.append(box);
  }
  bindKeys() {
    addEventListener("keydown", (e) => {
      if (/input|textarea|select/i.test(e.target.tagName) || e.metaKey || e.ctrlKey) return;
      if (e.code === "Space") { e.preventDefault(); this.setPaused(!this.paused); }
      else if (e.key === "r" || e.key === "R") this.start();
    });
  }
  bindMessages() {
    addEventListener("message", (e) => {
      const m = e.data; if (!m || m.sc !== "cmd") return;
      if (m.cmd === "replay") this.start();
      else if (m.cmd === "pause") this.setPaused(true);
      else if (m.cmd === "resume") this.setPaused(false);
      else if (m.cmd === "speed") this.setSpeed(+m.value || 1);
    });
  }
}
SC.Player = Player;

/* 初始化：defaults（页面默认）← window.PAGE_CONFIG（config.js）← URL 参数 */
SC.init = (defaults = {}) => {
  const cfg = SC.merge(defaults, window.PAGE_CONFIG || {});
  const q = SC.params;
  if (q.get("theme")) cfg.theme = q.get("theme");
  if (q.get("speed")) cfg.speed = +q.get("speed") || 1;
  if (q.has("loop")) cfg.loop = q.get("loop") !== "0";
  if (q.has("controls")) cfg.controls = q.get("controls") !== "0";
  if (q.has("autoplay")) cfg.autoplay = q.get("autoplay") !== "0";

  const root = document.documentElement;
  root.dataset.theme = cfg.theme || "dark";
  for (const [k, v] of Object.entries(cfg.vars || {})) root.style.setProperty(k.startsWith("--") ? k : "--" + k, v);
  if (cfg.title) document.title = cfg.title;

  const player = new Player(cfg);
  const stage = SC.$(".stage");
  player.emit("ready");
  return { cfg, player, stage };
};
})();
