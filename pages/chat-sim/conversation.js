/* ===== 只改这个文件 =====
 * script 语法，每行一条：
 *   > 文字           用户输入。先在输入框里逐字打出，回车后进入对话
 *   普通文字          Claude 的回复。连续的行是一段，空行分段。支持 **粗体** 和 [[行内代码]]
 *   ! 工具名(参数)    工具调用，例如 ! Read(package.json)
 *   = 结果文字        紧跟在工具调用后面，显示在 ⎿ 之后，可以写多行
 *   ~~~              代码块，以单独一行 ~~~ 结束。紧跟在工具调用或结果后面时，缩进到该工具下
 *   ~~~diff          同上，并且 + 开头的行显示为绿色，- 开头的行显示为红色
 *   @wait 1500       停顿 1500 毫秒
 * 每个用户输入之后，会先出现一段“思考中”的转圈状态，再开始回复。
 */
window.CHAT = {
  version: "2.1.85",
  model: "Sonnet 4.6 · API Usage Billing",
  cwd: "~/SlideCraft",
  windowTitle: "hupeng@ubuntu: ~/SlideCraft",
  tips: "Run /init to create a CLAUDE.md file with instructions for Claude",
  recent: "No recent activity",
  notice: "Opus now defaults to 1M context · 5x more room, same pricing",
  effort: "medium",
  loop: false,
  script: `
> 帮我把 soft-editorial 第 4 页的三个要点换成我的内容

我先看一下这一页的结构。

! Read(templates/soft-editorial/template.html)
= Read 812 lines

第 4 页是 [[s-insights]]，三条要点都在这一页里。我来替换。

! Update(templates/soft-editorial/template.html)
= Updated templates/soft-editorial/template.html with 3 additions and 3 removals
~~~diff
-<h3>Setup is easier than ever</h3>
+<h3>问题不在上手，在信任</h3>
-<h3>Teams adopt faster</h3>
+<h3>高频用户靠模板留存</h3>
-<h3>Support is part of the product</h3>
+<h3>支持邮箱是产品的一部分</h3>
~~~

@wait 600
三条要点已经替换，我再检查一下有没有内容溢出。

> 好，检查一下

! Bash(node scripts/check.mjs templates/soft-editorial/template.html)
= 04 04 Insights: ok
= 12 slides checked, no overflow

没有溢出。**第 4 页已经改好**，用浏览器打开 [[template.html]] 就能看到。
`
};
