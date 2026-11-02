# SlideCraft

HTML 幻灯片与单页特效的素材库，分两部分：

| 目录 | 内容 | 数量 |
|---|---|---|
| [pages/](pages/) | 单页特效模板，如对话模拟、图片墙、数字滚动、图表动画，可嵌进 PPT | 28 个 |
| [templates/](templates/) | 完整的 PPT 模板，每套 10 到 12 页，风格各异 | 34 套 |

所有内容都是纯 HTML、CSS 和 JS，不需要构建，用浏览器直接打开。

## 一、单页特效（pages/）

每个页面是一个独立的小型 HTML，由 `config.js` 驱动：改配置就换内容，不用改代码。可以单独打开，也可以用 `<iframe>` 嵌进 PPT。下面的动图是用浏览器实际录制的。

**总览入口：打开 [pages/index.html](pages/index.html)**，左侧目录、右侧预览，可切换 5 套主题、调速度、重播、全屏。嵌入参数、`postMessage` 控制和新增页面的方法见 [pages/README.md](pages/README.md)。


### 展示

<table>
<tr><td width="50%" valign="top"><a href="pages/gallery/"><img src="previews/pages/gallery.gif" alt="图片展示墙" width="100%"></a><br><b>图片展示墙</b>（<a href="pages/gallery/">pages/gallery</a>）<br>16 张预览图错落入场，悬停倾斜、微摆动，点击放大。改 `index.html` 里的 `CONFIG.items`（独立页面）</td><td width="50%" valign="top"><a href="pages/media-wall/"><img src="previews/pages/media-wall.gif" alt="媒体墙" width="100%"></a><br><b>媒体墙</b>（<a href="pages/media-wall/">pages/media-wall</a>）<br>图片、动图、视频组成的网格，灯箱浏览。`columns`、`aspect`、`fit`、`items[]: {src,name,note}`</td></tr>
<tr><td width="50%" valign="top"><a href="pages/compare-slider/"><img src="previews/pages/compare-slider.gif" alt="前后对比滑块" width="100%"></a><br><b>前后对比滑块</b>（<a href="pages/compare-slider/">pages/compare-slider</a>）<br>拖动分隔线对比两张图，加载时自动扫一遍。`before`/`after` 或 `pairs[]`，`orientation`</td><td width="50%" valign="top"><a href="pages/browser-demo/"><img src="previews/pages/browser-demo.gif" alt="浏览器 / 手机演示" width="100%"></a><br><b>浏览器 / 手机演示</b>（<a href="pages/browser-demo/">pages/browser-demo</a>）<br>窗口里轮播截图，模拟光标移动与点击。`device`、`screens[]: {src,url,caption,cursor[]}`</td></tr>
<tr><td width="50%" valign="top"><a href="pages/carousel-3d/"><img src="previews/pages/carousel-3d.gif" alt="3D 图片轮播" width="100%"></a><br><b>3D 图片轮播</b>（<a href="pages/carousel-3d/">pages/carousel-3d</a>）<br>封面流与环形两种样式，拖动、方向键、点击切换。`style`（`coverflow`|`ring`），`items[]: {src,title,note}`，`autoMs`</td><td width="50%" valign="top"><a href="pages/bento-grid/"><img src="previews/pages/bento-grid.gif" alt="便当盒仪表盘" width="100%"></a><br><b>便当盒仪表盘</b>（<a href="pages/bento-grid/">pages/bento-grid</a>）<br>数字、文字、图片、迷你折线混排的磁贴，自动排布。`columns`，`tiles[]: {type,col,row,w,h,accent}`</td></tr>
</table>

### 对话与终端

<table>
<tr><td width="50%" valign="top"><a href="pages/chat-sim/"><img src="previews/pages/chat-sim.gif" alt="Claude Code 对话模拟" width="100%"></a><br><b>Claude Code 对话模拟</b>（<a href="pages/chat-sim/">pages/chat-sim</a>）<br>逐字输出、工具调用、diff 代码块。改 `conversation.js` 里的 `script`（独立页面）</td><td width="50%" valign="top"><a href="pages/terminal-demo/"><img src="previews/pages/terminal-demo.gif" alt="终端演示" width="100%"></a><br><b>终端演示</b>（<a href="pages/terminal-demo/">pages/terminal-demo</a>）<br>敲命令、输出日志、进度条。`script[]`：`cmd`/`out`/`progress`/`wait`/`clear`</td></tr>
</table>

### 数据

<table>
<tr><td width="50%" valign="top"><a href="pages/number-counter/"><img src="previews/pages/number-counter.gif" alt="数字滚动" width="100%"></a><br><b>数字滚动</b>（<a href="pages/number-counter/">pages/number-counter</a>）<br>大数字依次滚动到目标值，带进度条。`items[]: {value,label,unit,progress}`</td><td width="50%" valign="top"><a href="pages/chart-animated/"><img src="previews/pages/chart-animated.gif" alt="动态图表" width="100%"></a><br><b>动态图表</b>（<a href="pages/chart-animated/">pages/chart-animated</a>）<br>柱状、折线、环形图的生长动画。`type`（`bar`|`line`|`donut`），`labels[]`，`series[]`</td></tr>
<tr><td width="50%" valign="top"><a href="pages/bar-race/"><img src="previews/pages/bar-race.gif" alt="排行榜赛跑" width="100%"></a><br><b>排行榜赛跑</b>（<a href="pages/bar-race/">pages/bar-race</a>）<br>条形随时间重新排序。`frames[]: {label,values}`，`topN`</td><td width="50%" valign="top"><a href="pages/radar-chart/"><img src="previews/pages/radar-chart.gif" alt="雷达图" width="100%"></a><br><b>雷达图</b>（<a href="pages/radar-chart/">pages/radar-chart</a>）<br>多系列多边形从中心生长，悬停高亮，点击图例开关。`axes[]`，`series[]: {name,values}`，`rings`</td></tr>
<tr><td width="50%" valign="top"><a href="pages/funnel-chart/"><img src="previews/pages/funnel-chart.gif" alt="漏斗图" width="100%"></a><br><b>漏斗图</b>（<a href="pages/funnel-chart/">pages/funnel-chart</a>）<br>梯形依次展开，显示阶段转化率。`stages[]: {label,value}`，`scale`，`orientation`</td><td width="50%" valign="top"><a href="pages/gantt-schedule/"><img src="previews/pages/gantt-schedule.gif" alt="甘特图" width="100%"></a><br><b>甘特图</b>（<a href="pages/gantt-schedule/">pages/gantt-schedule</a>）<br>条形生长，进度填充，今日线扫过，里程碑。`unit`，`rows[]: {name,group,start,end,progress}`，`today`</td></tr>
</table>

### 叙事

<table>
<tr><td width="50%" valign="top"><a href="pages/timeline/"><img src="previews/pages/timeline.gif" alt="时间线" width="100%"></a><br><b>时间线</b>（<a href="pages/timeline/">pages/timeline</a>）<br>事件依次点亮，播放结束后可点节点跳转。`orientation`，`events[]: {when,title,text,image}`</td><td width="50%" valign="top"><a href="pages/flow-diagram/"><img src="previews/pages/flow-diagram.gif" alt="流程 / 架构图" width="100%"></a><br><b>流程 / 架构图</b>（<a href="pages/flow-diagram/">pages/flow-diagram</a>）<br>节点依次出现，光点沿连线流动。`layout`（`free`|`row`），`nodes[]`，`edges[]`</td></tr>
<tr><td width="50%" valign="top"><a href="pages/step-tour/"><img src="previews/pages/step-tour.gif" alt="步骤导览" width="100%"></a><br><b>步骤导览</b>（<a href="pages/step-tour/">pages/step-tour</a>）<br>聚光灯依次高亮界面截图上的区域。`image`，`steps[]: {x,y,w,h,title,text}`</td><td width="50%" valign="top"><a href="pages/text-reveal/"><img src="previews/pages/text-reveal.gif" alt="逐句文案" width="100%"></a><br><b>逐句文案</b>（<a href="pages/text-reveal/">pages/text-reveal</a>）<br>打字机、遮罩、逐词、Glitch、淡入。`lines[]: {text,effect,emphasis}`</td></tr>
<tr><td width="50%" valign="top"><a href="pages/kinetic-type/"><img src="previews/pages/kinetic-type.gif" alt="动态排版" width="100%"></a><br><b>动态排版</b>（<a href="pages/kinetic-type/">pages/kinetic-type</a>）<br>预告片式大字：冲击、滑入、回声、拆字、描边。`beatMs`，`lines[]: {text,style,color}`，`finale`</td><td width="50%" valign="top"><a href="pages/quote-carousel/"><img src="previews/pages/quote-carousel.gif" alt="金句轮播" width="100%"></a><br><b>金句轮播</b>（<a href="pages/quote-carousel/">pages/quote-carousel</a>）<br>逐字显现，进度条，圆点和方向键跳转。`layout`，`holdMs`，`quotes[]: {text,by,role}`</td></tr>
<tr><td width="50%" valign="top"><a href="pages/code-showcase/"><img src="previews/pages/code-showcase.gif" alt="代码演示" width="100%"></a><br><b>代码演示</b>（<a href="pages/code-showcase/">pages/code-showcase</a>）<br>语法高亮，逐步 diff 动画，聚焦区域。`steps[]: {code,lang,caption,focus}`</td><td width="50%"></td></tr>
</table>

### 氛围

<table>
<tr><td width="50%" valign="top"><a href="pages/hero-intro/"><img src="previews/pages/hero-intro.gif" alt="开场封面" width="100%"></a><br><b>开场封面</b>（<a href="pages/hero-intro/">pages/hero-intro</a>）<br>粒子、渐变、网格、圆环四种背景。`backdrop`，`title`，`subtitle`</td><td width="50%" valign="top"><a href="pages/marquee/"><img src="previews/pages/marquee.gif" alt="滚动跑马灯" width="100%"></a><br><b>滚动跑马灯</b>（<a href="pages/marquee/">pages/marquee</a>）<br>多行无限滚动的文字、标签或图片。`rows[]: {items,direction,speed,style}`</td></tr>
<tr><td width="50%" valign="top"><a href="pages/countdown/"><img src="previews/pages/countdown.gif" alt="倒计时" width="100%"></a><br><b>倒计时</b>（<a href="pages/countdown/">pages/countdown</a>）<br>翻页数字，可指定真实日期或演示秒数。`target` 或 `demo:{seconds}`，`units`，`style`</td><td width="50%" valign="top"><a href="pages/globe-arcs/"><img src="previews/pages/globe-arcs.gif" alt="旋转地球飞线" width="100%"></a><br><b>旋转地球飞线</b>（<a href="pages/globe-arcs/">pages/globe-arcs</a>）<br>点阵地球，城市涟漪，大圆弧线飞行，可拖动。`cities[]`，`arcs[]: {from,to}`，`rotateSpeed`</td></tr>
<tr><td width="50%" valign="top"><a href="pages/orbit-map/"><img src="previews/pages/orbit-map.gif" alt="轨道式生态图" width="100%"></a><br><b>轨道式生态图</b>（<a href="pages/orbit-map/">pages/orbit-map</a>）<br>同心轨道旋转，悬停暂停并显示说明。`center`，`orbits[]: {speed,items[]}`，`tilt`</td><td width="50%" valign="top"><a href="pages/team-cards/"><img src="previews/pages/team-cards.gif" alt="团队介绍" width="100%"></a><br><b>团队介绍</b>（<a href="pages/team-cards/">pages/team-cards</a>）<br>头像卡片，聚光灯轮流展开，缺照片时生成字母头像。`layout`，`people[]: {name,role,bio,photo}`</td></tr>
<tr><td width="50%" valign="top"><a href="pages/pricing-plans/"><img src="previews/pages/pricing-plans.gif" alt="价格方案" width="100%"></a><br><b>价格方案</b>（<a href="pages/pricing-plans/">pages/pricing-plans</a>）<br>高亮方案的渐变边框，月付年付切换。`billing`，`plans[]: {name,price,features,highlight}`</td><td width="50%"></td></tr>
</table>

## 二、PPT 模板（templates/）

来自 [zarazhangrui/beautiful-html-templates](https://github.com/zarazhangrui/beautiful-html-templates)（MIT 协议，见 [templates/LICENSE](templates/LICENSE)），原样搬运，没有改动。下面每张图是该模板的一页截图（多数是封面）。

**怎么用**：在 [templates/index.json](templates/index.json) 里按场景（`occasion`）和气质（`mood`）选一套，打开 `templates/<名称>/template.html` 预览（方向键翻页），复制最接近你内容的那一页，替换文字和图片。每套模板目录里有 `template.html`、`template.json`（元数据）和 `design.md`（配色、字体、使用规则）。样式内联在各自的 HTML 里，模板之间互不依赖。

<table>
<tr><td width="33%" valign="top"><a href="templates/8-bit-orbit/template.html"><img src="previews/templates/8-bit-orbit.webp" alt="8-Bit Orbit" width="100%"></a><br><b>8-Bit Orbit</b>（dark）<br>像素街机，霓虹配深蓝</td><td width="33%" valign="top"><a href="templates/biennale-yellow/template.html"><img src="previews/templates/biennale-yellow.webp" alt="Biennale Yellow" width="100%"></a><br><b>Biennale Yellow</b>（light）<br>羊皮纸上的日光黄与靛蓝衬线</td><td width="33%" valign="top"><a href="templates/block-frame/template.html"><img src="previews/templates/block-frame.webp" alt="BlockFrame" width="100%"></a><br><b>BlockFrame</b>（light）<br>新粗野主义，粉彩色块配粗黑边</td></tr>
<tr><td width="33%" valign="top"><a href="templates/blue-professional/template.html"><img src="previews/templates/blue-professional.webp" alt="Blue Professional" width="100%"></a><br><b>Blue Professional</b>（light）<br>奶油纸配钴蓝，现代商务</td><td width="33%" valign="top"><a href="templates/bold-poster/template.html"><img src="previews/templates/bold-poster.webp" alt="Bold Poster" width="100%"></a><br><b>Bold Poster</b>（light）<br>超大展示字加消防车红</td><td width="33%" valign="top"><a href="templates/broadside/template.html"><img src="previews/templates/broadside.webp" alt="Broadside" width="100%"></a><br><b>Broadside</b>（dark）<br>深色编辑风，火橙点缀，中英双语字体</td></tr>
<tr><td width="33%" valign="top"><a href="templates/capsule/template.html"><img src="previews/templates/capsule.webp" alt="Capsule" width="100%"></a><br><b>Capsule</b>（light）<br>药丸形卡片，暖白底配糖果色</td><td width="33%" valign="top"><a href="templates/cartesian/template.html"><img src="previews/templates/cartesian.webp" alt="Cartesian" width="100%"></a><br><b>Cartesian</b>（light）<br>暖中性色配 Playfair 衬线，从容克制</td><td width="33%" valign="top"><a href="templates/cobalt-grid/template.html"><img src="previews/templates/cobalt-grid.webp" alt="Cobalt Grid" width="100%"></a><br><b>Cobalt Grid</b>（light）<br>方格纸上的钴蓝衬线</td></tr>
<tr><td width="33%" valign="top"><a href="templates/coral/template.html"><img src="previews/templates/coral.webp" alt="Coral" width="100%"></a><br><b>Coral</b>（mixed）<br>近黑底，奶油与珊瑚色，超大 Bebas Neue</td><td width="33%" valign="top"><a href="templates/creative-mode/template.html"><img src="previews/templates/creative-mode.webp" alt="Creative Mode" width="100%"></a><br><b>Creative Mode</b>（light）<br>奶油纸配绿粉橙黄多色强调</td><td width="33%" valign="top"><a href="templates/daisy-days/template.html"><img src="previews/templates/daisy-days.webp" alt="Daisy Days" width="100%"></a><br><b>Daisy Days</b>（light）<br>手绘雏菊、星星、彩虹，柔和友好</td></tr>
<tr><td width="33%" valign="top"><a href="templates/editorial-forest/template.html"><img src="previews/templates/editorial-forest.webp" alt="Editorial Forest" width="100%"></a><br><b>Editorial Forest</b>（mixed）<br>森林绿、灰粉、暖奶油，季度复盘气质</td><td width="33%" valign="top"><a href="templates/editorial-tri-tone/template.html"><img src="previews/templates/editorial-tri-tone.webp" alt="Editorial Tri-Tone" width="100%"></a><br><b>Editorial Tri-Tone</b>（mixed）<br>灰粉、芥末奶油、深酒红三色编辑系统</td><td width="33%" valign="top"><a href="templates/emerald-editorial/template.html"><img src="previews/templates/emerald-editorial.webp" alt="Emerald Editorial" width="100%"></a><br><b>Emerald Editorial</b>（mixed）<br>翡翠绿、海军蓝、纸色，杂志封面式商务</td></tr>
<tr><td width="33%" valign="top"><a href="templates/grove/template.html"><img src="previews/templates/grove.webp" alt="Grove" width="100%"></a><br><b>Grove</b>（mixed）<br>森林绿底配奶油字，一点锈红</td><td width="33%" valign="top"><a href="templates/long-table/template.html"><img src="previews/templates/long-table.webp" alt="Long Table" width="100%"></a><br><b>Long Table</b>（light）<br>暖奶油与锈红，餐会俱乐部气质</td><td width="33%" valign="top"><a href="templates/mat/template.html"><img src="previews/templates/mat.webp" alt="Mat" width="100%"></a><br><b>Mat</b>（mixed）<br>深鼠尾草绿、骨白、焦橙，20 世纪中期现代主义</td></tr>
<tr><td width="33%" valign="top"><a href="templates/monochrome/template.html"><img src="previews/templates/monochrome.webp" alt="Monochrome" width="100%"></a><br><b>Monochrome</b>（light）<br>象牙账本纸配纯黑字，没有任何颜色</td><td width="33%" valign="top"><a href="templates/neo-grid-bold/template.html"><img src="previews/templates/neo-grid-bold.webp" alt="Neo-Grid Bold" width="100%"></a><br><b>Neo-Grid Bold</b>（light）<br>编辑式新粗野，只有一种荧光黄</td><td width="33%" valign="top"><a href="templates/peoples-platform/template.html"><img src="previews/templates/peoples-platform.webp" alt="People's Platform (Block & Bold)" width="100%"></a><br><b>People's Platform (Block & Bold)</b>（light）<br>活动海报感，蓝橙红配手写字</td></tr>
<tr><td width="33%" valign="top"><a href="templates/pin-and-paper/template.html"><img src="previews/templates/pin-and-paper.webp" alt="Pin & Paper" width="100%"></a><br><b>Pin & Paper</b>（light）<br>黄纸、安全别针插画、蓝墨手写</td><td width="33%" valign="top"><a href="templates/pink-script/template.html"><img src="previews/templates/pink-script.webp" alt="Pink Script — After Hours" width="100%"></a><br><b>Pink Script — After Hours</b>（dark）<br>黑底配亮粉，深夜杂志的奢华感</td><td width="33%" valign="top"><a href="templates/playful/template.html"><img src="previews/templates/playful.webp" alt="Playful" width="100%"></a><br><b>Playful</b>（light）<br>暖桃色底配 Syne 字体，独立产品发布</td></tr>
<tr><td width="33%" valign="top"><a href="templates/raw-grid/template.html"><img src="previews/templates/raw-grid.webp" alt="Raw Grid" width="100%"></a><br><b>Raw Grid</b>（light）<br>新粗野，粗边框、偏移阴影</td><td width="33%" valign="top"><a href="templates/retro-windows/template.html"><img src="previews/templates/retro-windows.webp" alt="Retro Windows" width="100%"></a><br><b>Retro Windows</b>（light）<br>Windows 95 窗口风格</td><td width="33%" valign="top"><a href="templates/retro-zine/template.html"><img src="previews/templates/retro-zine.webp" alt="Retro Zine" width="100%"></a><br><b>Retro Zine</b>（light）<br>米色纸配绿色，孔版印刷杂志</td></tr>
<tr><td width="33%" valign="top"><a href="templates/sakura-chroma/template.html"><img src="previews/templates/sakura-chroma.webp" alt="Sakura Chroma" width="100%"></a><br><b>Sakura Chroma</b>（light）<br>日式老磁带包装，斜向彩虹条</td><td width="33%" valign="top"><a href="templates/scatterbrain/template.html"><img src="previews/templates/scatterbrain.webp" alt="Scatterbrain" width="100%"></a><br><b>Scatterbrain</b>（light）<br>便利贴风格，粉彩纸条配手写</td><td width="33%" valign="top"><a href="templates/signal/template.html"><img src="previews/templates/signal.webp" alt="Signal" width="100%"></a><br><b>Signal</b>（mixed）<br>深海军蓝、骨白纸、一抹哑金</td></tr>
<tr><td width="33%" valign="top"><a href="templates/soft-editorial/template.html"><img src="previews/templates/soft-editorial.webp" alt="Soft Editorial" width="100%"></a><br><b>Soft Editorial</b>（light）<br>Cormorant 衬线，暖纸配鼠尾草绿与腮红粉</td><td width="33%" valign="top"><a href="templates/stencil-tablet/template.html"><img src="previews/templates/stencil-tablet.webp" alt="Stencil & Tablet" width="100%"></a><br><b>Stencil & Tablet</b>（light）<br>骨白纸、镂空标题、六色大地色板</td><td width="33%" valign="top"><a href="templates/studio/template.html"><img src="previews/templates/studio.webp" alt="Studio" width="100%"></a><br><b>Studio</b>（dark）<br>黑底电光黄，高压设计工作室</td></tr>
<tr><td width="33%" valign="top"><a href="templates/vellum/template.html"><img src="previews/templates/vellum.webp" alt="Vellum" width="100%"></a><br><b>Vellum</b>（dark）<br>深蓝配暖黄衬线，安静的学术气质</td><td width="33%"></td><td width="33%"></td></tr>
</table>

### 检查溢出

```
node scripts/check.mjs templates/soft-editorial/template.html
```

检查每页内容是否超出 1920×1080，需要 `google-chrome`。只在 soft-editorial 上跑通过，其他模板的页面结构各不相同，不一定都适用。

## 预览图怎么生成

`previews/` 下的图由 [scripts/make-previews.py](scripts/make-previews.py) 生成：`python3 scripts/make-previews.py pages` 用 Playwright 录制每个单页的动图，`python3 scripts/make-previews.py templates` 取模板截图（需要上游的 screenshots 目录，用环境变量 `BHT_SHOTS` 指定）。改了页面后重新跑即可更新。

## 验证状态

- 34 套模板是原样复制，与上游逐文件比对一致。
- 28 个单页都用 Playwright 的 Chromium 实际加载并录制过动图，页面无 JS 报错，画面有变化。前 16 个录制时发现 bar-race 报错，原因是 player.js 里逐帧时间差可能为负，已在 pages/_shared/player.js 修复。
- 后 12 个页面（雷达图、漏斗图、甘特图、便当盒、团队介绍、金句轮播、旋转地球、3D 轮播、动态排版、轨道图、代码演示、价格方案）由子任务编写并各自用 Playwright 测过：5 套主题、三种视口下不超出舞台、重播不重复、异常配置不崩溃。这些是子任务自己的测量结果，我只复核了语法、动图里画面有变化和入口页能加载，没有逐项重测。
- 入口页 [pages/index.html](pages/index.html) 用 Playwright 测过：28 个页面逐个切换都能加载，主题能传入 iframe。方向键、搜索、URL 记录是在 16 个页面时测的，加到 28 个后没有重测。
- 没有验证的：真实的鼠标拖动和触摸（对比滑块、地球拖动、3D 轮播拖动）、视频素材（示例全是 webp）、高分屏渲染、减少动态效果的静态帧、各页面的观感是否合适。动图只能说明画面在播放，不能说明好不好看。

## 许可

`templates/` 下的内容遵循上游的 MIT 协议。
