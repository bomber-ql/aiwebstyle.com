// script.js — 站点交互（全英文站，无 i18n 依赖）
// 职责：① 首页「Apply Theme」在本站实时预览风格 ② 记住上次预览的主题 ③ 年份

document.addEventListener('DOMContentLoaded', () => {
    // --- 年份 ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    // --- 主题预览 ---
    function applyTheme(themeId) {
        const cl = document.body.classList;
        [...cl].forEach((c) => {
            if (c.startsWith('theme-')) cl.remove(c);
        });
        if (themeId && themeId !== 'default') {
            cl.add(`theme-${themeId}`);
            localStorage.setItem('selectedTheme', themeId);
        } else {
            localStorage.removeItem('selectedTheme');
        }
    }

    function loadSavedTheme() {
        // 详情页本身已硬编码主题类，不要覆盖
        if ([...document.body.classList].some((c) => c.startsWith('theme-'))) return;
        const saved = localStorage.getItem('selectedTheme');
        if (saved) applyTheme(saved);
    }

    document.body.addEventListener('click', (event) => {
        const btn = event.target.closest('.btn-apply-theme');
        if (!btn) return;
        event.preventDefault();
        const themeId = btn.dataset.themeId;
        if (themeId) applyTheme(themeId);
    });

    loadSavedTheme();
});
