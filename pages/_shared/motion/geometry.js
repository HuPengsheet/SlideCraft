(() => {
  const { tau, smooth, unit, line, polygon, dot, label, grid, path } = SC.motionDraw;
  function radialPoints(count, fn) {
    return Array.from({ length: count }, (_, i) => fn(tau * i / count, i));
  }

  SC.motion = {
    "shape-morph": ({ ctx, t, colors, cfg }) => {
      grid(ctx, colors.line, 42);
      const phase = Math.min(t / cfg.duration * 3, 2.999);
      const shapes = [3, 4, 6, 32];
      const index = Math.floor(phase);
      const p = smooth(phase % 1);
      function radius(a, n) {
        return 130 * Math.cos(Math.PI / n) / Math.cos(a % (tau / n) - Math.PI / n);
      }
      for (let layer = 5; layer >= 0; layer--) {
        const points = radialPoints(192, (a) => {
          const r = SC.lerp(radius(a, shapes[index]), radius(a, shapes[index + 1]), p) * (1 + layer * .12);
          return [300 + Math.sin(a) * r, 190 - Math.cos(a) * r];
        });
        path(ctx, points, true);
        ctx.globalAlpha = layer ? .65 - layer * .09 : 1;
        ctx.strokeStyle = layer % 2 ? colors.cool : colors.ink;
        ctx.lineWidth = layer ? 1.4 : 3;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      label(ctx, shapes[index] + "  →  " + (index === 2 ? "∞" : shapes[index + 1]), 300, 190, colors.fg, 25, "center");
    },

    "harmonic-curve": ({ ctx, t, colors, cfg }) => {
      grid(ctx, colors.line, 32);
      const phase = t / cfg.duration * tau + .4;
      const point = (a) => [300 + 216 * Math.sin(3 * a + phase), 200 + 143 * Math.sin(2 * a)];
      const count = Math.ceil(480 * Math.min(1, .22 + t * 1.1 / cfg.duration));
      line(ctx, Array.from({ length: count + 1 }, (_, i) => point(tau * i / 480)), colors.ink, 2.5);
      dot(ctx, ...point(tau * count / 480), 7, colors.fg);
      label(ctx, "X:Y  /  3:2", 26, 32, colors.cool);
    },

    "spirograph": ({ ctx, t, colors, cfg }) => {
      const count = Math.ceil(800 * (.08 + .92 * smooth(t / cfg.duration)));
      const point = (a) => [
        300 + 102 * Math.cos(a) + 59 * Math.cos(a * 17 / 6),
        200 + 102 * Math.sin(a) - 59 * Math.sin(a * 17 / 6)
      ];
      for (let j = 0; j < count; j += 40) {
        const n = Math.min(40, count - j);
        line(ctx, Array.from({ length: n + 1 }, (_, i) => point((j + i) / 800 * tau * 6)),
          [colors.ink, colors.alt, colors.cool][Math.floor(j / 40) % 3], 2);
      }
      dot(ctx, ...point(count / 800 * tau * 6), 5, colors.fg);
      label(ctx, "ROULETTE  /  17:6", 25, 30, colors.soft);
    },

    "kaleidoscope": ({ ctx, t, colors, cfg }) => {
      ctx.save();
      ctx.translate(300, 200);
      const phase = t / cfg.duration * tau;
      for (let i = 0; i < 12; i++) {
        ctx.save();
        ctx.rotate(i * tau / 12);
        if (i % 2) ctx.scale(1, -1);
        for (let j = 0; j < 5; j++) {
          const r = 27 + j * 34 + 14 * Math.sin(phase + j);
          const h = r * .25;
          ctx.globalAlpha = .65 + .27 * Math.sin(j + phase);
          polygon(ctx, [[r - 19, 0], [r + 16, -h], [r + 40, 0], [r + 16, h]], [colors.ink, colors.alt, colors.cool][j % 3]);
          ctx.globalAlpha = 1;
          line(ctx, [[r, 0], [r + 28, h * .4], [r + 45, 0]], colors.bg, 1.5);
        }
        ctx.restore();
      }
      ctx.restore();
      dot(ctx, 300, 200, 7, colors.fg);
    },

    "recursive-tree": ({ ctx, t, colors, cfg }) => {
      const progress = unit(t / cfg.duration);
      function branch(x, y, a, length, level) {
        const p = smooth(progress * 8.6 - level);
        if (p === 0 || level === 8) return;
        const end = [x + length * p * Math.cos(a), y + length * p * Math.sin(a)];
        line(ctx, [[x, y], end], [colors.ink, colors.alt, colors.cool][Math.floor(level / 2) % 3], 8 * Math.pow(.73, level));
        if (level >= 6) dot(ctx, ...end, p * 2.6, colors.fg);
        if (p === 1) {
          branch(...end, a - .45 - .08 * Math.sin(t), length * .73, level + 1);
          branch(...end, a + .53 + .09 * Math.sin(t), length * .70, level + 1);
        }
      }
      line(ctx, [[33, 354], [567, 354]], colors.line);
      branch(300, 354, -Math.PI / 2, 100, 0);
      label(ctx, "RECURSION  /  " + Math.min(8, Math.ceil(progress * 8.6)), 28, 31, colors.soft);
    }
  };
})();
