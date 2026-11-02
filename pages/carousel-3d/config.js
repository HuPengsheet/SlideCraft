/* 只改这个文件。字段说明：
 *   theme       dark | light | paper | neon | terminal，默认 dark
 *   title       左上角标题，可省略
 *   eyebrow     标题上方的小字，可省略
 *   style       "coverflow"（中间大图，两侧斜靠）| "ring"（圆柱环绕），默认 coverflow
 *   items[]     3 到 12 项效果最好
 *                 src    图片或视频路径（必填；.mp4/.webm/.mov 按视频处理，其余按图片）
 *                 title  标题，显示在下方
 *                 note   说明，可省略
 *   autoMs      自动切换间隔，毫秒，默认 3200；0 关闭
 *   startIndex  起始项，从 0 开始，默认 0
 *   操作：左右方向键、点击两侧卡片、拖动或滑动。操作后自动切换会暂停一会儿再恢复。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "Gallery",
  title: "海报精选",
  style: "coverflow",
  autoMs: 3200,
  startIndex: 2,
  items: [
    { src: "../gallery/img/bold-poster.webp", title: "Bold Poster", note: "大字号、高对比的活动海报" },
    { src: "../gallery/img/editorial-forest.webp", title: "Editorial Forest", note: "杂志风排版，森林绿主色" },
    { src: "../gallery/img/neo-grid-bold.webp", title: "Neo Grid", note: "网格系统加粗体标题" },
    { src: "../gallery/img/retro-zine.webp", title: "Retro Zine", note: "复古小报拼贴" },
    { src: "../gallery/img/sakura-chroma.webp", title: "Sakura Chroma", note: "樱花渐变色板" },
    { src: "../gallery/img/studio.webp", title: "Studio", note: "极简工作室主页" },
    { src: "../gallery/img/vellum.webp", title: "Vellum", note: "半透明纸张质感" },
    { src: "../gallery/img/biennale-yellow.webp", title: "Biennale Yellow", note: "双年展视觉，明黄底色" }
  ]
};
