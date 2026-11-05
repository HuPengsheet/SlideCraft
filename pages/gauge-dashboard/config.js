/* 只改这个文件。字段说明：
 *   theme       dark | light | paper | neon | terminal，默认 dark
 *   eyebrow / heading / subheading   标题区，可省略
 *   columns     每行几个仪表，默认自动（最多 4 个一行）
 *   style       needle（指针，默认）| arc（只有弧线，没有指针）
 *   overshoot   摆动过冲幅度 0 到 1，默认 0.35；0 为无过冲
 *   stagger     相邻仪表启动的间隔，毫秒，默认 300
 *   gauges[]    最多 8 个：
 *                 label 名称（必填）   note 小注
 *                 value 目标值（必填）  min / max 量程，默认 0 / 100
 *                 unit 单位   decimals 小数位，默认 0
 *                 zones[] 区间：{ from, to, tone }，tone 为 good | warn | bad（绿、黄、红）。
 *                         省略时按量程 0–60% 绿、60–85% 黄、85–100% 红。
 *                         "越高越好"的指标请自己写区间，例如 [{from:0,to:90,tone:"bad"},{from:90,to:100,tone:"good"}]
 *   显示的数值会滚动到 value，指针和弧线的最终位置与 value 对应。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "LIVE · 生产环境",
  heading: "服务健康度",
  subheading: "过去 5 分钟的平均值",
  style: "needle",
  overshoot: 0.35,
  gauges: [
    { label: "CPU 负载", value: 68, unit: "%", note: "16 核 · 峰值 81%" },
    { label: "内存占用", value: 43, unit: "%", note: "27.5 / 64 GB" },
    { label: "接口延迟 P95", value: 232, min: 0, max: 400, unit: "ms", note: "目标 < 250 ms",
      zones: [{ from: 0, to: 250, tone: "good" }, { from: 250, to: 320, tone: "warn" }, { from: 320, to: 400, tone: "bad" }] },
    { label: "可用性", value: 99.2, min: 95, max: 100, unit: "%", decimals: 1, note: "SLA 99.9%",
      zones: [{ from: 95, to: 98, tone: "bad" }, { from: 98, to: 99.5, tone: "warn" }, { from: 99.5, to: 100, tone: "good" }] }
  ]
};
