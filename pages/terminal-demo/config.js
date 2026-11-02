/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal（默认 terminal）
 *   windowTitle  窗口标题栏文字
 *   prompt     提示符，如 "$ "、"~/app ❯ "（可用 promptColor 改颜色）
 *   promptColor  颜色名或 CSS 颜色，默认 good
 *   typeSpeed  打字速度，每个字符毫秒，默认 45
 *   lineDelay  streamed 输出每行间隔毫秒，默认 90
 *   cursor     结尾是否保留闪烁光标，默认 true
 *   script[]   按顺序执行的步骤，type 为下列之一：
 *     cmd       { text, delay? }  先显示提示符，再逐字打出命令，回车。delay 为回车前停顿
 *     out       { text, color?, stream? }  输出一行。stream:true 表示该行逐字流出
 *               或用 segs:[{text,color}] 写多色片段；color 可写 good bad accent accent-2 accent-3 soft
 *               也可写任意 CSS 颜色
 *     progress  { label?, ms, width?, doneText?, color? }  进度条，ms 为走满所需时间
 *     wait      { ms }  停顿
 *     clear     {}  清屏 */
window.PAGE_CONFIG = {
  theme: "terminal",
  windowTitle: "penghu@dev: ~/slidecraft",
  prompt: "$ ",
  typeSpeed: 45,
  script: [
    { type: "cmd", text: "git clone https://github.com/demo/slidecraft.git" },
    { type: "out", text: "正克隆到 'slidecraft'...", color: "soft" },
    { type: "progress", label: "接收对象", ms: 1400, doneText: "完成" },
    { type: "cmd", text: "cd slidecraft && npm install" },
    { type: "out", text: "added 120 packages in 3s", color: "good" },
    { type: "out", segs: [{ text: "warn ", color: "accent-2" }, { text: "2 packages are looking for funding" }] },
    { type: "wait", ms: 500 },
    { type: "cmd", text: "npm run build" },
    { type: "progress", label: "构建", ms: 1800 },
    { type: "out", segs: [{ text: "✔ ", color: "good" }, { text: "已生成 14 个页面，用时 1.8s" }] },
    { type: "out", text: "有一个警告：图片 cover.png 超过 500KB", color: "bad" },
    { type: "wait", ms: 800 },
    { type: "cmd", text: "echo \"全部完成\"" },
    { type: "out", text: "全部完成", stream: true }
  ]
};
