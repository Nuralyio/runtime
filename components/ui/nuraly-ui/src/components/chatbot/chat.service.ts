import { API_URLS, MAIN_PROMPT_ID } from './api-constant';

export class ChatService {
  private currentConversationId = 0;

  async loadSuggestions(categoryId: number) {
    return await fetch(API_URLS.GET_CATEGORY_BY_ID(categoryId))
      .then((response) => response.json())
      .then((data) => {
        return data.prompts.map((prompt: { promptText: string }) => {
          return prompt.promptText;
        });
      });
  }

  async createConversation(mainPromptId: number) {
    return await fetch(API_URLS.CONVERSATION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptId: mainPromptId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
  }

  async *streamResponse(_message: string): AsyncGenerator<string> {
    if (!this.currentConversationId) {
      const { id } = await this.createConversation(MAIN_PROMPT_ID);
      this.currentConversationId = id;
    }

    const url = API_URLS.TEXT_GENERATION(this.currentConversationId);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: _message,
        variables: {},
        stream: true,
      }),
    });
    if (!response.ok || !response.body) {
      throw new Error(`Failed to stream response from ${url}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk and yield each part.
      const chunk = decoder.decode(value, { stream: true });
      yield chunk;
    }
  }
}

export const chatServiceInstance = new ChatService();