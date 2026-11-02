/* 只改这个文件。字段说明：
 *   theme        dark | light | paper | neon | terminal，默认 dark
 *   title        左上角标题，可省略
 *   subtitle     标题下的说明，可省略
 *   cities[]     城市列表（至少 1 个才有标记）
 *                  name   名称（必填，arcs 用它引用）
 *                  lat    纬度，-90 到 90（北纬为正）
 *                  lon    经度，-180 到 180（东经为正）
 *                  main   true 表示主城市，标记更大、颜色不同、标签优先显示。默认 false
 *   arcs[]       连线列表：{ from: "城市名", to: "城市名" }，名称对不上的会被忽略
 *   rotateSpeed  自转速度，度/秒，默认 12；0 为静止；负数反向
 *   tilt         地轴倾角，度，默认 18（正值让北极朝向观众），拖动时可改变
 *   startLon     开场时正对观众的经度，默认 100
 *   pulse        true | false，默认 true。城市涟漪，连线绘完后继续有光点来回飞
 *   labels       true | false，默认 true。是否显示城市名（只显示正面的城市）
 *   拖动鼠标或手指可以旋转地球，松手后继续自转。 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "全球网络，一次连接",
  subtitle: "9 个节点覆盖 5 大洲，核心链路平均延迟低于 80 毫秒。",
  rotateSpeed: 12,
  tilt: 18,
  startLon: 100,
  pulse: true,
  labels: true,
  cities: [
    { name: "北京", lat: 39.9, lon: 116.4, main: true },
    { name: "上海", lat: 31.2, lon: 121.5 },
    { name: "新加坡", lat: 1.35, lon: 103.8 },
    { name: "迪拜", lat: 25.2, lon: 55.3 },
    { name: "伦敦", lat: 51.5, lon: -0.1 },
    { name: "纽约", lat: 40.7, lon: -74.0 },
    { name: "旧金山", lat: 37.8, lon: -122.4 },
    { name: "圣保罗", lat: -23.5, lon: -46.6 },
    { name: "悉尼", lat: -33.9, lon: 151.2 }
  ],
  arcs: [
    { from: "北京", to: "伦敦" },
    { from: "北京", to: "旧金山" },
    { from: "北京", to: "迪拜" },
    { from: "北京", to: "新加坡" },
    { from: "上海", to: "悉尼" },
    { from: "伦敦", to: "纽约" },
    { from: "纽约", to: "圣保罗" },
    { from: "迪拜", to: "圣保罗" }
  ]
};
