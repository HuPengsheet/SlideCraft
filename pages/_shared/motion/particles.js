(() => {
  const { tau, unit, smooth, line, dot, label, grid } = SC.motionDraw;
  const palette = (colors) => [colors.ink, colors.alt, colors.cool];

  SC.motion = {
    "firework-burst": ({ ctx, t, colors, cfg, noise }) => {
      const p = t / cfg.duration;
      const inks = palette(colors);
      for (let j = 0; j < 4; j++) {
        const x = 102 + j * 132, y = 104 + noise[j] * 98;
        const age = (p - j * .13) * 2.25;
        if (age < 0 || age > 1) continue;
        if (age < .23) {
          const top = SC.lerp(387, y, age / .23);
          line(ctx, [[x, top + 38], [x, top]], inks[j % 3], 3);
          dot(ctx, x, top, 5, colors.fg);
          continue;
        }
        const f = (age - .23) / .77;
        for (let i = 0; i < 64; i++) {
          const a = i * tau / 64;
          const speed = 49 + noise[20 + j * 64 + i] * 68;
          const dx = Math.cos(a) * speed, dy = Math.sin(a) * speed;
          const position = (u) => [x + dx * Math.sqrt(u), y + dy * Math.sqrt(u) + 88 * u * u];
          const point = position(f);
          ctx.globalAlpha = 1 - f;
          line(ctx, [position(Math.max(0, f - .13)), point], inks[(i % 7 === 0 ? j + 1 : j) % 3], 1.6);
          dot(ctx, ...point, 1.8, colors.fg);
        }
        ctx.globalAlpha = 1;
      }
    },

    "particle-vortex": ({ ctx, t, colors, cfg, noise }) => {
      const phase = t / cfg.duration * tau;
      const inks = palette(colors);
      for (let i = 0; i < 302; i++) {
        const arm = i % 4;
        const a = (noise[i * 3] - .5) * .55 + phase + arm * tau / 4;
        const p = (noise[i * 3 + 1] + phase / tau) % 1;
        const r = 3 + p * p * 262;
        const angle = a + (1 - p) * 6.5;
        ctx.globalAlpha = Math.sin(p * Math.PI) * .8;
        dot(ctx, 300 + r * Math.cos(angle), 200 + r * Math.sin(angle) * .68, 1 + 3 * p * noise[i * 3 + 2], inks[arm % 3]);
      }
      ctx.globalAlpha = 1;
      dot(ctx, 300, 200, 5, colors.fg);
    },

    "pixel-dissolve": ({ ctx, t, colors, cfg, noise }) => {
      grid(ctx, colors.line, 36);
      const p = smooth(t / cfg.duration);
      const inks = palette(colors);
      for (let i = 0; i < 480; i++) {
        const x = (i % 24 - 11.5) * 12;
        const y = (Math.floor(i / 24) - 9.5) * 12;
        if (Math.abs(x) + Math.abs(y) > 154) continue;
        const f = smooth((p - .18 - noise[i] * .41) * 2.9);
        const dx = (90 + noise[480 + i] * 220) * f;
        ctx.globalAlpha = 1 - f;
        ctx.fillStyle = inks[Math.floor((x + 156) / 36) % 3];
        ctx.fillRect(280 + x + dx, 200 + y - f * (x * .35 + 65), 10 * (1 - f * .6), 10 * (1 - f * .6));
      }
      ctx.globalAlpha = 1;
      label(ctx, "PARTICLE LOSS  /  " + Math.round(unit((p - .18) / .82) * 100) + "%", 26, 369, colors.soft);
    },

    "star-warp": ({ ctx, t, colors, cfg, noise }) => {
      const phase = t / cfg.duration;
      const inks = palette(colors);
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, 600, 400);
      for (let i = 0; i < 206; i++) {
        const a = noise[i * 3] * tau;
        const z = (noise[i * 3 + 1] + phase * (1 + i % 2)) % 1;
        const r = 14 + z * z * 455, tail = r * (.75 - z * .32);
        const x = Math.cos(a), y = Math.sin(a) * .73;
        ctx.globalAlpha = Math.sin(z * Math.PI) * .86;
        line(ctx, [[300 + x * tail, 194 + y * tail], [300 + x * r, 194 + y * r]], inks[i % 3], .6 + z * 3);
        dot(ctx, 300 + x * r, 194 + y * r, .8 + z * 1.8, colors.fg);
      }
      ctx.globalAlpha = 1;
    },

    "particle-fountain": ({ ctx, t, colors, cfg, noise }) => {
      const phase = t / cfg.duration;
      const inks = palette(colors);
      line(ctx, [[105, 328], [495, 328]], colors.line, 2);
      for (let i = 0; i < 272; i++) {
        const p = (phase * 3 + noise[i * 3]) % 1;
        const x = (noise[i * 3 + 1] - .5) * 448 * p;
        const y = 328 - (94 + noise[i * 3 + 2] * 172) * 4 * p * (1 - p);
        ctx.globalAlpha = 1 - p * .76;
        dot(ctx, 300 + x, y, 1.3 + 2 * (1 - p), inks[i % 3]);
      }
      ctx.globalAlpha = 1;
      dot(ctx, 300, 328, 7, colors.fg);
    }
  };
})();
