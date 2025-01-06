import CursorTracker from './CursorTracker.js';
import PopupManager from './PopupManager.js';

class TranslateIcon {
    constructor() {
        this.icon = null;
    }

    init() { }

    show() {
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
            this.icon.addEventListener('click', () => this.onClick());
            document.body.appendChild(this.icon);
        }
        const { x, y, scrollX, scrollY } = CursorTracker.getPosition();
        this.icon.style.top = `${y + scrollY}px`;
        this.icon.style.left = `${x + scrollX}px`;
        this.icon.style.display = 'block';
    }

    hide() {
        if (this.icon) {
            this.icon.style.display = 'none';
        }
    }

    isVisible() {
        return this.icon && this.icon.style.display === 'block';
    }

    contains(target) {
        return this.icon && this.icon.contains(target);
    }

    onClick() {
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
}

export default new TranslateIcon();