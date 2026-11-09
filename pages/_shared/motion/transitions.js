(() => {
  const { tau, smooth, unit, line, dot, polygon, label } = SC.motionDraw;

  function scene(ctx, colors, next) {
    const color = next ? colors.cool : colors.ink;
    ctx.fillStyle = next ? colors.surface : colors.bg;
    ctx.fillRect(0, 0, 600, 400);
    ctx.globalAlpha = .16;
    dot(ctx, next ? 408 : 390, next ? 196 : 156, 114, color);
    ctx.globalAlpha = 1;
    for (let i = 0; i < 11; i++) {
      const points = Array.from({ length: 61 }, (_, j) => {
        const x = j * 10;
        const y = next
          ? 251 + i * 14 + 23 * Math.sin(x / 75 + i / 4)
          : 278 + i * 13 - 122 * Math.exp(-Math.pow((x - 386 + i * 9) / 105, 2));
        return [x, y];
      });
      line(ctx, points, color, i === 0 ? 2.5 : 1);
    }
    label(ctx, next ? "B / AFTER" : "A / BEFORE", 34, 43, color);
    ctx.font = "800 76px system-ui, sans-serif";
    ctx.fillStyle = colors.fg;
    ctx.fillText(next ? "TIDE" : "DUNE", 30, 115);
  }

  function wipe(kind) {
    return ({ ctx, t, colors, cfg, noise }) => {
      const p = smooth((t / cfg.duration - .18) / .60);
      scene(ctx, colors, false);
      ctx.save();
      ctx.beginPath();

      if (kind === "iris") {
        ctx.moveTo(314, 190);
        ctx.arc(314, 190, p * 390, 0, tau);
      } else if (kind === "diagonal") {
        const x = p * 860 - 20;
        ctx.moveTo(0, 0);
        ctx.lineTo(x - 180, 0);
        ctx.lineTo(x + 20, 400);
        ctx.lineTo(0, 400);
        ctx.closePath();
      } else if (kind === "tiles") {
        for (let i = 0; i < 60; i++) {
          const x = i % 10 * 60, y = Math.floor(i / 10) * 67;
          const f = smooth((p - noise[i] * .61) / .39);
          ctx.rect(x, y, 60 * f, 67);
        }
      } else {
        for (let i = 0; i < 8; i++) {
          const f = smooth((p - i * .047) / .67);
          ctx.rect(i % 2 ? 600 * (1 - f) : 0, i * 50, 600 * f, 50);
        }
      }
      ctx.clip();
      scene(ctx, colors, true);
      ctx.restore();

      if (kind === "iris" && p > .02 && p < .96) {
        ctx.beginPath();
        ctx.arc(314, 190, p * 390, 0, tau);
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      if (kind === "diagonal" && p > .17 && p < .91) {
        const x = p * 860 - 20;
        line(ctx, [[x - 180, 0], [x + 20, 400]], colors.ink, 4);
      }
    };
  }

  SC.motion = {
    "iris-wipe": wipe("iris"),
    "diagonal-wipe": wipe("diagonal"),
    "tile-wipe": wipe("tiles"),
    "shutter-wipe": wipe("shutter"),

    "page-fold": ({ ctx, t, colors, cfg }) => {
      const p = smooth((t / cfg.duration - .17) / .65);
      scene(ctx, colors, true);
      const edge = 600 * (1 - p);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, edge, 400);
      ctx.clip();
      scene(ctx, colors, false);
      ctx.restore();
      if (p === 0 || p === 1) return;
      const width = Math.min(edge, 126 * Math.sin(Math.PI * p));
      const fold = ctx.createLinearGradient(edge - width, 0, edge + width * .2, 0);
      fold.addColorStop(0, colors.surface);
      fold.addColorStop(.68, colors.ink);
      fold.addColorStop(1, colors.alt);
      ctx.save();
      ctx.globalAlpha = .28 * unit(width / 20);
      polygon(ctx, [[edge, 0], [edge + 42, 0], [edge + 52, 400], [edge - width, 400]], colors.bg);
      ctx.globalAlpha = 1;
      polygon(ctx, [[edge, 0], [edge + width * .2, 325], [edge - width, 400], [edge - width * .65, 80]], fold);
      ctx.restore();
    }
  };
})();
