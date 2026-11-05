/* 只改这个文件。字段说明：
 *   theme       dark | light | paper | neon | terminal，默认 dark
 *   eyebrow / heading / subheading   右侧标题区，可省略
 *   stagger     相邻环启动的间隔，毫秒，默认 400
 *   rings[]     从外到内，最多 5 个：
 *                 label 名称（必填）   value 当前值（必填）   goal 目标值，默认 100
 *                 unit 单位   decimals 小数位，默认 0
 *                 color 主题色名：accent | accent-2 | accent-3 | good | bad，默认按顺序取色
 *                 超过目标时环保持满圈，百分比照实显示
 *   center      中心显示的内容：
 *                 ring 用第几个环的数值（从 0 数起），默认 0
 *                 label 数字下方的文字，默认取该环的名称 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "TODAY",
  heading: "今日活动",
  subheading: "三个目标，完成了两个半",
  stagger: 400,
  rings: [
    { label: "活动消耗", value: 486, goal: 600, unit: "千卡", color: "accent-2" },
    { label: "运动时长", value: 38, goal: 30, unit: "分钟", color: "good" },
    { label: "站立小时", value: 9, goal: 12, unit: "小时", color: "accent-3" }
  ],
  center: { ring: 0, label: "千卡 · 活动消耗" }
};
