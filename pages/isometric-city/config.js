/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow    标题上方小字，可省略
 *   title      左上角标题，可省略
 *   subtitle   标题下的说明，可省略
 *   grid       网格边长（格），3 到 24，默认 12。仅在没有 heightMap 时生效
 *   heightMap  二维数组，每个数字是该格方块的高度（层数，0 表示空地，最大 12）。
 *              行长不一致时按最长的补 0。省略则按 seed 生成一座中心高、四周低的城市
 *   seed       随机种子，默认 5
 *   highlight  用强调色标出的方块：[{ x: 列, y: 行 }, ...]，从 0 开始；越界的忽略
 *   rotate     镜头自转速度，度/秒，默认 5；0 为静止，负数反向
 *   块数 = heightMap 中大于 0 的格子数。方块按距中心的远近依次升起。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "Smart City",
  title: "规模，一格一格长出来",
  subtitle: "144 个节点，从地面升起。",
  grid: 12,
  seed: 5,
  rotate: 5,
  highlight: [{ x: 6, y: 5 }, { x: 3, y: 8 }, { x: 9, y: 3 }]
};
