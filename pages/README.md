# pages

单页 HTML 特效模板，用于 PPT 里的转场、演示或开场页。每个放进 `<iframe>` 就能嵌进任意页面，也可以单独用浏览器打开。

## 先看这个

打开 [index.html](index.html)：左侧是全部页面的目录，右侧预览，可以切主题、调速度、重播、全屏。新增页面只需在这个文件里的 `GROUPS` 加一行。

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
   页面加载完发 `{sc:"ready"}`，播放完发 `{sc:"done"}`。

`gallery/` 和 `chat-sim/` 是早期做的两个页面，没有接入下面的共用底座，配色和控制是各自写的，用法见各自目录里的说明，不支持 `theme`/`speed` 参数。

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
| [gallery](gallery/) | 16 张图错落入场，悬停倾斜，摆动，点击放大 | 改 `index.html` 里的 `CONFIG.items`（独立页面，见该文件内说明） |
| [media-wall](media-wall/) | 图片/动图/视频网格，灯箱浏览 | `columns`、`aspect`、`fit`、`items[]: {src,name,note}` |
| [compare-slider](compare-slider/) | 拖动分隔线对比两张图，自动扫动一遍 | `before`/`after` 或多组 `pairs[]`，`orientation` |
| [browser-demo](browser-demo/) | 浏览器或手机窗口里轮播截图，光标模拟点击 | `device`、`screens[]: {src,url,caption,cursor[]}` |

### 对话与终端

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [chat-sim](chat-sim/) | Claude Code 终端对话模拟：逐字输出、工具调用、diff 代码块 | 改 `conversation.js` 里的 `script`（独立页面，语法见文件内说明） |
| [terminal-demo](terminal-demo/) | 通用终端演示：敲命令、输出、进度条 | `script[]`，步骤类型 `cmd`/`out`/`progress`/`wait`/`clear` |

### 数据

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [number-counter](number-counter/) | 几个大数字依次滚动到目标值，带进度条 | `items[]: {value,label,unit,progress}` |
| [chart-animated](chart-animated/) | 柱状图 / 折线图 / 环形图生长动画 | `type`（`bar`\|`line`\|`donut`），`labels[]`，`series[]: {name,data}` |
| [bar-race](bar-race/) | 排行榜随时间重排的赛跑动画 | `frames[]: {label, values:{名称:数值}}`，`topN` |

### 叙事

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [timeline](timeline/) | 事件依次点亮，播放结束后可点节点跳转 | `orientation`，`events[]: {when,title,text,image}` |
| [flow-diagram](flow-diagram/) | 节点依次出现，光点沿连线流动 | `layout`（`free`\|`row`），`nodes[]`，`edges[]: {from,to}` |
| [step-tour](step-tour/) | 聚光灯依次高亮界面截图上的区域 | `image`，`steps[]: {x,y,w,h,title,text,side}` |
| [text-reveal](text-reveal/) | 大字逐句出现：打字机/遮罩/逐词/Glitch/淡入 | `lines[]: {text,effect,emphasis}` |

### 氛围

| 页面 | 用途 | 关键字段 |
|---|---|---|
| [hero-intro](hero-intro/) | 开场封面，粒子/渐变/网格/圆环背景 | `backdrop`，`title`，`subtitle` |
| [marquee](marquee/) | 多行无限滚动的文字、标签或图片 | `rows[]: {items,direction,speed,style}` |
| [countdown](countdown/) | 翻页或方块数字倒计时，支持真实目标时间或演示秒数 | `target` 或 `demo:{seconds}`，`units`，`style` |

每个页面具体支持哪些字段、默认值是多少，以该页面 `config.js` 开头的注释为准——这份清单只列最常用的几个。

## 检查

这些页面没有自动化测试脚本。改完用浏览器打开看效果，或者用 [index.html](index.html) 的预览面板切主题、调速度检查有没有溢出舞台（16:9，`.stage` 之外的内容会被裁掉）。
