/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   title      标题（左上角，可省略）
 *   subtitle   副标题（可省略）
 *   center     { label, sub }  中心节点。label 建议 6 个字以内，sub 可省略
 *   orbits[]   轨道，1 到 3 圈，按从内到外排列，多于 3 圈只取前 3 圈
 *     name     轨道名称，出现在说明卡片里。默认 ORBIT 01、02 ...
 *     speed    转速，度/秒，正数顺时针，负数逆时针。默认 8、-6、4（内圈到外圈）
 *     items[]  卫星，沿轨道均匀分布
 *       label  名称（必填；直接写字符串也可以）
 *       note   说明文字，高亮和悬停时显示在卡片里
 *       mark   显示在圆点里的 1 到 2 个字符，默认取 label 的第一个字
 *   tilt       0 到 60，度。0 是正圆，越大轨道越扁，有透视感。默认 35
 *   labels     "always" 始终显示名称 | "hover" 只在高亮或悬停时显示。默认 always
 *   noteMs     自动演示时，每个卫星的高亮时长，毫秒。默认 1300
 * 播放结束后，鼠标移到卫星上会暂停转动并显示说明。 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "SlideCraft 生态",
  subtitle: "从内容到交付，一张图看清每个模块",
  center: { label: "SlideCraft", sub: "演示工具箱" },
  tilt: 35,
  labels: "always",
  orbits: [
    {
      name: "核心",
      speed: 9,
      items: [
        { label: "编辑器", mark: "编", note: "所见即所得，支持 Markdown 与快捷键。" },
        { label: "模板库", mark: "模", note: "六十多套单页特效，复制配置即可使用。" },
        { label: "主题", mark: "主", note: "五套主题一键切换，页面只引用变量。" },
        { label: "播放器", mark: "放", note: "暂停、倍速、重播，嵌入 iframe 也能控制。" }
      ]
    },
    {
      name: "扩展",
      speed: -6,
      items: [
        { label: "图表", mark: "图", note: "柱状图、折线图、环形图，数据写在配置里。" },
        { label: "终端", mark: "终", note: "录一段命令行演示，逐字敲出。" },
        { label: "时间线", mark: "时", note: "事件依次点亮，播放后可点击跳转。" },
        { label: "对比", mark: "比", note: "拖动分隔线，前后效果一目了然。" },
        { label: "倒计时", mark: "倒", note: "翻页或方块样式，可对准真实时间。" }
      ]
    },
    {
      name: "交付",
      speed: 4,
      items: [
        { label: "导出 PPT", mark: "P", note: "每页以 iframe 嵌入，版式保持 16:9。" },
        { label: "导出视频", mark: "V", note: "按固定帧率录制，适合放进发布稿。" },
        { label: "分享链接", mark: "链", note: "单文件即可打开，离线也能播放。" },
        { label: "团队空间", mark: "队", note: "共享配置与主题，保持统一风格。" },
        { label: "API", mark: "API", note: "postMessage 控制重播、暂停与倍速。" }
      ]
    }
  ]
};
