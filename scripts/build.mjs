// scripts/build.mjs
// 作用：把「数据 + 模板」编译成可被抓取的静态页面
// 用法：node scripts/build.mjs
//
// 安全设计：
//   - 所有注入都带 <!-- build:xxx --> 标记，可重复执行，不会叠加
//   - 只改 <head> 与首页 #main-content、footer 导航，不动现有视觉结构

import fs from 'node:fs';
import {
  Report,
  assertClean,
  validateStyles,
  validatePreviews,
  validateMotions,
  validateRecipes,
  validateCompares,
} from './lib/validate.mjs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://www.aiwebstyle.com';
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => fs.writeFileSync(path.join(ROOT, p), s);
const exists = (p) => fs.existsSync(path.join(ROOT, p));

/* ---------- 1. 载入数据 ---------- */

const site = JSON.parse(read('data/site.json'));

const styles = JSON.parse(read('data/styles.json'));

// 只收录「已发布 + 页面已存在」的动效，避免索引页出现死链。
// 新写一个 motions/xxx.html 后重跑本脚本，卡片与 sitemap 会自动出现。
const motions = JSON.parse(read('data/motions.json'))
  .filter((m) => m.status === 'published')
  .filter((m) => exists(`motions/${m.slug}.html`))
  .sort((a, b) => a.order - b.order);

const previews = JSON.parse(read('data/previews.json'))
  .filter((p) => exists(`previews/${p.styleId}.html`));

// 对比页：data/compares/*.json，两个预览都存在才收录
const compareList = fs.existsSync(path.join(ROOT, 'data', 'compares'))
  ? fs
      .readdirSync(path.join(ROOT, 'data', 'compares'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(read(`data/compares/${f}`)))
      .filter((c) => c.status !== 'draft' && exists(`compares/${c.slug}.html`))
      .sort((a, b) => a.order - b.order)
  : [];

// 配方：data/recipes/*.json，一个文件一条，页面存在才收录
const recipeList = fs.existsSync(path.join(ROOT, 'data', 'recipes'))
  ? fs
      .readdirSync(path.join(ROOT, 'data', 'recipes'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(read(`data/recipes/${f}`)))
      .filter((r) => r.status !== 'draft' && exists(`recipes/${r.slug}.html`))
      .sort((a, b) => a.order - b.order)
  : [];

const motionsPlanned = JSON.parse(read('data/motions.json'))
  .filter((m) => m.status === 'published' && !exists(`motions/${m.slug}.html`))
  .map((m) => m.slug);

/* ---------- 1.5 数据守卫 ----------
   上面各集合已按「是否发布 / 页面是否存在」过滤过，缺页的条目会被悄悄跳过，
   正好掩盖数据问题。这里改读原始 JSON 再校验一次，草稿除外（草稿本来就是半成品）。 */

{
  const live = (arr) => arr.filter((x) => x.status !== 'draft');
  const rawMotions = live(JSON.parse(read('data/motions.json')));
  const rawPreviews = live(JSON.parse(read('data/previews.json')));
  const styleIds = new Set(styles.map((s) => s.id));

  const rep = new Report('data');
  validateStyles(styles, rep);
  validateMotions(rawMotions, rep);
  validatePreviews(rawPreviews, { styleIds }, rep);
  validateCompares(live(compareList), { recipeSlugs: new Set(recipeList.map((r) => r.slug)) }, rep);
  validateRecipes(live(recipeList), {
    styleIds,
    motionSlugs: new Set(rawMotions.map((m) => m.slug)),
  }, rep);
  assertClean(rep);
}

// 全英文站：界面文案直接内置，不再走词典
const L = {
  promptLabel: 'Example Prompt:',
  viewDetailsButton: 'View Details',
  applyThemeButton: 'Apply Theme',
};
const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const stripTags = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const clip = (s, n) => {
  const x = stripTags(s);
  return x.length <= n ? x : x.slice(0, n - 1).replace(/[，,、\s]\S*$/, '') + '…';
};

/* ---------- 2. 首页预渲染 ---------- */

function cardHtml(s) {
  return `            <div class="card" data-style-id="${s.id}">
                <div class="card-content">
                    <h3>${escapeAttr(s.name.en)}</h3>
                    <p class="prompt-label">${L.promptLabel || 'Example Prompt:'}</p>
                    <p class="prompt-text" title="${escapeAttr(s.prompt.en)}">${s.prompt.en}</p>
                    <div class="card-buttons">
                        <a href="${s.id}.html" class="btn btn-primary btn-view-details">${L.viewDetailsButton || 'View Details'}</a>
                        <button class="btn btn-secondary btn-apply-theme" data-theme-id="${s.id}">${L.applyThemeButton || 'Apply Theme'}</button>
                    </div>
                </div>
            </div>`;
}

function prerenderGallery() {
  let html = read('styles/index.html');

  // 2a. 用真实卡片替换 "Loading styles..."（标记式，可重复执行）
  const cardsBlock = `<!-- build:cards -->
        <div class="card-grid">
${styles.map(cardHtml).join('\n')}
        </div>
        <!-- /build:cards -->`;

  if (html.includes('<!-- build:cards -->')) {
    html = html.replace(/<!-- build:cards -->[\s\S]*?<!-- \/build:cards -->/, cardsBlock);
  } else {
    html = html.replace(
      /[ \t]*(?:<!--[^>]*?-->\s*)?<div class="loading-message"[^>]*>[\s\S]*?<\/div>/,
      cardsBlock
    );
  }

  // 2b. 插入介绍区块（放在卡片网格之后）
  if (!html.includes('<!-- build:intro -->')) {
    const intro = `
        <!-- build:intro -->
        <section class="seo-intro" aria-labelledby="intro-heading">
            <h2 id="intro-heading">A working library of AI website prompts, not just a gallery</h2>
            <p>Every entry on this page answers three practical questions: what the style actually looks like, when it is the right choice for a project, and the exact prompt you can paste into an AI website builder to reproduce it. There are currently ${styles.length} documented styles, each with a full breakdown page covering colour tokens, typography, layout rhythm, common failure modes, and a downloadable CSS starter.</p>
            <p>Most prompt lists stop at a one-line description. That is not enough to build with. A prompt like "make it glassmorphism" produces wildly different results depending on which model you use, what container it is dropped into, and whether contrast was specified. So each prompt here is written with explicit constraints: what to include, what to forbid, and which CSS properties carry the effect.</p>
            <h3>How to use this library</h3>
            <ol>
                <li><strong>Pick a direction.</strong> Browse the ${styles.length} styles below. Use "Apply Theme" to preview the palette directly on this page before committing.</li>
                <li><strong>Read the breakdown.</strong> Open a style to see its design tokens and the failure cases — the parts that break first when generated by an AI.</li>
                <li><strong>Copy the prompt.</strong> Paste it into your builder, then append your own product details. The prompts are written to be extended, not used verbatim.</li>
                <li><strong>Start from the CSS.</strong> If the model drifts, take the downloadable stylesheet as ground truth and ask it to match.</li>
            </ol>
        </section>

        <section class="seo-faq" aria-labelledby="faq-heading">
            <h2 id="faq-heading">Frequently asked questions</h2>
            <details>
                <summary>Can an AI actually build a good-looking website from a single prompt?</summary>
                <p>A single sentence will get you a layout, but not a coherent visual system. The prompts that work specify five things: the visual direction, the constraints (fonts, spacing, radius), the content structure, the interaction behaviour, and what to avoid. Leaving out constraints is why most first-attempt results look generic.</p>
            </details>
            <details>
                <summary>Which style should I start with for a SaaS landing page?</summary>
                <p>For most product sites in 2026 the safe defaults are Modern Tech (clean cards, restrained accent colour) or Bento Grid (modular tiles that carry many features without visual noise). Choose Brutalism or Maximalism only when the brand voice is explicitly loud, because they are hard to keep readable.</p>
            </details>
            <details>
                <summary>Why do AI-generated designs all look the same?</summary>
                <p>Because the model defaults to the statistical average of its training data: Inter, a soft purple gradient, and 16px rounded cards. Breaking out of that requires naming an alternative typographic tradition and an explicit palette, which is exactly what each prompt here does.</p>
            </details>
            <details>
                <summary>Do these prompts work with v0, Lovable, Bolt and Claude?</summary>
                <p>Yes, with small edits. Tools that output React components respond well to component-level prompts. Tools that output a single HTML file need the structure spelled out as a page outline instead. The style prompts here are tool-agnostic; only the delivery instructions differ.</p>
            </details>
            <details>
                <summary>Are the downloadable CSS files free to use?</summary>
                <p>Yes. Each style page offers a standalone CSS file you can drop into any project. Attribution is appreciated but not required.</p>
            </details>
        </section>
`;
    html = html.replace(/(\s*<\/main>)/, intro + '$1');
  }

  write('styles/index.html', html);
  return html.length;
}

/* ---------- 3. SEO 元信息注入 ---------- */

const SEO_RE = /<!-- build:seo -->[\s\S]*?<!-- \/build:seo -->/;

function seoBlock({ desc, canonical, ogType = 'website', jsonLd }) {
  const parts = [
    `<!-- build:seo -->`,
    `<meta name="description" content="${escapeAttr(desc)}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:site_name" content="AI Website Style Gallery">`,
    `<meta property="og:title" content="${escapeAttr(jsonLd ? jsonLd.title : 'AI Website Style Gallery')}">`,
    `<meta property="og:description" content="${escapeAttr(desc)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ];
  if (jsonLd) {
    parts.push(`<script type="application/ld+json">${JSON.stringify(jsonLd.data)}</script>`);
  }
  parts.push(`<!-- /build:seo -->`);
  return parts.join('\n    ');
}

function injectSeo(rel, block) {
  let html = read(rel);
  const headEnd = html.indexOf('</head>');
  if (headEnd === -1) return false;
  if (SEO_RE.test(html)) {
    html = html.replace(SEO_RE, block);
  } else {
    html = html.replace('</head>', `    ${block}\n</head>`);
  }
  write(rel, html);
  return true;
}

/* ---------- 3.5 AdSense 代码统一注入 ----------
   历史状态：只有 index 与 22 个旧详情页有广告代码，其余 52 个页面没有。
   广告代码是 AdSense 验证站点归属的依据，必须全站一致。
   预览页与 404 不挂广告：前者是要展示"设计本身"的 demo，后者是错误页。 */

function adsenseExcluded(rel) {
  if ((site.adsExcludedFiles || []).includes(rel)) return true;
  return (site.adsExcludedDirs || []).some((d) => rel.startsWith(d + '/'));
}

function injectAdsense(rel) {
  let html = read(rel);

  // 清掉历史遗留的、无标记的旧代码（含多行属性写法），统一由构建注入
  const legacy = /[ \t]*<script[^>]*src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^"]*"[\s\S]*?<\/script>\n?/g;
  const marked = /[ \t]*<!-- build:adsense -->[\s\S]*?<!-- \/build:adsense -->\n?/g;
  const cleaned = html.replace(legacy, '').replace(marked, '');

  if (adsenseExcluded(rel) || !site.adsenseClient) {
    if (cleaned !== html) write(rel, cleaned);
    return cleaned !== html;
  }

  const block = `    <!-- build:adsense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsenseClient}"
     crossorigin="anonymous"></script>
    <!-- /build:adsense -->`;

  let next;
  if (cleaned.includes('<!-- build:seo -->')) {
    next = cleaned.replace('<!-- build:seo -->', `${block}\n    <!-- build:seo -->`);
  } else {
    next = cleaned.replace('</head>', `${block}\n</head>`);
  }

  if (next === html) return false;
  write(rel, next);
  return true;
}

/* ---------- 4. Footer 导航（解决内链孤岛 + AdSense 必备页面入口） ---------- */

function injectFooterNav(rel) {
  let html = read(rel);
  const depth = rel.split('/').length - 1;
  const up = depth ? '../' : '';
  const navInner = `<p class="footer-nav" data-build="footer-nav">
                <!-- build:footer-nav -->
                <a href="${up}styles/index.html">Gallery</a>
                <a href="${up}previews/index.html">Previews</a>
                <a href="${up}compares/index.html">Compare</a>
                <a href="${up}motions/index.html">Motions</a>
                <a href="${up}recipes/index.html">Prompt Recipes</a>
                <a href="${up}about.html">About</a>
                <a href="${up}contact.html">Contact</a>
                <a href="${up}privacy.html">Privacy Policy</a>
                <a href="${up}terms.html">Terms</a>
                <!-- /build:footer-nav -->
            </p>`;

  // 已注入过 → 就地更新（便于以后调整导航项）
  const NAV_RE = /<p class="footer-nav"[^>]*>[\s\S]*?<\/p>/;
  if (NAV_RE.test(html)) {
    const next = html.replace(NAV_RE, navInner);
    if (next === html) return false;
    write(rel, next);
    return true;
  }

  const footerMatch = html.match(/<footer[^>]*>[\s\S]*?<\/footer>/);
  if (!footerMatch) return false;
  const footer = footerMatch[0].replace(/(<div class="container">)/, `$1\n            ${navInner}`);
  write(rel, html.replace(footerMatch[0], footer));
  return true;
}

/* ---------- 4.5 顶部导航（含语言按钮迁移） ---------- */

function injectNav(rel) {
  let html = read(rel);
  const depth = rel.split('/').length - 1;
  const up = depth ? '../' : '';
  const section = rel.startsWith('motions/')
    ? 'motions'
    : rel.startsWith('compares/')
    ? 'previews'
    : rel.startsWith('recipes/')
    ? 'recipes'
    : rel.startsWith('previews/')
    ? 'previews'
    : rel.startsWith('styles/')
    ? 'styles'
    : ['about.html', 'privacy.html', 'terms.html', 'contact.html'].includes(rel)
    ? 'about'
    : 'home';

  const act = (cond) => (cond ? ' class="is-active" aria-current="page"' : '');
  const nav = `    <!-- build:nav -->
    <nav class="site-nav" aria-label="Primary">
        <div class="nav-inner">
            <a class="nav-brand" href="${up}index.html">AI Web Style<span class="nav-brand-sub">gallery · motion · prompts</span></a>
            <div class="nav-links">
                <a href="${up}styles/index.html"${act(section === 'home' || section === 'styles')}>Styles</a>
                <a href="${up}previews/index.html"${act(section === 'previews')}>Previews</a>
                <a href="${up}motions/index.html"${act(section === 'motions')}>Motions</a>
                <a href="${up}recipes/index.html"${act(section === 'recipes')}>Prompts</a>
                <a href="${up}about.html"${act(section === 'about')}>About</a>
            </div>
        </div>
    </nav>
    <!-- /build:nav -->`;

  const NAV_RE = /[ \t]*<!-- build:nav -->[\s\S]*?<!-- \/build:nav -->/;
  if (NAV_RE.test(html)) {
    html = html.replace(NAV_RE, nav);
  } else {
    html = html.replace(/(<body[^>]*>)\s*\n?/, `$1\n${nav}\n`);
  }
  write(rel, html);
  return true;
}

/* ---------- 5.5 全站随机风格 ----------
   首页不锁死一个主题，每次加载随机挑一个（可用 ?style=xxx 指定，?style=none 关掉）。
   信息页（about / privacy / terms / contact / 404）跟同一套主题走：
   挑中的主题写进 sessionStorage，所以首页换肤后点进内页，配色是连贯的；
   内页自己刷新不会跳色，只有首页刷新才换新的。
   这段脚本必须紧贴 <body> 之后同步执行：主题类是加在 body 上的，
   等 DOMContentLoaded 再改就会出现一次默认配色的闪动（FOUC）。
   字体按需加载：只有挑中的主题需要 webfont 时，才注入那一份 Google Fonts。 */

// randomOnLoad: 每次刷新重新掷骰子（首页）
// root: 404 会在任意路径下被服务，所以它的站内链接必须用绝对路径
const THEME_PAGES = [
  { rel: 'index.html', root: '', randomOnLoad: true },
  { rel: 'about.html', root: '' },
  { rel: 'privacy.html', root: '' },
  { rel: 'terms.html', root: '' },
  { rel: 'contact.html', root: '' },
  { rel: '404.html', root: '/', randomOnLoad: true },
];

function buildPageThemes() {
  const fontMap = site.themeFonts || {};
  const themes = styles.map((s) => ({
    id: s.id,
    name: s.name.en,
    font: fontMap[s.id] || null,
  }));

  const codeFor = ({ root, randomOnLoad }) => `    (function () {
        var THEMES = ${JSON.stringify(themes)};
        var ROOT = ${JSON.stringify(root)};
        var RANDOM_ON_LOAD = ${randomOnLoad ? 'true' : 'false'};
        var STORE_KEY = 'aiwebstyle-theme';
        var want = new URLSearchParams(location.search).get('style');
        var chip, nameEl, button;
        var current = null;

        function byId(id) {
            for (var i = 0; i < THEMES.length; i++) {
                if (THEMES[i].id === id) return THEMES[i];
            }
            return null;
        }

        function remember(id) {
            try {
                sessionStorage.setItem(STORE_KEY, id);
            } catch (e) { /* sessionStorage throws in private mode — ignore */ }
        }

        function recalled() {
            try {
                return byId(sessionStorage.getItem(STORE_KEY) || '');
            } catch (e) {
                return null;
            }
        }

        function ensureFont(font) {
            if (!font) return;
            var key = 'home-font-' + font.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
            if (document.getElementById(key)) return;
            var link = document.createElement('link');
            link.id = key;
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=' + font + '&display=swap';
            document.head.appendChild(link);
        }

        function syncChip() {
            if (!nameEl || !current) return;
            nameEl.textContent = current.name;
            nameEl.href = ROOT + 'styles/' + current.id + '.html';
        }

        function paint(theme) {
            current = theme;
            var body = document.body;
            body.className = body.className
                .replace(/\\btheme-[a-z0-9-]+\\b/g, '')
                .replace(/\\s+/g, ' ')
                .trim();
            body.classList.add('theme-' + theme.id);
            ensureFont(theme.font);
            remember(theme.id);
            syncChip();
        }

        function pickDifferent() {
            if (THEMES.length < 2) return THEMES[0];
            var next;
            do {
                next = THEMES[Math.floor(Math.random() * THEMES.length)];
            } while (next === current);
            return next;
        }

        function resolveStart() {
            if (want === 'none') return null;
            var forced = want ? byId(want) : null;
            if (forced) return forced;
            if (!RANDOM_ON_LOAD) {
                var kept = recalled();
                if (kept) return kept;
            }
            return pickDifferent();
        }

        // Paint immediately, before any content is parsed
        var start = resolveStart();
        if (start) {
            paint(start);
        } else {
            // ?style=none: leave a marker class so script.js does not re-apply the remembered theme
            document.body.classList.add('theme-none');
            remember('none');
        }

        function setup() {
            chip = document.getElementById('home-style-chip');
            nameEl = document.getElementById('home-style-name');
            button = document.getElementById('home-style-another');
            if (!chip) return;
            if (!start) { chip.hidden = true; return; }
            syncChip();
            if (button) {
                button.addEventListener('click', function () { paint(pickDifferent()); });
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
    })();`;

  const blockFor = (page) => `    <!-- build:page-theme -->
    <script>
${codeFor(page)}
    </script>
    <!-- /build:page-theme -->`;

  let count = 0;
  for (const page of THEME_PAGES) {
    if (!exists(page.rel)) continue;
    let html = read(page.rel);
    html = html.replace(
      /[ \t]*<!-- build:(?:home-theme|page-theme) -->[\s\S]*?<!-- \/build:(?:home-theme|page-theme) -->\n?/g,
      ''
    );
    html = html.replace(/(<body[^>]*>)\s*\n?/, `$1\n${blockFor(page)}\n`);
    write(page.rel, html);
    count++;
  }
  return count;
}

/* ---------- 6. 动效索引渲染 ---------- */

function motionCard(m, i) {
  const idx = String(i + 1).padStart(2, '0');
  return `            <a class="mx-card" href="${m.slug}.html" data-trigger="${m.trigger}">
                <span class="mx-idx">${idx}</span>
                <h3>${m.name}</h3>
                <p>${m.summary}</p>
                <div class="mx-meta">
                    <span>${m.tech}</span>
                    <span class="mx-trigger">${m.trigger}</span>
                </div>
            </a>`;
}

function prerenderMotionsIndex() {
  const rel = 'motions/index.html';
  if (!exists(rel)) return 0;
  let html = read(rel);
  const cards = `<!-- build:motion-cards -->\n${motions.map(motionCard).join('\n')}\n            <!-- /build:motion-cards -->`;
  if (/<!-- build:motion-cards -->[\s\S]*?<!-- \/build:motion-cards -->/.test(html)) {
    html = html.replace(/<!-- build:motion-cards -->[\s\S]*?<!-- \/build:motion-cards -->/, cards);
  } else {
    html = html.replace('<!-- build:motion-cards -->', cards);
  }
  write(rel, html);
  return motions.length;
}

/* ---------- 7. sitemap / robots ---------- */

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/`, priority: '1.0', freq: 'weekly' },
    { loc: `${SITE}/styles/index.html`, priority: '0.9', freq: 'monthly' },
    ...styles.map((s) => ({
      loc: `${SITE}/styles/${s.id}.html`,
      priority: '0.8',
      freq: 'monthly',
    })),
    { loc: `${SITE}/motions/index.html`, priority: '0.9', freq: 'weekly' },
    ...motions.map((m) => ({
      loc: `${SITE}/motions/${m.slug}.html`,
      priority: '0.7',
      freq: 'monthly',
    })),
    { loc: `${SITE}/recipes/index.html`, priority: '0.9', freq: 'monthly' },
    ...recipeList.map((r) => ({
      loc: `${SITE}/recipes/${r.slug}.html`,
      priority: '0.8',
      freq: 'monthly',
    })),
    { loc: `${SITE}/previews/index.html`, priority: '0.9', freq: 'monthly' },
    { loc: `${SITE}/compares/index.html`, priority: '0.9', freq: 'monthly' },
    ...compareList.map((c) => ({
      loc: `${SITE}/compares/${c.slug}.html`,
      priority: '0.8',
      freq: 'monthly',
    })),
    ...previews.map((p) => ({
      loc: `${SITE}/previews/${p.styleId}.html`,
      priority: '0.7',
      freq: 'monthly',
    })),
    { loc: `${SITE}/about.html`, priority: '0.5', freq: 'yearly' },
    { loc: `${SITE}/privacy.html`, priority: '0.3', freq: 'yearly' },
    { loc: `${SITE}/contact.html`, priority: '0.6', freq: 'yearly' },
    { loc: `${SITE}/terms.html`, priority: '0.3', freq: 'yearly' },
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
  write('sitemap.xml', xml);
  write(
    'robots.txt',
    `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`
  );
}

/* ---------- 9.5 首页：板块入口与精选 ---------- */

function buildHomeSections() {
  const sections = [
    {
      href: 'styles/index.html',
      label: 'Styles',
      count: styles.length,
      unit: 'styles',
      text: 'Design directions with tokens, typography, layout rhythm and the failure cases that decide whether one survives a real page.',
    },
    {
      href: 'previews/index.html',
      label: 'Previews',
      count: previews.length,
      unit: 'pages',
      text: 'Every style rendered on one identical page, so the only variable is the stylesheet.',
    },
    {
      href: 'compares/index.html',
      label: 'Compare',
      count: compareList.length,
      unit: 'comparisons',
      text: 'Two styles, two live panels, one decision table — for a choice you are about to make.',
    },
    {
      href: 'motions/index.html',
      label: 'Motions',
      count: motions.length,
      unit: 'patterns',
      text: 'Animation patterns with a working demo and a prompt precise enough to build them right the first time.',
    },
    {
      href: 'recipes/index.html',
      label: 'Prompts',
      count: recipeList.length,
      unit: 'recipes',
      text: 'Whole-page prompts: section order, the variables worth changing, and how each page type fails.',
    },
  ];

  const cards = sections
    .map(
      (x, i) => `                <li><a class="home-row" href="${x.href}">
                    <span class="home-row-num">${String(i + 1).padStart(2, '0')}</span>
                    <span class="home-row-label">${x.label}</span>
                    <span class="home-row-text">${x.text}</span>
                    <span class="home-row-count">${x.count} ${x.unit}</span>
                    <span class="home-row-go" aria-hidden="true">→</span>
                </a></li>`
    )
    .join('\n');

  const block = `<!-- build:home-sections -->
${cards}
                <!-- /build:home-sections -->`;
  const doc = read('index.html');
  write('index.html', doc.replace(/<!-- build:home-sections -->[\s\S]*?<!-- \/build:home-sections -->/, block));
  return sections.length;
}

function buildHomeFeatured() {
  const featured = styles.filter((s) => s.isNew).slice(0, 6);
  if (!featured.length) return 0;

  const cards = featured
    .map(
      (s) => `                <a class="home-feature" href="styles/${s.id}.html">
                    <h3>${escapeAttr(s.name.en)}</h3>
                    <p>${escapeAttr(clip(s.description.en, 104))}</p>
                    <span class="home-go">Breakdown →</span>
                </a>`
    )
    .join('\n');

  const block = `<!-- build:home-featured -->
${cards}
                <!-- /build:home-featured -->`;
  const doc = read('index.html');
  write('index.html', doc.replace(/<!-- build:home-featured -->[\s\S]*?<!-- \/build:home-featured -->/, block));
  return featured.length;
}

/* 首页顶部数字条：数字全部来自数据，新增内容时自动变 */
function buildHomeStats() {
  const cells = [
    ['styles/index.html', styles.length, 'styles'],
    ['previews/index.html', previews.length, 'previews'],
    ['compares/index.html', compareList.length, 'comparisons'],
    ['motions/index.html', motions.length, 'motion patterns'],
    ['recipes/index.html', recipeList.length, 'page prompts'],
  ]
    .map(
      ([href, n, label]) => `                <a href="${href}"><b>${n}</b><span>${label}</span></a>`
    )
    .join('\n');

  const block = `<!-- build:home-stats -->\n${cells}\n                <!-- /build:home-stats -->`;
  const doc = read('index.html');
  write(
    'index.html',
    doc.replace(/<!-- build:home-stats -->[\s\S]*?<!-- \/build:home-stats -->/, block)
  );
  return cells.split('\n').length;
}

/* 首页风格名一览：28 个名字铺一行行，顺便给出 28 条指向详情页的内链 */
function buildHomeNames() {
  const names = styles
    .map((s) => `<a href="styles/${s.id}.html">${escapeAttr(s.name.en)}</a>`)
    // 分隔符两侧必须留空格，否则 nowrap 的链接连成一条不可断行的长串，会撑出横向滚动
    .join(' <span class="home-names-sep">·</span> ');

  const block = `<!-- build:home-names -->\n            ${names}\n            <!-- /build:home-names -->`;
  const doc = read('index.html');
  write(
    'index.html',
    doc.replace(/<!-- build:home-names -->[\s\S]*?<!-- \/build:home-names -->/, block)
  );
  return styles.length;
}

/* ---------- 8.8 相关链接（结构闭环） ----------
   风格页此前是死胡同：正文只有「回画廊 / 看预览 / 下载」三条出路。
   这里从既有数据反推关系，不新增任何手写内容：
     · 对比页 a/b  → 这个风格和谁被放在一起比较
     · 配方 styles[] → 哪些整页配方用到了它
     · 共现次数     → 邻居风格（同一对比里出现、被同一配方引用）
   对比页与动效页同样补上出口，让 100 个页面连成网而不是一棵树。 */

function relatedIndex() {
  const comparesByStyle = new Map();
  for (const c of compareList) {
    for (const side of ['a', 'b']) {
      const id = c[side];
      const other = side === 'a' ? c.b : c.a;
      if (!comparesByStyle.has(id)) comparesByStyle.set(id, []);
      comparesByStyle.get(id).push({ slug: c.slug, title: c.title, other });
    }
  }

  const recipesByStyle = new Map();
  for (const r of recipeList) {
    for (const sid of r.styles || []) {
      if (!recipesByStyle.has(sid)) recipesByStyle.set(sid, []);
      recipesByStyle.get(sid).push({ slug: r.slug, name: r.name });
    }
  }

  const recipesByMotion = new Map();
  for (const r of recipeList) {
    for (const m of r.motions || []) {
      if (!recipesByMotion.has(m)) recipesByMotion.set(m, []);
      recipesByMotion.get(m).push({ slug: r.slug, name: r.name });
    }
  }

  // 邻居：共同出现在一次对比里算 2 分，被同一配方引用算 1 分
  const neighbours = new Map();
  const score = new Map();
  const bump = (a, b, n) => {
    if (!a || !b || a === b) return;
    const k = a + '|' + b;
    score.set(k, (score.get(k) || 0) + n);
  };
  for (const c of compareList) bump(c.a, c.b, 2);
  for (const r of recipeList) {
    const ids = r.styles || [];
    for (const a of ids) for (const b of ids) bump(a, b, 1);
  }
  for (const s of styles) {
    const ranked = styles
      .map((o) => ({ id: o.id, name: o.name.en, score: score.get(s.id + '|' + o.id) || 0 }))
      .filter((o) => o.id !== s.id)
      .sort((x, y) => y.score - x.score);
    neighbours.set(s.id, ranked);
  }

  return { comparesByStyle, recipesByStyle, recipesByMotion, neighbours };
}

function relatedList(items) {
  return items.map((i) => `                        <li><a href="${i.href}">${escapeAttr(i.label)}</a></li>`).join('\n');
}

function relatedBlock(cols, heading, extraClass = '') {
  const usable = cols.filter((c) => c.items.length);
  if (!usable.length) return '';
  return `        <!-- build:related -->
        <section class="related${extraClass}" aria-labelledby="related-h">
            <h2 class="related-h" id="related-h">${heading}</h2>
            <div class="related-cols">
${usable
  .map(
    (c) => `                <div class="related-col">
                    <h3>${c.title}</h3>
                    <ul>
${relatedList(c.items)}
                    </ul>
                </div>`
  )
  .join('\n')}
            </div>
        </section>
        <!-- /build:related -->`;
}

function buildRelated() {
  const idx = relatedIndex();
  const nameOf = new Map(styles.map((s) => [s.id, s.name.en]));
  const RELATE_RE = /[ \t]*<!-- build:related -->[\s\S]*?<!-- \/build:related -->\n?/;
  let stylePages = 0;
  let comparePages = 0;
  let motionPages = 0;

  /* 风格详情页 */
  for (const s of styles) {
    const rel = `styles/${s.id}.html`;
    if (!exists(rel)) continue;
    let html = read(rel);

    const compares = (idx.comparesByStyle.get(s.id) || []).slice(0, 3).map((c) => ({
      href: `../compares/${c.slug}.html`,
      label: c.title,
    }));
    const recipes = (idx.recipesByStyle.get(s.id) || []).slice(0, 3).map((r) => ({
      href: `../recipes/${r.slug}.html`,
      label: r.name,
    }));
    const near = (idx.neighbours.get(s.id) || [])
      .slice(0, 3)
      .map((n) => ({ href: `${n.id}.html`, label: n.name }));

    const block = relatedBlock(
      [
        { title: 'Compared with', items: compares },
        { title: 'Used in these page recipes', items: recipes },
        { title: 'Neighbouring styles', items: near },
      ],
      'Related'
    );
    if (!block) continue;

    html = RELATE_RE.test(html) ? html.replace(RELATE_RE, block + '\n') : html.replace(/(\s*<\/main>)/, `\n${block}$1`);
    write(rel, html);
    stylePages++;
  }

  /* 对比页：出口指向两侧的完整拆解 + 相关配方 */
  for (const c of compareList) {
    const rel = `compares/${c.slug}.html`;
    if (!exists(rel)) continue;
    let html = read(rel);

    const block = relatedBlock(
      [
        {
          title: 'Full breakdown',
          items: [
            { href: `../styles/${c.a}.html`, label: `${nameOf.get(c.a) || c.a} — tokens, CSS and prompt` },
            { href: `../styles/${c.b}.html`, label: `${nameOf.get(c.b) || c.b} — tokens, CSS and prompt` },
          ],
        },
        {
          title: 'Page recipes that use them',
          items: (c.recipes || [])
            .filter((slug) => recipeList.some((r) => r.slug === slug))
            .map((slug) => ({
              href: `../recipes/${slug}.html`,
              label: recipeList.find((r) => r.slug === slug).name,
            })),
        },
      ],
      'Go deeper',
      ' related-standalone'
    );
    if (!block) continue;

    html = RELATE_RE.test(html)
      ? html.replace(RELATE_RE, block + '\n')
      : html.replace(/(\s*<\/body>)/, `\n${block}$1`);
    write(rel, html);
    comparePages++;
  }

  /* 动效页：出口指向用到这个动效的配方 */
  for (const m of motions) {
    const rel = `motions/${m.slug}.html`;
    if (!exists(rel)) continue;
    let html = read(rel);
    // 动效页在 motions/ 下，配方在 recipes/ 下，链接要跨一层目录
    let items = (idx.recipesByMotion.get(m.slug) || []).map((r) => ({
      href: `../recipes/${r.slug}.html`,
      label: r.name,
    }));
    let title = 'Used in these page recipes';

    // 有 7 个动效暂时没有被任何配方引用；退回到「同触发方式的其它动效」，
    // 保证每个动效页都有出口，而不是留成死胡同。
    if (!items.length) {
      items = motions
        .filter((o) => o.slug !== m.slug && o.trigger === m.trigger)
        .slice(0, 3)
        .map((o) => ({ href: `${o.slug}.html`, label: o.name }));
      title = `Other patterns that fire on ${m.trigger}`;
    }

    // interaction / navigation 各只有一个，没有同类可退；再退到「其它动效」
    if (!items.length) {
      items = motions
        .filter((o) => o.slug !== m.slug)
        .slice(0, 3)
        .map((o) => ({ href: `${o.slug}.html`, label: o.name }));
      title = 'Other motion patterns';
    }
    if (!items.length) continue;
    const block = relatedBlock([{ title, items }], 'Related', ' related-standalone');
    if (!block) continue;

    html = RELATE_RE.test(html)
      ? html.replace(RELATE_RE, block + '\n')
      : html.replace(/(\s*<nav class="m-next">)/, `\n${block}$1`);
    write(rel, html);
    motionPages++;
  }

  return { stylePages, comparePages, motionPages };
}

/* ---------- 10. 执行 ---------- */


const themedPages = buildPageThemes();

prerenderGallery();
buildHomeStats();
buildHomeNames();
buildHomeSections();
buildHomeFeatured();
const related = buildRelated();

const gallerySeo = seoBlock({
  desc: `All ${styles.length} documented web design styles with copy-ready AI prompts, design tokens and downloadable CSS. Each one links to a live preview built from identical markup.`,
  canonical: `${SITE}/styles/index.html`,
  jsonLd: {
    title: `All Styles — ${styles.length} web design styles with prompts`,
    data: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'All Styles',
      description: `A library of ${styles.length} web design styles with AI prompts and CSS.`,
      url: `${SITE}/styles/index.html`,
      isPartOf: { '@type': 'WebSite', name: 'AI Website Style Gallery', url: `${SITE}/` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: styles.length,
        itemListElement: styles.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: s.name.en,
          url: `${SITE}/styles/${s.id}.html`,
        })),
      },
    },
  },
});

const siteSeo = seoBlock({
  desc: `Design styles, live previews, motion patterns and whole-page prompts for building websites with AI — ${styles.length} styles, ${motions.length} motion patterns and ${recipeList.length} page recipes.`,
  canonical: `${SITE}/`,
  jsonLd: {
    title: 'AI Website Style Gallery',
    data: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AI Website Style Gallery',
      url: `${SITE}/`,
      description: `A reference library of ${styles.length} web design styles, their live previews, ${motions.length} motion patterns and ${recipeList.length} whole-page prompts.`,
      inLanguage: 'en',
      hasPart: [
        { '@type': 'CollectionPage', name: 'All Styles', url: `${SITE}/styles/index.html` },
        { '@type': 'CollectionPage', name: 'Style Previews', url: `${SITE}/previews/index.html` },
        { '@type': 'CollectionPage', name: 'Style Comparisons', url: `${SITE}/compares/index.html` },
        { '@type': 'CollectionPage', name: 'Web Motion Library', url: `${SITE}/motions/index.html` },
        { '@type': 'CollectionPage', name: 'Prompt Recipes', url: `${SITE}/recipes/index.html` },
      ],
    },
  },
});

injectSeo('styles/index.html', gallerySeo);
injectSeo('index.html', siteSeo);

let n = 0;
for (const s of styles) {
  const rel = `styles/${s.id}.html`;

  let desc = clip(s.summaryLong || s.description.en, 158);
  injectSeo(
    rel,
    seoBlock({
      desc,
      canonical: `${SITE}/styles/${s.id}.html`,
      ogType: 'article',
      jsonLd: {
        title: `${s.name.en} — Web Design Style, Prompt & CSS`,
        data: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: `${s.name.en}: Web Design Style, Prompt and CSS`,
          description: desc,
          about: { '@type': 'Thing', name: s.name.en },
          isPartOf: { '@type': 'WebSite', name: 'AI Website Style Gallery', url: `${SITE}/` },
        },
      },
    })
  );
  n++;
}

const allHtml = [
  'index.html',
  ...fs
    .readdirSync(path.join(ROOT, 'styles'))
    .filter((f) => f.endsWith('.html'))
    .map((f) => `styles/${f}`),
  ...(exists('motions')
    ? fs
        .readdirSync(path.join(ROOT, 'motions'))
        .filter((f) => f.endsWith('.html'))
        .map((f) => `motions/${f}`)
    : []),
  ...(exists('compares')
    ? fs
        .readdirSync(path.join(ROOT, 'compares'))
        .filter((f) => f.endsWith('.html'))
        .map((f) => `compares/${f}`)
    : []),
  ...(exists('recipes')
    ? fs
        .readdirSync(path.join(ROOT, 'recipes'))
        .filter((f) => f.endsWith('.html'))
        .map((f) => `recipes/${f}`)
    : []),
  // 只把「预览总览页」纳入站点体系；previews/*.html 是独立 demo，不加导航
  ...(exists('previews/index.html') ? ['previews/index.html'] : []),
  ...['about.html', 'privacy.html', 'terms.html', 'contact.html'].filter(exists),
];

/* ---------- 8. 动效页 SEO ---------- */

prerenderMotionsIndex();

let mn = 0;
for (const m of motions) {
  const rel = `motions/${m.slug}.html`;

  const desc = `${m.summary} Working demo, copy-ready AI prompt and the failure modes to avoid.`.slice(0, 158);
  injectSeo(
    rel,
    seoBlock({
      desc,
      canonical: `${SITE}/${rel}`,
      ogType: 'article',
      jsonLd: {
        title: `${m.name} — Motion Pattern, Prompt & Demo`,
        data: {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: m.name,
          description: m.summary,
          inLanguage: 'en',
          isPartOf: { '@type': 'WebSite', name: 'AI Website Style Gallery', url: `${SITE}/` },
          step: [
            { '@type': 'HowToStep', name: 'Copy the prompt', text: 'Paste the prompt from this page into your AI website builder.' },
            { '@type': 'HowToStep', name: 'Set the trigger', text: `Bind the effect to ${m.trigger} using ${m.tech}.` },
            { '@type': 'HowToStep', name: 'Add the fallback', text: 'Include the reduced-motion and unsupported-browser path before shipping.' },
          ],
        },
      },
    })
  );
  mn++;
}

const motionsIndexDesc = `A library of ${motions.length} web animation patterns with live demos, copy-ready AI prompts, compatibility notes and the failure modes most AI builds hit.`;
if (exists('motions/index.html')) {
  injectSeo(
    'motions/index.html',
    seoBlock({
      desc: motionsIndexDesc,
      canonical: `${SITE}/motions/index.html`,
      jsonLd: {
        title: 'Web Motion Library — Animation Prompts with Live Demos',
        data: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Web Motion Library',
          description: motionsIndexDesc,
          url: `${SITE}/motions/index.html`,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: motions.length,
            itemListElement: motions.map((m, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: m.name,
              url: `${SITE}/motions/${m.slug}.html`,
            })),
          },
        },
      },
    })
  );
}

/* ---------- 8.5 风格预览页 ---------- */

function injectPreviewCta(styleId, styleName) {
  const rel = `styles/${styleId}.html`;
  if (!exists(rel)) return false;
  let html = read(rel);
  const block = `        <!-- build:preview-cta -->
        <div class="preview-cta">
            <p>See this style applied to a real page — identical content, different stylesheet.</p>
            <a href="../previews/${styleId}.html">Open live preview →</a>
        </div>
        <!-- /build:preview-cta -->
`;
  const RE = /[ \t]*<!-- build:preview-cta -->[\s\S]*?<!-- \/build:preview-cta -->\n?/;
  if (RE.test(html)) {
    html = html.replace(RE, block);
  } else {
    const anchor = html.indexOf('<section class="style-detail-section');
    if (anchor === -1) return false;
    html = html.slice(0, anchor) + block + '\n' + html.slice(anchor);
  }
  write(rel, html);
  return true;
}

let pv = 0;
for (const p of previews) {
  const rel = `previews/${p.styleId}.html`;
  const desc = `A complete demo landing page built in the ${p.name} style. ${p.blurb}`.slice(0, 158);
  injectSeo(
    rel,
    seoBlock({
      desc,
      canonical: `${SITE}/${rel}`,
      ogType: 'article',
      jsonLd: {
        title: `Northline Studio — a demo site in the ${p.name} style`,
        data: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `${p.name} style — live preview`,
          description: desc,
          url: `${SITE}/${rel}`,
          about: { '@type': 'Thing', name: p.name },
          isPartOf: { '@type': 'WebSite', name: 'AI Website Style Gallery', url: `${SITE}/` },
        },
      },
    })
  );
  injectPreviewCta(p.styleId, p.name);
  pv++;
}

if (exists('previews/index.html')) {
  const d = `${previews.length} design styles rendered on one identical page — same markup, different stylesheet. Compare type, spacing, colour and depth side by side.`;
  injectSeo(
    'previews/index.html',
    seoBlock({
      desc: d,
      canonical: `${SITE}/previews/index.html`,
      jsonLd: {
        title: `All Style Previews — one page, ${previews.length} styles`,
        data: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'All Style Previews',
          description: d,
          url: `${SITE}/previews/index.html`,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: previews.length,
            itemListElement: previews.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: p.name,
              url: `${SITE}/previews/${p.styleId}.html`,
            })),
          },
        },
      },
    })
  );
}

/* ---------- 9. 合规页 SEO ---------- */

const legalSeo = {
  'about.html': {
    desc: 'What AI Website Style Gallery is, how design styles are selected and documented, our editorial standards, and how to reach us.',
    type: 'AboutPage',
    title: 'About This Site',
  },
  'privacy.html': {
    desc: 'How this site handles data, cookies and advertising — including Google AdSense and DoubleClick cookies, opt-out options, and your privacy rights.',
    type: 'WebPage',
    title: 'Privacy Policy',
  },
  'terms.html': {
    desc: 'Terms for using AI Website Style Gallery: what you may do with the written prompts and downloadable CSS, warranty disclaimer, and third-party notices.',
    type: 'WebPage',
    title: 'Terms of Use',
  },
  'contact.html': {
    desc: 'How to reach AI Website Style Gallery: corrections, style submissions, licensing and reuse, privacy requests, and what to include in a message.',
    type: 'ContactPage',
    title: 'Contact',
  },
};

for (const [rel, meta] of Object.entries(legalSeo)) {
  if (!exists(rel)) continue;
  injectSeo(
    rel,
    seoBlock({
      desc: meta.desc,
      canonical: `${SITE}/${rel}`,
      jsonLd: {
        title: `${meta.title} — AI Website Style Gallery`,
        data: {
          '@context': 'https://schema.org',
          '@type': meta.type,
          name: meta.title,
          description: meta.desc,
          url: `${SITE}/${rel}`,
          isPartOf: { '@type': 'WebSite', name: 'AI Website Style Gallery', url: `${SITE}/` },
        },
      },
    })
  );
}

/* 确保首页 head 里有每个卡片的 card-styles 链接（新风格自动补） */
function ensureCardCssLinks() {
  let html = read('styles/index.html');
  const missing = styles.filter(
    (s) => exists(`card-styles/${s.id}-card.css`) && !html.includes(`../card-styles/${s.id}-card.css`)
  );
  if (!missing.length) return 0;
  const links = missing
    .map((s) => `    <link rel="stylesheet" href="../card-styles/${s.id}-card.css">`)
    .join('\n');
  html = html.replace(/<\/head>/, (m) => links + '\n</head>');
  write('styles/index.html', html);
  return missing.length;
}

/* 全英文站守卫：HTML 里出现中文就报错（防止以后误粘贴中文内容） */
function checkEnglishOnly(pages) {
  const bad = [];
  for (const rel of pages) {
    const html = read(rel).replace(/<!--[\s\S]*?-->/g, '');
    const hits = html.match(/[\u4e00-\u9fff]+/g);
    if (hits) bad.push(`${rel}: ${[...new Set(hits)].slice(0, 6).join(' / ')}`);
  }
  if (bad.length) {
    console.error('\n✗ 英文站守卫：检测到中文\n' + bad.map((b) => '  · ' + b).join('\n') + '\n');
    if (!process.argv.includes('--force')) process.exit(1);
  }
  return bad.length;
}

const cardLinks = ensureCardCssLinks();
const cjkProblems = checkEnglishOnly([...allHtml, ...previews.map((p) => `previews/${p.styleId}.html`), ...(exists('previews/index.html') ? ['previews/index.html'] : [])]);

let adsN = 0;
let adsOff = 0;
for (const rel of allHtml) {
  if (adsenseExcluded(rel)) { injectAdsense(rel); adsOff++; continue; }
  if (injectAdsense(rel)) adsN++;
}

let nav = 0;
for (const rel of allHtml) {
  injectNav(rel);
  if (injectFooterNav(rel)) nav++;
}

buildSitemap();

console.log(`✓ 首页预渲染：${styles.length} 张卡片${cardLinks ? `（补 ${cardLinks} 个卡片样式链接）` : ''} | 随机风格池：${styles.length} 套 / 应用页：${themedPages} 个`);
console.log(`✓ 相关链接：风格页 ${related.stylePages} / 对比页 ${related.comparePages} / 动效页 ${related.motionPages}`);
console.log(`✓ 详情页 SEO：${n} 个`);
console.log(`✓ 动效索引：${motions.length} 张卡片 | 动效页 SEO：${mn} 个`);
console.log(`✓ 风格预览页：${pv} 个（含详情页入口）`);
console.log(`✓ 对比页：${compareList.length} 个（navigation / footer / sitemap 已接入）`);
console.log(`✓ 配方页：${recipeList.length} 个（导航 / 页脚 / sitemap 已接入）`);
if (motionsPlanned.length) console.log(`ℹ 待补页面（已登记未建）：${motionsPlanned.join(', ')}`);
console.log(`✓ Footer 导航：${nav} 个页面`);
console.log(`✓ AdSense 代码：${allHtml.length - adsOff} 个内容页（预览 demo 与 404 页按设计不挂广告）`);
console.log(`✓ 英文站守卫：${cjkProblems ? `⚠ ${cjkProblems} 个页面含中文` : '通过，无中文残留'}`);
console.log(`✓ sitemap.xml / robots.txt 已生成`);
