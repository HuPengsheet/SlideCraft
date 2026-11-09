#!/usr/bin/env python3
"""生成 README 用的预览图：用 Playwright 录制 pages/<name>/ 的动图 -> previews/pages/<name>.webp（需要 ffmpeg）。
  python3 scripts/make-previews.py              录制全部页面
  python3 scripts/make-previews.py timeline     只录指定页面
需要 playwright（Chromium）和 ffmpeg。"""
import glob, os, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "previews")
W, FPS = 640, 20

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
    "video-frame": (10, ""),
    "phone-scroll": (10, ""),
    "notification-stack": (10, ""),
    "command-palette": (10, ""),
    "chat-bubbles": (12, ""),
    "danmaku": (8, ""),
    "word-cloud": (7, ""),
    "matrix-rain": (8, ""),
    "gauge-dashboard": (8, ""),
    "progress-rings": (7, ""),
    "logo-reveal": (6, ""),
    "chapter-title": (5, ""),
    "title-split": (6, ""),
    "particle-text": (8, ""),
    "credits-roll": (10, ""),
    "layer-stack": (8, ""),
    "polaroid-scatter": (8, ""),
    "parallax-layers": (8, ""),
    "flip-cards": (9, ""),
    "zoom-lens": (10, ""),
    "heatmap-calendar": (8, ""),
    "sankey-flow": (8, ""),
    "treemap": (7, ""),
    "stock-ticker": (8, ""),
    "org-chart": (8, ""),
    "mind-map": (9, ""),
    "roadmap": (9, ""),
    "swimlane": (10, ""),
    "decision-tree": (10, ""),
    "swot-matrix": (8, ""),
    "api-playground": (10, ""),
    "live-dashboard": (10, ""),
    "form-wizard": (12, ""),
    "faq-accordion": (10, ""),
    "feature-table": (8, ""),
    "checklist-progress": (8, ""),
    "testimonial-wall": (8, ""),
    "stat-compare": (7, ""),
    "agenda-list": (8, ""),
    "tag-sphere": (8, ""),
    "aurora-bg": (6, ""),
    "cube-rotate": (10, ""),
    "ripple-grid": (7, ""),
    "terrain-lines": (6, ""),
    "isometric-city": (7, ""),
}
HIDE_UI = ".sc-ctl,.ctl,.hint{display:none!important}"


def record(pw, name, secs, query):
    """录制页面视频，再用 ffmpeg 转成 20fps 的动图 WebP。"""
    path = os.path.join(ROOT, "pages", name, "index.html")
    url = "file://" + path + (("?" + query) if query else "")
    tmp = tempfile.mkdtemp(prefix="sc-rec-")
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 720}, record_video_dir=tmp,
                        record_video_size={"width": 1280, "height": 720})
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(url)
    pg.add_style_tag(content=HIDE_UI)
    pg.wait_for_timeout(int(secs * 1000))
    ctx.close()
    b.close()
    video = glob.glob(os.path.join(tmp, "*.webm"))[0]
    os.makedirs(os.path.join(OUT, "pages"), exist_ok=True)
    dst = os.path.join(OUT, "pages", name + ".webp")
    r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", video,
                        "-vf", f"fps={FPS},scale={W}:-1:flags=lanczos", "-c:v", "libwebp_anim",
                        "-quality", "55", "-loop", "0", dst], capture_output=True, text=True)
    shutil.rmtree(tmp, ignore_errors=True)
    if r.returncode:
        raise RuntimeError("ffmpeg: " + r.stderr.strip().splitlines()[-1])
    print(f"{name}: {os.path.getsize(dst) // 1024} KB, errors={errs}", flush=True)


if __name__ == "__main__":
    from playwright.sync_api import sync_playwright
    names = sys.argv[1:] or sorted(
        os.path.basename(os.path.dirname(path))
        for path in glob.glob(os.path.join(ROOT, "pages", "*", "index.html"))
    )
    with sync_playwright() as pw:
        for n in names:
            secs, q = PAGES.get(n, (8, ""))
            try:
                record(pw, n, secs, q)
            except Exception as e:
                print(f"{n}: FAIL {str(e).splitlines()[0][:150]}")
