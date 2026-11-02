/* 只改这个文件。字段说明：
 *   theme          dark | light | paper | neon | terminal
 *   effect         全局默认效果："type" 打字机 | "mask" 遮罩上滑 | "words" 逐词升起 | "glitch" 故障抖动 | "fade" 淡入
 *   align          "left" | "center" | "right"
 *   size           "xl" | "l" | "m"
 *   hold           每句显示完后的停留，毫秒，默认 1600
 *   showProgress   底部是否显示进度条
 *   lines[]        text 文字（必填）
 *                  effect 本句效果，省略则用全局 effect
 *                  hold 本句停留，省略则用全局 hold
 *                  emphasis 要用强调色标出的子串
 *   最后一句会停留在屏幕上，不会淡出。 */
window.PAGE_CONFIG = {
  theme: "dark",
  effect: "fade",
  align: "left",
  size: "xl",
  hold: 1600,
  showProgress: true,
  lines: [
    { text: "好的演示，从一句话开始。", effect: "type", emphasis: "一句话" },
    { text: "让重点自己站出来。", effect: "mask", emphasis: "重点" },
    { text: "每个词都有它的节奏", effect: "words", emphasis: "节奏" },
    { text: "SIGNAL LOST, THEN FOUND", effect: "glitch", emphasis: "FOUND", hold: 2000 },
    { text: "剩下的，交给时间。", effect: "fade", emphasis: "时间" }
  ]
};
