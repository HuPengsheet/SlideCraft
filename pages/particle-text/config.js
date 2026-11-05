/* 只改这个文件。字段说明：
 *   theme          dark | light | paper | neon | terminal，默认 dark
 *   text           要成字的文字，可用 \n 换行，默认 "SlideCraft"
 *   caption        文字下方的小字，可省略
 *   particleCount  粒子数上限，默认 0 表示按舞台面积自动（约 1500 到 4500）
 *   size           字号，单位 em（1em 约为舞台宽度的 1.6%），默认 14；过长的文字会自动缩小以适应
 *   scatter        鼠标排斥半径，单位 em，默认 9；设为 0 关闭交互
 *   seed           随机种子，默认 7，相同种子起点一致 */
window.PAGE_CONFIG = {
  theme: "dark",
  text: "让想法\n粒子般汇聚",
  caption: "移动鼠标，打散它们",
  particleCount: 0,
  size: 14,
  scatter: 9,
  seed: 7
};
