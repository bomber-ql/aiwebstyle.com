// aurora-ui-translations.js
const pageTranslations = {
  en: {
    detail_page_title: "Style Detail - Aurora UI",
    detail_header_title: "Aurora UI",
    detail_header_subtitle: "Explore the features and applications of the <span class='highlight'>Aurora UI</span> web design style",
    detail_back_to_list: "Back to Style List",
    detail_about_style_title: "About This Style",
    detail_about_p1: "Aurora UI is an interface design style inspired by the natural phenomenon of the aurora borealis. It creates an ethereal, dreamy, and light-filled visual effect by using <strong>large, soft, highly blurred colorful glows</strong> (often dominated by blue-green tones) in the background.",
    detail_about_p2: "This style is often combined with dark mode to better highlight the flowing color glows in the background and is frequently accompanied by smooth animation effects to enhance its dynamism.",
    detail_features_title: "Main Features:",
    detail_feature_1: "<strong>Blurred Background Shapes:</strong> Uses CSS's `filter: blur()` property to highly blur absolutely or fixed positioned colored gradient elements, forming soft light spots.",
    detail_feature_2: "<strong>Blue-Green Focused Gradients:</strong> Background glows primarily use vibrant greens, teals, blues, and can be accented with small amounts of purple or pink to simulate aurora color variations.",
    detail_feature_3: "<strong>Dark Background:</strong> A dark or near-black base background better accentuates the brightness and saturation of the aurora colors.",
    detail_feature_4: "<strong>Depth and Layering:</strong> Blurred background glows are positioned beneath the content layer, creating a distinct sense of spatial depth.",
    detail_feature_5: "<strong>Flowing Animations:</strong> Optional smooth animations (like slow movement, rotation, or color changes of light spots) can enhance the dynamic feel of the aurora.",
    detail_feature_6: "<strong>Clean Foreground:</strong> Foreground content (text, icons, buttons, cards) is usually kept simple and clean, using clear fonts and sufficient contrast to ensure information is clearly conveyed against the dynamic background. Elements like cards might use semi-transparent dark backgrounds or gradients.",
    detail_about_p3: "Aurora UI is suitable for websites and applications that need to create a sense of technology, futurism, tranquility, or a dreamlike atmosphere, such as SaaS platforms, data visualization, and creative portfolios.",
    detail_prompt_title: "Example AI Prompt",
    detail_prompt_example_p1: "(English explanation: Design a web application interface with an Aurora UI style. Use a very dark background (e.g., #0d1117). Create large, intensely blurred (e.g., filter: blur(140px)) background gradient shapes (opacity: 0.7) primarily using aurora-like colors: vibrant green (e.g., #34d399), teal (e.g., #2dd4bf), deep blue (e.g., #3b82f6), and a touch of violet (e.g., #8b5cf6). Position these shapes dynamically, partially overlapping and extending off-screen. Apply a subtle, slow, and wide-ranging animation to simulate aurora movement. Foreground cards should use a semi-transparent blue-green gradient background (e.g., linear-gradient(135deg, rgba(20, 184, 166, 0.85), rgba(59, 130, 246, 0.85))) to ensure text readability. Use 'Inter' font. Buttons should use a saturated teal (e.g., #14b8a6) with white text.)",
    detail_css_title: "Theme CSS Snippets",
    detail_css_p1: "The following is the core CSS code for applying this Aurora UI style (blue-green tones, dynamic effects, higher saturation) as a global theme (<code>body.theme-aurora-ui</code>). It creates blurred background glow effects using pseudo-elements and includes animation:",
    detail_css_note: "Note: The effect of Aurora UI largely depends on the fine-tuning of blurriness, color selection, transparency, shape size, and position. Animation is optional but can add dynamism. Please note that this effect may have certain performance requirements.",
    detail_download_title: "Resource Download (Example)",
    detail_download_p1: "Download a zip file containing a more complete CSS definition for this style.",
    detail_download_button: "Download aurora-ui.zip",
    detail_footer_text: "AI Website Style Gallery"
  },
  zh: {
    detail_page_title: "风格详情 - 极光 UI",
    detail_header_title: "极光 UI (Aurora UI)",
    detail_header_subtitle: "探索 <span class='highlight'>极光 UI</span> 网页设计风格的特点与应用",
    detail_back_to_list: "返回风格列表",
    detail_about_style_title: "关于此风格",
    detail_about_p1: "极光 UI（Aurora UI）是一种灵感来源于自然界北极光现象的界面设计风格。它通过在背景中使用<strong>大型、柔和、高度模糊的多彩光晕</strong>（通常以蓝绿色调为主），营造出一种空灵、梦幻、充满深度和光感的视觉效果。",
    detail_about_p2: "这种风格通常与深色模式结合使用，以更好地突出背景中流动的色彩光晕，并常伴有平滑的动画效果增加其动态感。",
    detail_features_title: "主要特点:",
    detail_feature_1: "<strong>动态模糊背景 (Blurred Background Shapes):</strong> 使用 CSS 的 `filter: blur()` 属性将绝对定位或固定定位的彩色渐变元素进行高度模糊处理，形成柔和的光斑。",
    detail_feature_2: "<strong>蓝绿主导的多彩渐变 (Blue-Green Focused Gradients):</strong> 背景光晕主要采用鲜艳的绿色、青色、蓝色，并可辅以少量紫色或粉色作为点缀，模拟极光的色彩变化。",
    detail_feature_3: "<strong>深邃的背景基调 (Dark Background):</strong> 深色或近黑色的基础背景能更好地衬托出极光色彩的亮度和饱和度。",
    detail_feature_4: "<strong>层次感与深度 (Depth and Layering):</strong> 模糊的背景光晕位于内容层之下，创造出明显的空间深度感。",
    detail_feature_5: "<strong>流动的动画效果 (Flowing Animations):</strong> 可选的平滑动画（如光斑的缓慢移动、旋转或颜色变化）可以增强极光的动态感。",
    detail_feature_6: "<strong>清晰的前景 (Clean Foreground):</strong> 前景内容（文本、图标、按钮、卡片）通常保持简洁、干净，使用清晰的字体和足够的对比度，确保信息在动态背景下依然清晰传达。卡片等元素可能采用半透明的深色背景或渐变。",
    detail_about_p3: "极光 UI 适用于需要营造科技感、未来感、宁静或梦幻氛围的网站和应用，例如 SaaS 平台、数据可视化、创意作品集等。",
    detail_prompt_title: "示例 AI Prompt",
    detail_prompt_example_p1: "（中文解释：设计一个具有极光 UI 风格的 Web 应用界面。使用非常深的背景（例如 #0d1117）。创建大型、强烈模糊（例如 filter: blur(140px)）、透明度为0.7的背景渐变形状，主要使用类似极光的颜色：鲜绿色（例如 #34d399）、青色（例如 #2dd4bf）、深蓝色（例如 #3b82f6）和少量紫色（例如 #8b5cf6）。动态地放置这些形状，使其部分重叠并延伸到屏幕外。应用微妙、缓慢且范围广泛的动画来模拟极光运动。前景卡片应使用半透明的蓝绿渐变背景（例如 linear-gradient(135deg, rgba(20, 184, 166, 0.85), rgba(59, 130, 246, 0.85))）以确保文本的可读性。使用 'Inter' 字体。按钮应使用饱和的青色（例如 #14b8a6）和白色文本。）",
    detail_css_title: "主题 CSS 代码片段",
    detail_css_p1: "以下是将此极光 UI 风格（蓝绿色调，动态效果，更高饱和度）应用为全局主题的核心 CSS 代码 (<code>body.theme-aurora-ui</code>)。它通过伪元素创建模糊的背景光晕效果，并包含动画：",
    detail_css_note: "注意：极光 UI 的效果很大程度上取决于模糊度、颜色选择、透明度、形状大小和位置的微调。动画效果是可选的，但可以增加动态感。请注意此效果可能对性能有一定要求。",
    detail_download_title: "资源下载 (示例)",
    detail_download_p1: "下载包含此风格更完整 CSS 定义的压缩包。",
    detail_download_button: "下载 aurora-ui.zip",
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
  console.warn('Global translations object not found. Page-specific translations will be used directly, but global elements might not be translated.');
  var translations = JSON.parse(JSON.stringify(pageTranslations)); 
}