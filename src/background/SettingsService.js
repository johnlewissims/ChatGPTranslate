import { DefaultSettings , Languages} from '../scripts/defaultSettings'

class SettingsService { 

    async getGptModel() {
        const { gptModel = DefaultSettings.GptModel } = await new Promise((resolve) => {
            chrome.storage.local.get(['gptModel'], resolve);
        });
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
            return Number(maxTokens)
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
        const maxTokens  = await this.getMaxTokens()
        // If max_tokens is set to a value less than 300,
        // then generating HTML tags significantly reduces the quality of the response.
        return maxTokens >= DefaultSettings.MinTokensForHtmlAnswers;
    }

    async getAPIKey() {
        const { OPENAI_API_KEY } = await new Promise((resolve) => {
            chrome.storage.local.get('OPENAI_API_KEY', resolve);
        });

        if (!OPENAI_API_KEY) {
            throw new Error('API Key not set');
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
        const { language } = await new Promise((resolve) => {
            chrome.storage.local.get('language', resolve);
        });
        
        if (!language) {
            language = DefaultSettings.Language;
        }
        return Languages[language] ?? DefaultSettings.Language;
    }

    async getDisplayTokens() {
        const { displayTokens } = await new Promise((resolve) => {
            chrome.storage.local.get('displayTokens', resolve);
        });
        return !!displayTokens;
    }
}

export default new SettingsService();