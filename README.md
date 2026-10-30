# SlideCraft

HTML 幻灯片模板库。风格和版式分开维护：同一份内容换一个 `theme`，就得到另一种外观。

## 结构

| 层 | 目录 | 作用 |
|---|---|---|
| 版式 | `layouts/` | 页面的 HTML 结构和布局，只引用变量，不写具体颜色和字体 |
| 风格 | `themes/<name>/` | 变量（字体、配色、圆角等）和装饰 |
| 效果 | `fx/` | 动画插件，尚未实现 |

设计思路和完整清单见 [docs/template-plan.md](docs/template-plan.md)，未完成项见 [TODO.md](TODO.md)。

## 使用

需要 Node.js。检查脚本另需 `google-chrome`。

```
node scripts/build.mjs decks/demo.json            # 输出 dist/demo.html
node scripts/build.mjs decks/demo.json out.html   # 指定输出路径
node scripts/check.mjs dist/demo.html             # 检查每页是否超出 1920x1080
```

构建结果是单个自包含 HTML，用浏览器打开，方向键翻页。

## Deck 文件

```json
{
  "title": "SlideCraft 演示",
  "theme": "soft-editorial",
  "slides": [
    { "layout": "cover", "label": "封面", "title": "...", "subtitle": "..." },
    { "layout": "bullets", "title": "...", "points": [{ "title": "...", "text": "..." }] }
  ]
}
```

- `theme`：`themes/` 下的目录名。
- `layout`：`layouts/` 下的文件名。每页的其余字段是该版式的数据，字段名见对应的 `layouts/<name>.html`。
- `label`：页面名称，显示在翻页提示里，可省略。
- 示例见 [decks/demo.json](decks/demo.json) 和 [decks/demo-neon.json](decks/demo-neon.json)，两者内容相同，只有 `theme` 不同。

## 版式模板语法

| 写法 | 含义 |
|---|---|
| `{{x}}` | 输出字段，转义 HTML |
| `{{{x}}}` | 输出字段，不转义 |
| `{{a.b}}` | 嵌套字段 |
| `{{#each list}}...{{/each}}` | 遍历。块内 `{{.}}` 是当前项，`{{i}}` 是序号，`{{n}}` 是补零序号 |
| `{{#if x}}...{{/if}}` | 字段有值时输出 |
| `{{page}}`、`{{total}}` | 当前页码、总页数 |

块不能嵌套。柱状图的 `bars` 会在构建时自动算出 `pct`（相对最大值的百分比）。

## 新增版式

1. 在 `layouts/` 新建 `<name>.html`，可选 `<name>.css`。
2. 根元素不用写，构建时会包成 `<section class="slide l-<name>">`，CSS 选择器以 `.l-<name>` 开头。
3. 颜色、字体、圆角只用变量，不写死。
4. 需要装饰的位置放 `<div class="deco deco-a"></div>` 之类的空元素，由风格填充。

## 新增风格

在 `themes/<name>/` 下新建：

- `tokens.css`：在 `:root` 定义 [core/base.css](core/base.css) 头部列出的全部变量。
- `decor.css`：可选。装饰，以及对个别版式的覆盖，选择器以 `.theme-<name>` 开头，例如 `.theme-<name> .l-cover .deco-a`。
- `theme.json`：名称、mood、明暗，以及 `fontsUrl`（Google Fonts 链接，可省略）。

新建后在 deck 文件里写 `"theme": "<name>"` 即可使用。

## 目录

```
core/base.css          变量契约和通用排版
layouts/               公用版式
themes/                风格
runtime/deck-stage.js  画布缩放与翻页
scripts/build.mjs      构建
scripts/check.mjs      越界检查
decks/                 示例 deck
docs/                  设计文档
```

## 来源与许可

`runtime/deck-stage.js` 来自 [beautiful-html-templates](https://github.com/zarazhangrui/beautiful-html-templates)（MIT, Zara Zhang）。该仓库也被放在本地 `beautiful-html-templates/` 作参考，已在 `.gitignore` 中忽略。
