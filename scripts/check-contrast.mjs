// scripts/check-contrast.mjs
// 主题对比度体检：解析 style.css 里每个 body.theme-* 的配色变量，
// 计算「header 文字 / header 底色」与「正文 / 页面底色」的 WCAG 对比度。
//
// 为什么需要它：2026-10-28 首页改版后，大标题直接压在页面底色上，
// 一次性暴露了 6 套主题原有的缺陷 —— 玻璃拟态是白字压在薄荷渐变上（1.16:1），
// 极繁主义是红字压纯绿（2.91:1）。这类问题肉眼在详情页上并不明显（有卡片衬底），
// 但换成整屏大字就立刻穿帮。用数字守比用眼睛守可靠。
//
// 阈值：正文与标题都按 WCAG AA 的 4.5:1（标题虽然可以放宽到 3:1，
// 但首页标题是全站最大的元素，压不住会最刺眼）。
//
// 用法：node scripts/check-contrast.mjs

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');

const MIN = 4.5;

/* ---------- 解析 ---------- */

// 单行与多行块都要匹配；后出现的同名块覆盖先出现的（和 CSS 层叠一致）
const themes = new Map();
for (const m of css.matchAll(/body\.theme-([a-z0-9-]+)\s*\{([^{}]*)\}/g)) {
    const id = m[1];
    const vars = themes.get(id) || {};
    for (const d of m[2].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
        vars[d[1]] = d[2].replace(/\/\*[\s\S]*?\*\//g, '').trim();
    }
    themes.set(id, vars);
}

const rootVars = {};
const rootBlock = css.match(/:root\s*\{([^{}]*)\}/);
if (rootBlock) {
    for (const d of rootBlock[1].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
        rootVars[d[1]] = d[2].trim();
    }
}

function resolve(vars, value, depth = 0) {
    if (!value || depth > 6) return value;
    const m = /^var\(\s*(--[a-z0-9-]+)\s*(?:,\s*(.+))?\)$/.exec(String(value).trim());
    if (!m) return value;
    const next = vars[m[1]] ?? rootVars[m[1]] ?? m[2];
    return next ? resolve(vars, next, depth + 1) : value;
}

function parseColor(str) {
    const s = String(str || '').trim().toLowerCase();
    let m = /^#([0-9a-f]{3})$/.exec(s);
    if (m) return { r: parseInt(m[1][0] + m[1][0], 16), g: parseInt(m[1][1] + m[1][1], 16), b: parseInt(m[1][2] + m[1][2], 16), a: 1 };
    m = /^#([0-9a-f]{6})$/.exec(s);
    if (m) return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16), a: 1 };
    m = /^rgba?\(([^)]+)\)$/.exec(s);
    if (m) {
        const p = m[1].split(',').map((x) => parseFloat(x));
        return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
    }
    return null;
}

const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
});

const luminance = (c) => {
    const f = (x) => {
        const v = x / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
};

const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

/* ---------- 计算 ---------- */

const results = [];
for (const [id, vars] of themes) {
    // 页面底色：有渐变时取第一个色标（首页正文就压在它上面）
    let base = parseColor(resolve(vars, vars['--page-bg'] ?? '#ffffff')) || { r: 255, g: 255, b: 255, a: 1 };
    const grad = String(resolve(vars, vars['--page-bg-gradient'] ?? 'none')).trim();
    if (grad && grad !== 'none') {
        const first = parseColor(grad.split(/,\s*/)[1] || '');
        if (first) base = first;
    }

    const headerBg = parseColor(resolve(vars, vars['--header-bg'] ?? 'transparent')) || { r: 0, g: 0, b: 0, a: 0 };
    const headerText = parseColor(resolve(vars, vars['--header-text-color'] ?? '#000')) || { r: 0, g: 0, b: 0, a: 1 };
    const bodyText = parseColor(resolve(vars, vars['--text-color'] ?? '#000')) || { r: 0, g: 0, b: 0, a: 1 };

    const heroBg = over(headerBg, base);
    results.push({
        id,
        hero: +contrast(over(headerText, heroBg), heroBg).toFixed(2),
        body: +contrast(over(bodyText, base), base).toFixed(2),
    });
}

/* ---------- 输出 ---------- */

results.sort((a, b) => Math.min(a.hero, a.body) - Math.min(b.hero, b.body));

const bad = results.filter((r) => r.hero < MIN || r.body < MIN);

for (const r of results) {
    const mark = r.hero < MIN || r.body < MIN ? '  ✗' : '';
    const weak = !mark && Math.min(r.hero, r.body) < MIN + 0.6 ? '  ·' : '';
    if (mark || weak) {
        console.log(
            `  ${r.id.padEnd(20)} hero ${String(r.hero).padStart(6)}  正文 ${String(r.body).padStart(6)}${mark || weak}`
        );
    }
}

if (bad.length) {
    console.error(
        `\n✗ 主题对比度不足（阈值 ${MIN}:1）：${bad.map((b) => `${b.id} ${b.hero}/${b.body}`).join(', ')}` +
            '\n  在 style.css 末尾的 “Theme contrast fixes” 区块里调 --header-text-color 或 --header-bg。\n'
    );
    process.exit(1);
}

console.log(
    `✓ 主题对比度：${results.length} 套均 ≥ ${MIN}:1（最低 ${
        results[0].id
    } ${Math.min(results[0].hero, results[0].body)}:1）`
);
