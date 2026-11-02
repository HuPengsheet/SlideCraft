/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow / title / subtitle   标题区（都可省略）
 *   columns    列数，1 到 8，默认 4
 *   rows       行数，可省略；省略时按内容自动计算（不够放时会自动增加）
 *   gap        格子间距，单位 em，默认 1.1
 *   stagger    相邻格子出现的间隔，毫秒，默认 90
 *   tiles[]    格子，按顺序自动排布（从左到右、从上到下，找第一个放得下的位置）
 *     通用字段  type    stat | text | image | spark | list | quote（必填，未知类型按 text 处理）
 *               col row 起始列、行，从 1 开始；两个都写才固定位置，否则自动排布
 *               w h     占几列、几行；默认值：stat 1x1，text 1x1，image 2x2，spark 2x1，list 1x2，quote 1x1
 *               accent  true 时整块填充主色（建议全页最多一块）
 *     stat   value 数值（必填）  label 标签  prefix 前缀  unit 单位  decimals 小数位（默认按 value 推断）
 *            delta 变化，字符串如 "+12.4%" 或数字（数字会加正负号和 %）
 *            trend "up" | "down"，省略时按 delta 的正负判断
 *     text   eyebrow 小标题  heading 标题  body 正文（支持 **粗体**）
 *     image  src 图片或视频路径（相对 index.html）  caption 说明文字
 *     spark  label 标签  value 当前值  prefix  unit  decimals  data 数字数组（折线）
 *     list   heading 标题  items 字符串数组，或 { text, done }；done 默认 true，false 为未勾选
 *     quote  text 引文  by 署名
 * 播放结束后，鼠标移到格子上会轻微上浮。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "2026 Q1 · 运营简报",
  title: "增长仪表盘",
  subtitle: "核心指标、趋势与本季度待办",
  columns: 4,
  gap: 1.1,
  tiles: [
    { type: "stat", accent: true, label: "季度营收", prefix: "¥", value: 4280, unit: "万", delta: "+18.6%" },
    { type: "spark", w: 2, label: "日活用户", value: 31240, delta: "+9.2%",
      data: [18, 21, 20, 24, 23, 27, 26, 31, 29, 34, 33, 38, 41, 40, 46] },
    { type: "stat", label: "付费转化率", value: 6.8, decimals: 1, unit: "%", delta: "-0.4%" },
    { type: "image", w: 2, h: 2, src: "../gallery/img/bold-poster.webp", caption: "上海发布会 · 新版本首次公开演示" },
    { type: "text", eyebrow: "本季度重点", heading: "留存优先", body: "新手引导重做后，**七日留存**提升 11 个百分点。" },
    { type: "list", heading: "Q2 待办", items: [
      { text: "上线团队协作 2.0" }, { text: "完成海外支付接入" }, { text: "官网改版" },
      { text: "客户成功手册", done: false }, { text: "年度大会筹备", done: false } ] },
    { type: "quote", text: "它让我们每周少开两个会。", by: "某客户 · 产品负责人" }
  ]
};
