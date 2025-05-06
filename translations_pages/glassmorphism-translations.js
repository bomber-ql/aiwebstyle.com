const pageTranslations = {
    en: {
        pageTitle: "Style Detail - Glassmorphism",
        headerTitle: "Glassmorphism",
        headerSubtitle: "Explore the characteristics and applications of the <span class=\"highlight\">Glassmorphism</span> web design style",
        backLink: "Back to Style List",
        aboutTitle: "About This Style",
        aboutP1: "Glassmorphism is an interface design style that simulates a frosted glass effect. It creates a light, layered, and modern visual experience through background blur, translucency, subtle borders, and glossy effects.",
        aboutP2: "The key to this style is that elements appear to float above a colorful, blurred background, as if looking at the world through a layer of frosted glass.",
        featuresTitle: "Main Features:",
        feature1: "<strong>Background Blur:</strong> The core feature, using CSS's `backdrop-filter: blur(Xpx);` property to blur the content behind the element.",
        feature2: "<strong>Transparency:</strong> Element backgrounds are usually translucent, allowing the underlying content (after blurring) to be faintly visible. Set via RGBA or HSLA values for `background-color`.",
        feature3: "<strong>Subtle Borders:</strong> Usually includes a very fine, translucent white or light-colored border to simulate the reflection of light on the edge of the glass, enhancing the element's outline.",
        feature4: "<strong>Layered Approach:</strong> Glassmorphic elements are often superimposed on colorful or patterned backgrounds, and the blur effect makes the hierarchical relationship clearer.",
        feature5: "<strong>Glossy Highlights:</strong> Subtle linear gradients or inner shadows are sometimes added to simulate the effect of light on the glass surface, increasing three-dimensionality.",
        feature6: "<strong>Vibrant Backgrounds:</strong> To make the blur effect more pronounced and interesting, the underlying background is usually brightly colored or contains rich visual elements.",
        feature7: "<strong>Accessibility Concerns:</strong> Ensure sufficient contrast between text and foreground elements and the glass background to avoid content being difficult to read due to a complex or blurred background.",
        aboutP3: "Glassmorphism is suitable for interfaces that require a modern, technological, or lightweight feel, such as dashboards, card-based layouts, sidebars, modal boxes, etc. However, overuse can lead to visual clutter or performance issues (`backdrop-filter` is relatively performance-intensive).",
        promptTitle: "Sample AI Prompt",
        promptP1: "(Chinese Explanation: Design a user interface element (like a settings card) using the glassmorphism style. It should have a frosted glass effect with a background blur (backdrop-filter), transparency (semi-transparent white background), a subtle 1px white border, and sit on top of a colorful, abstract gradient background. Ensure text inside has good contrast.)",
        cssTitle: "Theme CSS Code Snippet",
        cssP1: "Below is the core CSS code for applying the Glassmorphism style as a global theme (<code>body.theme-glassmorphism</code>):",
        cssP2: "Note: The glassmorphism effect relies on the `backdrop-filter` property; please check browser compatibility. Also, ensure the background is sufficiently colorful for the blur effect to be noticeable. Performance is also a consideration.",
        downloadTitle: "Resource Download (Example)",
        downloadP1: "Download a zip file containing a more complete CSS definition for this style (may include specific component styles, font file references, etc.).",
        downloadButton: "Download glassmorphism.zip",
        footerText: "AI Website Style Showcase"
    },
    zh: {
        pageTitle: "风格详情 - 玻璃拟态",
        headerTitle: "玻璃拟态 (Glassmorphism)",
        headerSubtitle: "探索 <span class=\"highlight\">玻璃拟态</span> 网页设计风格的特点与应用",
        backLink: "返回风格列表",
        aboutTitle: "关于此风格",
        aboutP1: "玻璃拟态（Glassmorphism）是一种模拟磨砂玻璃效果的界面设计风格。它通过背景模糊、半透明、微妙的边框和光泽效果，创造出一种轻盈、分层且具有现代感的视觉体验。",
        aboutP2: "这种风格的关键在于元素看起来像是漂浮在彩色、模糊的背景之上，如同隔着一层磨砂玻璃看世界。",
        featuresTitle: "主要特点:",
        feature1: "<strong>背景模糊 (Background Blur):</strong> 最核心的特征，使用 CSS 的 `backdrop-filter: blur(Xpx);` 属性让元素背后的内容模糊化。",
        feature2: "<strong>透明度 (Transparency):</strong> 元素背景通常是半透明的，允许下层内容（模糊后的）隐约可见。通过 `background-color` 的 RGBA 或 HSLA 值设置。",
        feature3: "<strong>微妙的边框 (Subtle Borders):</strong> 通常会有一个非常细微、半透明的白色或浅色边框，以模拟玻璃的边缘反光，增强元素的轮廓感。",
        feature4: "<strong>多层级感 (Layered Approach):</strong> 玻璃拟态元素常常叠加在彩色或带有图案的背景之上，模糊效果使得层级关系更加清晰。",
        feature5: "<strong>光泽效果 (Glossy Highlights):</strong> 有时会添加微妙的线性渐变或内部阴影来模拟光线照射在玻璃表面的效果，增加立体感。",
        feature6: "<strong>鲜艳的背景 (Vibrant Backgrounds):</strong> 为了让模糊效果更明显、更有趣，底层背景通常色彩鲜艳或包含丰富的视觉元素。",
        feature7: "<strong>可访问性考量 (Accessibility Concerns):</strong> 需要确保文本和前景元素与玻璃背景之间有足够的对比度，避免因背景复杂或模糊导致内容难以阅读。",
        aboutP3: "玻璃拟态适用于需要现代感、科技感或轻盈感的界面，如仪表盘、卡片式布局、侧边栏、模态框等。但过度使用可能导致视觉混乱或性能问题（`backdrop-filter` 相对耗性能）。",
        promptTitle: "示例 AI Prompt",
        promptP1: "（中文解释：使用玻璃拟态风格设计一个用户界面元素（例如设置卡片）。它应该具有磨砂玻璃效果，包含背景模糊（backdrop-filter）、透明度（半透明白色背景）、一个微妙的 1px 白色边框，并放置在一个色彩丰富、抽象的渐变背景之上。确保内部文本具有良好的对比度。）",
        cssTitle: "主题 CSS 代码片段",
        cssP1: "以下是将玻璃拟态风格应用为全局主题的核心 CSS 代码 (<code>body.theme-glassmorphism</code>):",
        cssP2: "注意：玻璃拟态效果依赖于 `backdrop-filter` 属性，请检查浏览器兼容性。同时，确保背景足够丰富多彩，模糊效果才能明显。性能也是一个考量因素。",
        downloadTitle: "资源下载 (示例)",
        downloadP1: "下载包含此风格更完整 CSS 定义（可能包括特定组件样式、字体文件引用等）的压缩包。",
        downloadButton: "下载 glassmorphism.zip",
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
    console.warn('Global translations object not found. Using page-specific translations for glassmorphism.html.');
}