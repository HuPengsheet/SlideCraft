/* 只改这个文件。字段说明：
 *   theme        dark | light | paper | neon | terminal（也可用网址参数 ?theme=light）
 *   eyebrow      标题上方小字，可省略
 *   title        标题，可省略
 *   subtitle     副标题，可省略
 *   symbols[]    行情项。每项：
 *                  code    代码，如 "AAPL"
 *                  price   当前价（大于 0 的数字，否则忽略）
 *                  change  当前涨跌幅，单位 %，默认 0。涨为绿、跌为红
 *   volatility   每次跳动的波动幅度，单位 %，默认 0.35，范围 0 到 5
 *   seed         随机种子（整数），默认 1。相同种子每次播放的走势完全一致，不联网
 *   tickMs       跳动间隔，毫秒，默认 900（随倍速缩放）
 *   scrollSpeed  滚动速度，em/秒，默认 5
 *   chart        是否显示下方的实时折线，默认 true。折线是所有品种相对开盘价的平均指数
 *   indexLabel   折线与大数字的说明，默认 "综合指数"
 *   note         底部小注，可省略
 *   播放结束后页面继续跳动，直到重播。开启系统的"减少动态效果"时只显示静态结果 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "MARKET LIVE",
  title: "全球市场行情",
  subtitle: "模拟数据，由随机种子生成",
  symbols: [
    { code: "AAPL", price: 227.48, change: 1.24 },
    { code: "NVDA", price: 138.07, change: 2.86 },
    { code: "TSLA", price: 342.15, change: -1.73 },
    { code: "MSFT", price: 421.92, change: 0.41 },
    { code: "AMZN", price: 214.36, change: -0.58 },
    { code: "BABA", price: 88.64, change: 3.12 },
    { code: "BTC", price: 97420.5, change: 1.95 },
    { code: "ETH", price: 3612.8, change: -2.34 },
    { code: "XAU", price: 2648.3, change: 0.17 },
    { code: "EURUSD", price: 1.0482, change: -0.22 }
  ],
  volatility: 0.35,
  seed: 20,
  tickMs: 900,
  scrollSpeed: 5,
  chart: true,
  indexLabel: "综合指数",
  note: "价格每次跳动都由固定种子的随机游走生成，没有任何网络请求。"
};
