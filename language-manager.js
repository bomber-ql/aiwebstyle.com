// language-manager.js

let currentLanguage = 'en'; // Default to English
let originalGlobalTranslations = {}; // To store a pristine copy of global translations

// Deep copy initial global translations if available
// translations object will be loaded from translations.js (global scope)
if (typeof translations !== 'undefined') {
    originalGlobalTranslations = JSON.parse(JSON.stringify(translations));
} else {
    console.error("Global 'translations' object is not defined at the time of originalGlobalTranslations initialization.");
}

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

function getEffectiveTranslations(language) {
    let effectiveTranslations = {};

    // Start with a deep copy of original global translations for the language
    if (originalGlobalTranslations && originalGlobalTranslations[language]) {
        effectiveTranslations = JSON.parse(JSON.stringify(originalGlobalTranslations[language]));
    } else {
        console.warn(`Original global translations not found for language: ${language}. Starting with empty object.`);
    }

    // Merge page-specific translations if they exist for the language
    // pageTranslations will be available in global scope if a page-specific translation file is loaded
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
    // translations will be available in global scope from translations.js
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