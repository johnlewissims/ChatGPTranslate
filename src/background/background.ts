import { MessageActions } from '@src/constants/messageActions';
import OpenAIService from '@src/background/OpenAIService';
import { Message } from '@src/content/Message';

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: MessageActions.translateAndExplain,
        title: 'Translate and Explain',
        contexts: ['selection'],
    });
});

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === MessageActions.translateAndExplain) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const id = tabs[0].id;
            if (!id) {
                return;
            }
            chrome.tabs.sendMessage(id, { text: info.selectionText });
        });
    }
});

chrome.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse) => {
        if (!sender.tab) {
            return;
        }
        if (message.action === MessageActions.showPopup) {
            chrome.action.setPopup({
                tabId: sender.tab.id,
                popup: 'views/popup.html',
            });

            chrome.storage.local.set(
                {
                    translation: message.translation,
                    explanation: message.explanation,
                    breakdown: message.breakdown,
                },
                () => {
                    chrome.action.openPopup();
                },
            );
        } else if (message.action === MessageActions.translateAndExplain) {
            OpenAIService.translateText(
                message.text,
                message.languageCode,
                message.isDetailed,
                message.userDefinedLanguageCode,
            )
                .then((response) => {
                    sendResponse({
                        ...response,
                        text: message.text,
                        action: message.action,
                        isDetailed: message.isDetailed ?? false,
                    });
                })
                .catch((error) => {
                    sendResponse({ error: error.message });
                });
            return true;
        } else if (message.action === MessageActions.fetchExplanation) {
            OpenAIService.fetchExplanation(message.text)
                .then((response) => {
                    sendResponse({
                        ...response,
                        text: message.text,
                        action: message.action,
                    });
                })
                .catch((error) => {
                    sendResponse({ error: error.message });
                });
            return true;
        } else if (message.action === MessageActions.textToSpeech) {
            OpenAIService.getTextToSpeechDataUrl(message.text)
                .then((dataUrl) => {
                    sendResponse({ audioDataUrl: dataUrl });
                })
                .catch((error) => {
                    sendResponse({ error: error.message });
                });
            return true;
        }
    },
);
