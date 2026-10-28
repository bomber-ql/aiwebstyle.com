// scripts/build-search.mjs
// 作用：把全站内容压成一份 search-index.json，供前端 ⌘K 搜索用
// 用法：node scripts/build-search.mjs
//
// 为什么单独产出索引而不是运行时扫 HTML：
//   - 111 个页面在前端逐个抓 = 111 个请求；索引是一次请求、约 30KB，且可以离线算分
//   - 索引内容全部来自 data/，新增一个风格/配方，索引自动带上，不用手维护
//
// 字段：t 标题 / u 链接 / s 栏目 / d 摘要 / k 关键词（用于别名与错拼）

import fs from 'node:fs';
import path from 'node:path';
import { clipMeta } from './lib/seo.mjs';

const ROOT = process.cwd();
const json = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const styles = [...json('data/styles.json'), ...json('data/new-styles.json')];
const styleById = new Map(styles.map((s) => [s.id, s]));
const motions = json('data/motions.json').filter((m) => m.status !== 'draft');
const previews = json('data/previews.json');
const recipes = fs
  .readdirSync(path.join(ROOT, 'data', 'recipes'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => json(path.join('data', 'recipes', f)))
  .filter((r) => r.status !== 'draft');
const compares = fs
  .readdirSync(path.join(ROOT, 'data', 'compares'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => json(path.join('data', 'compares', f)))
  .filter((c) => c.status !== 'draft');

// 别名 / 常见错拼：搜索要能命中「neubrutalism」「glass」「杂志感」这类词
const ALIASES = {
  'neo-brutalism': 'neubrutalism neobrutalism new brutalism',
  'brutalism': 'raw concrete web brutalism',
  'glassmorphism': 'frosted glass blur translucent',
  'liquid-glass': 'apple glass refraction specular',
  'claymorphism': 'clay soft 3d pastel',
  'neomorphism': 'neumorphism soft ui inset',
  'bento-grid': 'bento tiles dashboard grid',
  'swiss-style': 'international typographic grid helvetica',
  'neo-swiss': 'swiss modern grid red accent',
  'editorial': 'magazine newspaper serif column',
  'maximalism': 'collage loud busy maximal',
  'minimalism': 'minimal simple clean',
  'retro-pixel': 'pixel art 8bit arcade',
  'retro-90s': 'geoCities 90s web 1.0',
  'retro-y2k': 'y2k chrome metal 2000s',
  'acid-graphics': 'acid rave anti design neon',
  'art-deco': 'deco gold geometric gatsby',
  'aurora-ui': 'gradient glow aurora blur mesh',
  'dark-mode': 'dark theme night',
  'skeuomorphism': 'skeuomorphic realistic texture',
  'natural-organic': 'earthy hand drawn organic',
  'sustainable-green': 'eco green climate',
  'monochromatic': 'single color mono',
  'bold-typography': 'big type headline display',
  '3d-interactive': 'threejs webgl 3d canvas',
  'modern-tech': 'saas tech gradient startup',
  'illustration': 'illustrated drawing flat art',
  'abstract-geometric': 'shapes geometric abstract',
  'grunge': 'dirty texture rough distressed',
};

const items = [];
// 摘要只用于结果列表：去掉数据里遗留的 "Note:" 前缀，句末收尾，实在切了就补省略号
const desc = (s, n = 132) => {
  let t = String(s || '').replace(/\s+/g, ' ').replace(/^\s*note:\s*/i, '').trim();
  t = clipMeta(t, n);
  if (!/[.!?…]$/.test(t)) t = t.replace(/[,;:\s]+$/, '') + '…';
  return t;
};

// new-styles.json 里 name 是字符串，styles.json 里是 { en }，两种都要吃
const nameOf = (s) => (typeof s.name === 'string' ? s.name : s.name.en);
const blurbOf = (s) => s.summaryLong || s.description?.en || s.summary || s.longDescription;

for (const s of styleById.values()) {
  items.push({
    t: nameOf(s),
    u: `/styles/${s.id}.html`,
    s: 'Style',
    d: desc(blurbOf(s)),
    k: [s.id, nameOf(s), ALIASES[s.id] || ''].join(' ').trim(),
  });
}

for (const p of previews) {
  items.push({
    t: `${p.name} — live preview`,
    u: `/previews/${p.styleId}.html`,
    s: 'Preview',
    d: desc(p.blurb, 110),
    k: [p.styleId, 'preview demo example'].join(' '),
  });
}

for (const c of compares) {
  items.push({
    t: c.title,
    u: `/compares/${c.slug}.html`,
    s: 'Comparison',
    d: desc(c.lede || c.verdict),
    k: [c.a, c.b, styleById.get(c.a) ? nameOf(styleById.get(c.a)) : '', styleById.get(c.b) ? nameOf(styleById.get(c.b)) : '', 'vs versus compare'].join(' '),
  });
}

for (const m of motions) {
  items.push({
    t: m.name,
    u: `/motions/${m.slug}.html`,
    s: 'Motion',
    d: desc(m.summary),
    k: [m.slug, m.trigger, m.tech, 'animation motion'].join(' '),
  });
}

for (const r of recipes) {
  items.push({
    t: r.name,
    u: `/recipes/${r.slug}.html`,
    s: 'Prompt',
    d: desc(r.summary),
    k: [r.slug, r.category, 'prompt recipe page'].join(' '),
  });
}

// 栏目入口也进索引，搜「compare」「about」能直接到
for (const [t, u, d, k] of [
  ['All styles', '/styles/index.html', 'Every documented style with prompt and CSS.', 'gallery index list all styles'],
  ['All previews', '/previews/index.html', 'The same page rendered in every style, side by side in a grid.', 'gallery preview demo'],
  ['All comparisons', '/compares/index.html', 'Head-to-head style comparisons with live previews.', 'compare versus difference'],
  ['Web motion library', '/motions/index.html', 'Copy-ready animation patterns with live demos.', 'animation motion scroll hover'],
  ['Prompt recipes', '/recipes/index.html', 'Whole-page prompts with variables and failure modes.', 'prompt recipe page builder'],
  ['About this site', '/about.html', 'What this library is and how the content is produced.', 'about editorial policy'],
  ['Contact', '/contact.html', 'How to reach the site, including corrections and suggestions.', 'contact email reach'],
]) {
  items.push({ t, u, s: 'Page', d, k });
}

// 稳定排序：同分时按栏目 + 名称，前端就不需要再排
const order = { Style: 0, Preview: 1, Comparison: 2, Motion: 3, Prompt: 4, Page: 5 };
const missing = items.filter((i) => !i.t || !i.u);
if (missing.length) console.log(`  ! ${missing.length} 条缺标题或链接，已跳过：${JSON.stringify(missing.map((m) => m.u || m.t))}`);
const usable = items.filter((i) => i.t && i.u);
usable.sort((a, b) => (order[a.s] - order[b.s]) || String(a.t).localeCompare(String(b.t)));

const out = { count: usable.length, items: usable };
const file = path.join(ROOT, 'search-index.json');
fs.writeFileSync(file, JSON.stringify(out));
const kb = (fs.statSync(file).size / 1024).toFixed(1);
console.log(`✓ 搜索索引：${usable.length} 条 / ${kb} KB`);
