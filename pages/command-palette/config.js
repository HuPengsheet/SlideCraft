/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   appName    背景应用窗口的标题，默认 "工作台"
 *   shortcut   输入框右侧的快捷键提示，默认 "Ctrl K"
 *   placeholder  输入框为空时的提示，默认 "输入命令或搜索…"
 *   typeMs     每个字符的敲击间隔毫秒，默认 90
 *   all[]      全部命令（命令池）。每条 {title, sub, group, key}，title 必填。
 *              输入时按 title + sub 过滤：先找连续子串，找不到再按字符顺序模糊匹配，命中字符高亮
 *   queries[]  依次演示的搜索（至少写一条；不写则只展示打开的面板）
 *     text     要敲入的关键词
 *     pick     选中第几个结果（从 0 开始，默认 0），也可写结果的 title 文字
 *     toast    执行后的提示，默认 "已执行：" + 命令名
 *   最后一条搜索执行后面板保持打开，停在过滤结果和选中项上；之前的搜索执行后面板先关闭再重新打开。
 *   结果列表最多同时显示约 5 行，超出部分随选中项滚动。 */
window.PAGE_CONFIG = {
  theme: "dark",
  appName: "SlideCraft 工作台",
  shortcut: "Ctrl K",
  typeMs: 90,
  all: [
    { title: "新建演示文稿", sub: "从空白或模板开始", group: "文件", key: "N" },
    { title: "打开最近的文件", sub: "最近 10 个项目", group: "文件", key: "O" },
    { title: "导出为 PDF", sub: "保留矢量与字体", group: "文件", key: "E" },
    { title: "导出为网页", sub: "单文件 HTML，可离线打开", group: "文件", key: "H" },
    { title: "切换到浅色主题", sub: "light", group: "外观" },
    { title: "切换到霓虹主题", sub: "neon", group: "外观" },
    { title: "插入图表", sub: "柱状、折线、环形", group: "插入", key: "C" },
    { title: "插入动画页面", sub: "跑马灯、倒计时、时间线…", group: "插入" },
    { title: "开始放映", sub: "从当前页播放", group: "放映", key: "F5" },
    { title: "分享链接", sub: "生成只读预览地址", group: "协作" }
  ],
  queries: [
    { text: "导出", pick: 0, toast: "已导出为 PDF，保存到 下载 文件夹" },
    { text: "主题", pick: 1, toast: "已切换到霓虹主题" }
  ]
};
