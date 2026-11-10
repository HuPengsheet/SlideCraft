/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 paper
 *   text       要写的字，建议 2 到 6 个。内置笔画数据的字按笔顺写出，
 *              其余字用横笔扫过的方式显出。内置：山 水 之 间 一 十 大 天 永
 *   eyebrow    左上角小字，可省略
 *   sign       写完后右下角的落款，可省略
 *   seal       落款旁的小印章，1 到 2 个字，可省略
 *   per        每一笔的时长，毫秒，默认 460 */
window.PAGE_CONFIG = {
  theme: "paper",
  eyebrow: "笔顺",
  text: "山水之间",
  sign: "丙午年春",
  seal: "印",
  per: 460
};
