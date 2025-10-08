# Chatbot Component

A versatile chatbot component with message handling, suggestions, typing indicators, and multi-language support. Built using NuralyUI components for consistent styling and behavior.

## Features

- **Message Management**: Handle user and bot messages with timestamps
- **Suggestions**: Interactive suggestion chips using nr-button for quick responses
- **Typing Indicators**: Visual feedback when bot is processing
- **RTL Support**: Full right-to-left text direction support
- **Theme Aware**: Automatic theme detection and styling
- **Accessibility**: Full keyboard navigation and screen reader support
- **Validation**: Message validation with custom rules
- **Multiple Variants**: Different visual styles and sizes
- **Event System**: Comprehensive event handling for integration
- **Component Integration**: Uses nr-input and nr-button for consistent UX

## Installation

```bash
npm install @nuralyui/chatbot
```

## Basic Usage

### HTML

```html
<nr-chatbot 
  id="chatbot"
  size="medium"
  variant="default">
</nr-chatbot>

<script>
  const chatbot = document.getElementById('chatbot');
  
  // Set initial messages
  chatbot.messages = [
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! How can I help you today?',
      timestamp: new Date().toLocaleTimeString(),
      introduction: true
    }
  ];
  
  // Set suggestions
  chatbot.suggestions = [
    { id: 'help', text: 'Get help', enabled: true },
    { id: 'support', text: 'Contact support', enabled: true }
  ];
  
  // Listen for events
  chatbot.addEventListener('chatbot-message-sent', (e) => {
    console.log('User sent:', e.detail.message);
  });
</script>
```

### React

```jsx
import { NrChatbot } from '@nuralyui/chatbot/react';
import { useState } from 'react';

function ChatExample() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! How can I help you today?',
      timestamp: new Date().toLocaleTimeString(),
      introduction: true
    }
  ]);
  
  const [suggestions] = useState([
    { id: 'help', text: 'Get help', enabled: true },
    { id: 'support', text: 'Contact support', enabled: true }
  ]);

  const handleMessageSent = (event) => {
    const userMessage = event.detail.message;
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: 'I received your message. How else can I help?',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <NrChatbot
      messages={messages}
      suggestions={suggestions}
      size="medium"
      variant="default"
      onChatbotMessageSent={handleMessageSent}
    />
  );
}
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `messages` | `ChatbotMessage[]` | `[]` | Array of chat messages |
| `suggestions` | `ChatbotSuggestion[]` | `[]` | Array of suggestion objects |
| `currentInput` | `string` | `''` | Current input value |
| `isBotTyping` | `boolean` | `false` | Show typing indicator |
| `chatStarted` | `boolean` | `false` | Whether chat has started |
| `isRTL` | `boolean` | `false` | Right-to-left text direction |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Component size |
| `variant` | `'default' \| 'minimal' \| 'rounded'` | `'default'` | Visual variant |
| `loadingIndicator` | `'dots' \| 'spinner' \| 'wave'` | `'dots'` | Loading animation type |
| `loadingText` | `string` | `'Bot is typing...'` | Loading text message |
| `disabled` | `boolean` | `false` | Disable input and interactions |
| `placeholder` | `string` | `'Type your message...'` | Input placeholder text |
| `showSendButton` | `boolean` | `true` | Show send button |
| `autoScroll` | `boolean` | `true` | Auto-scroll to new messages |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `chatbot-message-sent` | `{ message: ChatbotMessage }` | User sent a message |
| `chatbot-suggestion-clicked` | `{ suggestion: ChatbotSuggestion }` | Suggestion was selected |
| `chatbot-retry-requested` | `{ message: ChatbotMessage }` | Retry requested for failed message |
| `chatbot-input-changed` | `{ value: string }` | Input value changed |
| `chatbot-input-focused` | `{ event: Event }` | Input received focus |
| `chatbot-input-blurred` | `{ event: Event }` | Input lost focus |

## Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `sendMessage(text: string)` | `text` | Programmatically send a message |
| `clearMessages()` | - | Clear all messages |
| `addMessage(message)` | `message` | Add a message programmatically |
| `setTyping(isTyping: boolean)` | `isTyping` | Set typing indicator state |
| `focusInput()` | - | Focus the input field |

## Types

### ChatbotMessage

```typescript
interface ChatbotMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  error?: boolean;
  introduction?: boolean;
  state?: 'default' | 'error' | 'success' | 'loading';
  metadata?: Record<string, any>;
}
```

### ChatbotSuggestion

```typescript
interface ChatbotSuggestion {
  id: string;
  text: string;
  category?: string;
  enabled?: boolean;
  metadata?: Record<string, any>;
}
```

## Styling

The component supports CSS custom properties for theming:

```css
nr-chatbot {
  --nuraly-color-primary: #0066cc;
  --nuraly-color-text: #333;
  --nuraly-color-background: #fff;
  --nuraly-color-border: #e0e0e0;
  --nuraly-border-radius: 8px;
  --nuraly-spacing-sm: 8px;
  --nuraly-spacing-md: 16px;
}
```

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- ARIA labels and descriptions
- High contrast support
- Focus management

## Examples

### Custom Styling

```html
<nr-chatbot 
  class="custom-chatbot"
  variant="rounded">
</nr-chatbot>

<style>
  .custom-chatbot {
    --nuraly-color-primary: #ff6b6b;
    --nuraly-border-radius: 16px;
  }
</style>
```

### With Custom Validation

```javascript
const chatbot = document.querySelector('nr-chatbot');

// Add validation rule
chatbot.addValidationRule({
  id: 'length-check',
  validator: (text) => text.length >= 3,
  errorMessage: 'Message must be at least 3 characters long'
});
```

### Integration with Chat Service

```javascript
import { chatServiceInstance } from '@nuralyui/chatbot';

const chatbot = document.querySelector('nr-chatbot');

chatbot.addEventListener('chatbot-message-sent', async (e) => {
  const userMessage = e.detail.message;
  
  // Set typing indicator
  chatbot.setTyping(true);
  
  try {
    // Stream response from service
    const responseGenerator = chatServiceInstance.streamResponse(userMessage.text);
    
    for await (const chunk of responseGenerator) {
      // Handle streaming response
      chatbot.addMessage({
        sender: 'bot',
        text: chunk,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  } catch (error) {
    chatbot.addMessage({
      sender: 'bot',
      text: 'Sorry, there was an error processing your request.',
      timestamp: new Date().toLocaleTimeString(),
      error: true
    });
  } finally {
    chatbot.setTyping(false);
  }
});
```

## Browser Support

- Chrome 63+
- Firefox 63+
- Safari 12+
- Edge 79+