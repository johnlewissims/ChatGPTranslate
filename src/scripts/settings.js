import { DefaultSettings, Languages } from './defaultSettings.js'

let gptModelsForOptions = {
    "gpt-4o": 'gpt-4o',
    "gpt-4o-mini": 'gpt-4o-mini',
}

const updateGptModelAttributeDisabled = () => {
    document.getElementById('gpt-model').toggleAttribute("disabled", Object.keys(gptModelsForOptions).length === 0);
}

const createOptions = (selectElementId, optionsAsObjectWithKeyValue) => {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) {
        return;
    }

    for (const pair of Object.entries(optionsAsObjectWithKeyValue)) {
        const option = document.createElement('option');
        option.value = pair[0];
        option.text = pair[1];
        selectElement.appendChild(option)
    }
}

const clearAllChild = (selectElementId) => {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) {
        return;
    }

    while (selectElement.firstChild) {
        selectElement.firstChild.remove()
    }    
}

const loadAllGptModels = async () => {
    const savedValue = document.getElementById('gpt-model').value;
    const apiKeyElement = document.getElementById('api-key');
    if (!apiKeyElement.value) {
        alert("OpenAI API Key is empty!");
        apiKeyElement.focus();
    }

    const response = await fetch("https://api.openai.com/v1/models", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKeyElement.value}`
        }
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
        alert(err)
        throw new Error(err);
    }

    document.getElementById('gpt-model').value = savedValue;
}

document.addEventListener('DOMContentLoaded', () => {
    // Load and display the saved settings if they exist
    chrome.storage.local.get([
        'OPENAI_API_KEY',
        'alwaysDisplayExplanation',
        'language',
        'gptModel',
        'maxTokens',
        'getTranslationAsHtml',
        'displayTokens'
    ], function (result) {
        const model = document.getElementById('gpt-model');
        model.value = result.gptModel ?? DefaultSettings.gptModel;
        if (result.OPENAI_API_KEY) {
            document.getElementById('api-key').value = result.OPENAI_API_KEY;
            loadAllGptModels();
        }
        document.getElementById('always-display-explanation').checked = !!result.alwaysDisplayExplanation;
        document.getElementById('get-translation-as-html').checked = !!result.getTranslationAsHtml;
        document.getElementById('language').value = result.language ?? DefaultSettings.language;
        document.getElementById('max-tokens').value = result.maxTokens ?? DefaultSettings.MaxTokens;
        document.getElementById('display-tokens').checked = !!result.displayTokens;
        updateGptModelAttributeDisabled();
    });

    document.getElementById('settings-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const apiKey = document.getElementById('api-key').value;
        const alwaysDisplayExplanation = document.getElementById('always-display-explanation').checked;
        const getTranslationAsHtml = document.getElementById('get-translation-as-html').checked;
        const language = document.getElementById('language').value;
        if (language.trim() === "") {
            language = 'en';
        } else if (!Languages[language]) {
            language = 'en';
        }

        const gptModel = document.getElementById('gpt-model').value;
        const maxTokens = document.getElementById('max-tokens').value;
        const displayTokens = document.getElementById('display-tokens').checked;

        const values = {
            OPENAI_API_KEY: apiKey,
            language: language,
            gptModel: gptModel,
            alwaysDisplayExplanation: alwaysDisplayExplanation,
            maxTokens: maxTokens,
            getTranslationAsHtml: getTranslationAsHtml,
            displayTokens: displayTokens
        }
        chrome.storage.local.set(values, function () {
            alert('Settings saved successfully!');
        });
    });

    document.getElementById('api-key').addEventListener('input', updateGptModelAttributeDisabled);
    document.getElementById('load-all-gpt-models').addEventListener('click', loadAllGptModels);
    createOptions('language', Languages);
    createOptions('gpt-model', gptModelsForOptions);
});
