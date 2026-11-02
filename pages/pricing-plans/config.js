/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   title      标题；subtitle 副标题（都可省略）
 *   billing    计费周期切换（可省略；只有一个选项时不显示切换）
 *     options  选项文字数组，如 ["月付", "年付"]，与 price 数组的下标一一对应
 *     default  默认选中第几个，从 0 开始，默认 0
 *     note     切换旁的小标签，如 "年付立省 20%"
 *   currency   货币符号，默认 "¥"
 *   plans[]    方案卡片，建议 2 到 4 个
 *     name       方案名（必填）
 *     desc       一句话说明
 *     price      数字（所有周期同价），或数组 [月付价, 年付价]，下标对应 billing.options。
 *                也可写字符串（如 "联系我们"），原样显示，不带货币符号和动画
 *     unit       价格后面的单位，默认 "/月"
 *     features[] 功能列表。字符串，或 { text, off: true }（off 表示不包含，灰色删除线）
 *     highlight  true 时突出显示：略大、抬高、边框渐变旋转。建议只设一个
 *     badge      卡片顶部的徽标，如 "最受欢迎"
 *     cta        按钮文字，默认 "选择" 加方案名
 * 播放结束后可以点击切换计费周期，价格会滚动到新数值。 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "选择适合你的方案",
  subtitle: "所有方案都包含基础模板与主题，随时升级或取消",
  billing: { options: ["月付", "年付"], default: 0, note: "年付立省 20%" },
  currency: "¥",
  plans: [
    {
      name: "入门版", desc: "个人使用，体验全部基础模板", price: 0, unit: "/月", cta: "免费开始",
      features: ["10 个页面模板", "5 套内置主题", "导出单页 HTML", { text: "团队协作", off: true }]
    },
    {
      name: "专业版", desc: "自由职业者和小团队的主力选择", price: [99, 79], unit: "/月", highlight: true, badge: "最受欢迎", cta: "升级到专业版",
      features: ["全部 60+ 页面模板", "自定义主题与字体", "导出 PPT 与视频", "优先邮件支持", "版本历史 30 天"]
    },
    {
      name: "团队版", desc: "多人协作，统一品牌与权限", price: [299, 239], unit: "/月", cta: "联系销售",
      features: ["专业版全部功能", "无限成员席位", "共享模板与品牌库", "单点登录 SSO", "专属客户经理"]
    }
  ]
};
