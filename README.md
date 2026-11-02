# SlideCraft

HTML 幻灯片模板库。`templates/` 收录 34 套风格各异的完整模板（来自 [zarazhangrui/beautiful-html-templates](https://github.com/zarazhangrui/beautiful-html-templates)，MIT 协议）。

## 用法

1. 按场景和气质，在 [templates/index.json](templates/index.json) 里选一套模板。
2. 按每页内容的类型，在该模板里找到对应的页面，复制并替换内容。

每套模板在 `templates/<slug>/` 下：`template.html`（用浏览器打开，方向键翻页）、`template.json`（元数据）、`design.md`（设计说明）。

## 检查

```
node scripts/check.mjs templates/soft-editorial/template.html
```

检查每页是否超出 1920×1080。需要 `google-chrome`。
