// scripts/build-previews.mjs
// 生成风格预览页：同一份内容 + 每风格一个 CSS 文件
// 用法：node scripts/build-previews.mjs
//
// 设计意图：所有预览页共用完全相同的 DOM，只有样式表不同。
// 这样对比才公平，也直接证明「风格 = CSS 而不是内容」。

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => fs.writeFileSync(path.join(ROOT, p), s);
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const previews = JSON.parse(read('data/previews.json'));

const GF = 'https://fonts.googleapis.com/css2?family=';
const FONTS = {
    glassmorphism: GF + 'Inter:wght@400;500;600;700&display=swap',
    claymorphism: GF + 'Nunito:wght@400;700;800&display=swap',
    illustration: GF + 'Nunito:wght@400;700;800&display=swap',
    'retro-pixel': GF + 'Press+Start+2P&display=swap',
    'natural-organic': GF + 'Lato:wght@400;700&family=Playfair+Display:wght@400;700&display=swap',
    'art-deco': GF + 'Playfair+Display:wght@400;700&display=swap',
    grunge: GF + 'Special+Elite&display=swap',
    'abstract-geometric': GF + 'Montserrat:wght@700;800&display=swap',
    '3d-interactive': GF + 'Poppins:wght@400;600&family=Roboto+Mono&display=swap',
    'modern-tech': GF + 'Roboto+Mono&display=swap',
};

// 从样式表里推导「技术规格」：真实数据、每页不同，也告诉读者这个风格靠什么实现。
// 「Built with」按「在 28 个风格里出现得越少越靠前」排序，所以列出的是该风格最有辨识度的技术。
const TECHNIQUES = [
    ['backdrop-filter', 'backdrop blur'],
    ['clip-path', 'clip-path'],
    ['mix-blend-mode', 'blend mode'],
    ['border-image', 'border image'],
    ['mask-composite', 'composited mask'],
    ['writing-mode', 'vertical type'],
    ['perspective', '3d perspective'],
    ['repeating-linear-gradient', 'repeating gradient'],
    ['conic-gradient', 'conic gradient'],
    ['radial-gradient', 'radial gradient'],
    ['linear-gradient', 'linear gradient'],
    ['background-clip: text', 'gradient text'],
    ['text-shadow', 'text shadow'],
    ['box-shadow', 'shadow stack'],
    ['@keyframes', 'keyframes'],
    ['grid-template-areas', 'named grid'],
    ['grid-template-columns', 'column grid'],
    ['border-radius', 'rounded corners'],
    ['letter-spacing', 'tracking'],
    ['font-variant-numeric', 'tabular figures'],
    ['inset ', 'inset shadow'],
    ['border-style: dashed', 'stitched edge'],
    ['drop-shadow', 'drop shadow'],
];

const techniqueDf = new Map(
    TECHNIQUES.map(([needle]) => {
        const n = previews.filter((p) => {
            const f = `previews/${p.styleId}.css`;
            return exists(f) && read(f).includes(needle);
        }).length;
        return [needle, n];
    })
);

function specsFor(id, font, techOverride) {
    const css = read(`previews/${id}.css`);
    const lines = css.split('\n').filter((l) => l.trim()).length;
    const rules = (css.match(/\{/g) || []).length;
    const present = TECHNIQUES.filter(([needle]) => css.includes(needle)).sort(
        (a, b) => techniqueDf.get(a[0]) - techniqueDf.get(b[0])
    );
    const rare = present.filter(([n]) => techniqueDf.get(n) <= Math.ceil(previews.length / 2));
    const auto = (rare.length ? rare : present).slice(0, 3).map(([, label]) => label);
    return {
        size: `${lines} lines · ${rules} rules`,
        type: font ? 'one webfont' : 'system fonts only',
        // 手写标签优先：自动识别只作为兜底
        tech: techOverride || (auto.length ? auto.join(' · ') : 'flat colour and spacing'),
    };
}

function page(p) {
    const name = p.name;
    const id = p.styleId;
    // standalone 的三套自带 reset，不引基线，避免规则互撞
    const base = p.standalone ? '' : `    <link rel="stylesheet" href="_base.css">\n`;
    const specs = specsFor(id, FONTS[id], p.tech);
    const font = FONTS[id]
        ? `    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="${FONTS[id]}" rel="stylesheet">\n`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Northline Studio — a demo site in the ${name} style</title>
${font}${base}    <link rel="stylesheet" href="${id}.css">
    <link rel="stylesheet" href="_about.css">
</head>
<body>
    <a class="back-chip" href="../styles/${id}.html">← ${name} style page</a>

    <header class="site-head">
        <div class="wrap">
            <a class="brand" href="#">Northline Studio</a>
            <nav>
                <a href="#work">Work</a>
                <a href="#studio">Studio</a>
                <a href="#contact">Contact</a>
            </nav>
        </div>
    </header>

    <main>
        <section class="hero">
            <div class="wrap">
                <p class="eyebrow">Brand &amp; product design — Oslo / Berlin</p>
                <h1>We design the parts people actually touch.</h1>
                <p class="lede">A two-person studio working with founders on identity, product interfaces, and the systems that keep them consistent as the team grows.</p>
                <div class="hero-actions">
                    <a class="btn" href="#contact">Start a project</a>
                    <a class="btn ghost" href="#work">See selected work</a>
                </div>
            </div>
        </section>

        <section class="services" id="work">
            <div class="wrap">
                <article>
                    <span class="num">01</span>
                    <h2>Identity</h2>
                    <p>Naming, wordmarks, and the rules that keep a brand recognisable at 16 pixels and on a billboard.</p>
                </article>
                <article>
                    <span class="num">02</span>
                    <h2>Product interface</h2>
                    <p>Onboarding, dashboards, and the flows that decide whether someone stays past the first session.</p>
                </article>
                <article>
                    <span class="num">03</span>
                    <h2>Design systems</h2>
                    <p>Tokens, components, and documentation your engineers will actually keep using after we leave.</p>
                </article>
            </div>
        </section>

        <section class="quote" id="studio">
            <div class="wrap">
                <blockquote>They rebuilt our onboarding in six weeks. Activation went up 34% and support tickets halved.</blockquote>
                <cite>Mira Halvorsen — CEO, Tally</cite>
            </div>
        </section>

        <section class="cta" id="contact">
            <div class="wrap">
                <div class="cta-copy">
                    <h2>Two slots open for Q1.</h2>
                    <p>Tell us what you are building and where it is stuck.</p>
                </div>
                <a class="btn" href="mailto:hello@northline.studio">hello@northline.studio</a>
            </div>
        </section>
    </main>

    <footer>
        <div class="wrap">
            <p>Northline Studio — Oslo / Berlin</p>
            <p>© 2026</p>
        </div>
    </footer>

    <section id="pv-about">
        <div class="wrap">
            <p class="pv-label">About this preview</p>
            <h2>What the ${name} style is doing</h2>
            <p>${p.analysis || ''}</p>
            <ul>
${(p.notice || []).map((n) => `                <li>${n}</li>`).join('\n')}
            </ul>
            <dl class="pv-specs">
                <div><dt>Stylesheet</dt><dd>${specs.size}</dd></div>
                <div><dt>Typeface</dt><dd>${specs.type}</dd></div>
                <div><dt>Built with</dt><dd>${specs.tech}</dd></div>
            </dl>
            <p class="pv-breaks"><strong>Where it breaks:</strong> ${p.breaks || ''}</p>
            <p class="pv-links">
                <a href="../styles/${id}.html">Full breakdown, CSS and prompt</a>
                <a href="index.html">All ${previews.length} previews</a>
            </p>
        </div>
    </section>
</body>
</html>
`;
}

let n = 0;
for (const p of previews) {
    const cssPath = `previews/${p.styleId}.css`;
    if (!exists(cssPath)) {
        console.warn(`跳过（缺少样式表）: ${cssPath}`);
        continue;
    }
    write(`previews/${p.styleId}.html`, page(p));
    n++;
}

console.log(`✓ 生成预览页：${n} 个（共 ${previews.length} 条登记）`);

function indexCard(p, i) {
    return `            <a class="pv-card" href="${p.styleId}.html">
                <span class="pv-idx">${String(i + 1).padStart(2, '0')}</span>
                <h3>${p.name}</h3>
                <p>${p.blurb}</p>
                <span class="pv-go">Open preview →</span>
            </a>`;
}

function indexPage(list) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Style Previews — ${list.length} design styles on one identical page</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Mono&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="index.css">
    <!-- build:seo --><!-- /build:seo -->
</head>
<body>
    <header>
        <div class="container">
            <h1>All Style Previews</h1>
            <p>${list.length} styles, one identical page — only the stylesheet changes.</p>
        </div>
    </header>

    <main class="pv-wrap">
        <h2 class="pv-h2">Same markup, ${list.length} stylesheets</h2>
        <p class="pv-lede">Every preview below uses the same DOM: the same headline, the same three services, the same quote, the same footer. Nothing is duplicated per style except the CSS file. That is the argument this section is making — a style is a set of decisions about type, spacing, colour and depth, not a different website.</p>
        <p class="pv-note">Open two previews in separate tabs and compare the same sentence. The words never move; the voice changes completely.</p>

        <div class="pv-grid">
${list.map(indexCard).join('\n')}
        </div>

        <section class="pv-outro">
            <h2>Why the content never changes</h2>
            <p>Most style galleries show a mood board, a colour palette, or a screenshot of someone else's site. None of those answer the question a builder actually has: what does this style look like when it has to hold a headline, a paragraph, three columns and a call to action all at once?</p>
            <p>Holding the content constant removes the variable. When two previews differ, the difference is entirely attributable to the stylesheet — not to different copy lengths, different image choices, or a different amount of whitespace baked into the mockup.</p>
            <p>Each demo also carries a short technical note underneath: what the style is actually doing in CSS, three details worth noticing, and the situation where it stops working. The full breakdown, the prompt that generates it, and a downloadable stylesheet live on the matching style page.</p>
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

const list = previews.filter((p) => exists(`previews/${p.styleId}.html`));
write('previews/index.html', indexPage(list));
console.log(`✓ 生成风格总览页：${list.length} 条`);
