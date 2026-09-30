/*
 * Shared shell for the static redesign mockups.
 * Each screen only writes its page content; this script wraps it in the
 * proposed navigation shell and expands <i data-icon="name"></i> placeholders.
 *
 * <body data-shell="desktop|mobile|none" data-nav="today" data-crumbs="질문|트랜잭션">
 */
(function () {
  const ICONS = {
    today: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/>',
    questions: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5v7M8.3 7l7.4 3.8M8.3 17l7.4-3.8"/>',
    review: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/><path d="M12 8v4l3 2"/>',
    resume: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6M10 17h6"/>',
    interview: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    library: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 20a2 2 0 0 0 3.4 0"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronLeft: '<path d="m15 6-6 6 6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    play: '<path d="M7 4v16l13-8z"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    upload: '<path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>',
    alert: '<path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18v.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flame: '<path d="M12 3s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s0 3 2 3c0-4 2-6 2-10z"/>',
    link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
    file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    graph: '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v4M12 11l-6 6M12 11l6 6"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    logout: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    building: '<path d="M4 21V5l8-2v18M12 8h8v13"/><path d="M8 8h.01M8 12h.01M8 16h.01M16 12h.01M16 16h.01"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8M10 12h4"/>',
    trend: '<path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/>',
  };

  function svg(name, cls) {
    const body = ICONS[name] || ICONS.info;
    return `<svg class="icon ${cls || ""}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  }

  const NAV = [
    { id: "today", label: "오늘", icon: "today", count: null },
    { id: "questions", label: "질문", icon: "questions" },
    { id: "review", label: "복습", icon: "review", count: 4 },
    { id: "resume", label: "이력서", icon: "resume" },
    { id: "interview", label: "면접", icon: "interview" },
  ];

  function expandIcons(root) {
    root.querySelectorAll("i[data-icon]").forEach((el) => {
      el.outerHTML = svg(el.dataset.icon, el.className);
    });
  }

  function desktop(body) {
    const active = body.dataset.nav;
    const crumbs = (body.dataset.crumbs || "").split("|").filter(Boolean);
    const nav = NAV.map(
      (n) => `<a class="nav-item" href="#" ${n.id === active ? 'aria-current="page"' : ""}>${svg(n.icon)}<span>${n.label}</span>${
        n.count ? `<span class="count" aria-label="복습 ${n.count}개 대기">${n.count}</span>` : ""
      }</a>`,
    ).join("");
    const crumbHtml = crumbs
      .map((c, i) => (i === crumbs.length - 1 ? `<strong>${c}</strong>` : `<span>${c}</span>${svg("chevronRight")}`))
      .join("");

    const content = Array.from(body.childNodes).filter((n) => !(n.tagName === "SCRIPT"));
    const annotations = content.filter((n) => n.classList && n.classList.contains("annotations"));
    const pageNodes = content.filter((n) => !annotations.includes(n));

    const app = document.createElement("div");
    app.className = "app";
    app.innerHTML = `
      <aside class="sidebar" aria-label="주 메뉴">
        <div class="brand"><span class="brand-mark">i</span>iterview</div>
        <nav class="stack-sm" style="gap:2px">${nav}</nav>
        <div class="nav-section label">보조</div>
        <a class="nav-item" href="#" ${active === "library" ? 'aria-current="page"' : ""}>${svg("library")}<span>보관함</span></a>
        <div class="sidebar-footer">
          <div class="resume-switch">${svg("file")}<div class="grow"><div style="font-weight:600">백엔드 이력서 v3</div><div class="meta">활성 버전 · 근거 82%</div></div>${svg("chevronDown")}</div>
          <a class="nav-item" href="#" ${active === "settings" ? 'aria-current="page"' : ""}>${svg("settings")}<span>설정</span></a>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <nav class="breadcrumb" aria-label="현재 위치">${crumbHtml}</nav>
          <button class="search-trigger" type="button" aria-label="검색 열기">${svg("search")}<span>질문, 이력서 항목, 명령 검색</span><kbd>⌘K</kbd></button>
          <button class="btn btn-ghost btn-icon" type="button" aria-label="알림">${svg("bell")}</button>
          <span class="avatar" role="img" aria-label="내 계정">민</span>
        </header>
      </div>`;
    const main = app.querySelector(".main");
    pageNodes.forEach((n) => main.appendChild(n));
    body.innerHTML = "";
    body.appendChild(app);
    annotations.forEach((n) => body.appendChild(n));
  }

  function mobile(body) {
    const active = body.dataset.nav;
    const title = body.dataset.title || "";
    const back = body.dataset.back === "true";
    const content = Array.from(body.childNodes).filter((n) => n.tagName !== "SCRIPT");
    const annotations = content.filter((n) => n.classList && n.classList.contains("annotations"));
    const pageNodes = content.filter((n) => !annotations.includes(n));
    const tabs = NAV.map(
      (n) => `<a class="m-tab" href="#" ${n.id === active ? 'aria-current="page"' : ""}>${svg(n.icon)}<span>${n.label}</span></a>`,
    ).join("");
    const phone = document.createElement("div");
    phone.className = "phone";
    phone.innerHTML = `
      <header class="m-top">
        ${back ? `<button class="btn btn-ghost btn-icon" aria-label="뒤로">${svg("chevronLeft")}</button>` : `<span class="brand-mark">i</span>`}
        <h1 class="grow">${title}</h1>
        <button class="btn btn-ghost btn-icon" aria-label="검색">${svg("search")}</button>
        <span class="avatar" role="img" aria-label="내 계정">민</span>
      </header>
      <div class="m-content"></div>
      ${body.dataset.tabbar === "false" ? "" : `<nav class="m-tabbar" aria-label="주 메뉴">${tabs}</nav>`}`;
    const slot = phone.querySelector(".m-content");
    pageNodes.forEach((n) => slot.appendChild(n));
    body.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.style.padding = "24px 0";
    wrap.appendChild(phone);
    body.appendChild(wrap);
    annotations.forEach((n) => body.appendChild(n));
  }

  const body = document.body;
  const params = new URLSearchParams(location.search);
  if (params.get("theme")) document.documentElement.dataset.theme = params.get("theme");
  const shell = body.dataset.shell || "desktop";
  if (shell === "desktop") desktop(body);
  else if (shell === "mobile") mobile(body);
  expandIcons(document);
})();
