class OpenAIService {
    constructor() {
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.ttsApiUrl = 'https://api.openai.com/v1/audio/speech';
    }

    async getGptModel() {
        const { gptModel = 'gpt-4o' } = await new Promise((resolve) => {
            chrome.storage.local.get(['gptModel'], resolve);
        });

        return gptModel;
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

    async callOpenAI(messages) {
        const gptModel = await this.getGptModel();
        const apiKey = await this.getAPIKey();
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: gptModel,
                messages: messages,
                max_tokens: 100
            })
        });

        const data = await response.json();
        if (response.ok) {
            return data.choices[0].message.content.trim() + ` (${gptModel})`;
        } else {
            throw new Error(data.error.message || 'Error fetching data from OpenAI');
        }
    }

    async getTextToSpeechDataUrl(text) {
        const apiKey = await this.getAPIKey();
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
        const { getTranslationAsHTML, language = 'English' } = await new Promise((resolve) => {
            chrome.storage.local.get(['getTranslationAsHTML', 'language'], resolve);
        });
        let answerFormattingOption = '';
        if (getTranslationAsHTML && text?.length < 50 && text.split(' ').length < 5) {
            answerFormattingOption = `. Detect text language. Provide a translation to ${language}. Describe usage options in detected text language with explanation in ${language}. Add examples in the detected text language with translation to ${language}. Show the answer as HTML. Text`;
        }
        const languageHint = !languageCode ? '' : `from ${languageCode}`;
        const messages = [
            { role: 'system', content: 'You are a helpful assistant that translates text.' },
            { role: 'user', content: `Translate the following text ${languageHint} to ${language} ${answerFormattingOption}:\n\n"${text}"` }
        ];
        const result = await this.callOpenAI(messages);
        return { translation: result || "Translation not available" };
    }

    async fetchExplanation(text) {
        const { language } = await new Promise((resolve) => {
            chrome.storage.local.get(['language'], resolve);
        });

        const messages = [
            { role: 'system', content: 'You are a helpful assistant that provides explanations.' },
            { role: 'user', content: `Provide a short explanation for the following text in ${language}: \n\n"${text}"` }
        ];
        const result = await this.callOpenAI(messages);
        return { explanation: result || "Explanation not available" };
    }
}

export default new OpenAIService();
