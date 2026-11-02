/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal
 *   heading / subheading / eyebrow   标题区（都可省略）
 *   columns    每行几个，默认 3
 *   items[]    value 目标值（必填）  label 标签（必填）  unit 单位  prefix 前缀（如 ¥）
 *              decimals 小数位  from 起始值  note 小注  progress 进度条 0 到 100 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "2026 Q1",
  heading: "本季度的三个数字",
  subheading: "来自内部数据看板",
  items: [
    { value: 72, unit: "%", label: "四周留存", note: "较上季度 +8 个百分点", progress: 72 },
    { value: 12840, label: "活跃团队", note: "累计注册 18,200", progress: 70 },
    { value: 4.6, decimals: 1, unit: "/ 5", label: "用户满意度", note: "样本 2,310 份", progress: 92 }
  ]
};
