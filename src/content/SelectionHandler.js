import TranslateIcon from './TranslateIcon.js';

class SelectionHandler {
    constructor() {
        this.selectedText = '';
    }

    init() {
        document.addEventListener('mouseup', () => {
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
