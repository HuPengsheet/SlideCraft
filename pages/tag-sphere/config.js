/* 只改这个文件。字段说明：
 *   theme      dark | light | paper | neon | terminal，默认 dark
 *   eyebrow / title / subtitle   左上角标题区（都可省略）
 *   radius     球的半径，占舞台高度的比例，0.15 到 0.45，默认 0.36
 *   speed      自转速度，弧度/秒，默认 0.35；0 为不自转（鼠标仍可转动）
 *   tags[]     标签，可以是字符串，也可以是对象
 *     text    文字（必填，超过 14 个字符会截断）
 *     weight  权重，数字，越大字越大、颜色越醒目，默认 1
 *     url     点击后在新标签页打开（只接受 http 或 https）
 * 鼠标移到球上会加速并朝鼠标方向转动，靠前的标签更大更亮。标签数建议 8 到 80。 */
window.PAGE_CONFIG = {
  theme: "dark",
  eyebrow: "技术栈",
  title: "我们每天在用的工具",
  subtitle: "把鼠标移到球上试试",
  radius: 0.36,
  speed: 0.35,
  tags: [
    { text: "TypeScript", weight: 9 }, { text: "React", weight: 8 }, { text: "Node.js", weight: 7 },
    { text: "PostgreSQL", weight: 7 }, { text: "Redis", weight: 5 }, { text: "Kubernetes", weight: 6 },
    { text: "Docker", weight: 6 }, { text: "GraphQL", weight: 4 }, { text: "Rust", weight: 5 },
    { text: "Go", weight: 5 }, { text: "Python", weight: 6 }, { text: "Kafka", weight: 4 },
    { text: "Terraform", weight: 3 }, { text: "Grafana", weight: 3 }, { text: "Prometheus", weight: 3 },
    { text: "Vite", weight: 4 }, { text: "Tailwind", weight: 3 }, { text: "WebAssembly", weight: 3 },
    { text: "gRPC", weight: 3 }, { text: "Nginx", weight: 4 }, { text: "Linux", weight: 6 },
    { text: "Figma", weight: 4 }, { text: "GitHub", weight: 5, url: "https://github.com" },
    { text: "Playwright", weight: 3 }, { text: "ClickHouse", weight: 2 }, { text: "Elasticsearch", weight: 3 },
    { text: "RabbitMQ", weight: 2 }, { text: "Next.js", weight: 5 }, { text: "Svelte", weight: 2 },
    { text: "Swift", weight: 3 }, { text: "Kotlin", weight: 3 }, { text: "Flutter", weight: 3 },
    { text: "MongoDB", weight: 3 }, { text: "Jenkins", weight: 2 }, { text: "Sentry", weight: 2 },
    { text: "Vue", weight: 4 }
  ]
};
