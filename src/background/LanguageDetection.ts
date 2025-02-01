import { Languages } from '@src/scripts/defaultSettings';

/**
 * Get language name by its code.
 *
 * @param {string} languageCode it's a key of Languages.
 * @returns {string}
 */
export const getLanguage = (languageCode = ''): string => {
    if (!languageCode) {
        return '';
    }
    let codeOnly = '';
    if (languageCode.length === 2) {
        codeOnly = languageCode.toLocaleLowerCase();
    } else if (languageCode.indexOf('-') >= 0) {
        codeOnly = languageCode.split('-')[0]?.toLocaleLowerCase() ?? '';
    }
    if (codeOnly && codeOnly in Languages) {
        return Languages[codeOnly as keyof typeof Languages] ?? '';
    }
    return '';
};

/**
 * Get source text language.
 *
 * @param {string} languageCode it's a key of Languages.
 * @param {string} targetLanguage language name. It's a value of Languages.
 * @returns {string}
 */
export const getLanguageHint = (
    languageCode = '',
    targetLanguage = '',
): string => {
    if (!languageCode) {
        return '';
    }
    const language = getLanguage(languageCode);
    if (language) {
        if (
            language.toLocaleLowerCase() === targetLanguage.toLocaleLowerCase()
        ) {
            return '';
        }
        return language;
    }
    return '';
};
