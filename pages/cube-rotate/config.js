/* 只改这个文件。字段说明：
 *   theme     dark | light | paper | neon | terminal，默认 dark
 *   eyebrow   左上角小字，可省略
 *   title     左上角标题，可省略
 *   size      立方体边长，单位 em（舞台宽度的 1.6%），8 到 30，默认 20
 *   holdMs    每个面停留时间，毫秒，默认 1800（受倍速影响）
 *   turnMs    每次翻转耗时，毫秒，默认 1100
 *   faces[]   最多 6 个面，依次对应 前、右、后、左、上、下；不足 6 个时循环复用，可为空（只显示空白立方体）
 *               title  标题，可省略
 *               text   说明文字，可省略
 *               image  图片或视频路径，可省略；没有 image 时该面显示文字版式
 *   按预设顺序翻完所有面后停在第一面，之后可拖动随意转动，松手后带惯性。拖动期间自动翻转暂停。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "Showcase",
  title: "六个面，六种风格",
  size: 20,
  holdMs: 1800,
  turnMs: 1100,
  faces: [
    { title: "Bold Poster", text: "大字号、高对比的活动海报", image: "../gallery/img/bold-poster.webp" },
    { title: "速度", text: "毫秒级响应，让每一次点击都有回应。" },
    { title: "Editorial Forest", text: "杂志风排版，森林绿主色", image: "../gallery/img/editorial-forest.webp" },
    { title: "安全", text: "端到端加密，默认最小权限。" },
    { title: "Studio", text: "极简工作室主页", image: "../gallery/img/studio.webp" },
    { title: "协作", text: "多人实时编辑，改动一目了然。" }
  ]
};
