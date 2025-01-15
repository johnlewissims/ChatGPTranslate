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

    const enableDisableCheckbox = document.getElementById('enable-disable');

    // Load the saved state of the checkbox from chrome storage
    chrome.storage.local.get('enabled', (data) => {
        if (data.enabled !== undefined) {
            enableDisableCheckbox.checked = data.enabled;
        } else {
            // Set default to enabled if not set
            enableDisableCheckbox.checked = true;
            chrome.storage.local.set({ enabled: true });
        }
    });

    enableDisableCheckbox.addEventListener('change', () => {
        const isEnabled = enableDisableCheckbox.checked;
        chrome.storage.local.set({ enabled: isEnabled });
    });
});