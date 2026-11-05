/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow    标题上方的小标签（可省略）
 *   title      左侧大标题（可省略）
 *   subtitle   左侧说明文字（可省略，超过 6 行会被截断）
 *   hint       左下角操作提示，默认 "点击任意一层放大 · Esc 返回"；写 "" 可隐藏
 *   stagger    相邻两层堆叠入场的间隔，毫秒，默认 260
 *   layers[]   自上而下排列，最多 8 层，最先写的在最上面；入场时从最下面一层开始往上堆
 *     name     层名（必填，过长会省略）
 *     desc     层说明，只在放大这一层时显示（可省略）
 *     color    accent | accent-2 | accent-3 | good | bad，默认按顺序轮换前三种
 *     modules[]  模块，最多 12 个。可写字符串，也可写 { name, note }；
 *                note 是模块说明，只在放大这一层时显示
 * 操作：点击某一层放大，再点一次或按 Esc、点空白处恢复；Tab 聚焦后按 Enter 也可切换。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "系统架构",
  title: "一套平台，四个层次",
  subtitle: "从用户看得见的界面，到沉在最底下的基础设施。每一层只依赖它下面的一层。",
  hint: "点击任意一层放大 · Esc 返回",
  stagger: 260,
  layers: [
    {
      name: "应用层", color: "accent",
      desc: "面向用户的产品入口，负责交互和展示，不直接访问数据。",
      modules: [
        { name: "Web 控制台", note: "运营和管理人员使用的后台界面" },
        { name: "移动端", note: "iOS 与 Android 共用一套组件库" },
        { name: "开放 API", note: "给合作伙伴的 REST 与 Webhook 接口" },
        { name: "数据看板", note: "实时指标和自助报表" }
      ]
    },
    {
      name: "服务层", color: "accent-2",
      desc: "承载业务规则。每个服务独立部署，通过网关对外暴露。",
      modules: [
        { name: "网关", note: "鉴权、限流、灰度路由" },
        { name: "订单服务", note: "下单、支付、退款的状态机" },
        { name: "账户服务", note: "用户、角色、权限" },
        { name: "消息服务", note: "站内信、短信、邮件的统一出口" },
        { name: "搜索服务", note: "基于倒排索引的全文检索" }
      ]
    },
    {
      name: "数据层", color: "accent-3",
      desc: "所有持久化数据都在这一层，按读写特点分库分表。",
      modules: [
        { name: "MySQL", note: "交易数据，主从加读写分离" },
        { name: "Redis", note: "缓存、会话、排行榜" },
        { name: "Kafka", note: "事件流，削峰与异步解耦" },
        { name: "对象存储", note: "图片、视频和归档文件" }
      ]
    },
    {
      name: "基础设施", color: "good",
      desc: "计算、网络和观测，对上层透明。",
      modules: [
        { name: "Kubernetes", note: "容器编排与弹性伸缩" },
        { name: "CI/CD", note: "每次合并自动构建、测试、发布" },
        { name: "监控告警", note: "指标、日志、链路追踪" },
        { name: "安全审计", note: "密钥托管与操作留痕" }
      ]
    }
  ]
};
