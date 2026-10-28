// scripts/build-head.mjs
// 作用：全站 <head> 的收尾规范化。跑在所有生成器之后、校验之前。
// 用法：node scripts/build-head.mjs
//
// 为什么单独一步，而不是改 5 个生成器：
//   标题 / favicon / og:image / 面包屑 / 结构化数据补全，是「每个页面都要一致」的事，
//   分散到 build、build-styles、build-previews、build-compares、build-recipes 五处必然走样
//   （原来三处各自实现过 seoBlock，就是这么分叉的）。这里按路径规则统一算一遍。
//
// 幂等：所有写入都由「路径 + data/」推导，重复执行结果一致。

import fs from 'node:fs';
import path from 'node:path';
import { SITE, BRAND, OG_DEFAULT, fitTitle } from './lib/seo.mjs';

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const write = (rel, s) => fs.writeFileSync(path.join(ROOT, rel), s);
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const json = (rel) => JSON.parse(read(rel));

const site = json('data/site.json');
const styles = [...json('data/styles.json'), ...json('data/new-styles.json')];
const styleById = new Map(styles.map((s) => [s.id, s]));
const motions = json('data/motions.json').filter((m) => m.status !== 'draft');
const motionBySlug = new Map(motions.map((m) => [m.slug, m]));
const recipes = fs.readdirSync(path.join(ROOT, 'data', 'recipes'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => json(path.join('data', 'recipes', f)))
  .filter((r) => r.status !== 'draft');
const recipeBySlug = new Map(recipes.map((r) => [r.slug, r]));
const compares = fs.readdirSync(path.join(ROOT, 'data', 'compares'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => json(path.join('data', 'compares', f)))
  .filter((c) => c.status !== 'draft');
const compareBySlug = new Map(compares.map((c) => [c.slug, c]));
const previews = json('data/previews.json');

const UPDATED = site.contentUpdated || '2026-10-28';
const PUBLISHED = site.contentPublished || '2026-10-27';
const ORG = {
  '@type': 'Organization',
  name: BRAND,
  url: `${SITE}/`,
  logo: { '@type': 'ImageObject', url: `${SITE}/img/apple-touch-icon.png`, width: 180, height: 180 },
};

const SECTIONS = {
  styles: { name: 'Styles', url: `${SITE}/styles/index.html` },
  previews: { name: 'Previews', url: `${SITE}/previews/index.html` },
  compares: { name: 'Comparisons', url: `${SITE}/compares/index.html` },
  motions: { name: 'Motions', url: `${SITE}/motions/index.html` },
  recipes: { name: 'Prompt Recipes', url: `${SITE}/recipes/index.html` },
};

/* ---------- 每页的标题 / 图 / 面包屑 ---------- */

function styleName(id) {
  const s = styleById.get(id);
  return s ? (s.name.en || s.name) : id;
}

function metaFor(rel) {
  const parts = rel.split('/');
  const dir = parts.length > 1 ? parts[0] : '';
  const file = parts[parts.length - 1];
  const slug = file.replace(/\.html$/, '');

  if (rel === 'index.html') {
    return {
      title: fitTitle([
        `AI Web Style — ${styleById.size} styles, previews and prompts`,
        `${BRAND} — styles, previews and prompts`,
      ]),
      image: OG_DEFAULT,
      imageAlt: 'AI Web Style — a reference library of web design styles',
    };
  }

  if (rel === '404.html') {
    return { title: `Page not found | ${BRAND}`, image: OG_DEFAULT, imageAlt: 'Page not found', noindex: true };
  }

  if (['about.html', 'privacy.html', 'terms.html', 'contact.html'].includes(rel)) {
    const label = { 'about.html': 'About', 'privacy.html': 'Privacy Policy', 'terms.html': 'Terms of Use', 'contact.html': 'Contact' }[rel];
    return {
      title: `${label} | ${BRAND}`,
      image: OG_DEFAULT,
      imageAlt: `${label} — ${BRAND}`,
      crumb: { name: label },
    };
  }

  if (dir === 'styles') {
    if (slug === 'index') {
      return {
        title: fitTitle([
          `All ${styleById.size} Design Styles — Prompts & CSS | ${BRAND}`,
          `All Design Styles | ${BRAND}`,
        ]),
        image: OG_DEFAULT,
        imageAlt: 'All web design styles',
        crumb: { name: 'Styles' },
      };
    }
    const name = styleName(slug);
    return {
      title: fitTitle([
        `${name} — Prompt & CSS | ${BRAND}`,
        `${name} | ${BRAND}`,
        name,
      ]),
      image: `${SITE}/img/og/${slug}.jpg`,
      imageAlt: `${name} style — live preview`,
      crumb: { name, section: 'styles' },
      updatedAt: (styleById.get(slug) || {}).updatedAt || UPDATED,
      schemaType: 'Article',
    };
  }

  if (dir === 'previews') {
    if (slug === 'index') {
      return {
        title: fitTitle([
          `Live Previews — ${previews.length} Styles, One Page | ${BRAND}`,
          `Live Style Previews | ${BRAND}`,
        ]),
        image: OG_DEFAULT,
        imageAlt: 'Live style previews',
        crumb: { name: 'Previews' },
      };
    }
    const p = previews.find((x) => x.styleId === slug);
    const name = p ? p.name : styleName(slug);
    return {
      title: fitTitle([`Live preview: ${name} | ${BRAND}`, `Live preview: ${name}`]),
      image: `${SITE}/img/og/${slug}.jpg`,
      imageAlt: `${name} style — full page preview`,
      crumb: { name: `${name} preview`, section: 'previews' },
      updatedAt: UPDATED,
    };
  }

  if (dir === 'compares') {
    if (slug === 'index') {
      return {
        title: fitTitle([
          `Styles Compared — ${compares.length} Side-by-Side Pairs | ${BRAND}`,
          `Style Comparisons | ${BRAND}`,
        ]),
        image: OG_DEFAULT,
        imageAlt: 'Style comparisons',
        crumb: { name: 'Comparisons' },
      };
    }
    const c = compareBySlug.get(slug);
    const title = c ? c.title : slug;
    return {
      title: fitTitle([
        `${title} — Side by Side | ${BRAND}`,
        `${title} Compared | ${BRAND}`,
        `${title} | ${BRAND}`,
        title,
      ]),
      image: c ? `${SITE}/img/og/${c.a}.jpg` : OG_DEFAULT,
      imageAlt: `${title} — side-by-side live previews`,
      crumb: { name: title, section: 'compares' },
      updatedAt: (c && c.updatedAt) || UPDATED,
      schemaType: 'Article',
    };
  }

  if (dir === 'motions') {
    if (slug === 'index') {
      return {
        title: fitTitle([
          `Web Motion Library — ${motions.length} Animation Patterns | ${BRAND}`,
          `Web Motion Library | ${BRAND}`,
        ]),
        image: OG_DEFAULT,
        imageAlt: 'Web motion library',
        crumb: { name: 'Motions' },
      };
    }
    const m = motionBySlug.get(slug);
    const name = m ? m.name : slug;
    return {
      title: fitTitle([
        `${name} — CSS Motion Pattern | ${BRAND}`,
        `${name} | AI Web Motion`,
        name,
      ]),
      image: OG_DEFAULT,
      imageAlt: `${name} — motion pattern demo`,
      crumb: { name, section: 'motions' },
      updatedAt: (m && m.updatedAt) || UPDATED,
      schemaType: 'HowTo',
    };
  }

  if (dir === 'recipes') {
    if (slug === 'index') {
      return {
        title: fitTitle([
          `Prompt Recipes — ${recipes.length} Whole-Page Prompts | ${BRAND}`,
          `Prompt Recipes | ${BRAND}`,
        ]),
        image: OG_DEFAULT,
        imageAlt: 'Prompt recipes',
        crumb: { name: 'Prompt Recipes' },
      };
    }
    const r = recipeBySlug.get(slug);
    const name = r ? r.name : slug;
    return {
      title: fitTitle([`${name} — Page Prompt Recipe | ${BRAND}`, `${name} | ${BRAND}`, name]),
      image: OG_DEFAULT,
      imageAlt: `${name} — prompt recipe`,
      crumb: { name, section: 'recipes' },
      updatedAt: (r && r.updatedAt) || UPDATED,
      schemaType: 'HowTo',
    };
  }

  return null;
}

/* ---------- 工具 ---------- */

const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const HEAD_RE = /[ \t]*<!-- build:head -->[\s\S]*?<!-- \/build:head -->\n?/;

function canonicalOf(html) {
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return m ? m[1] : null;
}

function breadcrumbLd(html, crumb) {
  const canonical = canonicalOf(html);
  if (!canonical || !crumb) return null;
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` }];
  if (crumb.section && SECTIONS[crumb.section]) {
    items.push({ '@type': 'ListItem', position: 2, name: SECTIONS[crumb.section].name, item: SECTIONS[crumb.section].url });
  }
  items.push({ '@type': 'ListItem', position: items.length + 1, name: crumb.name, item: canonical });
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

const LD_RE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;

function enrichSchema(html, meta) {
  let touched = 0;
  const out = html.replace(LD_RE, (whole, body) => {
    let obj;
    try { obj = JSON.parse(body); } catch (e) { return whole; }
    if (Array.isArray(obj) || !obj['@type']) return whole;
    const type = obj['@type'];
    const isArticle = type === 'Article';
    const isHowTo = type === 'HowTo';
    const isPage = ['WebPage', 'CollectionPage', 'AboutPage', 'ContactPage', 'WebSite'].includes(type);
    if (!isArticle && !isHowTo && !isPage) return whole;

    let changed = false;
    const put = (k, v) => { if (obj[k] === undefined && v) { obj[k] = v; changed = true; } };

    put('inLanguage', 'en');
    if (isArticle || isHowTo) {
      put('image', [meta.image]);
      put('datePublished', PUBLISHED);
      put('dateModified', meta.updatedAt || UPDATED);
      put('author', { '@type': 'Organization', name: BRAND, url: `${SITE}/` });
      put('publisher', ORG);
      const canonical = canonicalOf(html);
      if (canonical) put('mainEntityOfPage', { '@type': 'WebPage', '@id': canonical });
    }
    if (isPage) {
      put('image', meta.image);
      put('publisher', ORG);
    }
    if (!changed) return whole;
    touched++;
    return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
  });
  return { html: out, touched };
}

/* ---------- 字体按需加载（仅 styles/ 目录） ---------- */

function rootFontMap() {
  const css = read('style.css');
  const block = css.match(/:root\s*\{([^{}]*)\}/);
  const map = {};
  if (block) {
    for (const m of block[1].matchAll(/(--font-[a-z-]+)\s*:\s*([^;]+);/g)) map[m[1]] = m[2];
  }
  return map;
}
const FONT_VARS = rootFontMap();
const norm = (name) => name.trim().replace(/^['"]|['"]$/g, '').replace(/\s+/g, '+');
// 系统 / 通用字体名不能丢给 Google Fonts（请求会 400，整张样式表都加载不到）
const SYSTEM_FAMILIES = new Set([
  'Times New Roman', 'Courier New', 'Courier', 'Helvetica Neue', 'Helvetica', 'Arial', 'Times', 'Georgia',
  'Verdana', 'Segoe UI', 'BlinkMacSystemFont', '-apple-system', 'system-ui', 'ui-sans-serif', 'ui-serif',
  'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace', 'sans-serif', 'serif', 'cursive', 'fantasy',
]);
const isSystem = (f) => SYSTEM_FAMILIES.has(f.replace(/\+/g, ' '));

// 站点确实在 Google Fonts 上有的家族：:root 里登记的 + site.themeFonts 里出现的
const KNOWN_GOOGLE = new Set([
  ...Object.values(FONT_VARS).flatMap((expr) => expandVars(expr).split(',')).map(norm).filter((f) => f && !isSystem(f)),
  ...Object.values(site.themeFonts || {}).flatMap((spec) => String(spec || '').split('&family=')).map((p) => norm(p.split(':')[0])).filter(Boolean),
]);

function familyOfVar(expr) {
  // expr 形如 "'Playfair Display', Georgia, serif"
  const first = expr.split(',')[0];
  return norm(first);
}

// 把 var(--font-x) 展开成真实字体栈（可能嵌套：--heading-font: var(--font-pop)）
function expandVars(expr) {
  let out = String(expr);
  for (let i = 0; i < 4 && out.includes('var('); i++) {
    out = out.replace(/var\((--font-[a-z-]+)\)/g, (m, name) => FONT_VARS[name] || m);
  }
  return out;
}

// 从一段 CSS 里收集「真正被用到」的字体名。
// 关键点：只扫 --font-x 的定义会把页面里抄来的整套变量表都算进去（一页塞九个字体），
// 所以只认两件事：① 出现在 font-family 里的；② 被 var(--font-x) 引用后展开出来的。
function cssFontNeed(cssText, into) {
  const localVars = {};
  for (const m of cssText.matchAll(/(--[a-z0-9-]*font[a-z0-9-]*)\s*:\s*([^;}]+)/g)) localVars[m[1]] = m[2];
  const lookup = (name) => localVars[name] || FONT_VARS[name];
  const expand = (expr) => {
    let out = String(expr);
    for (let i = 0; i < 4 && out.includes('var('); i++) {
      out = out.replace(/var\((--[a-z0-9-]*font[a-z0-9-]*)\)/g, (m, n) => lookup(n) || m);
    }
    return out;
  };
  const addStack = (expr) => {
    for (const part of expand(expr).split(',')) into.add(norm(part));
  };

  for (const m of cssText.matchAll(/font-family\s*:\s*([^;}\n]+)/g)) addStack(m[1]);
  for (const m of cssText.matchAll(/var\((--[a-z0-9-]*font[a-z0-9-]*)\)/g)) {
    const expr = lookup(m[1]);
    if (expr) addStack(expr);
  }
  return into;
}

// 主题块里的 --base-font / --heading-font 是「约定」，即使页面自己没写 var() 也要加载
function themeBaseNeed(block, into) {
  for (const m of block.matchAll(/--(base|heading)-font\s*:\s*([^;}]+)/g)) {
    let expr = m[2];
    for (let i = 0; i < 4 && expr.includes('var('); i++) {
      expr = expr.replace(/var\((--[a-z0-9-]*font[a-z0-9-]*)\)/g, (x, n) => FONT_VARS[n] || x);
    }
    for (const part of expr.split(',')) into.add(norm(part));
  }
  return into;
}

// 某个主题在 style.css 里的全部规则（不只是 body.theme-x { } 变量块，
// 还有 body.theme-x h1 { font-family: var(--font-pixel) } 这种真正的字体用法）
function themeCss(themeId) {
  const css = read('style.css');
  const re = new RegExp('[^{}]*body\\.theme-' + themeId + '[^{}]*\\{[^{}]*\\}', 'g');
  return [...css.matchAll(re)].map((m) => m[0]).join('\n');
}

function trimFonts(rel, html, themeId) {
  const link = html.match(/<link href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)" rel="stylesheet">/);
  if (!link) return { html, before: 0, after: 0 };
  const url = link[1];
  const families = [...url.matchAll(/[?&]family=([^&]+)/g)].map((m) => m[1]);
  const order = families.map((f) => f.split(':')[0]);
  const weightsOf = new Map(families.map((f) => [f.split(':')[0], f]));

  // 1) 页面自己 <style> + 该主题的 body.theme-* 块里用到的字体
  //    只扫页面会漏掉主题块里的 --heading-font: var(--font-pop) 这类间接引用
  const pageCss = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  // Inter / Roboto Mono 是 style.css 全局在用的（正文与等宽小标签），页面自己不一定声明
  const need = new Set(['Inter', 'Roboto Mono'].map(norm));
  cssFontNeed(pageCss, need);
  cssFontNeed(themeCss(themeId), need);
  themeBaseNeed(themeCss(themeId), need);

  // 2) 该主题在 data/site.json 里登记的字体规格：既补家族，也补字重
  const themeSpec = (site.themeFonts || {})[themeId];
  const themeNeed = new Map();
  if (themeSpec) {
    for (const part of String(themeSpec).split('&family=')) {
      const [fam, w] = part.split(':');
      if (!fam) continue;
      themeNeed.set(norm(fam), w || '');
      need.add(norm(fam));
    }
  }

  // 3) 保留原有家族（顺序不变），再补上「确实被用到但原链接里没有」的字体
  //    （editorial / neo-brutalism 这类新页面原本只挂了 Inter + Roboto Mono，
  //      标题字体从来没加载过，一直靠系统兜底）
  const keep = order.filter((f) => need.has(f) && !isSystem(f));
  const extra = [...need].filter((f) => !keep.includes(f) && KNOWN_GOOGLE.has(f));
  for (const f of extra) keep.push(f);

  const specOf = (f) => {
    if (weightsOf.has(f)) return weightsOf.get(f);
    const w = themeNeed.get(f);
    return w ? `${f}:${w}` : f;
  };
  const next = keep.map((f) => `family=${specOf(f)}`);

  const same = keep.length === order.length && next.every((v, i) => v === `family=${families[i]}`);
  if (same) return { html, before: order.length, after: order.length };

  const rebuilt = `https://fonts.googleapis.com/css2?${next.join('&')}&display=swap`;
  return {
    html: html.replace(link[0], `<link href="${rebuilt}" rel="stylesheet">`),
    before: order.length,
    after: keep.length,
  };
}

/* ---------- 主流程 ---------- */

const skipDirs = new Set(['.git', 'node_modules', '.workbuddy', 'zips', 'img']);
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) pages.push(path.relative(ROOT, p));
  }
})(ROOT);

let titles = 0;
let heads = 0;
let schemas = 0;
let fontsTrimmed = 0;
let fontFamiliesBefore = 0;
let fontFamiliesAfter = 0;
const missingMeta = [];

for (const rel of pages) {
  const meta = metaFor(rel);
  if (!meta) { missingMeta.push(rel); continue; }
  let html = read(rel);

  // 1) 标题
  const nextTitle = `<title>${escAttr(meta.title)}</title>`;
  const cur = html.match(/<title>[\s\S]*?<\/title>/);
  if (cur && cur[0] !== nextTitle) { html = html.replace(cur[0], nextTitle); titles++; }

  // 2) favicon + 社交图 + 面包屑
  const crumb = breadcrumbLd(html, meta.crumb);
  const block = [
    '<!-- build:head -->',
    `<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">`,
    `<link rel="icon" href="/img/favicon-96.png" type="image/png" sizes="96x96">`,
    `<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">`,
    `<meta property="og:image" content="${escAttr(meta.image)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${escAttr(meta.imageAlt)}">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta name="twitter:image" content="${escAttr(meta.image)}">`,
    `<meta name="twitter:image:alt" content="${escAttr(meta.imageAlt)}">`,
    crumb ? `<script type="application/ld+json">${JSON.stringify(crumb)}</script>` : '',
    '<!-- /build:head -->',
  ].filter(Boolean).join('\n    ');

  if (HEAD_RE.test(html)) html = html.replace(HEAD_RE, `${block}\n`);
  else html = html.replace('</head>', `    ${block}\n</head>`);
  heads++;

  // 3) 结构化数据补全
  const enriched = enrichSchema(html, meta);
  html = enriched.html;
  schemas += enriched.touched;

  // 4) 风格页字体按需（其余目录的字体请求本来就克制，不动）
  if (rel.startsWith('styles/') && rel.split('/').length === 2) {
    const themeId = rel.replace('styles/', '').replace('.html', '');
    const t = trimFonts(rel, html, themeId);
    html = t.html;
    if (t.after < t.before) { fontsTrimmed++; fontFamiliesBefore += t.before; fontFamiliesAfter += t.after; }
  }

  write(rel, html);
}

console.log(`✓ 标题规范化：改 ${titles} 个 | head 块：${heads} 页 | 结构化数据补全：${schemas} 处`);
if (fontsTrimmed) {
  console.log(`✓ 字体按需：${fontsTrimmed} 个风格页，共 ${fontFamiliesBefore} → ${fontFamiliesAfter} 个字体家族`);
}
if (missingMeta.length) {
  console.log(`  ! 未匹配规则的页面（保持原样）：${missingMeta.join(', ')}`);
}
