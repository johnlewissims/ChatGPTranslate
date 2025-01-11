![ChatGPTranslate](src/icons/icon128.png)
# ChatGPTranslate
## Description
[ChatGPTranslate](https://chromewebstore.google.com/detail/chatgptranslate/plokiajdjepgcmhbnbfcehedkiobiakd) is a Chrome extension that allows users to highlight text on any webpage, click an icon to translate the text using OpenAI, and get an explanation of the translated text. It provides a seamless way to understand and interpret foreign language content directly from your browser.

<img width="721" alt="Screenshot 2025-01-11 at 11 34 13 AM" src="https://github.com/user-attachments/assets/e50cc761-d936-42d2-a65d-9d8e5cfc28c4" />


## Features
- Highlight text and click an icon to translate it
- Choose between quick translation or detailed explanations with examples
- Select from multiple GPT models for translation
- Choose your target translation language from a comprehensive dropdown
- Customize maximum token usage for responses
- Get word-by-word breakdowns and pronunciation guides
- Smart language detection from page context
- Toggle display of technical details (model and token usage)
- Settings page for configuring OpenAI API Key and preferences
- Clean, intuitive popup interface for translations and explanations

## Installation and Setup
### Step 1: Clone the Repository
Clone this repository to your local machine using:
```bash
git clone https://github.com/johnlewissims/ChatGPTranslate.git
```

### Step 2: Install Dependencies
Navigate to the project directory and install the necessary dependencies using:
```bash
cd ChatGPTranslate
npm install
```

### Step 3: Build the Project
Build the project to generate the dist folder:
```bash
npm run build
```

### Step 4: Load the Extension in Chrome
- Open Chrome and go to chrome://extensions/
- Enable "Developer mode" by toggling the switch in the top right corner
- Click the "Load unpacked" button and select the directory where you cloned the repository

### Step 5: Configure Your Settings
- Click on the extension icon in the Chrome toolbar
- If you haven't set an API key, you'll see an instruction message
- Click the link to go to the settings page
- Enter your OpenAI API Key (obtain from OpenAI API Keys page)
- Configure your preferred language, model, and other settings

## Contributors
- John Lewis Sims (Creator)
- Konstantin Bobovskiy (Features & Improvements)
