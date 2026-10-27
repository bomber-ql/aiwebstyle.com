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

const FONTS = {
    glassmorphism:
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
};

function page(p) {
    const name = p.name;
    const id = p.styleId;
    const font = FONTS[id]
        ? `    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="${FONTS[id]}" rel="stylesheet">\n`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Northline Studio — a demo site in the ${name} style</title>
${font}    <link rel="stylesheet" href="${id}.css">
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
