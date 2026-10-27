// scripts/validate-data.mjs
// 内容体检。
//
// 分两层，跑在两个时机：
//   第一层 结构（默认）—— 字段齐全、类型正确、枚举合法、引用存在、无重复。
//                        在生成任何页面之前跑，坏数据不进入生成器。
//   第二层 落地（--files）—— 每条内容是否真的有对应页面 / 样式 / 主题块 / 下载包。
//                        必须在生成之后跑（新增内容时文件还没生成），用来兜住
//                        「数据加了、产物漏了」这类静默缺口。
//
// 用法：node scripts/validate-data.mjs           只查结构
//       node scripts/validate-data.mjs --files   结构 + 落地
//       build-all.mjs 会自动跑这两次，把结果夹在生成前后。

import fs from 'node:fs';
import path from 'node:path';

import {
    Report,
    assertClean,
    validateStyles,
    validatePreviews,
    validateMotions,
    validateRecipes,
    validateCompares,
    validateNewStyles,
} from './lib/validate.mjs';

const ROOT = process.cwd();
const FILE_LAYER = process.argv.includes('--files');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const readJson = (p) => JSON.parse(read(p));

/* ---------- 读文件 ---------- */

function readJsonDir(dir) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) return [];
    return fs
        .readdirSync(abs)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .map((f) => {
            try {
                return readJson(`${dir}/${f}`);
            } catch (e) {
                const rep = new Report(dir);
                rep.error(`${dir}/${f}`, `JSON 解析失败：${e.message}`);
                assertClean(rep);
                return null;
            }
        })
        .filter(Boolean);
}

// 草稿是半成品，不参与校验也不应该阻断构建（对应生成器里的 status === 'draft' 过滤）
const live = (arr) => arr.filter((x) => x.status !== 'draft');

const stylesRaw = readJson('data/styles.json');
const previewsRaw = readJson('data/previews.json');
const motionsRaw = readJson('data/motions.json');
const recipesRaw = readJsonDir('data/recipes');
const comparesRaw = readJsonDir('data/compares');

const styles = stylesRaw;
const previews = previewsRaw;
const motions = live(motionsRaw);
const recipes = live(recipesRaw);
const compares = live(comparesRaw);
const newStyles = exists('data/new-styles.json') ? readJson('data/new-styles.json') : [];

const draftCount =
    motionsRaw.length - motions.length +
    (recipesRaw.length - recipes.length) +
    (comparesRaw.length - compares.length);

const styleIds = new Set(styles.map((s) => s.id));
const previewIds = new Set(previews.map((p) => p.styleId));
const motionSlugs = new Set(motions.map((m) => m.slug));
const recipeSlugs = new Set(recipes.map((r) => r.slug));

/* ---------- 第一层：结构 ---------- */

const rep = new Report('data');

validateStyles(styles, rep);
validatePreviews(previews, { styleIds }, rep);
validateMotions(motions, rep);
validateRecipes(recipes, { styleIds, motionSlugs }, rep);
validateCompares(compares, { previewIds, recipeSlugs }, rep);
if (newStyles.length) validateNewStyles(newStyles, rep);

/* ---------- 第二层：内容 ↔ 文件（只在 --files 时跑，必须在生成之后） ---------- */

if (FILE_LAYER) {
    const themeCss = read('style.css');
    /* ---------- 第二层：内容 ↔ 文件 ---------- */

    
    for (const s of styles) {
        const w = `styles[${s.id}]`;
        if (!exists(`styles/${s.id}.html`)) rep.error(w, `缺少详情页 styles/${s.id}.html`);
        if (!exists(`card-styles/${s.id}-card.css`)) {
            rep.error(w, `缺少卡片样式 card-styles/${s.id}-card.css，首页这张卡会没有样式`);
        }
        if (!new RegExp(`body\\.theme-${s.id}\\s*\\{`).test(themeCss)) {
            rep.error(w, `style.css 里没有 body.theme-${s.id}，这个风格的详情页会用默认配色`);
        }
        const zip = s.zipFile || `${s.id}.zip`;
        if (!exists(`zips/${zip}`)) rep.warn(w, `缺少下载包 zips/${zip}`);
        if (!exists(`previews/${s.id}.css`)) {
            rep.error(w, `缺少预览样式 previews/${s.id}.css`);
        }
        if (!exists(`previews/${s.id}.html`)) {
            rep.error(w, `缺少预览页 previews/${s.id}.html`);
        }
        if (!previewIds.has(s.id)) rep.error(w, `previews.json 里没有这一条，预览总览页会漏掉它`);
    }

    for (const p of previews) {
        if (!styleIds.has(p.styleId)) {
            rep.error(`previews[${p.styleId}]`, 'styles.json 里没有这个风格，卡片与详情页都不存在');
        }
    }

    for (const m of motions) {
        if (!exists(`motions/${m.slug}.html`)) {
            rep.error(`motions[${m.slug}]`, `缺少页面 motions/${m.slug}.html`);
        }
    }

    // 触发方式必须有对应的筛选按钮，否则那张卡在索引页上永远筛不出来
    if (exists('motions/index.html')) {
        const idx = read('motions/index.html');
        const filters = new Set([...idx.matchAll(/data-filter="(\w+)"/g)].map((m) => m[1]));
        for (const m of motions) {
            if (!filters.has(m.trigger)) {
                rep.error(`motions[${m.slug}]`, `索引页没有 trigger="${m.trigger}" 的筛选按钮`);
            }
        }
    }

    for (const r of recipes) {
        if (!exists(`recipes/${r.slug}.html`)) {
            rep.error(`recipes[${r.slug}]`, `缺少页面 recipes/${r.slug}.html`);
        }
    }

    for (const c of compares) {
        if (!exists(`compares/${c.slug}.html`)) {
            rep.error(`compares[${c.slug}]`, `缺少页面 compares/${c.slug}.html`);
        }
    }

    if (!exists('previews/index.html')) rep.error('previews', '缺少预览总览页');
    if (!exists('compares/index.html')) rep.error('compares', '缺少对比总览页');
    if (!exists('recipes/index.html')) rep.error('recipes', '缺少配方总览页');
    if (!exists('motions/index.html')) rep.error('motions', '缺少动效总览页');
    if (!exists('styles/index.html')) rep.error('styles', '缺少画廊页 styles/index.html');
    // 首页按主题随机换肤时要用到这张表：缺一条，那个风格会退回系统字体
    const fontMap = (exists('data/site.json') ? readJson('data/site.json').themeFonts : null) || {};
    for (const s of styles) {
        if (!(s.id in fontMap)) {
            rep.warn(`styles[${s.id}]`, 'site.json 的 themeFonts 里没有这一条，首页随机到这个风格时会缺字体（系统字体可写 null）');
        }
    }


    /* ---------- 覆盖反向检查 ---------- */

    function orphanPages(dir, knownIds, { ignore = [] } = {}) {
        const abs = path.join(ROOT, dir);
        if (!fs.existsSync(abs)) return [];
        return fs
            .readdirSync(abs)
            .filter((f) => f.endsWith('.html'))
            .map((f) => f.replace(/\.html$/, ''))
            .filter((id) => id !== 'index' && !knownIds.has(id) && !ignore.includes(id));
    }

    const orphanStyles = orphanPages('styles', styleIds);
    const orphanPreviews = orphanPages('previews', previewIds);
    const orphanMotions = orphanPages('motions', motionSlugs);
    const orphanRecipes = orphanPages('recipes', recipeSlugs);
    const orphanCompares = orphanPages('compares', new Set(compares.map((c) => c.slug)));

    for (const id of orphanStyles) rep.warn(`styles/${id}.html`, '详情页存在但数据里没有这条，属于孤儿页面');
    for (const id of orphanPreviews) rep.warn(`previews/${id}.html`, '预览页存在但数据里没有这条');
    for (const id of orphanMotions) rep.warn(`motions/${id}.html`, '动效页存在但数据里没有这条');
    for (const id of orphanRecipes) rep.warn(`recipes/${id}.html`, '配方页存在但数据里没有这条');
    for (const id of orphanCompares) rep.warn(`compares/${id}.html`, '对比页存在但数据里没有这条');
}

/* ---------- 输出 ---------- */

const counts = [
    ['styles', styles.length],
    ['previews', previews.length],
    ['motions', motions.length],
    ['recipes', recipes.length],
    ['compares', compares.length],
    ['new-styles', newStyles.length],
];

if (rep.items.length) rep.print();

console.log(
    '  ' +
        counts.map(([k, v]) => `${k} ${v}`).join(' · ') +
        `  →  ${rep.errors.length} 错误 / ${rep.warnings.length} 提醒` +
        (draftCount ? `（跳过 ${draftCount} 条草稿）` : '')
);

assertClean(rep, { quiet: true });
console.log(FILE_LAYER ? '✓ 数据与产物一致' : '✓ 数据结构校验通过');
