/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal
 *   image      截图路径（也可写 media，.mp4 / .webm 同样支持）
 *   stepMs     每一步停留时间，毫秒，默认 3600
 *   steps[]    x、y、w、h 高亮矩形，占图片宽高的百分比（x、y 为左上角）
 *              title 标题  text 说明（支持 **粗体**）
 *              side 说明卡位置 "left" | "right" | "top" | "bottom"，省略则自动选择
 *   播放结束后可点底部圆点或按 左右方向键 跳转。 */
window.PAGE_CONFIG = {
  theme: "dark",
  image: "../gallery/img/soft-editorial.webp",
  stepMs: 3600,
  steps: [
    { x: 4, y: 8, w: 40, h: 36, title: "先看主视觉", text: "标题与配图决定第一印象，**留白**比装饰更重要。", side: "right" },
    { x: 52, y: 14, w: 42, h: 30, title: "再看信息层级", text: "副标题和正文通过字号与颜色拉开层次。", side: "left" },
    { x: 8, y: 56, w: 34, h: 30, title: "配色与强调", text: "一种强调色贯穿全页，用来引导视线。", side: "top" },
    { x: 58, y: 58, w: 36, h: 28, title: "收尾与行动", text: "最后给读者一个明确的下一步。", side: "top" }
  ]
};
