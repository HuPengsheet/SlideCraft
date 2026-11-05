/* 只改这个文件。字段说明：
 *   theme       dark | light | paper | neon | terminal（也可用网址参数 ?theme=light）
 *   title       标题，可省略
 *   subtitle    副标题，可省略
 *   unit        数值单位，默认 ""
 *   totalLabel  右上角大数字的说明，默认 "合计"
 *   items[]     数据项。每项：
 *                 name   名称
 *                 value  大于 0 的数字（否则忽略）
 *                 group  分组名，可省略。同组用同一种主题色、不同明度，并相邻排列；
 *                        所有项都没写 group 时，按顺序循环取色
 *               面积严格正比于 value。放不下的标签会自动隐藏或截断，悬停可看到名称和占比
 *   note        底部小注，可省略
 *   stagger     相邻矩形入场间隔，毫秒，默认 60（总时长最多约 2.4 秒） */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "公司年度营收构成",
  subtitle: "按业务线与产品拆分，单位：百万元",
  unit: "M",
  totalLabel: "年度营收",
  items: [
    { name: "企业云服务", value: 420, group: "云与平台" },
    { name: "数据库", value: 260, group: "云与平台" },
    { name: "开发者平台", value: 150, group: "云与平台" },
    { name: "边缘节点", value: 70, group: "云与平台" },
    { name: "对象存储", value: 38, group: "云与平台" },
    { name: "智能客服", value: 310, group: "人工智能" },
    { name: "大模型 API", value: 240, group: "人工智能" },
    { name: "视觉识别", value: 96, group: "人工智能" },
    { name: "语音合成", value: 42, group: "人工智能" },
    { name: "手机应用", value: 280, group: "消费业务" },
    { name: "会员订阅", value: 190, group: "消费业务" },
    { name: "周边商品", value: 64, group: "消费业务" },
    { name: "线下活动", value: 26, group: "消费业务" },
    { name: "咨询实施", value: 132, group: "服务" },
    { name: "培训认证", value: 58, group: "服务" },
    { name: "运维托管", value: 84, group: "服务" },
    { name: "其他", value: 14, group: "服务" }
  ],
  note: "云与平台与人工智能合计占全年营收的六成以上。",
  stagger: 60
};
