/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal（默认 dark）
 *   eyebrow / title   左上角小标题与大标题（可省略）
 *   mode       "list"（默认，每个象限列要点）| "scatter"（散点：条目按坐标落在象限里）
 *   axes       坐标轴文字（可省略）：
 *                x: { low, high }  横轴左端、右端的文字
 *                y: { low, high }  纵轴下端、上端的文字
 *   quadrants[] 四个象限，顺序固定：左上、右上、左下、右下。每项：
 *                title   标题
 *                items[] 要点（字符串，list 模式使用）
 *                color   "accent" | "accent-2" | "accent-3" | "good" | "bad"，默认依次为 accent、accent-2、accent-3、good
 *   points[]   散点（scatter 模式）：label 名称，x、y 为 0 到 100（x 向右增大，y 向上增大，50 为分界线）
 * 播放：十字线先画出，再依次高亮每个象限（其余压暗），最后全部点亮。
 * 播放结束后，鼠标悬停某个象限或散点会高亮它，其余变暗。
 * 要点过多时象限内文字会自动缩小。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "STRATEGY",
  title: "SWOT 分析：自研笔记产品",
  mode: "list",
  axes: {
    x: { low: "有利因素", high: "不利因素" },
    y: { low: "外部环境", high: "内部条件" }
  },
  quadrants: [
    { title: "优势 Strengths", color: "good", items: ["编辑器体验在同类中口碑领先", "离线优先架构，弱网可用", "团队有三年协同编辑积累"] },
    { title: "劣势 Weaknesses", color: "bad", items: ["移动端功能落后桌面端", "付费转化率低于行业均值", "缺少企业级权限与审计"] },
    { title: "机会 Opportunities", color: "accent", items: ["AI 写作需求快速增长", "远程办公带来团队协作入口", "海外市场对隐私友好产品有偏好"] },
    { title: "威胁 Threats", color: "accent-2", items: ["大厂把笔记并入办公套件", "开源替代品功能趋同", "模型调用成本波动"] }
  ],
  /* 散点模式示例：把 mode 改成 "scatter" 即可使用，坐标含义见上面的说明 */
  points: [
    { label: "自研编辑器", x: 78, y: 82 },
    { label: "离线同步", x: 64, y: 66 },
    { label: "移动端", x: 30, y: 72 },
    { label: "企业权限", x: 18, y: 58 },
    { label: "AI 写作", x: 85, y: 30 },
    { label: "远程协作", x: 60, y: 22 },
    { label: "大厂套件", x: 22, y: 20 },
    { label: "开源替代", x: 40, y: 38 }
  ]
};
