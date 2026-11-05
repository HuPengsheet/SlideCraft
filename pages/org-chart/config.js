/* 只改这个文件。字段说明：
 *   theme       dark | light | paper | neon | terminal（也可用网址参数 ?theme=light）
 *   title       标题，可省略
 *   subtitle    副标题，可省略
 *   root        根节点，递归结构。每个节点：
 *                 name       姓名（必填，缺失显示"未命名"）
 *                 role       职位，可省略
 *                 children[] 下属节点，可省略
 *                 collapsed  true 时初始折叠该节点的子树，可省略
 *               节点超过 300 个时多余的会被忽略。点击有下属的卡片折叠 / 展开（也可用 Enter 键）
 *   direction   "down"（自上而下，默认）| "right"（自左向右）
 *   edge        连线样式："elbow" 直角（默认）| "curve" 曲线
 *   compact     true 时卡片更小、不显示头像，适合节点很多的情况，默认 false
 *   note        底部小注，可省略
 *   levelDelay  逐层展开的间隔，毫秒，默认 450
 *   节点多时整张图自动缩小以放进舞台 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "组织架构",
  subtitle: "产品技术中心，2026 年 1 月",
  direction: "down",
  edge: "elbow",
  compact: false,
  root: {
    name: "林远", role: "首席技术官",
    children: [
      { name: "陈思雨", role: "产品副总裁", children: [
        { name: "赵明", role: "产品经理" },
        { name: "周婷", role: "产品经理" },
        { name: "吴凡", role: "用户研究" }
      ] },
      { name: "王建国", role: "工程副总裁", children: [
        { name: "李娜", role: "前端负责人", children: [
          { name: "孙浩", role: "前端工程师" },
          { name: "胡月", role: "前端工程师" }
        ] },
        { name: "张伟", role: "后端负责人", children: [
          { name: "刘洋", role: "后端工程师" },
          { name: "郑凯", role: "后端工程师" },
          { name: "马丽", role: "SRE" }
        ] }
      ] },
      { name: "黄晓东", role: "设计总监", children: [
        { name: "杨柳", role: "交互设计师" },
        { name: "何川", role: "视觉设计师" }
      ] },
      { name: "宋佳", role: "数据负责人", collapsed: true, children: [
        { name: "高峰", role: "数据科学家" },
        { name: "罗兰", role: "数据工程师" }
      ] }
    ]
  },
  note: "点击有下属的卡片可折叠或展开，右侧数字表示被折叠的人数。",
  levelDelay: 450
};
