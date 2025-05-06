const pageTranslations = {
    en: {
        pageTitle: "Style Detail - Brutalism",
        headerTitle: "Brutalism",
        headerSubtitle: "Explore the characteristics and applications of the <span class=\"highlight\">Brutalism</span> web design style",
        backLink: "Back to Style List",
        aboutTitle: "About This Style",
        aboutP1: "Brutalism in web design originates from the architectural movement of the same name, emphasizing raw, exposed, unadorned materials and structures. It is often seen as a rebellion against current refined, sleek, user-friendly design trends.",
        aboutP2: "This style usually gives a direct, honest, and even somewhat 'coarse' feeling. It does not pursue beauty in the traditional sense but focuses on the direct presentation of function and the clear visibility of structure.",
        featuresTitle: "Main Features:",
        feature1: "<strong>Raw Feel:</strong> The interface looks like a basic, unadorned HTML structure.",
        feature2: "<strong>System Fonts:</strong> Extensive use of computer default fonts, such as Arial, Times New Roman, or monospace fonts.",
        feature3: "<strong>High Contrast:</strong> Often uses pure black, pure white, or very vivid primary colors (like bright yellow, bright blue) for strong contrast.",
        feature4: "<strong>Lack of Ornamentation:</strong> Little to no gradients, soft shadows, textures, or complex animations.",
        feature5: "<strong>Hard Edges:</strong> Elements usually have clear, hard borders with almost no rounded corners.",
        feature6: "<strong>Blocky Layout:</strong> The layout structure is distinct, sometimes intentionally appearing somewhat clumsy or unbalanced.",
        feature7: "<strong>Visible Structure:</strong> Structural elements like borders and dividers are emphasized rather than hidden.",
        feature8: "<strong>Harsh Shadows:</strong> If shadows are used, they are typically simple, hard block shadows rather than soft, blurred effects.",
        aboutP3: "Brutalism style is often used for personal portfolios, art projects, independent magazines, or websites that need to express strong personality and anti-mainstream attitudes.",
        promptTitle: "Sample AI Prompt",
        promptP1: "(Chinese Explanation: Create a brutalist website for an art zine. Use default system fonts (Arial, Times), stark high-contrast colors (black/white or black/yellow), hard borders, no rounded corners, and maybe harsh block shadows.)",
        cssTitle: "Theme CSS Code Snippet",
        cssP1: "Below is the core CSS code for applying the brutalism style as a global theme (<code>body.theme-brutalism</code>):",
        cssP2: "Note: The implementation of brutalism largely depends on the structure and layout choices of the content, as well as the deliberate omission of decorative elements.",
        downloadTitle: "Resource Download (Example)",
        downloadP1: "Download a zip file containing a more complete CSS definition for this style (may include specific component styles, font file references, etc.).",
        downloadButton: "Download brutalism.zip",
        footerText: "AI Website Style Showcase"
    },
    zh: {
        pageTitle: "风格详情 - 粗野主义",
        headerTitle: "粗野主义 (Brutalism)",
        headerSubtitle: "探索 <span class=\"highlight\">粗野主义</span> 网页设计风格的特点与应用",
        backLink: "返回风格列表",
        aboutTitle: "关于此风格",
        aboutP1: "网页设计中的粗野主义（Brutalism）源自于同名的建筑运动，强调原始、裸露、未经修饰的材料和结构。它常常被视为对当前精致、圆滑、用户友好型设计趋势的一种反叛。",
        aboutP2: "这种风格通常给人一种直接、诚实甚至有些“粗糙”的感觉。它不追求传统意义上的美观，而是注重功能的直接呈现和结构的清晰可见。",
        featuresTitle: "主要特点:",
        feature1: "<strong>原始感 (Raw Feel):</strong> 界面看起来像是基础的、未加修饰的 HTML 结构。",
        feature2: "<strong>系统字体 (System Fonts):</strong> 大量使用计算机默认字体，如 Arial, Times New Roman, 或等宽字体 (Monospace)。",
        feature3: "<strong>高对比度 (High Contrast):</strong> 常用纯黑、纯白或非常鲜明的原色（如亮黄、亮蓝）进行搭配，对比强烈。",
        feature4: "<strong>无装饰 (Lack of Ornamentation):</strong> 很少或完全没有渐变、柔和阴影、纹理或复杂的动画。",
        feature5: "<strong>硬朗边缘 (Hard Edges):</strong> 元素通常具有清晰、硬朗的边框，几乎没有圆角。",
        feature6: "<strong>块状布局 (Blocky Layout):</strong> 布局结构分明，有时会故意显得有些笨拙或不平衡。",
        feature7: "<strong>可见结构 (Visible Structure):</strong> 边框、分隔线等结构元素被强调，而不是隐藏。",
        feature8: "<strong>粗糙阴影 (Harsh Shadows):</strong> 如果使用阴影，通常是简单、硬朗的块状阴影，而非柔和的模糊效果。",
        aboutP3: "粗野主义风格常用于个人作品集、艺术项目、独立杂志或需要表达强烈个性和反主流态度的网站。",
        promptTitle: "示例 AI Prompt",
        promptP1: "（中文解释：为一个艺术杂志创建一个粗野主义网站。使用默认系统字体（Arial, Times），鲜明的高对比度颜色（黑/白 或 黑/黄），硬边框，无圆角，也许可以加上粗糙的块状阴影。）",
        cssTitle: "主题 CSS 代码片段",
        cssP1: "以下是将粗野主义风格应用为全局主题的核心 CSS 代码 (<code>body.theme-brutalism</code>):",
        cssP2: "注意：粗野主义的实现很大程度上依赖于内容的结构和布局选择，以及对装饰性元素的刻意省略。",
        downloadTitle: "资源下载 (示例)",
        downloadP1: "下载包含此风格更完整 CSS 定义（可能包括特定组件样式、字体文件引用等）的压缩包。",
        downloadButton: "下载 brutalism.zip",
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
    console.warn('Global translations object not found. Using page-specific translations for brutalism.html.');
}