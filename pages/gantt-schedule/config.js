/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal（也可用网址参数 ?theme=light）
 *   title      标题，可省略
 *   subtitle   副标题，可省略
 *   unit       时间轴单位："week"（默认）| "month" | "day"
 *   start      时间轴起点：数字（单位轴上的刻度）或 ISO 日期 "2026-03-02"。省略时取最早任务的开始
 *   rows[]     任务，最多约 14 行效果最好。每项：
 *                name       任务名称
 *                group      分组名，可省略。同名分组的任务会放在同一个分组标题下（按首次出现的顺序）
 *                start      开始，数字或 ISO 日期（必填；写错的行会被跳过）
 *                end        结束，数字或 ISO 日期。数字表示区间 [start, end)；
 *                           ISO 日期按"含当天"计算。省略时占一个单位
 *                progress   完成度 0 到 100，可省略
 *                milestone  true 时画成菱形，位置取 start
 *              数字和 ISO 日期可以混用：ISO 日期按 start 换算到单位轴，数字原样使用
 *   today      "今天"标记的位置，数字或 ISO 日期，可省略；超出时间轴范围则不显示
 *   note       底部小注，可省略
 *   rowStagger 相邻行出现的间隔，毫秒，默认按行数自动 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "SlideCraft 2.0 发布排期",
  subtitle: "第 1 周至第 12 周，三个工作流并行推进",
  unit: "week",
  start: 1,
  rows: [
    { name: "需求评审", group: "设计", start: 1, end: 3, progress: 100 },
    { name: "交互与视觉稿", group: "设计", start: 2, end: 6, progress: 100 },
    { name: "设计冻结", group: "设计", start: 6, milestone: true },
    { name: "底座与主题系统", group: "开发", start: 3, end: 7, progress: 100 },
    { name: "特效页面开发", group: "开发", start: 5, end: 10, progress: 65 },
    { name: "导出与嵌入", group: "开发", start: 7, end: 11, progress: 30 },
    { name: "功能完成", group: "开发", start: 10, milestone: true },
    { name: "内部测试", group: "发布", start: 9, end: 12, progress: 10 },
    { name: "文档与示例", group: "发布", start: 9, end: 13, progress: 0 },
    { name: "正式发布", group: "发布", start: 13, milestone: true }
  ],
  today: 8.5,
  note: "进度截至第 8 周中。红线为今天，菱形为里程碑。"
};
