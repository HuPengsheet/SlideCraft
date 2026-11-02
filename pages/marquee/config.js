/* 只改这个文件。字段说明：
 *   theme        dark | light | paper | neon | terminal
 *   title        居中标题（可省略）；subtitle 副标题（可省略）
 *   gap          条目间距，单位 em，默认 3
 *   pauseOnHover 鼠标移上去暂停该行，默认 true
 *   fade         左右边缘渐隐，默认 true
 *   rows[]       每一行：
 *     items      字符串 | { text } | { src }（src 可为 png/jpg/webp/gif/mp4/webm）。会自动重复铺满，无需手动凑数
 *     direction  "left"（默认）| "right"
 *     speed      跑完一圈所需秒数，越大越慢，默认 30（播放器倍速会一并作用）
 *     style      "text" 大字（默认）| "pill" 胶囊标签 | "image" 图片卡片。{src} 条目始终按图片显示 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "他们都在用 SlideCraft",
  subtitle: "覆盖产品、设计、教育与咨询团队",
  gap: 3,
  pauseOnHover: true,
  fade: true,
  rows: [
    { style: "text", direction: "left", speed: 40,
      items: ["产品发布", "季度复盘", "融资路演", "课程讲义", "品牌提案", "技术分享", "年会开场"] },
    { style: "pill", direction: "right", speed: 32,
      items: ["动画", "主题", "图表", "时间线", "对比滑块", "终端演示", "浏览器演示", "聊天模拟", "倒计时", "数字滚动"] },
    { style: "image", direction: "left", speed: 55,
      items: [
        { src: "../gallery/img/soft-editorial.webp" }, { src: "../gallery/img/coral.webp" },
        { src: "../gallery/img/vellum.webp" }, { src: "../gallery/img/studio.webp" },
        { src: "../gallery/img/capsule.webp" }, { src: "../gallery/img/bold-poster.webp" }
      ] }
  ]
};
