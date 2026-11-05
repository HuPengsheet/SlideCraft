/* 只改这个文件。字段说明：
 *   theme     dark | light | paper | neon | terminal，默认 dark
 *   index     章节序号，整数，序号会从 0 滚动到它。非数字时原样显示，默认 1
 *   digits    序号至少几位（不足补零），0 到 6，默认 2
 *   label     标题上方的小标签，默认 "CHAPTER"，设为 "" 隐藏
 *   title     章节标题，可用 \n 换行
 *   subtitle  副标题，可省略
 *   variant   blocks 色块 | lines 线条 | grid 网格，默认 blocks
 *   总时长约 2.5 秒（随播放速度缩放） */
window.PAGE_CONFIG = {
  theme: "dark",
  index: 3,
  digits: 2,
  label: "CHAPTER",
  title: "把想法\n变成现场",
  subtitle: "从一页稿子到一场发布会",
  variant: "blocks"
};
