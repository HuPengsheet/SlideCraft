/* 只改这个文件。字段说明：
 *   theme       dark | light | paper | neon | terminal（也可用网址参数 ?theme=light）
 *   title       标题，可省略
 *   subtitle    副标题，可省略
 *   start       起始日期 "YYYY-MM-DD"。默认：end 往前 364 天
 *   end         结束日期 "YYYY-MM-DD"。默认：data 中最晚的日期；都没有时取 2025-12-31
 *               日期范围最多取 1100 天；end 早于 start 时两者互换
 *   data        日期到数值的映射，如 { "2025-03-02": 7 }。缺失、负数、非数字的日期按 0，用最浅色
 *   demoSeed    数字。data 为空时，用这个种子生成演示数据（同一种子结果一致）。默认 null = 不生成
 *   levels      颜色档数（不含无数据档），默认 5，范围 2 到 7
 *   max         最深色对应的数值。默认 null = 取 data 中的最大值
 *   weekStart   每周从周几开始：1 = 周一（默认），0 = 周日
 *   unit        数值的单位，悬停提示和统计中显示，默认 "次"
 *   totalLabel  右上角大数字的说明，默认 "合计"
 *   note        底部小注，可省略
 *   duration    全部列点亮总时长，毫秒，默认 2600 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "一年的提交记录",
  subtitle: "每个格子是一天，颜色越深，当天的提交越多",
  start: "2025-01-01",
  end: "2025-12-31",
  data: {},
  demoSeed: 7,
  levels: 5,
  weekStart: 1,
  unit: "次提交",
  totalLabel: "全年提交",
  note: "工作日更密集，周末与春节、国庆前后明显降温。",
  duration: 2600
};
