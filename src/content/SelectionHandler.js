import TranslateIcon from './TranslateIcon.js';

class SelectionHandler {
    constructor() {
        this.selectedText = '';
        this.isExtensionContextDestroyed = false;
    }

    init() {
        document.addEventListener('mouseup', () => {
            if (this.isExtensionContextDestroyed) {
                // A user must reload the page to reactivate the extension.
                return;
            }
            try {
                chrome.storage.local.get('enabled', () => void (0));
            } catch (error) {
                this.isExtensionContextDestroyed = true;
                return;
            }
            chrome.storage.local.get('enabled', (data) => {
                this.selectedText = window.getSelection().toString().trim();
                if (this.selectedText && data.enabled) {
                    TranslateIcon.show();
                } else {
                    TranslateIcon.hide();
                }
            });
        });

        document.addEventListener('mousedown', (event) => {
            if (TranslateIcon.isVisible() && !TranslateIcon.contains(event.target)) {
                TranslateIcon.hide();
            }
        });
    }

    getSelectedText() {
        return this.selectedText;
    }
}

export default new SelectionHandler();
