#!/usr/bin/env python3
"""SlideCraft 生成工具。
  deck.py init <slug> [--template <模板>]    新建 decks/<slug>/，写入过程记录
  deck.py slides <模板>                      列出模板的页面（序号、标注、标题）
  deck.py shots <html路径|模板名> [输出目录]   逐页截图并拼成总览图，同时报告页面错误
  deck.py assemble <slug>                    按 plan.json 从模板取页，生成 deck.html
  deck.py export <slug>                      内联脚本与本地图片，输出单文件 HTML
  deck.py log <slug> <步骤> <文字>            往 process.md 追加一行记录
decks 目录默认是当前目录下的 decks/，可用环境变量 SLIDECRAFT_DECKS 改。"""
import base64, datetime, json, mimetypes, os, re, shutil, sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL = os.path.join(ROOT, "templates")
DECKS = os.environ.get("SLIDECRAFT_DECKS") or os.path.join(os.getcwd(), "decks")
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


def die(msg):
    print("错误：" + msg, file=sys.stderr)
    sys.exit(1)


def read(p):
    return open(p, encoding="utf-8").read()


def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(s)


def deck_dir(slug):
    d = os.path.join(DECKS, slug)
    if not os.path.isdir(d):
        die(f"找不到 {d}，先运行 init")
    return d


def tpl_dir(name):
    d = os.path.join(TPL, name)
    if not os.path.isfile(os.path.join(d, "template.html")):
        die(f"没有模板 {name}，可选项见 templates/index.json")
    return d


class SlideFinder(HTMLParser):
    """找出最外层 class 含 slide 这个词的元素，记录它在源码里的起止位置。
    不同模板的写法不一（section / div，有的带 deck-stage），所以只认 class。"""

    def __init__(self, src):
        super().__init__(convert_charrefs=False)
        self.src, self.stack, self.slides = src, [], []
        self.starts = [0]
        for m in re.finditer("\n", src):
            self.starts.append(m.end())

    def off(self):
        l, c = self.getpos()
        return self.starts[l - 1] + c

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        cls = (dict(attrs).get("class") or "").split()
        # 页面 = class 含 slide 的元素，或 <deck-stage> 的直接子元素（部分模板不写 slide 这个 class）
        under_stage = bool(self.stack) and self.stack[-1]["tag"] == "deck-stage"
        is_slide = ("slide" in cls or under_stage) and not any(s["slide"] for s in self.stack)
        node = {"tag": tag, "slide": is_slide, "open": True, "start": self.off(), "attrs": dict(attrs)}
        self.stack.append(node)

    def handle_endtag(self, tag):
        # 容错：遇到不配对的结束标签时，弹出到最近的同名标签
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]["tag"] == tag:
                for n in self.stack[i:][::-1]:
                    n["open"] = False
                    if n["slide"]:
                        end = self.src.find(">", self.off()) + 1   # 结束标签的 > 之后
                        self.slides.append((n["start"], end, n["attrs"]))
                del self.stack[i:]
                return


def find_slides(src):
    p = SlideFinder(src)
    p.feed(src)
    p.close()
    return sorted(p.slides)


def plain(html):
    s = re.sub(r"<(script|style)\b.*?</\1>", " ", html, flags=re.S | re.I)
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    s = s.replace("&amp;", "&").replace("&nbsp;", " ")
    return re.sub(r"\s+", " ", s).strip()


def describe(chunk, attrs):
    label = attrs.get("data-label") or attrs.get("data-screen-label") or ""
    m = re.search(r"<h[1-3][^>]*>(.*?)</h[1-3]>", chunk, flags=re.S)
    title = plain(m.group(1)) if m else plain(chunk)
    return label, title[:60]


def cmd_slides(name):
    src = read(os.path.join(tpl_dir(name), "template.html"))
    sl = find_slides(src)
    if not sl:
        die("没识别到页面（没有 class 含 slide 的元素），这个模板需要手工处理")
    print(f"{name}: {len(sl)} 页")
    for i, (a, b, attrs) in enumerate(sl, 1):
        label, title = describe(src[a:b], attrs)
        print(f"{i:>3}  {label or '-':<28} {title}")


def resolve_html(arg):
    if os.path.isfile(arg):
        return os.path.abspath(arg)
    return os.path.join(tpl_dir(arg), "template.html")


def cmd_shots(arg, outdir=None):
    from playwright.sync_api import sync_playwright
    from PIL import Image, ImageChops, ImageDraw
    html = resolve_html(arg)
    count = len(find_slides(read(html)))
    if not count:
        die("没识别到页面")
    if not outdir:
        in_tpl = html.startswith(TPL)
        outdir = os.path.join("/tmp/slidecraft-shots", os.path.basename(os.path.dirname(html))) if in_tpl \
            else os.path.join(os.path.dirname(html), "shots")
    shutil.rmtree(outdir, ignore_errors=True)
    os.makedirs(outdir)
    errs, files = [], []
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={"width": 1920, "height": 1080})
        pg.on("pageerror", lambda e: errs.append(str(e).splitlines()[0]))
        pg.on("requestfailed", lambda r: errs.append("加载失败 " + r.url[:90]) if r.url.startswith("file:") else None)
        pg.goto("file://" + html)
        pg.wait_for_timeout(1200)
        for i in range(count):
            f = os.path.join(outdir, f"{i + 1:02d}.png")
            pg.screenshot(path=f)
            files.append(f)
            pg.keyboard.press("ArrowRight")
            pg.wait_for_timeout(800)
        b.close()
    imgs = [Image.open(f).convert("RGB") for f in files]
    same = [i + 1 for i in range(1, len(imgs)) if ImageChops.difference(imgs[i - 1], imgs[i]).getbbox() is None]
    tw, th, cols = 480, 270, 4
    rows = (len(imgs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tw, rows * th), "#222")
    dr = ImageDraw.Draw(sheet)
    for i, im in enumerate(imgs):
        x, y = (i % cols) * tw, (i // cols) * th
        sheet.paste(im.resize((tw, th)), (x, y))
        dr.rectangle([x, y, x + 34, y + 20], fill="#000")
        dr.text((x + 6, y + 4), f"{i + 1:02d}", fill="#fff")
    sheet.save(os.path.join(outdir, "contact.png"))
    print(f"{count} 页截图 -> {outdir}/NN.png，总览图 {outdir}/contact.png")
    if same:
        print(f"警告：第 {same} 页与上一页画面完全相同，翻页可能没生效或该页是空白")
    for e in dict.fromkeys(errs):
        print("页面错误：" + e)


def now():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M")


def log(slug, step, text):
    p = os.path.join(deck_dir(slug), "process.md")
    with open(p, "a", encoding="utf-8") as f:
        f.write(f"- {now()} [{step}] {text}\n")


def cmd_init(slug, template=None):
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", slug):
        die("slug 只能用小写字母、数字和连字符，例如 2026-q1-review")
    d = os.path.join(DECKS, slug)
    if os.path.exists(d):
        die(f"{d} 已存在")
    os.makedirs(os.path.join(d, "assets"))
    write(os.path.join(d, "process.md"), f"# {slug} 生成过程\n\n创建于 {now()}\n\n## 记录\n\n")
    write(os.path.join(d, "outline.md"), "# 大纲\n\n（第 2 步填写）\n")
    plan = {"title": slug, "template": template or "", "slides": []}
    write(os.path.join(d, "plan.json"), json.dumps(plan, ensure_ascii=False, indent=2) + "\n")
    log(slug, "0 建目录", f"创建 {d}")
    if template:
        tpl_dir(template)
        log(slug, "1 选模板", template)
    print(f"已创建 {d}（process.md、outline.md、plan.json、assets/）")


def retag(chunk, n, style):
    """把一页的序号改成新位置 n（从 1 开始）。style 是该模板用的序号写法。"""
    head_end = chunk.find(">") + 1
    head, rest = chunk[:head_end], chunk[head_end:]
    if style == "id":
        head = re.sub(r'id="slide-\d+"', f'id="slide-{n - 1}"', head)
    if style == "index":
        head = re.sub(r'data-index="\d+"', f'data-index="{n - 1}"', head)
    if style == "slide":
        head = re.sub(r'data-slide="\d+"', f'data-slide="{n}"', head)
    head = re.sub(r'(data-(?:screen-)?label=")\d+(\s)', lambda m: f"{m.group(1)}{n:02d}{m.group(2)}", head)
    head = re.sub(r'\s+active(?=[\s"])', "", head)
    if n == 1 and style in ("id", "index", "active") and 'class="' in head:
        head = head.replace('class="', 'class="active ', 1) if style == "active" else re.sub(r'(class="[^"]*)"', r'\1 active"', head, 1)
    return head + rest


def numbering_style(first_head):
    if re.search(r'id="slide-\d+"', first_head):
        return "id"
    if re.search(r'data-index="\d+"', first_head):
        return "index"
    if re.search(r'data-slide="\d+"', first_head):
        return "slide"
    if re.search(r'\bactive\b', first_head):
        return "active"
    return "none"


def cmd_assemble(slug):
    d = deck_dir(slug)
    plan = json.loads(read(os.path.join(d, "plan.json")))
    t = plan.get("template") or die("plan.json 里没有 template")
    td = tpl_dir(t)
    src = read(os.path.join(td, "template.html"))
    sl = find_slides(src)
    picks = [s["from"] for s in plan.get("slides", [])]
    if not picks:
        die("plan.json 的 slides 是空的")
    bad = [p for p in picks if not 1 <= p <= len(sl)]
    if bad:
        die(f"模板 {t} 只有 {len(sl)} 页，plan.json 引用了不存在的页：{bad}")
    for (a1, b1, _), (a2, _, _) in zip(sl, sl[1:]):
        gap = re.sub(r"<!--.*?-->", "", src[b1:a2], flags=re.S).strip()
        if gap:
            print(f"警告：模板第 {sl.index((a1, b1, _)) + 1} 页之后有页面之间的内容，已丢弃：{gap[:60]!r}")
    style = numbering_style(src[sl[0][0]:src.find(">", sl[0][0]) + 1])
    chunks = [retag(src[sl[p - 1][0]:sl[p - 1][1]], i, style) for i, p in enumerate(picks, 1)]
    head, tail = src[:sl[0][0]], src[sl[-1][1]:]
    title = plan.get("title") or slug
    head = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", head, count=1, flags=re.S)
    note = f"<!-- 基于模板 {t}（来自 beautiful-html-templates，MIT 协议），由 SlideCraft 生成 -->\n"
    head = re.sub(r"(<head[^>]*>)", lambda m: m.group(1) + "\n" + note, head, count=1)
    write(os.path.join(d, "deck.html"), head + "\n".join(chunks) + tail)
    for f in os.listdir(td):
        if f.endswith(".js") and not os.path.exists(os.path.join(d, f)):
            shutil.copy(os.path.join(td, f), d)
    shutil.copy(os.path.join(td, "design.md"), os.path.join(d, "design.md"))
    log(slug, "3 生成", f"从模板 {t} 取 {len(picks)} 页：{picks}")
    print(f"已生成 {d}/deck.html（{len(picks)} 页，序号写法：{style}）。页脚页码、目录页的条目等需要手工改。")


def is_local(u):
    return bool(u) and not re.match(r"(https?:|//|data:|#|mailto:|javascript:)", u)


def data_uri(path):
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    return f"data:{mime};base64," + base64.b64encode(open(path, "rb").read()).decode()


def cmd_export(slug):
    d = deck_dir(slug)
    html = read(os.path.join(d, "deck.html"))
    missing, big, held = [], [], []

    def hold(s):
        held.append(s)
        return f"\0HOLD{len(held) - 1}\0"

    def inline_script(m):
        u = m.group(2)
        if not is_local(u):
            return m.group(0)
        p = os.path.join(d, u.split("?")[0])
        if not os.path.isfile(p):
            missing.append(u)
            return m.group(0)
        return hold("<script>" + read(p).replace("</script", "<\\/script") + "</script>")

    html = re.sub(r'<script\b([^>]*?)\bsrc="([^"]+)"([^>]*)>\s*</script>', inline_script, html)
    # 内联脚本和样式里的文字不要被后面的 src/url 替换误伤
    html = re.sub(r"<script\b[^>]*>.*?</script>", lambda m: hold(m.group(0)), html, flags=re.S)
    html = re.sub(r"<style\b[^>]*>.*?</style>", lambda m: hold(m.group(0)), html, flags=re.S)

    def uri(u):
        p = os.path.join(d, u.split("?")[0].split("#")[0])
        if not os.path.isfile(p):
            missing.append(u)
            return None
        if os.path.getsize(p) > 3_000_000:
            big.append(f"{u} ({os.path.getsize(p) // 1024} KB)")
        return data_uri(p)

    def attr(m):
        u = m.group(2)
        v = uri(u) if is_local(u) else None
        return m.group(0) if v is None else f'{m.group(1)}"{v}"'

    html = re.sub(r'((?:src|poster)=)"([^"]+)"', attr, html)
    for _ in range(2):  # 还原被保护的块，再处理其中的 url()
        html = re.sub(r"\0HOLD(\d+)\0", lambda m: held[int(m.group(1))], html)

    def css_url(m):
        u = m.group(2)
        v = uri(u) if is_local(u) else None
        return m.group(0) if v is None else f'url("{v}")'

    html = re.sub(r"url\((['\"]?)([^)'\"]+)\1\)", css_url, html)
    out = os.path.join(d, "export", slug + ".html")
    write(out, html)
    remote = sorted(set(re.findall(r'(?:src|href)="(https?://[^"]+)"', html)))
    print(f"已导出 {out}（{os.path.getsize(out) // 1024} KB）")
    for u in dict.fromkeys(missing):
        print("缺少本地文件：" + u)
    for u in big:
        print("文件较大：" + u)
    for u in remote:
        print("仍依赖外部资源（离线会缺失）：" + u[:100])
    log(slug, "5 导出", f"{out}，缺文件 {len(set(missing))} 个，外部依赖 {len(remote)} 个")


def main():
    a = sys.argv[1:]
    if not a or a[0] in ("-h", "--help"):
        print(__doc__)
        return
    c, r = a[0], a[1:]
    if c == "init" and r:
        cmd_init(r[0], r[r.index("--template") + 1] if "--template" in r else None)
    elif c == "slides" and r:
        cmd_slides(r[0])
    elif c == "shots" and r:
        cmd_shots(r[0], r[1] if len(r) > 1 else None)
    elif c == "assemble" and r:
        cmd_assemble(r[0])
    elif c == "export" and r:
        cmd_export(r[0])
    elif c == "log" and len(r) >= 3:
        log(r[0], r[1], " ".join(r[2:]))
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
