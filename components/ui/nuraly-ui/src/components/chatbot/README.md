# Chatbot Component

A versatile chatbot component with message handling, suggestions, typing indicators, and multi-language support. Built using NuralyUI components for consistent styling and behavior.

## Features

- **Message Management**: Handle user and bot messages with timestamps
- **Suggestions**: Interactive suggestion chips using nr-button for quick responses
- **Typing Indicators**: Visual feedback when bot is processing
- **Module Selection**: Multi-select dropdown for selecting AI modules/tools that interact with the chatbot
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
  chatbot.addEventListener('nr-chatbot-message-sent', (e) => {
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
| `enableModuleSelection` | `boolean` | `false` | Enable module selection dropdown |
| `modules` | `ChatbotModule[]` | `[]` | Available modules for selection |
| `selectedModules` | `string[]` | `[]` | Selected module IDs |
| `moduleSelectionLabel` | `string` | `'Select Modules'` | Label for module selection |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `nr-chatbot-message-sent` | `{ message: ChatbotMessage }` | User sent a message |
| `nr-chatbot-suggestion-clicked` | `{ suggestion: ChatbotSuggestion }` | Suggestion was selected |
| `nr-chatbot-retry-requested` | `{ message: ChatbotMessage }` | Retry requested for failed message |
| `nr-chatbot-input-changed` | `{ value: string }` | Input value changed |
| `nr-chatbot-input-focused` | `{ event: Event }` | Input received focus |
| `nr-chatbot-input-blurred` | `{ event: Event }` | Input lost focus |
| `nr-chatbot-modules-selected` | `{ metadata: { selectedModules, selectedModuleIds } }` | Module selection changed |

## Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `sendMessage(text: string)` | `text` | Programmatically send a message |
| `clearMessages()` | - | Clear all messages |
| `addMessage(message)` | `message` | Add a message programmatically |
| `setTyping(isTyping: boolean)` | `isTyping` | Set typing indicator state |
| `setModules(modules)` | `modules` | Set available modules |
| `getSelectedModules()` | - | Get selected module objects |
| `setSelectedModules(moduleIds)` | `moduleIds` | Set selected modules by IDs |
| `clearModuleSelection()` | - | Clear all module selections |
| `toggleModule(moduleId)` | `moduleId` | Toggle a single module |
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

chatbot.addEventListener('nr-chatbot-message-sent', async (e) => {
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

### Module Selection (Multi-Select)

The chatbot supports module selection via an integrated `nr-select` component with multi-select functionality. This allows users to choose which AI modules/tools should interact with the conversation.

**Custom Display Slot:** Use the `module-selected-display` slot to fully customize how selected modules are displayed. This gives you complete control over the UI.

```html
<nr-chatbot 
  id="chatbot"
  enableModuleSelection
  .modules=${modules}
  .selectedModules=${['nlp', 'search']}>
  
  <!-- Custom display for selected modules -->
  <span slot="module-selected-display" id="module-display">
    <!-- Your custom content here -->
  </span>
</nr-chatbot>

<script>
  const modules = [
    {
      id: 'nlp',
      name: 'Natural Language Processing',
      description: 'Advanced text analysis and understanding',
      icon: 'chat',
      enabled: true,
      metadata: { category: 'AI', version: '2.0' }
    },
    {
      id: 'vision',
      name: 'Computer Vision',
      description: 'Image and video analysis',
      icon: 'eye',
      enabled: true
    },
    {
      id: 'search',
      name: 'Web Search',
      description: 'Search the web for information',
      icon: 'search',
      enabled: true
    },
    {
      id: 'code',
      name: 'Code Analysis',
      description: 'Analyze and generate code',
      icon: 'code',
      enabled: true
    }
  ];

  const chatbot = document.getElementById('chatbot');
  chatbot.modules = modules;

  // Update display based on selection
  function updateModuleDisplay() {
    const selected = chatbot.getSelectedModules();
    const display = document.getElementById('module-display');
    
    if (selected.length === 0) {
      display.innerHTML = '<span style="color: #6f6f6f;">Select Modules</span>';
    } else if (selected.length === 1) {
      const module = selected[0];
      display.innerHTML = `
        ${module.icon ? `<nr-icon name="${module.icon}" style="font-size: 16px;"></nr-icon>` : ''}
        <span>${module.name}</span>
      `;
      display.style.display = 'flex';
      display.style.alignItems = 'center';
      display.style.gap = '6px';
    } else {
      display.innerHTML = `<strong style="color: var(--nuraly-color-primary);">${selected.length} modules selected</strong>`;
    }
  }

  // Listen for module selection changes
  chatbot.addEventListener('nr-chatbot-modules-selected', (e) => {
    console.log('Selected modules:', e.detail.metadata.selectedModules);
    console.log('Selected IDs:', e.detail.metadata.selectedModuleIds);
    
    // Update display
    updateModuleDisplay();
    
    // Update your backend or AI service with selected modules
    updateAIModules(e.detail.metadata.selectedModuleIds);
  });

  // Initial display
  updateModuleDisplay();

  // Programmatically set selected modules
  chatbot.setSelectedModules(['nlp', 'vision']);
  updateModuleDisplay();

  // Get current selected modules
  const selected = chatbot.getSelectedModules();
  console.log('Currently selected:', selected);

  // Clear selection
  chatbot.clearModuleSelection();
  updateModuleDisplay();
</script>
```

**Alternative: Using Reactive Frameworks (Lit, React, etc.)**

```html
<!-- Lit example -->
<nr-chatbot 
  .modules=${this.modules}
  .selectedModules=${this.selectedModules}
  enableModuleSelection
  @nr-chatbot-modules-selected=${this.handleModulesChanged}>
  
  <span slot="module-selected-display">
    ${this.renderModuleDisplay()}
  </span>
</nr-chatbot>

<script>
  renderModuleDisplay() {
    const count = this.selectedModules.length;
    const selected = this.selectedModules.map(id => 
      this.modules.find(m => m.id === id)
    ).filter(Boolean);
    
    if (count === 0) {
      return html`<span class="placeholder">Select Modules</span>`;
    }
    
    if (count === 1) {
      const module = selected[0];
      return html`
        ${module.icon ? html`<nr-icon name="${module.icon}"></nr-icon>` : nothing}
        <span>${module.name}</span>
      `;
    }
    
    return html`<strong>${count} modules selected</strong>`;
  }
</script>
```

**Module Selection Properties:**
- `enableModuleSelection` - Enable module selection dropdown
- `modules` - Array of available modules
- `selectedModules` - Array of selected module IDs
- `moduleSelectionLabel` - Label for the select button (default: "Select Modules")

**Module Selection Slots:**
- `module-selected-display` - Custom content for displaying selected modules

**Module Selection Events:**
- `nr-chatbot-modules-selected` - Fired when module selection changes

**Module Selection Methods:**
- `setModules(modules)` - Set available modules
- `getSelectedModules()` - Get selected module objects
- `setSelectedModules(moduleIds)` - Set selected modules by IDs
- `clearModuleSelection()` - Clear all selections
- `toggleModule(moduleId)` - Toggle a single module

**Custom Display Examples:**

1. **Simple Count Display:**
```html
<span slot="module-selected-display" id="count-display">0 selected</span>

<script>
  chatbot.addEventListener('nr-chatbot-modules-selected', updateDisplay);

  function updateDisplay() {
    const count = chatbot.getSelectedModules().length;
    document.getElementById('count-display').textContent = 
      count === 0 ? 'Select modules' : `${count} selected`;
  }
</script>
```

2. **Module Names List:**
```html
<span slot="module-selected-display" id="names-display"></span>

<script>
  function updateDisplay() {
    const selected = chatbot.getSelectedModules();
    const display = document.getElementById('names-display');
    
    if (selected.length === 0) {
      display.textContent = 'No modules selected';
    } else {
      display.textContent = selected.map(m => m.name).join(', ');
    }
  }
  
  chatbot.addEventListener('nr-chatbot-modules-selected', updateDisplay);
  updateDisplay();
</script>
```

3. **With Icons and Styling:**
```html
<div slot="module-selected-display" id="rich-display" 
     style="display: flex; align-items: center; gap: 8px;">
</div>

<script>
  function updateRichDisplay() {
    const selected = chatbot.getSelectedModules();
    const display = document.getElementById('rich-display');
    
    if (selected.length === 1) {
      const module = selected[0];
      display.innerHTML = `
        <nr-icon name="${module.icon || 'cube'}" 
                 style="color: var(--nuraly-color-primary);"></nr-icon>
        <span style="font-weight: 500;">${module.name}</span>
      `;
    } else if (selected.length > 1) {
      display.innerHTML = `
        <nr-icon name="cube" 
                 style="color: var(--nuraly-color-primary);"></nr-icon>
        <span style="font-weight: 500;">${selected.length} Active Modules</span>
      `;
    } else {
      display.innerHTML = `
        <span style="color: #9ca3af;">Choose modules...</span>
      `;
    }
  }
  
  chatbot.addEventListener('nr-chatbot-modules-selected', updateRichDisplay);
  updateRichDisplay();
</script>
```

## Browser Support

- Chrome 63+
- Firefox 63+
- Safari 12+
- Edge 79+