# SlideCraft

HTML 页面展示方式的图鉴：按类别整理 73 种单页展示效果，告诉你「一页可以怎么展示」。每个页面都有对应的 AI 提示词，见 [PROMPTS.md](PROMPTS.md)。

纯 HTML、CSS 和 JS，无需构建，浏览器直接打开 [pages/index.html](pages/index.html) 即可浏览全部页面。

## 使用

- 每个页面是独立的小型 HTML：改 `config.js` 换内容，不用改代码。
- 支持 5 套主题（dark、light、paper、neon、terminal）、倍速、暂停和重播。
- 可单独打开，也可以用 `<iframe>` 嵌入演示文稿：

```html
<iframe src="pages/number-counter/index.html?theme=light&speed=1" allow="autoplay"></iframe>
```

嵌入参数、`postMessage` 控制和新增页面的方法见 [pages/README.md](pages/README.md)。想用 AI 做一个同类页面，复制 [PROMPTS.md](PROMPTS.md) 里对应的提示词即可。

## 开场与封面

<table>
<tr><td width="33%" valign="top"><a href="pages/hero-intro/"><img src="previews/pages/hero-intro.gif" alt="开场封面" width="100%"></a><br><b>开场封面</b><br>粒子、渐变、网格、圆环背景</td><td width="33%" valign="top"><a href="pages/countdown/"><img src="previews/pages/countdown.gif" alt="倒计时" width="100%"></a><br><b>倒计时</b><br>翻页数字，可指定日期</td><td width="33%" valign="top"><a href="pages/kinetic-type/"><img src="previews/pages/kinetic-type.gif" alt="动态排版" width="100%"></a><br><b>动态排版</b><br>预告片式大字：冲击、滑入、回声、拆字</td></tr>
<tr><td width="33%" valign="top"><a href="pages/logo-reveal/"><img src="previews/pages/logo-reveal.gif" alt="品牌 Logo 揭示" width="100%"></a><br><b>品牌 Logo 揭示</b><br>描边画出轮廓、填充、高光扫过</td><td width="33%" valign="top"><a href="pages/chapter-title/"><img src="previews/pages/chapter-title.gif" alt="章节转场页" width="100%"></a><br><b>章节转场页</b><br>巨大章节序号滚动，色块或线条背景</td><td width="33%" valign="top"><a href="pages/title-split/"><img src="previews/pages/title-split.gif" alt="分屏标题入场" width="100%"></a><br><b>分屏标题入场</b><br>竖带依次上滑拼成标题</td></tr>
</table>

## 文字与排版

<table>
<tr><td width="33%" valign="top"><a href="pages/text-reveal/"><img src="previews/pages/text-reveal.gif" alt="逐句文案" width="100%"></a><br><b>逐句文案</b><br>打字、遮罩、逐词、Glitch 等切换</td><td width="33%" valign="top"><a href="pages/quote-carousel/"><img src="previews/pages/quote-carousel.gif" alt="金句轮播" width="100%"></a><br><b>金句轮播</b><br>逐字显现，进度条，圆点跳转</td><td width="33%" valign="top"><a href="pages/marquee/"><img src="previews/pages/marquee.gif" alt="滚动跑马灯" width="100%"></a><br><b>滚动跑马灯</b><br>多行无限滚动的文字与 Logo</td></tr>
<tr><td width="33%" valign="top"><a href="pages/particle-text/"><img src="previews/pages/particle-text.gif" alt="粒子成字" width="100%"></a><br><b>粒子成字</b><br>粒子聚成文字，鼠标可冲散</td><td width="33%" valign="top"><a href="pages/credits-roll/"><img src="previews/pages/credits-roll.gif" alt="片尾滚动字幕" width="100%"></a><br><b>片尾滚动字幕</b><br>片尾滚动字幕</td><td width="33%" valign="top"><a href="pages/danmaku/"><img src="previews/pages/danmaku.gif" alt="弹幕墙" width="100%"></a><br><b>弹幕墙</b><br>多轨道弹幕飞过</td></tr>
<tr><td width="33%" valign="top"><a href="pages/word-cloud/"><img src="previews/pages/word-cloud.gif" alt="词云" width="100%"></a><br><b>词云</b><br>按权重螺旋摆放的词云</td><td width="33%" valign="top"><a href="pages/matrix-rain/"><img src="previews/pages/matrix-rain.gif" alt="字符雨" width="100%"></a><br><b>字符雨</b><br>字符雨背景加标题</td><td width="33%"></td></tr>
</table>

## 数据可视化

<table>
<tr><td width="33%" valign="top"><a href="pages/number-counter/"><img src="previews/pages/number-counter.gif" alt="数字滚动" width="100%"></a><br><b>数字滚动</b><br>大数字依次滚动到目标值</td><td width="33%" valign="top"><a href="pages/chart-animated/"><img src="previews/pages/chart-animated.gif" alt="动态图表" width="100%"></a><br><b>动态图表</b><br>柱状图、折线图、环形图生长动画</td><td width="33%" valign="top"><a href="pages/bar-race/"><img src="previews/pages/bar-race.gif" alt="排行榜赛跑" width="100%"></a><br><b>排行榜赛跑</b><br>条形随时间重排</td></tr>
<tr><td width="33%" valign="top"><a href="pages/radar-chart/"><img src="previews/pages/radar-chart.gif" alt="雷达图" width="100%"></a><br><b>雷达图</b><br>多系列多边形生长，悬停高亮、点击开关</td><td width="33%" valign="top"><a href="pages/funnel-chart/"><img src="previews/pages/funnel-chart.gif" alt="漏斗图" width="100%"></a><br><b>漏斗图</b><br>阶段转化率，梯形依次展开</td><td width="33%" valign="top"><a href="pages/gantt-schedule/"><img src="previews/pages/gantt-schedule.gif" alt="甘特图" width="100%"></a><br><b>甘特图</b><br>条形生长，进度填充，今日线扫过</td></tr>
<tr><td width="33%" valign="top"><a href="pages/gauge-dashboard/"><img src="previews/pages/gauge-dashboard.gif" alt="仪表盘" width="100%"></a><br><b>仪表盘</b><br>指针或弧线仪表，分区着色</td><td width="33%" valign="top"><a href="pages/progress-rings/"><img src="previews/pages/progress-rings.gif" alt="进度环组" width="100%"></a><br><b>进度环组</b><br>嵌套进度环</td><td width="33%" valign="top"><a href="pages/heatmap-calendar/"><img src="previews/pages/heatmap-calendar.gif" alt="热力日历" width="100%"></a><br><b>热力日历</b><br>贡献图式热力日历</td></tr>
<tr><td width="33%" valign="top"><a href="pages/sankey-flow/"><img src="previews/pages/sankey-flow.gif" alt="桑基图" width="100%"></a><br><b>桑基图</b><br>桑基图，流量带依次展开</td><td width="33%" valign="top"><a href="pages/treemap/"><img src="previews/pages/treemap.gif" alt="矩形树图" width="100%"></a><br><b>矩形树图</b><br>矩形树图，面积表示数值</td><td width="33%" valign="top"><a href="pages/stock-ticker/"><img src="previews/pages/stock-ticker.gif" alt="行情滚动条" width="100%"></a><br><b>行情滚动条</b><br>行情滚动条加实时折线</td></tr>
</table>

## 流程与结构

<table>
<tr><td width="33%" valign="top"><a href="pages/timeline/"><img src="previews/pages/timeline.gif" alt="时间线" width="100%"></a><br><b>时间线</b><br>事件依次点亮，可点击跳转</td><td width="33%" valign="top"><a href="pages/flow-diagram/"><img src="previews/pages/flow-diagram.gif" alt="流程 / 架构图" width="100%"></a><br><b>流程 / 架构图</b><br>节点出现，数据光点沿连线流动</td><td width="33%" valign="top"><a href="pages/step-tour/"><img src="previews/pages/step-tour.gif" alt="步骤导览" width="100%"></a><br><b>步骤导览</b><br>聚光灯依次高亮界面区域</td></tr>
<tr><td width="33%" valign="top"><a href="pages/orbit-map/"><img src="previews/pages/orbit-map.gif" alt="轨道式生态图" width="100%"></a><br><b>轨道式生态图</b><br>同心轨道旋转，悬停查看说明</td><td width="33%" valign="top"><a href="pages/org-chart/"><img src="previews/pages/org-chart.gif" alt="组织架构树" width="100%"></a><br><b>组织架构树</b><br>组织架构树，可折叠展开</td><td width="33%" valign="top"><a href="pages/mind-map/"><img src="previews/pages/mind-map.gif" alt="思维导图" width="100%"></a><br><b>思维导图</b><br>思维导图，分支逐层生长</td></tr>
<tr><td width="33%" valign="top"><a href="pages/roadmap/"><img src="previews/pages/roadmap.gif" alt="产品路线图" width="100%"></a><br><b>产品路线图</b><br>季度路线图，状态与进度</td><td width="33%" valign="top"><a href="pages/swimlane/"><img src="previews/pages/swimlane.gif" alt="泳道流程图" width="100%"></a><br><b>泳道流程图</b><br>跨角色泳道流程图</td><td width="33%" valign="top"><a href="pages/decision-tree/"><img src="previews/pages/decision-tree.gif" alt="决策树" width="100%"></a><br><b>决策树</b><br>决策树，沿选择路径高亮</td></tr>
<tr><td width="33%" valign="top"><a href="pages/swot-matrix/"><img src="previews/pages/swot-matrix.gif" alt="四象限矩阵" width="100%"></a><br><b>四象限矩阵</b><br>SWOT 四象限与散点</td><td width="33%" valign="top"><a href="pages/layer-stack/"><img src="previews/pages/layer-stack.gif" alt="分层架构图" width="100%"></a><br><b>分层架构图</b><br>分层架构图，点击放大一层</td><td width="33%"></td></tr>
</table>

## 媒体与图片

<table>
<tr><td width="33%" valign="top"><a href="pages/gallery/"><img src="previews/pages/gallery.gif" alt="图片展示墙" width="100%"></a><br><b>图片展示墙</b><br>16 张图错落入场，悬停倾斜，点击放大</td><td width="33%" valign="top"><a href="pages/media-wall/"><img src="previews/pages/media-wall.gif" alt="媒体墙（可配置）" width="100%"></a><br><b>媒体墙（可配置）</b><br>图片、动图、视频网格，灯箱浏览</td><td width="33%" valign="top"><a href="pages/compare-slider/"><img src="previews/pages/compare-slider.gif" alt="前后对比滑块" width="100%"></a><br><b>前后对比滑块</b><br>拖动分隔线对比两张图，自动扫动</td></tr>
<tr><td width="33%" valign="top"><a href="pages/carousel-3d/"><img src="previews/pages/carousel-3d.gif" alt="3D 图片轮播" width="100%"></a><br><b>3D 图片轮播</b><br>封面流与环形两种样式，拖动、方向键切换</td><td width="33%" valign="top"><a href="pages/polaroid-scatter/"><img src="previews/pages/polaroid-scatter.gif" alt="拍立得散落" width="100%"></a><br><b>拍立得散落</b><br>拍立得散落桌面</td><td width="33%" valign="top"><a href="pages/parallax-layers/"><img src="previews/pages/parallax-layers.gif" alt="视差分层" width="100%"></a><br><b>视差分层</b><br>鼠标驱动的视差分层</td></tr>
<tr><td width="33%" valign="top"><a href="pages/flip-cards/"><img src="previews/pages/flip-cards.gif" alt="翻转卡片" width="100%"></a><br><b>翻转卡片</b><br>3D 翻转卡片</td><td width="33%" valign="top"><a href="pages/zoom-lens/"><img src="previews/pages/zoom-lens.gif" alt="放大镜细节" width="100%"></a><br><b>放大镜细节</b><br>放大镜巡游细节</td><td width="33%" valign="top"><a href="pages/video-frame/"><img src="previews/pages/video-frame.gif" alt="设备相框视频" width="100%"></a><br><b>设备相框视频</b><br>笔记本、手机、电视外框加标注线</td></tr>
</table>

## 产品与界面演示

<table>
<tr><td width="33%" valign="top"><a href="pages/chat-sim/"><img src="previews/pages/chat-sim.gif" alt="Claude Code 对话模拟" width="100%"></a><br><b>Claude Code 对话模拟</b><br>逐字输出、工具调用、diff 代码块</td><td width="33%" valign="top"><a href="pages/terminal-demo/"><img src="previews/pages/terminal-demo.gif" alt="终端演示" width="100%"></a><br><b>终端演示</b><br>敲命令、输出日志、进度条</td><td width="33%" valign="top"><a href="pages/browser-demo/"><img src="previews/pages/browser-demo.gif" alt="浏览器 / 手机演示" width="100%"></a><br><b>浏览器 / 手机演示</b><br>截图轮播加模拟光标点击</td></tr>
<tr><td width="33%" valign="top"><a href="pages/code-showcase/"><img src="previews/pages/code-showcase.gif" alt="代码演示" width="100%"></a><br><b>代码演示</b><br>语法高亮，逐步 diff，聚焦区域</td><td width="33%" valign="top"><a href="pages/phone-scroll/"><img src="previews/pages/phone-scroll.gif" alt="手机长图滚动" width="100%"></a><br><b>手机长图滚动</b><br>手机里滚动长截图，停靠批注</td><td width="33%" valign="top"><a href="pages/notification-stack/"><img src="previews/pages/notification-stack.gif" alt="通知堆叠" width="100%"></a><br><b>通知堆叠</b><br>系统通知依次弹出堆叠</td></tr>
<tr><td width="33%" valign="top"><a href="pages/command-palette/"><img src="previews/pages/command-palette.gif" alt="命令面板" width="100%"></a><br><b>命令面板</b><br>命令面板输入、过滤、执行</td><td width="33%" valign="top"><a href="pages/chat-bubbles/"><img src="previews/pages/chat-bubbles.gif" alt="聊天气泡" width="100%"></a><br><b>聊天气泡</b><br>聊天气泡，输入中动画</td><td width="33%" valign="top"><a href="pages/api-playground/"><img src="previews/pages/api-playground.gif" alt="接口调试" width="100%"></a><br><b>接口调试</b><br>接口调试：请求与响应</td></tr>
<tr><td width="33%" valign="top"><a href="pages/live-dashboard/"><img src="previews/pages/live-dashboard.gif" alt="实时监控面板" width="100%"></a><br><b>实时监控面板</b><br>实时监控面板，异常告警</td><td width="33%" valign="top"><a href="pages/form-wizard/"><img src="previews/pages/form-wizard.gif" alt="表单向导" width="100%"></a><br><b>表单向导</b><br>多步表单自动填写</td><td width="33%"></td></tr>
</table>

## 信息版式

<table>
<tr><td width="33%" valign="top"><a href="pages/bento-grid/"><img src="previews/pages/bento-grid.gif" alt="便当盒仪表盘" width="100%"></a><br><b>便当盒仪表盘</b><br>数字、文字、图片、迷你折线混排的磁贴</td><td width="33%" valign="top"><a href="pages/team-cards/"><img src="previews/pages/team-cards.gif" alt="团队介绍" width="100%"></a><br><b>团队介绍</b><br>头像卡片聚光灯轮流展开</td><td width="33%" valign="top"><a href="pages/pricing-plans/"><img src="previews/pages/pricing-plans.gif" alt="价格方案" width="100%"></a><br><b>价格方案</b><br>高亮方案渐变边框，月付年付切换</td></tr>
<tr><td width="33%" valign="top"><a href="pages/faq-accordion/"><img src="previews/pages/faq-accordion.gif" alt="问答折叠" width="100%"></a><br><b>问答折叠</b><br>问答手风琴</td><td width="33%" valign="top"><a href="pages/feature-table/"><img src="previews/pages/feature-table.gif" alt="功能对比表" width="100%"></a><br><b>功能对比表</b><br>功能对比表，推荐列高亮</td><td width="33%" valign="top"><a href="pages/checklist-progress/"><img src="previews/pages/checklist-progress.gif" alt="清单进度" width="100%"></a><br><b>清单进度</b><br>清单逐项勾选，总进度增长</td></tr>
<tr><td width="33%" valign="top"><a href="pages/testimonial-wall/"><img src="previews/pages/testimonial-wall.gif" alt="评价墙" width="100%"></a><br><b>评价墙</b><br>评价墙，多列反向滚动</td><td width="33%" valign="top"><a href="pages/stat-compare/"><img src="previews/pages/stat-compare.gif" alt="数字对比" width="100%"></a><br><b>数字对比</b><br>左右大数字对比与差值</td><td width="33%" valign="top"><a href="pages/agenda-list/"><img src="previews/pages/agenda-list.gif" alt="议程目录" width="100%"></a><br><b>议程目录</b><br>议程目录，当前项高亮</td></tr>
</table>

## 3D 与氛围

<table>
<tr><td width="33%" valign="top"><a href="pages/globe-arcs/"><img src="previews/pages/globe-arcs.gif" alt="旋转地球飞线" width="100%"></a><br><b>旋转地球飞线</b><br>点阵地球、城市涟漪、大圆弧线，可拖动</td><td width="33%" valign="top"><a href="pages/tag-sphere/"><img src="previews/pages/tag-sphere.gif" alt="3D 标签球" width="100%"></a><br><b>3D 标签球</b><br>3D 标签球</td><td width="33%" valign="top"><a href="pages/aurora-bg/"><img src="previews/pages/aurora-bg.gif" alt="极光背景" width="100%"></a><br><b>极光背景</b><br>极光流动渐变背景</td></tr>
<tr><td width="33%" valign="top"><a href="pages/cube-rotate/"><img src="previews/pages/cube-rotate.gif" alt="立方体翻面" width="100%"></a><br><b>立方体翻面</b><br>3D 立方体翻面</td><td width="33%" valign="top"><a href="pages/ripple-grid/"><img src="previews/pages/ripple-grid.gif" alt="波纹点阵" width="100%"></a><br><b>波纹点阵</b><br>点阵波纹</td><td width="33%" valign="top"><a href="pages/terrain-lines/"><img src="previews/pages/terrain-lines.gif" alt="山脉线条" width="100%"></a><br><b>山脉线条</b><br>线条山脉</td></tr>
<tr><td width="33%" valign="top"><a href="pages/isometric-city/"><img src="previews/pages/isometric-city.gif" alt="等距城市" width="100%"></a><br><b>等距城市</b><br>等距方块城市升起</td><td width="33%"></td><td width="33%"></td></tr>
</table>

## 工具

[scripts/make-previews.py](scripts/make-previews.py) 用 Playwright 录制页面动图到 `previews/`，依赖 Playwright 与 Pillow。
