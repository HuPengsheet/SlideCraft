(() => {
  const { tau, smooth, line, polygon, dot, label, grid } = SC.motionDraw;

  SC.motion = {
    "prism-split": ({ ctx, t, colors, cfg }) => {
      grid(ctx, colors.line, 38);
      const p = smooth(t / cfg.duration * 3);
      polygon(ctx, [[289, 76], [168, 298], [421, 298]], colors.line);
      line(ctx, [[289, 76], [168, 298], [421, 298], [289, 76]], colors.fg, 2.5);
      const x = SC.lerp(24, 216, p);
      line(ctx, [[24, 235], [x, 235]], colors.fg, 3);
      const q = smooth((t / cfg.duration - .27) * 2.6);
      line(ctx, [[216, 235], [SC.lerp(216, 366, q), SC.lerp(235, 203, q)]], colors.ink, 3);
      const ray = smooth((t / cfg.duration - .43) * 2.4);
      for (let i = 0; i < 7; i++) {
        const end = [SC.lerp(366, 600, ray), SC.lerp(203, 97 + i * 29, ray)];
        ctx.globalAlpha = .66;
        line(ctx, [[366, 203], end], `hsl(${14 + i * 42} 80% 58%)`, 3);
      }
      ctx.globalAlpha = 1;
      label(ctx, "01  /  INCIDENT", 24, 352, colors.soft);
      label(ctx, "07  /  SPECTRUM", 574, 352, colors.soft, 13, "right");
    },

    "light-trails": ({ ctx, t, colors, cfg }) => {
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, 600, 400);
      const phase = t / cfg.duration * tau;
      for (let i = 0; i < 6; i++) {
        const color = [colors.ink, colors.alt, colors.cool][i % 3];
        const point = (a) => [300 + (120 + 19 * i) * Math.cos(a), 200 + (73 + 10 * i) * Math.sin(a * 2 + i * .45)];
        const head = phase + i * .74;
        for (let j = 0; j < 28; j++) {
          const u = j / 28;
          ctx.globalAlpha = u * u * .87;
          line(ctx, [point(head - (1 - u) * 1.8), point(head - (1 - u - 1 / 28) * 1.8)], color, 1 + 4 * u);
        }
        ctx.globalAlpha = .15;
        dot(ctx, ...point(head), 17, color);
        ctx.globalAlpha = 1;
        dot(ctx, ...point(head), 4.5, colors.fg);
      }
    },

    "moire-drift": ({ ctx, t, colors, cfg }) => {
      const phase = t / cfg.duration * tau;
      ctx.save();
      ctx.beginPath();
      ctx.arc(300, 200, 162, 0, tau);
      ctx.clip();
      for (let i = -34; i <= 34; i++) {
        const x = 300 + i * 9.5;
        line(ctx, [[x, 16], [x, 384]], colors.ink, 2.2);
      }
      ctx.translate(300, 200);
      ctx.rotate(.11 + .095 * Math.sin(phase));
      ctx.translate(-300, -200);
      ctx.globalAlpha = .71;
      for (let i = -34; i <= 34; i++) {
        const x = 300 + i * 9.7 + 7 * Math.cos(phase);
        line(ctx, [[x, -25], [x, 425]], colors.cool, 2.8);
      }
      ctx.restore();
      ctx.beginPath();
      ctx.arc(300, 200, 164, 0, tau);
      ctx.strokeStyle = colors.fg;
      ctx.lineWidth = 1;
      ctx.stroke();
    },

    "holographic-sweep": ({ ctx, t, colors, cfg }) => {
      const phase = t / cfg.duration * tau;
      const x = 104, y = 80, w = 392, h = 240;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 24);
      ctx.clip();
      const grad = ctx.createLinearGradient(50 + 310 * Math.sin(phase), 0, 535, 370 + 75 * Math.cos(phase));
      [colors.bg, colors.cool, colors.alt, colors.ink, colors.bg].forEach((color, i) => grad.addColorStop(i / 4, color));
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = .3;
      for (let j = 0; j < 33; j++) {
        line(ctx, [[x + j * 20 - 200, y], [x + j * 20, y + h]], colors.fg);
      }
      ctx.globalAlpha = 1;
      label(ctx, "HOLO / 01", 300, 201, colors.fg, 49, "center");
      ctx.restore();
      label(ctx, "ANGLE  " + Math.round(45 * Math.sin(phase)) + "°", 104, 350, colors.soft);
    },

    "chromatic-shift": ({ ctx, t, colors, cfg, noise }) => {
      grid(ctx, colors.line, 32);
      const phase = t / cfg.duration * tau;
      const shift = 22 * Math.pow(Math.sin(phase * 1.5), 4);
      const logo = [[300, 76], [440, 152], [440, 248], [300, 324], [160, 248], [160, 152], [300, 76], [300, 324]];
      [colors.cool, colors.alt, colors.fg].forEach((color, i) => {
        ctx.save();
        ctx.globalAlpha = i < 2 ? .77 : 1;
        ctx.translate((i === 2 ? 0 : i * 2 - 1) * shift, 0);
        line(ctx, logo, color, 3.5);
        line(ctx, [[160, 152], [300, 230], [440, 152]], color, 3);
        ctx.restore();
      });
      ctx.globalAlpha = shift / 35;
      for (let j = 0; j < 12; j++) {
        const x = noise[j * 2] * 390, y = noise[j * 2 + 1] * 320 + 40;
        line(ctx, [[x, y], [x + 55 + shift * 2, y]], j % 2 ? colors.ink : colors.cool, 2);
      }
      ctx.globalAlpha = 1;
    }
  };
})();
