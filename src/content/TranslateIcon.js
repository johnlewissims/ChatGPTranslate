import CursorTracker from './CursorTracker.js';
import PopupManager from './PopupManager.js';

class TranslateIcon {
    constructor() {
        this.icon = null;
        this.iconDetailed = null;
    }

    init() { }

    show() {
        if (this.icon?.style?.display === 'block' || this.iconDetailed?.style?.display === 'block') {
            // It's a call triggered by the onClick event of one of the icons.
            return;
        }

        const { x, y, scrollX, scrollY } = CursorTracker.getPosition();
        const scrollXWithShift = scrollX + 16;
        if (!this.icon) {
            this.icon = document.createElement('img');
            this.icon.src = chrome.runtime.getURL('src/icons/icon.png');
            this.icon.style.position = 'absolute';
            this.icon.style.cursor = 'pointer';
            this.icon.style.zIndex = '10000';
            this.icon.style.width = '24px';
            this.icon.style.height = '24px';
            this.icon.style.margin = '0';
            this.icon.style.padding = '0';
            this.icon.style.backgroundColor = 'white';
            this.icon.style.borderRadius = '4px';
            this.icon.title = 'Translate';
            this.icon.title = 'Translate the selected text';
            this.icon.addEventListener('click', () => this.onClick());
            document.body.appendChild(this.icon);
            this.icon.style.top = `${y + scrollY}px`;
            this.icon.style.left = `${x + scrollXWithShift}px`;
        }

        if (this.icon.style.display !== 'block') {
            this.icon.style.top = `${y + scrollY}px`;
            this.icon.style.left = `${x + scrollXWithShift}px`;
        }

        this.icon.style.display = 'block';

        if (!this.iconDetailed) {
            this.iconDetailed = document.createElement('img');
            this.iconDetailed.src = chrome.runtime.getURL('src/icons/iconDetailedTranslation.png');
            this.iconDetailed.style.position = 'absolute';
            this.iconDetailed.style.cursor = 'pointer';
            this.iconDetailed.style.zIndex = '10000';
            this.iconDetailed.style.width = '24px';
            this.iconDetailed.style.height = '24px';
            this.iconDetailed.style.margin = '0';
            this.iconDetailed.style.padding = '0';
            this.iconDetailed.style.backgroundColor = 'white';
            this.iconDetailed.style.borderRadius = '4px';
            this.iconDetailed.title = 'Translate the selected text and provide usage options with examples.';
            this.iconDetailed.addEventListener('click', () => this.onClickDetailed());
            document.body.appendChild(this.iconDetailed);
            this.iconDetailed.style.top = `${y + scrollY}px`;
            this.iconDetailed.style.left = `${x + 32 + scrollXWithShift}px`;
        }
        if (this.iconDetailed.style.display !== 'block') {
            this.iconDetailed.style.top = `${y + scrollY}px`;
            this.iconDetailed.style.left = `${x + 32 + scrollXWithShift}px`;
        }
        this.iconDetailed.style.display = 'block';
    }

    hide() {
        if (this.icon) {
            this.icon.style.display = 'none';
        }
        if (this.iconDetailed) {
            this.iconDetailed.style.display = 'none';
        }
    }

    isVisible() {
        return this.icon && this.icon.style.display === 'block';
    }

    contains(target) {
        return (this.icon && this.icon.contains(target)) ||
            (this.iconDetailed && this.iconDetailed.contains(target));
    }

    onClick() {
        this.iconDetailed.style.display = 'none';
        this.icon.src = chrome.runtime.getURL('src/icons/loading-spinner.gif');
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        if (!selectedText) {
            return;
        }
        // if length of selected text is > 500, return error
        if (selectedText.length > 500) {
            alert('Selected text is too long. Please select less than 500 characters.');
            this.hide();
            this.icon.src = chrome.runtime.getURL('src/icons/icon.png');
            return;
        }
        // Try to get a language code from the nearest parent.
        let languageCode = '';
        let node = selection.anchorNode;
        while (!!node) {
            if (node.lang) {
                languageCode = node.lang;
                break
            }
            node = node.parentNode;
        }
        if (languageCode === '') {
            languageCode = document?.documentElement?.lang?.toUpperCase() ?? '';
        }
        const message = {
            action: 'translateAndExplain',
            text: selectedText,
            languageCode: languageCode,
        };
        chrome.runtime.sendMessage(message, (response) => {
            if (response.error) {
                alert('Error fetching translation.');
                console.error('Error:', response.error);
            } else {
                this.hide();
                this.icon.src = chrome.runtime.getURL('src/icons/icon.png');
                PopupManager.show(response.translation, selectedText);
            }
        });
    }

    onClickDetailed() {
        this.icon.style.display = 'none';
        this.iconDetailed.src = chrome.runtime.getURL('src/icons/loading-spinner.gif');
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        if (!selectedText) {
            return;
        }
        // if length of selected text is > 100, return error
        if (selectedText.length > 100) {
            alert('Selected text is too long. Please select less than 100 characters.');
            this.hide();
            this.iconDetailed.src = chrome.runtime.getURL('src/icons/iconDetailedTranslation.png');
            return;
        }
        // Try to get a language code from the nearest parent.
        let languageCode = '';
        let node = selection.anchorNode;
        while (!!node) {
            if (node.lang) {
                languageCode = node.lang;
                break
            }
            node = node.parentNode;
        }
        if (languageCode === '') {
            languageCode = document?.documentElement?.lang?.toUpperCase() ?? '';
        }
        const message = {
            action: 'translateDetailed',
            text: selectedText,
            languageCode: languageCode,
        };
        chrome.runtime.sendMessage(message, (response) => {
            if (response.error) {
                alert('Error fetching translation.');
                console.error('Error:', response.error);
            } else {
                this.hide();
                this.iconDetailed.src = chrome.runtime.getURL('src/icons/iconDetailedTranslation.png');
                PopupManager.show(response.translation, selectedText);
            }
        });
    }
}

export default new TranslateIcon();