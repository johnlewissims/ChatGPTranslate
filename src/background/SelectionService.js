class SelectionService
{
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

    getSelectedText() {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        if (!selectedText) {
            return undefined;
        }
        return selectedText
    }

    getSelectedTextAndLanguageCode() {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        if (!selectedText) {
            return {undefined, undefined};
        }
        const languageCode = this.getLanguageCode(selection.anchorNode);
        return {selectedText, languageCode}
    }
}

export default new SelectionService()