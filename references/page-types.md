# 页面类型对照

第 2 步写大纲时用。先判断每段内容属于哪种类型，再用 `deck.py slides <模板>` 看该模板里有没有对应的页。各模板的页名不统一（如 "Cover"、"Foreword"、"By the Numbers"），按下面的"在模板里找什么"去匹配。

| 内容是什么 | 页面类型 | 在模板里找什么 | 容量参考 |
|---|---|---|---|
| 主题、副题、作者、日期 | 封面 | Cover、Title | 标题 18 个汉字以内 |
| 整份内容的结构 | 目录 | Contents、Agenda、TOC | 3 到 6 条 |
| 换话题的分隔 | 章节页 | Section、Chapter、Divider | 只放标题和一句引子 |
| 一句作者自己的论点 | 大字陈述 | Statement、Foreword、Manifesto | 40 个汉字以内 |
| 一句别人的话（有出处） | 金句 | Quote、In Their Words、Client Voice | 50 个汉字以内，必须有真实出处 |
| 一段背景或定义 | 纯文字 | Foreword、Notes、Context | 约 200 个汉字，超过就拆页 |
| 3 到 5 个并列观点 | 要点列表 | Insights、Principles、Features、List | 每条标题加一句，共 5 条以内 |
| 2 到 3 类对象各说一段 | 多栏文字 | Three Column、Pillars | 每栏 60 个汉字以内 |
| 一个关键数字 | 大数字 | By the Numbers、Stats、Big Number | 一页一个，写口径和来源 |
| 几个指标一起看 | 指标卡 | KPI、Digits、Scorecard | 3 到 4 个 |
| 数值对比、趋势、占比 | 图表 | Chart、Retention Curve、Market | 3 到 7 个数据点，写来源 |
| 按时间的事件 | 时间线 | Timeline、Roadmap | 3 到 5 个节点 |
| 按步骤的流程 | 流程 | Process、Steps、How | 3 到 5 步 |
| 两个方案或前后对比 | 对比 | Comparison、Compare、Versus | 两侧条目数相同 |
| 两个维度分类 | 矩阵 | Matrix、2×2 | 四个象限 |
| 有图的说明 | 图文 | Split、Feature、Detail、Method | 一张图加约 120 个汉字 |
| 一组图片或案例 | 图片网格 | Gallery、Grid、Work | 4 到 9 张 |
| 人物介绍 | 团队 | Team、People、About | 3 到 6 人 |
| 收束全篇 | 总结 | Summary、Takeaways、Next Steps | 3 到 4 条结论，每条是完整的判断句 |
| 谢谢、联系方式、提问 | 结尾 | Closing、Thanks、Contact、Q&A | 标题加联系方式 |

## 选型提醒

- 一页只讲一件事。想放两件事就拆成两页。
- 数字页和图表页都要有来源或口径。用户没给数据时不编，写占位并列入待补清单。
- 模板里没有对应类型时：先看有没有结构相近的页可以借用（例如没有"矩阵"页，可用"对比"页放四项），借用要在大纲里注明，让用户知道。
- 同一页可以在 `plan.json` 里重复取用（例如连续两页"要点列表"）。
- 目录页、章节页的编号、页脚页码都是写死的文字，改页序后要手工同步。
