#!/usr/bin/env python3
"""由 PROMPTS.md 生成 README.md 和 pages/prompts.js（入口页用）。
  python3 scripts/build-docs.py
PROMPTS.md 是提示词的唯一来源：改提示词只改它，再运行本脚本。"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "PROMPTS.md"), encoding="utf-8").read()

cats, cur = [], None
for line in src.splitlines():
    m = re.match(r"## [一二三四五六七八九十]+、(.+)", line)
    if m:
        cur = {"name": m.group(1), "items": []}
        cats.append(cur)
        continue
    m = re.match(r"#### (\S+) · (.+)", line)
    if m and cur:
        cur["items"].append({"slug": m.group(1), "title": m.group(2), "prompt": ""})
        continue
    if line.startswith("> ") and cur and cur["items"] and not cur["items"][-1]["prompt"]:
        cur["items"][-1]["prompt"] = line[2:].strip()

total = sum(len(c["items"]) for c in cats)
missing = [i["slug"] for c in cats for i in c["items"] if not i["prompt"]]
if missing:
    raise SystemExit("缺少提示词：" + ", ".join(missing))


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def cell(i):
    return (f'<td width="50%" valign="top"><a href="pages/{i["slug"]}/"><img src="previews/pages/{i["slug"]}.webp" '
            f'alt="{esc(i["title"])}" width="100%"></a><br><b>{esc(i["title"])}</b><br>{esc(i["prompt"])}</td>')


out = [f"""# SlideCraft

HTML 页面展示方式的图鉴：按类别整理 {total} 种单页展示效果，每个动画下面附有对应的 AI 提示词，复制即可做出同类页面。

纯 HTML、CSS 和 JS，无需构建。浏览器打开 [pages/index.html](pages/index.html) 可以浏览全部页面，切换主题和速度，并查看每页的提示词。

## 使用

- 每个页面是独立的小型 HTML：改 `config.js` 换内容，不用改代码。
- 支持 5 套主题（dark、light、paper、neon、terminal）、倍速、暂停和重播。
- 可单独打开，也可以用 `<iframe>` 嵌入演示文稿：

```html
<iframe src="pages/number-counter/index.html?theme=light&speed=1" allow="autoplay"></iframe>
```

嵌入参数、`postMessage` 控制和新增页面的方法见 [pages/README.md](pages/README.md)。全部提示词汇总在 [PROMPTS.md](PROMPTS.md)。
"""]
for c in cats:
    out.append(f"## {c['name']}\n")
    rows = []
    for k in range(0, len(c["items"]), 2):
        r = c["items"][k:k + 2]
        rows.append("<tr>" + "".join(cell(i) for i in r) + ('<td width="50%"></td>' if len(r) == 1 else "") + "</tr>")
    out.append("<table>\n" + "\n".join(rows) + "\n</table>\n")
out.append("""## 工具

- [scripts/make-previews.py](scripts/make-previews.py)：用 Playwright 录制页面动图到 `previews/`，依赖 Playwright 与 ffmpeg。
- [scripts/build-docs.py](scripts/build-docs.py)：由 [PROMPTS.md](PROMPTS.md) 生成本文件和入口页用的提示词数据。
""")
open(os.path.join(ROOT, "README.md"), "w", encoding="utf-8").write("\n".join(out))

prompts = {i["slug"]: i["prompt"] for c in cats for i in c["items"]}
open(os.path.join(ROOT, "pages", "prompts.js"), "w", encoding="utf-8").write(
    "/* 由 scripts/build-docs.py 从 PROMPTS.md 生成，不要手改。 */\nwindow.PROMPTS = "
    + json.dumps(prompts, ensure_ascii=False, indent=1) + ";\n")
print(f"README.md 和 pages/prompts.js 已生成：{total} 条")
