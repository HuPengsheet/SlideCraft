#!/usr/bin/env python3
"""从 previews/pages/*.webp 里为每个页面挑一帧最丰富的画面，存成 site/posters/<名称>.jpg。
展示站的卡片默认显示海报，悬停时才换成动图。
  python3 scripts/make-posters.py"""
import glob, os
from PIL import Image, ImageStat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site", "posters")
os.makedirs(OUT, exist_ok=True)

n = 0
for p in sorted(glob.glob(os.path.join(ROOT, "previews", "pages", "*.webp"))):
    name = os.path.basename(p)[:-5]
    im = Image.open(p)
    total = im.n_frames
    best, best_score = None, -1
    # 只看后 60% 的帧，隔几帧取一张，选像素差异最大（内容最丰富）的
    for i in range(int(total * 0.4), total, max(1, total // 24)):
        im.seek(i)
        f = im.convert("RGB")
        score = sum(ImageStat.Stat(f).stddev)
        if score > best_score:
            best, best_score = f.copy(), score
    best.save(os.path.join(OUT, name + ".jpg"), quality=82, optimize=True)
    n += 1
print(f"{n} 张海报 -> {OUT}")
