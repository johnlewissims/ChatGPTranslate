import CursorTracker from './CursorTracker.js';
import TranslateIcon from './TranslateIcon.js';

class PopupManager {
    async show(translation) {
        const { alwaysDisplayExplanation } = await new Promise((resolve) => {
            chrome.storage.local.get(['alwaysDisplayExplanation'], resolve);
        });

        const popup = document.createElement('div');
        popup.id = 'translation-popup';
        const { x, y, scrollX, scrollY } = CursorTracker.getPosition();
        popup.style.position = 'absolute';
        popup.style.top = `${y + scrollY}px`;
        popup.style.left = `${x + scrollX}px`;
        popup.style.backgroundColor = 'white';
        popup.style.border = '1px solid black';
        popup.style.padding = '10px';
        popup.style.zIndex = '10000';

        popup.innerHTML = `<p><strong>Translation:</strong> ${translation}</p>`;

        if (alwaysDisplayExplanation) {
            const explanation = await this.fetchExplanation(translation);
            popup.innerHTML += `<p><strong>Explanation:</strong> ${explanation}</p>`;
        } else {
            const explanationLink = document.createElement('a');
            explanationLink.href = '#';
            explanationLink.textContent = 'See Explanation';
            explanationLink.addEventListener('click', async (event) => {
                event.preventDefault();
                const explanation = await this.fetchExplanation(translation);
                const explanationParagraph = document.createElement('p');
                explanationParagraph.innerHTML = `<strong>Explanation:</strong> ${explanation}`;
                popup.appendChild(explanationParagraph);
                explanationLink.style.display = 'none';
            });
            popup.appendChild(explanationLink);
        }

        document.body.appendChild(popup);

        const hidePopup = (event) => {
            if (popup && !popup.contains(event.target) && event.target !== TranslateIcon.icon) {
                popup.remove();
                TranslateIcon.hide();
                document.removeEventListener('mousedown', hidePopup);
            }
        };

        document.addEventListener('mousedown', hidePopup);
    }

    async fetchExplanation(text) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: 'fetchExplanation', text: text }, (response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.explanation);
                }
            });
        });
    }
}

export default new PopupManager();
