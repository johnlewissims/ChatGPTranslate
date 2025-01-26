import { clearAllChild, createOptions } from '@src/HtmlFunc/options';
import { DefaultSettings, LanguageCodes, Languages } from './defaultSettings';
import { getVersion } from '@src/content/chrome';

let gptModelsForOptions: { [Property: string]: string } = {
    'gpt-4o': 'gpt-4o',
    'gpt-4o-mini': 'gpt-4o-mini',
};

const updateGptModelAttributeDisabled = () => {
    document
        .getElementById('gpt-model')
        ?.toggleAttribute(
            'disabled',
            Object.keys(gptModelsForOptions).length === 0,
        );
};

const loadAllGptModels = async () => {
    const savedValue = (
        document.getElementById('gpt-model') as HTMLSelectElement
    )?.value;
    const apiKeyElement = document.getElementById(
        'api-key',
    ) as HTMLInputElement;
    if (!apiKeyElement.value) {
        alert('OpenAI API Key is empty!');
        apiKeyElement.focus();
    }

    const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKeyElement.value}`,
        },
    });

    const data = await response.json();
    if (response.ok) {
        gptModelsForOptions = {};
        for (const model of data.data) {
            gptModelsForOptions[model.id] = model.id;
        }
        clearAllChild('gpt-model');
        createOptions('gpt-model', gptModelsForOptions);
    } else {
        const err = data.error.message || 'Error fetching data from OpenAI';
        alert(err);
        throw new Error(err);
    }

    (document.getElementById('gpt-model') as HTMLSelectElement).value =
        savedValue;
};

document.addEventListener('DOMContentLoaded', () => {
    // Load and display the saved settings if they exist
    chrome.storage.local.get(
        [
            'OPENAI_API_KEY',
            'alwaysDisplayExplanation',
            'language',
            'gptModel',
            'maxTokens',
            'getTranslationAsHtml',
            'displayTokens',
        ],
        function (result) {
            const model = document.getElementById(
                'gpt-model',
            ) as HTMLSelectElement;
            model.value = result.gptModel ?? DefaultSettings.GptModel;
            if (result.OPENAI_API_KEY) {
                (document.getElementById('api-key') as HTMLInputElement).value =
                    result.OPENAI_API_KEY;
                loadAllGptModels();
            }
            (
                document.getElementById(
                    'always-display-explanation',
                ) as HTMLInputElement
            ).checked = !!result.alwaysDisplayExplanation;
            (
                document.getElementById(
                    'get-translation-as-html',
                ) as HTMLInputElement
            ).checked = !!result.getTranslationAsHtml;
            (document.getElementById('language') as HTMLInputElement).value =
                result.language ?? DefaultSettings.Language;
            (document.getElementById('max-tokens') as HTMLInputElement).value =
                result.maxTokens ?? DefaultSettings.MaxTokens;
            (
                document.getElementById('display-tokens') as HTMLInputElement
            ).checked = !!result.displayTokens;
            updateGptModelAttributeDisabled();
        },
    );

    document
        .getElementById('settings-form')
        ?.addEventListener('submit', function (event) {
            event.preventDefault();

            const apiKey = (
                document.getElementById('api-key') as HTMLInputElement
            ).value;
            const alwaysDisplayExplanation = (
                document.getElementById(
                    'always-display-explanation',
                ) as HTMLInputElement
            ).checked;
            const getTranslationAsHtml = (
                document.getElementById(
                    'get-translation-as-html',
                ) as HTMLInputElement
            ).checked;
            let language = (
                document.getElementById('language') as HTMLSelectElement
            ).value;
            if (language.trim() === '') {
                language = 'en';
            } else if (
                language in Languages &&
                !Languages[language as LanguageCodes]
            ) {
                language = 'en';
            }

            const gptModel = (
                document.getElementById('gpt-model') as HTMLSelectElement
            ).value;
            const maxTokens = (
                document.getElementById('max-tokens') as HTMLInputElement
            ).value;
            const displayTokens = (
                document.getElementById('display-tokens') as HTMLInputElement
            ).checked;

            const values = {
                OPENAI_API_KEY: apiKey,
                language: language,
                gptModel: gptModel,
                alwaysDisplayExplanation: alwaysDisplayExplanation,
                maxTokens: maxTokens,
                getTranslationAsHtml: getTranslationAsHtml,
                displayTokens: displayTokens,
            };
            chrome.storage.local.set(values, function () {
                alert('Settings saved successfully!');
                if (event?.submitter?.id === 'save-and-close') {
                    window.close();
                }
            });
        });

    (document.getElementById('api-key') as HTMLInputElement).addEventListener(
        'input',
        updateGptModelAttributeDisabled,
    );
    (
        document.getElementById('load-all-gpt-models') as HTMLButtonElement
    ).addEventListener('click', loadAllGptModels);
    createOptions('language', Languages);
    createOptions('gpt-model', gptModelsForOptions);
    document.getElementById('version')!.innerText =
        `Plugin version: ${getVersion()}`;
});
