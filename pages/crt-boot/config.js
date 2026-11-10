/* 只改这个文件。字段说明：
 *   theme       dark | light | paper | neon | terminal（荧光色取主题强调色）
 *   heading     开机后打出的大标题
 *   subheading  标题下的一行小字（可省略）
 *   bootLines[] 自检文字，逐行打出，最多 8 行
 *   typeMs      自检文字每个字的间隔，毫秒
 *   brand       外壳下方的型号文字
 *   flicker     是否保留轻微闪烁与滚动亮带，默认 true */
window.PAGE_CONFIG = {
  theme: "dark",
  heading: "SLIDECRAFT",
  subheading: "READY.",
  bootLines: [
    "SC-BIOS v2.6   (C) 1986 SlideCraft Systems",
    "内存检测 ............ 640K  OK",
    "载入字库 ............ OK",
    "启动展示程序 ........ _"
  ],
  typeMs: 20,
  brand: "SC-1986",
  flicker: true
};
