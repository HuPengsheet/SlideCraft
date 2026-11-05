/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal（默认 dark）
 *   eyebrow / title   左上角小标题与大标题（可省略）
 *   root       起点问题：{ question, detail?, options[] }
 *   options[]  每个选项：
 *                label    选项文字（如 "是"、"否"）
 *                next     下一个问题，结构同 root（递归）
 *                result   或者直接给结论：字符串，或 { title, text, tone }
 *                         tone："good"（绿）| "bad"（红）| 省略为强调色
 *                两者都省略时显示"暂无结论"
 *   demo[]     演示时依次选的选项，序号（从 0 开始）或选项文字。省略则每层选第一个。
 *   stepMs     演示每一步的间隔，毫秒，默认 1100
 *   maxDepth   最多几层，默认 7；maxNodes 最多节点数，默认 120
 * 播放：先只显示起点，演示自动沿一条路径选择，路径上的节点点亮，其余变暗。
 * 播放结束后可点击任意可见的节点或选项标签，自己选择路径；底部显示当前路径。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "DECISION GUIDE",
  title: "要不要自建服务？",
  demo: ["否", 0],
  stepMs: 1100,
  root: {
    question: "团队是否有专职运维？",
    options: [
      { label: "是", next: {
        question: "月均请求量是否超过 1 亿？",
        options: [
          { label: "是", result: { title: "自建集群", text: "规模足够摊薄人力成本", tone: "good" } },
          { label: "否", result: { title: "托管服务", text: "把运维精力留给业务" } }
        ] } },
      { label: "否", next: {
        question: "数据是否受合规限制？",
        detail: "金融、医疗、政务等",
        options: [
          { label: "是", next: {
            question: "能否接受私有化部署？",
            options: [
              { label: "能", result: { title: "厂商私有化", text: "采购带运维支持的方案" } },
              { label: "不能", result: { title: "暂缓上线", text: "先评估合规边界", tone: "bad" } }
            ] } },
          { label: "否", result: { title: "公有云托管", text: "上手最快，按量付费", tone: "good" } }
        ] } }
    ]
  }
};
