// scripts/build-recipes.mjs
// 作用：把 data/recipes/*.json 编译成 recipes/index.html 与 recipes/{slug}.html
// 用法：node scripts/build-recipes.mjs
//
// 设计要点：
//   - 一个 JSON = 一个配方，新增配方只需放一个文件，页面 / 索引 / sitemap 全部自动出现
//   - prompt 用 promptLines 数组存，避免 JSON 里塞 \n
//   - {{TOKEN}} 由 controls 里的选项替换，默认值在构建时就烘进 HTML（无 JS 也能读）
//   - 交互只是「重新组装」，不改变任何服务端内容

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://www.aiwebstyle.com';
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => fs.writeFileSync(path.join(ROOT, p), s);

const CATEGORIES = {
  marketing: 'Marketing',
  commerce: 'Commerce',
  app: 'Product UI',
  content: 'Content',
  personal: 'Personal',
};

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- 载入 ---------- */

const dir = path.join(ROOT, 'data', 'recipes');
if (!fs.existsSync(dir)) {
  console.error('✗ data/recipes 不存在');
  process.exit(1);
}

const recipes = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(read(`data/recipes/${f}`)))
  .filter((r) => r.status !== 'draft')
  .sort((a, b) => a.order - b.order);

const bySlug = new Map(recipes.map((r) => [r.slug, r]));

/* ---------- prompt 组装 ---------- */

const defaultsFor = (r) =>
  Object.fromEntries(r.controls.map((c) => [c.id, c.options[0].value]));

function assemble(r, values) {
  return r.promptLines
    .map((line) => line.replace(/\{\{(\w+)\}\}/g, (m, key) => (values[key] == null ? m : values[key])))
    .join('\n');
}

/* ---------- 片段 ---------- */

function controlsHtml(r) {
  return r.controls
    .map(
      (c) => `            <div class="rc-control">
                <label for="rc-${c.id}">${esc(c.label)}</label>
                <select id="rc-${c.id}" data-rc="${esc(c.id)}">
${c.options
  .map((o) => `                    <option value="${esc(o.value)}">${esc(o.label)}</option>`)
  .join('\n')}
                </select>
            </div>`
    )
    .join('\n');
}

function orderHtml(r) {
  return r.sections
    .map(
      (s, i) => `                <li>
                    <span class="rc-step">${String(i + 1).padStart(2, '0')}</span>
                    <div>
                        <h3>${esc(s.name)}</h3>
                        <p>${esc(s.why)}</p>
                    </div>
                </li>`
    )
    .join('\n');
}

function changeHtml(r) {
  return r.change
    .map(
      (c) => `                <tr>
                    <th scope="row"><code>{{${esc(c.token)}}}</code></th>
                    <td>${esc(c.note)}</td>
                </tr>`
    )
    .join('\n');
}

function buildersHtml(r) {
  return r.builders
    .map(
      (b) => `                <tr>
                    <th scope="row">${esc(b.name)}</th>
                    <td>${esc(b.note)}</td>
                </tr>`
    )
    .join('\n');
}

function failuresHtml(r) {
  return r.failures
    .map(
      (f, i) => `                <article class="rc-failure">
                    <h3><span>${String(i + 1).padStart(2, '0')}</span>${esc(f.title)}</h3>
                    <p>${esc(f.body)}</p>
                </article>`
    )
    .join('\n');
}

function relatedHtml(r) {
  const chips = [];
  for (const id of r.styles || []) {
    if (fs.existsSync(path.join(ROOT, 'styles', `${id}.html`))) {
      chips.push(`<a class="rc-chip" href="../styles/${esc(id)}.html">${esc(id.replace(/-/g, ' '))}</a>`);
    }
  }
  const styleChips = chips.length
    ? `                <div class="rc-rel-group">
                    <h3>Styles that carry this page</h3>
                    <div class="rc-chips">${chips.join('')}</div>
                </div>`
    : '';
  const motionChips = (r.motions || [])
    .filter((id) => fs.existsSync(path.join(ROOT, 'motions', `${id}.html`)))
    .map((id) => `<a class="rc-chip" href="../motions/${esc(id)}.html">${esc(id.replace(/-/g, ' '))}</a>`);
  const motionGroup = motionChips.length
    ? `                <div class="rc-rel-group">
                    <h3>Motion to pair with it</h3>
                    <div class="rc-chips">${motionChips.join('')}</div>
                </div>`
    : '';
  return [styleChips, motionGroup].filter(Boolean).join('\n');
}

function seoBlock(r, desc) {
  const url = `${SITE}/recipes/${r.slug}.html`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `${r.name} — prompt recipe`,
    description: desc,
    inLanguage: 'en',
    url,
    isPartOf: { '@type': 'WebSite', name: 'AI Website Style Gallery', url: `${SITE}/` },
    step: r.sections.map((s) => ({ '@type': 'HowToStep', name: s.name, text: s.why })),
  };
  return `    <!-- build:seo -->
    <meta name="description" content="${esc(desc)}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="AI Website Style Gallery">
    <meta property="og:title" content="${esc(r.name)} — Prompt Recipe">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:url" content="${url}">
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
    <!-- /build:seo -->`;
}

/* ---------- 详情页 ---------- */

function page(r, prev, next) {
  const defaults = defaultsFor(r);
  const baked = assemble(r, defaults);
  const desc = `${r.summary} A structured prompt with ${r.controls.length} variables and the failure modes to watch for.`.slice(0, 158);

  const navParts = [];
  if (prev) navParts.push(`<a href="${esc(prev.slug)}.html">← ${esc(prev.name)}</a>`);
  if (next) navParts.push(`<a href="${esc(next.slug)}.html">${esc(next.name)} →</a>`);
  const chain = navParts.length ? navParts.join('') : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(r.name)} — Prompt Recipe for AI Website Builders</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Mono&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="recipe.css">
${seoBlock(r, desc)}
</head>
<body>
<header>
        <div class="container">
            <p class="rc-band-title">Prompt Recipes</p>
            <p>Whole pages, described precisely enough that the first build is the one you keep.</p>
        </div>
    </header>

    <main class="rc-wrap">
        <p class="rc-crumb"><a href="index.html">← All prompt recipes</a></p>

        <h1 class="rc-title">${esc(r.name)}</h1>
        <p class="rc-lede">${esc(r.lede)}</p>

        <div class="rc-meta">
            <span>${esc(CATEGORIES[r.category] || r.category)}</span>
            <span>${r.sections.length} sections</span>
            <span>${r.controls.length} variables</span>
            <span>${r.readingTime} min read</span>
        </div>

        <section class="rc-section">
            <h2>What this page has to do</h2>
${r.brief.map((p) => `            <p>${esc(p)}</p>`).join('\n')}
        </section>

        <section class="rc-section">
            <h2>Section order</h2>
            <p class="rc-note">The order is the argument. Reordering these is not a layout decision, it is a change to the reasoning.</p>
            <ol class="rc-order">
${orderHtml(r)}
            </ol>
        </section>

        <section class="rc-section" id="prompt">
            <h2>Build the prompt</h2>
            <p class="rc-note">${r.controls.length} variables. Change one and the text below rewrites itself — nothing else on this page moves.</p>
            <div class="rc-controls">
${controlsHtml(r)}
            </div>

            <div class="rc-prompt">
                <div class="rc-bar">
                    <span class="rc-bar-label">Assembled prompt</span>
                    <span class="rc-count" id="rcCount"></span>
                    <button class="rc-btn" id="rcReset" type="button">Reset</button>
                    <button class="rc-btn rc-btn-primary" id="rcCopy" type="button">Copy</button>
                </div>
                <pre id="rcPrompt">${escText(baked)}</pre>
            </div>
        </section>

        <section class="rc-section">
            <h2>What to change, and what to leave alone</h2>
            <table class="rc-table">
                <thead>
                    <tr><th scope="col">Variable</th><th scope="col">How to edit it</th></tr>
                </thead>
                <tbody>
${changeHtml(r)}
                </tbody>
            </table>
        </section>

        <section class="rc-section">
            <h2>Feeding it to each builder</h2>
            <table class="rc-table">
                <thead>
                    <tr><th scope="col">Builder</th><th scope="col">What to do differently</th></tr>
                </thead>
                <tbody>
${buildersHtml(r)}
                </tbody>
            </table>
        </section>

        <section class="rc-section">
            <h2>Where it usually breaks</h2>
            <div class="rc-failures">
${failuresHtml(r)}
            </div>
        </section>

        <section class="rc-section">
            <h2>Pair it with</h2>
${relatedHtml(r)}
        </section>

        <nav class="rc-chain">
            <a href="index.html">All recipes</a>
            ${chain}
        </nav>
    </main>

    <footer>
        <div class="container">
            <p>&copy; <span id="year"></span> AI Website Style Gallery. Demo content on this site is fictional.</p>
        </div>
    </footer>

    <script type="application/json" id="rcSource">${JSON.stringify({
      lines: r.promptLines,
      defaults,
    }).replace(/</g, '\\u003c')}</script>
    <script src="../script.js" defer></script>
    <script>
(function () {
    var src = JSON.parse(document.getElementById('rcSource').textContent);
    var pre = document.getElementById('rcPrompt');
    var count = document.getElementById('rcCount');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-rc]'));

    function current() {
        var v = {};
        selects.forEach(function (s) { v[s.getAttribute('data-rc')] = s.value; });
        return v;
    }

    function render(track) {
        var v = track || src.defaults;
        var text = src.lines.map(function (line) {
            return line.replace(/\\{\\{(\\w+)\\}\\}/g, function (m, key) {
                return v[key] == null ? m : v[key];
            });
        }).join('\\n');
        pre.textContent = text;
        count.textContent = text.split(/\\s+/).filter(Boolean).length + ' words';
    }

    selects.forEach(function (s) {
        s.addEventListener('change', function () { render(current()); });
    });

    document.getElementById('rcReset').addEventListener('click', function () {
        selects.forEach(function (s) { s.value = src.defaults[s.getAttribute('data-rc')]; });
        render(src.defaults);
    });

    document.getElementById('rcCopy').addEventListener('click', function () {
        var btn = this;
        var done = function (ok) {
            btn.textContent = ok ? 'Copied' : 'Select manually';
            btn.classList.toggle('is-done', ok);
            setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('is-done'); }, 1600);
            if (!ok) {
                var range = document.createRange();
                range.selectNodeContents(pre);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(pre.textContent).then(function () { done(true); }, function () { done(false); });
        } else { done(false); }
    });

    render(src.defaults);
})();
    </script>
</body>
</html>
`;
}

/* ---------- 索引页 ---------- */

function indexCard(r, i) {
  return `            <a class="rc-card" href="${esc(r.slug)}.html" data-cat="${esc(r.category)}">
                <span class="rc-card-idx">${String(i + 1).padStart(2, '0')}</span>
                <h3>${esc(r.name)}</h3>
                <p>${esc(r.summary)}</p>
                <div class="rc-card-meta">
                    <span>${r.sections.length} sections</span>
                    <span>${r.controls.length} variables</span>
                </div>
            </a>`;
}

function indexPage() {
  const ORDER = Object.keys(CATEGORIES);
  const cats = [...new Set(recipes.map((r) => r.category))].sort(
    (a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)
  );
  const filters = [
    `<button class="rc-filter is-active" data-filter="all" type="button">All</button>`,
    ...cats.map(
      (c) => `<button class="rc-filter" data-filter="${esc(c)}" type="button">${esc(CATEGORIES[c] || c)}</button>`
    ),
  ].join('\n                ');

  const desc = `${recipes.length} structured prompt recipes for building whole websites with AI — section order, swap-in variables, per-builder notes and the failure modes each page type hits.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prompt Recipes — Structured Prompts for Building Whole Pages | AI Website Style Gallery</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Mono&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="recipe.css">
    <!-- build:seo -->
    <meta name="description" content="${esc(desc)}">
    <link rel="canonical" href="${SITE}/recipes/index.html">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="AI Website Style Gallery">
    <meta property="og:title" content="Prompt Recipes — Structured Prompts for Building Whole Pages">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:url" content="${SITE}/recipes/index.html">
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Prompt Recipes',
      description: desc,
      url: `${SITE}/recipes/index.html`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: recipes.length,
        itemListElement: recipes.map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: r.name,
          url: `${SITE}/recipes/${r.slug}.html`,
        })),
      },
    }).replace(/</g, '\\u003c')}</script>
    <!-- /build:seo -->
</head>
<body>
<header>
        <div class="container">
            <h1>Prompt Recipes</h1>
            <p>Whole pages, described precisely enough that the first build is the one you keep.</p>
        </div>
    </header>

    <main class="rc-wrap">
        <h2 class="rc-h2">A page is an argument, not a layout</h2>
        <p class="rc-lede">A style gallery tells an AI what a page should look like. It does not tell it what the page has to accomplish, which section answers which objection, or how many items each section may contain. Those three things are what separate a page that reads as designed from one that reads as generated.</p>
        <p class="rc-lede">Each recipe below fixes the order, exposes the few variables worth changing, and lists the specific ways that page type fails. Copy the assembled prompt, or edit the variables first and copy the version you get.</p>

        <div class="rc-filters" role="group" aria-label="Filter by page type">
            ${filters}
        </div>

        <div class="rc-grid" id="rcGrid">
${recipes.map(indexCard).join('\n')}
        </div>

        <p class="rc-empty" id="rcEmpty" hidden>Nothing in this category yet.</p>

        <section class="rc-section rc-section--tight">
            <h2>Why a recipe and not a prompt pack</h2>
            <p>A prompt pack gives you a hundred sentences and no way to tell which one works. A recipe gives you one page type, the reasoning behind its section order, and the variables that genuinely change the outcome. When a build goes wrong you can point at the section that failed instead of rewriting the whole prompt.</p>
            <p>Every recipe here follows the same four-part shape: goal, structure with counts, style block, constraints. The style block is the part most prompts omit, which is why generated pages so often look like a template with a different accent colour.</p>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; <span id="year"></span> AI Website Style Gallery. Demo content on this site is fictional.</p>
        </div>
    </footer>

    <script src="../script.js" defer></script>
    <script>
(function () {
    var filters = Array.prototype.slice.call(document.querySelectorAll('.rc-filter'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.rc-card'));
    var empty = document.getElementById('rcEmpty');

    filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var f = btn.getAttribute('data-filter');
            filters.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
            var shown = 0;
            cards.forEach(function (c) {
                var ok = f === 'all' || c.getAttribute('data-cat') === f;
                c.hidden = !ok;
                if (ok) shown++;
            });
            empty.hidden = shown !== 0;
        });
    });
})();
    </script>
</body>
</html>
`;
}

/* ---------- 输出 ---------- */

let n = 0;
recipes.forEach((r, i) => {
  const html = page(r, recipes[i - 1], recipes[i + 1]);
  write(`recipes/${r.slug}.html`, html);
  n++;
});
write('recipes/index.html', indexPage());

console.log(`✓ 配方页：${n} 个详情页 + 1 个索引`);
console.log(`   分类：${[...new Set(recipes.map((r) => CATEGORIES[r.category] || r.category))].join(' / ')}`);
