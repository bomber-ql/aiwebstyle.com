// scripts/build-all.mjs
// 统一构建入口。顺序有依赖，不要打乱：
//   0) validate-data       结构校验。坏数据不进生成器，报错会指出是哪个条目缺哪个字段
//   1) build-previews      预览页（build-styles 依赖它生成下载包）
//   1.4) build-compares    对比页（依赖 previews/ 已存在）
//   1.5) build-recipes     配方页（只写 recipes/*.html，不碰其他目录）
//   2) build-styles        新风格的详情页 / 卡片样式 / 主题块 / zip（会重写 styles/*.html）
//   3) build               预渲染画廊、首页、SEO、导航、sitemap（必须最后，否则注入会被覆盖）
//   3.5) build-og         favicon 与 1200×630 社交图（截预览页首屏，Chrome 缺失时自动跳过）
//   3.6) build-head       全站标题规范化、og:image、面包屑、结构化数据补全、字体按需
//   4) validate-data --files  落地校验。必须在生成之后，兜住「数据加了、产物漏了」
//   5) check-contrast      主题对比度。必须在生成之后，读的是最终 style.css
//
// 用法：node scripts/build-all.mjs

import { execFileSync } from 'node:child_process';
import process from 'node:process';

const STEPS = [
    { script: 'validate-data.mjs', args: [], label: '数据校验（结构）' },
    { script: 'build-previews.mjs', label: '预览页' },
    { script: 'build-compares.mjs', label: '对比页' },
    { script: 'build-recipes.mjs', label: '配方页' },
    { script: 'build-styles.mjs', label: '风格产物' },
    { script: 'build.mjs', label: '站点注入' },
    { script: 'build-og.mjs', label: 'favicon 与社交图' },
    { script: 'build-head.mjs', label: 'head 规范化（标题/图/面包屑）' },
    { script: 'validate-data.mjs', args: ['--files'], label: '数据校验（产物）' },
    { script: 'check-contrast.mjs', label: '主题对比度' },
];

const node = process.execPath;

for (const step of STEPS) {
    const label = step.label ? ` ${step.label}` : '';
    console.log(`\n── ${step.script}${label} ${'─'.repeat(Math.max(0, 44 - step.script.length - label.length))}`);
    execFileSync(node, [`scripts/${step.script}`, ...(step.args || [])], { stdio: 'inherit' });
}
console.log('\n✓ 全站构建完成');
