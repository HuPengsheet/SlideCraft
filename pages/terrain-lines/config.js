/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow    标题上方小字，可省略
 *   title      左上角标题，可省略
 *   subtitle   标题下的说明，可省略
 *   lines      折线条数，8 到 80，默认 38
 *   amplitude  山峰高度倍数，默认 1；0 为平线；上限 3
 *   speed      向前流动的速度，每秒经过的线条数，默认 1.2；0 静止（受倍速影响）
 *   seed       地形种子，默认 11；同一个种子地形相同
 *   后面的线被前面的线遮挡（用背景色填充实现）。系统开启「减少动态效果」时只渲染一帧。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "Signal Landscape",
  title: "在噪声之中，看见山脉",
  subtitle: "三十八条线，一座不会停下的山。",
  lines: 38,
  amplitude: 1,
  speed: 1.2,
  seed: 11
};
