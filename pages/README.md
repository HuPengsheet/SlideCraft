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

### 新增一个页面

复制 `number-counter/` 作为起点，三个文件：

- `index.html`：引入 `../_shared/themes.css`、`../_shared/base.css`、页面自己的 `<style>`，放一个 `<div class="stage" id="stage"></div>`，最后按顺序引入 `core.js`、`player.js`、`config.js`、`page.js`。CSS 只用 `em` 单位和主题变量。
- `config.js`：唯一允许用户改的文件。写 `window.PAGE_CONFIG = {...}`，文件开头用注释列出每个字段的含义、默认值和取值范围。
- `page.js`：
  ```js
  const DEFAULTS = { theme: "dark", /* ... */ };
  const { cfg, player, stage } = SC.init(DEFAULTS);
  player.play(async (r) => {
    stage.innerHTML = "";              // 每次播放/重播先清空，保证重播不重复
    await r.wait(500);
    await r.raf((dt, t) => { /* ... */ return t < 2; });  // 返回 false 结束
  });
  ```
  纯 CSS 动画、不需要时间线的页面（如跑马灯）可以只调 `SC.init`，不调 `player.play`；要让倍速生效，动画时长写成 `calc(4s / var(--speed))`。
- 在 [index.html](index.html) 的 `GROUPS` 里加一行 `{ dir, title, desc }`。

## 页面清单

### 展示

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [gallery](gallery/) | 16 张预览图错落入场，悬停倾斜、微摆动，点击放大 | 改 `index.html` 里的 `CONFIG.items`（独立页面） |
| [media-wall](media-wall/) | 图片、动图、视频组成的网格，灯箱浏览 | `columns`、`aspect`、`fit`、`items[]: {src,name,note}` |
| [compare-slider](compare-slider/) | 拖动分隔线对比两张图，加载时自动扫一遍 | `before`/`after` 或 `pairs[]`，`orientation` |
| [browser-demo](browser-demo/) | 窗口里轮播截图，模拟光标移动与点击 | `device`、`screens[]: {src,url,caption,cursor[]}` |
| [carousel-3d](carousel-3d/) | 封面流与环形两种样式，拖动、方向键、点击切换 | `style`（`coverflow`\|`ring`），`items[]: {src,title,note}`，`autoMs` |
| [bento-grid](bento-grid/) | 数字、文字、图片、迷你折线混排的磁贴，自动排布 | `columns`，`tiles[]: {type,col,row,w,h,accent}` |

### 对话与终端

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [chat-sim](chat-sim/) | 逐字输出、工具调用、diff 代码块 | 改 `conversation.js` 里的 `script`（独立页面） |
| [terminal-demo](terminal-demo/) | 敲命令、输出日志、进度条 | `script[]`：`cmd`/`out`/`progress`/`wait`/`clear` |

### 数据

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [number-counter](number-counter/) | 大数字依次滚动到目标值，带进度条 | `items[]: {value,label,unit,progress}` |
| [chart-animated](chart-animated/) | 柱状、折线、环形图的生长动画 | `type`（`bar`\|`line`\|`donut`），`labels[]`，`series[]` |
| [bar-race](bar-race/) | 条形随时间重新排序 | `frames[]: {label,values}`，`topN` |
| [radar-chart](radar-chart/) | 多系列多边形从中心生长，悬停高亮，点击图例开关 | `axes[]`，`series[]: {name,values}`，`rings` |
| [funnel-chart](funnel-chart/) | 梯形依次展开，显示阶段转化率 | `stages[]: {label,value}`，`scale`，`orientation` |
| [gantt-schedule](gantt-schedule/) | 条形生长，进度填充，今日线扫过，里程碑 | `unit`，`rows[]: {name,group,start,end,progress}`，`today` |

### 叙事

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [timeline](timeline/) | 事件依次点亮，播放结束后可点节点跳转 | `orientation`，`events[]: {when,title,text,image}` |
| [flow-diagram](flow-diagram/) | 节点依次出现，光点沿连线流动 | `layout`（`free`\|`row`），`nodes[]`，`edges[]` |
| [step-tour](step-tour/) | 聚光灯依次高亮界面截图上的区域 | `image`，`steps[]: {x,y,w,h,title,text}` |
| [text-reveal](text-reveal/) | 打字机、遮罩、逐词、Glitch、淡入 | `lines[]: {text,effect,emphasis}` |
| [kinetic-type](kinetic-type/) | 预告片式大字：冲击、滑入、回声、拆字、描边 | `beatMs`，`lines[]: {text,style,color}`，`finale` |
| [quote-carousel](quote-carousel/) | 逐字显现，进度条，圆点和方向键跳转 | `layout`，`holdMs`，`quotes[]: {text,by,role}` |
| [code-showcase](code-showcase/) | 语法高亮，逐步 diff 动画，聚焦区域 | `steps[]: {code,lang,caption,focus}` |

### 氛围

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [hero-intro](hero-intro/) | 粒子、渐变、网格、圆环四种背景 | `backdrop`，`title`，`subtitle` |
| [marquee](marquee/) | 多行无限滚动的文字、标签或图片 | `rows[]: {items,direction,speed,style}` |
| [countdown](countdown/) | 翻页数字，可指定真实日期或演示秒数 | `target` 或 `demo:{seconds}`，`units`，`style` |
| [globe-arcs](globe-arcs/) | 点阵地球，城市涟漪，大圆弧线飞行，可拖动 | `cities[]`，`arcs[]: {from,to}`，`rotateSpeed` |
| [orbit-map](orbit-map/) | 同心轨道旋转，悬停暂停并显示说明 | `center`，`orbits[]: {speed,items[]}`，`tilt` |
| [team-cards](team-cards/) | 头像卡片，聚光灯轮流展开，缺照片时生成字母头像 | `layout`，`people[]: {name,role,bio,photo}` |
| [pricing-plans](pricing-plans/) | 高亮方案的渐变边框，月付年付切换 | `billing`，`plans[]: {name,price,features,highlight}` |

各页面的完整字段、默认值和取值范围见其 `config.js` 开头的注释。
