/* 只改这个文件。字段说明：
 *   theme         dark | light | paper | neon | terminal，默认 dark
 *   file          窗口标题栏里的文件名（可省略）。也用来推断语言，如 users.js
 *   windowTitle   没写 file 时用它作窗口标题
 *   lang          默认语言：js（含 ts）| python | json | bash | css | html，其他按纯文本。
 *                 不写则按 file 的扩展名推断，推断不出按 js
 *   lineNumbers   是否显示行号，默认 true
 *   holdMs        每个步骤停留的时间，毫秒，默认 2400
 *   steps[]       代码的各个状态，按顺序演示（直接写字符串也可以）
 *     code        这一步完整的代码（必填）。与上一步比较行差异：新增行绿色闪现并滑入，
 *                 删除行红色闪后收起，没变的行不动
 *     lang        这一步的语言，覆盖上面的 lang
 *     caption     窗口下方说明条里的文字，支持 **粗体** 和 `代码`
 *     focus       [起始行, 结束行]，行号从 1 开始；范围外的行变暗
 *     type        true 时这一步从空白开始逐字敲出。第一步默认敲出，设 false 可改为直接显示
 * 最多约 22 行最清晰，更长的代码会自动缩小字号，仍放不下就出现滚动条。 */
window.PAGE_CONFIG = {
  theme: "dark",
  file: "users.js",
  lineNumbers: true,
  holdMs: 2400,
  steps: [
    {
      caption: "先写最直接的版本：**发请求**，返回 JSON",
      code: `// 读取用户列表
async function getUsers() {
  const res = await fetch("/api/users");
  return res.json();
}`
    },
    {
      caption: "第二步：状态码不对时**抛出错误**，调用方才知道出了问题",
      focus: [4, 6],
      code: `// 读取用户列表
async function getUsers() {
  const res = await fetch("/api/users");
  if (!res.ok) {
    throw new Error("请求失败：" + res.status);
  }
  return res.json();
}`
    },
    {
      caption: "网络偶尔抖动？加一个**重试次数**，失败后递归再试",
      focus: [2, 12],
      code: `// 读取用户列表，失败时重试
async function getUsers(retries = 3) {
  try {
    const res = await fetch("/api/users");
    if (!res.ok) throw new Error("请求失败：" + res.status);
    return await res.json();
  } catch (err) {
    if (retries <= 0) throw err;
    return getUsers(retries - 1);
  }
}`
    },
    {
      caption: "最后导出函数，并在入口处**调用一次**",
      focus: [12, 15],
      code: `// 读取用户列表，失败时重试
async function getUsers(retries = 3) {
  try {
    const res = await fetch("/api/users");
    if (!res.ok) throw new Error("请求失败：" + res.status);
    return await res.json();
  } catch (err) {
    if (retries <= 0) throw err;
    return getUsers(retries - 1);
  }
}

export default getUsers;
getUsers().then((list) => console.log(list.length, "位用户"));`
    },
    {
      lang: "bash",
      type: true,
      caption: "换成命令行：用 **curl** 验证接口，语言也可以按步骤切换",
      code: `# 启动服务后验证接口
curl -s http://localhost:3000/api/users | jq '.[0]'
echo "状态码: $?"`
    }
  ]
};
