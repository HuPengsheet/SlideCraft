/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   charset    字符集：预设名 digits | binary | code | hanzi | katakana，
 *              或直接写一串自定义字符（如 "SLIDECRAFT01"），默认 code
 *   density    列密度 0.2 到 1，默认 0.7
 *   speed      下落速度倍率，默认 1
 *   size       字号，单位 em，默认 1.1，范围 0.7 到 2.5
 *   seed       随机种子，默认 11
 *   mode       avoid（雨绕开标题区域，默认）| overlay（雨叠在标题之上）
 *   eyebrow / title / subtitle   中央文字，可省略；标题会以乱码逐字定格的方式出现
 *   播放后字符雨持续下落，重播时重新开始。 */
window.PAGE_CONFIG = {
  theme: "terminal",
  charset: "code",
  density: 0.7,
  speed: 1,
  size: 1.1,
  seed: 11,
  mode: "avoid",
  eyebrow: "SYSTEM ONLINE",
  title: "进入数据深处",
  subtitle: "scroll down to continue"
};
