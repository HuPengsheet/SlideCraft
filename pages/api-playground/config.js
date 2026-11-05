/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   title      标题；subtitle 副标题（都可省略）
 *   sendLabel  发送按钮文字，默认 "发送"
 *   latencyMs  响应耗时（毫秒），默认 120。演示里会先"等待"一小段，再把耗时数字滚动到这个值
 *   request    请求
 *     method   GET | POST | PUT | PATCH | DELETE，默认 GET
 *     url      完整地址
 *     headers  对象，如 { "Content-Type": "application/json" }
 *     body     对象或字符串。对象和 JSON 字符串会格式化并高亮；其他字符串原样显示。可省略
 *   response   响应
 *     status     状态码，默认 200。2xx 绿色，3xx 蓝色，其余红色
 *     statusText 状态文字，如 "OK"；省略时按常见状态码自动补
 *     body       对象或字符串，规则同 request.body
 * 播放结束后，点击"发送"可以重新演示一次响应。 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "一次请求，一次响应",
  subtitle: "创建订单接口，从发送到返回只要 128 毫秒",
  sendLabel: "发送",
  latencyMs: 128,
  request: {
    method: "POST",
    url: "https://api.slidecraft.dev/v1/orders",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer sk_live_9f3a...c21e",
      "X-Request-Id": "req_7Hq2kLm"
    },
    body: {
      customer_id: "cus_1042",
      plan: "pro",
      seats: 5,
      coupon: null,
      auto_renew: true
    }
  },
  response: {
    status: 201,
    statusText: "Created",
    body: {
      id: "ord_88231",
      status: "paid",
      amount: 495.0,
      currency: "CNY",
      items: [{ sku: "pro-seat", qty: 5 }],
      created_at: "2025-03-18T09:41:07Z"
    }
  }
};
