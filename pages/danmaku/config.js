/* 只改这个文件。字段说明：
 *   theme       dark | light | paper | neon | terminal，默认 dark
 *   eyebrow / heading / subheading   舞台中央的标题区，都可省略
 *   lanes       轨道数，默认 7，范围 1 到 8（太多时自动减少，保证不挤在一起）
 *   speed       飞行速度倍率，默认 1，建议 0.5 到 2
 *   density     密度 0 到 1，默认 0.6；越大同一轨道上前后条目越近
 *   seed        随机种子，默认 3，同一个种子每次的轨道与顺序一致
 *   items[]     弹幕内容，可直接写字符串，也可写对象：
 *                 text 文字（必填，超长会截断）
 *                 highlight true 时放大并用强调色，飞得略慢
 *                 by 署名，可省略
 *   播放一遍后弹幕持续飞行，重播时重新开始。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "用户反馈",
  heading: "他们是这样说的",
  subheading: "来自过去 90 天的真实留言",
  lanes: 7,
  speed: 1,
  density: 0.6,
  seed: 3,
  items: [
    { text: "上手只用了十分钟，比我想的简单太多", by: "林奕" },
    { text: "配置文件写一次，所有页面都能复用", by: "周然" },
    { text: "终于不用再对着 PPT 动画面板发愁了", highlight: true, by: "陈舟" },
    "Smooth. Exactly what our keynote needed.",
    { text: "主题切换一行搞定，五套都很耐看", by: "Mia" },
    "投屏的时候全场都在问这是怎么做的",
    { text: "Replay 一点就重来，彩排特别方便", by: "吴桐" },
    { text: "Zero dependencies, opens from a USB stick.", by: "Leo" },
    { text: "动效有节奏，不像那种模板味的东西", highlight: true, by: "顾南" },
    "文档写得清楚，改配置不会踩坑",
    { text: "速度倍率太实用了，录屏时调到 2 倍", by: "宋晴" },
    "Love the details. The easing feels right.",
    { text: "老板看完直接问能不能全公司都用", by: "赵屿" },
    { text: "离线也能跑，会场没网也不慌", by: "Kai" },
    "中英文混排居然一点都不别扭",
    { text: "把客户的评价放上去，签单率明显提高", highlight: true, by: "孙越" },
    { text: "Fast, tidy, and it just works.", by: "Nora" },
    "iframe 一嵌就能用，和现有幻灯片很搭",
    { text: "最喜欢暂停键，讲到一半可以停下来聊", by: "黄屹" },
    "颜色全跟着主题走，换品牌色也不用改代码",
    { text: "Honestly the best thing we shipped this quarter.", by: "Ava" },
    "分享会反响很好，同事纷纷来要链接",
    { text: "小而美，没有多余的东西", by: "唐宁" },
    { text: "每次打开都有新的惊喜，细节很用心", highlight: true, by: "许可" }
  ]
};
