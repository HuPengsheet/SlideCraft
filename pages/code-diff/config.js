/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal
 *   eyebrow / heading   标题区（都可省略）
 *   file       文件名，显示在窗口顶栏
 *   lines[]    代码行，最多 18 行。每行是字符串，开头一个符号决定类型：
 *              " " 未改动   "-" 删除   "+" 新增。符号之后的内容原样显示（空格保留）
 *              行内用 {{ }} 包住的片段会额外高亮，表示这一行里具体改了哪几个字符
 *   stepMs     相邻两处改动的间隔，毫秒，默认 650
 *   approve    全部改动完成后底部显示的审查结论，留空则不显示 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "Pull Request #128",
  heading: "把重试逻辑改成指数退避",
  file: "src/net/retry.ts",
  stepMs: 650,
  approve: "已通过审查 · 2 位评审同意",
  lines: [
    " import { sleep } from \"./time\";",
    " ",
    " export async function retry(fn, opts = {}) {",
    "-  const times = opts.times ?? 3;",
    "-  const delay = 500;",
    "+  const { times = {{5}}, base = {{200}}, max = {{8000}} } = opts;",
    "   for (let i = 0; i < times; i++) {",
    "     try {",
    "       return await fn();",
    "     } catch (err) {",
    "       if (i === times - 1) throw err;",
    "-      await sleep(delay);",
    "+      const wait = {{Math.min(max, base * 2 ** i)}};",
    "+      await sleep(wait {{+ Math.random() * base}});",
    "     }",
    "   }",
    " }"
  ]
};
