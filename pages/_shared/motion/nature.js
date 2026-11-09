(() => {
  const { tau, smooth, line, dot, polygon } = SC.motionDraw;
  SC.motion = {
    "ocean-swell": ({ ctx, t, colors, cfg }) => {
      const phase = t / cfg.duration * tau;
      dot(ctx, 449, 103, 43, colors.ink);
      for (let i = 0; i < 10; i++) {
        const wave = Array.from({ length: 91 }, (_, j) => {
          const x = j * 7;
          return [x, 172 + i * 23 + 17 * Math.sin(x / (63 - i * 2) + phase + i) + 6 * Math.sin(x / 19 - phase)];
        });
        polygon(ctx, [...wave, [630, 400], [0, 400]], i % 2 ? colors.bg : colors.surface);
        ctx.globalAlpha = .43 + i * .045;
        line(ctx, wave, i % 4 === 0 ? colors.fg : colors.cool, i % 4 === 0 ? 2.4 : 1.5);
        ctx.globalAlpha = 1;
      }
    },

    "rain-puddles": ({ ctx, t, colors, cfg, noise }) => {
      const phase = t / cfg.duration;
      const ground = ctx.createLinearGradient(0, 132, 0, 400);
      ground.addColorStop(0, colors.surface);
      ground.addColorStop(1, colors.bg);
      ctx.fillStyle = ground;
      ctx.fillRect(0, 0, 600, 400);
      for (let i = 0; i < 76; i++) {
        const seed = i * 4;
        const x = noise[seed] * 660 - 30;
        const floor = 188 + noise[seed + 1] * 202;
        const q = (phase * (2 + i % 3) + noise[seed + 2]) % 1;
        if (q < .68) {
          const y = floor - 460 * (1 - q / .68);
          ctx.globalAlpha = .26 + noise[seed + 3] * .48;
          line(ctx, [[x + 10, y - 29], [x, y]], colors.cool, 1.6);
        } else {
          const p = (q - .68) / .32;
          ctx.globalAlpha = (1 - p) * .72;
          ctx.beginPath();
          ctx.ellipse(x, floor, 1 + p * 31, 1 + p * 8, 0, 0, tau);
          ctx.strokeStyle = i % 4 ? colors.cool : colors.ink;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    },

    "snow-drift": ({ ctx, t, colors, cfg, noise }) => {
      const phase = t / cfg.duration * tau;
      dot(ctx, 439, 100, 41, colors.ink);
      polygon(ctx, [[0, 301], [105, 202], [191, 258], [297, 135], [446, 271], [534, 214], [600, 260], [600, 400], [0, 400]], colors.line);
      polygon(ctx, [[0, 339], [180, 285], [309, 340], [500, 279], [600, 330], [600, 400], [0, 400]], colors.bg);
      for (let i = 0; i < 144; i++) {
        const n = i * 5, depth = noise[n + 2];
        const y = (noise[n + 1] * 460 + phase * (6 + 27 * depth)) % 460 - 30;
        const x = noise[n] * 645 - 22 + (14 + depth * 23) * Math.sin(phase * .55 + y / 82 + n);
        ctx.globalAlpha = .22 + depth * .66;
        dot(ctx, x, y, 1 + depth * depth * 4.5, colors.fg);
      }
      ctx.globalAlpha = 1;
    },

    "petal-bloom": ({ ctx, t, colors, cfg }) => {
      const p = smooth(t / cfg.duration);
      const angle = t / cfg.duration * .44;
      for (let ring = 3; ring >= 0; ring--) {
        const open = smooth(p * 1.65 - (3 - ring) * .18);
        const count = 5 + ring * 3;
        for (let i = 0; i < count; i++) {
          ctx.save();
          ctx.translate(300, 205);
          ctx.rotate(i * tau / count + ring * .35 + angle);
          const r = (42 + ring * 40) * open + 6;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-r * .54, -r * .33, -r * .32, -r * .86, 0, -r);
          ctx.bezierCurveTo(r * .32, -r * .86, r * .54, -r * .33, 0, 0);
          ctx.globalAlpha = .74;
          ctx.fillStyle = [colors.ink, colors.alt, colors.cool][ring % 3];
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = colors.surface;
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.restore();
        }
      }
      for (let i = 0; i < 21; i++) {
        dot(ctx, 300 + 2.9 * Math.sqrt(i) * Math.cos(i * 2.4), 205 + 2.9 * Math.sqrt(i) * Math.sin(i * 2.4), 2, colors.fg);
      }
    },

    "solar-eclipse": ({ ctx, t, colors, cfg }) => {
      const p = smooth(t / cfg.duration);
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, 600, 400);
      const corona = ctx.createRadialGradient(300, 196, 70, 300, 196, 183);
      corona.addColorStop(0, colors.ink);
      corona.addColorStop(.24, colors.alt);
      corona.addColorStop(1, colors.bg);
      dot(ctx, 300, 196, 183, corona);
      ctx.globalAlpha = .5;
      for (let i = 0; i < 87; i++) {
        const a = i * tau / 87;
        const r = 111 + 23 * Math.sin(i * 2.4 + p * 3);
        line(ctx, [[300 + 88 * Math.cos(a), 196 + 88 * Math.sin(a)], [300 + r * Math.cos(a), 196 + r * Math.sin(a)]], colors.ink);
      }
      ctx.globalAlpha = 1;
      dot(ctx, 300, 196, 86, colors.ink);
      dot(ctx, 101 + p * 398, 172 + p * 49, 85, colors.bg);
    }
  };
})();
