/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark。色块取该主题的三个强调色
 *   eyebrow    标题上方的小字，可省略
 *   title      居中大标题，可省略（省略则只有背景）
 *   subtitle   标题下的说明，可省略
 *   blobs      色块数量，2 到 9，默认 5。依次取 accent、accent-2、accent-3 循环
 *   speed      漂移速度倍数，默认 1；0 为静止；也受右下角倍速影响
 *   blur       柔和程度，0.5 到 2，默认 1；越大色块越散、混合越均匀
 *   grain      噪点强度，0 到 0.5，默认 0.14；0 关闭
 *   seed       随机种子（决定色块的起点与轨迹），默认 7
 *   画面为静态噪点叠加，不闪烁；系统开启「减少动态效果」时只渲染一帧。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "Product Launch 2025",
  title: "把想法，变成可以触摸的未来",
  subtitle: "从灵感到上线，只需要一个下午。",
  blobs: 5,
  speed: 1,
  blur: 1,
  grain: 0.14,
  seed: 7
};
