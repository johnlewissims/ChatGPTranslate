import { Languages } from '../scripts/defaultSettings.js';
import SettingsService from '../background/SettingsService.js';
import TranslationService from '../background/TranslationService.js';
import { MessageActions } from '../constants/messageActions.js';
import '../styles/styles.css';

import TranslateIcon from './TranslateIcon.js';
import { createOptions } from '../HtmlFunc/options.js';
import {
    disableElementById,
    enableElementById,
    hideElementById,
} from '../HtmlFunc/attributes.js';
import { getURL } from './chrome.js';

class PopupManager {
    action = '';
    text = '';
    isDetailed = false;

    updatingTextColor = '#666';
    changeLanguageSelectId = 'translation-popup-language';
    changeLanguageTranslateButtonId = 'change-lang-form-submit';
    explanationLinkId = 'translation-popup-explanation-link';

    createExplanationLink(text, popup) {
        const explanationLink = document.createElement('a');
        explanationLink.href = '#';
        explanationLink.id = this.explanationLinkId;
        explanationLink.classList.add('explanation-link');
        explanationLink.classList.add('default-color');
        explanationLink.textContent = 'See Explanation';
        explanationLink.addEventListener('click', async (event) => {
            event.preventDefault();
            hideElementById(this.explanationLinkId);
            const explanation = await this.fetchExplanation(text);
            const explanationBlock = document.createElement('div');
            explanationBlock.classList.add('explanation');
            explanationBlock.innerHTML = `<strong>Explanation:</strong> ${explanation}`;
            popup.appendChild(explanationBlock);
        });

        return explanationLink;
    }

    createChangeLanguageFrom() {
        const innerHTML = `<form id="change-lang-form">
            <label for="${this.changeLanguageSelectId}">Text language:</label>
            <select id="${this.changeLanguageSelectId}" name="language"></select>
            <button id="${this.changeLanguageTranslateButtonId}">Translate</button>
        </form>`;

        return innerHTML;
    }

    getElementChangeLanguageSelect() {
        return document.getElementById(this.changeLanguageSelectId);
    }

    /**
     * Get selected language code value
     *
     * @returns {string}
     */
    getValueChangeLanguageSelect() {
        return this.getElementChangeLanguageSelect().value;
    }

    /**
     * Set selected language code value.
     * @param {string} value
     */
    setValueChangeLanguageSelect(value) {
        const element = this.getElementChangeLanguageSelect();
        element.value = value;
    }

    async updateLanguageWithLastUsed() {
        const savedUsedLanguages =
            await SettingsService.getPopupFavoriteLanguages();
        if (Object.keys(savedUsedLanguages).length === 0) {
            savedUsedLanguages.en = 0;
        }
        const orderedFavoriteLanguages = Object.entries({
            ...savedUsedLanguages,
        }).sort((a, b) => b[1] - a[1]);
        const allLanguagesWithoutFavorites = { ...Languages };
        for (const lang of orderedFavoriteLanguages) {
            lang[1] = allLanguagesWithoutFavorites[lang[0]];
            delete allLanguagesWithoutFavorites[lang[0]];
        }

        const allLanguagesInRightOrder = [
            ...orderedFavoriteLanguages,
            ...Object.entries(allLanguagesWithoutFavorites),
        ];

        createOptions(this.changeLanguageSelectId, allLanguagesInRightOrder);

        const favoriteLanguageKeyValue = orderedFavoriteLanguages[0];
        this.setValueChangeLanguageSelect(favoriteLanguageKeyValue[0]);
    }

    async updateTranslationWithSelectedLanguage(event) {
        event.preventDefault();
        const selectedLanguage = this.getValueChangeLanguageSelect();
        if (selectedLanguage) {
            await SettingsService.savePopupFavoriteLanguages(selectedLanguage);
        }

        const translationElement = document.getElementById(
            'translation-popup-text',
        );

        translationElement.style.color = this.updatingTextColor;
        const pre = translationElement.getElementsByTagName('pre');
        if (pre && pre.length === 1) {
            pre[0].style.color = this.updatingTextColor;
        }

        disableElementById(this.changeLanguageTranslateButtonId);

        const newTranslation = await new Promise((resolve, reject) => {
            const message = {
                action: this.action,
                text: this.text,
                languageCode: selectedLanguage,
                isDetailed: this.isDetailed,
                userDefinedLanguageCode: selectedLanguage,
            };
            TranslationService.handleTranslation(message, (response) => {
                enableElementById(this.changeLanguageTranslateButtonId);
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.translation);
                }
            });
        });

        translationElement.innerHTML = newTranslation;
    }

    async show({ translation, text, action, isDetailed }) {
        this.text = text;
        this.action = action;
        this.isDetailed = isDetailed;

        const popup = document.createElement('div');
        popup.id = 'translation-popup';
        const translationSection = document.createElement('div');
        translationSection.className = 'translation-section';
        translationSection.innerHTML = `
            <div class="translation">
                <div>
                    <strong>Translation:</strong>
                    <b>${text}</b>
                    ${this.createChangeLanguageFrom()}
                </div>
                <div id="translation-popup-text">
                    ${translation}
                </div>
            </div>
            <div class="pronunciation">
                <img src="${getURL('icons/speaker.png')}" alt="Play translation" id="ttsIcon">
            </div>
        `;

        const ttsIcon = translationSection.querySelector('#ttsIcon');
        ttsIcon.addEventListener('click', () => this.playTextToSpeech(text));
        popup.appendChild(translationSection);

        if (action !== MessageActions.translateDetailed) {
            const alwaysDisplayExplanation =
                await SettingsService.getAlwaysDisplayExplanation();
            if (alwaysDisplayExplanation) {
                const explanation = await this.fetchExplanation(text);
                popup.innerHTML += `<div class="explanation"><p><strong>Explanation:</strong> ${explanation}</p></div>`;
            } else {
                const explanationLink = this.createExplanationLink(text, popup);
                popup.appendChild(explanationLink);
            }
        }

        document.body.appendChild(popup);

        await this.updateLanguageWithLastUsed();
        const changeLangFormSubmitHandler =
            this.updateTranslationWithSelectedLanguage.bind(this);
        document
            .getElementById('change-lang-form')
            .addEventListener('submit', changeLangFormSubmitHandler);

        const hidePopup = (event) => {
            if (
                popup &&
                !popup.contains(event.target) &&
                event.target !== TranslateIcon.icon
            ) {
                this.text = '';
                this.action = '';
                this.isDetailed = false;
                popup.remove();
                TranslateIcon.hide();
                document.removeEventListener('mousedown', hidePopup);
            }
        };

        document.addEventListener('mousedown', hidePopup);
    }

    async fetchExplanation(text) {
        return new Promise((resolve, reject) => {
            TranslationService.handleTranslation(
                {
                    action: MessageActions.fetchExplanation,
                    text,
                },
                (response) => {
                    if (response.error) {
                        reject(response.error);
                    } else {
                        resolve(response.explanation);
                    }
                },
            );
        });
    }

    async playTextToSpeech(text) {
        return new Promise((resolve, reject) => {
            TranslationService.handleTranslation(
                {
                    action: MessageActions.textToSpeech,
                    text,
                },
                (response) => {
                    if (response.error) {
                        reject(response.error);
                    } else {
                        const audio = new Audio(response.audioDataUrl);
                        audio.play();
                        resolve();
                    }
                },
            );
        });
    }
}

export default new PopupManager();
