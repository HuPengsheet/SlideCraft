#!/usr/bin/env python3
"""生成 README 用的预览图。
  python3 scripts/make-previews.py pages        录制 pages/ 下每个页面的动图 -> previews/pages/<name>.gif
  python3 scripts/make-previews.py templates    取模板封面截图             -> previews/templates/<slug>.webp
  python3 scripts/make-previews.py pages timeline hero-intro   只录指定页面
需要 playwright（Chromium）和 PIL。模板截图来自上游仓库的 screenshots/，路径用环境变量 BHT_SHOTS 指定。"""
import glob, io, json, os, sys, time
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "previews")
W, H = 640, 360

# 页面名 -> (录制秒数, URL 参数)。没列出的用默认 8 秒。
PAGES = {
    "gallery": (6, ""), "media-wall": (6, ""), "compare-slider": (7, ""), "browser-demo": (10, ""),
    "chat-sim": (14, ""), "terminal-demo": (10, ""),
    "number-counter": (6, ""), "chart-animated": (6, ""), "bar-race": (10, ""),
    "timeline": (9, ""), "flow-diagram": (9, ""), "step-tour": (10, ""), "text-reveal": (10, ""),
    "hero-intro": (6, ""), "marquee": (6, ""), "countdown": (6, ""),
}
HIDE_UI = ".sc-ctl,.ctl,.hint{display:none!important}"


def record(pw, name, secs, query):
    path = os.path.join(ROOT, "pages", name, "index.html")
    url = "file://" + path + (("?" + query) if query else "")
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 720})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(url)
    pg.add_style_tag(content=HIDE_UI)
    frames, t0 = [], time.time()
    pg.wait_for_timeout(300)
    while time.time() - t0 < secs:
        t = time.time()
        png = pg.screenshot()
        frames.append((time.time() - t0, Image.open(io.BytesIO(png)).convert("RGB").resize((W, H), Image.LANCZOS)))
        pg.wait_for_timeout(max(0, 330 - (time.time() - t) * 1000))
    b.close()
    # 帧间隔取实际采样间隔，保证播放速度接近真实
    durs = [max(40, int((frames[i + 1][0] - frames[i][0]) * 1000)) for i in range(len(frames) - 1)] + [1500]
    os.makedirs(os.path.join(OUT, "pages"), exist_ok=True)
    dst = os.path.join(OUT, "pages", name + ".gif")
    imgs = [f[1].quantize(colors=128, method=Image.MEDIANCUT, dither=Image.NONE) for f in frames]
    imgs[0].save(dst, save_all=True, append_images=imgs[1:], duration=durs, loop=0, optimize=True)
    print(f"{name}: {len(frames)} frames, {os.path.getsize(dst)//1024} KB, errors={errs}")


def templates():
    shots = os.environ.get("BHT_SHOTS", "/tmp/bht-src/repo/screenshots")
    idx = json.load(open(os.path.join(ROOT, "templates", "index.json")))["templates"]
    os.makedirs(os.path.join(OUT, "templates"), exist_ok=True)
    for t in idx:
        c = sorted(glob.glob(os.path.join(shots, t["slug"] + "-*.png")), key=lambda p: int(p.rsplit("-", 1)[1][:-4]))
        dst = os.path.join(OUT, "templates", t["slug"] + ".webp")
        Image.open(c[0]).convert("RGB").resize((W, H), Image.LANCZOS).save(dst, quality=80)
    print(f"templates: {len(idx)} images")


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "pages"
    if mode == "templates":
        templates()
    else:
        from playwright.sync_api import sync_playwright
        names = sys.argv[2:] or list(PAGES)
        with sync_playwright() as pw:
            for n in names:
                secs, q = PAGES.get(n, (8, ""))
                try:
                    record(pw, n, secs, q)
                except Exception as e:
                    print(f"{n}: FAIL {str(e).splitlines()[0][:150]}")
