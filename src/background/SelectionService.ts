class SelectionService {
    /**
     * Get language code from HTML.
     *
     * @param {Node | null} anchorNode
     * @returns {string}
     */
    getLanguageCode(anchorNode: Node | null) {
        // Try to get a language code from the nearest parent.
        let node = anchorNode;
        while (node) {
            if ((node as HTMLElement).lang) {
                return (node as HTMLElement).lang;
            }
            node = node.parentNode;
        }
        return document?.documentElement?.lang?.toUpperCase() ?? '';
    }

    /**
     * Get selected text from web page.
     *
     * @returns {string | undefined}
     */
    getSelectedText() {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        if (!selectedText) {
            return undefined;
        }
        return selectedText;
    }

    getSelectedTextAndLanguageCode() {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        if (!selectedText || !selection) {
            return {};
        }
        const languageCode = this.getLanguageCode(selection.anchorNode);
        return { selectedText, languageCode };
    }
}

export default new SelectionService();
