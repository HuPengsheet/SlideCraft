/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal
 *   eyebrow / heading / subheading   标题区（都可省略）
 *   blocks[]   区块，2 到 5 个，从左到右依次生成
 *              data 区块内容（必填，建议 20 个字以内）  hash 定格后的哈希，省略则自动生成
 *   startHeight  第一个区块的高度编号，默认 0（创世块）
 *   difficulty   哈希开头要求的 0 的个数，1 到 6，默认 4，会高亮显示
 *   mineMs       每个区块哈希滚动计算的时长，毫秒，默认 1400
 *   seed         自动生成哈希用的随机种子 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "分布式账本",
  heading: "每个区块都记着上一个的指纹",
  subheading: "改动任何一笔记录，后面所有区块的哈希都会对不上",
  startHeight: 0,
  difficulty: 4,
  mineMs: 1400,
  blocks: [
    { data: "创世区块" },
    { data: "Alice → Bob  2.5 BTC" },
    { data: "Bob → Carol  1.2 BTC" },
    { data: "Carol → Dave  0.8 BTC" }
  ]
};
