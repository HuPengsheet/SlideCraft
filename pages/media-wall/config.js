/* 只改这个文件。字段说明：
 *   theme     dark | light | paper | neon | terminal
 *   title / subtitle   顶部标题与副标题（可省略）
 *   columns   每行几列，默认 4。整面墙会自动缩放到一屏内放下
 *   aspect    单元格宽高比，如 "16/9"、"1/1"、"4/3"，默认 "16/9"
 *   fit       "cover" 铺满裁切 | "contain" 完整显示，默认 cover
 *   gap       间距，单位 em，默认 0.9
 *   stagger   相邻卡片入场间隔，毫秒，默认 55
 *   sway      待机微摆动，默认 true；tilt 悬停 3D 倾斜，默认 true
 *   items[]   src 图片/视频路径（png jpg webp gif mp4 webm 均可，必填）
 *             name 名称  note 说明（均可省略）。视频在墙上静音自动循环播放
 * 灯箱：点击卡片打开，← → 切换，Esc 关闭。 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "16 套 PPT 模板",
  subtitle: "每套都是完整的 HTML 幻灯片 · 点击放大",
  columns: 4,
  aspect: "16/9",
  fit: "cover",
  gap: 0.9,
  stagger: 55,
  sway: true,
  tilt: true,
  items: [
    { src: "../gallery/img/8-bit-orbit.webp", name: "8-Bit Orbit", note: "像素街机 · 深色" },
    { src: "../gallery/img/biennale-yellow.webp", name: "Biennale Yellow", note: "艺术双年展 · 浅色" },
    { src: "../gallery/img/bold-poster.webp", name: "Bold Poster", note: "大字海报 · 浅色" },
    { src: "../gallery/img/broadside.webp", name: "Broadside", note: "报刊大版 · 深色" },
    { src: "../gallery/img/capsule.webp", name: "Capsule", note: "胶囊圆角 · 浅色" },
    { src: "../gallery/img/coral.webp", name: "Coral", note: "珊瑚杂志 · 混合" },
    { src: "../gallery/img/daisy-days.webp", name: "Daisy Days", note: "雏菊手作 · 浅色" },
    { src: "../gallery/img/editorial-forest.webp", name: "Editorial Forest", note: "森林绿编辑风 · 混合" },
    { src: "../gallery/img/neo-grid-bold.webp", name: "Neo-Grid Bold", note: "新粗野网格 · 浅色" },
    { src: "../gallery/img/pink-script.webp", name: "Pink Script", note: "粉色手写 · 深色" },
    { src: "../gallery/img/retro-windows.webp", name: "Retro Windows", note: "复古桌面 · 浅色" },
    { src: "../gallery/img/retro-zine.webp", name: "Retro Zine", note: "孔版杂志 · 浅色" },
    { src: "../gallery/img/sakura-chroma.webp", name: "Sakura Chroma", note: "日系磁带 · 浅色" },
    { src: "../gallery/img/soft-editorial.webp", name: "Soft Editorial", note: "柔和编辑风 · 浅色" },
    { src: "../gallery/img/studio.webp", name: "Studio", note: "工作室 · 深色" },
    { src: "../gallery/img/vellum.webp", name: "Vellum", note: "羊皮纸 · 深色" }
  ]
};
