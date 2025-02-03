import { TranslationResponse } from './TranslationResponse';

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
    handleTranslation(
        message: unknown,
        callback: (response: TranslationResponse) => void,
    ) {
        chrome.runtime.sendMessage(message, callback);
    }
}

export default new TranslationService();
