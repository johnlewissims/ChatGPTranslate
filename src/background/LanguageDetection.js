import { Languages} from '../scripts/defaultSettings'

const getLanguageHint = (languageCode = '', targetLanguage = '') => {
    if (!languageCode) {
        return ''
    }
    let codeOnly = ''
    if (languageCode.length === 2) {
        codeOnly = languageCode.toLocaleLowerCase();
    } else if (languageCode.indexOf('-') >= 0) {
        codeOnly = languageCode.split('-')[0]?.toLocaleLowerCase() ?? '';
    }
    if (codeOnly) {
        const language = Languages[codeOnly];
        if (language) {
            if (language.toLocaleLowerCase() === targetLanguage.toLocaleLowerCase()) {
                return ''
            }
            return language;
        }
    }
    return '';
}

export { getLanguageHint }