(() => {
  const { tau, unit, smooth, dot, box, line, label, grid } = SC.motionDraw;

  function target(t, cfg, point) {
    if (point.active) return point;
    const phase = t / cfg.duration * tau;
    return { x: 300 + Math.sin(phase) * 161, y: 200 + Math.cos(phase * 2) * 89 };
  }

  SC.motion = {
    "magnetic-cursor": ({ ctx, t, colors, point, cfg }) => {
      const aim = target(t, cfg, point);
      for (let y = 24; y < 400; y += 28) {
        for (let x = 20; x < 600; x += 28) {
          const dx = aim.x - x, dy = aim.y - y;
          const force = Math.exp(-(dx * dx + dy * dy) / 10800);
          dot(ctx, x + dx * force * .53, y + dy * force * .53, 2 + 6 * force,
            force > .36 ? colors.ink : colors.cool);
        }
      }
      ctx.beginPath();
      ctx.arc(aim.x, aim.y, 28, 0, tau);
      ctx.strokeStyle = colors.fg;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    },

    "cursor-spotlight": ({ ctx, t, colors, point, cfg }) => {
      const aim = target(t, cfg, point);
      const beam = ctx.createRadialGradient(aim.x, aim.y, 12, aim.x, aim.y, 139);
      beam.addColorStop(0, colors.ink);
      beam.addColorStop(1, colors.bg);
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, 600, 400);
      dot(ctx, aim.x, aim.y, 139, beam);
      for (let i = 0; i < 60; i++) {
        const x = 48 + i % 10 * 56, y = 52 + Math.floor(i / 10) * 59;
        const p = 1 - unit(Math.hypot(x - aim.x, y - aim.y) / 145);
        ctx.globalAlpha = .12 + p * .88;
        label(ctx, (i * 17 % 256).toString(16).toUpperCase().padStart(2, "0"), x, y, colors.fg, 21, "center");
      }
      ctx.globalAlpha = 1;
    },

    "ink-stamp": ({ ctx, t, colors, point, cfg, noise }) => {
      grid(ctx, colors.line, 36);
      const cycle = (t / cfg.duration) % 1;
      const active = point.start > -Infinity;
      const origin = active ? point.origin : { x: 300 + Math.sin(Math.floor(t / cfg.duration)) * 110, y: 200 };
      const age = active ? (SC.reduce ? .73 : (t - point.start) / 1.45) : cycle * 1.7;
      const p = smooth(age);
      ctx.globalAlpha = (1 - smooth((age - .85) / .75)) * .8;
      for (let i = 0; i < 71; i++) {
        const a = noise[i * 3] * tau;
        const r = Math.pow(noise[i * 3 + 1], 2) * 165 * p;
        const size = (.2 + p * .8) * (3 + 17 * noise[i * 3 + 2] * (1 - r / 180));
        dot(ctx, origin.x + r * Math.cos(a), origin.y + r * Math.sin(a), size, i % 6 === 0 ? colors.alt : colors.ink);
      }
      ctx.globalAlpha = 1;
    },

    "spring-toggle": ({ ctx, t, colors, point, cfg }) => {
      grid(ctx, colors.line, 38);
      const manual = point.start > -Infinity;
      const beat = t * 3 / cfg.duration;
      const index = manual ? Math.floor(point.firstPress * 3 / cfg.duration) + point.clicks : Math.floor(beat);
      const age = manual ? t - point.start : (beat % 1) * cfg.duration / 3;
      const p = SC.reduce ? 1 : 1 - Math.exp(-6 * age) * Math.cos(age * 20);
      const on = index % 2 === 1;
      const x = 300 + (on ? 1 : -1) * (p * 160 - 80);
      box(ctx, 148, 128, 304, 144, 72, colors.bg);
      box(ctx, 152, 132, 296, 136, 68, on ? colors.cool : colors.line);
      dot(ctx, x, 200, 48, colors.fg);
      label(ctx, on ? "ON" : "OFF", 300, 325, colors.ink, 25, "center");
    },

    "elastic-sling": ({ ctx, t, colors, point, cfg }) => {
      grid(ctx, colors.line, 38);
      const phase = t / cfg.duration * tau;
      let x = 300 + 124 * Math.sin(phase) * Math.abs(Math.cos(phase / 2));
      let y = 204 + 92 * Math.sin(phase);
      if (point.pressed) {
        x = point.x;
        y = point.y;
      } else if (point.released) {
        const age = t - point.released.t;
        const force = SC.reduce ? 0 : Math.exp(-3.7 * age) * Math.cos(age * 14);
        x = 300 + (point.released.x - 300) * force;
        y = 204 + (point.released.y - 204) * force;
      }
      line(ctx, [[100, 159], [x, y], [500, 159]], colors.ink, 3.5);
      dot(ctx, 100, 159, 8, colors.cool);
      dot(ctx, 500, 159, 8, colors.cool);
      dot(ctx, x, y, 25, colors.ink);
      dot(ctx, x - 6, y - 6, 6, colors.fg);
      label(ctx, "ELASTIC TENSION", 300, 354, colors.soft, 14, "center");
    }
  };
})();
