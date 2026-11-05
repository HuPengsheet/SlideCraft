/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow / title / subtitle   右侧标题区文字（均可省略）
 *   image      大图路径（png jpg webp gif mp4 webm 均可；视频只在放大镜里显示静态首帧效果不保证）。
 *              省略或加载失败时画一张线框示意图
 *   zoom       放大倍数 1.5 到 8，默认 3
 *   hold       每个点位停留时间，毫秒，默认 2200
 *   hint       左下提示，默认 "拖动放大镜，或点击编号"；写 "" 可隐藏
 *   spots[]    最多 8 个点位，自动演示时按顺序走一遍，最后回到第一个
 *     x, y     点位在图上的位置，百分比 0 到 100
 *     label    点位标题
 *     note     点位说明（可省略，超过三行会被截断）
 * 操作：演示结束后可拖动放大镜；松手时若离某个点位很近，右侧说明会切换到该点位。点击图上的编号放大镜会移过去。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "细节",
  title: "把每个像素看清楚",
  subtitle: "设计稿里最容易被忽略的地方，放大看。",
  image: "../gallery/img/studio.webp",
  zoom: 3,
  hold: 2200,
  hint: "拖动放大镜，或点击编号",
  spots: [
    { x: 22, y: 30, label: "标题字距", note: "大标题的字距收紧了两个点，视觉上更紧凑。" },
    { x: 70, y: 28, label: "主视觉", note: "主视觉偏右放置，与左侧文字形成对角平衡。" },
    { x: 50, y: 72, label: "底部信息栏", note: "信息栏使用等宽数字，对齐更整齐。" },
    { x: 85, y: 78, label: "角标", note: "角标只在右下出现一次，作为视线终点。" }
  ]
};
