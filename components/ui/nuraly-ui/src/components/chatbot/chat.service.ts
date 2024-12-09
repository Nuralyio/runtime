export class ChatService {
  static async *streamResponse(message: string): AsyncGenerator<string> {
    ChatService._message = message;
    const chunks = [
      'This ',
      'is ',
      'a ',
      'streaming ',
      'response ',
      'from ',
      'the ',
      'server.'
    ];

    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 200));
      yield chunk;
    }
  }
}