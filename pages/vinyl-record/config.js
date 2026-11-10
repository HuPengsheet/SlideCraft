/* 只改这个文件。字段说明：
 *   theme     dark | light | paper | neon | terminal（封套用第 2 强调色，唱片标签用第 1 强调色）
 *   album     封套上的专辑名
 *   artist    艺术家或副标题
 *   side      唱片标签与播放栏上的小字，如 "SIDE A"
 *   label     唱片中心标签的文字（可省略，默认用 album）
 *   lines[]   右侧逐行高亮的歌词或条目，建议 5 到 8 行
 *   beatMs    每行停留时长，毫秒
 *   duration  播放栏右侧显示的总时长文字 */
window.PAGE_CONFIG = {
  theme: "dark",
  album: "慢一点",
  artist: "SlideCraft Records",
  side: "SIDE A · 33⅓",
  label: "慢一点",
  lines: [
    "把唱针轻轻放下",
    "沙沙声先于旋律到来",
    "一圈一圈，时间变慢",
    "旧的歌，新的夜晚",
    "副歌响起的时候",
    "我们都没有说话",
    "让它转完这一面"
  ],
  beatMs: 820,
  duration: "3:42"
};
