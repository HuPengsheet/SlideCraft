/* 只改这个文件。字段说明：
 *   theme        dark | light | paper | neon | terminal，默认 dark
 *   scrollSpeed  滚动速度，单位 em/秒（1em 约为舞台宽度的 1.6%），默认 4，范围 0.5 到 30
 *                （播放器的倍速按钮会在此基础上再缩放）
 *   groups[]     分组，每组：
 *                  title    分组标题（如 "导演"），可省略
 *                  people[] 人名，可以是字符串，也可以是 { role, name }；
 *                           有 role 时职位居左、人名居右，只有人名时居中
 *   endTitle     最后停在屏幕中央的标题，可用 \n 换行，可省略
 *   endSub       endTitle 下方的小字，可省略 */
window.PAGE_CONFIG = {
  theme: "dark",
  scrollSpeed: 4,
  groups: [
    { title: "主创", people: [
      { role: "导演", name: "林一舟" }, { role: "编剧", name: "周小满" }, { role: "制片", name: "陈子昂" }
    ] },
    { title: "设计", people: [
      { role: "视觉设计", name: "苏念" }, { role: "动效设计", name: "韩知远" }, { role: "字体设计", name: "顾清" }
    ] },
    { title: "工程", people: [
      { role: "前端", name: "彭虎" }, { role: "前端", name: "李沐" }, { role: "测试", name: "许然" }
    ] },
    { title: "特别鸣谢", people: ["所有试用过的朋友", "每一位提出反馈的人"] }
  ],
  endTitle: "谢谢观看",
  endSub: "SlideCraft · 2026"
};
