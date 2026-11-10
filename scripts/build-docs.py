#!/usr/bin/env python3
"""由 PROMPTS.md（中文）与 PROMPTS.en.md（英文）生成：
  README.md、README.en.md          仓库首页（中 / 英）
  pages/prompts.js                 入口页用（中文）
  site/data.js                     展示站用（双语）
  python3 scripts/build-docs.py
提示词的唯一来源是这两个 Markdown 文件：改内容只改它们，再运行本脚本。
两个文件的 slug 与类别顺序必须一致，否则脚本报错。"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_URL = "https://hupengsheet.github.io/SlideCraft/site/gallery.html"
REPO_URL = "https://github.com/HuPengsheet/SlideCraft"


def parse(path):
    """返回 [{name, items: [{slug, title, prompt, preview_alt}]}]，保持文件中的顺序。"""
    cats, cur = [], None
    for line in open(path, encoding="utf-8").read().splitlines():
        m = re.match(r"## (?:[一二三四五六七八九十]+、|\d+\. )(.+)", line)
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
    missing = [i["slug"] for c in cats for i in c["items"] if not i["prompt"]]
    if missing:
        raise SystemExit(f"{path} 缺少提示词：" + ", ".join(missing))
    return cats


zh = parse(os.path.join(ROOT, "PROMPTS.md"))
en = parse(os.path.join(ROOT, "PROMPTS.en.md"))
if [len(c["items"]) for c in zh] != [len(c["items"]) for c in en] or \
   [i["slug"] for c in zh for i in c["items"]] != [i["slug"] for c in en for i in c["items"]]:
    raise SystemExit("PROMPTS.md 与 PROMPTS.en.md 的类别或 slug 顺序不一致")

# 合并成一份双语结构：name / nameEn，title / titleEn，prompt / promptEn
cats = []
for cz, ce in zip(zh, en):
    items = []
    for iz, ie in zip(cz["items"], ce["items"]):
        items.append({"slug": iz["slug"], "title": iz["title"], "titleEn": ie["title"],
                      "prompt": iz["prompt"], "promptEn": ie["prompt"]})
    cats.append({"name": cz["name"], "nameEn": ce["name"], "items": items})

total = sum(len(c["items"]) for c in cats)


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


PER_ROW = 4


def cell(i, lang):
    title = i["titleEn"] if lang == "en" else i["title"]
    prompt = i["promptEn"] if lang == "en" else i["prompt"]
    return (f'<td width="25%" valign="top"><a href="pages/{i["slug"]}/"><img src="previews/pages/{i["slug"]}.webp" '
            f'alt="{esc(title)}" width="100%"></a><br><b>{esc(title)}</b><br>{esc(prompt)}</td>')


def table_rows(items, lang):
    rows = []
    for k in range(0, len(items), PER_ROW):
        r = items[k:k + PER_ROW]
        pad = PER_ROW - len(r)
        rows.append("<tr>" + "".join(cell(i, lang) for i in r) + '<td width="25%"></td>' * pad + "</tr>")
    return "<table>\n" + "\n".join(rows) + "\n</table>\n"


def banner(lang):
    alt = "SlideCraft 效果总览" if lang == "zh" else "SlideCraft effects overview"
    return (f'<p align="center"><a href="{PAGES_URL}"><img src="previews/banner.jpg" alt="{alt}" width="100%"></a></p>\n')


def readme_zh():
    out = [f"""# SlideCraft

{banner("zh")}
[![在线演示](https://img.shields.io/badge/在线演示-立即查看-blue?style=for-the-badge)]({PAGES_URL})

[English](README.en.md)

SlideCraft 是一套纯 HTML、CSS 和 JS 写成的单页展示效果图鉴，无需构建。它把 {total} 种展示效果按用途分成 20 类，每个效果都能在浏览器里实时运行，并附一条描述画面与动效的 AI 提示词，复制给 AI 就能做出同类页面。在线的[展示站]({PAGES_URL})支持搜索、切换主题和速度，也可以切换中英文。

## 使用

- 每个页面是独立的小型 HTML：改 `config.js` 换内容，不用改代码。
- 支持 5 套主题（dark、light、paper、neon、terminal）、倍速、暂停和重播。
- 可单独打开，也可以用 `<iframe>` 嵌入演示文稿：

```html
<iframe src="pages/number-counter/index.html?theme=light&speed=1" allow="autoplay"></iframe>
```

嵌入参数、`postMessage` 控制和新增页面的方法见 [pages/README.md](pages/README.md)。全部提示词汇总在 [PROMPTS.md](PROMPTS.md)，英文版见 [PROMPTS.en.md](PROMPTS.en.md)。
"""]
    for c in cats:
        out.append(f"## {c['name']}\n")
        out.append(table_rows(c["items"], "zh"))
    out.append("""## 工具

- [scripts/make-previews.py](scripts/make-previews.py)：用 Playwright 录制页面动图到 `previews/`，依赖 Playwright 与 ffmpeg。
- [scripts/make-posters.py](scripts/make-posters.py)：从动图里挑一帧，生成展示站用的静态海报。
- [scripts/build-docs.py](scripts/build-docs.py)：由 [PROMPTS.md](PROMPTS.md) 与 [PROMPTS.en.md](PROMPTS.en.md) 生成本文件、英文 README 和展示站用的数据。
""")
    return "\n".join(out)


def readme_en():
    out = [f"""# SlideCraft

{banner("en")}
[![Live demo](https://img.shields.io/badge/Live%20demo-Open%20gallery-blue?style=for-the-badge)]({PAGES_URL})

[中文](README.md)

SlideCraft is an illustrated catalog of single-page presentation effects, written in plain HTML, CSS, and JS with no build step. It groups {total} effects into 20 categories. Each one runs live in the browser and comes with an AI prompt that describes its look and motion, so you can copy the prompt to build a similar page. The [online gallery]({PAGES_URL}) lets you search, switch themes and speed, and change language between Chinese and English.

## Usage

- Each page is a small standalone HTML file. Edit its `config.js` to change the content; no code changes needed.
- Supports 5 themes (dark, light, paper, neon, terminal), playback speed, pause, and replay.
- Open a page directly, or embed it in a slide deck with an `<iframe>`:

```html
<iframe src="pages/number-counter/index.html?theme=light&speed=1" allow="autoplay"></iframe>
```

Embed parameters, `postMessage` control, and how to add a new page are described in [pages/README.md](pages/README.md). All prompts are collected in [PROMPTS.en.md](PROMPTS.en.md) (English) and [PROMPTS.md](PROMPTS.md) (Chinese).
"""]
    for c in cats:
        out.append(f"## {c['nameEn']}\n")
        out.append(table_rows(c["items"], "en"))
    out.append("""## Tools

- [scripts/make-previews.py](scripts/make-previews.py): records each page as an animated image into `previews/` with Playwright. Requires Playwright and ffmpeg.
- [scripts/make-posters.py](scripts/make-posters.py): picks a frame from each animation and writes the static posters used by the gallery.
- [scripts/build-docs.py](scripts/build-docs.py): generates this file, the Chinese README, and the gallery data from [PROMPTS.md](PROMPTS.md) and [PROMPTS.en.md](PROMPTS.en.md).
""")
    return "\n".join(out)


open(os.path.join(ROOT, "README.md"), "w", encoding="utf-8").write(readme_zh())
open(os.path.join(ROOT, "README.en.md"), "w", encoding="utf-8").write(readme_en())

# 入口页（pages/index.html）仍只用中文
prompts = {i["slug"]: i["prompt"] for c in cats for i in c["items"]}
groups = {c["name"]: {i["slug"]: i["title"] for i in c["items"]} for c in cats}
open(os.path.join(ROOT, "pages", "prompts.js"), "w", encoding="utf-8").write(
    "/* 由 scripts/build-docs.py 从 PROMPTS.md 生成，不要手改。 */\nwindow.PROMPTS = "
    + json.dumps(prompts, ensure_ascii=False, indent=1) + ";\nwindow.PAGE_GROUPS = "
    + json.dumps(groups, ensure_ascii=False, indent=1) + ";\n")

os.makedirs(os.path.join(ROOT, "site"), exist_ok=True)
open(os.path.join(ROOT, "site", "data.js"), "w", encoding="utf-8").write(
    "/* 由 scripts/build-docs.py 从 PROMPTS.md 与 PROMPTS.en.md 生成，不要手改。 */\nwindow.SITE = "
    + json.dumps({"cats": cats}, ensure_ascii=False, indent=1) + ";\n")
print(f"README.md、README.en.md、pages/prompts.js、site/data.js 已生成：{total} 条")
