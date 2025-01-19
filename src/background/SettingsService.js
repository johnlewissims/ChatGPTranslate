import { ErrorMessages } from '../constants/errorMessages';
import { DefaultSettings, Languages } from '../scripts/defaultSettings';

class SettingsService {
    /** Settings used by extension
     * but users can't set them directly on Settings page.*/
    innerSettings = {
        popupFavoriteLanguages: 'popupFavoriteLanguages',
    };

    async getGptModel() {
        const { gptModel = DefaultSettings.GptModel } = await new Promise(
            (resolve) => {
                chrome.storage.local.get(['gptModel'], resolve);
            },
        );
        return gptModel;
    }

    async getMaxTokens() {
        const { maxTokens } = await new Promise((resolve) => {
            chrome.storage.local.get(['maxTokens'], resolve);
        });

        if (isNaN(Number(maxTokens))) {
            return DefaultSettings.MaxTokens;
        }
        if (Number(maxTokens) >= 100) {
            return Number(maxTokens);
        }
        return DefaultSettings.MaxTokens;
    }

    async getTranslationAsHtml() {
        const { getTranslationAsHtml } = await new Promise((resolve) => {
            chrome.storage.local.get('getTranslationAsHtml', resolve);
        });

        if (!getTranslationAsHtml) {
            return false;
        }
        const maxTokens = await this.getMaxTokens();
        // If max_tokens is set to a value less than 300,
        // then generating HTML tags significantly reduces the quality of the response.
        return maxTokens >= DefaultSettings.MinTokensForHtmlAnswers;
    }

    async getAPIKey() {
        const { OPENAI_API_KEY } = await new Promise((resolve) => {
            chrome.storage.local.get('OPENAI_API_KEY', resolve);
        });

        if (!OPENAI_API_KEY) {
            throw new Error(ErrorMessages.APIKeyNotSet);
        }
        return OPENAI_API_KEY;
    }

    async getAlwaysDisplayExplanation() {
        const { alwaysDisplayExplanation } = await new Promise((resolve) => {
            chrome.storage.local.get('alwaysDisplayExplanation', resolve);
        });
        return !!alwaysDisplayExplanation;
    }

    async getLanguage() {
        const { language = DefaultSettings.Language } = await new Promise(
            (resolve) => {
                chrome.storage.local.get('language', resolve);
            },
        );

        return Languages[language] ?? DefaultSettings.Language;
    }

    async getDisplayTokens() {
        const { displayTokens } = await new Promise((resolve) => {
            chrome.storage.local.get('displayTokens', resolve);
        });
        return !!displayTokens;
    }

    async getPopupFavoriteLanguages() {
        const savedValues = await new Promise((resolve) => {
            chrome.storage.local.get(
                this.innerSettings.popupFavoriteLanguages,
                resolve,
            );
        });

        return savedValues[this.innerSettings.popupFavoriteLanguages] ?? {};
    }

    /**
     * Add new language into saved settings.
     *
     * @param {string} language language code, key of Languages.
     * @returns
     */
    async savePopupFavoriteLanguages(language) {
        if (!language) {
            return;
        }
        const savedLanguages = await this.getPopupFavoriteLanguages();
        savedLanguages[language] = 1 + (savedLanguages[language] ?? 0);
        chrome.storage.local.set(
            { [this.innerSettings.popupFavoriteLanguages]: savedLanguages },
            () => void 0,
        );
    }
}

export default new SettingsService();
