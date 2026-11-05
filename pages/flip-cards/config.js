/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow / title / subtitle   顶部文字（均可省略）
 *   hint       底部提示，默认按 flipOn 自动生成；写 "" 可隐藏
 *   columns    每行几列，默认按卡片数自动选择（1 到 6）
 *   flipOn     "hover" 鼠标悬停翻转（触屏和键盘仍可点击/回车）| "click" 点击翻转，默认 click
 *   preview    入场后是否依次翻一遍给人看，默认 true
 *   cards[]    最多 12 张
 *     front    正面。可写字符串（标题），或 { title, kicker, icon, image }
 *                kicker 小标签；icon 内置图标名：spark layers chart shield bolt globe cube clock；
 *                image 图片路径（png jpg webp gif mp4 webm 均可）；都没有则显示序号
 *     back     背面。可写字符串（说明），或 { title, text }。文字太多会自动缩小，仍放不下则以省略号截断
 *     color    accent | accent-2 | accent-3 | good | bad，默认轮换前三种 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "产品能力",
  title: "翻开每一张卡片",
  subtitle: "正面是名字，背面是它做了什么。",
  flipOn: "click",
  preview: true,
  cards: [
    { front: { title: "实时协作", kicker: "Collaborate", icon: "layers" }, back: { title: "多人同时编辑", text: "最多 50 人在同一份文档里编辑，光标、批注和修改历史实时同步，冲突自动合并。" } },
    { front: { title: "数据洞察", kicker: "Insight", icon: "chart" }, back: { title: "指标一眼看清", text: "拖拽生成图表，支持自定义口径。异常波动自动标红，并给出可能的原因。" } },
    { front: { title: "安全合规", kicker: "Secure", icon: "shield" }, back: { title: "默认加密", text: "传输和存储全程加密，细粒度权限，所有操作留痕，通过多项国际认证。" } },
    { front: { title: "极速响应", kicker: "Fast", icon: "bolt" }, back: { title: "毫秒级", text: "全球 30 个节点就近接入，常用查询缓存命中率超过 95%。" } },
    { front: { title: "全球部署", kicker: "Global", icon: "globe" }, back: { title: "一次配置，多地可用", text: "按地区选择数据驻留位置，满足不同国家和地区的合规要求。" } },
    { front: { title: "开放集成", kicker: "Open", icon: "cube" }, back: { title: "200+ 连接器", text: "开放 API 与 Webhook，主流办公、存储与 CRM 系统开箱即用。" } }
  ]
};
