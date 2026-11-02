/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow    左上角小标题（可省略）
 *   title      设置浏览器标签页标题，也显示在左上角（与 eyebrow 同时写时优先显示 eyebrow）
 *   layout     "center" 居中 | "split" 左侧色块 + 右侧引文，默认 center
 *   holdMs     每条引文停留的总时长，毫秒，默认 4200（含逐字出现的时间）
 *   quotes[]   引文
 *              text 引文（必填；中文逐字出现，英文逐词出现；过长会自动缩小字号）
 *              by 署名（必填）  role 身份说明  avatar 头像图片路径（省略时用署名首字生成）
 * 自动播放一遍后停在最后一条。点击圆点、点击箭头或按键盘左右方向键可跳转，
 * 一旦手动操作，自动切换就会停止。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "用户怎么说",
  layout: "center",
  holdMs: 4200,
  quotes: [
    { text: "以前做一页演示要花一下午，现在十分钟就能做出有质感的开场。", by: "王若宁", role: "市场总监 · 星河科技" },
    { text: "我们把它放进发布会的转场里，现场没有人相信那是模板。", by: "李沐", role: "品牌负责人 · 青禾设计" },
    { text: "Good design is as little design as possible.", by: "Dieter Rams", role: "工业设计师" },
    { text: "最让我满意的是改配置文件就能换内容，完全不用碰代码。", by: "赵一帆", role: "培训讲师" }
  ]
};
