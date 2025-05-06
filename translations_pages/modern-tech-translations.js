const pageTranslations = {
    en: {
        pageTitle: "Style Detail - Modern Tech",
        headerTitle: "Modern Tech Style",
        headerSubtitle: "Explore the features and applications of the Modern Tech web design style",
        backLink: "Back to Style List",
        aboutTitle: "About This Style",
        aboutP1: "Modern Tech style is the application of modern design principles to digital products, software interfaces, and technology-related websites. It prioritizes clarity, efficiency, and user experience, often with a precise, cutting-edge feel.",
        featuresTitle: "Main Features:",
        feature1: "<strong>Clean Interface:</strong> Structured layouts, utilizing cards, modular design, and ample whitespace to organize information.",
        feature2: "<strong>Modern Sans-serif Fonts:</strong> Such as Inter, Poppins, SF Pro, focusing on readability and the use of different font weights.",
        feature3: "<strong>Functional Icons:</strong> Using clear, consistent icon systems (e.g., Material Icons, Font Awesome) to aid navigation and actions.",
        feature4: "<strong>Cool Palette & Accents:</strong> Commonly uses blues, purples, dark grays, and white as base colors, with bright accent colors (like bright blue, green) for interactive elements.",
        feature5: "<strong>Gradients & Shadows:</strong> May use subtle gradients to add dynamism and soft, precise shadows to enhance depth.",
        feature6: "<strong>Data Visualization:</strong> If applicable, includes clear, aesthetically pleasing charts (line, bar, pie, etc.).",
        feature7: "<strong>Microinteractions:</strong> Enhancing user experience through subtle animated feedback (e.g., button hovers, loading states).",
        feature8: "<strong>Dark Mode:</strong> Offering or defaulting to a dark theme is a common tech style feature, helping to reduce visual fatigue.",
        aboutP2: "This style is ideal for SaaS platforms, application landing pages, online tools, technical documentation, dashboards, and any digital interface that needs to convey a professional, efficient, and innovative feel.",
        promptTitle: "Sample AI Prompt",
        promptP1: "(English Explanation: Design a modern tech dashboard UI for data analytics. Use a clean layout with cards, charts (bar, line), Inter or Poppins font, a cool color palette (blues, purples, greys), clear data visualization, and subtle hover effects.)",
        cssTitle: "Theme CSS Snippet",
        cssP1: "The following is the core CSS code (<code>body.theme-modern-tech</code>) to apply this Modern Tech style as a global theme:",
        cssP2: "Note: The implementation of Modern Tech style also relies on clear icons, structured layouts (like grids), possible chart libraries, and smooth interaction details.",
        downloadTitle: "Resource Download (Sample)",
        downloadP1: "Download a zip package containing a more complete CSS definition for this style (may include specific component styles, font file references, etc.).",
        downloadButton: "Download modern-tech.zip",
        footerText: "AI Website Style Showcase"
    },
    zh: {
        pageTitle: "风格详情 - 现代科技风格",
        headerTitle: "现代科技风格 (Modern Tech)",
        headerSubtitle: "探索 <span class=\"highlight\">现代科技</span> 网页设计风格的特点与应用",
        backLink: "返回风格列表",
        aboutTitle: "关于此风格",
        aboutP1: "现代科技风格是现代设计原则在数字产品、软件界面和技术相关网站上的具体应用。它优先考虑清晰度、效率和用户体验，通常带有一种精确、前沿的感觉。",
        featuresTitle: "主要特点:",
        feature1: "<strong>清晰界面 (Clean Interface):</strong> 布局结构化，利用卡片、模块化设计和足够的留白来组织信息。",
        feature2: "<strong>现代无衬线字体 (Modern Sans-serif):</strong> 如 Inter, Poppins, SF Pro 等，注重易读性和不同字重的使用。",
        feature3: "<strong>功能性图标 (Functional Icons):</strong> 使用清晰、一致的图标系统（如 Material Icons, Font Awesome）来辅助导航和操作。",
        feature4: "<strong>冷色调与强调色 (Cool Palette & Accents):</strong> 常用蓝色、紫色、深灰、白色作为基础色，搭配明亮的强调色（如亮蓝、绿色）用于交互元素。",
        feature5: "<strong>渐变与阴影 (Gradients & Shadows):</strong> 可能使用微妙的渐变增加活力，使用柔和、精确的阴影提升层次感。",
        feature6: "<strong>数据可视化 (Data Visualization):</strong> 如果适用，会包含清晰、美观的图表（线形图、柱状图、饼图等）。",
        feature7: "<strong>微交互 (Microinteractions):</strong> 通过细微的动画反馈（如按钮悬停、加载状态）提升用户体验。",
        feature8: "<strong>暗黑模式 (Dark Mode):</strong> 提供或默认使用暗色主题是一种常见的科技风格特征，有助于减少视觉疲劳。",
        aboutP2: "这种风格非常适合 SaaS 平台、应用程序着陆页、在线工具、技术文档、仪表盘和任何需要传递专业、高效、创新感觉的数字界面。",
        promptTitle: "示例 AI Prompt",
        promptP1: "（中文解释：为数据分析设计一个现代科技风格的仪表盘用户界面。使用包含卡片、图表（柱状图、线形图）的简洁布局，Inter 或 Poppins 字体，冷色调配色方案（蓝色、紫色、灰色），清晰的数据可视化，以及微妙的悬停效果。）",
        cssTitle: "主题 CSS 代码片段",
        cssP1: "以下是将现代科技风格应用为全局主题的核心 CSS 代码 (<code>body.theme-modern-tech</code>):",
        cssP2: "注意：现代科技风格的实现还依赖于清晰的图标、结构化的布局（如网格）、可能的图表库以及流畅的交互细节。",
        downloadTitle: "资源下载 (示例)",
        downloadP1: "下载包含此风格更完整 CSS 定义（可能包括特定组件样式、字体文件引用等）的压缩包。",
        downloadButton: "下载 modern-tech.zip",
        footerText: "AI 网站样式展示"
    }
};

// Merge with global translations if available
if (typeof translations === 'object') {
    Object.keys(pageTranslations).forEach(lang => {
        translations[lang] = { ...translations[lang], ...pageTranslations[lang] };
    });
} else {
    // Fallback if global translations are not loaded
    console.warn('Global translations not found. Using page-specific translations for modern-tech.html.');
    translations = pageTranslations;
}