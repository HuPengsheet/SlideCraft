/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow    标题上方的小标签（可省略）
 *   title      左侧大标题（可省略；省略后相片铺满整个舞台）
 *   subtitle   左侧说明（可省略，超过 6 行会被截断）
 *   hint       左下角提示，默认 "点击照片拉到最前"；写 "" 可隐藏
 *   seed       随机种子（整数），默认 7。同一个种子每次播放的位置和角度都一样，换一个数字就换一种散落方式
 *   spread     散乱程度 0 到 1，默认 0.5。0 接近整齐网格，1 角度和偏移最大
 *   stagger    相邻两张抛入的间隔，毫秒，默认 220
 *   photos[]   最多 24 张，超出的忽略
 *     src      图片/视频路径（png jpg webp gif mp4 webm 均可）。缺失或加载失败时显示占位
 *     caption  相片底部的手写说明（可省略，超过两行会被截断）
 * 操作：点击一张把它拉到最前并放大；再点一次放回；点空白处或按 Esc 也可放回。已拉出过的相片留在上层。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "2024 · 团队旅行",
  title: "那些没被写进周报的日子",
  subtitle: "一次又一次的出差、加班、聚餐，被随手拍下来，散落在同一张桌子上。",
  hint: "点击照片拉到最前",
  seed: 7,
  spread: 0.5,
  stagger: 220,
  photos: [
    { src: "../gallery/img/coral.webp", caption: "清晨的第一杯咖啡" },
    { src: "../gallery/img/daisy-days.webp", caption: "雏菊开了" },
    { src: "../gallery/img/studio.webp", caption: "工作室的下午" },
    { src: "../gallery/img/sakura-chroma.webp", caption: "樱花季" },
    { src: "../gallery/img/vellum.webp", caption: "旧书店" },
    { src: "../gallery/img/editorial-forest.webp", caption: "森林里迷路" },
    { src: "../gallery/img/capsule.webp", caption: "胶囊旅馆" },
    { src: "../gallery/img/retro-zine.webp", caption: "自己印的小册子" },
    { src: "../gallery/img/pink-script.webp", caption: "粉色手写" }
  ]
};
