/* 只改这个文件。字段说明：
 *   theme    dark | light | paper | neon | terminal，默认 dark
 *   logo     SVG path 的 d 属性（如 "M10 10 L50 90 ..."），或一段文字。
 *            含多个数字和路径命令的按 path 处理，其余按文字处理；为空或无法解析时用 text 代替
 *   text     没有 logo（或 logo 无法解析）时显示的文字，默认 "LOGO"
 *   tagline  标语，显示在 Logo 下方，可省略
 *   style    stroke 描边画出再填充 | burst 填充后爆裂冲击 | wipe 从左到右擦除，默认 stroke
 *   hold     展示完成后不再变化，此字段保留给嵌入时使用的停留毫秒数，默认 0（可省略） */
window.PAGE_CONFIG = {
  theme: "dark",
  logo: "拾光",
  text: "",
  tagline: "把每一次分享，做成作品",
  style: "stroke"
};
