# pages

单页 HTML 特效，可单独打开，也可用 `<iframe>` 嵌入 PPT。打开 [index.html](index.html) 浏览全部页面，可切换主题、调速度、重播、全屏。

## 用法

1. 打开某个页面目录下的 `config.js`，改里面的 `window.PAGE_CONFIG`，字段说明写在文件开头的注释里。
2. 直接用浏览器打开该目录的 `index.html`，或者嵌入 iframe：
   ```html
   <iframe src="pages/number-counter/index.html?theme=light&speed=1" allow="autoplay"></iframe>
   ```
3. 支持的 URL 参数：`theme`（见下）、`speed`（0.5 / 1 / 2 / 4）、`loop`（1 循环播放）、`controls`（0 隐藏右下角按钮）、`autoplay`（0 不自动开始，等父页面用 postMessage 触发）。
4. 从父页面控制：
   ```js
   iframe.contentWindow.postMessage({ sc: "cmd", cmd: "replay" }, "*");   // 重播
   iframe.contentWindow.postMessage({ sc: "cmd", cmd: "pause" }, "*");    // 暂停
   iframe.contentWindow.postMessage({ sc: "cmd", cmd: "resume" }, "*");   // 继续
   iframe.contentWindow.postMessage({ sc: "cmd", cmd: "speed", value: 2 }, "*");
   ```
   页面加载完向父页面发送 `{sc:"ready"}`，播放完发送 `{sc:"done"}`。

`gallery/` 和 `chat-sim/` 未接入共用底座，不支持 `theme`、`speed` 参数。

## 共用底座（`_shared/`）

- [themes.css](_shared/themes.css)：5 套主题（`dark`、`light`、`paper`、`neon`、`terminal`），一组 CSS 变量。页面只引用 `--bg --fg --accent` 等变量，不写死颜色，换主题不用改页面代码。
- [base.css](_shared/base.css)：固定 16:9 的 `.stage` 舞台，字号按舞台宽度等比缩放（`1em` ≈ 舞台宽度的 1.6%），所以同一份 CSS 在任何尺寸下都不会错位。
- [core.js](_shared/core.js)：挂在 `window.SC` 上的工具函数——DOM 选择、转义、`**粗体**`/`[[代码]]`富文本、数字格式化、可复现随机数、数字滚动 `SC.countUp`、打字机 `SC.type`、图片/视频统一加载 `SC.media`。
- [player.js](_shared/player.js)：`SC.init(defaults)` 读取 `config.js` 和 URL 参数，返回 `{ cfg, player, stage }`；`player.play(async (r) => {...})` 注册播放逻辑，`r.wait(ms)`、`r.raf(fn)`、`r.spawn(p)` 都会响应暂停、倍速、重播中断。同时负责右下角的暂停/重播/倍速按钮、空格键暂停、R 键重播、postMessage。

### 开场与封面

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [hero-intro](hero-intro/) | 粒子、渐变、网格、圆环四种背景 | `backdrop`，`title`，`subtitle` |
| [countdown](countdown/) | 翻页数字，可指定真实日期或演示秒数 | `target` 或 `demo:{seconds}`，`units`，`style` |
| [kinetic-type](kinetic-type/) | 预告片式大字：冲击、滑入、回声、拆字、描边 | `beatMs`，`lines[]: {text,style,color}`，`finale` |
| [logo-reveal](logo-reveal/) | 描边画出轮廓、填充、高光扫过 | 见 `config.js` 开头注释 |
| [chapter-title](chapter-title/) | 巨大章节序号滚动，色块或线条背景 | 见 `config.js` 开头注释 |
| [title-split](title-split/) | 竖带依次上滑拼成标题 | 见 `config.js` 开头注释 |

### 文字与排版

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [text-reveal](text-reveal/) | 打字机、遮罩、逐词、Glitch、淡入 | `lines[]: {text,effect,emphasis}` |
| [quote-carousel](quote-carousel/) | 逐字显现，进度条，圆点和方向键跳转 | `layout`，`holdMs`，`quotes[]: {text,by,role}` |
| [marquee](marquee/) | 多行无限滚动的文字、标签或图片 | `rows[]: {items,direction,speed,style}` |
| [particle-text](particle-text/) | 粒子聚成文字，鼠标可冲散 | 见 `config.js` 开头注释 |
| [credits-roll](credits-roll/) | 片尾滚动字幕 | 见 `config.js` 开头注释 |
| [danmaku](danmaku/) | 多轨道弹幕飞过 | 见 `config.js` 开头注释 |
| [word-cloud](word-cloud/) | 按权重螺旋摆放的词云 | 见 `config.js` 开头注释 |
| [matrix-rain](matrix-rain/) | 字符雨背景加标题 | 见 `config.js` 开头注释 |

### 数据可视化

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [number-counter](number-counter/) | 大数字依次滚动到目标值，带进度条 | `items[]: {value,label,unit,progress}` |
| [chart-animated](chart-animated/) | 柱状、折线、环形图的生长动画 | `type`（`bar`\|`line`\|`donut`），`labels[]`，`series[]` |
| [bar-race](bar-race/) | 条形随时间重新排序 | `frames[]: {label,values}`，`topN` |
| [radar-chart](radar-chart/) | 多系列多边形从中心生长，悬停高亮，点击图例开关 | `axes[]`，`series[]: {name,values}`，`rings` |
| [funnel-chart](funnel-chart/) | 梯形依次展开，显示阶段转化率 | `stages[]: {label,value}`，`scale`，`orientation` |
| [gantt-schedule](gantt-schedule/) | 条形生长，进度填充，今日线扫过，里程碑 | `unit`，`rows[]: {name,group,start,end,progress}`，`today` |
| [gauge-dashboard](gauge-dashboard/) | 指针或弧线仪表，分区着色 | 见 `config.js` 开头注释 |
| [progress-rings](progress-rings/) | 嵌套进度环 | 见 `config.js` 开头注释 |
| [heatmap-calendar](heatmap-calendar/) | 贡献图式热力日历 | 见 `config.js` 开头注释 |
| [sankey-flow](sankey-flow/) | 桑基图，流量带依次展开 | 见 `config.js` 开头注释 |
| [treemap](treemap/) | 矩形树图，面积表示数值 | 见 `config.js` 开头注释 |
| [stock-ticker](stock-ticker/) | 行情滚动条加实时折线 | 见 `config.js` 开头注释 |

### 流程与结构

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [timeline](timeline/) | 事件依次点亮，播放结束后可点节点跳转 | `orientation`，`events[]: {when,title,text,image}` |
| [flow-diagram](flow-diagram/) | 节点依次出现，光点沿连线流动 | `layout`（`free`\|`row`），`nodes[]`，`edges[]` |
| [step-tour](step-tour/) | 聚光灯依次高亮界面截图上的区域 | `image`，`steps[]: {x,y,w,h,title,text}` |
| [orbit-map](orbit-map/) | 同心轨道旋转，悬停暂停并显示说明 | `center`，`orbits[]: {speed,items[]}`，`tilt` |
| [org-chart](org-chart/) | 组织架构树，可折叠展开 | 见 `config.js` 开头注释 |
| [mind-map](mind-map/) | 思维导图，分支逐层生长 | 见 `config.js` 开头注释 |
| [roadmap](roadmap/) | 季度路线图，状态与进度 | 见 `config.js` 开头注释 |
| [swimlane](swimlane/) | 跨角色泳道流程图 | 见 `config.js` 开头注释 |
| [decision-tree](decision-tree/) | 决策树，沿选择路径高亮 | 见 `config.js` 开头注释 |
| [swot-matrix](swot-matrix/) | SWOT 四象限与散点 | 见 `config.js` 开头注释 |
| [layer-stack](layer-stack/) | 分层架构图，点击放大一层 | 见 `config.js` 开头注释 |

### 媒体与图片

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [gallery](gallery/) | 16 张预览图错落入场，悬停倾斜、微摆动，点击放大 | 改 `index.html` 里的 `CONFIG.items`（独立页面） |
| [media-wall](media-wall/) | 图片、动图、视频组成的网格，灯箱浏览 | `columns`、`aspect`、`fit`、`items[]: {src,name,note}` |
| [compare-slider](compare-slider/) | 拖动分隔线对比两张图，加载时自动扫一遍 | `before`/`after` 或 `pairs[]`，`orientation` |
| [carousel-3d](carousel-3d/) | 封面流与环形两种样式，拖动、方向键、点击切换 | `style`（`coverflow`\|`ring`），`items[]: {src,title,note}`，`autoMs` |
| [polaroid-scatter](polaroid-scatter/) | 拍立得散落桌面 | 见 `config.js` 开头注释 |
| [parallax-layers](parallax-layers/) | 鼠标驱动的视差分层 | 见 `config.js` 开头注释 |
| [flip-cards](flip-cards/) | 3D 翻转卡片 | 见 `config.js` 开头注释 |
| [zoom-lens](zoom-lens/) | 放大镜巡游细节 | 见 `config.js` 开头注释 |
| [video-frame](video-frame/) | 笔记本、手机、电视外框加标注线 | 见 `config.js` 开头注释 |

### 产品与界面演示

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [chat-sim](chat-sim/) | 逐字输出、工具调用、diff 代码块 | 改 `conversation.js` 里的 `script`（独立页面） |
| [terminal-demo](terminal-demo/) | 敲命令、输出日志、进度条 | `script[]`：`cmd`/`out`/`progress`/`wait`/`clear` |
| [browser-demo](browser-demo/) | 窗口里轮播截图，模拟光标移动与点击 | `device`、`screens[]: {src,url,caption,cursor[]}` |
| [code-showcase](code-showcase/) | 语法高亮，逐步 diff 动画，聚焦区域 | `steps[]: {code,lang,caption,focus}` |
| [phone-scroll](phone-scroll/) | 手机里滚动长截图，停靠批注 | 见 `config.js` 开头注释 |
| [notification-stack](notification-stack/) | 系统通知依次弹出堆叠 | 见 `config.js` 开头注释 |
| [command-palette](command-palette/) | 命令面板输入、过滤、执行 | 见 `config.js` 开头注释 |
| [chat-bubbles](chat-bubbles/) | 聊天气泡，输入中动画 | 见 `config.js` 开头注释 |
| [api-playground](api-playground/) | 接口调试：请求与响应 | 见 `config.js` 开头注释 |
| [live-dashboard](live-dashboard/) | 实时监控面板，异常告警 | 见 `config.js` 开头注释 |
| [form-wizard](form-wizard/) | 多步表单自动填写 | 见 `config.js` 开头注释 |

### 信息版式

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [bento-grid](bento-grid/) | 数字、文字、图片、迷你折线混排的磁贴，自动排布 | `columns`，`tiles[]: {type,col,row,w,h,accent}` |
| [team-cards](team-cards/) | 头像卡片，聚光灯轮流展开，缺照片时生成字母头像 | `layout`，`people[]: {name,role,bio,photo}` |
| [pricing-plans](pricing-plans/) | 高亮方案的渐变边框，月付年付切换 | `billing`，`plans[]: {name,price,features,highlight}` |
| [faq-accordion](faq-accordion/) | 问答手风琴 | 见 `config.js` 开头注释 |
| [feature-table](feature-table/) | 功能对比表，推荐列高亮 | 见 `config.js` 开头注释 |
| [checklist-progress](checklist-progress/) | 清单逐项勾选，总进度增长 | 见 `config.js` 开头注释 |
| [testimonial-wall](testimonial-wall/) | 评价墙，多列反向滚动 | 见 `config.js` 开头注释 |
| [stat-compare](stat-compare/) | 左右大数字对比与差值 | 见 `config.js` 开头注释 |
| [agenda-list](agenda-list/) | 议程目录，当前项高亮 | 见 `config.js` 开头注释 |

### 3D 与氛围

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [globe-arcs](globe-arcs/) | 点阵地球，城市涟漪，大圆弧线飞行，可拖动 | `cities[]`，`arcs[]: {from,to}`，`rotateSpeed` |
| [tag-sphere](tag-sphere/) | 3D 标签球 | 见 `config.js` 开头注释 |
| [aurora-bg](aurora-bg/) | 极光流动渐变背景 | 见 `config.js` 开头注释 |
| [cube-rotate](cube-rotate/) | 3D 立方体翻面 | 见 `config.js` 开头注释 |
| [ripple-grid](ripple-grid/) | 点阵波纹 | 见 `config.js` 开头注释 |
| [terrain-lines](terrain-lines/) | 线条山脉 | 见 `config.js` 开头注释 |
| [isometric-city](isometric-city/) | 等距方块城市升起 | 见 `config.js` 开头注释 |

### 科技与代码

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [git-graph](git-graph/) | Git 分支生长、合并并打版本标签 | `branches[]`，`commits[]: {id,branch,msg,from,merge,tag}`，`stepMs` |
| [neural-net](neural-net/) | 神经网络逐层前向传播，输出层高亮结果 | `layers[]: {name,nodes[]}`，`pulseMs`，`seed` |
| [packet-network](packet-network/) | 拓扑图上数据包穿梭，丢包后重传 | `nodes[]`，`links[]`，`traffic[]: {path,label,drop}`，`hopMs` |
| [code-diff](code-diff/) | 代码 Diff 删除与新增逐块动画 | `file`，`lines[]`（`" "`/`"-"`/`"+"` 开头，`{{ }}` 行内高亮），`stepMs`，`approve` |
| [block-chain](block-chain/) | 区块依次出块，哈希滚动定格并链接 | `blocks[]: {data,hash}`，`difficulty`，`mineMs`，`seed` |

### 复古与怀旧

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [crt-boot](crt-boot/) | CRT 开机，自检文字后出大标题 | `heading`，`bootLines[]`，`typeMs`，`brand`，`flicker` |
| [film-leader](film-leader/) | 老电影倒数片头，切到标题卡 | `from`，`heading`，`grain`，`sepia` |
| [neon-sign](neon-sign/) | 霓虹灯管逐段通电，单字闪烁 | `lines[]: {text,color}`，`sub`，`flicker`，`wall` |
| [vhs-glitch](vhs-glitch/) | 录像带雪花、撕裂与色彩偏移 | `heading`，`osd`，`date`，`clock`，`counterStart`，`intensity` |
| [vinyl-record](vinyl-record/) | 黑胶滑出旋转，歌词逐行高亮 | `album`，`artist`，`side`，`lines[]`，`beatMs`，`duration` |

### 东方与节庆

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [ink-bloom](ink-bloom/) | 水墨晕染标题，墨滴落下晕开、标题逐字显出 | `eyebrow`/`title`/`subtitle`，`drops[]: {x,y,size,ink,color}`，`gap`，`seed` |
| [brush-stroke](brush-stroke/) | 楷体大字按笔顺逐笔写出，末尾落款与印章 | `text`，`eyebrow`，`sign`，`seal`，`per` |
| [scroll-unroll](scroll-unroll/) | 画轴左右展开露出卷面文字 | `title`，`lines[]`，`duration` |
| [seal-stamp](seal-stamp/) | 印章压下留红印，可盖多枚 | `seals[]: {text,x,y,rot}`，`gap` |
| [folding-fan](folding-fan/) | 扇骨依次旋开成扇面并显出文字 | `title`，`items[]`，`ribs` |

各页面的完整字段、默认值和取值范围见其 `config.js` 开头的注释。

## 动效研究系列

新增的画面转场、字体变形与字效、几何与生成图形、光影与光学、物理与机械运动、自然与天气、粒子与空间运动、指针与界面反馈、动态图表进阶，均可从 [查看器](index.html) 或 [展示站](../site/gallery.html) 浏览。

每个示例的 `config.js` 可以修改标题、说明、主题、播放时长与强调色。字效页还可以修改 `text`。部分环境效果默认循环，嵌入时加 `?loop=0` 可播放一次。交互页提供自动示范，画面上的说明列出对应的指针和键盘操作。
