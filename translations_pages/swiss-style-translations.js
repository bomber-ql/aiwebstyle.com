const pageTranslations = {
    en: {
        pageTitleSwissStyle: "Style Detail - Swiss Style",
        headerTitleSwissStyle: "Swiss Style / International Typographic Style",
        headerSubtitleSwissStyle: "Explore the features and applications of the Swiss Style design",
        backToList: "Back to Style List",
        aboutThisStyle: "About This Style",
        swissStyleDesc1: "Swiss Style, also known as International Typographic Style, is a graphic design and typographic method that emphasizes clarity, objectivity, readability, and order. It originated in Switzerland in the 1940s-50s.",
        mainFeatures: "Main Features:",
        featureGridSystem: "<strong>Grid System:</strong> Strict use of grids to organize page elements, creating a sense of structure and consistency.",
        featureSansSerif: "<strong>Sans-serif Typefaces:</strong> Preference for clear, concise sans-serif fonts such as Helvetica, Univers, Akzidenz-Grotesk.",
        featureAsymmetricalLayout: "<strong>Asymmetrical Layout:</strong> Layouts are often asymmetrical but still maintain balance and dynamism.",
        featureFlushLeftRaggedRight: "<strong>Flush Left, Ragged Right:</strong> Text blocks are usually flush left, with the right edge forming a natural irregular line.",
        featureObjectivityClarity: "<strong>Objectivity & Clarity:</strong> Pursues clear communication of information, avoiding excessive decoration and subjective emotional expression.",
        featurePhotographyOverIllustration: "<strong>Photography over Illustration:</strong> Tends to use high-quality, objective black and white or color photography.",
        featureLimitedColors: "<strong>Limited Colors:</strong> Often uses limited, sometimes striking colors (like red) for emphasis, paired with black, white, and gray.",
        featureTypographicHierarchy: "<strong>Typographic Hierarchy:</strong> Establishes a clear information hierarchy through font size, weight, spacing, etc.",
        swissStyleUsage: "This style has had a profound impact on modernist graphic design and web design and is still widely used in many fields today, especially in situations requiring clear information delivery and a professional image.",
        exampleAiPrompt: "Example AI Prompt",
        swissStylePromptExplanation: "(English explanation: Create a website layout in the Swiss Style for a design conference. Use a strict grid, Helvetica or Univers font, strong typographic hierarchy (different weights/sizes), maybe one bold accent color (like red), and black/white photography.)",
        themeCssSnippet: "Theme CSS Code Snippet",
        cssSnippetIntroSwissStyle: "The following is the core CSS code for applying the Swiss Style as a global theme (<code>body.theme-swiss-style</code>):",
        swissStyleCssNote: "Note: This is only the core theme CSS. In actual application, you may also need to combine it with a grid system in the specific page structure to achieve a complete Swiss Style layout.",
        resourceDownload: "Resource Download (Example)",
        downloadDescriptionSwissStyle: "Download a compressed package containing a more complete CSS definition for this style (may include specific component styles, font file references, etc.).",
        downloadButtonSwissStyle: "Download swiss-style.zip",
        footerText: "AI Website Style Showcase"
    },
    zh: {
        pageTitleSwissStyle: "风格详情 - 瑞士风格",
        headerTitleSwissStyle: "瑞士风格 / 国际主义排版 (Swiss Style)",
        headerSubtitleSwissStyle: "探索 <span class=\"highlight\">瑞士风格</span> 设计的特点与应用",
        backToList: "返回风格列表",
        aboutThisStyle: "关于此风格",
        swissStyleDesc1: "瑞士风格（Swiss Style），也称为国际主义排版风格（International Typographic Style），是一种强调清晰、客观、易读性和秩序感的图形设计和排版方法。它起源于 20 世纪 40-50 年代的瑞士。",
        mainFeatures: "主要特点:",
        featureGridSystem: "<strong>网格系统 (Grid System):</strong> 严格使用网格来组织页面元素，创造结构感和一致性。",
        featureSansSerif: "<strong>无衬线字体 (Sans-serif Typefaces):</strong> 偏爱清晰、简洁的无衬线字体，如 Helvetica, Univers, Akzidenz-Grotesk。",
        featureAsymmetricalLayout: "<strong>非对称布局 (Asymmetrical Layout):</strong> 布局通常是不对称的，但仍然保持平衡和动态感。",
        featureFlushLeftRaggedRight: "<strong>左对齐，右不齐 (Flush Left, Ragged Right):</strong> 文本块通常采用左对齐、右边自然形成不规则边缘的方式。",
        featureObjectivityClarity: "<strong>客观性与清晰度:</strong> 追求信息的清晰传达，避免过多的装饰和主观情感表达。",
        featurePhotographyOverIllustration: "<strong>摄影优于插画:</strong> 倾向于使用高质量、客观的黑白或彩色摄影。",
        featureLimitedColors: "<strong>有限的色彩:</strong> 通常使用有限的、有时是醒目的颜色（如红色）作为强调，并与黑白灰搭配。",
        featureTypographicHierarchy: "<strong>排版层级:</strong> 通过字体大小、粗细、间距等建立清晰的信息层级。",
        swissStyleUsage: "这种风格对现代主义平面设计和网页设计产生了深远影响，至今仍在许多领域被广泛应用，尤其是在需要清晰传达信息和建立专业形象的场合。",
        exampleAiPrompt: "示例 AI Prompt",
        swissStylePromptExplanation: "（中文解释：为设计会议创建一个瑞士风格的网站布局。使用严格的网格，Helvetica 或 Univers 字体，强烈的排版层级（不同粗细/大小），或许使用一种醒目的强调色（如红色），以及黑白摄影。）",
        themeCssSnippet: "主题 CSS 代码片段",
        cssSnippetIntroSwissStyle: "以下是将瑞士风格应用为全局主题的核心 CSS 代码 (<code>body.theme-swiss-style</code>):",
        swissStyleCssNote: "注意：这只是核心主题 CSS。实际应用中可能还需要在特定页面结构中结合网格系统来实现完整的瑞士风格布局。",
        resourceDownload: "资源下载 (示例)",
        downloadDescriptionSwissStyle: "下载包含此风格更完整 CSS 定义（可能包括特定组件样式、字体文件引用等）的压缩包。",
        downloadButtonSwissStyle: "下载 swiss-style.zip",
        footerText: "AI 网站样式展示"
    }
};

// Merge with global translations
if (typeof translations === 'object' && translations !== null) {
    if (translations.en) {
        Object.assign(translations.en, pageTranslations.en);
    } else {
        translations.en = JSON.parse(JSON.stringify(pageTranslations.en));
    }
    if (translations.zh) {
        Object.assign(translations.zh, pageTranslations.zh);
    } else {
        translations.zh = JSON.parse(JSON.stringify(pageTranslations.zh));
    }
    console.log('Page-specific translations for swiss-style merged into global translations.');
} else {
    console.warn('Global translations object not found. Initializing with swiss-style page translations.');
    translations = JSON.parse(JSON.stringify(pageTranslations)); // Deep copy
}