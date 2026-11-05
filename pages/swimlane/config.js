/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal（默认 dark）
 *   eyebrow / title   左上角小标题与大标题（可省略）
 *   lanes[]    泳道（角色），自上而下。字符串，或 { name }
 *   steps[]    流程块：
 *                id     唯一标识（必填，用于 links）
 *                lane   所在泳道：序号（从 0 开始）或泳道名，默认 0
 *                label  文字（必填）
 *                col    所在列，从 0 开始，默认按出现顺序递增
 *                kind   "start" | "end" | "decision"（虚线边框）| 省略为普通
 *   links[]    箭头：from、to（步骤 id，找不到的会忽略），label 箭头上的文字（可省略）
 *              省略整个 links 时，按列顺序自动首尾相连
 *   flowMs     光点走完一条箭头的时间，毫秒，默认 800
 * 播放：起点先亮，光点沿箭头走到下一步，下一步随之点亮；有环或指向已亮步骤的箭头也会走一遍。
 * 同一泳道同一列放多个步骤时，泳道会自动加高并上下排开。内容过多时整体自动缩小。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "ORDER TO CASH",
  title: "订单履约流程",
  flowMs: 800,
  lanes: ["客户", "销售", "仓库", "财务"],
  steps: [
    { id: "s1", lane: 0, col: 0, label: "提交订单", kind: "start" },
    { id: "s2", lane: 1, col: 1, label: "审核订单" },
    { id: "s3", lane: 1, col: 2, label: "库存充足？", kind: "decision" },
    { id: "s4", lane: 2, col: 3, label: "拣货打包" },
    { id: "s5", lane: 2, col: 4, label: "发货" },
    { id: "s6", lane: 3, col: 3, label: "开具发票" },
    { id: "s7", lane: 0, col: 5, label: "确认收货" },
    { id: "s8", lane: 3, col: 5, label: "回款对账", kind: "end" },
    { id: "s9", lane: 1, col: 3, label: "通知缺货" }
  ],
  links: [
    { from: "s1", to: "s2" },
    { from: "s2", to: "s3" },
    { from: "s3", to: "s4", label: "是" },
    { from: "s3", to: "s9", label: "否" },
    { from: "s3", to: "s6" },
    { from: "s4", to: "s5" },
    { from: "s5", to: "s7" },
    { from: "s7", to: "s8" },
    { from: "s6", to: "s8" },
    { from: "s9", to: "s1", label: "重新下单" }
  ]
};
