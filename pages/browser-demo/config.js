/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal
 *   device     "browser"（浏览器窗口，16:9 屏幕）| "phone"（手机，竖屏，图片会居中裁切铺满）
 *   tabs       true 时浏览器顶部显示每个 screen 一个标签页，默认 false 只显示当前页
 *   hold       每个画面光标走完后的停留毫秒，默认 1200
 *   cursorSpeed  光标移动一段默认耗时毫秒，默认 800
 *   screens[]  依次展示的画面
 *     src      图片（png/jpg/webp/gif）或视频（mp4/webm），必填
 *     url      地址栏文字（browser 用）
 *     title    标签页标题，缺省取 url
 *     caption  画面下方的说明文字
 *     cursor[] 光标路径，x、y 为屏幕区域的百分比（0 到 100）
 *              click: true 到达后点击（波纹）   ms: 本段移动耗时   pause: 到达后停顿毫秒
 *              不写 cursor 则该画面不出现光标动作 */
window.PAGE_CONFIG = {
  theme: "dark",
  device: "browser",
  tabs: true,
  hold: 1200,
  screens: [
    { src: "../gallery/img/soft-editorial.webp", url: "https://slidecraft.dev/gallery", title: "模板画廊", caption: "第一步：在画廊里挑选一个模板",
      cursor: [{ x: 85, y: 85 }, { x: 30, y: 45, click: true }] },
    { src: "../gallery/img/coral.webp", url: "https://slidecraft.dev/editor/coral", title: "编辑器 · coral", caption: "第二步：点击标题，直接修改文字",
      cursor: [{ x: 60, y: 30 }, { x: 50, y: 50, click: true }, { x: 75, y: 78, click: true, ms: 1000 }] },
    { src: "../gallery/img/vellum.webp", url: "https://slidecraft.dev/export", title: "导出", caption: "第三步：一键导出为 PDF 或 HTML",
      cursor: [{ x: 20, y: 70 }, { x: 52, y: 62, click: true }] }
  ]
};
