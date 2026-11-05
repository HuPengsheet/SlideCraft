/* 只改这个文件。字段说明：
 *   theme        dark | light | paper | neon | terminal，默认 dark
 *   title        舞台另一侧的大标题，可省略
 *   subtitle     标题下方的说明，可省略
 *   position     通知堆叠位置：top-right（默认）| top-left | bottom-right | bottom-left | center
 *   intervalMs   两条通知之间的间隔毫秒，默认 1300
 *   maxVisible   同时可见的通知数，默认 3（范围 1 到 5）。更旧的通知淡出，
 *                堆叠下方会显示"还有 N 条"
 *   items[]      依次弹出的通知
 *     app        来源名称，显示在左上
 *     title      通知标题（单行，超出截断）
 *     text       正文（最多两行，超出截断）
 *     time       右上角时间文字，如 "现在"、"2 分钟前"
 *     icon       内置图标：mail | bell | cart | chat | alert | check | card | truck | user | cloud。
 *                不写或不认识时，用 app 的第一个字作图标
 *     tone       图标底色：accent（默认）| accent-2 | accent-3 | good | bad */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "每一条提醒，都不会错过",
  subtitle: "订单、告警与消息会按时间依次送达，最新的一条始终在最上面。",
  position: "top-right",
  intervalMs: 1300,
  maxVisible: 3,
  items: [
    { app: "订单中心", icon: "cart", tone: "accent", title: "新订单 #20418", text: "张晨 下单了 2 件商品，合计 ¥ 368.00，等待发货。", time: "现在" },
    { app: "支付", icon: "card", tone: "good", title: "收款成功", text: "已到账 ¥ 368.00，付款方式：微信支付。", time: "现在" },
    { app: "监控告警", icon: "alert", tone: "bad", title: "CPU 使用率超过 90%", text: "节点 api-03 已持续 5 分钟高负载，请尽快处理。", time: "1 分钟前" },
    { app: "物流", icon: "truck", tone: "accent-3", title: "包裹已揽收", text: "快递员已上门取件，预计明天下午送达。", time: "2 分钟前" },
    { app: "团队消息", icon: "chat", tone: "accent-2", title: "李想 @ 了你", text: "周会材料已经更新，麻烦今天下班前过一下。", time: "3 分钟前" },
    { app: "系统", icon: "check", tone: "good", title: "备份完成", text: "今日 02:00 的全量备份已成功，共 12.4 GB。", time: "5 分钟前" }
  ]
};
