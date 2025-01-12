import SettingsService from '../background/SettingsService.js';
import { MessageActions } from '../constants/messageActions.js';
import '../styles/styles.css'; 

import TranslateIcon from './TranslateIcon.js';

class PopupManager {
    createExplanationLink() {
        const explanationLink = document.createElement('a');
        explanationLink.href = '#';
        explanationLink.classList.add('explanation-link');
        explanationLink.classList.add('default-color');
        explanationLink.textContent = 'See Explanation';
        explanationLink.title = "Show explanations for selected text"
        explanationLink.addEventListener('click', async (event) => {
            event.preventDefault();
            const explanation = await this.fetchExplanation(text);
            const explanationParagraph = document.createElement('p');
            explanationParagraph.innerHTML = `<div class="explanation"><strong>Explanation:</strong> ${explanation}</div>`;
            popup.appendChild(explanationParagraph);
            explanationLink.style.display = 'none';
        });

        return explanationLink;
    }

    createSettingsLink() {
        const settingsLink = document.createElement('a');
        settingsLink.href = '#';
        settingsLink.classList.add('settings-link');
        settingsLink.classList.add('default-color');
        settingsLink.innerHTML = '&#x2699; Settings';
        settingsLink.title = "Update settings"
        settingsLink.target = "_blank";
        settingsLink.href = chrome.runtime.getURL('src/views/settings.html');

        return settingsLink;
    }

    async show({ translation, text, action }) {
        const popup = document.createElement('div');
        popup.id = 'translation-popup';
        const translationSection = document.createElement('div');
        translationSection.className = 'translation-section';
        translationSection.innerHTML = `
            <div class="translation">
                <p>
                    <strong>Translation:</strong>
                    <b>${text}</b>
                </p>
                <p>
                    ${translation}
                </p>
            </div>
            <div class="pronunciation">
                <img src="${chrome.runtime.getURL('src/icons/speaker.png')}" alt="Play translation" id="ttsIcon">
            </div>
        `;
        
        const ttsIcon = translationSection.querySelector('#ttsIcon');
        ttsIcon.addEventListener('click', () => this.playTextToSpeech(text));
        popup.appendChild(translationSection);

        if (action !== MessageActions.translateDetailed) {
            const  alwaysDisplayExplanation  = await SettingsService.getAlwaysDisplayExplanation();
            if (alwaysDisplayExplanation) {
                const explanation = await this.fetchExplanation(text);
                popup.innerHTML += `<div class="explanation"><p><strong>Explanation:</strong> ${explanation}</p></div>`;
            } else {
                const explanationLink = this.createExplanationLink();
                popup.appendChild(explanationLink);
            }
        }

        if (await SettingsService.shouldUserUpdateSettings()) {
            const settingsLink = this.createSettingsLink();
            popup.appendChild(settingsLink);
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
            chrome.runtime.sendMessage({ action: MessageActions.fetchExplanation, text: text }, (response) => {
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
            chrome.runtime.sendMessage({ action: MessageActions.textToSpeech, text: text }, (response) => {
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
