/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   title      顶部大标题，可省略
 *   subtitle   标题下方的小字，可省略
 *   device     "laptop"（笔记本）| "phone"（手机）| "tv"（电视），默认 laptop
 *   src        屏幕里播放的单个素材，png/jpg/webp/gif 或 mp4/webm（视频自动静音循环）。
 *              写了 src 就不再使用 images
 *   images[]   没有 src 时按顺序轮播的图片/视频路径（字符串数组），每张停留 holdMs 后淡入下一张，
 *              播完一遍停在最后一张。都没写时屏幕显示占位界面
 *   holdMs     轮播每张停留毫秒，默认 2600
 *   tilt       {x, y} 外框的 3D 倾斜角度（度），默认 {x:5, y:-12}，鼠标移动时会再微调。设 {x:0,y:0} 为正对
 *   float      外框是否上下轻微浮动，默认 true
 *   callouts[] 指向屏幕区域的标注线
 *     x, y     标注点在屏幕里的位置，百分比 0 到 100
 *     label    标注文字，支持 **粗体**；x 小于 50 时文字在左侧，否则在右侧。同侧标注的 y 相差 15 以上不会重叠
 *     slide    可选，只在第几张图（从 0 开始）时出现；不写则一直显示
 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "一块屏幕，讲清一个产品",
  subtitle: "设备外框里播放真实界面，标注线指向关键区域",
  device: "laptop",
  holdMs: 2800,
  images: [
    "../gallery/img/soft-editorial.webp",
    "../gallery/img/coral.webp",
    "../gallery/img/vellum.webp"
  ],
  callouts: [
    { x: 22, y: 32, label: "**标题区**：一眼看到主题", slide: 0 },
    { x: 78, y: 70, label: "**配色**：跟随主题变量", slide: 0 },
    { x: 30, y: 62, label: "**版式**：留白充足", slide: 1 },
    { x: 74, y: 28, label: "**图形**：与文字呼应", slide: 1 },
    { x: 50, y: 50, label: "**导出**：一键生成", slide: 2 }
  ]
};
