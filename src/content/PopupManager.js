import '../styles/styles.css'; 

import CursorTracker from './CursorTracker.js';
import TranslateIcon from './TranslateIcon.js';

class PopupManager {
    async show(translation, selectedText) {
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

        const translationSection = document.createElement('div');
        translationSection.className = 'translation-section';
        translationSection.innerHTML = `
            <div class="translation"><p><strong>Translation:</strong> ${translation}</p></div>
            <div class="pronunciation">
                <img src="${chrome.runtime.getURL('src/icons/speaker.png')}" alt="Play translation" id="ttsIcon">
            </div>
        `;
        
        const ttsIcon = translationSection.querySelector('#ttsIcon');
        ttsIcon.addEventListener('click', () => this.playTextToSpeech(selectedText));
        
        popup.appendChild(translationSection);

        if (alwaysDisplayExplanation) {
            const explanation = await this.fetchExplanation(translation);
            popup.innerHTML += `<div class="explanation"><p><strong>Explanation:</strong> ${explanation}</p></div>`;
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

    async playTextToSpeech(text) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: 'textToSpeech', text: text }, (response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    const audio = new Audio(response.audioDataUrl);
                    audio.play();
                    resolve();
                }
            });
        });
    }
}

export default new PopupManager();
