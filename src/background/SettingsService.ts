import { ErrorMessages } from '@src/constants/errorMessages';
import {
    DefaultSettings,
    LanguageCodes,
    Languages,
} from '@src/scripts/defaultSettings';

type PopupFavoriteLanguages = { [Property in keyof typeof Languages]?: number };

type Settings = {
    gptModel?: string;
    maxTokens?: string;
    getTranslationAsHtml?: string;
    OPENAI_API_KEY?: string;
    language?: LanguageCodes;
    alwaysDisplayExplanation?: boolean;
    displayTokens?: boolean;
    popupFavoriteLanguages?: PopupFavoriteLanguages;
};

class SettingsService {
    /** Settings used by extension
     * but users can't set them directly on Settings page.*/
    innerSettings: { [key: string]: keyof Settings } = {
        popupFavoriteLanguages: 'popupFavoriteLanguages',
    };

    async getGptModel() {
        const { gptModel = DefaultSettings.GptModel } =
            await new Promise<Settings>((resolve) => {
                chrome.storage.local.get<Settings>(['gptModel'], resolve);
            });
        return gptModel;
    }

    async getMaxTokens() {
        const { maxTokens } = await new Promise<Settings>((resolve) => {
            chrome.storage.local.get<Settings>(['maxTokens'], resolve);
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
        const { getTranslationAsHtml } = await new Promise<Settings>(
            (resolve) => {
                chrome.storage.local.get<Settings>(
                    'getTranslationAsHtml',
                    resolve,
                );
            },
        );

        if (!getTranslationAsHtml) {
            return false;
        }
        const maxTokens = await this.getMaxTokens();
        // If max_tokens is set to a value less than 300,
        // then generating HTML tags significantly reduces the quality of the response.
        return maxTokens >= DefaultSettings.MinTokensForHtmlAnswers;
    }

    async getAPIKey() {
        const { OPENAI_API_KEY } = await new Promise<Settings>((resolve) => {
            chrome.storage.local.get<Settings>('OPENAI_API_KEY', resolve);
        });

        if (!OPENAI_API_KEY) {
            throw new Error(ErrorMessages.APIKeyNotSet);
        }
        return OPENAI_API_KEY;
    }

    async getAlwaysDisplayExplanation() {
        const { alwaysDisplayExplanation } = await new Promise<Settings>(
            (resolve) => {
                chrome.storage.local.get<Settings>(
                    'alwaysDisplayExplanation',
                    resolve,
                );
            },
        );
        return !!alwaysDisplayExplanation;
    }

    async getLanguage() {
        const { language = DefaultSettings.LanguageCode } =
            await new Promise<Settings>((resolve) => {
                chrome.storage.local.get<Settings>('language', resolve);
            });

        return Languages[language] ?? DefaultSettings.Language;
    }

    async getDisplayTokens() {
        const { displayTokens } = await new Promise<Settings>((resolve) => {
            chrome.storage.local.get<Settings>('displayTokens', resolve);
        });
        return !!displayTokens;
    }

    async getPopupFavoriteLanguages() {
        const savedValues = await new Promise<Settings>((resolve) => {
            chrome.storage.local.get<Settings>(
                this.innerSettings.popupFavoriteLanguages,
                resolve,
            );
        });

        return (
            (savedValues[
                this.innerSettings.popupFavoriteLanguages as keyof Settings
            ] as PopupFavoriteLanguages) ?? ({} as PopupFavoriteLanguages)
        );
    }

    /**
     * Add new language into saved settings.
     *
     * @param {string} language language code, key of Languages.
     * @returns
     */
    async savePopupFavoriteLanguages(language: keyof typeof Languages) {
        if (!language) {
            return;
        }
        const savedLanguages = await this.getPopupFavoriteLanguages();
        if (language in savedLanguages) {
            savedLanguages[language] = 1 + (savedLanguages[language] ?? 0);
        } else {
            savedLanguages[language] = 1;
        }

        chrome.storage.local.set(
            { [this.innerSettings.popupFavoriteLanguages]: savedLanguages },
            () => void 0,
        );
    }
}

export default new SettingsService();
