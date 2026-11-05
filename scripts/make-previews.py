#!/usr/bin/env python3
"""生成 README 用的预览图：用 Playwright 录制 pages/<name>/ 的动图 -> previews/pages/<name>.gif。
  python3 scripts/make-previews.py              录制全部页面
  python3 scripts/make-previews.py timeline     只录指定页面
需要 playwright（Chromium）和 Pillow。"""
import io, os, sys, time
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
    "radar-chart": (8, ""), "funnel-chart": (8, ""), "gantt-schedule": (9, ""),
    "bento-grid": (8, ""), "team-cards": (12, ""), "quote-carousel": (14, ""),
    "globe-arcs": (8, ""), "carousel-3d": (10, ""), "kinetic-type": (14, ""),
    "orbit-map": (12, ""), "code-showcase": (16, ""), "pricing-plans": (9, ""),
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


if __name__ == "__main__":
    from playwright.sync_api import sync_playwright
    names = sys.argv[1:] or list(PAGES)
    with sync_playwright() as pw:
        for n in names:
            secs, q = PAGES.get(n, (8, ""))
            try:
                record(pw, n, secs, q)
            except Exception as e:
                print(f"{n}: FAIL {str(e).splitlines()[0][:150]}")
