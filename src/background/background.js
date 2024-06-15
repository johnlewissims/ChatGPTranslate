import OpenAIService from './OpenAIService.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translateAndExplain",
    title: "Translate and Explain",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translateAndExplain") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { text: info.selectionText });
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showPopup') {
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
  } else if (message.action === 'translateAndExplain') {
    OpenAIService.translateText(message.text).then(response => {
      sendResponse(response);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  } else if (message.action === 'fetchExplanation') {
    OpenAIService.fetchExplanation(message.text).then(response => {
      sendResponse(response);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  }
});
