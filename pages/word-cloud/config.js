/* 只改这个文件。字段说明：
 *   theme       dark | light | paper | neon | terminal，默认 dark
 *   heading / subheading   左上角标题，可省略
 *   shape       ellipse（椭圆）| rect（矩形），默认 ellipse
 *   seed        随机种子，默认 7，同一份配置和种子每次排布一致
 *   scale       字号整体倍率，默认 1，范围 0.5 到 1.5；放不下时会自动缩小
 *   stagger     相邻词出现的间隔，毫秒，默认自动（总时长约 2.4 秒）
 *   words[]     词语：可写字符串（权重 1），或对象
 *                 text 文字（必填，最多 24 个字符）
 *                 weight 权重，正数，默认 1，决定字号；权重最高的词用强调色
 *   最多 120 个词；放不下的词会被略去。 */
window.PAGE_CONFIG = {
  theme: "dark",
  heading: "我们在谈论什么",
  subheading: "团队周报高频词，近 12 周",
  shape: "ellipse",
  seed: 7,
  words: [
    { text: "增长", weight: 100 }, { text: "Design", weight: 88 }, { text: "体验", weight: 82 },
    { text: "Performance", weight: 70 }, { text: "留存", weight: 66 }, { text: "AI", weight: 64 },
    { text: "效率", weight: 58 }, { text: "Roadmap", weight: 52 }, { text: "协作", weight: 50 },
    { text: "用户", weight: 48 }, { text: "Launch", weight: 44 }, { text: "数据", weight: 42 },
    { text: "质量", weight: 38 }, { text: "Feedback", weight: 36 }, { text: "自动化", weight: 34 },
    { text: "Open source", weight: 32 }, { text: "品牌", weight: 30 }, { text: "迭代", weight: 29 },
    { text: "Latency", weight: 26 }, { text: "文档", weight: 25 }, { text: "转化", weight: 24 },
    { text: "Cloud", weight: 22 }, { text: "安全", weight: 21 }, { text: "Mobile", weight: 20 },
    { text: "增长飞轮", weight: 18 }, { text: "Insight", weight: 17 }, { text: "成本", weight: 16 },
    { text: "Beta", weight: 15 }, { text: "社区", weight: 14 }, { text: "Onboarding", weight: 13 },
    { text: "复盘", weight: 12 }, { text: "SaaS", weight: 11 }, { text: "招聘", weight: 10 },
    { text: "KPI", weight: 9 }, { text: "灰度", weight: 8 }, { text: "Edge", weight: 7 },
    { text: "周会", weight: 6 }, { text: "OKR", weight: 6 }, { text: "需求池", weight: 5 }
  ]
};
