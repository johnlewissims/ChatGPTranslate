document.addEventListener('DOMContentLoaded', () => {
    // Load and display the saved settings if they exist
    chrome.storage.local.get(['OPENAI_API_KEY', 'alwaysDisplayExplanation'], function (result) {
        if (result.OPENAI_API_KEY) {
            document.getElementById('api-key').value = result.OPENAI_API_KEY;
        }
        if (result.alwaysDisplayExplanation !== undefined) {
            document.getElementById('always-display-explanation').checked = result.alwaysDisplayExplanation;
        }
    });

    document.getElementById('settings-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const apiKey = document.getElementById('api-key').value;
        const alwaysDisplayExplanation = document.getElementById('always-display-explanation').checked;

        chrome.storage.local.set({
            OPENAI_API_KEY: apiKey,
            alwaysDisplayExplanation: alwaysDisplayExplanation
        }, function () {
            alert('Settings saved successfully!');
        });
    });
});
