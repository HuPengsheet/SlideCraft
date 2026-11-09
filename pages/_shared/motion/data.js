(() => {
  const { unit, smooth, dot, box, line, label, polygon } = SC.motionDraw;
  const inks = (colors) => [colors.ink, colors.alt, colors.cool];
  function axes(ctx, colors, xAxis, yAxis) {
    for (let i = 0; i < 5; i++) {
      const y = 64 + i * 65;
      line(ctx, [[64, y], [555, y]], colors.line);
      if (yAxis[i] !== undefined) label(ctx, yAxis[i], 53, y, colors.soft, 12, "right");
    }
    xAxis.forEach((text, i) => {
      label(ctx, text, 76 + i * 467 / Math.max(1, xAxis.length - 1), 352, colors.soft, 12, "center");
    });
  }

  SC.motion = {
    "bubble-evolution": ({ ctx, t, colors, cfg, noise }) => {
      axes(ctx, colors, ["0", "25", "50", "75", "100"], ["100", "75", "50", "25", "0"]);
      const p = smooth(t / cfg.duration);
      const colorset = inks(colors);
      for (let i = 0; i < 25; i++) {
        const x = 92 + noise[i * 4] * 291, y = 110 + noise[i * 4 + 1] * 189;
        const endX = x + 22 + noise[i * 4 + 2] * 132;
        const endY = y - 21 - noise[i * 4 + 3] * 60;
        const bx = SC.lerp(x, endX, p), by = SC.lerp(y, endY, p);
        const color = colorset[i % 3];
        ctx.globalAlpha = .52;
        line(ctx, [[x, y], [bx, by]], color);
        dot(ctx, bx, by, 5 + noise[130 + i] * (11 + p * 13), color);
        ctx.globalAlpha = 1;
        dot(ctx, bx, by, 2, colors.fg);
      }
      label(ctx, String(2019 + Math.floor(p * 6)), 546, 29, colors.ink, 21, "right");
    },

    "waterfall-bridge": ({ ctx, t, colors, cfg }) => {
      const labels = ["START", "+42", "−18", "+32", "−12", "TOTAL"];
      axes(ctx, colors, [], ["160", "120", "80", "40", "0"]);
      const values = [62, 42, -18, 32, -12, 106];
      let sum = 0;
      values.forEach((value, i) => {
        const x = 82 + i * 79;
        const start = i === 5 ? 0 : sum;
        const p = smooth(t / cfg.duration * 7.2 - i);
        const y = 324 - start * 1.625;
        const end = y - value * 1.625 * p;
        const color = i % 5 === 0 ? colors.cool : value > 0 ? colors.ink : colors.alt;
        box(ctx, x, Math.min(y, end), 50, Math.abs(end - y), 3, color);
        if (i < 5 && p === 1) line(ctx, [[x + 50, end], [x + 79, end]], colors.soft);
        label(ctx, labels[i], x + 25, 352, colors.soft, 12, "center");
        if (p === 1) label(ctx, String(value), x + 25, Math.min(y, end) - 12, color, 13, "center");
        sum += value;
      });
    },

    "candle-tape": ({ ctx, t, colors, cfg, noise }) => {
      axes(ctx, colors, ["09:30", "10:30", "11:30", "12:30", "13:30"], ["104", "102", "100", "98", "96"]);
      const count = 29, progress = .18 + .82 * unit(t / cfg.duration);
      let close = 254;
      for (let i = 0; i < count; i++) {
        const p = smooth(progress * count - i);
        const x = 72 + i * 16.8, open = close;
        close = open + (noise[i] - .56) * 53;
        if (p === 0) break;
        const y = SC.lerp(open, close, p);
        const color = close > open ? colors.alt : colors.ink;
        ctx.globalAlpha = p;
        const wick = smooth((p - .42) / .58);
        line(ctx, [[x, Math.min(open, y) - wick * noise[i + 31] * 26], [x, Math.max(open, y) + wick * noise[i + 63] * 26]], color, 1.8);
        box(ctx, x - 4.8, Math.min(open, y), 9.6, Math.max(2, Math.abs(open - y)), 1, color);
        ctx.globalAlpha = 1;
      }
    },

    "streamgraph": ({ ctx, t, colors, cfg }) => {
      axes(ctx, colors, ["JAN", "MAR", "MAY", "JUL", "SEP", "NOV"], []);
      const progress = smooth(.12 + t / cfg.duration * .88);
      const colorset = inks(colors);
      const columns = Array.from({ length: 81 }, (_, i) => {
        const x = i / 80;
        const values = Array.from({ length: 6 }, (_, j) => 12 + 40 * Math.pow(.5 + .5 * Math.sin(x * 8 + j * .88), 2));
        return { x: 65 + x * 490, values, base: 194 - values.reduce((a, b) => a + b, 0) / 2 };
      });
      ctx.save();
      ctx.beginPath();
      ctx.rect(64, 45, 491 * progress, 280);
      ctx.clip();
      for (let j = 0; j < 6; j++) {
        const top = columns.map((c) => [c.x, c.base]);
        const bottom = columns.map((c) => {
          c.base += c.values[j];
          return [c.x, c.base];
        });
        ctx.globalAlpha = .65 + j * .055;
        polygon(ctx, [...top, ...bottom.reverse()], colorset[j % 3]);
      }
      ctx.restore();
      line(ctx, [[64 + 490 * progress, 53], [64 + 490 * progress, 325]], colors.fg, 1.2);
    },

    "waffle-shift": ({ ctx, t, colors, cfg }) => {
      const p = smooth(t / cfg.duration);
      const first = Math.round(26 + p * 31), second = Math.round(49 - p * 18);
      const counts = [first, second, 100 - first - second];
      const colorset = inks(colors);
      for (let i = 0; i < 100; i++) {
        const index = i < first ? 0 : i < first + second ? 1 : 2;
        const x = 55 + i % 10 * 27, y = 63 + Math.floor(i / 10) * 27;
        box(ctx, x, y, 21, 21, 4, colorset[index]);
      }
      counts.forEach((value, i) => {
        const y = 102 + i * 91;
        label(ctx, ["DIRECT", "REFERRAL", "OTHER"][i], 375, y - 20, colors.soft);
        label(ctx, value + "%", 375, y + 12, colorset[i], 38);
      });
    }
  };
})();
