/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal
 *   heading / eyebrow   左上角标题（可省略）
 *   layout     "free"（默认，用每个节点的 x、y）或 "row"（没写 x、y 的节点自动均匀排布）
 *   columns    layout 为 "row" 时每行几个，默认 5，超出自动换行
 *   nodes[]    id 唯一标识（必填）  label 名称（必填）  sub 小字  icon 图标或 emoji
 *              x、y 位置，占舞台宽高的百分比，0 到 100，节点中心点（free 必填）
 *              kind "default" | "accent"（高亮）| "muted"（虚线弱化）
 *   edges[]    from、to 节点 id（必填）  label 连线上的文字  curve true 为弧线
 *   nodeMs     节点依次出现的间隔，毫秒，默认 600
 *   flowMs     光点走完一条线的时间，毫秒，默认 2200
 *   loopFlow   true：搭建完成后光点持续流动；false：每条线只走一遍 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "数据管道",
  heading: "一条消息的旅程",
  layout: "free",
  nodeMs: 600,
  flowMs: 2200,
  loopFlow: true,
  nodes: [
    { id: "app", label: "客户端", sub: "Web / iOS / Android", icon: "📱", x: 12, y: 50 },
    { id: "gw", label: "API 网关", sub: "鉴权与限流", icon: "🛡", x: 36, y: 50, kind: "accent" },
    { id: "mq", label: "消息队列", sub: "Kafka", icon: "📨", x: 60, y: 28 },
    { id: "svc", label: "业务服务", sub: "订单 / 支付", icon: "⚙", x: 60, y: 74 },
    { id: "db", label: "数据仓库", sub: "ClickHouse", icon: "🗄", x: 87, y: 50 },
    { id: "log", label: "审计日志", sub: "只追加", icon: "📜", x: 87, y: 14, kind: "muted" }
  ],
  edges: [
    { from: "app", to: "gw", label: "HTTPS" },
    { from: "gw", to: "mq", label: "异步", curve: true },
    { from: "gw", to: "svc", label: "同步", curve: true },
    { from: "mq", to: "db" },
    { from: "svc", to: "db", curve: true },
    { from: "mq", to: "log", label: "镜像" }
  ]
};
