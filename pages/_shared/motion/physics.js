(() => {
  const { tau, smooth, line, dot, box, label, grid } = SC.motionDraw;
  function shadow(ctx, x, y, width, color) {
    ctx.save();
    ctx.globalAlpha = .25;
    ctx.translate(x, y);
    ctx.scale(1, .16);
    dot(ctx, 0, 0, width, color);
    ctx.restore();
  }

  SC.motion = {
    "spring-settle": ({ ctx, t, colors, cfg }) => {
      grid(ctx, colors.line, 40);
      const response = (x) => 1 - Math.exp(-x * 1.25) * Math.cos(x * 7);
      const elapsed = t * 5 / cfg.duration;
      const px = 95 + 320 * response(elapsed);
      const spring = Array.from({ length: 41 }, (_, i) => [55 + (px - 79) * i / 40, 156 + (i % 2 ? 15 : -15)]);
      line(ctx, spring, colors.ink, 3);
      box(ctx, px - 25, 125, 62, 62, 13, colors.ink);
      line(ctx, [[45, 245], [550, 245]], colors.soft);
      line(ctx, [[45, 285], [550, 285]], colors.line);
      line(ctx, Array.from({ length: 101 }, (_, i) => [45 + i * 5.05, 285 + (1 - response(elapsed * i / 100)) * 38]), colors.cool, 2.5);
      label(ctx, "DAMPED RESPONSE", 45, 358, colors.soft);
    },

    "newtons-cradle": ({ ctx, t, colors, cfg }) => {
      const phase = t / cfg.duration * tau * 2;
      const angles = [-.88 * Math.max(0, Math.cos(phase)), 0, 0, 0, .88 * Math.max(0, -Math.cos(phase))];
      box(ctx, 121, 53, 358, 10, 5, colors.line);
      line(ctx, [[96, 344], [504, 344]], colors.line, 3);
      angles.forEach((a, i) => {
        const x = 208 + i * 46;
        const endX = x + 206 * Math.sin(a);
        const endY = 63 + 206 * Math.cos(a);
        line(ctx, [[x, 63], [endX, endY]], colors.soft, 1.5);
        shadow(ctx, endX, 343, 20, colors.bg);
        dot(ctx, endX, endY, 23, i % 4 === 0 ? colors.ink : colors.cool);
        ctx.globalAlpha = .45;
        dot(ctx, endX - 7, endY - 8, 6, colors.fg);
        ctx.globalAlpha = 1;
      });
      label(ctx, "MOMENTUM EXCHANGE", 300, 374, colors.soft, 12, "center");
    },

    "bounce-squash": ({ ctx, t, colors, cfg }) => {
      grid(ctx, colors.line, 36);
      const phase = t / cfg.duration * 5;
      const p = phase % 1;
      const height = 4 * p * (1 - p) * 178 * Math.pow(.72, Math.floor(phase));
      const impact = Math.pow(Math.abs(p - .5) * 2, 12) * .26;
      const x = 76 + 450 * Math.min(1, phase / 5);
      line(ctx, [[34, 310], [566, 310]], colors.soft, 2);
      for (let i = 0; i < Math.min(5, Math.ceil(phase)); i++) {
        ctx.globalAlpha = .45;
        line(ctx, Array.from({ length: 30 }, (_, j) => {
          const u = j / 29;
          return [76 + (i + u) * 90, 275 - 4 * u * (1 - u) * 178 * Math.pow(.72, i)];
        }), colors.cool, 1.6);
      }
      ctx.globalAlpha = 1;
      shadow(ctx, x, 307, 29 + impact * 48, colors.bg);
      ctx.save();
      ctx.translate(x, 310 - 34 * (1 - impact) - height);
      ctx.scale(1 + impact, 1 - impact);
      dot(ctx, 0, 0, 34, colors.ink);
      dot(ctx, -9, -9, 7, colors.fg);
      ctx.restore();
    },

    "domino-chain": ({ ctx, t, colors, cfg }) => {
      grid(ctx, colors.line, 38);
      const p = t / cfg.duration * 13;
      line(ctx, [[25, 286], [575, 286]], colors.soft, 2);
      for (let i = 11; i >= 0; i--) {
        const tilt = smooth((p - i) / 1.45) * 1.27;
        ctx.save();
        ctx.translate(57 + i * 43, 285);
        ctx.rotate(tilt);
        box(ctx, -9, -112, 17, 112, 5, i % 3 === 0 ? colors.ink : colors.cool);
        dot(ctx, 0, -95, 3, colors.bg);
        ctx.restore();
      }
      label(ctx, String(Math.min(12, Math.floor(p))).padStart(2, "0") + " / 12", 300, 347, colors.ink, 24, "center");
    },

    "magnetic-field": ({ ctx, t, colors, cfg }) => {
      const phase = t / cfg.duration * tau;
      const a = [155 + Math.sin(phase) * 40, 196 - Math.cos(phase) * 59];
      const b = [451 - Math.sin(phase) * 40, 204 + Math.cos(phase) * 59];
      for (let y = 20; y < 400; y += 21) {
        for (let x = 18; x < 600; x += 21) {
          const ax = a[0] - x, ay = a[1] - y, bx = b[0] - x, by = b[1] - y;
          const da = Math.pow(300 + ax * ax + ay * ay, 1.2);
          const db = Math.pow(300 + bx * bx + by * by, 1.2);
          const angle = Math.atan2(ay / da - by / db, ax / da - bx / db);
          const dx = 7 * Math.cos(angle), dy = 7 * Math.sin(angle);
          line(ctx, [[x - dx, y - dy], [x + dx, y + dy]], da < db ? colors.ink : colors.cool, 1.6);
        }
      }
      dot(ctx, ...a, 21, colors.ink);
      dot(ctx, ...b, 21, colors.cool);
      label(ctx, "+", ...a, colors.bg, 21, "center");
      label(ctx, "−", ...b, colors.bg, 21, "center");
    }
  };
})();
