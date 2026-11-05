/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal（默认 dark）
 *   eyebrow    左上角小标题（可省略）
 *   title      左上角大标题（可省略；两者都空时导图占满舞台）
 *   center     中心主题：字符串，或 { label, sub }（sub 为小字）
 *   branches[] 一级分支，可递归。每项是字符串，或 { label, children[] }
 *              左右两侧自动按叶子数量平衡，顺时针阅读（右侧自上而下，左侧自下而上）
 *   maxDepth   最多显示几层，1 到 8，默认 5
 *   maxNodes   最多显示多少个节点，默认 150，超出的被忽略
 *   staggerMs  同一层节点依次长出的间隔，毫秒，默认 90（会随节点数自动压缩）
 * 每一层使用一个强调色（--accent、--accent-2、--accent-3、--good，更深层用次要色）。
 * 播放结束后，鼠标悬停某个节点会高亮它的祖先与子孙，其余变暗。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "产品规划",
  title: "新一代笔记应用",
  center: { label: "笔记 2.0", sub: "PRODUCT" },
  maxDepth: 5,
  staggerMs: 90,
  branches: [
    { label: "核心体验", children: [
      { label: "编辑器", children: ["块级编辑", "Markdown 快捷键", "斜杠命令"] },
      { label: "离线优先", children: ["本地数据库", "冲突合并"] },
      "全局搜索"
    ] },
    { label: "协作", children: [
      { label: "实时共编", children: ["光标同步", "评论与批注"] },
      { label: "权限", children: ["空间级", "页面级", "分享链接"] }
    ] },
    { label: "AI 能力", children: [
      { label: "写作助手", children: ["续写", "润色", "翻译"] },
      "会议纪要",
      "知识库问答"
    ] },
    { label: "平台", children: ["Web", "iOS / Android", "桌面端", "浏览器剪藏"] },
    { label: "商业化", children: [
      { label: "定价", children: ["个人免费", "团队订阅"] },
      "增长实验"
    ] },
    { label: "风险", children: ["数据安全", "性能", "同步一致性"] }
  ]
};
