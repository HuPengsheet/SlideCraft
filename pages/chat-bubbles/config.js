/* 只改这个文件。字段说明：
 *   theme         dark | light | paper | neon | terminal，默认 dark
 *   style         "wechat"（头像 + 带小尖角的气泡）| "imessage"（无头像，大圆角气泡）
 *                 | "slack"（全部靠左，头像 + 名字 + 时间，无气泡底），默认 wechat
 *   title         顶部标题（群名或对方名字），默认取第一个非 me 的参与者名字
 *   status        标题下的状态小字，默认 "在线"，设为 "" 隐藏
 *   participants  参与者表，键是 id。me 是右侧的"自己"（slack 风格下也靠左）
 *     name        显示名
 *     avatar      头像图片路径，可省略；省略时用名字首字加底色
 *     color       头像底色变量名：accent | accent-2 | accent-3 | good | bad，默认按顺序分配
 *   typingMs      对方"正在输入"三点动画的默认时长，默认按文字长度估算（600 到 1800）
 *   gap           消息之间的默认停顿毫秒，默认 700
 *   messages[]    依次出现的消息
 *     from        participants 里的 id，默认 "me"
 *     type        text（默认）| image | card | voice
 *     text        文字内容；type 为 card 时作为卡片正文
 *     src         image / card 的图片路径（可省略，缺失时显示灰色占位）
 *     title       card 的标题
 *     seconds     voice 的时长（秒），决定条的长短，默认 6
 *     time        显示的时间文字。wechat / imessage 显示为居中的时间分隔，slack 显示在名字后
 *     delay       出现前的额外停顿毫秒，默认用 gap
 *     typing      对方消息的"正在输入"毫秒，0 表示不显示
 *   长文本在气泡内按宽度自动换行，超过约 8 行会被截断。消息太多时，旧消息向上滚出。 */
window.PAGE_CONFIG = {
  theme: "dark",
  style: "wechat",
  title: "设计小组",
  status: "3 人在线",
  participants: {
    me: { name: "我" },
    lin: { name: "林夕", color: "accent-3" },
    wang: { name: "老王", color: "accent-2" }
  },
  messages: [
    { from: "lin", time: "周一 09:30", text: "早！上周的演示稿你看了吗？" },
    { from: "me", text: "看了，整体节奏不错，就是开场略长。" },
    { from: "lin", text: "那我把前三页合并成一页，保留最关键的那张图。" },
    { from: "me", type: "image", src: "../gallery/img/coral.webp" },
    { from: "me", text: "这个版式怎么样？留白多一点。" },
    { from: "wang", type: "voice", seconds: 9 },
    { from: "wang", type: "card", title: "品牌规范 v2.3", text: "字体、配色与图形使用规则，更新于本周", src: "../gallery/img/vellum.webp" },
    { from: "lin", text: "收到。我按这份规范改完，下午三点前发给大家 Review，如果有问题随时在群里提。" },
    { from: "me", text: "好的，辛苦了。" }
  ]
};
