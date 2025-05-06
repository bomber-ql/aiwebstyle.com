const pageTranslations = {
    en: {
        pageTitle: "Style Detail - Illustration Style",
        headerTitle: "Illustration Style",
        headerSubtitle: "Explore the characteristics and applications of the <span class=\"highlight\">Illustration Style</span> web design",
        backLink: "Back to Style List",
        aboutTitle: "About This Style",
        aboutP1: "Illustration-style web design focuses on using custom, often hand-drawn style graphic elements to convey information, create atmosphere, and enhance brand personality. It's not just about adding pictures, but integrating illustration as a core component of the design.",
        aboutP2: "This style can be very diverse, from simple line drawings to complex scene illustrations. The key is its uniqueness and artistry.",
        featuresTitle: "Main Features:",
        feature1: "<strong>Custom Illustrations:</strong> The core element is unique illustrations created for a specific purpose, rather than generic stock material.",
        feature2: "<strong>Unique Characters/Scenes:</strong> Often includes original characters, mascots, or scene depictions representing the brand or concept.",
        feature3: "<strong>Storytelling:</strong> Illustrations are often used to tell brand stories, explain complex concepts, or guide user flows.",
        feature4: "<strong>Specific Color Palette:</strong> The color scheme usually closely matches the style of the illustration itself, and can be soft, vibrant, or themed.",
        feature5: "<strong>Hand-drawn/Organic Feel:</strong> Even when digitally created, it often has a hand-drawn texture, irregular lines, or organic shapes.",
        feature6: "<strong>Integration with Layout:</strong> Illustrations are not just decorative, but are cleverly combined with text, buttons, and other interface elements.",
        feature7: "<strong>Emotional Connection:</strong> Artistic expression makes it easier to establish an emotional connection with users.",
        aboutP3: "The illustration style is very suitable for websites that need to emphasize creativity, friendliness, humanization, or storytelling, such as startups, creative agencies, children's products, non-profit organizations, and personal portfolios.",
        illustrationPlaceholder: "(A representative illustration would typically be placed here)",
        promptTitle: "Sample AI Prompt",
        promptP1: "(Chinese Explanation: Design a website landing page using a friendly illustration style. Feature a custom illustration of diverse people collaborating, use a warm and inviting color palette (oranges, soft blues), Poppins font, rounded buttons, and integrate the illustration smoothly with the text content.)",
        cssTitle: "Theme CSS Code Snippet",
        cssP1: "Below is the core CSS code for applying the Illustration style as a global theme (<code>body.theme-illustration</code>):",
        cssP2: "Note: The essence of the illustration style lies in the high-quality custom illustrations themselves. CSS is mainly responsible for providing a harmonious background and interface elements to complement the illustrations.",
        downloadTitle: "Resource Download (Example)",
        downloadP1: "Download a zip file containing a more complete CSS definition for this style (may include specific component styles, font file references, etc.).",
        downloadButton: "Download illustration.zip",
        footerText: "AI Website Style Showcase"
    },
    zh: {
        pageTitle: "风格详情 - 插画风格",
        headerTitle: "插画风格 (Illustration Style)",
        headerSubtitle: "探索 <span class=\"highlight\">插画风格</span> 网页设计风格的特点与应用",
        backLink: "返回风格列表",
        aboutTitle: "关于此风格",
        aboutP1: "插画风格的网页设计侧重于使用定制的、通常是手绘风格的图形元素来传达信息、营造氛围和增强品牌个性。它不仅仅是添加图片，而是将插画作为设计的核心组成部分。",
        aboutP2: "这种风格可以非常多样化，从简约的线条画到复杂的场景插画，关键在于其独特性和艺术性。",
        featuresTitle: "主要特点:",
        feature1: "<strong>定制插画 (Custom Illustrations):</strong> 核心元素是为特定目的创作的独特插画，而非通用图库素材。",
        feature2: "<strong>独特角色/场景 (Unique Characters/Scenes):</strong> 常常包含代表品牌或概念的原创角色、吉祥物或场景描绘。",
        feature3: "<strong>叙事性 (Storytelling):</strong> 插画常被用来讲述品牌故事、解释复杂概念或引导用户流程。",
        feature4: "<strong>特定调色板 (Specific Color Palette):</strong> 色彩方案通常与插画本身的风格紧密配合，可能柔和、鲜艳或具有特定主题。",
        feature5: "<strong>手绘/有机感 (Hand-drawn/Organic Feel):</strong> 即使是数字创作，也常常带有手绘的质感、不规则的线条或有机的形状。",
        feature6: "<strong>与布局融合 (Integration with Layout):</strong> 插画不仅仅是装饰，而是与文本、按钮和其他界面元素巧妙地结合在一起。",
        feature7: "<strong>情感连接 (Emotional Connection):</strong> 通过艺术化的表达，更容易与用户建立情感联系。",
        aboutP3: "插画风格非常适合需要强调创意、友好、人性化或讲述故事的网站，如初创公司、创意机构、儿童产品、非营利组织以及个人作品集。",
        illustrationPlaceholder: "(这里通常会放置一个代表性的插画)",
        promptTitle: "示例 AI Prompt",
        promptP1: "（中文解释：使用友好的插画风格设计一个网站着陆页。包含一个展示多元人群协作的定制插画，使用温暖且吸引人的调色板（橙色系、柔和蓝），Poppins 字体，圆角按钮，并将插画与文本内容流畅地结合起来。）",
        cssTitle: "主题 CSS 代码片段",
        cssP1: "以下是将插画风格应用为全局主题的核心 CSS 代码 (<code>body.theme-illustration</code>):",
        cssP2: "注意：插画风格的精髓在于高质量的定制插画本身。CSS 主要负责提供一个和谐的背景和界面元素，以衬托插画。",
        downloadTitle: "资源下载 (示例)",
        downloadP1: "下载包含此风格更完整 CSS 定义（可能包括特定组件样式、字体文件引用等）的压缩包。",
        downloadButton: "下载 illustration.zip",
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
    console.warn('Global translations object not found. Using page-specific translations for illustration.html.');
}