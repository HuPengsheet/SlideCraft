/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal（默认 dark）
 *   eyebrow / title   左上角小标题与大标题（可省略）
 *   quarters[] 列标题，字符串数组，如 ["2025 Q1", "2025 Q2"]。省略时按计划自动生成 "Q1"、"Q2"…
 *   now        "现在"所在的列：列序号（从 0 开始）或列标题。省略则不画
 *   lanes[]    泳道（团队或主题）：
 *                name   泳道名
 *                items[] 计划块：
 *                  title    名称（必填）
 *                  q        起始列：序号（从 0 开始）或列标题，默认 0
 *                  span     占几列，默认 1
 *                  status   "done"（打勾）| "doing"（进行中，带进度）| "todo"（虚线）
 *                           省略时：有 progress 则按进度判断（100 为 done），否则 todo
 *                  progress 0 到 100，进行中的完成度
 *                  note     悬停提示的补充说明
 * 同一泳道内时间重叠的计划块会自动分成多行。内容过多时整体自动缩小。
 * 计划块按列从左到右依次入场；泳道颜色依次取 --accent、--accent-2、--accent-3、--good。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "ROADMAP 2025",
  title: "产品路线图",
  quarters: ["2025 Q1", "2025 Q2", "2025 Q3", "2025 Q4", "2026 Q1"],
  now: 2,
  lanes: [
    { name: "平台", items: [
      { title: "多租户架构", q: 0, span: 2, status: "done" },
      { title: "开放 API v2", q: 2, span: 2, status: "doing", progress: 55, note: "鉴权与限流已完成" },
      { title: "插件市场", q: 4, span: 1 }
    ] },
    { name: "增长", items: [
      { title: "新手引导重做", q: 0, span: 1, status: "done" },
      { title: "邀请裂变", q: 1, span: 2, status: "done" },
      { title: "付费转化实验", q: 2, span: 2, status: "doing", progress: 30 },
      { title: "海外落地页", q: 3, span: 2 }
    ] },
    { name: "AI", items: [
      { title: "智能摘要", q: 1, span: 1, status: "done" },
      { title: "写作助手", q: 2, span: 2, status: "doing", progress: 70 },
      { title: "知识库问答", q: 3, span: 2 },
      { title: "模型评测平台", q: 2, span: 1, status: "todo" }
    ] },
    { name: "稳定性", items: [
      { title: "全链路监控", q: 0, span: 2, status: "done" },
      { title: "异地多活", q: 2, span: 3, status: "doing", progress: 15 }
    ] }
  ]
};
