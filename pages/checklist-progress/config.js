/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow / title / subtitle   左侧标题区（都可省略）
 *   stepMs     相邻两项被勾选的间隔，毫秒，默认 380
 *   stagger    清单行入场的间隔，毫秒，默认 60
 *   doneLabel  全部完成时进度下方显示的文字，默认 "全部完成"
 *   items[]    清单项，可以是字符串，也可以是对象
 *     text   内容（必填）
 *     done   true 表示完成，播放时会依次被勾选；默认 false
 *     note   小注（项数超过 11 时不显示）
 * 项数建议 1 到 40；超过 12 项自动分成两列。播放结束后点击某一行可切换勾选状态，进度同步更新。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "上线检查表",
  title: "v2.4 发布前检查",
  subtitle: "周四 10:00 灰度发布",
  stepMs: 380,
  items: [
    { text: "代码评审全部通过", done: true, note: "共 23 个 PR" },
    { text: "单元测试覆盖率不低于 80%", done: true, note: "当前 86.2%" },
    { text: "端到端测试通过", done: true },
    { text: "数据库迁移脚本演练", done: true, note: "预发环境耗时 4 分钟" },
    { text: "回滚方案文档", done: true },
    { text: "监控告警规则更新", done: true },
    { text: "压测报告确认", done: true, note: "峰值 8,000 QPS" },
    { text: "安全扫描无高危漏洞", done: true },
    { text: "灰度开关配置", done: true },
    { text: "客服话术同步", done: false, note: "等待产品确认" },
    { text: "更新日志与帮助中心文章", done: false },
    { text: "应用商店审核素材", done: false },
    { text: "值班表确认", done: false },
    { text: "对外公告审批", done: false }
  ]
};
