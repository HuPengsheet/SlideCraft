# SlideCraft

HTML 幻灯片与单页特效的素材库，分两部分：

| 目录 | 内容 | 数量 |
|---|---|---|
| [pages/](pages/) | 单页特效模板，如对话模拟、图片墙、数字滚动、图表动画，可嵌进 PPT | 15 个 |
| [templates/](templates/) | 完整的 PPT 模板，每套 10 到 12 页，风格各异 | 34 套 |

所有内容都是纯 HTML、CSS 和 JS，不需要构建，用浏览器直接打开。

## 一、单页特效（pages/）

每个页面是一个独立的小型 HTML，由 `config.js` 驱动：改配置就换内容，不用改代码。可以单独打开，也可以用 `<iframe>` 嵌进 PPT。

**先打开 [pages/index.html](pages/index.html)**：左侧目录，右侧预览，可切换 5 套主题、调速度、重播、全屏。

| 类别 | 页面 | 用途 |
|---|---|---|
| 展示 | [gallery](pages/gallery/) | 16 张模板预览图，入场、悬停倾斜、微摆动、点击放大 |
| | [media-wall](pages/media-wall/) | 图片、动图、视频组成的网格墙，灯箱浏览 |
| | [compare-slider](pages/compare-slider/) | 前后对比，拖动分隔线，自动扫动 |
| | [browser-demo](pages/browser-demo/) | 浏览器或手机窗口里轮播截图，光标模拟点击 |
| 对话与终端 | [chat-sim](pages/chat-sim/) | 模拟 Claude Code 终端：逐字输出、工具调用、diff |
| | [terminal-demo](pages/terminal-demo/) | 通用终端演示：敲命令、输出、进度条 |
| 数据 | [number-counter](pages/number-counter/) | 大数字滚动到目标值 |
| | [chart-animated](pages/chart-animated/) | 柱状、折线、环形图的生长动画 |
| | [bar-race](pages/bar-race/) | 排行榜随时间重排 |
| 叙事 | [timeline](pages/timeline/) | 事件依次点亮，可点击跳转 |
| | [flow-diagram](pages/flow-diagram/) | 流程或架构图，光点沿连线流动 |
| | [step-tour](pages/step-tour/) | 聚光灯依次高亮界面截图的区域 |
| | [text-reveal](pages/text-reveal/) | 大字逐句出现，打字、遮罩、逐词、Glitch |
| 氛围 | [hero-intro](pages/hero-intro/) | 开场封面，粒子、渐变、网格、圆环背景 |
| | [marquee](pages/marquee/) | 多行无限滚动的文字或图片 |
| | [countdown](pages/countdown/) | 翻页数字倒计时 |

共用的主题、舞台缩放、播放控制（暂停、重播、倍速）在 [pages/_shared/](pages/_shared/)。嵌入参数（`?theme=` `?speed=` `?controls=0` `?loop=1`）、`postMessage` 控制方式、怎么新增一个页面，见 [pages/README.md](pages/README.md)。

## 二、PPT 模板（templates/）

来自 [zarazhangrui/beautiful-html-templates](https://github.com/zarazhangrui/beautiful-html-templates)（MIT 协议，见 [templates/LICENSE](templates/LICENSE)），原样搬运，没有改动。

### 怎么用

1. 在 [templates/index.json](templates/index.json) 里按场景（`occasion`）和气质（`mood`、`tone`）选一套。
2. 打开 `templates/<名称>/template.html` 预览，方向键翻页。
3. 复制该模板里最接近你内容的那一页，替换文字和图片。设计说明在同目录的 `design.md`。

每套模板的目录里有 `template.html`、`template.json`（元数据）和 `design.md`（配色、字体、使用规则），部分带自己的 `deck-stage.js`。样式都内联在各自的 HTML 里，模板之间互不依赖。

### 全部 34 套

**深色**

| 模板 | 风格 |
|---|---|
| [8-bit-orbit](templates/8-bit-orbit/) | 像素街机，霓虹配深蓝 |
| [broadside](templates/broadside/) | 深色编辑风，火橙点缀，中英双语字体 |
| [pink-script](templates/pink-script/) | 黑底配亮粉，深夜杂志的奢华感 |
| [studio](templates/studio/) | 黑底电光黄，高压设计工作室 |
| [vellum](templates/vellum/) | 深蓝配暖黄衬线，安静的学术气质 |

**浅色**

| 模板 | 风格 |
|---|---|
| [biennale-yellow](templates/biennale-yellow/) | 羊皮纸上的日光黄与靛蓝衬线 |
| [block-frame](templates/block-frame/) | 新粗野主义，粉彩色块配粗黑边 |
| [blue-professional](templates/blue-professional/) | 奶油纸配钴蓝，干净的现代商务 |
| [bold-poster](templates/bold-poster/) | 超大展示字加一抹消防车红 |
| [capsule](templates/capsule/) | 药丸形卡片，暖白底配糖果色 |
| [cartesian](templates/cartesian/) | 暖中性色配 Playfair 衬线，从容克制 |
| [cobalt-grid](templates/cobalt-grid/) | 方格纸上的钴蓝衬线，像素阶梯装饰 |
| [creative-mode](templates/creative-mode/) | 奶油纸配绿、粉、橙、黄多色强调 |
| [daisy-days](templates/daisy-days/) | 手绘雏菊、星星、彩虹，柔和友好 |
| [long-table](templates/long-table/) | 暖奶油与锈红，餐会俱乐部气质 |
| [monochrome](templates/monochrome/) | 象牙账本纸配纯黑字，没有任何颜色 |
| [neo-grid-bold](templates/neo-grid-bold/) | 编辑式新粗野，只有一种荧光黄 |
| [peoples-platform](templates/peoples-platform/) | 活动海报感，蓝、橙、红配手写字 |
| [pin-and-paper](templates/pin-and-paper/) | 黄纸、安全别针插画、蓝墨手写 |
| [playful](templates/playful/) | 暖桃色底配 Syne 字体，独立产品发布 |
| [raw-grid](templates/raw-grid/) | 新粗野，粗边框、偏移阴影、粉绿墨配色 |
| [retro-windows](templates/retro-windows/) | Windows 95 窗口风格 |
| [retro-zine](templates/retro-zine/) | 米色纸配绿色，孔版印刷杂志 |
| [sakura-chroma](templates/sakura-chroma/) | 日式老磁带包装，斜向彩虹条 |
| [scatterbrain](templates/scatterbrain/) | 便利贴风格，粉彩纸条配手写 |
| [soft-editorial](templates/soft-editorial/) | Cormorant 衬线，暖纸配鼠尾草绿与腮红粉 |
| [stencil-tablet](templates/stencil-tablet/) | 骨白纸、镂空标题、六色大地色板 |

**深浅混合**

| 模板 | 风格 |
|---|---|
| [coral](templates/coral/) | 近黑底，奶油与珊瑚色，超大 Bebas Neue |
| [editorial-forest](templates/editorial-forest/) | 森林绿、灰粉、暖奶油，季度复盘气质 |
| [editorial-tri-tone](templates/editorial-tri-tone/) | 灰粉、芥末奶油、深酒红三色编辑系统 |
| [emerald-editorial](templates/emerald-editorial/) | 翡翠绿、海军蓝、纸色，杂志封面式商务 |
| [grove](templates/grove/) | 森林绿底配奶油字，一点锈红 |
| [mat](templates/mat/) | 深鼠尾草绿、骨白、焦橙，20 世纪中期现代主义 |
| [signal](templates/signal/) | 深海军蓝、骨白纸、一抹哑金，机构感 |

### 检查溢出

```
node scripts/check.mjs templates/soft-editorial/template.html
```

检查每页内容是否超出 1920×1080。需要 `google-chrome`。我只在 soft-editorial 上跑通过；其他模板的页面结构各不相同，脚本不一定都适用。

## 验证状态

- 34 套模板是原样复制，与上游逐文件比对一致。
- 15 个单页中，数字滚动、终端演示、浏览器演示、对比滑块在无头 Chrome 里测过（无报错、无溢出、重播不重复）。
- 其余页面只做了 JS 语法检查，没有在浏览器里跑过；入口页 [pages/index.html](pages/index.html) 也没有。
- 所有页面的实际观感、真实鼠标与触摸操作、视频素材都没有人工确认过。

## 许可

`templates/` 下的内容遵循上游的 MIT 协议。
