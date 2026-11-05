/* 只改这个文件。字段说明：
 *   theme       dark | light | paper | neon | terminal，默认 dark
 *   eyebrow     标题上方小字，可省略
 *   title       左下角标题，可省略
 *   subtitle    标题下的说明，可省略
 *   gridSize    点阵每行的圆点数，12 到 120，默认 64；行数按 16:9 自动算，总数上限 6000
 *   origin      波的发源点："center"（默认）| "mouse"（跟随鼠标位置）| { x: 0到1, y: 0到1 }（舞台比例）
 *   speed       波速，每秒扩散的距离占舞台宽度的比例，默认 0.35
 *   autoPulse   自动发波间隔，毫秒，默认 1600；0 关闭（受倍速影响）
 *   点击舞台任意位置会在该点发出一个波，多个波可以叠加。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "Signal",
  title: "每一次触达，都有回响",
  subtitle: "点击画面，看涟漪向外扩散。",
  gridSize: 64,
  origin: "center",
  speed: 0.35,
  autoPulse: 1600
};
