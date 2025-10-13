

# ChatbotCoreController - Framework Agnostic Architecture

## Overview

The `ChatbotCoreController` is a pure, UI-agnostic controller that provides all chatbot business logic without any UI dependencies. It can be used with **any framework** (Lit, React, Vue, Svelte, vanilla JS) by injecting UI callbacks.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              ChatbotCoreController                      │
│         (Pure business logic, no UI deps)               │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────▼────┐            ┌─────▼─────┐
   │Providers│            │  Plugins  │
   │(AI APIs)│            │(Extensions)│
   └─────────┘            └───────────┘
        │                       │
   ┌────▼────┐            ┌─────▼─────┐
   │ Storage │            │UI Callbacks│
   │(Persist)│            │ (Injected) │
   └─────────┘            └───────────┘
```

## Key Features

✅ **Framework Agnostic** - Works with any UI framework  
✅ **Extensible** - Override methods to customize behavior  
✅ **Provider Pattern** - Pluggable AI backends  
✅ **Plugin System** - Add features modularly  
✅ **Storage Abstraction** - Multiple storage options  
✅ **Type Safe** - Full TypeScript support  
✅ **Event Driven** - Rich event system  
✅ **Zero UI Dependencies** - Pure business logic

## Quick Start

### 1. Basic Usage

```typescript
import { ChatbotCoreController } from '@nuralyui/chatbot';

const controller = new ChatbotCoreController({
  // Inject UI callbacks
  ui: {
    onStateChange: (state) => {
      // Update your UI when state changes
      renderMessages(state.messages);
    },
    onTypingStart: () => showTypingIndicator(),
    onTypingEnd: () => hideTypingIndicator(),
    showNotification: (msg, type) => toast[type](msg),
    scrollToBottom: () => scrollToBottom()
  }
});

// Send message
await controller.sendMessage('Hello!');

// Add bot response
controller.addMessage({
  sender: 'bot',
  text: 'Hi! How can I help you?',
  timestamp: new Date().toISOString()
});
```

### 2. With AI Provider

```typescript
import { ChatbotCoreController } from '@nuralyui/chatbot';
import { OpenAIProvider } from '@nuralyui/chatbot/providers';

// Setup provider
const provider = new OpenAIProvider();
await provider.connect({
  apiKey: 'your-openai-api-key',
  model: 'gpt-4',
  temperature: 0.7
});

// Create controller
const controller = new ChatbotCoreController({
  provider,
  ui: { /* callbacks */ }
});

// Send message - provider responds automatically
await controller.sendMessage('Explain quantum computing');
```

### 3. With Plugins

```typescript
import { 
  ChatbotCoreController,
  PersistencePlugin,
  AnalyticsPlugin,
  MarkdownPlugin
} from '@nuralyui/chatbot';
import { LocalStorageAdapter } from '@nuralyui/chatbot/storage';

const storage = new LocalStorageAdapter();

const controller = new ChatbotCoreController({
  plugins: [
    new PersistencePlugin(storage, {
      storageKey: 'my-chatbot',
      autoSaveInterval: 5000
    }),
    new AnalyticsPlugin((event, data) => {
      gtag('event', event, data);
    }),
    new MarkdownPlugin()
  ],
  ui: { /* callbacks */ }
});
```

## Extending the Controller

### Override Validation

```typescript
class ValidatedChatbot extends ChatbotCoreController {
  protected override async validateMessage(text: string) {
    const baseValidation = await super.validateMessage(text);
    if (!baseValidation.isValid) return baseValidation;
    
    // Add custom validation
    if (text.length > 500) {
      return {
        isValid: false,
        errors: ['Message too long (max 500 characters)']
      };
    }
    
    return { isValid: true, errors: [] };
  }
}
```

### Override Message Creation

```typescript
class EnhancedChatbot extends ChatbotCoreController {
  protected override createMessage(data: any) {
    return {
      ...super.createMessage(data),
      metadata: {
        userId: this.getCurrentUserId(),
        sessionId: this.getSessionId(),
        deviceInfo: navigator.userAgent
      }
    };
  }
}
```

### Override Error Handling

```typescript
class RobustChatbot extends ChatbotCoreController {
  protected override async handleProviderError(error: Error) {
    // Log to error tracking
    Sentry.captureException(error);
    
    // Try fallback provider
    if (this.fallbackProvider) {
      this.setProvider(this.fallbackProvider);
    } else {
      // Show user-friendly error
      this.addMessage({
        sender: 'bot',
        text: 'I apologize for the technical difficulty. Please try again.',
        state: 'error',
        timestamp: new Date().toISOString()
      });
    }
  }
}
```

## Providers

### OpenAI Provider

```typescript
import { OpenAIProvider } from '@nuralyui/chatbot/providers';

const provider = new OpenAIProvider();
await provider.connect({
  apiKey: 'sk-...',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000
});
```

### Custom API Provider

```typescript
import { CustomAPIProvider } from '@nuralyui/chatbot/providers';

const provider = new CustomAPIProvider();
await provider.connect({
  apiUrl: 'https://api.example.com/chat',
  apiKey: 'your-api-key'
});
```

### Create Your Own Provider

```typescript
import type { ChatbotProvider } from '@nuralyui/chatbot';

class MyProvider implements ChatbotProvider {
  readonly id = 'my-provider';
  readonly name = 'My Custom Provider';
  readonly capabilities = {
    streaming: true,
    fileUpload: false,
    modules: false,
    functions: false
  };
  
  async connect(config: any): Promise<void> {
    // Connect to your API
  }
  
  async *sendMessage(text: string, context: any): AsyncIterator<string> {
    // Stream response chunks
    yield 'Hello ';
    yield 'World';
  }
  
  // ... other methods
}
```

## Plugins

### Persistence Plugin

```typescript
import { PersistencePlugin } from '@nuralyui/chatbot/plugins';
import { LocalStorageAdapter } from '@nuralyui/chatbot/storage';

const storage = new LocalStorageAdapter();
const plugin = new PersistencePlugin(storage, {
  storageKey: 'chatbot-state',
  autoSaveInterval: 5000 // Auto-save every 5 seconds
});
```

### Analytics Plugin

```typescript
import { AnalyticsPlugin } from '@nuralyui/chatbot/plugins';

const plugin = new AnalyticsPlugin((event, data) => {
  // Send to your analytics service
  analytics.track(event, data);
});
```

### Create Custom Plugin

```typescript
import type { ChatbotPlugin } from '@nuralyui/chatbot';

class MyPlugin implements ChatbotPlugin {
  readonly id = 'my-plugin';
  readonly name = 'My Plugin';
  readonly version = '1.0.0';
  
  onInit(controller: any): void {
    console.log('Plugin initialized');
  }
  
  async beforeSend(text: string): Promise<string> {
    // Transform message before sending
    return text.toUpperCase();
  }
  
  async afterReceive(text: string): Promise<string> {
    // Transform response after receiving
    return text.toLowerCase();
  }
}
```

## Storage Options

### Memory Storage (No Persistence)

```typescript
import { MemoryStorage } from '@nuralyui/chatbot/storage';

const storage = new MemoryStorage();
```

### LocalStorage

```typescript
import { LocalStorageAdapter } from '@nuralyui/chatbot/storage';

const storage = new LocalStorageAdapter();
```

### IndexedDB

```typescript
import { IndexedDBStorage } from '@nuralyui/chatbot/storage';

const storage = new IndexedDBStorage('my-db', 'chatbot-store');
```

## Framework Integration

### React

```typescript
function useChatbot(config) {
  const [state, setState] = useState(null);
  const controllerRef = useRef(null);
  
  useEffect(() => {
    const controller = new ChatbotCoreController({
      ...config,
      ui: {
        onStateChange: setState,
        // ... other callbacks
      }
    });
    
    controllerRef.current = controller;
    return () => controller.destroy();
  }, []);
  
  return {
    state,
    sendMessage: (text) => controllerRef.current?.sendMessage(text)
  };
}
```

### Vue

```typescript
export function useChatbot(config) {
  const state = ref(null);
  
  const controller = new ChatbotCoreController({
    ...config,
    ui: {
      onStateChange: (newState) => {
        state.value = newState;
      }
    }
  });
  
  onUnmounted(() => controller.destroy());
  
  return {
    state: readonly(state),
    sendMessage: (text) => controller.sendMessage(text)
  };
}
```

### Vanilla JavaScript

```typescript
const controller = new ChatbotCoreController({
  ui: {
    onStateChange: (state) => {
      const container = document.getElementById('messages');
      container.innerHTML = state.messages
        .map(msg => `<div class="${msg.sender}">${msg.text}</div>`)
        .join('');
    }
  }
});

document.getElementById('send-btn').addEventListener('click', async () => {
  const input = document.getElementById('input');
  await controller.sendMessage(input.value);
  input.value = '';
});
```

## Events

```typescript
// Listen to events
controller.on('message:sent', (message) => {
  console.log('User sent:', message);
});

controller.on('message:received', (message) => {
  console.log('Bot replied:', message);
});

controller.on('error', (error) => {
  console.error('Error:', error);
});

// Available events:
// - state:changed
// - message:added, message:updated, message:deleted
// - message:sent, message:received
// - typing:start, typing:end
// - processing:start, processing:end
// - file:uploaded, file:removed
// - thread:created, thread:selected, thread:deleted
// - module:selected
// - provider:connected, provider:disconnected, provider:error
// - validation:error, error
```

## API Reference

### ChatbotCoreController

#### Constructor

```typescript
new ChatbotCoreController(config: ChatbotCoreConfig)
```

#### Public Methods

```typescript
// Messages
sendMessage(text: string, options?: SendMessageOptions): Promise<ChatbotMessage>
addMessage(data: Partial<ChatbotMessage>): ChatbotMessage
updateMessage(id: string, updates: Partial<ChatbotMessage>): void
deleteMessage(id: string): void
clearMessages(): void
getMessages(): ChatbotMessage[]

// Files
uploadFiles(files?: File[]): Promise<ChatbotFile[]>
removeFile(fileId: string): void
clearFiles(): void
getUploadedFiles(): ChatbotFile[]

// Threads
createThread(title?: string): ChatbotThread
switchThread(threadId: string): void
deleteThread(threadId: string): void
getCurrentThread(): ChatbotThread | undefined
getThreads(): ChatbotThread[]

// Modules
setModules(modules: ChatbotModule[]): void
selectModules(moduleIds: string[]): void
toggleModule(moduleId: string): void
getSelectedModules(): ChatbotModule[]

// Suggestions
setSuggestions(suggestions: ChatbotSuggestion[]): void
clearSuggestions(): void

// Plugins
registerPlugin(plugin: ChatbotPlugin): void
unregisterPlugin(pluginId: string): void
getPlugin(pluginId: string): ChatbotPlugin | undefined

// State
getState(): Readonly<ChatbotState>
setState(updates: Partial<ChatbotState>): void
setTyping(isTyping: boolean): void

// Provider & Storage
setProvider(provider: ChatbotProvider): void
getProvider(): ChatbotProvider | undefined
setStorage(storage: ChatbotStorage): void
saveToStorage(key?: string): Promise<void>
loadFromStorage(key?: string): Promise<void>

// Events
on(event: string, handler: Function): () => void
emit(event: string, data?: any): void

// Lifecycle
setUICallbacks(callbacks: ChatbotUICallbacks): void
getConfig(): Readonly<ChatbotCoreConfig>
destroy(): void
```

#### Protected Methods (Override Points)

```typescript
protected initializeState(config: ChatbotCoreConfig): ChatbotState
protected setupLifecycleHooks(): void
protected onBeforeInit(): void
protected onReady(): void
protected onDestroy(): void

protected updateState(updates: Partial<ChatbotState>): void
protected addMessageToState(message: ChatbotMessage): void
protected updateMessageInState(id: string, updates: Partial<ChatbotMessage>): void

protected processWithProvider(message: ChatbotMessage): Promise<void>
protected processStream(stream: AsyncIterator<string>): Promise<void>
protected validateFile(file: File): { valid: boolean; error?: string }
protected processFile(file: File): Promise<ChatbotFile>

protected validateMessage(text: string): Promise<ValidationResult>
protected beforeMessageSent(text: string, options?: SendMessageOptions): Promise<string>
protected afterMessageSent(message: ChatbotMessage): Promise<void>
protected beforeProviderCall(message: ChatbotMessage): Promise<void>
protected afterProviderCall(): Promise<void>

protected handleProviderError(error: Error): Promise<void>
protected handleValidationError(error: ValidationError): void
protected handleError(error: Error): void
protected createMessage(data: Partial<ChatbotMessage>): ChatbotMessage

protected generateId(prefix: string): string
protected determineFileType(mimeType: string): ChatbotFileType
protected formatFileSize(bytes: number): string
protected log(...args: any[]): void
protected logError(...args: any[]): void
```

## Examples

See the Storybook stories at `chatbot-core.stories.ts` for comprehensive examples including:

- Basic vanilla JavaScript usage
- OpenAI provider integration
- Custom API provider
- Plugin system (Persistence, Analytics, Markdown)
- Storage options (Memory, LocalStorage, IndexedDB)
- Extending the controller
- Framework integrations (React, Vue)
- Event system
- Complete production-ready example

## License

MIT © Nuraly, Laabidi Aymen
