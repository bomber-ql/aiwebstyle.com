// scripts/build-all.mjs
// 统一构建入口。顺序有依赖，不要打乱：
//   1) build-previews  预览页（build-styles 依赖它生成下载包）
//   1.5) build-recipes 配方页（只写 recipes/*.html，不碰其他目录）
//   2) build-styles    新风格的详情页 / 卡片样式 / 主题块 / zip（会重写 styles/*.html）
//   3) build           预渲染首页、SEO、导航、sitemap（必须最后，否则注入会被覆盖）
//
// 用法：node scripts/build-all.mjs

import { execFileSync } from 'node:child_process';
import process from 'node:process';

const STEPS = ['build-previews.mjs', 'build-recipes.mjs', 'build-styles.mjs', 'build.mjs'];
const node = process.execPath;

for (const step of STEPS) {
    console.log(`\n── ${step} ${'─'.repeat(Math.max(0, 46 - step.length))}`);
    execFileSync(node, [`scripts/${step}`], { stdio: 'inherit' });
}
console.log('\n✓ 全站构建完成');
