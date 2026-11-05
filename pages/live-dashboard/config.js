/* 只改这个文件。字段说明：
 *   theme          dark | light | paper | neon | terminal，默认 dark
 *   title          标题；subtitle 副标题（可省略）
 *   seed           随机种子（整数），相同种子每次数据一样，默认 7
 *   tickMs         数据刷新间隔（毫秒），默认 800，最小 100。随播放倍速缩放
 *   incidentAt     第几次刷新时发生异常，默认 14。0 或负数表示不触发
 *   incidentPanel  哪个图块出现异常（从 0 开始），默认第一个折线、柱状或数字图块
 *   incidentTicks  异常持续几次刷新，默认 8
 *   panels[]       图块，1 到 12 个，按顺序自动排布
 *     type     line | bar | number | status，默认 line
 *     title    图块标题
 *     range    [最小, 最大]，数据在此范围内随机游走，默认 [0, 100]。异常时数据冲到最大值附近
 *     unit     数值单位，如 "ms"、"%"
 *     items[]  仅 status 用：服务名称数组，异常时最后一项变红
 * 页面不联网，所有数据由种子随机数生成。重播会重新开始。 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "生产环境实时监控",
  subtitle: "华东一区 · 每 0.8 秒刷新",
  seed: 7,
  tickMs: 800,
  incidentAt: 14,
  incidentTicks: 8,
  panels: [
    { type: "line", title: "接口 P95 延迟", range: [80, 400], unit: "ms" },
    { type: "bar", title: "每秒请求数", range: [1200, 4800], unit: "" },
    { type: "number", title: "CPU 使用率", range: [20, 100], unit: "%" },
    { type: "line", title: "错误率", range: [0, 5], unit: "%" },
    { type: "status", title: "服务状态", items: ["API 网关", "订单服务", "支付服务", "消息队列"] },
    { type: "number", title: "在线用户", range: [8000, 12000], unit: "" }
  ]
};
