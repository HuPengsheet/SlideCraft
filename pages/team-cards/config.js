/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow / title / subtitle   标题区（都可省略）
 *   layout     "row" 一排（最多 5 人，更多时自动改为网格） | "grid" 网格；省略时 4 人及以下用 row，更多用 grid
 *   spotlightMs  播放时每人被聚焦的时长，毫秒，默认 1800
 *   stagger    卡片依次入场的间隔，毫秒，默认 140
 *   people[]   成员，建议 2 到 8 人（超过 8 人只显示前 8 个）
 *              name 姓名（必填）  role 职位  bio 简介（聚焦时展开，支持 **粗体**）
 *              photo 头像图片路径（相对 index.html）；省略或加载失败时自动生成字母头像
 *              tags 标签数组
 * 播放结束后，鼠标悬停、键盘聚焦或点击卡片即可展开；再次点击已展开的卡片收起。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "认识我们",
  title: "一起做产品的人",
  subtitle: "五个人，覆盖设计、工程与运营",
  layout: "row",
  spotlightMs: 1800,
  people: [
    { name: "林夕然", role: "创始人 · CEO", bio: "前互联网产品总监，**十年**从业经验，坚持把演示做得像作品。", tags: ["战略", "产品"] },
    { name: "陈知远", role: "技术负责人", bio: "主导渲染引擎与协作同步的架构，偏爱简单可靠的方案。", tags: ["架构", "性能", "TypeScript"] },
    { name: "Maya Chen", role: "设计总监", bio: "负责视觉系统与动效语言，相信**克制**比炫技更难。", tags: ["视觉", "动效"] },
    { name: "周明轩", role: "增长运营", bio: "从零搭建社区与内容渠道，三个月把日活做到三万。", tags: ["增长", "社区"] },
    { name: "Leo Park", role: "客户成功", bio: "和每一位企业客户一起把模板用到极致，整理出完整的最佳实践。", tags: ["培训", "方案"] }
  ]
};
