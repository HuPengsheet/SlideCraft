/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow / title / subtitle   标题区（都可省略）
 *   left, right   两侧的数字
 *     label     标签（如 "改版前"）
 *     value     数值（必填，负数和 0 也可以）
 *     unit      单位，显示在数字后
 *     prefix    前缀（如 ¥）
 *     decimals  小数位，省略时按 value 推断
 *   higherIsBetter   true（默认）时右侧比左侧大为好（绿色）；false 时变小为好（如耗时、成本）
 *   delta
 *     show      是否显示差值，默认 true
 *     decimals  百分比小数位，默认 1
 *     label     差值旁的说明，如 "较改版前"
 *   duration   数字滚动时长，毫秒，默认 1800
 * 差值 = (right - left) / |left|。left 为 0 时无法计算百分比，显示绝对差。
 * 对比条按两个数的绝对值比例分成两段。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "改版效果",
  title: "页面加载耗时与转化",
  subtitle: "改版前后 30 天均值对比",
  left: { label: "改版前 · 转化用户", value: 8420, unit: "人" },
  right: { label: "改版后 · 转化用户", value: 11260, unit: "人" },
  higherIsBetter: true,
  delta: { show: true, decimals: 1, label: "较改版前" }
};
