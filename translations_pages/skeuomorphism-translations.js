const pageTranslations = {
    en: {
        pageTitleSkeuomorphism: "Style Detail - Skeuomorphism",
        headerTitleSkeuomorphism: "Skeuomorphism Style Detail",
        headerSubtitleSkeuomorphism: "Explore the features and applications of the Skeuomorphism design style",
        backToList: "Back to Style List",
        aboutThisStyle: "About This Style",
        skeuomorphismDesc1: "Skeuomorphism is an interface design method whose core lies in imitating the appearance, material, texture, and interaction methods of corresponding objects in the real world, striving to create a realistic and familiar feeling on the digital interface.",
        mainFeatures: "Main Features:",
        featureRealisticMaterials: "<strong>Realistic Materials:</strong> Extensive use of textures and visual effects of real-world materials such as leather, wood, metal, fabric, and paper.",
        featureDepthSense: "<strong>Stereoscopic Sense & Depth:</strong> Simulates lighting effects through rich shadows (drop shadows, inner shadows), highlights, and gradients to create a sense of three-dimensionality and depth for elements.",
        featurePhysicalMetaphors: "<strong>Physical Metaphors:</strong> The appearance and interaction of interface elements (such as buttons, switches, knobs) directly imitate their real-world counterparts. For example, buttons look like they can be 'pressed', and books can be 'flipped'.",
        featureRichDetails: "<strong>Rich Details:</strong> Focuses on detailed depictions, such as stitching, wear effects, and the edges of physical buttons, to enhance realism.",
        featureFamiliarity: "<strong>Familiarity:</strong> Leverages users' familiarity with real-world objects to reduce learning costs and provide an intuitive operating experience.",
        skeuomorphismUsage: "This style was very popular in the early days of smartphones (e.g., early iOS), aiming to help users understand and transition to new touchscreen interactions. Although flat and minimalist design are more common now, skeuomorphism still has its unique charm and value in certain scenarios (such as game interfaces, specific applications, or when emphasizing brand texture).",
        exampleAiPrompt: "Example AI Prompt",
        skeuomorphismPromptExplanation: "(English explanation: Design a skeuomorphic UI element, like a leather-bound notebook app interface. Use realistic leather texture, stitching details, drop shadows, and maybe a textured paper background. Font like Georgia or a classic serif.)",
        themeCssSnippet: "Theme CSS Code Snippet",
        cssSnippetIntroSkeuomorphism: "The following is the core CSS code for applying the Skeuomorphism style as a global theme (<code>body.theme-skeuomorphism</code>):",
        skeuomorphismCssNote: "Note: This is only the core theme code. In actual application, you may need to adjust the styles of specific components to achieve the best skeuomorphic effect.",
        resourceDownload: "Resource Download (Example)",
        downloadDescriptionSkeuomorphism: "Download a compressed package containing a more complete CSS definition for this style (may include specific component styles, font file references, etc.).",
        downloadButtonSkeuomorphism: "Download skeuomorphism.zip",
        footerText: "AI Website Style Showcase"
    },
    zh: {
        pageTitleSkeuomorphism: "风格详情 - 拟物化设计",
        headerTitleSkeuomorphism: "拟物化设计 (Skeuomorphism) 风格详情",
        headerSubtitleSkeuomorphism: "探索 <span class=\"highlight\">拟物化设计</span> 设计风格的特点与应用",
        backToList: "返回风格列表",
        aboutThisStyle: "关于此风格",
        skeuomorphismDesc1: "拟物化设计（Skeuomorphism）是一种界面设计方法，其核心在于模仿现实世界中对应物体的外观、材质、纹理和交互方式，力求在数字界面上创造出逼真、熟悉的感觉。",
        mainFeatures: "主要特点:",
        featureRealisticMaterials: "<strong>模仿现实材质:</strong> 大量使用皮革、木材、金属、布料、纸张等现实材质的纹理和视觉效果。",
        featureDepthSense: "<strong>立体感与深度:</strong> 通过丰富的阴影（投影、内阴影）、高光和渐变来模拟光照效果，创造出元素的立体感和深度。",
        featurePhysicalMetaphors: "<strong>物理隐喻:</strong> 界面元素（如按钮、开关、旋钮）的外观和交互方式直接模仿其在现实世界中的对应物，例如按钮看起来可以“按下”，书本可以“翻页”。",
        featureRichDetails: "<strong>细节丰富:</strong> 注重细节刻画，如缝线、磨损效果、物理按钮的边缘等，以增强真实感。",
        featureFamiliarity: "<strong>熟悉感:</strong> 利用用户对现实世界物体的熟悉感，降低学习成本，提供直观的操作体验。",
        skeuomorphismUsage: "这种风格在智能手机早期非常流行（如早期 iOS），旨在帮助用户理解和过渡到新的触摸屏交互。虽然现在扁平化和极简设计更为普遍，但拟物化在某些场景下（如游戏界面、特定应用或强调品牌质感时）仍然有其独特的魅力和价值。",
        exampleAiPrompt: "示例 AI Prompt",
        skeuomorphismPromptExplanation: "（中文解释：设计一个拟物化的 UI 元素，例如一个皮革封面的笔记本应用界面。使用逼真的皮革纹理、缝线细节、投影阴影，或许再加上有纹理的纸张背景。字体使用像 Georgia 或其他经典的衬线字体。）",
        themeCssSnippet: "主题 CSS 代码片段",
        cssSnippetIntroSkeuomorphism: "以下是将拟物化风格应用为全局主题的核心 CSS 代码 (<code>body.theme-skeuomorphism</code>):",
        skeuomorphismCssNote: "注意：这只是核心主题代码。实际应用中可能还需要调整特定组件的样式以达到最佳拟物效果。",
        resourceDownload: "资源下载 (示例)",
        downloadDescriptionSkeuomorphism: "下载包含此风格更完整 CSS 定义（可能包括特定组件样式、字体文件引用等）的压缩包。",
        downloadButtonSkeuomorphism: "下载 skeuomorphism.zip",
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
    console.log('Page-specific translations for skeuomorphism merged into global translations.');
} else {
    console.warn('Global translations object not found. Initializing with skeuomorphism page translations.');
    translations = JSON.parse(JSON.stringify(pageTranslations)); // Deep copy
}