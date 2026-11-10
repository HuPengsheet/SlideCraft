/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 paper
 *   eyebrow / heading / subtitle   印章上方的文字，可省略
 *   seals[]    依次盖下的印章，最多 5 枚：
 *              text   印文，1 到 4 个字（4 字排成 2×2，2 字竖排，1 字居中）
 *              style  zhu（朱文，红字留底，默认）| bai（白文，红底留字）
 *              shape  square（方印，默认）| round（圆印）
 *              label  印章下方的小字说明，可省略
 *   gap        相邻两枚之间的间隔，毫秒，默认 650
 *   seed       斑驳纹理的随机种子，默认 5 */
window.PAGE_CONFIG = {
  theme: "paper",
  eyebrow: "合作签约",
  heading: "一言为定",
  subtitle: "三方共识，即日生效",
  seals: [
    { text: "甲方之印", style: "bai", label: "甲方" },
    { text: "乙方", style: "zhu", shape: "round", label: "乙方" },
    { text: "见证人章", style: "zhu", label: "见证" }
  ],
  gap: 650,
  seed: 5
};
