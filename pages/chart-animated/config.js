/* 只改这个文件。字段说明：
 *   theme        dark | light | paper | neon | terminal
 *   title / subtitle   标题与副标题（可省略）
 *   type         "bar" 柱状 | "line" 折线 | "donut" 环形
 *   unit         单位，显示在数值后（如 "万元"、"%"）
 *   labels[]     横轴类别（donut 时为各扇区名称）
 *   series[]     { name, data[] }，data 与 labels 一一对应；数值需 >= 0
 *                bar / line 可有多条（颜色依次取 accent、accent-2、accent-3）
 *                donut 只用第一条
 *   legend       是否显示图例，默认 true
 *   valueLabels  是否显示数值标签，默认 true
 *   area         折线是否填充面积，默认 false
 *   decimals     数值小数位；不写则按数据自动判断
 *   duration     动画时长，毫秒，默认 1800
 *   note         底部来源说明（可省略）
 * 纵轴最大值自动计算并取整，无需手填。 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "2025 年各季度营收",
  subtitle: "按产品线拆分，单位：万元",
  type: "bar",
  unit: "万元",
  labels: ["Q1", "Q2", "Q3", "Q4"],
  series: [
    { name: "订阅业务", data: [320, 410, 530, 690] },
    { name: "企业服务", data: [210, 260, 340, 380] },
    { name: "硬件销售", data: [150, 130, 180, 240] }
  ],
  legend: true,
  valueLabels: true,
  area: true,
  note: "数据来源：财务部月度报表"
};
