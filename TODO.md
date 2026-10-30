# TODO

计划见 [docs/template-plan.md](docs/template-plan.md)。已完成项不在此列。

## 核心版式（19 个，已完成 12 个）

已有：cover、toc、section、bullets、quote、big-number、split、chart-bar、kpi、timeline、compare、end。

- [ ] 大字陈述 / 过渡页（statement）
- [ ] 总结页（summary）
- [ ] 图标宫格（icon-grid）
- [ ] 折线图 / 面积图（chart-line）
- [ ] 饼图 / 环形图（chart-pie）
- [ ] 流程图（process）
- [ ] 2×2 矩阵（matrix）

## 非核心版式（17 个，均未开始）

- [ ] 结构：空白页
- [ ] 文字：全屏背景图加文字、双栏 / 三栏文字
- [ ] 卡片：卡片列表、Bento、图片网格
- [ ] 数据：数据表格、雷达图、散点 / 气泡图
- [ ] 逻辑：路线图、金字塔、循环图、韦恩图、步骤图
- [ ] 媒体：设备样机、代码展示、视频嵌入

## 风格（12 个，已完成 2 个）

已有：soft-editorial、cyber-neon。

- [ ] neo-brutalism
- [ ] 8-bit
- [ ] swiss
- [ ] corporate
- [ ] dark-tech
- [ ] vintage-paper
- [ ] bold-poster
- [ ] blueprint
- [ ] retro-windows
- [ ] organic

## 效果层（`fx/`，整体未开始）

版式里已写了 `data-fx="count-up"` 和 `data-fx="grow"`，目前没有对应实现，不会有动画。

- [ ] 确定 fx 的加载与开关方式（`data-fx` 属性 + 构建时按需内联）
- [ ] 数字与图表：count-up、grow、SVG 描边
- [ ] 文字：打字机、逐条淡入、遮罩揭示、Glitch
- [ ] 背景：粒子、渐变流动、霓虹扫光
- [ ] 交互：3D 翻转、鼠标聚光灯、点击展开
- [ ] 转场：淡入淡出、推移、缩放、翻页、Morph
- [ ] 每个风格在 `theme.json` 里声明默认启用的 2 到 4 个效果

## 构建与工具

- [ ] 字体离线方案：目前依赖 Google Fonts，离线时退回系统字体
- [ ] 版式模板不支持嵌套 `{{#each}}`，遇到需要时扩展引擎
- [ ] `check.mjs` 目前只查越界，未查文字重叠与裁切之外的问题
- [ ] 风格的元数据（mood、tone、density 等）补充到 `theme.json`，并生成类似参考库的 `index.json`
- [ ] 导出 PDF 或 PPTX

## 待确认

- [ ] 产物形式：目前是构建时拼成单个 HTML，运行时切换风格暂不支持
- [ ] 画布尺寸是否固定 1920×1080
- [ ] 两个现有风格的视觉效果需要人工看一遍（本次未做视觉验证）
- [ ] `runtime/deck-stage.js` 来自参考库（MIT），发布前补上来源与许可声明
