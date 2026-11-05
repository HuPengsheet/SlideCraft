/* 聊天气泡：左右消息依次出现，对方先显示"正在输入"，可穿插图片、卡片、语音。配置见 config.js。 */
const DEFAULTS = {
  theme: "dark",
  style: "wechat",
  title: "",
  status: "在线",
  participants: { me: { name: "我" } },
  typingMs: 0,
  gap: 700,
  messages: []
};

const { cfg, player, stage } = SC.init(DEFAULTS);
const COLORS = ["accent-3", "accent-2", "good", "accent", "bad"];
const PLAY = '<svg viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z"/></svg>';

player.play(async (r) => {
  stage.innerHTML = "";
  const style = ["wechat", "imessage", "slack"].includes(cfg.style) ? cfg.style : "wechat";
  const people = (cfg.participants && typeof cfg.participants === "object") ? cfg.participants : {};
  const msgs = (Array.isArray(cfg.messages) ? cfg.messages : []).filter((m) => m && typeof m === "object");
  const ids = Object.keys(people);
  const person = (id) => {
    const p = (people[id] && typeof people[id] === "object") ? people[id] : {};
    const idx = Math.max(0, ids.indexOf(id));
    return { id, name: String(p.name || (id === "me" ? "我" : id)), avatar: p.avatar || "", color: ["accent", "accent-2", "accent-3", "good", "bad"].includes(p.color) ? p.color : COLORS[idx % COLORS.length] };
  };
  const other = ids.find((i) => i !== "me");
  const title = cfg.title || (other ? person(other).name : "");

  const chat = SC.el(`chat ${style}`);
  const hd = SC.el("hd", `<b></b><span></span>`);
  SC.$("b", hd).textContent = title;
  const st = SC.$("span", hd);
  if (cfg.status) st.textContent = cfg.status; else st.remove();
  const body = SC.el("body"), box = SC.el("msgs");
  body.append(box);
  const ft = SC.el("ft", `<div class="in ph"></div><div class="snd"></div>`);
  const input = SC.$(".in", ft);
  input.textContent = style === "slack" ? "发送消息" : "";
  const placeholder = input.textContent;
  chat.append(hd, body, ft);
  stage.append(chat);

  const avatar = (p) => {
    const a = SC.el("av");
    a.style.setProperty("--c", `var(--${p.color})`);
    if (p.avatar) {
      const im = SC.media(p.avatar);
      im.addEventListener("error", () => { im.remove(); a.textContent = [...p.name][0] || ""; });
      a.append(im);
    } else a.textContent = [...p.name][0] || "";
    return a;
  };
  const imgBox = (src) => {
    const b = SC.el("img");
    if (src) { const m = SC.media(src); m.addEventListener("error", () => m.remove()); b.append(m); }
    return b;
  };
  const content = (m) => {
    const type = m.type;
    if (type === "image") { const b = SC.el("bub pad0"); b.append(imgBox(m.src)); return b; }
    if (type === "card") {
      const b = SC.el("bub cd"), c = SC.el("card");
      if (m.src) c.append(imgBox(m.src));
      const t = SC.el("", "", "b"), d = SC.el("", "", "span");
      t.textContent = m.title || ""; d.textContent = m.text || "";
      if (m.title) c.append(t); if (m.text) c.append(d);
      b.append(c); return b;
    }
    if (type === "voice") {
      const s = SC.clamp(Math.round(+m.seconds) || 6, 1, 60);
      const b = SC.el("bub"), v = SC.el("voice", PLAY);
      v.style.setProperty("--vw", SC.clamp(5 + s * .35, 6, 15) + "em");
      const wv = SC.el("wv"), rnd = SC.rng(s * 7 + 3);
      const n = Math.round(SC.clamp(s * 1.2 + 6, 8, 28));
      for (let i = 0; i < n; i++) { const e = SC.el("", "", "i"); e.style.setProperty("--h", (30 + rnd() * 70) + "%"); e.style.setProperty("--i", i); wv.append(e); }
      const du = SC.el("du"); du.textContent = s + "″";
      v.append(wv, du); b.append(v); return b;
    }
    const b = SC.el("bub"); b.textContent = String(m.text ?? ""); return b;
  };
  const row = (m, node, p, me) => {
    const e = SC.el(`m ${me ? "me" : ""}`);
    const col = SC.el("col");
    if (!me || style === "slack") {
      const nm = SC.el("nm"); nm.textContent = p.name;
      if (style === "slack" && m.time) { const t = SC.el("", "", "i"); t.textContent = m.time; nm.append(t); }
      col.append(nm);
    }
    col.append(node);
    e.append(avatar(p), col);
    return e;
  };

  /* 新消息追加后，让已有内容平滑上移，而不是跳一下 */
  const append = async (el) => {
    const before = box.offsetHeight;
    box.append(el);
    const grow = box.offsetHeight - before;
    if (grow > 0 && !SC.reduce && before > 0) {
      box.style.transition = "none"; box.style.transform = `translateY(${grow}px)`;
      box.offsetWidth;
      box.style.transition = `transform ${.45 / player.speed}s cubic-bezier(.2,.9,.3,1)`; box.style.transform = "";
    }
  };
  const separator = (m) => {
    if (style === "slack" || !m.time) return null;
    const t = SC.el("ts"); t.textContent = m.time; return t;
  };

  if (SC.reduce) {
    chat.classList.add("in");
    msgs.forEach((m) => {
      const sp = separator(m); if (sp) box.append(sp);
      const id = m.from || "me", me = id === "me";
      box.append(row(m, content(m), person(id), me));
    });
    box.querySelectorAll(".m").forEach((e) => (e.style.animation = "none"));
    return;
  }

  await r.wait(100);
  chat.classList.add("in");
  await r.wait(900);
  for (const m of msgs) {
    const id = m.from || "me", me = id === "me", p = person(id);
    await r.wait(Math.max(0, m.delay ?? cfg.gap ?? 700));
    const len = String(m.text || "").length;
    if (me) {
      /* 自己的文字消息：先在输入框里敲，再发出 */
      if ((m.type || "text") === "text" && m.text) {
        input.classList.remove("ph");
        const t = String(m.text), step = Math.max(1, Math.ceil(t.length / 18));
        for (let i = step; i < t.length + step; i += step) { input.textContent = t.slice(0, Math.min(i, t.length)); await r.wait(45); }
        await r.wait(250);
        input.textContent = placeholder; input.classList.add("ph");
      }
    } else {
      const typing = m.typing ?? (cfg.typingMs || SC.clamp(500 + len * 40, 600, 1800));
      if (typing > 0) {
        const tn = SC.el("bub", '<div class="dots"><i></i><i></i><i></i></div>');
        const trow = row(m, tn, p, false);
        trow.classList.add("typing");
        const sp0 = separator(m); if (sp0) { await append(sp0); }
        await append(trow);
        await r.wait(typing);
        trow.remove();
        const real = row(m, content(m), p, false);
        await append(real);
        continue;
      }
    }
    const sp = separator(m); if (sp) await append(sp);
    await append(row(m, content(m), p, me));
  }
});
