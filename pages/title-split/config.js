/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   bands      竖带数量，2 到 16，默认 7
 *   direction  up 全部上滑 | down 全部下滑 | alternate 上下交替 | center 中间向外依次，默认 alternate
 *   title      标题，可用 \n 换行
 *   subtitle   副标题，可省略
 *   image      背景图路径，可省略（省略或加载失败时用主题色渐变）
 *   stagger    相邻两条带的启动间隔，毫秒，默认 110 */
window.PAGE_CONFIG = {
  theme: "dark",
  bands: 7,
  direction: "alternate",
  title: "每一页\n都值得被记住",
  subtitle: "SlideCraft · 2026 产品发布会",
  image: "../gallery/img/studio.webp",
  stagger: 110
};
