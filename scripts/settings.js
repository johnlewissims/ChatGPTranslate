document.getElementById('api-key-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const apiKey = document.getElementById('api-key').value;

    chrome.storage.local.set({ OPENAI_API_KEY: apiKey }, function () {
        alert('API Key saved successfully!');
    });
});

chrome.storage.local.get('OPENAI_API_KEY', function (result) {
    if (result.OPENAI_API_KEY) {
        document.getElementById('api-key').value = result.OPENAI_API_KEY;
    }
});