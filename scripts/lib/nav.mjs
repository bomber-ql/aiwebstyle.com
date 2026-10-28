// scripts/lib/nav.mjs
// 导航里需要「全站一致」的两块：品牌标与搜索按钮。
//
// 为什么要抽出来：build.mjs 的 injectNav() 会整块重写 <nav>，
// build-head.mjs 又会把品牌重写成同一份内容。两处各写一遍必然分叉
// （第一次就分叉了：injectNav 里还留着带副标题的旧品牌，跑一次 build.mjs
//  就把 41 页的新品牌和搜索按钮冲掉了）。这里只留一份。

export const NAV_MARK = `<svg class="nav-mark" viewBox="13 13 70 70" aria-hidden="true" focusable="false">
                    <rect x="16" y="16" width="46" height="46" rx="10" fill="#7c5cff"/>
                    <rect x="34" y="34" width="46" height="46" rx="10" fill="none" stroke="#f4f1ea" stroke-width="9"/>
                </svg>`;

/** 品牌链接的内部内容（标 + 文字） */
export const brandInner = () => `${NAV_MARK}<span class="nav-brand-text">AI Web Style</span>`;

/** 完整品牌链接；up 为相对根前缀（'' 或 '../'） */
export const brandLink = (up = '') => `<a class="nav-brand" href="${up}index.html">${brandInner()}</a>`;

/** 搜索触发按钮（行为在 /search.js） */
export const searchButton = () => `<button class="nav-search" type="button" data-search-open aria-label="Search this site">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16.6 16.6 L21 21"/></svg>
                    <span class="nav-search-label">Search</span>
                    <kbd>/</kbd>
                </button>`;
