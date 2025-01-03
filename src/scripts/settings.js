document.addEventListener('DOMContentLoaded', () => {
    // Load and display the saved settings if they exist
    chrome.storage.local.get(['OPENAI_API_KEY', 'alwaysDisplayExplanation', 'getTranslationAsHTML', 'language', 'gptModel'], function (result) {
        if (result.OPENAI_API_KEY) {
            document.getElementById('api-key').value = result.OPENAI_API_KEY;
        }
        if (result.alwaysDisplayExplanation !== undefined) {
            document.getElementById('always-display-explanation').checked = result.alwaysDisplayExplanation;
        }
        if (result.getTranslationAsHTML !== undefined) {
            document.getElementById('get-translation-as-html').checked = result.getTranslationAsHTML;
        }
        document.getElementById('language').value = result.language ?? 'English';
        document.getElementById('gpt-model').value = result.gptModel ?? 'gpt-4o';
    });

    document.getElementById('settings-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const apiKey = document.getElementById('api-key').value;
        const alwaysDisplayExplanation = document.getElementById('always-display-explanation').checked;
        const getTranslationAsHTML = document.getElementById('get-translation-as-html').checked;
        const language = document.getElementById('language').value;
        if (language.trim() === "") {
            language = 'English';
        }
        const gptModel = document.getElementById('gpt-model').value;

        chrome.storage.local.set({
            OPENAI_API_KEY: apiKey,
            getTranslationAsHTML: getTranslationAsHTML,
            language: language,
            gptModel: gptModel,
            alwaysDisplayExplanation: alwaysDisplayExplanation
        }, function () {
            alert('Settings saved successfully!');
        });
    });
});
