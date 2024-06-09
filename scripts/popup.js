document.addEventListener('DOMContentLoaded', () => {
    const settingsLinks = document.querySelectorAll('.settings-link');
    settingsLinks.forEach(link => {
        link.href = chrome.runtime.getURL('views/settings.html');
    });

    chrome.storage.local.get(['translation', 'explanation', 'OPENAI_API_KEY'], data => {
        const apiKey = data.OPENAI_API_KEY;
        if (!apiKey) {
            document.getElementById('instruction-key').style.display = 'block';
            document.getElementById('instruction-general').style.display = 'none';
        } else {
            document.getElementById('instruction-key').style.display = 'none';
            document.getElementById('instruction-general').style.display = 'block';
        }
    });
});