/* 统一舞台与时间轴。每个分类脚本提供绘制函数，坐标固定为 600 × 400。 */
(() => {
  const { cfg, player, stage } = SC.init({ duration: 5, seed: 42, accent: 1, effectLabel: "" });
  const render = SC.motion[cfg.effect];
  cfg.text = String(cfg.text ?? "");
  const accent = ["--accent", "--accent-2", "--accent-3"][cfg.accent - 1] || "--accent";
  stage.style.setProperty("--motion-ink", `var(${accent})`);
  stage.innerHTML = `
    <header class="motion-copy">
      <div class="motion-kicker">${SC.esc(cfg.category)}</div>
      <h1>${SC.esc(cfg.title)}</h1>
      <p>${SC.esc(cfg.subtitle)}</p>
      ${cfg.hint ? `<p class="motion-hint">${SC.esc(cfg.hint)}</p>` : ""}
    </header>
    <figure class="motion-screen">
      <canvas role="img" aria-label="${SC.esc(cfg.title + " · " + cfg.subtitle)}"></canvas>
      <figcaption><span>${SC.esc(cfg.effectLabel)}</span><span>MOTION STUDIES</span></figcaption>
    </figure>`;

  const canvas = stage.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const style = getComputedStyle(stage);
  const css = (key) => style.getPropertyValue(key).trim();
  const colors = {
    bg: css("--bg"), surface: css("--surface"), line: css("--line"),
    fg: css("--fg"), soft: css("--fg-soft"), ink: css(accent),
    alt: css(accent === "--accent-2" ? "--accent" : "--accent-2"),
    cool: css(accent === "--accent-3" ? "--accent" : "--accent-3")
  };
  const random = SC.rng(cfg.seed);
  const noise = Array.from({ length: 1024 }, random);
  const point = { x: 300, y: 200, active: false, pressed: false, start: -Infinity, clicks: 0 };
  const seconds = Number(cfg.duration);
  const duration = Number.isFinite(seconds) && seconds > 0 ? seconds : 5;
  cfg.duration = duration;
  let time = 0;

  function draw(t) {
    time = t;
    ctx.setTransform(canvas.width / 600, 0, 0, canvas.height / 400, 0, 0);
    ctx.fillStyle = colors.surface;
    ctx.fillRect(0, 0, 600, 400);
    render({ ctx, t, colors, noise, point, cfg });
  }

  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    draw(time);
  }

  if (cfg.hint) {
    canvas.dataset.interactive = "";
    canvas.tabIndex = 0;
    canvas.setAttribute("aria-description", cfg.hint);
    const move = (event) => {
      const bounds = canvas.getBoundingClientRect();
      point.x = SC.clamp((event.clientX - bounds.left) * 600 / bounds.width, 0, 600);
      point.y = SC.clamp((event.clientY - bounds.top) * 400 / bounds.height, 0, 400);
      point.active = true;
    };
    const press = () => {
      point.pressed = true;
      point.start = time;
      point.firstPress ??= time;
      point.origin = { x: point.x, y: point.y };
      point.clicks++;
    };
    const release = () => {
      if (!point.pressed) return;
      point.pressed = false;
      point.released = { x: point.x, y: point.y, t: time };
    };
    canvas.addEventListener("pointermove", (event) => {
      move(event);
      if (SC.reduce) draw(time);
    });
    canvas.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      move(event);
      press();
      canvas.setPointerCapture(event.pointerId);
      if (SC.reduce) draw(time);
    });
    const endPointer = (event) => {
      release();
      if (event.type !== "pointerup" || event.pointerType !== "mouse") point.active = false;
      if (SC.reduce) draw(time);
    };
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);
    canvas.addEventListener("pointerleave", endPointer);
    const directions = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] };
    canvas.addEventListener("keydown", (event) => {
      const delta = directions[event.key];
      if (delta) {
        event.preventDefault();
        point.x = SC.clamp(point.x + delta[0], 0, 600);
        point.y = SC.clamp(point.y + delta[1], 0, 400);
        point.active = true;
      } else if (event.key === "Enter" && !event.repeat) {
        event.preventDefault();
        if (point.pressed) release();
        else {
          press();
          if (!cfg.drag) release();
        }
      } else return;
      if (SC.reduce) draw(time);
    });
    canvas.addEventListener("blur", () => {
      point.active = false;
      release();
      if (SC.reduce) draw(time);
    });
  }

  if (SC.reduce) time = duration * .46;
  resize();
  new ResizeObserver(resize).observe(canvas);
  player.play(async (r) => {
    Object.assign(point, { start: -Infinity, firstPress: null, clicks: 0, pressed: false, released: null });
    draw(SC.reduce ? duration * .46 : 0);
    if (SC.reduce) return;
    await r.raf((_, t) => {
      draw(cfg.hint && !player.loop ? t : Math.min(t, duration));
      return (cfg.hint && !player.loop) || t < duration;
    });
  });
})();
