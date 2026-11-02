/* 只改这个文件。字段说明：
 *   theme         dark | light | paper | neon | terminal（也可用网址参数 ?theme=light）
 *   title         标题，可省略
 *   subtitle      副标题，可省略
 *   stages[]      漏斗阶段，从上到下（或从左到右），2 到 8 个效果最好。每项：
 *                   label  阶段名称
 *                   value  数值（非负数；非数字按 0）
 *                   note   小注，可省略
 *   scale         "linear" | "sqrt"，默认 "linear"。宽度与数值成正比，或与平方根成正比（数值差距很大时更好看）
 *   orientation   "vertical" | "horizontal"，默认 "vertical"
 *   showRate      是否显示阶段之间的转化率小标签，并在右上角显示整体转化率，默认 true
 *   unit          数值后面的单位，如 "人"，默认空
 *   note          底部小注，可省略
 *   stagger       相邻阶段出现的间隔，毫秒，默认 650
 *   countDuration 数值滚动时长，毫秒，默认 1200 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "从访问到付费的转化",
  subtitle: "2026 年 3 月，官网自助注册渠道",
  stages: [
    { label: "访问官网", value: 128400, note: "含自然搜索与投放" },
    { label: "注册账号", value: 41200, note: "邮箱或手机号验证" },
    { label: "完成引导", value: 26800 },
    { label: "创建首个项目", value: 14300, note: "7 天内" },
    { label: "升级付费", value: 3150 }
  ],
  scale: "linear",
  orientation: "vertical",
  showRate: true,
  unit: "人",
  note: "转化率 = 本阶段人数 / 上一阶段人数。数据来自产品分析看板。"
};
