import { getURL, getVersion } from '../content/chrome';

document.addEventListener('DOMContentLoaded', () => {
    const settingsLinks = document.querySelectorAll(
        '.settings-link',
    ) as NodeListOf<HTMLLinkElement>;
    settingsLinks.forEach((link) => {
        link.href = getURL('views/settings.html');
    });

    const chatLink = document.getElementById(
        'link-to-chat-with-GPT',
    ) as HTMLLinkElement;
    if (chatLink) {
        chatLink.href = getURL('views/chat.html');
    }

    chrome.storage.local.get(
        ['translation', 'explanation', 'OPENAI_API_KEY'],
        (data) => {
            const apiKey = data.OPENAI_API_KEY;
            if (!apiKey) {
                const instructionKey =
                    document.getElementById('instruction-key');
                if (instructionKey) {
                    instructionKey.style.display = 'block';
                }
                const instructionGeneral = document.getElementById(
                    'instruction-general',
                );
                if (instructionGeneral) {
                    instructionGeneral.style.display = 'none';
                }
            } else {
                const instructionKey =
                    document.getElementById('instruction-key');
                if (instructionKey) {
                    instructionKey.style.display = 'none';
                }
                const instructionGeneral = document.getElementById(
                    'instruction-general',
                );
                if (instructionGeneral) {
                    instructionGeneral.style.display = 'block';
                }
            }
        },
    );

    const enableDisableCheckbox = document.getElementById(
        'enable-disable',
    ) as HTMLInputElement;

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

    document.getElementById('version')!.innerText = `v. ${getVersion()}`;
});
