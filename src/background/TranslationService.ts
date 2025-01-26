import { Message } from '@src/content/PopupManager';

export type TranslationResponse = {
    error?: string;
    translation?: string;
    explanation?: string;
    audioDataUrl?: string;
} & Partial<Message>;

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
