/* Canvas 绘图小件，由各分类的绘制函数共用。 */
(() => {
  const tau = 2 * Math.PI;
  const unit = (v) => SC.clamp(v, 0, 1);
  const smooth = (v) => { const p = unit(v); return p * p * (3 - 2 * p); };

  function path(ctx, points, close = false) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    if (close) ctx.closePath();
  }
  function line(ctx, points, color, width = 1) {
    path(ctx, points);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  function polygon(ctx, points, color) {
    path(ctx, points, true);
    ctx.fillStyle = color;
    ctx.fill();
  }
  function dot(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, tau);
    ctx.fillStyle = color;
    ctx.fill();
  }
  function box(ctx, x, y, w, h, radius, color) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fillStyle = color;
    ctx.fill();
  }
  function label(ctx, value, x, y, color, size = 13, align = "left") {
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.font = `600 ${size}px ui-monospace, monospace`;
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
  }
  function grid(ctx, color, spacing = 32) {
    ctx.beginPath();
    for (let x = 12; x < 600; x += spacing) { ctx.moveTo(x, 0); ctx.lineTo(x, 400); }
    for (let y = 8; y < 400; y += spacing) { ctx.moveTo(0, y); ctx.lineTo(600, y); }
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  SC.motionDraw = { tau, unit, smooth, path, line, polygon, dot, box, label, grid };
})();
