// script.js (Multi-Page Version - Fix for Detail Page Theme Override)

// --- Global Variables & Configuration --- 
let currentLanguage = 'en'; // Default to English
// translations object will be loaded from translations.js
let originalGlobalTranslations = {}; // To store a pristine copy of global translations

// Deep copy initial global translations if available
if (typeof translations !== 'undefined') {
    originalGlobalTranslations = JSON.parse(JSON.stringify(translations));
} else {
    console.error("Global 'translations' object is not defined at the time of originalGlobalTranslations initialization.");
}

const stylesData = [
    { "id": "skeuomorphism", "name": "skeuomorphism_name", "description": "skeuomorphism_description", "prompt": "skeuomorphism_prompt" },
    { "id": "swiss-style", "name": "swiss_style_name", "description": "swiss_style_description", "prompt": "swiss_style_prompt" },
    { "id": "grunge", "name": "grunge_name", "description": "grunge_description", "prompt": "grunge_prompt" },
    { "id": "modern-tech", "name": "modern_tech_name", "description": "modern_tech_description", "prompt": "modern_tech_prompt" },
    { "id": "brutalism", "name": "brutalism_name", "description": "brutalism_description", "prompt": "brutalism_prompt" },
    { "id": "retro-90s", "name": "retro_90s_name", "description": "retro_90s_description", "prompt": "retro_90s_prompt" },
    { "id": "retro-y2k", "name": "retro_y2k_name", "description": "retro_y2k_description", "prompt": "retro_y2k_prompt" },
    { "id": "retro-pixel", "name": "retro_pixel_name", "description": "retro_pixel_description", "prompt": "retro_pixel_prompt" },
    { "id": "illustration", "name": "illustration_name", "description": "illustration_description", "prompt": "illustration_prompt" },
    { "id": "3d-interactive", "name": "interactive_3d_name", "description": "interactive_3d_description", "prompt": "interactive_3d_prompt" },
    { "id": "dark-mode", "name": "dark_mode_name", "description": "dark_mode_description", "prompt": "dark_mode_prompt" },
    { "id": "bold-typography", "name": "bold_typography_name", "description": "bold_typography_description", "prompt": "bold_typography_prompt" },
    { "id": "glassmorphism", "name": "glassmorphism_name", "description": "glassmorphism_description", "prompt": "glassmorphism_prompt" },
    { "id": "aurora-ui", "name": "aurora_ui_name", "description": "aurora_ui_description", "prompt": "aurora_ui_prompt" },
    { "id": "natural-organic", "name": "natural_organic_name", "description": "natural_organic_description", "prompt": "natural_organic_prompt" },
    { "id": "monochromatic", "name": "monochromatic_name", "description": "monochromatic_description", "prompt": "monochromatic_prompt" },
    { "id": "maximalism", "name": "maximalism_name", "description": "maximalism_description", "prompt": "maximalism_prompt" },
    { "id": "claymorphism", "name": "claymorphism_name", "description": "claymorphism_description", "prompt": "claymorphism_prompt" },
    { "id": "abstract-geometric", "name": "abstract_geometric_name", "description": "abstract_geometric_description", "prompt": "abstract_geometric_prompt" },
    { "id": "sustainable-green", "name": "sustainable_green_name", "description": "sustainable_green_description", "prompt": "sustainable_green_prompt" },
    { "id": "art-deco", "name": "art_deco_name", "description": "art_deco_description", "prompt": "art_deco_prompt" }
];

// --- Language Switching Logic ---
function translatePage(language, translationsToUse) {
    console.log(`[translatePage Called] Attempting to translate page to: ${language}`);
    console.log('Received translationsToUse:', JSON.parse(JSON.stringify(translationsToUse || {})));
    console.log('Current global currentLanguage before this translation:', currentLanguage);
    console.log('Global translations (originalGlobalTranslations) at translatePage start:', JSON.parse(JSON.stringify(originalGlobalTranslations)));
    if (typeof pageTranslations !== 'undefined') {
        console.log('Page-specific translations (pageTranslations) at translatePage start:', JSON.parse(JSON.stringify(pageTranslations)));
    }

    console.log("Attempting to translate page to:", language);

    if (!translationsToUse) {
        console.warn(`translationsToUse parameter was missing for language '${language}'. Attempting to fetch effective translations.`);
        translationsToUse = getEffectiveTranslations(language);
        if (Object.keys(translationsToUse).length === 0) {
            console.error(`Still no effective translations found for language '${language}' after attempting to fetch. Cannot translate.`);
            return;
        }
        console.log("Successfully fetched effective translations for", language);
    }
    
    currentLanguage = language; // Update global currentLanguage state
    document.documentElement.lang = currentLanguage;
    localStorage.setItem('preferredLanguage', currentLanguage);

    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        console.log(`Processing element for data-translate key: '${key}'`, element);
        if (translationsToUse[key]) {
            const translatedHtml = translationsToUse[key];
            try {
                if (element.children.length > 0 || /<[a-z][\s\S]*>/i.test(translatedHtml)) {
                    // Sanitize HTML by parsing it through a temporary element
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = translatedHtml;
                    element.innerHTML = tempDiv.innerHTML;
                } else {
                    element.textContent = translatedHtml;
                }
                console.log(`Successfully applied translation for key '${key}'.`);
            } catch (error) {
                console.error(`Error applying translation for key '${key}':`, error);
                console.error('Element:', element);
                console.error('Translated HTML:', translatedHtml);
            }
        } else {
            console.warn(`Translation key '${key}' not found in translationsToUse for language '${currentLanguage}'. Element content will not be changed.`);
        }
    });

    // Re-render homepage cards ONLY if on the homepage and renderHomepage is available
    // renderHomepage should internally use the correct translations for the currentLanguage
    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')) {
        if (typeof renderHomepage === 'function') {
            renderHomepage(); 
        } else {
            console.warn('renderHomepage function is not defined globally when trying to re-render homepage.');
        }
    } else {
        console.log("Language switched on a detail page. Homepage rendering skipped.");
    }
}

// Helper function to get the effective translations for a given language
function getEffectiveTranslations(language) {
    let effectiveTranslations = {};

    // Start with a deep copy of original global translations for the language
    if (originalGlobalTranslations && originalGlobalTranslations[language]) {
        effectiveTranslations = JSON.parse(JSON.stringify(originalGlobalTranslations[language]));
    } else {
        console.warn(`Original global translations not found for language: ${language}. Starting with empty object.`);
    }

    // Merge page-specific translations if they exist for the language
    if (typeof pageTranslations !== 'undefined' && pageTranslations[language]) {
        console.log(`Merging page-specific translations for: ${language}`);
        Object.assign(effectiveTranslations, pageTranslations[language]);
    } else {
        // console.log(`No page-specific translations to merge for language: ${language}`);
    }
    return effectiveTranslations;
}

function detectLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations && translations[savedLang]) {
        console.log("Using saved language:", savedLang);
        return savedLang;
    }
    const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage];
    console.log("Browser languages:", browserLangs);
    for (const lang of browserLangs) {
        const baseLang = lang.split('-')[0];
        if (translations && translations[baseLang]) {
            console.log("Detected supported browser language:", baseLang);
            return baseLang;
        }
    }
    console.log("No supported browser language detected. Defaulting to 'en'.");
    return 'en';
}

// Moved renderHomepage to global scope to be accessible by translatePage
function renderHomepage() {
    const homepageContainer = document.querySelector('#main-content.card-grid-container');
    if (!homepageContainer) {
        // console.info("Homepage container not found, likely a detail page.");
        return;
    }
    // renderHomepage should use the effective translations for the currentLanguage
    const translationsForHomepage = getEffectiveTranslations(currentLanguage);

    if (Object.keys(translationsForHomepage).length === 0) {
        console.error(`renderHomepage: Effective translations for ${currentLanguage} are empty or not available.`);
        homepageContainer.innerHTML = `<p class="error-message">Error: Language data missing for cards.</p>`;
        return;
    }

    if (!stylesData || stylesData.length === 0) {
         homepageContainer.innerHTML = `<p class="error-message">${translationsForHomepage.errorLoadingData || 'Failed to load style data.'}</p>`;
         return;
    }

    const cardsHtml = stylesData.map(style => {
        if (!style || !style.id || !style.name || !translationsForHomepage[style.name]) {
            // console.warn("Skipping style due to missing data or name translation in translationsForHomepage:", style.id);
            return '';
        }
        const zipUrl = `zips/${style.id}.zip`;
        const translatedName = translationsForHomepage[style.name];
        const translatedPromptText = translationsForHomepage[style.prompt] || 'Prompt translation missing.';
        const translatedPromptLabel = translationsForHomepage.promptLabel || 'Example Prompt:';
        const translatedViewDetails = translationsForHomepage.viewDetailsButton || 'View Details';
        const translatedApplyTheme = translationsForHomepage.applyThemeButton || 'Apply Theme';
        const escapedPromptText = translatedPromptText.replace(/"/g, '&quot;');

        return `
            <div class="card" data-style-id="${style.id}">
                <div class="card-content">
                    <h3>${translatedName}</h3>
                    <p class="prompt-label">${translatedPromptLabel}</p>
                    <p class="prompt-text" title="${escapedPromptText}">${translatedPromptText}</p>
                    <div class="card-buttons">
                        <a href="styles/${style.id}.html" class="btn btn-primary btn-view-details">${translatedViewDetails}</a>
                        <button class="btn btn-secondary btn-apply-theme" data-theme-id="${style.id}">${translatedApplyTheme}</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    homepageContainer.innerHTML = `<div class="card-grid">${cardsHtml}</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    // --- Determine initial language and get effective translations ---
    currentLanguage = detectLanguage(); // Sets global currentLanguage
    console.log("Initial currentLanguage after detectLanguage:", currentLanguage);
    const initialEffectiveTranslations = getEffectiveTranslations(currentLanguage);

    // --- Initial Page Translation ---
    translatePage(currentLanguage, initialEffectiveTranslations);

    // --- Call renderHomepage only if on the main index.html page ---
    // renderHomepage will now use getEffectiveTranslations internally for its content
    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')) {
        if (typeof renderHomepage === 'function') {
            renderHomepage(); 
        } else {
            console.warn('renderHomepage function is not defined, cannot render homepage cards initially.');
        }
    }

    // --- DOM Elements ---
    const currentYearSpan = document.getElementById('current-year');
    const languageSwitcherButton = document.getElementById('language-switcher');

    // stylesData is now defined in the global scope

    function applyTheme(themeId) {
        console.log("Applying theme:", themeId);
        const bodyClassList = document.body.classList;
        bodyClassList.forEach(className => {
            if (className.startsWith('theme-')) {
                bodyClassList.remove(className);
            }
        });
        if (themeId && themeId !== 'default') {
             bodyClassList.add(`theme-${themeId}`);
             localStorage.setItem('selectedTheme', themeId);
        } else {
             localStorage.removeItem('selectedTheme');
        }
    }

    function loadSavedTheme() {
        const bodyHasHardcodedTheme = Array.from(document.body.classList).some(cls => cls.startsWith('theme-'));
        if (bodyHasHardcodedTheme) {
            console.log("Body already has a theme class. Skipping loadSavedTheme().");
            return;
        }
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            // applyTheme('default'); // Or ensure default styles apply if no class is set
        }
    }

    // --- Event Listeners ---
    document.body.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('btn-apply-theme')) {
            event.preventDefault();
            const themeId = target.dataset.themeId;
            if (themeId) {
                applyTheme(themeId);
            }
        }
    });

    if (languageSwitcherButton) {
        languageSwitcherButton.addEventListener('click', () => {
            console.log('[Language Switcher Clicked]');
            const newLang = currentLanguage === 'en' ? 'zh' : 'en';
            console.log(`Current language: ${currentLanguage}, New language: ${newLang}`);
            
            console.log('Global translations (originalGlobalTranslations) before switch:', JSON.parse(JSON.stringify(originalGlobalTranslations)));
            if (typeof pageTranslations !== 'undefined') {
                console.log('Page-specific translations (pageTranslations) before switch:', JSON.parse(JSON.stringify(pageTranslations)));
            }

            const newEffectiveTranslations = getEffectiveTranslations(newLang);
            console.log('Effective translations for new language:', JSON.parse(JSON.stringify(newEffectiveTranslations)));
            
            translatePage(newLang, newEffectiveTranslations);
        });
    }

    // --- Initialization ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    loadSavedTheme();
    // const initialLang = detectLanguage(); // This was already done and currentLanguage is set
    // translatePage(currentLanguage, initialEffectiveTranslations); // This was already called earlier

    console.log("Page initialization complete.");
});