const pageTranslations = {
    en: {
        pageTitle: "Style Detail - Grunge",
        headerTitle: "Grunge",
        headerSubtitle: "Explore the characteristics and applications of the <span class=\"highlight\">Grunge</span> web design style",
        backLink: "Back to Style List",
        aboutTitle: "About This Style",
        aboutP1: "Grunge design originated in the music and subculture scenes of the 90s. Its visual characteristics are often deliberately rough, messy, imperfect, and even somewhat 'dirty' or 'destructive'. It opposes clean, refined design, pursuing a raw, authentic, unembellished aesthetic.",
        featuresTitle: "Main Features:",
        feature1: "<strong>Distressed Textures:</strong> Extensive use of textures simulating paper wrinkles, stains, concrete, scratches, tape, splatters, etc.",
        feature2: "<strong>Irregular Layouts:</strong> Elements appear randomly arranged, overlapping, breaking traditional grid and alignment rules.",
        feature3: "<strong>Dark Tones & Contrast:</strong> Often uses dark grays, browns, faded colors, sometimes with strong contrast to bright colors, but generally dark overall.",
        feature4: "<strong>Handwritten or Distorted Fonts:</strong> Use of handwritten fonts, typewriter fonts, stencil fonts, or distorting, blurring, or damaging regular fonts.",
        feature5: "<strong>Collage Elements:</strong> Images, text, and graphic elements that look like they were randomly torn and pasted together.",
        feature6: "<strong>Rough Edges:</strong> Element edges may not be smooth, appearing torn, frayed, or blurred.",
        feature7: "<strong>Layering:</strong> Elements are layered on top of each other, creating depth and a sense of chaos.",
        aboutP3: "Although originating from print and music posters, the Grunge style also has applications in web design, especially for websites that need to express rebellion, non-mainstream, retro, or handmade feelings, such as band websites, art projects, independent brands, etc.",
        promptTitle: "Sample AI Prompt",
        promptP1: "(Chinese Explanation: Design a grunge-style band website. Use distressed paper or concrete textures, ripped edges, layered elements, maybe some 'dirty' brush strokes, dark colors (browns, greys, muted reds), and a typewriter or stencil font.)",
        cssTitle: "Theme CSS Code Snippet",
        cssP1: "Below is the core CSS code for applying the Grunge style as a global theme (<code>body.theme-grunge</code>):",
        cssP2: "Note: This is just the core theme CSS. In actual application, the Grunge effect can be further enhanced by adding more textures, element overlays, irregular borders, etc.",
        downloadTitle: "Resource Download (Example)",
        downloadP1: "Download a zip file containing a more complete CSS definition for this style (may include specific component styles, font file references, etc.).",
        downloadButton: "Download grunge.zip",
        footerText: "AI Website Style Showcase"
    },
    zh: {
        pageTitle: "风格详情 - 垃圾摇滚 / 颓废风格",
        headerTitle: "垃圾摇滚 / 颓废风格 (Grunge)",
        headerSubtitle: "探索 <span class=\"highlight\">Grunge</span> 设计风格的特点与应用",
        backLink: "返回风格列表",
        aboutTitle: "关于此风格",
        aboutP1: "Grunge（垃圾摇滚/颓废风格）设计起源于 90 年代的音乐和亚文化场景，其视觉特征通常是故意显得粗糙、杂乱、不完美，甚至有些“脏”或“破坏感”。它反对干净、精致的设计，追求一种原始、真实、未经修饰的美学。",
        featuresTitle: "主要特点:",
        feature1: "<strong>脏旧纹理 (Distressed Textures):</strong> 大量使用模拟纸张褶皱、污渍、混凝土、划痕、胶带、喷溅等效果的纹理。",
        feature2: "<strong>不规则布局 (Irregular Layouts):</strong> 元素排列看似随意、重叠，打破传统的网格和对齐规则。",
        feature3: "<strong>深色调与对比 (Dark Tones & Contrast):</strong> 常用深灰、棕色、褪色的彩色，有时与亮色形成强烈对比，但整体偏暗沉。",
        feature4: "<strong>手写或破坏感字体 (Handwritten or Distorted Fonts):</strong> 使用手写体、打字机字体、模板字体，或者对常规字体进行扭曲、模糊、破坏处理。",
        feature5: "<strong>拼贴感 (Collage Elements):</strong> 像是随意撕下、粘贴在一起的图像、文字和图形元素。",
        feature6: "<strong>边缘粗糙 (Rough Edges):</strong> 元素边缘可能不光滑，呈现撕裂、毛边或模糊的效果。",
        feature7: "<strong>图层感 (Layering):</strong> 元素层层叠加，创造出深度和混乱感。",
        aboutP3: "虽然起源于印刷品和音乐海报，Grunge 风格在网页设计中也有应用，尤其适合需要表达叛逆、非主流、复古或手工感的网站，如乐队网站、艺术项目、独立品牌等。",
        promptTitle: "示例 AI Prompt",
        promptP1: "（中文解释：设计一个垃圾摇滚风格的乐队网站。使用破旧纸张或混凝土纹理、撕裂边缘、分层元素，或许加上一些“脏”的笔触效果，深色调（棕色、灰色、暗红色），以及打字机或模板字体。）",
        cssTitle: "主题 CSS 代码片段",
        cssP1: "以下是将 Grunge 风格应用为全局主题的核心 CSS 代码 (<code>body.theme-grunge</code>):",
        cssP2: "注意：这只是核心主题 CSS。实际应用中可以通过添加更多纹理、元素叠加、不规则边框等方式进一步强化 Grunge 效果。",
        downloadTitle: "资源下载 (示例)",
        downloadP1: "下载包含此风格更完整 CSS 定义（可能包括特定组件样式、字体文件引用等）的压缩包。",
        downloadButton: "下载 grunge.zip",
        footerText: "AI 网站样式展示"
    }
};

// Try to merge with global translations if available
if (typeof translations === 'object' && translations !== null) {
    if (translations.en) {
        translations.en = { ...translations.en, ...pageTranslations.en };
    } else {
        translations.en = pageTranslations.en;
    }
    if (translations.zh) {
        translations.zh = { ...translations.zh, ...pageTranslations.zh };
    } else {
        translations.zh = pageTranslations.zh;
    }
} else {
    // If global translations don't exist, use pageTranslations as the base
    translations = pageTranslations;
    console.warn('Global translations object not found. Using page-specific translations for grunge.html.');
}