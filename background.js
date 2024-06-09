importScripts('config.js');

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

        chrome.storage.local.set({ translation: message.translation, explanation: message.explanation }, () => {
            chrome.action.openPopup();
        });
    } else if (message.action === 'translateAndExplain') {
        translateAndExplain(message.text).then(response => {
            sendResponse(response);
        }).catch(error => {
            sendResponse({ error: error.message });
        });
        return true;
    }
});

async function translateAndExplain(text) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
  
    // Retrieve the API key from Chrome storage or the config file
    const { OPENAI_API_KEY: settingsApiKey } = await chrome.storage.local.get('OPENAI_API_KEY');
    const configApiKey = config.OPENAI_API_KEY;
    const apiKey = configApiKey || settingsApiKey;

    if (!apiKey) {
      throw new Error('API Key not set');
    }
    
    const messages = [
      { role: 'system', content: 'You are a helpful assistant that translates text and provides explanations.' },
      { role: 'user', content: `Translate the following text to English and provide an explanation:\n\n"${text}"` }
    ];
  
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 150
      })
    });
  
    const data = await response.json();
    if (response.ok) {
      const result = data.choices[0].message.content.trim();
      const [translation, explanation] = result.split('\n\n');
  
      return {
        translation: translation || "Translation not available",
        explanation: explanation || "Explanation not available"
      };
    } else {
      throw new Error(data.error.message || 'Error fetching translation');
    }
  }