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
    translateText(message.text).then(response => {
      sendResponse(response);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  } else if (message.action === 'fetchExplanation') {
    fetchExplanation(message.text).then(response => {
      sendResponse(response);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  }
});

async function getAPIKey() {
  const { OPENAI_API_KEY } = await new Promise((resolve) => {
    chrome.storage.local.get('OPENAI_API_KEY', resolve);
  });

  if (!OPENAI_API_KEY) {
    throw new Error('API Key not set');
  }

  return OPENAI_API_KEY;
}

async function translateText(text) {
  const apiKey = await getAPIKey();
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  const messages = [
    { role: 'system', content: 'You are a helpful assistant that translates text.' },
    { role: 'user', content: `Translate the following text to English:\n\n"${text}"` }
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
      max_tokens: 100
    })
  });

  const data = await response.json();
  if (response.ok) {
    const result = data.choices[0].message.content.trim();
    return { translation: result || "Translation not available" };
  } else {
    throw new Error(data.error.message || 'Error fetching translation');
  }
}

async function fetchExplanation(text) {
  const apiKey = await getAPIKey();
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  const messages = [
    { role: 'system', content: 'You are a helpful assistant that provides explanations.' },
    { role: 'user', content: `Provide an explanation for the following text:\n\n"${text}"` }
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
      max_tokens: 100
    })
  });

  const data = await response.json();
  if (response.ok) {
    const result = data.choices[0].message.content.trim();
    return { explanation: result || "Explanation not available" };
  } else {
    throw new Error(data.error.message || 'Error fetching explanation');
  }
}
