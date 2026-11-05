/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow / title / subtitle   左侧标题区（都可省略）
 *   current    当前项的序号，从 1 开始；省略或 0 表示没有当前项（所有项正常显示）
 *   showTime   是否显示每项右侧的时长，默认 true
 *   stagger    相邻项入场间隔，毫秒，默认 110
 *   items[]    议程项，可以是字符串，也可以是对象
 *     title   标题（必填）
 *     time    时间或时长，如 "15 分钟"、"09:30"
 *     note    说明（项数超过 9 时不显示）
 * 项数建议 1 到 40：8 项以内单列，超过自动分成两列，17 项以上三列。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "2026 产品大会",
  title: "今天的议程",
  subtitle: "上午场 · 3 小时",
  current: 3,
  showTime: true,
  items: [
    { title: "开场与欢迎", time: "10 分钟", note: "主持人介绍嘉宾与流程" },
    { title: "年度回顾", time: "25 分钟", note: "关键数字与里程碑" },
    { title: "新一代产品路线图", time: "30 分钟", note: "三个方向与取舍" },
    { title: "客户案例分享", time: "25 分钟", note: "两家客户现场演示" },
    { title: "茶歇与交流", time: "20 分钟" },
    { title: "问答与收尾", time: "20 分钟", note: "提问可通过现场二维码提交" }
  ]
};
