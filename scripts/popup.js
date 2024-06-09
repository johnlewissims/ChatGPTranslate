document.addEventListener('DOMContentLoaded', () => {
    // Dynamically set the link to the settings page
    const settingsLink = document.getElementById('settings-link');
    settingsLink.href = chrome.runtime.getURL('views/settings.html');

    chrome.storage.local.get(['translation', 'explanation', 'OPENAI_API_KEY'], data => {
        const apiKey = data.OPENAI_API_KEY;
        if (!apiKey) {
            document.getElementById('instruction').style.display = 'block';
            document.getElementById('translation-section').style.display = 'none';
            document.getElementById('explanation-section').style.display = 'none';
        } else {
            document.getElementById('instruction').style.display = 'none';
            document.getElementById('translation-section').style.display = 'block';
            document.getElementById('explanation-section').style.display = 'block';
            document.getElementById('translation').textContent = data.translation || 'No translation available';
            document.getElementById('explanation').textContent = data.explanation || 'No explanation available';
        }
    });
});