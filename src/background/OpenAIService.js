import { getLanguageHint } from './LanguageDetection.js';
import SettingsService from './SettingsService.js';

class OpenAIService {
    constructor() {
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.ttsApiUrl = 'https://api.openai.com/v1/audio/speech';
    }

    async callOpenAI(messages) {
        const gptModel = await SettingsService.getGptModel();
        const apiKey = await SettingsService.getAPIKey();
        const maxTokens = await SettingsService.getMaxTokens();
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: gptModel,
                messages: messages,
                max_tokens: maxTokens
            })
        });

        const data = await response.json();
        if (response.ok) {
            const completionTokens = data.usage?.completion_tokens ?? '-';
            const promptTokens = data.usage?.prompt_tokens ?? '-';
            const totalTokens = data.usage?.total_tokens ?? '-';
            return data.choices[0].message.content.trim() + `\n(${gptModel}, tokens prompt:${promptTokens}, completion:${completionTokens}, total:${totalTokens})`;
        } else {
            throw new Error(data.error.message || 'Error fetching data from OpenAI');
        }
    }

    async getTextToSpeechDataUrl(text) {
        const apiKey = await SettingsService.getAPIKey();
        const response = await fetch(this.ttsApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'tts-1',
                voice: 'alloy',
                input: text
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error fetching text-to-speech audio');
        }

        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });

        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async translateText(text, languageCode = '') {
        const language = await SettingsService.getLanguage();
        const getDetailedTranslation = await SettingsService.getDetailedTranslation();
        const getTranslationAsHtml = getDetailedTranslation && await SettingsService.getTranslationAsHtml();
        let answerFormattingOption = '';
        if (getDetailedTranslation && text?.length < 50 && text.split(' ').length < 5) {
            const showAsHtmlText = getTranslationAsHtml ? 'Show the answer as HTML. ' : '';
            answerFormattingOption = `. Detect text language. Provide a translation to ${language}. Describe usage options in detected text language with explanation in ${language}. Add examples in the detected text language with translation to ${language}.${showAsHtmlText} Text`;
        }
        const languageHint = getLanguageHint(languageCode, language);
        const messages = [
            { role: 'system', content: 'You are a helpful assistant that translates text.' },
            { role: 'user', content: `Translate the following text ${languageHint} to ${language} ${answerFormattingOption}:\n\n"${text}"` }
        ];
        const result = await this.callOpenAI(messages);

        if (!getTranslationAsHtml) {
            return { translation: `<pre>${result}</pre>` || "Translation not available" };    
        }
        
        return { translation: result || "Translation not available" };
    }

    async fetchExplanation(text) {
        const language = await SettingsService.getLanguage();

        const messages = [
            { role: 'system', content: 'You are a helpful assistant that provides explanations.' },
            { role: 'user', content: `Provide a short explanation for the following text in ${language}: \n\n"${text}"` }
        ];
        const result = await this.callOpenAI(messages);
        return { explanation: result || "Explanation not available" };
    }
}

export default new OpenAIService();
