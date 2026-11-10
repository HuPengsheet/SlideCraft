/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 paper
 *   eyebrow    标题上方小字，可省略
 *   heading    卷面大标题（楷体），建议 2 到 8 个字
 *   items[]    卷面条目，最多 4 条，卷轴展开后依次浮现：
 *              tag 小标号（可省略），name 条目名，desc 一行说明
 *   width      完全展开时卷面宽度，单位 em（舞台约 62 em 宽），默认 52，范围 30 到 56
 *   duration   展开用时，毫秒，默认 2600 */
window.PAGE_CONFIG = {
  theme: "paper",
  eyebrow: "年度回顾",
  heading: "春华秋实",
  items: [
    { tag: "壹", name: "立项", desc: "三月定下方向，组建小队" },
    { tag: "贰", name: "深耕", desc: "百日迭代，十二个版本" },
    { tag: "叁", name: "破圈", desc: "用户突破一百万" },
    { tag: "肆", name: "远航", desc: "明年走向海外市场" }
  ],
  width: 52,
  duration: 2600
};
