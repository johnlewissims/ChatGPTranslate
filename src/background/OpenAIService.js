import { getLanguage, getLanguageHint } from './LanguageDetection.js';
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
        const displayTokens = !!(await SettingsService.getDisplayTokens());
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: gptModel,
                messages: messages,
                max_tokens: maxTokens,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            const completionTokens = data.usage?.completion_tokens ?? '-';
            const promptTokens = data.usage?.prompt_tokens ?? '-';
            const totalTokens = data.usage?.total_tokens ?? '-';
            const usedTokensAndModel = displayTokens
                ? `\n(${gptModel}, tokens prompt:${promptTokens}, completion:${completionTokens}, total:${totalTokens})`
                : '';
            return data.choices[0].message.content.trim() + usedTokensAndModel;
        } else {
            throw new Error(
                data.error.message || 'Error fetching data from OpenAI',
            );
        }
    }

    async getTextToSpeechDataUrl(text) {
        const apiKey = await SettingsService.getAPIKey();
        const response = await fetch(this.ttsApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'tts-1',
                voice: 'alloy',
                input: text,
            }),
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

    canRequestDetailDescription(text) {
        return text && text?.length < 50 && text.split(' ').length < 5;
    }

    /**
     * Get set of instructions for GPT how to translate text.
     *
     * @param {string} language target language from settings.
     * @param {string} isDetailedTranslation type of translation short/detailed.
     * @param {string} userDefinedLanguage source language was defined by user.
     * @returns {[{role:string, content:string}]}
     */
    getOutBlocksMessages(
        language,
        isDetailedTranslation = false,
        userDefinedLanguage = '',
    ) {
        if (isDetailedTranslation) {
            if (userDefinedLanguage) {
                return [
                    { role: 'user', content: 'Output must contain 4 blocks.' },
                    {
                        role: 'user',
                        content: `1: Detected language is ${userDefinedLanguage}.`,
                    },
                    {
                        role: 'user',
                        content: `2: Translation from ${userDefinedLanguage} to ${language}.`,
                    },
                    {
                        role: 'user',
                        content: `3: Description of the options for using the text in ${language}.`,
                    },
                    {
                        role: 'user',
                        content: `4: Three examples with text in ${userDefinedLanguage} language with translation to ${language}.`,
                    },
                    {
                        role: 'user',
                        content: `Block headers must be in ${language}}.`,
                    },
                ];
            } else {
                return [
                    { role: 'user', content: 'Output must contain 4 blocks.' },
                    { role: 'user', content: '1: Detected language.' },
                    { role: 'user', content: `2: Translation to ${language}.` },
                    {
                        role: 'user',
                        content: `3: Description of the options for using the text in ${language}.`,
                    },
                    {
                        role: 'user',
                        content: `4: Three examples with text in detected language with translation to ${language}.`,
                    },
                    {
                        role: 'user',
                        content: `Block headers must be in ${language}}.`,
                    },
                ];
            }
        }

        if (userDefinedLanguage) {
            return [
                { role: 'user', content: 'Output must contain 2 blocks.' },
                {
                    role: 'user',
                    content: `1: Detected language is ${userDefinedLanguage}.`,
                },
                {
                    role: 'user',
                    content: `2: Translation from ${userDefinedLanguage} to ${language}}.`,
                },
                {
                    role: 'user',
                    content: `Block headers must be in ${language}}.`,
                },
            ];
        }

        return [
            { role: 'user', content: 'Output must contain 2 blocks.' },
            { role: 'user', content: '1: Detected language.' },
            { role: 'user', content: `2: Translation to ${language}}.` },
            { role: 'user', content: `Block headers must be in ${language}}.` },
        ];
    }

    /**
     * Get hint for GPT about source language.
     *
     * @param {string} languageCode - source language code, was defined by HTML attributes.
     * @param {string} userDefinedLanguage - source language, was defined by user.
     * @param {string} language target language from settings.
     * @returns {[{role:string, content:string}]}
     */
    getLanguageHintMessage(languageCode, userDefinedLanguage, language) {
        const languageHint = getLanguageHint(languageCode, language);
        if (!userDefinedLanguage) {
            return languageHint
                ? [
                      {
                          role: 'user',
                          content: `I think this text in ${languageHint} language.`,
                      },
                  ]
                : [];
        }

        return [
            {
                role: 'system',
                content: `Translate text from ${userDefinedLanguage} to ${language}.`,
            },
        ];
    }

    /**
     * Get GPT instructions that depend on userDefinedLanguage.
     *
     * @param {string} userDefinedLanguage - source language, was defined by user.
     * @param {string} language target language from settings.
     * @returns {[{role:string, content:string}]}
     */
    getDetectLanguageInstruction(userDefinedLanguage, language) {
        return userDefinedLanguage
            ? []
            : [
                  { role: 'system', content: `User language is ${language}.` },
                  { role: 'system', content: 'Detect text language.' },
              ];
    }

    /**
     * Translate text.
     *
     * @param {string} text selected text on web page.
     * @param {string} languageCode key of Languages.
     * @param {boolean} isDetailedTranslation
     * @param {string} userDefinedLanguageCode key of Languages.
     *
     * @returns {string} translation in plain text or HTML.
     */
    async translateText(
        text,
        languageCode = '',
        isDetailedTranslation = false,
        userDefinedLanguageCode = '',
    ) {
        const language = await SettingsService.getLanguage();
        const userDefinedLanguage = getLanguage(userDefinedLanguageCode);
        const isTranslationAsHtml =
            await SettingsService.getTranslationAsHtml();
        const outputBlocksDescription = this.getOutBlocksMessages(
            language,
            isDetailedTranslation,
            userDefinedLanguage,
        );
        const languageHintMessage = this.getLanguageHintMessage(
            languageCode,
            userDefinedLanguage,
            language,
        );

        const detectLanguageInstruction = this.getDetectLanguageInstruction(
            userDefinedLanguage,
            language,
        );
        const messages = [
            {
                role: 'system',
                content: 'You are a helpful assistant that translates text.',
            },
            ...detectLanguageInstruction,
            ...languageHintMessage,
            { role: 'user', content: `Output must be in ${language}.` },
            ...outputBlocksDescription,
            { role: 'user', content: `Text:\n\n"${text}"` },
        ];

        if (isTranslationAsHtml) {
            messages.push({
                role: 'user',
                content: `Output must be in HTML without <head> and <body> tags.`,
            });
        }
        let result = await this.callOpenAI(messages);
        if (!isTranslationAsHtml) {
            return {
                translation: `<pre>${result || 'Translation not available'}</pre>`,
            };
        } else if (result.startsWith('```html')) {
            result = result.replace('```html\n', '').replace('\n```', '\n');
        }

        return { translation: result || 'Translation not available' };
    }

    async fetchExplanation(text) {
        const language = await SettingsService.getLanguage();

        const messages = [
            {
                role: 'system',
                content:
                    'You are a helpful assistant that provides explanations.',
            },
            {
                role: 'user',
                content: `Provide a short explanation for the following text in ${language}: \n\n"${text}"`,
            },
        ];
        const result = await this.callOpenAI(messages);
        return { explanation: result || 'Explanation not available' };
    }
}

export default new OpenAIService();
