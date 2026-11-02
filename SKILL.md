---
name: slidecraft
description: 生成 HTML 幻灯片。从 34 套现成模板里与用户一起选风格，再确定页数和每页内容，生成、修改，最后导出单文件 HTML。适用于用户要做 PPT、演示文稿、汇报、路演、发布会幻灯片，或要在幻灯片里加对话模拟、图表动画、图片墙等特效页的场景。
---

# SlideCraft

用模板做 HTML 幻灯片。模板在 `templates/`，特效页在 `pages/`，工具是 `scripts/deck.py`。每份 PPT 的全部过程文件放在 `decks/<slug>/`，不要放在别处。

下文的 `deck.py` 指本 skill 目录下的 `scripts/deck.py`，用绝对路径调用。`decks/` 建在当前工作目录，不是 skill 目录；要改位置设环境变量 `SLIDECRAFT_DECKS`。

## 总原则

- 第 1、2、4 步必须和用户交互并等用户确认。用户没确认就不进入下一步。
- 不要凭空写事实、数据、人名。用户没给的内容写成占位并记入"待补清单"。
- 每一步结束都用 `deck.py log` 往 `process.md` 记一行，让整个过程可回溯。
- 模板是别人设计好的整页，不要重写它的 CSS。改内容，不改版式。

## 第 0 步：新建工作目录

问用户这份 PPT 的主题，据此起一个 slug（小写字母、数字、连字符，如 `2026-q1-review`）。

```
deck.py init <slug>
```

生成 `decks/<slug>/`：`process.md`（过程记录）、`outline.md`（大纲）、`plan.json`（取页计划）、`assets/`（素材）。

## 第 1 步：确定模板（交互）

1. 问两件事：场合（路演、复盘、发布会、课程……）和气质（沉稳、活泼、深色、文艺……）。用户已经说过就不重复问。
2. 读 `templates/index.json`，按 `occasion`、`mood`、`tone`、`scheme`、`formality` 匹配，挑 **3 个彼此差异明显的候选**（例如一个稳妥的、一个偏暖的、一个出人意料的）。
3. 每个候选给：名称、一句风格描述、预览图路径 `previews/templates/<slug>.webp`（让用户自己打开看）。再给一个能看整套的命令：`deck.py shots <slug>`，会在 `/tmp/slidecraft-shots/<slug>/contact.png` 生成全部页面的总览图。
4. 用户选定后，把选择写进 `plan.json` 的 `template`，并记录：
   ```
   deck.py log <slug> "1 选模板" "<模板名>，原因：<用户的话>"
   ```

用户要求的风格库里没有时，如实说明最接近的是哪套，不要硬凑。

## 第 2 步：确定页数、内容和素材（交互）

1. 问清：主题与核心观点、听众、时长或期望页数、手头已有的材料（文档、数据、图片）。
2. 运行 `deck.py slides <模板>`，列出该模板每一页的类型（封面、目录、图表、对比……）。**大纲里每一页必须对应模板里真有的页**，模板没有的类型要明说，并给替代方案。每套模板的页数不同，大多 8 到 12 页，多的 16 到 18 页。
3. 对照 [references/page-types.md](references/page-types.md) 选页面类型，按 [references/outline-format.md](references/outline-format.md) 的格式写 `decks/<slug>/outline.md`：序号、页面类型、取自模板第几页、标题、要点、需要的素材、素材状态。
4. 把大纲贴给用户看，等待确认。常见调整：增删页、换顺序、改标题。改完再确认一次。
5. **素材清单**：大纲里每一页若需要图片、数据、截图、Logo，逐项列出，标明"用户提供"、"待补"或"占位"。数据类素材（数字、图表）不能编造，缺就问用户。图片缺失时允许用简单的 SVG 或 CSS 占位图，并在占位图上标明"待补素材：xxx"。
6. 用户确认后，把计划写成 `plan.json`：
   ```json
   {"title": "PPT 标题", "template": "soft-editorial",
    "slides": [{"from": 1, "note": "封面"}, {"from": 4, "note": "三个结论"}, {"from": 4, "note": "第二批结论"}]}
   ```
   `from` 是模板里的页序号（同一页可以重复取用），`slides` 的顺序就是成品的顺序。记录：`deck.py log <slug> "2 大纲" "<N> 页，已确认"`。

## 第 3 步：生成

1. 拼装：
   ```
   deck.py assemble <slug>
   ```
   按 `plan.json` 从模板里取页，生成 `decks/<slug>/deck.html`，同时复制模板自带的 `deck-stage.js` 和 `design.md`。脚本会重排页序号和 `active`，不同模板的写法它都认。
2. 读 `decks/<slug>/design.md`，了解这套模板的配色、字体、使用规则，按它的规则写内容。
3. 逐页改 `deck.html` 里的内容，用编辑工具局部替换，不要整份重写：
   - 替换标题、正文、数字、图注。
   - **页脚页码、目录页的条目、章节编号**是模板里写死的文字，拼装后不会自动更新，必须手工改成和实际页序一致。
   - 保持原有的 HTML 结构和类名，不新增页面级 CSS。
   - 文字长度不要超过原文的约 1.2 倍，否则会溢出。内容多就拆页，不要缩字号。
   - 图片放进 `assets/`，用相对路径 `assets/xxx.png` 引用。
   - 缺素材处放占位，并写进待补清单。
4. 截图自查：
   ```
   deck.py shots decks/<slug>/deck.html
   ```
   截图写到 `decks/<slug>/shots/`，其中 `contact.png` 是总览图。它还会报告页面报错，以及"和上一页画面完全相同"的页（通常是翻页没生效或空白页）。**要看截图，不能只看命令没报错**：读 `shots/contact.png`，再读有疑问的单页。文字被截断、重叠、超出画面的页，改完重新截图。
5. 记录：`deck.py log <slug> "3 生成" "<N> 页已生成，待补素材：<清单>"`。

### 嵌入特效页（可选）

`pages/` 里的特效页（对话模拟、图表动画、图片墙、倒计时……）可以放进某一页的 `<iframe src="…/pages/<名>/index.html?controls=0&theme=…">`。但单文件导出不会内联 iframe 的内容，所以只在用户明确要求、且接受交付时需要带上 `pages/` 目录时才用。用之前先问用户。

## 第 4 步：用户确认与修改

1. 告诉用户成品位置 `decks/<slug>/deck.html`，用浏览器打开，方向键翻页。附上待补素材清单。
2. 收集修改意见，**每次只改用户提到的**，不顺手重做别的页。改完对受影响的页重新截图自查。
3. 每一轮修改记一行：`deck.py log <slug> "4 修改" "第 N 页：<改了什么>"`。
4. 用户明确说"可以了"才进入导出。

## 第 5 步：导出

```
deck.py export <slug>
```

生成 `decks/<slug>/export/<slug>.html`：脚本和 `assets/` 里的本地图片都内联进去，单个文件即可分发。

导出后向用户报告脚本打印的三类提示：
- **缺少本地文件**：引用了不存在的图片，要补或去掉。
- **文件较大**：单个素材超过 3MB，建议压缩。
- **仍依赖外部资源**：基本是 Google Fonts。离线打开时字体会退回系统字体，版式可能有细微差别。如实告诉用户，不要说成"完全离线可用"。

最后记录：`deck.py log <slug> "5 导出" "已交付"`。

## 工具速查

| 命令 | 作用 |
|---|---|
| `deck.py init <slug> [--template 名]` | 建目录和过程记录 |
| `deck.py slides <模板>` | 列出模板每页的序号、标注、标题 |
| `deck.py shots <模板名或 html 路径>` | 逐页截图，输出总览图，报告错误和重复页 |
| `deck.py assemble <slug>` | 按 plan.json 拼出 deck.html |
| `deck.py export <slug>` | 导出单文件 HTML |
| `deck.py log <slug> <步骤> <文字>` | 往 process.md 追加记录 |

`shots` 和截图依赖 Playwright 的 Chromium 与 PIL。

## 已知限制

- 模板之间的页面写法不统一，脚本按"class 含 slide"或"`<deck-stage>` 的直接子元素"识别页面。已对 34 套模板核对过识别数量，但没有逐套测过拼装后的翻页，换到没测过的模板时务必用 `shots` 检查。
- 只支持单文件 HTML 导出，不支持 PDF 和 PPTX。
- 模板自带的 JS 有的写死了页数相关逻辑（如页码计数）。拼装后若页脚计数不对，要手工修正或换用别的模板。
- 版权：模板来自 beautiful-html-templates（MIT 协议）。`assemble` 会在 `deck.html` 头部加来源注释，不要删除。
