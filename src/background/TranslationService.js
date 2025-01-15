class TranslationService {

    /**
     * Get translation.
     * @param {MessageActions} action
     * @param {string} text
     * @param {keyof Languages} languageCode - language code
     * @param {(response) => void} callback - chrome sendMessage callback.
     */
    handleTranslation(action, text, languageCode, callback) {
        const message = {
            action,
            text,
            languageCode,
        };
        chrome.runtime.sendMessage(message, callback);
    }
}

export default new TranslationService();