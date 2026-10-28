// scripts/build-compares.mjs
// 作用：把 data/compares/*.json 编译成 compares/index.html 与 compares/{slug}.html
// 用法：node scripts/build-compares.mjs
//
// 设计要点：
//   - 两个风格并排 iframe，同一份 DOM、不同样式表，所以对比是公平的
//   - 决策表逐维度给判断，edge 字段标记哪一侧更占优
//   - 页面本身是内链枢纽：连到两个风格页、两个预览页、相关配方

import fs from 'node:fs';
import { Report, assertClean, validateCompares } from './lib/validate.mjs';
import { clipMeta } from './lib/seo.mjs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://www.aiwebstyle.com';
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => fs.writeFileSync(path.join(ROOT, p), s);
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const styles = JSON.parse(read('data/styles.json'));
const styleById = new Map(styles.map((s) => [s.id, s]));
const previews = JSON.parse(read('data/previews.json'));
const previewById = new Map(previews.map((p) => [p.styleId, p]));

const dir = path.join(ROOT, 'data', 'compares');
if (!fs.existsSync(dir)) {
  console.error('✗ data/compares 不存在');
  process.exit(1);
}

const compares = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(read(`data/compares/${f}`)))
  .filter((c) => c.status !== 'draft')
  .filter((c) => exists(`previews/${c.a}.html`) && exists(`previews/${c.b}.html`))
  .sort((a, b) => a.order - b.order);

// 数据守卫：缺 cssDelta 这类字段时，这里给出具体是哪个 slug，而不是 undefined.map
{
    const rep = new Report('compares');
    validateCompares(compares, { previewIds: new Set(previews.map((p) => p.styleId)) }, rep);
    assertClean(rep);
}


const nameOf = (id) => styleById.get(id)?.name.en || previewById.get(id)?.name || id;

/* ---------- 片段 ---------- */

function pane(id, tag) {
  const name = nameOf(id);
  return `            <div class="cmp-pane">
                <div class="cmp-pane-head">
                    <span class="cmp-tag">${tag}</span>
                    <h2>${esc(name)}</h2>
                    <a href="../previews/${esc(id)}.html" target="_blank" rel="noopener">Open full ↗</a>
                </div>
                <iframe src="../previews/${esc(id)}.html" title="${esc(name)} live preview" loading="lazy"></iframe>
            </div>`;
}

function dimensionRows(c) {
  return c.dimensions
    .map((d) => {
      const mark = (side) =>
        d.edge === side ? '<span class="cmp-edge" aria-label="advantage">●</span> ' : '';
      return `                <tr>
                    <th scope="row">${esc(d.name)}</th>
                    <td>${mark('a')}${esc(d.a)}</td>
                    <td>${mark('b')}${esc(d.b)}</td>
                </tr>`;
    })
    .join('\n');
}

function cssRows(c) {
  return c.cssDelta
    .map(
      (r) => `                <tr>
                    <th scope="row">${esc(r.label)}</th>
                    <td><code>${esc(r.a)}</code></td>
                    <td><code>${esc(r.b)}</code></td>
                </tr>`
    )
    .join('\n');
}

function list(items) {
  return items.map((t) => `                    <li>${esc(t)}</li>`).join('\n');
}

function relatedLinks(c) {
  const out = [];
  for (const id of [c.a, c.b]) {
    if (exists(`styles/${id}.html`)) {
      out.push(`<a class="cmp-chip" href="../styles/${esc(id)}.html">${esc(nameOf(id))} — full breakdown</a>`);
    }
  }
  for (const r of c.recipes || []) {
    if (exists(`recipes/${r}.html`)) {
      out.push(`<a class="cmp-chip" href="../recipes/${esc(r)}.html">${esc(r.replace(/-/g, ' '))} recipe</a>`);
    }
  }
  return out.join('\n                ');
}

function seoBlock(c, desc) {
  const url = `${SITE}/compares/${c.slug}.html`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: c.title,
    description: desc,
    inLanguage: 'en',
    url,
    isPartOf: { '@type': 'WebSite', name: 'AI Website Style Gallery', url: `${SITE}/` },
    about: [
      { '@type': 'Thing', name: nameOf(c.a) },
      { '@type': 'Thing', name: nameOf(c.b) },
    ],
  };
  return `    <!-- build:seo -->
    <meta name="description" content="${esc(desc)}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="AI Website Style Gallery">
    <meta property="og:title" content="${esc(c.title)} — side-by-side comparison">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:url" content="${url}">
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
    <!-- /build:seo -->`;
}

/* ---------- 详情页 ---------- */

function page(c, prev, next) {
  const aName = nameOf(c.a);
  const bName = nameOf(c.b);
  const desc = clipMeta(`${aName} or ${bName}? ${c.verdict} Side-by-side live previews, a six-row decision table and the CSS that actually differs.`, 158);

  const chain = [
    prev ? `<a href="${esc(prev.slug)}.html">← ${esc(prev.title)}</a>` : '',
    next ? `<a href="${esc(next.slug)}.html">${esc(next.title)} →</a>` : '',
  ]
    .filter(Boolean)
    .join('\n            ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(c.title)} — Side-by-Side Comparison | AI Website Style Gallery</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Mono&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="compare.css">
${seoBlock(c, desc)}
</head>
<body>
<header>
        <div class="container">
            <p class="cmp-band-title">Style Comparisons</p>
            <p>Two styles, one identical page, and the specific decision that separates them.</p>
        </div>
    </header>

    <main class="cmp-wrap">
        <p class="cmp-crumb"><a href="index.html">← All comparisons</a></p>

        <h1 class="cmp-title">${esc(c.title)}</h1>
        <p class="cmp-lede">${esc(c.lede)}</p>

        <p class="cmp-verdict"><strong>Short answer:</strong> ${esc(c.verdict)}</p>

        <div class="cmp-toolbar">
            <label class="cmp-switch">
                <input type="checkbox" id="syncScroll" checked>
                <span>Sync scroll</span>
            </label>
            <span class="cmp-hint">Both panels load the same page — only the stylesheet differs.</span>
        </div>

        <div class="cmp-dual" id="cmpDual">
${pane(c.a, 'A')}
${pane(c.b, 'B')}
        </div>

        <section class="cmp-section">
            <h2>What actually separates them</h2>
${c.brief.map((p) => `            <p>${esc(p)}</p>`).join('\n')}
        </section>

        <section class="cmp-section">
            <h2>Decision table</h2>
            <p class="cmp-note">A filled dot marks the side that handles the dimension more convincingly. It is a judgement, not a rule — several rows are genuinely a tie.</p>
            <div class="cmp-table-wrap">
                <table class="cmp-table">
                    <thead>
                        <tr>
                            <th scope="col">Dimension</th>
                            <th scope="col">${esc(aName)}</th>
                            <th scope="col">${esc(bName)}</th>
                        </tr>
                    </thead>
                    <tbody>
${dimensionRows(c)}
                    </tbody>
                </table>
            </div>
        </section>

        <section class="cmp-section">
            <h2>The CSS that changes</h2>
            <p class="cmp-note">These are the declarations that make the difference visible. Everything else — font sizes, spacing, section order — is shared, because both pages use the same markup.</p>
            <div class="cmp-table-wrap">
                <table class="cmp-table cmp-code">
                    <thead>
                        <tr>
                            <th scope="col">Property</th>
                            <th scope="col">${esc(aName)}</th>
                            <th scope="col">${esc(bName)}</th>
                        </tr>
                    </thead>
                    <tbody>
${cssRows(c)}
                    </tbody>
                </table>
            </div>
        </section>

        <section class="cmp-section">
            <h2>When each one wins</h2>
            <div class="cmp-split">
                <div class="cmp-side">
                    <h3>${esc(aName)} wins when</h3>
                    <ul>
${list(c.whenA)}
                    </ul>
                </div>
                <div class="cmp-side">
                    <h3>${esc(bName)} wins when</h3>
                    <ul>
${list(c.whenB)}
                    </ul>
                </div>
            </div>
        </section>

        <section class="cmp-section">
            <h2>Steering a model to one or the other</h2>
            <p>${esc(c.promptDelta)}</p>
        </section>

        <section class="cmp-section">
            <h2>Go deeper</h2>
            <div class="cmp-chips">
                ${relatedLinks(c)}
            </div>
        </section>

        <nav class="cmp-chain">
            <a href="index.html">All comparisons</a>
            ${chain}
        </nav>
    </main>

    <footer>
        <div class="container">
            <p>&copy; <span id="year"></span> AI Website Style Gallery. Demo content is a fictional studio.</p>
        </div>
    </footer>

    <script src="../script.js" defer></script>
    <script>
(function () {
    var dual = document.getElementById('cmpDual');
    var toggle = document.getElementById('syncScroll');
    var frames = Array.prototype.slice.call(dual.querySelectorAll('iframe'));
    var locked = false;

    function bind(frame) {
        var win;
        try { win = frame.contentWindow; } catch (e) { return; }
        if (!win) return;
        win.addEventListener('scroll', function () {
            if (!toggle.checked || locked) return;
            locked = true;
            var y = win.scrollY;
            frames.forEach(function (other) {
                if (other === frame) return;
                try { other.contentWindow.scrollTo(0, y); } catch (e) { /* cross-origin */ }
            });
            requestAnimationFrame(function () { locked = false; });
        }, { passive: true });
    }

    frames.forEach(function (frame) {
        if (frame.contentDocument && frame.contentDocument.readyState === 'complete') bind(frame);
        frame.addEventListener('load', function () { bind(frame); });
    });
})();
    </script>
</body>
</html>
`;
}

/* ---------- 索引页 ---------- */

function card(c, i) {
  return `            <a class="cmp-card" href="${esc(c.slug)}.html">
                <span class="cmp-idx">${String(i + 1).padStart(2, '0')}</span>
                <h3>${esc(c.title)}</h3>
                <p>${esc(c.verdict)}</p>
                <span class="cmp-go">${esc(nameOf(c.a))} · ${esc(nameOf(c.b))} →</span>
            </a>`;
}

function indexPage() {
  const desc = clipMeta(`${compares.length} head-to-head style comparisons with side-by-side live previews, a decision table and the CSS that actually differs. Built for the choice you are about to make, not for a mood board.`, 158);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Style Comparisons — Two Styles, One Page, Side by Side | AI Website Style Gallery</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Mono&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="compare.css">
    <!-- build:seo -->
    <meta name="description" content="${esc(desc)}">
    <link rel="canonical" href="${SITE}/compares/index.html">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="AI Website Style Gallery">
    <meta property="og:title" content="Style Comparisons — side by side">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:url" content="${SITE}/compares/index.html">
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Style Comparisons',
      description: desc,
      url: `${SITE}/compares/index.html`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: compares.length,
        itemListElement: compares.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.title,
          url: `${SITE}/compares/${c.slug}.html`,
        })),
      },
    }).replace(/</g, '\\u003c')}</script>
    <!-- /build:seo -->
</head>
<body>
<header>
        <div class="container">
            <h1>Style Comparisons</h1>
            <p>Two styles, one identical page, and the decision that separates them.</p>
        </div>
    </header>

    <main class="cmp-wrap">
        <h2 class="cmp-h2">The question is never which style is better</h2>
        <p class="cmp-lede">It is which style is better for this page, with this content, for this reader. A comparison that ends in a ranking has not helped anyone choose — so each page below puts two styles on identical markup and names the specific dimension where they diverge.</p>
        <p class="cmp-lede">The panels are live. Scroll one and the other follows, so the same headline, the same three services and the same footer move past each other at once. That is the only honest way to compare two design systems: hold the content still.</p>

        <div class="cmp-grid">
${compares.map(card).join('\n')}
        </div>

        <section class="cmp-section">
            <h2>How these pages are built</h2>
            <p>Both previews on every comparison page are the same HTML file rendered twice with different stylesheets. Nothing is redrawn for the comparison, and no screenshot is involved — so what you see is what the style actually does to a real page, including the parts that only appear on a narrow screen.</p>
            <p>The decision table is a judgement, and several rows are deliberately marked as ties. Where one side genuinely handles something better, a dot marks it; where the answer depends on your content, it does not.</p>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; <span id="year"></span> AI Website Style Gallery. Demo content is a fictional studio.</p>
        </div>
    </footer>

    <script src="../script.js" defer></script>
</body>
</html>
`;
}

/* ---------- 输出 ---------- */

let n = 0;
compares.forEach((c, i) => {
  write(`compares/${c.slug}.html`, page(c, compares[i - 1], compares[i + 1]));
  n++;
});
write('compares/index.html', indexPage());

console.log(`✓ 对比页：${n} 个详情页 + 1 个索引`);
