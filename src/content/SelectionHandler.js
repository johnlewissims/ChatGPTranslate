import TranslateIcon from './TranslateIcon.js';

class SelectionHandler {
    constructor() {
        this.selectedText = '';
    }

    init() {
        document.addEventListener('mouseup', () => {
            this.selectedText = window.getSelection().toString().trim();
            if (this.selectedText) {
                TranslateIcon.show();
            } else {
                TranslateIcon.hide();
            }
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
