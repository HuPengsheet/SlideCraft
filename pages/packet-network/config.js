/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal
 *   eyebrow / heading / subheading   左上角标题（都可省略）
 *   nodes[]    最多 8 个。id 唯一标识（必填）  label 名称（必填）  sub 小字  icon 图标或 emoji
 *              kind "server"（强调边框）| "switch" | "client"，默认 client
 *              x、y 位置，占舞台宽高的百分比，0 到 100
 *   links[]    from、to 节点 id，构成可通行的连线
 *   traffic[]  按顺序发送的数据包，最多 10 个。path 途经节点 id 的数组（必填，相邻节点必须有连线）
 *              label 包的名字  drop 为 true 时，这个包在倒数第二个节点处丢失，随后沿原路重传一次
 *   hopMs      数据包走完一段连线的时间，毫秒，默认 700 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "实时流量",
  heading: "一次请求的路由",
  subheading: "数据包沿链路穿梭，丢包会标红并自动重传",
  hopMs: 700,
  nodes: [
    { id: "web", label: "浏览器", sub: "客户端", icon: "🖥", kind: "client", x: 12, y: 42 },
    { id: "app", label: "App", sub: "客户端", icon: "📱", kind: "client", x: 12, y: 80 },
    { id: "gw", label: "网关", sub: "10.0.0.1", icon: "🛡", kind: "switch", x: 36, y: 61 },
    { id: "lb", label: "负载均衡", sub: "转发", icon: "⚖", kind: "switch", x: 62, y: 61 },
    { id: "api", label: "API 服务", sub: "主节点", icon: "⚙", kind: "server", x: 88, y: 40 },
    { id: "db", label: "数据库", sub: "主库", icon: "🗄", kind: "server", x: 88, y: 80 }
  ],
  links: [
    { from: "web", to: "gw" }, { from: "app", to: "gw" },
    { from: "gw", to: "lb" },
    { from: "lb", to: "api" }, { from: "lb", to: "db" }
  ],
  traffic: [
    { label: "GET /home", path: ["web", "gw", "lb", "api"] },
    { label: "POST /login", path: ["app", "gw", "lb", "api"] },
    { label: "SELECT", path: ["api", "lb", "db"], drop: true },
    { label: "200 OK", path: ["api", "lb", "gw", "web"] }
  ]
};
