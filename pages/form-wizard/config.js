/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   title      标题；subtitle 副标题（可省略）
 *   typeMs     每个字符的输入间隔（毫秒），默认 55
 *   nextLabel  "下一步"按钮文字，默认 "下一步"
 *   submitLabel 最后一步的按钮文字，默认 "提交"
 *   success    成功页
 *     title    默认 "提交成功"
 *     text     说明文字
 *     summary  true 时列出所有填写的内容，默认 true（密码字段显示为圆点）
 *   steps[]    步骤，1 到 6 个（多余的忽略）
 *     title    步骤名（显示在步骤条上）
 *     desc     这一步的一句话说明
 *     fields[] 输入项，每步最多 5 个
 *       label  字段名
 *       value  自动打出的内容
 *       type   text | password | textarea，默认 text
 * 播放结束后，可点击已完成的步骤回看。 */
window.PAGE_CONFIG = {
  theme: "dark",
  title: "三步完成注册",
  subtitle: "账号、团队、确认，全程不到一分钟",
  typeMs: 55,
  nextLabel: "下一步",
  submitLabel: "创建账号",
  success: { title: "注册成功", text: "欢迎加入，确认邮件已发送到你的邮箱。", summary: true },
  steps: [
    {
      title: "账号信息", desc: "用于登录和接收通知",
      fields: [
        { label: "邮箱", value: "lin.wei@example.com" },
        { label: "密码", value: "Slide#2025", type: "password" }
      ]
    },
    {
      title: "团队设置", desc: "告诉我们你在哪个团队",
      fields: [
        { label: "团队名称", value: "增长设计组" },
        { label: "成员人数", value: "12" },
        { label: "主要用途", value: "产品发布会和季度汇报", type: "textarea" }
      ]
    },
    {
      title: "确认", desc: "最后留一个联系方式",
      fields: [
        { label: "手机号", value: "138 0000 1234" },
        { label: "邀请码", value: "SC-LAUNCH" }
      ]
    }
  ]
};
