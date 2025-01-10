import { MessageActions } from '../constants/messageActions.js';
import CursorTracker from './CursorTracker.js';
import PopupManager from './PopupManager.js';

class TranslateIcon {
    MAX_LENGTH_TEXT_FOR_TRANSLATION = 500;
    MAX_LENGTH_TEXT_FOR_DETAILED_TRANSLATION = 40;
    ROW_GAP_BETWEEN_ICONS = 32;

    constructor() {
        this.icon = null;
        this.iconDetailed = null;
    }

    init() { }

    displayIconDetailed() {
        const selectedText = window.getSelection().toString().trim();
        return selectedText && selectedText.length <= this.MAX_LENGTH_TEXT_FOR_DETAILED_TRANSLATION
    }

    getLanguageCode(anchorNode) {
        // Try to get a language code from the nearest parent.
        let node = anchorNode;
        while (!!node) {
            if (node.lang) {
                return node.lang;
            }
            node = node.parentNode;
        }

        return document?.documentElement?.lang?.toUpperCase() ?? '';
    }

    createIcon() {
        const icon = document.createElement('img');
        icon.style.position = 'absolute';
        icon.style.cursor = 'pointer';
        icon.style.zIndex = '10000';
        icon.style.width = '24px';
        icon.style.height = '24px';
        icon.style.margin = '0';
        icon.style.padding = '0';
        icon.style.backgroundColor = 'white';
        icon.style.borderRadius = '4px';
        return icon;
    }

    show() {
        if (this.icon?.style?.display === 'block' || this.iconDetailed?.style?.display === 'block') {
            // It's a call triggered by the onClick event of one of the icons.
            return;
        }

        const { x, y, scrollX, scrollY } = CursorTracker.getPosition();
        const scrollXWithShift = scrollX + 16;
        if (!this.icon) {
            this.icon = this.createIcon();
            this.icon.src = chrome.runtime.getURL('src/icons/icon.png');
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
            this.iconDetailed = this.createIcon();
            this.iconDetailed.src = chrome.runtime.getURL('src/icons/iconDetailedTranslation.png');
            this.iconDetailed.title = 'Translate the selected text and provide usage options with examples.';
            this.iconDetailed.addEventListener('click', () => this.onClickDetailed());
            document.body.appendChild(this.iconDetailed);
            this.iconDetailed.style.top = `${y + scrollY}px`;
            this.iconDetailed.style.left = `${x + this.ROW_GAP_BETWEEN_ICONS + scrollXWithShift}px`;
        }
        if (this.iconDetailed.style.display !== 'block') {
            this.iconDetailed.style.top = `${y + scrollY}px`;
            this.iconDetailed.style.left = `${x + this.ROW_GAP_BETWEEN_ICONS + scrollXWithShift}px`;
        }

        if (this.displayIconDetailed()) {
            this.iconDetailed.style.display = 'block';
        }
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
        // if length of selected text is > this.MAX_LENGTH_TEXT_FOR_TRANSLATION, return error
        if (selectedText.length > this.MAX_LENGTH_TEXT_FOR_TRANSLATION) {
            alert(`Selected text is too long. Please select less than ${this.MAX_LENGTH_TEXT_FOR_TRANSLATION} characters.`);
            this.hide();
            this.icon.src = chrome.runtime.getURL('src/icons/icon.png');
            return;
        }
        const languageCode = this.getLanguageCode(selection.anchorNode);
        const message = {
            action: MessageActions.translateAndExplain,
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
                PopupManager.show({ ...message, translation: response.translation });
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
        if (selectedText.length > this.MAX_LENGTH_TEXT_FOR_DETAILED_TRANSLATION) {
            alert(`Selected text is too long. Please select less than ${this.MAX_LENGTH_TEXT_FOR_DETAILED_TRANSLATION} characters.`);
            this.hide();
            this.iconDetailed.src = chrome.runtime.getURL('src/icons/iconDetailedTranslation.png');
            return;
        }
        const languageCode = this.getLanguageCode(selection.anchorNode);
        const message = {
            action: MessageActions.translateDetailed,
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
                PopupManager.show({ ...message, translation: response.translation });
            }
        });
    }
}

export default new TranslateIcon();