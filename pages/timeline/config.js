/* 只改这个文件。字段说明：
 *   theme           dark | light | paper | neon | terminal
 *   title / subtitle   标题与副标题（可省略）
 *   orientation     "horizontal" 横向 | "vertical" 纵向，默认 horizontal
 *   autoAdvanceMs   每个事件停留时间，毫秒，默认 1600
 *   highlight       可选，事件序号（从 0 开始）；播放结束后停在该事件上，不写则停在最后一个
 *   events[]        { when, title, text, image? }
 *                   when 时间文字（必填）  title 标题  text 详情（支持 **粗体**）
 *                   image 可选，图片或视频路径（相对 index.html）
 * 播放结束后可点击任一节点查看对应详情。 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "产品发展历程",
  subtitle: "从原型到十万用户",
  orientation: "horizontal",
  autoAdvanceMs: 1600,
  highlight: 4,
  events: [
    { when: "2021.03", title: "立项", text: "三人小组完成第一版原型，确定以**协作演示**为核心方向。" },
    { when: "2021.09", title: "内测上线", text: "邀请 200 位种子用户试用，收集到 1,300 条反馈。" },
    { when: "2022.04", title: "公开发布", text: "v1.0 正式发布，首月注册用户突破 1 万。" },
    { when: "2023.01", title: "团队版", text: "加入多人实时协作与权限管理，企业客户开始付费。" },
    { when: "2024.06", title: "十万用户", text: "累计注册用户超过 **10 万**，日活稳定在 3 万以上。" },
    { when: "2025.02", title: "全球化", text: "支持 12 种语言，海外用户占比达到 35%。" }
  ]
};
