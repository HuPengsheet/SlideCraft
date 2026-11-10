/* 只改这个文件。字段说明：
 *   theme        dark | light | paper | neon | terminal（色彩偏移取主题第 2、3 个强调色）
 *   eyebrow      标题上方的小字（可省略）
 *   heading      大标题
 *   subheading   标题下的一行（可省略）
 *   osd          左上角的播放标识，默认 "PLAY ▶"
 *   date / clock 左下角的录像日期与时刻（可省略）
 *   counterStart 右下角时间码的起点，格式 时:分:秒
 *   intensity    故障强度 0.3 到 2，默认 1 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "HOME VIDEO · 1998",
  heading: "那年夏天",
  subheading: "从一盘旧录像带开始说起",
  osd: "PLAY ▶",
  date: "JUL. 21 1998",
  clock: "PM 07:42",
  counterStart: "0:12:47",
  intensity: 1
};
