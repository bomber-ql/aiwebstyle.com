// script.js (Multi-Page Version - Fix for Detail Page Theme Override)

// --- Global Variables & Configuration --- 
// currentLanguage, originalGlobalTranslations are now in language-manager.js
// translations object will be loaded from translations.js (global scope)
// pageTranslations object will be loaded from page-specific translation files (global scope)



// Language Switching Logic (translatePage, getEffectiveTranslations, detectLanguage) is now in language-manager.js



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