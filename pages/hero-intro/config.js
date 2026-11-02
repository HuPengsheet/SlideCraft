/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal
 *   backdrop   背景动效：particles 粒子连线 | gradient 流动色块 | grid 透视网格 | rings 扩散圆环
 *   reveal     标题入场：letter 逐字 | mask 遮罩上滑（默认 letter）
 *   eyebrow    标题上方的小字（可省略）
 *   title      主标题（必填）。用 \n 换行
 *   subtitle   副标题（可省略）
 *   footer     底部小字（可省略）
 *   particles  仅 backdrop=particles：{ count 数量, link 连线距离(占宽度比例), seed 随机种子 }
 *   speed / loop / controls / autoplay 见播放器 */
window.PAGE_CONFIG = {
  theme: "dark",
  backdrop: "particles",
  reveal: "letter",
  eyebrow: "2026 产品发布会",
  title: "让想法\n自己动起来",
  subtitle: "SlideCraft · 用 HTML 做出会呼吸的演示",
  footer: "发布人 · 产品团队    2026.03.18",
  particles: { count: 70, link: 0.14, seed: 7 }
};
