const pageTranslations = {
    en: {
        pageTitle: "Style Detail - Bold Typography",
        headerTitle: "Bold Typography",
        headerSubtitle: "Explore the characteristics and applications of the <span class=\"highlight\">Bold Typography</span> web design style",
        backLink: "Back to Style List",
        aboutTitle: "About This Style",
        aboutP1: "Bold typography style is a web design approach that places text, especially <strong>large, eye-catching headlines</strong>, as the core element of the design. It's not just about choosing a bold font weight, but about building visual hierarchy and impact around the typography itself.",
        aboutP2: "This style usually pursues simplicity, directness, and power, conveying information and emotion through font choice, size, spacing, and layout.",
        featuresTitle: "Main Features:",
        feature1: "<strong>Oversized Headlines:</strong> Headlines usually occupy a prominent position on the screen, with extremely large font sizes, becoming the visual focus.",
        feature2: "<strong>Strong Font Choices:</strong> Tends to use sans-serif or highly characterful fonts, especially those with very bold weights (like Black, Ultra Bold). Examples include Montserrat, Anton, Oswald, Inter (900).",
        feature3: "<strong>High Contrast:</strong> Often employs simple, high-contrast color schemes (e.g., black and white, white background with bright colored text) to highlight the text.",
        feature4: "<strong>Typography as Design:</strong> Text is not just a content carrier; its shape, arrangement, and negative space constitute the main visual elements of the design.",
        feature5: "<strong>Clear Hierarchy:</strong> Despite the prominent headlines, a clear information hierarchy is established through careful arrangement of font size, weight, and spacing.",
        feature6: "<strong>Minimalist Tendencies:</strong> To let typography take center stage, the use of other decorative elements (like graphics, complex backgrounds) is usually reduced.",
        feature7: "<strong>Emphasis on Readability:</strong> Even with large font sizes, readability must be ensured across different screen sizes. Pay attention to line height and letter spacing adjustments.",
        aboutP3: "The bold typography style is very suitable for websites that need to quickly convey core information, showcase a sense of power and modernity, such as event promotions, portfolios, brand manifestos, news headlines, or any scenario where a strong first impression through text is desired.",
        promptTitle: "Sample AI Prompt",
        promptP1: "(Chinese Explanation: Design a website landing page using a bold typography style. Feature a massive headline using the 'Anton' font or 'Montserrat' (900 weight). Use a high-contrast black and white color scheme with one minimal accent color (e.g., bright yellow) for calls to action. Keep layout clean and focused on the text hierarchy.)",
        cssTitle: "Theme CSS Code Snippet",
        cssP1: "Below is the core CSS code for applying the bold typography style as a global theme (<code>body.theme-bold-typography</code>):",
        cssP2: "Note: The core of bold typography lies in font selection and hierarchical design. The CSS above provides a basic framework; actual application requires adjusting font sizes, spacing, and specific fonts based on content.",
        downloadTitle: "Resource Download (Example)",
        downloadP1: "Download a zip file containing a more complete CSS definition for this style (may include specific component styles, font file references, etc.).",
        downloadButton: "Download bold-typography.zip",
        footerText: "AI Website Style Showcase"
    },
    zh: {
        pageTitle: "风格详情 - 粗体排版",
        headerTitle: "粗体排版 (Bold Typography)",
        headerSubtitle: "探索 <span class=\"highlight\">粗体排版</span> 网页设计风格的特点与应用",
        backLink: "返回风格列表",
        aboutTitle: "关于此风格",
        aboutP1: "粗体排版风格是一种将文字，特别是<strong>大型、醒目的标题</strong>作为设计核心元素的网页设计方法。它不仅仅是选择粗体字重，而是围绕排版本身来构建视觉层次和冲击力。",
        aboutP2: "这种风格通常追求简洁、直接和有力，通过字体的选择、大小、间距和布局来传达信息和情感。",
        featuresTitle: "主要特点:",
        feature1: "<strong>巨大的标题 (Oversized Headlines):</strong> 标题通常占据屏幕的显著位置，字号极大，成为视觉焦点。",
        feature2: "<strong>强烈的字体选择 (Strong Font Choices):</strong> 倾向于使用无衬线体（Sans-serif）或具有强烈个性的字体，特别是那些拥有极粗字重（如 Black, Ultra Bold）的字体。例如 Montserrat, Anton, Oswald, Inter (900)。",
        feature3: "<strong>高对比度 (High Contrast):</strong> 常常采用简单的、高对比度的配色方案（如黑白、白底亮色字），以突出文字。",
        feature4: "<strong>排版即设计 (Typography as Design):</strong> 文字不仅仅是内容载体，其形状、排列和负空间本身就构成了设计的主要视觉元素。",
        feature5: "<strong>清晰的层级 (Clear Hierarchy):</strong> 尽管标题醒目，但通过字号、字重和间距的精心安排，依然能建立清晰的信息层级。",
        feature6: "<strong>极简主义倾向 (Minimalist Tendencies):</strong> 为了让排版成为主角，通常会减少其他装饰性元素（如图形、复杂背景）的使用。",
        feature7: "<strong>强调可读性 (Emphasis on Readability):</strong> 即使字号很大，也要确保在不同屏幕尺寸下的可读性。注意行高和字间距的调整。",
        aboutP3: "粗体排版风格非常适合需要快速传达核心信息、展现力量感和现代感的网站，如活动宣传、作品集、品牌宣言、新闻标题或任何希望通过文字产生强烈第一印象的场景。",
        promptTitle: "示例 AI Prompt",
        promptP1: "（中文解释：使用粗体排版风格设计一个网站着陆页。采用一个巨大的标题，使用 'Anton' 字体或 'Montserrat' (900 字重)。使用高对比度的黑白配色方案，并为号召性用语添加一种简约的强调色（例如亮黄色）。保持布局简洁，并专注于文本层级。）",
        cssTitle: "主题 CSS 代码片段",
        cssP1: "以下是将粗体排版风格应用为全局主题的核心 CSS 代码 (<code>body.theme-bold-typography</code>):",
        cssP2: "注意：粗体排版的核心在于字体的选择和层级设计。上述 CSS 提供了基础框架，实际应用中需要根据内容调整字号、间距和具体字体。",
        downloadTitle: "资源下载 (示例)",
        downloadP1: "下载包含此风格更完整 CSS 定义（可能包括特定组件样式、字体文件引用等）的压缩包。",
        downloadButton: "下载 bold-typography.zip",
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
    // This might happen if the page-specific script is loaded before the global one,
    // or if the global translations are not defined for some reason.
    translations = pageTranslations;
    console.warn('Global translations object not found. Using page-specific translations for bold-typography.html.');
}