/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   title      标题；subtitle 副标题（可省略）
 *   highlight  推荐列的下标（从 0 开始），该列有高亮底色和顶部徽标；省略或 -1 表示不突出
 *   badge      徽标文字，默认 "推荐"
 *   rowMs      逐行点亮的间隔（毫秒），默认 380
 *   columns[]  列，建议 2 到 5 列。字符串，或 { name, sub }（sub 为列名下的小字，如价格）
 *   rows[]     功能行。行数多时行高和字号自动缩小，保证不溢出
 *     label    功能名
 *     values[] 与 columns 一一对应。true 显示勾；false、null 或 "-" 显示横线；其他文字原样显示
 * 例：{ label: "导出 PPT", values: [false, true, true] } */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "方案功能一览",
  subtitle: "从个人到团队，按需选择",
  highlight: 1,
  badge: "推荐",
  rowMs: 380,
  columns: [
    { name: "入门版", sub: "免费" },
    { name: "专业版", sub: "¥79 / 月" },
    { name: "团队版", sub: "¥239 / 月" }
  ],
  rows: [
    { label: "页面模板数量", values: ["10 个", "60+ 个", "60+ 个"] },
    { label: "内置主题", values: ["5 套", "5 套", "5 套"] },
    { label: "导出单页 HTML", values: [true, true, true] },
    { label: "导出 PPT 与视频", values: [false, true, true] },
    { label: "自定义主题与字体", values: [false, true, true] },
    { label: "版本历史", values: ["无", "30 天", "无限"] },
    { label: "团队协作与共享模板", values: [false, false, true] },
    { label: "单点登录 SSO", values: [false, false, true] },
    { label: "专属客户经理", values: [false, false, true] }
  ]
};
