import TranslateIcon from './TranslateIcon';
import SelectionService from '@src/background/SelectionService';

class SelectionHandler {
    private selectedText: string;
    private isExtensionContextDestroyed: boolean;

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
                chrome.storage.local.get('enabled', () => void 0);
            } catch {
                this.isExtensionContextDestroyed = true;
                return;
            }
            if (!SelectionService.getSelectedText()) {
                return;
            }
            chrome.storage.local.get('enabled', (data) => {
                this.selectedText = SelectionService.getSelectedText() ?? '';
                if (this.selectedText && data.enabled) {
                    TranslateIcon.show();
                } else {
                    TranslateIcon.hide();
                }
            });
        });

        document.addEventListener('mousedown', (event) => {
            if (
                TranslateIcon.isVisible() &&
                !TranslateIcon.contains(event.target as Node)
            ) {
                TranslateIcon.hide();
            }
        });
    }

    getSelectedText() {
        return this.selectedText;
    }
}

export default new SelectionHandler();
