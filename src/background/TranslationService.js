class TranslationService {
    /**
     * Get translation.
     * @param {{
     * action: string,
     * text: string,
     * languageCode?: keyof Languages,
     * isDetailed?: boolean }} message
     * @param {(response) => void} callback - chrome sendMessage callback.
     */
    handleTranslation(message, callback) {
        chrome.runtime.sendMessage(message, callback);
    }
}

export default new TranslationService();
