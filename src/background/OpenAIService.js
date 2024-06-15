class OpenAIService {
    constructor() {
      this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    }
  
    async getAPIKey() {
      const { OPENAI_API_KEY } = await new Promise((resolve) => {
        chrome.storage.local.get('OPENAI_API_KEY', resolve);
      });
  
      if (!OPENAI_API_KEY) {
        throw new Error('API Key not set');
      }
  
      return OPENAI_API_KEY;
    }
  
    async callOpenAI(messages) {
      const apiKey = await this.getAPIKey();
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages,
          max_tokens: 100
        })
      });
  
      const data = await response.json();
      if (response.ok) {
        return data.choices[0].message.content.trim();
      } else {
        throw new Error(data.error.message || 'Error fetching data from OpenAI');
      }
    }
  
    async translateText(text) {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant that translates text.' },
        { role: 'user', content: `Translate the following text to English:\n\n"${text}"` }
      ];
      const result = await this.callOpenAI(messages);
      return { translation: result || "Translation not available" };
    }
  
    async fetchExplanation(text) {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant that provides explanations.' },
        { role: 'user', content: `Provide an explanation for the following text:\n\n"${text}"` }
      ];
      const result = await this.callOpenAI(messages);
      return { explanation: result || "Explanation not available" };
    }
  }
  
  export default new OpenAIService();
  