// 3d-interactive-translations.js
const pageTranslations = {
  en: {
    detail_page_title: "Style Detail - 3D Interactive (Enhanced)",
    detail_header_title: "3D Interactive (Enhanced Effect)",
    detail_header_subtitle: "Explore the features and applications of the <span class='highlight'>3D Interactive</span> web design style (effect enhanced)",
    detail_back_to_list: "Back to Style List",
    detail_about_style_title: "About This Style (Enhanced Version)",
    detail_about_p1: "3D interactive web design utilizes technologies like WebGL to create interactive three-dimensional scenes, offering immersive experiences. The core of this style lies in JavaScript-driven 3D rendering, but its <strong>hosting UI</strong> often adopts designs with a sense of technology and depth to complement it.",
    detail_about_p2: "Even without complex WebGL scenes, CSS tricks (like shadows, gradients, perspective, and transforms) can be used on elements like buttons and cards to <strong>simulate a more significant 3D spatial sense and interactive feedback</strong>, enhancing the overall style.",
    detail_features_title: "Main Features:",
    detail_feature_1: "<strong>Core: 3D Models & Interaction (JS/WebGL):</strong> Load, render, and allow user manipulation of 3D models or scenes.",
    detail_feature_2: "<strong>UI Style: Tech & Depth:</strong> Often uses dark themes, clean fonts, subtle gloss or shadow effects to create a professional and cutting-edge atmosphere.",
    detail_feature_3: "<strong>CSS Simulated 3D Effects (Enhanced):</strong> Utilizes `perspective`, `transform (translateZ, rotateX/Y)`, shadows, etc., to add more noticeable depth and 3D transformations during interaction to UI elements (cards, buttons).",
    detail_feature_4: "<strong>Real-time Rendering & Performance:</strong> True 3D effects require real-time rendering and attention to performance optimization.",
    detail_feature_5: "<strong>Lighting, Materials & Camera:</strong> Key elements for building realistic 3D scenes (implemented in WebGL).",
    detail_feature_6: "<strong>Integration with UI:</strong> 3D scenes need to work seamlessly with HTML UI elements.",
    detail_about_p3: "This style is suitable for product showcases, data visualization, games, virtual tours, and other scenarios requiring a sense of space and deep interaction. Pure CSS can only simulate partial effects; the full experience relies on JavaScript and 3D libraries.",
    detail_prompt_title: "Example AI Prompt (for concept or UI layout)",
    detail_prompt_example_p1: "(English explanation: Design a UI layout for a website showcasing a 3D product model. Include a large central area for the 3D canvas (placeholder), minimal side controls, a modern tech aesthetic (dark theme, clean fonts like Inter), and apply more pronounced 3D hover effects (significant card lifting and tilting) to UI elements using CSS transforms.)",
    detail_prompt_note: "Note: AI can assist in designing layouts with a 3D feel and CSS concepts, but generating functional WebGL code remains a challenge.",
    detail_css_title: "Theme CSS Snippets (Further Enhanced 3D Feel)",
    detail_css_p1: "The following CSS code builds upon the original by adding more intense simulated 3D hover effects to cards and buttons (<code>body.theme-3d-interactive</code>):",
    detail_css_note: "Note: These CSS effects are intended to significantly enhance the visual style and simulate a 3D interactive feel. True 3D rendering and complex interactions still require JavaScript and WebGL. The perceived effect may also vary depending on the browser and user settings. Overly strong effects can sometimes impact usability, so please balance accordingly.",
    detail_download_title: "Resource Download (Example)",
    detail_download_p1: "Download a zip file containing the UI CSS definitions for this style (including further enhanced simulated 3D effects) and potentially a basic JS framework setup.",
    detail_download_button: "Download 3d-interactive-ultra-enhanced.zip",
    detail_footer_text: "AI Website Style Gallery"
  },
  zh: {
    detail_page_title: "风格详情 - 3D 交互 (强化版)",
    detail_header_title: "3D 交互 (3D Interactive) - 强化效果",
    detail_header_subtitle: "探索 <span class='highlight'>3D 交互</span> 网页设计风格的特点与应用 (效果已强化)",
    detail_back_to_list: "返回风格列表",
    detail_about_style_title: "关于此风格 (强化效果版)",
    detail_about_p1: "3D 交互式网页设计利用 WebGL 等技术创建可交互的三维场景，提供沉浸式体验。这种风格的核心在于 JavaScript 驱动的 3D 渲染，但其<strong>承载 UI</strong> 也常常采用具有科技感和深度感的设计来与之呼应。",
    detail_about_p2: "即使没有复杂的 WebGL 场景，也可以通过 CSS 技巧（如阴影、渐变、透视和变换）在按钮、卡片等元素上<strong>模拟出更为显著的 3D 空间感和交互反馈</strong>，增强整体风格。",
    detail_features_title: "主要特点:",
    detail_feature_1: "<strong>核心：3D 模型与交互 (JS/WebGL):</strong> 加载、渲染并允许用户操作三维模型或场景。",
    detail_feature_2: "<strong>UI 风格：科技感与深度:</strong> 常使用深色主题、简洁字体、微妙的光泽或阴影效果，营造专业和前沿的氛围。",
    detail_feature_3: "<strong>CSS 模拟 3D 效果 (已强化):</strong> 利用 `perspective`, `transform (translateZ, rotateX/Y)`, 阴影等，为 UI 元素（卡片、按钮）添加更明显的深度感和交互时的 3D 变换。",
    detail_feature_4: "<strong>实时渲染与性能:</strong> 真正的 3D 效果需要实时渲染，需关注性能优化。",
    detail_feature_5: "<strong>光照、材质与相机:</strong> 这些是构建真实 3D 场景的关键元素（在 WebGL 中实现）。",
    detail_feature_6: "<strong>与 UI 结合:</strong> 3D 场景需要与 HTML UI 元素无缝协作。",
    detail_about_p3: "这种风格适用于产品展示、数据可视化、游戏、虚拟导览等需要空间感和深度交互的场景。纯 CSS 只能模拟部分效果，完整的体验依赖 JavaScript 和 3D 库。",
    detail_prompt_title: "示例 AI Prompt (用于概念或 UI 布局)",
    detail_prompt_example_p1: "（中文解释：为一个展示 3D 产品模型的网站设计 UI 布局。包含一个用于 3D 画布的大型中心区域（占位符），简约的侧边控制，现代科技美学（深色主题，像 Inter 这样的简洁字体），并使用 CSS 变换为 UI 元素添加更显著的 3D 悬停效果（例如卡片明显抬起和倾斜）。）",
    detail_prompt_note: "注意：AI 可以辅助设计带有 3D 感 UI 的布局和 CSS 概念，但生成功能性 WebGL 代码仍是挑战。",
    detail_css_title: "主题 CSS 代码片段 (进一步强化 3D 感)",
    detail_css_p1: "以下 CSS 代码在原有基础上，为卡片和按钮添加了更强烈的模拟 3D 悬停效果 (<code>body.theme-3d-interactive</code>):",
    detail_css_note: "注意：这些 CSS 效果旨在大幅增强视觉风格，模拟 3D 交互感。真正的 3D 渲染和复杂交互仍需 JavaScript 和 WebGL。效果的感知也可能因浏览器和用户设置而异。过强的效果有时可能影响可用性，请注意平衡。",
    detail_download_title: "资源下载 (示例)",
    detail_download_p1: "下载包含此风格 UI（含进一步强化模拟 3D 效果）的 CSS 定义以及可能的 JS 框架基础设置的压缩包。",
    detail_download_button: "下载 3d-interactive-ultra-enhanced.zip",
    detail_footer_text: "AI 网站样式展示"
  }
};

// Attempt to merge with global translations if they exist
if (typeof translations === 'object' && translations !== null) {
  if (typeof translations.en === 'object' && translations.en !== null) {
    Object.assign(translations.en, pageTranslations.en);
  } else {
    translations.en = pageTranslations.en;
  }
  if (typeof translations.zh === 'object' && translations.zh !== null) {
    Object.assign(translations.zh, pageTranslations.zh);
  } else {
    translations.zh = pageTranslations.zh;
  }
} else {
  // If global translations don't exist, this becomes the main translation object
  // This case should ideally not happen if translations.js is loaded first.
  console.warn('Global translations object not found. Page-specific translations will be used directly, but global elements might not be translated.');
  // Making pageTranslations globally available if translations is undefined.
  // This is a fallback and might need adjustment based on how script.js handles it.
  var translations = JSON.parse(JSON.stringify(pageTranslations)); 
}