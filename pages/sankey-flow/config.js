/* 只改这个文件。字段说明：
 *   theme       dark | light | paper | neon | terminal（也可用网址参数 ?theme=light）
 *   title       标题，可省略
 *   subtitle    副标题，可省略
 *   unit        数值单位，显示在提示和合计里，默认 ""
 *   totalLabel  右上角大数字的说明，默认 "总流量"（大数字 = 第一列所有节点的流出量之和）
 *   nodes[]     节点，可省略（会从 links 里自动生成）。每项可以是字符串，也可以是对象：
 *                 id     唯一标识，被 links 引用
 *                 name   显示名称，默认等于 id
 *                 color  可选，CSS 颜色或变量，如 "var(--good)"；默认依次取主题强调色
 *               节点的列由连线自动决定（最长路径），同列的上下顺序按连线自动排，避免重叠
 *   links[]     连线。每项：from、to（节点 id）、value（大于 0 的数字）
 *               颜色继承来源节点。无效项（value 非正、自环、成环的回边）会被忽略，重复的连线数值相加
 *   note        底部小注，可省略
 *   linkStagger 相邻连线开始展开的间隔，毫秒，默认 140 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "访客从哪里来，到哪里去",
  subtitle: "2025 年 11 月官网流量，单位：千次访问",
  unit: "k",
  totalLabel: "月访问量",
  nodes: [
    { id: "search", name: "搜索引擎" },
    { id: "social", name: "社交媒体", color: "var(--accent-2)" },
    { id: "direct", name: "直接访问", color: "var(--accent-3)" },
    { id: "mail", name: "邮件推送", color: "var(--good)" },
    { id: "home", name: "首页" },
    { id: "product", name: "产品页", color: "var(--accent-2)" },
    { id: "blog", name: "博客", color: "var(--accent-3)" },
    { id: "signup", name: "注册", color: "var(--good)" },
    { id: "buy", name: "购买" },
    { id: "bounce", name: "跳出", color: "var(--bad)" }
  ],
  links: [
    { from: "search", to: "home", value: 62 },
    { from: "search", to: "product", value: 48 },
    { from: "search", to: "blog", value: 40 },
    { from: "social", to: "home", value: 30 },
    { from: "social", to: "blog", value: 34 },
    { from: "direct", to: "home", value: 44 },
    { from: "direct", to: "product", value: 18 },
    { from: "mail", to: "product", value: 26 },
    { from: "mail", to: "home", value: 8 },
    { from: "home", to: "signup", value: 52 },
    { from: "home", to: "product", value: 20 },
    { from: "home", to: "bounce", value: 72 },
    { from: "product", to: "buy", value: 46 },
    { from: "product", to: "signup", value: 28 },
    { from: "product", to: "bounce", value: 58 },
    { from: "blog", to: "signup", value: 24 },
    { from: "blog", to: "bounce", value: 50 }
  ],
  note: "产品页的访客中，每 100 人约有 24 人完成购买。悬停任意一条带子或节点查看流量。",
  linkStagger: 140
};
