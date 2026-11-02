/* 只改这个文件。字段说明：
 *   theme        dark | light | paper | neon | terminal
 *   orientation  "horizontal"（左右对比，默认）| "vertical"（上下对比）
 *   start        分隔线初始位置 0 到 100（百分比），默认 50
 *   sweep        加载与重播时是否自动扫一遍，默认 true；扫动期间用户一碰就接管
 *   before / after   { src, label, filter? }  单组对比；src 为 png/jpg/webp/gif 或 mp4/webm
 *                    filter 可选，CSS 滤镜如 "grayscale(1)"，同一张图做前后效果时很方便
 *   pairs[]      多组对比，写了就忽略上面的 before/after。每项：
 *                { before:{src,label}, after:{src,label}, title?, orientation? }
 *                多组时下方出现左右箭头（键盘 左右键 也可切换） */
window.PAGE_CONFIG = {
  theme: "dark",
  orientation: "horizontal",
  start: 50,
  sweep: true,
  pairs: [
    { title: "配色升级",
      before: { src: "../gallery/img/retro-zine.webp", label: "旧版" },
      after: { src: "../gallery/img/sakura-chroma.webp", label: "新版" } },
    { title: "去色预览",
      before: { src: "../gallery/img/coral.webp", label: "灰度", filter: "grayscale(1) contrast(1.1)" },
      after: { src: "../gallery/img/coral.webp", label: "原图" } },
    { title: "上下对比", orientation: "vertical",
      before: { src: "../gallery/img/vellum.webp", label: "草稿" },
      after: { src: "../gallery/img/studio.webp", label: "定稿" } }
  ]
};
