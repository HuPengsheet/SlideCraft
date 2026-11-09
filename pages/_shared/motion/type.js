(() => {
  const { unit, smooth, grid, label, line } = SC.motionDraw;

  function layout(ctx, colors, cfg) {
    grid(ctx, colors.line, 40);
    line(ctx, [[40, 291], [560, 291]], colors.soft);
    label(ctx, "TYPE / " + cfg.effectLabel, 40, 323, colors.soft);
    label(ctx, "Aa", 560, 323, colors.ink, 16, "right");
    ctx.font = "900 104px system-ui, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
  }

  function word(ctx, cfg, y, color) {
    ctx.fillStyle = color;
    ctx.fillText(cfg.text, 300, y, 520);
  }

  SC.motion = {
    "letter-scramble": ({ ctx, t, colors, cfg, noise }) => {
      layout(ctx, colors, cfg);
      const glyphs = "01+/#?X$&%@";
      const text = Array.from(cfg.text).slice(0, 12);
      const tick = Math.floor(t * 14);
      const step = Math.min(76, 494 / Math.max(1, text.length));
      ctx.font = "800 69px ui-monospace, monospace";
      text.forEach((char, i) => {
        const locked = t / cfg.duration > .18 + i / text.length * .56;
        const index = Math.floor(noise[(tick * 11 + i * 17) % noise.length] * glyphs.length);
        const x = 300 + (i - (text.length - 1) / 2) * step;
        ctx.fillStyle = locked ? colors.fg : colors.ink;
        ctx.fillText(locked ? char : glyphs[index], x, 196, step - 4);
        line(ctx, [[x - step * .29, 252], [x + step * .29, 252]], locked ? colors.ink : colors.line, 2);
      });
    },

    "type-weight": ({ ctx, t, colors, cfg }) => {
      layout(ctx, colors, cfg);
      const wave = Math.pow(Math.sin(Math.PI * unit(t / cfg.duration)), 2);
      ctx.save();
      ctx.translate(300, 192);
      ctx.scale(.76 + .25 * wave, 1 + .17 * wave);
      ctx.translate(-300, -192);
      ctx.font = Math.round(250 + 650 * wave) + " 105px system-ui, sans-serif";
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = .7 + 5 * wave;
      ctx.strokeText(cfg.text, 300, 192, 510);
      word(ctx, cfg, 192, colors.fg);
      ctx.restore();
      line(ctx, [[40, 272], [40 + 520 * wave, 272]], colors.ink, 3);
    },

    "type-orbit": ({ ctx, t, colors, cfg }) => {
      layout(ctx, colors, cfg);
      const chars = Array.from(cfg.text).slice(0, 26);
      const phase = t / cfg.duration * Math.PI * 2;
      ctx.font = "800 30px system-ui, sans-serif";
      chars.forEach((char, i) => {
        const a = phase + i * Math.PI * 2 / chars.length;
        const radius = 116 + Math.sin(a * 3 - phase) * 13;
        const slope = 39 * Math.cos(a * 3 - phase);
        const dx = (slope * Math.cos(a) - radius * Math.sin(a)) * 1.7;
        const dy = (slope * Math.sin(a) + radius * Math.cos(a)) * .85;
        ctx.save();
        ctx.translate(300 + Math.cos(a) * radius * 1.7, 160 + Math.sin(a) * radius * .85);
        ctx.rotate(Math.atan2(dy, dx));
        ctx.fillStyle = i % 3 === 0 ? colors.ink : colors.fg;
        ctx.fillText(char, 0, 0);
        ctx.restore();
      });
      label(ctx, "360°", 300, 160, colors.ink, 39, "center");
    },

    "type-echo": ({ ctx, t, colors, cfg }) => {
      layout(ctx, colors, cfg);
      for (let i = 7; i >= 1; i--) {
        const p = smooth((t / cfg.duration - i * .025) / .48);
        ctx.globalAlpha = (1 - i / 9) * .65;
        ctx.strokeStyle = i % 2 ? colors.ink : colors.cool;
        ctx.lineWidth = 1.6;
        ctx.strokeText(cfg.text, 300 + i * 5 * p, 178 + i * 13 * p, 465);
      }
      ctx.globalAlpha = 1;
      word(ctx, cfg, 177, colors.fg);
    },

    "type-underline": ({ ctx, t, colors, cfg }) => {
      layout(ctx, colors, cfg);
      const p = smooth((t / cfg.duration - .12) / .52);
      ctx.font = "italic 900 89px system-ui, sans-serif";
      const width = Math.min(ctx.measureText(cfg.text).width, 495);
      const left = 300 - width / 2;
      ctx.fillStyle = colors.line;
      ctx.fillText(cfg.text, 300, 178, 495);
      ctx.save();
      ctx.beginPath();
      ctx.rect(45, 90, left - 45 + width * p, 151);
      ctx.clip();
      ctx.fillStyle = colors.fg;
      ctx.fillText(cfg.text, 300, 178, 495);
      ctx.restore();
      ctx.lineCap = "round";
      line(ctx, Array.from({ length: 61 }, (_, i) => {
        const q = p * i / 60;
        return [left + q * width, 235 - 15 * q + Math.sin(q * 5) * 5];
      }), colors.ink, 8);
      ctx.lineCap = "butt";
    }
  };
})();
