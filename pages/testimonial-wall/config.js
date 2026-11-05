/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow / title / subtitle   左侧标题区（都可省略；省略时评价列铺满整页）
 *   columns    列数，1 到 5，默认 3（有标题区时最多 3 列）
 *   speed      滚动速度，每秒滚过多少 em，默认 2.2；0 为静止
 *   items[]    评价
 *     name    姓名（必填）
 *     text    内容（必填，支持 **粗体**）
 *     role    身份或公司
 *     rating  星级 0 到 5，可带小数（四舍五入到整星），省略则不显示星级
 *     avatar  头像图片路径；省略或加载失败时用姓名生成字母头像
 * 奇数列向上滚，偶数列向下滚，鼠标移到某一列上该列暂停。评价太少时会自动重复铺满。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "用户评价",
  title: "他们这样说",
  subtitle: "来自 2,300 位正在使用的团队",
  columns: 3,
  speed: 2.2,
  items: [
    { name: "林晓雨", role: "产品经理 · 云舟科技", rating: 5, text: "以前做一份汇报要熬到半夜，现在下班前就能排好版。**动画效果**直接可用，客户以为我们请了设计师。" },
    { name: "Daniel Wu", role: "Engineering Lead", rating: 5, text: "Config-driven pages are exactly what we needed. Our release demos finally look consistent across the team." },
    { name: "陈思远", role: "创业者", rating: 4, text: "上手很快，改几行配置就能出效果。希望以后能多一些行业模板。" },
    { name: "王欣怡", role: "培训讲师", rating: 5, text: "课堂上用倒计时和清单页，学员的注意力明显更集中。" },
    { name: "Sofia Martins", role: "Design Manager", rating: 5, text: "Five themes that all hold together is rare. Even the terminal one looks deliberate." },
    { name: "刘子轩", role: "运营负责人 · 星河互动", rating: 4, text: "年会开场用了一次，现场反响很好。投影仪上颜色也没有偏。" },
    { name: "赵雅琪", role: "市场总监", rating: 5, text: "不依赖任何外部库，会场网络再差也能正常播放，这点对我们很重要。" },
    { name: "Kenji Tanaka", role: "Founder", rating: 4.5, text: "Embedding in slides with an iframe just works. Replay from the parent page is a nice touch." },
    { name: "周明", role: "高校教师", rating: 5, text: "学生答辩的时候用它展示数据，比截图清楚得多，也不会卡。" },
    { name: "黄诗涵", role: "前端工程师", rating: 5, text: "代码很干净，**一个页面三个文件**，想改什么一眼就找到。" },
    { name: "Amira Hassan", role: "Consultant", rating: 4, text: "Great for client workshops. I would love a few more chart-style pages." },
    { name: "孙浩然", role: "售前顾问", rating: 5, text: "方案演示时用数字对比页，客户一眼就能看出改进幅度。" }
  ]
};
