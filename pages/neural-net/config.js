/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal
 *   eyebrow / heading / subheading   左上角标题（都可省略）
 *   layers[]   从输入到输出依次排列，2 到 6 层，每层 1 到 8 个节点
 *              name 层名（必填）  nodes[] 节点，字符串或 { label 名称, value 激活值 0 到 1 }
 *              输出层的 value 会在传播结束时显示，最大的那个被判定为结果
 *   pulseMs    信号走完相邻两层的时间，毫秒，默认 900
 *   seed       决定连线权重的随机种子 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "前向传播",
  heading: "一张图，怎么被认出来",
  subheading: "信号逐层流过网络，连线越亮权重越大",
  pulseMs: 900,
  layers: [
    { name: "输入", nodes: ["像素", "边缘", "纹理", "颜色"] },
    { name: "隐藏层 1", nodes: ["", "", "", "", "", ""] },
    { name: "隐藏层 2", nodes: ["", "", "", "", ""] },
    { name: "输出", nodes: [
      { label: "猫", value: 0.91 },
      { label: "狗", value: 0.06 },
      { label: "鸟", value: 0.03 }
    ] }
  ]
};
