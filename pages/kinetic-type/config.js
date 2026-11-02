/* 只改这个文件。字段说明：
 *   theme       dark | light | paper | neon | terminal，默认 dark
 *   beatMs      每句占据的时长（一拍），毫秒，默认 900
 *   background  "solid"（纯色）| "flash"（每拍一次闪光），默认 solid
 *   finale      "stack"（最后把所有句子叠成一张海报）| "none"（停在最后一句），默认 stack
 *   lines[]     每一项占满整个舞台一拍
 *                 text   文字（必填；字号会自动缩放到舞台宽度内，太长会自动换行）
 *                 style  punch 弹出+抖动 | slide 斜切滑入+拖影 | echo 外扩描边回声
 *                        split 字符飞入拼合 | outline 描边再填充。省略时按顺序轮换
 *                 color  fg | accent | accent-2 | accent-3，默认 fg */
window.PAGE_CONFIG = {
  theme: "dark",
  beatMs: 900,
  background: "flash",
  finale: "stack",
  lines: [
    { text: "每一页", style: "punch" },
    { text: "都是一场发布会", style: "slide", color: "accent" },
    { text: "Faster", style: "echo", color: "accent-2" },
    { text: "更清晰 更有力", style: "split" },
    { text: "SlideCraft", style: "outline", color: "accent-3" },
    { text: "现在开始", style: "punch", color: "accent" }
  ]
};
