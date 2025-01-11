import { MessageActions } from '../constants/messageActions.js';
import OpenAIService from './OpenAIService.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MessageActions.translateAndExplain,
    title: "Translate and Explain",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MessageActions.translateAndExplain) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { text: info.selectionText });
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === MessageActions.showPopup) {
    chrome.action.setPopup({
      tabId: sender.tab.id,
      popup: 'views/popup.html'
    });

    chrome.storage.local.set({
      translation: message.translation,
      explanation: message.explanation,
      breakdown: message.breakdown
    }, () => {
      chrome.action.openPopup();
    });
  } else if (message.action === MessageActions.translateAndExplain) {
    OpenAIService.translateText(message.text, message.languageCode).then(response => {
      sendResponse(response);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  } else if (message.action === MessageActions.translateDetailed) {
    OpenAIService.translateText(message.text, message.languageCode, true).then(response => {
      sendResponse(response);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  } else if (message.action === MessageActions.fetchExplanation) {
    OpenAIService.fetchExplanation(message.text).then(response => {
      sendResponse(response);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  } else if (message.action === MessageActions.textToSpeech) {
    OpenAIService.getTextToSpeechDataUrl(message.text).then(dataUrl => {
        sendResponse({ audioDataUrl: dataUrl });
    }).catch(error => {
        sendResponse({ error: error.message });
    });
    return true;
  }
});
