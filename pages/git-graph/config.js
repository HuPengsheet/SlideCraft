/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal
 *   eyebrow / heading / subheading   左上角标题（都可省略）
 *   branches[] name 分支名（必填），自上而下依次占一行，最多 5 条
 *              第一条之外按顺序取 --accent-2、--accent-3 等颜色；名为 main 或 master 的分支用 --accent
 *   commits[]  按时间顺序排列，最多 14 个，从左到右依次出现
 *              id 唯一标识（必填）  branch 所在分支（必填）  msg 提交信息（建议 7 个字以内）
 *              from 新分支从哪个提交分出（分支的第一个提交才需要）
 *              merge 合并进来的分支名（合并提交）  tag 版本标签，如 v1.2.0  hash 七位短哈希，省略则自动生成
 *   stepMs     相邻提交出现的间隔，毫秒，默认 650
 *   seed       自动生成哈希用的随机种子 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "版本历史",
  heading: "一次发布的分支历程",
  subheading: "功能分支与热修复并行开发，合并回主干后打出版本标签",
  stepMs: 650,
  branches: [
    { name: "feature/login" },
    { name: "main" },
    { name: "hotfix/cache" }
  ],
  commits: [
    { id: "c1", branch: "main", msg: "初始化项目" },
    { id: "c2", branch: "main", msg: "添加路由" },
    { id: "c3", branch: "feature/login", from: "c2", msg: "登录表单" },
    { id: "c4", branch: "main", msg: "更新依赖" },
    { id: "c5", branch: "hotfix/cache", from: "c4", msg: "修复缓存失效" },
    { id: "c6", branch: "feature/login", msg: "接入 OAuth" },
    { id: "c7", branch: "main", merge: "hotfix/cache", msg: "合并热修复" },
    { id: "c8", branch: "feature/login", msg: "补充测试" },
    { id: "c9", branch: "main", merge: "feature/login", msg: "合并登录功能", tag: "v1.2.0" }
  ]
};
