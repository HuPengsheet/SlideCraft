/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 paper
 *   heading    扇面中央的大字（楷体，沿弧排列），建议 2 到 6 个字
 *   items[]    扇面外圈的条目，最多 6 条，扇子展开后依次浮现；每条是一个字符串（建议 2 到 4 个字）
 *   caption    扇子下方的说明文字，可省略
 *   ribs       扇骨数量，默认 15，范围 9 到 25
 *   spread     展开角度，度，默认 150，范围 90 到 170 */
window.PAGE_CONFIG = {
  theme: "paper",
  heading: "清风徐来",
  items: ["产品", "设计", "研发", "运营", "市场"],
  caption: "五个团队，一把扇子",
  ribs: 15,
  spread: 150
};
