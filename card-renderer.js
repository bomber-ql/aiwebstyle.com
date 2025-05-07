// card-renderer.js

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
    { "id": "art-deco", "name": "art_deco_name", "description": "art_deco_description", "prompt": "art_deco_prompt" },
    { "id": "neomorphism", "name": "neomorphism_name", "description": "neomorphism_description", "prompt": "neomorphism_prompt" }
];

function renderHomepage() {
    const homepageContainer = document.querySelector('#main-content.card-grid-container');
    if (!homepageContainer) {
        // console.info("Homepage container not found, likely a detail page.");
        return;
    }
    // renderHomepage should use the effective translations for the currentLanguage
    // This function will need access to getEffectiveTranslations and currentLanguage, 
    // or have them passed as arguments.
    // For now, assuming they are globally available from language-manager.js
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