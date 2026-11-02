/* 只改这个文件。字段说明：
 *   theme        dark | light | paper | neon | terminal（也可用网址参数 ?theme=light）
 *   title        标题，可省略
 *   subtitle     副标题，可省略
 *   axes[]       坐标轴，3 到 8 个（最多取 12 个）。每项：
 *                  label  轴名称
 *                  max    该轴的最大值，可省略，省略时用全局 max
 *                少于 3 个会补空轴；没写 axes 时按第一个系列的数据个数自动生成
 *   max          全局最大值。默认 null = 按数据自动取一个整齐的上限（如 100、50）
 *   series[]     数据系列，每项：
 *                  name    系列名称（图例中显示）
 *                  values  数组，与 axes 一一对应；缺的补 0，非数字按 0
 *                  color   可选，CSS 颜色或变量，如 "var(--good)"；默认依次取主题强调色
 *   rings        同心圈数，默认 5，范围 1 到 10
 *   fill         多边形填充不透明度，默认 0.18，范围 0 到 1
 *   legend       是否显示图例，默认 true。播放结束后悬停图例或多边形高亮该系列，点击图例开关该系列
 *   valueLabels  是否一直显示数值，默认 false（false 时悬停某个系列才显示它的数值）
 *   note         底部小注，可省略
 *   stagger      相邻系列开始生长的间隔，毫秒，默认 450
 *   duration     单个系列生长时长，毫秒，默认 1400 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "团队能力画像",
  subtitle: "三个产品团队在六个维度上的季度自评",
  axes: [
    { label: "交付速度" },
    { label: "代码质量" },
    { label: "用户洞察" },
    { label: "协作沟通" },
    { label: "技术创新" },
    { label: "稳定性" }
  ],
  max: 100,
  series: [
    { name: "平台组", values: [82, 91, 58, 74, 66, 95] },
    { name: "增长组", values: [93, 64, 88, 79, 72, 61] },
    { name: "智能组", values: [68, 77, 70, 63, 94, 70] }
  ],
  rings: 5,
  fill: 0.18,
  legend: true,
  valueLabels: false,
  note: "评分来自 2026 Q1 季度复盘问卷，满分 100。悬停或点击图例可查看单个团队。"
};
