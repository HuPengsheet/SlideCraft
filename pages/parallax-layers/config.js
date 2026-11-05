/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow    标题上方小标签（可省略）
 *   title      大标题（可省略）
 *   subtitle   副标题（可省略）
 *   titleDepth 标题层的深度，默认 0.55
 *   auto       鼠标不动时是否自动漂移，默认 true（系统开启“减少动态效果”时不漂移）
 *   strength   整体位移强度，单位 em，0 到 4，默认 2.6。每层位移 = depth × strength
 *   seed       示例风景的随机种子，默认 11（只在没有配置 layers 时使用）
 *   layers[]   从最远到最近依次叠放；留空则用主题色自动画一幅分层山景
 *     src      图片路径（png jpg webp gif mp4 webm 均可）。想要上层透出下层，请用带透明通道的 png/webp；加载失败显示占位
 *     depth    深度 0 到 1.3，0 不动，越大移动越多，默认按顺序从 0.1 渐增
 *     fit      cover | contain，默认 cover
 *     opacity  透明度 0 到 1，默认 1
 *     blur     模糊，单位 em，默认 0（可给远景一点模糊增加纵深）
 * 操作：鼠标在舞台上移动，各层按各自深度反向位移。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "纵深",
  title: "站在山的这一边",
  subtitle: "移动鼠标，远山与近林各走各的。",
  titleDepth: 0.55,
  auto: true,
  strength: 2.6,
  seed: 11,
  layers: []
};
