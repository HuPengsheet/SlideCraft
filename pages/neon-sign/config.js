/* 只改这个文件。字段说明：
 *   theme    dark | light | paper | neon | terminal（灯管颜色取主题第 1、2、3 个强调色）
 *   lines[]  招牌上的文字，最多 3 行，每行 { text 文字, color 1|2|3 用第几个强调色 }
 *   sub      招牌下方的一行小字（可省略）
 *   flicker  哪一行的第几个字接触不良地闪烁（从 0 开始），默认第一行最后一个字
 *   wall     背景：brick 砖墙 | plain 纯色暗墙，默认 brick */
window.PAGE_CONFIG = {
  theme: "dark",
  lines: [
    { text: "夜未央", color: 2 },
    { text: "NIGHT OWL", color: 1 },
    { text: "BAR · 24H", color: 3 }
  ],
  sub: "EST. 1974",
  flicker: { line: 0, char: 2 },
  wall: "brick"
};
