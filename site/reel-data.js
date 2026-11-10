/* 20 段效果轮播的配置。每段 10 秒。
 * slug 必须是 pages/ 下真实存在的目录；标题和说明文字从 data.js（SITE）里按 slug 取，
 * 这里只写英文副标题、三个标签和一组配色（第 2 个颜色是该段的强调色）。 */
const REEL = {
  dur: 10,          // 每段时长（秒）
  intro: 5,         // 片头时长
  outro: 6,         // 片尾时长
  theme: "dark",
  items: [
    { slug: "isometric-city",    en: "ISOMETRIC",        tags: ["等距视角", "楼宇生长", "道路连线"],   pal: ["#f4f7f2", "#7fd1a3", "#1f6b4a", "#e3b341", "#ffffff"] },
    { slug: "terrain-lines",     en: "LINE ART",         tags: ["山脉线条", "透视起伏", "单色描线"],   pal: ["#0b1f14", "#2fd6a0", "#1b8a63", "#e3b341", "#ecf0f1"] },
    { slug: "particle-text",     en: "PARTICLE TYPE",    tags: ["粒子汇聚", "呼吸起伏", "鼠标冲散"],   pal: ["#08140f", "#4cf0b0", "#1abc9c", "#f1c40f", "#ecf0f1"] },
    { slug: "shape-morph",       en: "SHAPE MORPH",      tags: ["轮廓变形", "平滑过渡", "几何图形"],   pal: ["#0a0f0c", "#3ddc97", "#9b59b6", "#e74c3c", "#f1c40f"] },
    { slug: "polaroid-scatter",  en: "COLLAGE",          tags: ["拍立得", "随手散落", "纸张质感"],     pal: ["#fbf8f1", "#9fd9b6", "#27ae60", "#e3b341", "#f5d6c6"] },
    { slug: "aurora-bg",         en: "AURORA GLASS",     tags: ["弥散渐变", "玻璃拟态", "缓慢流动"],   pal: ["#6c5ce7", "#a29bfe", "#00cec9", "#fd79a8", "#fdcb6e"] },
    { slug: "matrix-rain",       en: "CYBERPUNK HUD",    tags: ["字符雨", "矩阵绿", "逐字打出"],       pal: ["#04140c", "#00ff9c", "#39ff14", "#f1c40f", "#ecf0f1"] },
    { slug: "star-warp",         en: "HYPERSPACE",       tags: ["星点拉伸", "速度线", "纵深冲刺"],     pal: ["#080b1a", "#7fb2ff", "#5b8def", "#ffffff", "#f1c40f"] },
    { slug: "cube-rotate",       en: "3D CUBE",          tags: ["立方体", "翻面切换", "透视旋转"],     pal: ["#f7f4ec", "#7fd1a3", "#16a085", "#f39c12", "#2c3e50"] },
    { slug: "carousel-3d",       en: "3D CAROUSEL",      tags: ["环形排布", "景深虚化", "自动轮转"],   pal: ["#101a16", "#5ff0b0", "#16a085", "#f39c12", "#ecf0f1"] },
    { slug: "neon-sign",         en: "NEON SIGN",        tags: ["霓虹灯管", "通电闪烁", "发光描边"],   pal: ["#12081f", "#ff4fd8", "#00e5ff", "#f1c40f", "#ecf0f1"] },
    { slug: "vhs-glitch",        en: "SYNTHWAVE VHS",    tags: ["录像带", "色彩错位", "噪点扫描线"],   pal: ["#12081f", "#00ff9c", "#ff2bd6", "#f1c40f", "#ecf0f1"] },
    { slug: "ripple-grid",       en: "RIPPLE GRID",      tags: ["点阵", "波纹扩散", "明暗起伏"],       pal: ["#0b1410", "#3ddc97", "#58d68d", "#f1c40f", "#ecf0f1"] },
    { slug: "ink-bloom",         en: "INK WASH",         tags: ["水墨晕染", "宣纸底色", "东方留白"],   pal: ["#f4efe6", "#8aa39a", "#2c3e50", "#c0392b", "#ecf0f1"] },
    { slug: "brush-stroke",      en: "CALLIGRAPHY",      tags: ["逐笔书写", "飞白", "墨色浓淡"],       pal: ["#f4efe6", "#c0392b", "#2c3e50", "#7f8c8d", "#ecf0f1"] },
    { slug: "globe-arcs",        en: "GLOBE",            tags: ["旋转地球", "飞线弧", "点阵陆地"],     pal: ["#0b1c33", "#5dade2", "#3498db", "#f1c40f", "#ecf0f1"] },
    { slug: "bento-grid",        en: "BENTO GRID",       tags: ["便当盒布局", "卡片依次入场", "数据面板"], pal: ["#0e1a14", "#3ddc97", "#1abc9c", "#f1c40f", "#ecf0f1"] },
    { slug: "pixel-dissolve",    en: "PIXEL DISSOLVE",   tags: ["像素解体", "飘散", "重新聚合"],       pal: ["#0b1a12", "#2ecc71", "#27ae60", "#f1c40f", "#ecf0f1"] },
    { slug: "newtons-cradle",    en: "PHYSICS",          tags: ["牛顿摆", "动量传递", "金属质感"],     pal: ["#10161a", "#9fb7c4", "#5f7d8c", "#f1c40f", "#ecf0f1"] },
    { slug: "holographic-sweep", en: "HOLOGRAPHIC",      tags: ["镭射扫光", "彩虹渐变", "金属反光"],   pal: ["#10101e", "#b388ff", "#4cf0e0", "#ff8fd0", "#ecf0f1"] }
  ]
};

/* 标题和说明取自 SITE：说明用提示词的第 2 句起，凑到 60 字左右为止 */
(() => {
  const by = {};
  for (const c of (window.SITE ? window.SITE.cats : [])) for (const i of c.items) by[i.slug] = i;
  for (const it of REEL.items) {
    const src = by[it.slug];
    if (!src) { console.warn("reel: 未找到页面", it.slug); it.title = it.slug; it.desc = ""; continue; }
    it.title = src.title;
    const sents = src.prompt.split(/(?<=[。！])/).slice(1);
    let d = "";
    for (const s of sents) { if (d && (d + s).length > 72) break; d += s; }
    it.desc = d || src.prompt;
  }
})();
