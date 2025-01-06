import { Languages} from '../scripts/defaultSettings'

const populateLanguageHintTemplateWithValue = (value) => {
    const languageHintTemplate = 'from {0}';
    return languageHintTemplate.replace('{0}', value);
}

const getLanguageHint = (languageCode = '') => {
    console.log('language code: ', languageCode)
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
            return populateLanguageHintTemplateWithValue(language);
        }
    }
    return '';
}

export { getLanguageHint }