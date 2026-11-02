/* 只改这个文件。字段说明：
 *   theme     dark | light | paper | neon | terminal
 *   title / subtitle   标题与副标题（可省略）
 *   target    目标时间，ISO 字符串，如 "2026-10-01T09:00:00+08:00"。填了就按真实时间倒数（不受暂停、倍速影响）
 *   demo      { seconds: 90 }：没有 target 时，从 N 秒开始倒数，走播放器时钟（暂停、倍速、重播都有效）
 *   units     显示哪些单位，["d","h","m","s"] 的任意子集；省略的最大单位会并入下一级（只留 m、s 则分钟可超过 59）
 *   labels    自定义单位文字，如 { d:"天", h:"时", m:"分", s:"秒" }
 *   style     "flip" 翻页牌 | "plain" 普通数字块
 *   doneText  倒数结束时显示的文字（并伴随彩带）
 *   urgentBelow  剩余秒数低于该值时数字变红，默认 10；0 关闭 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "新品发布会即将开始",
  subtitle: "2026.03.18  20:00  线上直播",
  // target: "2026-03-18T20:00:00+08:00",
  demo: { seconds: 90 },
  units: ["m", "s"],
  style: "flip",
  doneText: "发布会开始！",
  urgentBelow: 10
};
