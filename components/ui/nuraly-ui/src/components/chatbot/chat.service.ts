export class ChatService {
  static async *streamResponse(_message: string): AsyncGenerator<string> {
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