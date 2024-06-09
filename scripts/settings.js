document.addEventListener('DOMContentLoaded', () => {
    // Load and display the saved settings if they exist
    chrome.storage.local.get(['OPENAI_API_KEY', 'alwaysDisplayExplanation', 'alwaysDisplayBreakdown'], function(result) {
        if (result.OPENAI_API_KEY) {
            document.getElementById('api-key').value = result.OPENAI_API_KEY;
        }
        if (result.alwaysDisplayExplanation !== undefined) {
            document.getElementById('always-display-explanation').checked = result.alwaysDisplayExplanation;
        }
        if (result.alwaysDisplayBreakdown !== undefined) {
            document.getElementById('always-display-breakdown').checked = result.alwaysDisplayBreakdown;
        }
    });

    document.getElementById('settings-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const apiKey = document.getElementById('api-key').value;
        const alwaysDisplayExplanation = document.getElementById('always-display-explanation').checked;
        const alwaysDisplayBreakdown = document.getElementById('always-display-breakdown').checked;

        chrome.storage.local.set({ 
            OPENAI_API_KEY: apiKey, 
            alwaysDisplayExplanation: alwaysDisplayExplanation, 
            alwaysDisplayBreakdown: alwaysDisplayBreakdown 
        }, function() {
            alert('Settings saved successfully!');
        });
    });
});
