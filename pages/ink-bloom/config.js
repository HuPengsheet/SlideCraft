/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 paper
 *   eyebrow / title / subtitle   中央文字，可省略；title 用楷体大字逐字显出（建议 2 到 6 个字）
 *   drops[]    墨滴，按顺序落下：
 *              x, y   落点，占舞台宽高的比例（0 到 1）
 *              size   晕开后的半径，占舞台宽度的比例，默认 .2
 *              ink    浓淡 0.1 到 1，默认 1（越小越淡）
 *              color  ink（墨色，默认）| accent（朱砂红）
 *   gap        相邻墨滴落下的间隔，毫秒，默认 520
 *   seed       随机种子，改它可以换一种晕染形状，默认 7 */
window.PAGE_CONFIG = {
  theme: "paper",
  eyebrow: "丙午 · 春",
  title: "墨韵",
  subtitle: "一滴墨，晕开一方天地",
  drops: [
    { x: .27, y: .38, size: .26 },
    { x: .75, y: .66, size: .21 },
    { x: .52, y: .55, size: .44, ink: .3 },
    { x: .68, y: .27, size: .055, color: "accent" },
    { x: .17, y: .78, size: .07, ink: .7 }
  ],
  gap: 520,
  seed: 7
};
