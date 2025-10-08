import { css } from 'lit';

export default css`
  /* Import chatbot themes from shared theme system */

  :host {
    display: block;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: visible; /* Ensure no overflow hidden */
    
    /* Use shared theme variables from Carbon Design System */
    font-family: var(--chatbot-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif);
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Main container */
  .chat-container {
    display: flex;
    width: 100%;
    height: 100%;
    background-color: var(--nuraly-color-chatbot-background);
    border-radius: var(--nuraly-border-radius-chatbot);
    position: relative;
    border: 1px solid var(--nuraly-color-chatbot-border);
  }

  /* Boxed layout for large widths - ChatGPT style */
  :host(.boxed) {
    background-color: var(--nuraly-color-chatbot-boxed-background);
    padding: var(--nuraly-spacing-chatbot-boxed-padding);
  }

  :host(.boxed) .chat-container {
    width: 100%;
    max-width: none;
    background-color: transparent;
    border: none;
    border-radius: 0;
  }

  :host(.boxed) .chat-box {
    width: 100%;
    max-width: var(--nuraly-size-chatbot-boxed-max-width);
    margin: 0 auto;
  }

  :host(.boxed) .messages {
    width: 100%;
    max-width: var(--nuraly-size-chatbot-boxed-content-max-width);
    margin: 0 auto;
    padding: var(--nuraly-spacing-chatbot-boxed-content-padding);
    background-color: var(--nuraly-color-chatbot-background);
    border-radius: var(--nuraly-border-radius-chatbot-boxed);
    box-shadow: var(--nuraly-shadow-chatbot-boxed);
    margin-bottom: var(--nuraly-spacing-chatbot-boxed-padding);
  }

 

  :host(.boxed) .input-container {
    background-color: var(--nuraly-color-chatbot-input-background);
    border-radius: var(--nuraly-border-radius-chatbot-boxed);
    box-shadow: var(--nuraly-shadow-chatbot-boxed);
  }

  .chat-container--with-threads {
    grid-template-columns: var(--nuraly-size-chatbot-sidebar-width) 1fr;
  }

  .chat-container--disabled {
    opacity: var(--nuraly-opacity-chatbot-disabled, 0.5);
    pointer-events: none;
  }

  .chat-container--drag-over {
    background-color: var(--nuraly-color-chatbot-file-upload-background-hover);
    border: 2px dashed var(--nuraly-color-chatbot-accent);
    border-radius: var(--nuraly-border-radius-chatbot-file-upload);
  }

  /* Thread sidebar */
  .thread-sidebar {
    width: var(--nuraly-size-chatbot-sidebar-width);
    background-color: var(--nuraly-color-chatbot-sidebar-background);
    border-right: 1px solid var(--nuraly-color-chatbot-sidebar-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .thread-sidebar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--nuraly-spacing-chatbot-sidebar-padding);
    border-bottom: 1px solid var(--nuraly-color-chatbot-sidebar-border);
  }

  .thread-sidebar__header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: var(--nuraly-font-weight-semibold, 600);
    color: var(--nuraly-color-chatbot-sidebar-text);
  }

  .thread-list {
    flex: 1;
    overflow-y: auto;
    padding: var(--nuraly-spacing-chatbot-sidebar-padding);
  }

  .thread-item {
    padding: var(--nuraly-spacing-chatbot-sidebar-padding);
    border-radius: var(--nuraly-border-radius-chatbot);
    cursor: pointer;
    margin-bottom: var(--nuraly-spacing-chatbot-suggestions-gap);
    transition: background-color var(--nuraly-transition-chatbot-fast);
    border: 1px solid transparent;
  }

  .thread-item:hover {
    background-color: var(--nuraly-color-chatbot-thread-background-hover);
  }

  .thread-item--active {
    background-color: var(--nuraly-color-chatbot-thread-background-active);
    color: var(--nuraly-color-chatbot-thread-text-active);
    border-color: var(--nuraly-color-chatbot-accent);
  }

  .thread-item__title {
    font-weight: var(--nuraly-font-weight-medium, 500);
    font-size: var(--nuraly-font-size-chatbot-suggestion);
    margin-bottom: var(--nuraly-spacing-chatbot-suggestions-gap);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .thread-item__preview {
    font-size: var(--nuraly-font-size-chatbot-timestamp);
    color: var(--nuraly-color-chatbot-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: var(--nuraly-spacing-chatbot-suggestions-gap);
  }

  .thread-item--active .thread-item__preview {
    color: rgba(255, 255, 255, 0.8);
  }

  .thread-item__timestamp {
    font-size: var(--nuraly-font-size-chatbot-timestamp);
    color: var(--nuraly-color-chatbot-text-helper);
  }

  .thread-item--active .thread-item__timestamp {
    color: rgba(255, 255, 255, 0.6);
  }

  /* Main chat area */
  .chat-box {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    overflow: hidden;
    position: relative; /* For dropdown positioning */
  }

  /* Messages area */
  .messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0; /* Remove gap, we'll handle spacing in messages */
    background-color: var(--nuraly-color-chatbot-background);
      padding: 8px 12px;

  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 48px 24px;
  }

  .empty-state__content {
    color: var(--nuraly-color-chatbot-text-primary);
    font-size: 32px;
    font-weight: var(--nuraly-font-weight-semibold, 600);
    margin-bottom: 48px;
    letter-spacing: -0.02em;
  }

  /* Messages */
  .message {
    display: flex;
    flex-direction: column;
    max-width: var(--nuraly-size-chatbot-message-max-width);
    word-wrap: break-word;
    word-break: break-word; /* Ensure long words break */
    margin-bottom: var(--nuraly-spacing-chatbot-message-margin);
    position: relative;
    min-width: 0; /* Allow shrinking */
    flex-shrink: 0; /* Prevent unwanted shrinking */
  }

  .message.user {
    align-self: flex-end;
    align-items: flex-end;
  }

  .message.bot {
    align-self: flex-start;
    align-items: flex-start;
  }

  .message__content {
    padding: var(--nuraly-spacing-chatbot-message-padding-vertical) var(--nuraly-spacing-chatbot-message-padding-horizontal);
    border-radius: var(--nuraly-border-radius-chatbot-message);
    font-size: var(--nuraly-font-size-chatbot-message);
    line-height: var(--nuraly-line-height-chatbot-message);
    position: relative;
    font-weight: var(--nuraly-font-weight-normal, 400);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    width: 100%; /* Take full available width */
    box-sizing: border-box; /* Include padding in width */
    overflow-wrap: break-word; /* Handle long words */
  }

  .message.user .message__content {
    background-color: var(--nuraly-color-chatbot-message-user-background);
    color: var(--nuraly-color-chatbot-message-user-text);
    border-bottom-right-radius: 6px;
  }

  .message.bot .message__content {
    background-color: var(--nuraly-color-chatbot-message-bot-background);
    color: var(--nuraly-color-chatbot-message-bot-text);
    border-bottom-left-radius: 6px;
    border: 1px solid var(--nuraly-color-chatbot-message-bot-border);
  }

  .message.error .message__content {
    background-color: var(--nuraly-color-chatbot-message-error-background);
    color: var(--nuraly-color-chatbot-message-error-text);
    border: 1px solid var(--nuraly-color-chatbot-message-error-border);
  }

  .message__timestamp {
    font-size: var(--nuraly-font-size-chatbot-timestamp);
    color: var(--nuraly-color-chatbot-timestamp);
    margin-top: var(--nuraly-spacing-chatbot-timestamp-margin);
    font-weight: var(--nuraly-font-weight-normal, 400);
    opacity: var(--nuraly-opacity-chatbot-timestamp);
  }

  .message.user .message__timestamp {
    text-align: right;
  }

  .message.bot .message__timestamp {
    text-align: left;
  }

  .message__retry {
    margin-top: var(--nuraly-spacing-chatbot-suggestions-gap);
    align-self: flex-start;
  }

  /* Typing indicator */
  .message.loading .message__content {
    display: flex;
    align-items: center;
    gap: var(--chatbot-spacing-sm);
    background-color: var(--chatbot-bot-message-bg);
    color: var(--chatbot-bot-message-text);
  }

  .dots {
    display: flex;
    gap: 2px;
  }

  .dots span {
    width: 6px;
    height: 6px;
    background-color: var(--chatbot-text-secondary);
    border-radius: 50%;
    animation: typing-dots 1.4s infinite;
  }

  .dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

  .loading-text {
    font-style: italic;
    color: var(--chatbot-text-secondary);
  }

  @keyframes typing-dots {
    0%, 60%, 100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    30% {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Suggestions - ChatGPT style pills */
    /* Suggestions */
    .suggestion-container {
      display: flex;
      flex-wrap: wrap;
      gap: var(--nuraly-spacing-chatbot-suggestion-gap);
      margin-top: var(--nuraly-spacing-chatbot-suggestion-container-margin-top);
      max-width: var(--nuraly-size-chatbot-suggestions-max-width);
      margin-left: auto;
      margin-right: auto;
      justify-content: center;
      padding: 0 var(--nuraly-spacing-chatbot-container-padding);
    }

    .suggestion {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--nuraly-spacing-chatbot-suggestion-padding);
      background-color: var(--nuraly-color-chatbot-suggestion-background);
      color: var(--nuraly-color-chatbot-suggestion-text);
      border: 1px solid var(--nuraly-color-chatbot-suggestion-border);
      border-radius: var(--nuraly-border-radius-chatbot-suggestion);
      font-size: var(--nuraly-typography-chatbot-suggestion-font-size);
      font-weight: var(--nuraly-typography-chatbot-suggestion-font-weight);
      line-height: var(--nuraly-typography-chatbot-suggestion-line-height);
      cursor: pointer;
      transition: all var(--nuraly-animation-chatbot-transition-duration) var(--nuraly-animation-chatbot-transition-timing);
      user-select: none;
      white-space: nowrap;
      text-decoration: none;
      outline: none;
    }

    .suggestion:hover {
      background-color: var(--nuraly-color-chatbot-suggestion-background-hover);
      border-color: var(--nuraly-color-chatbot-suggestion-border-hover);
      transform: translateY(-1px);
      box-shadow: var(--nuraly-shadow-chatbot-suggestion-hover);
    }

    .suggestion:focus {
      outline: 2px solid var(--nuraly-color-chatbot-suggestion-focus);
      outline-offset: 2px;
    }

    .suggestion:active {
      transform: translateY(0);
      background-color: var(--nuraly-color-chatbot-suggestion-background-active);
    }

    .suggestion--disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }  /* File upload area */
  .file-upload-area {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.95);
    border: 2px dashed var(--chatbot-user-message-bg);
    border-radius: var(--chatbot-radius);
    z-index: 10;
  }

  .file-upload-area--visible {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .file-upload-area--drag-over {
    background-color: rgba(15, 98, 254, 0.1);
    border-color: var(--chatbot-user-message-bg);
  }

  .file-upload-area__content {
    text-align: center;
    padding: var(--chatbot-spacing-xl);
    color: var(--chatbot-text-primary);
  }

  .file-upload-area__content nr-icon {
    color: var(--chatbot-user-message-bg);
    margin-bottom: var(--chatbot-spacing-md);
  }

  .file-upload-area__help {
    font-size: 12px;
    color: var(--chatbot-text-secondary);
    margin: var(--chatbot-spacing-xs) 0;
  }

  /* Uploaded files */
  .uploaded-files {
    display: flex;
    flex-wrap: wrap;
    gap: var(--chatbot-spacing-sm);
    padding: var(--chatbot-spacing-sm);
    background-color: var(--chatbot-surface);
    border-radius: var(--chatbot-radius);
    margin-bottom: var(--chatbot-spacing-sm);
  }

  .uploaded-file {
    display: flex;
    align-items: center;
    gap: var(--chatbot-spacing-sm);
    padding: var(--chatbot-spacing-sm);
    background-color: var(--chatbot-background);
    border: 1px solid var(--chatbot-border);
    border-radius: var(--chatbot-radius);
    max-width: 200px;
  }

  .uploaded-file__preview {
    width: 32px;
    height: 32px;
    object-fit: cover;
    border-radius: var(--chatbot-spacing-xs);
  }

  .uploaded-file__icon {
    color: var(--chatbot-text-secondary);
  }

  .uploaded-file__info {
    flex: 1;
    min-width: 0;
  }

  .uploaded-file__name {
    font-size: 12px;
    font-weight: 500;
    color: var(--chatbot-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .uploaded-file__size {
    font-size: 11px;
    color: var(--chatbot-text-secondary);
  }

  .uploaded-file__progress {
    height: 2px;
    background-color: var(--chatbot-border);
    border-radius: 1px;
    overflow: hidden;
    margin-top: var(--chatbot-spacing-xs);
  }

  .uploaded-file__progress-bar {
    height: 100%;
    background-color: var(--chatbot-user-message-bg);
    transition: width 0.3s ease;
  }

  .uploaded-file__error {
    font-size: 11px;
    color: var(--chatbot-error-text);
    margin-top: var(--chatbot-spacing-xs);
  }

  .uploaded-file__remove {
    color: var(--chatbot-text-helper);
  }

  

  /* Input container - holds input row and action buttons row */
  .input-container {
    background-color: var(--nuraly-color-chatbot-input-background);
    border: 1px solid var(--nuraly-color-chatbot-input-border);
    border-radius: var(--nuraly-border-radius-chatbot-input);
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: visible; /* Allow dropdown to show outside container */
    position: relative; /* For dropdown positioning */
  }

  .input-container:focus-within {
    border-color: var(--nuraly-color-chatbot-input-border-focus);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* First row: Input text area */
  .input-row {
    display: flex;
    align-items: flex-start;
    padding: 16px 16px 8px 16px;
    min-height: 24px;
  }

  .chat-container--boxed .input-box {
    background-color: transparent;
    padding: var(--nuraly-spacing-chatbot-boxed-content-padding) 0;
  }

  .chat-container--boxed .input-container {
    width: 100%;
    max-width: var(--nuraly-size-chatbot-boxed-input-max-width, var(--nuraly-size-chatbot-boxed-content-max-width));
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
  }

  .chat-container--boxed .messages {
    max-width: var(--nuraly-size-chatbot-boxed-content-max-width);
    margin-left: auto;
    margin-right: auto;
  }

  .action-buttons-row {
    display: flex;
    align-items: center;
    justify-content: space-between; 
    gap: 12px;
    padding: 8px 16px 16px 16px;
    background-color: transparent;
    border-bottom-left-radius: var(--nuraly-border-radius-chatbot-input);
    border-bottom-right-radius: var(--nuraly-border-radius-chatbot-input);
  }

  .action-buttons-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .action-buttons-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* File upload dropdown styling */
  .action-buttons-row nr-dropdown {
    display: inline-block;
  }

  /* Module select styling */
  .module-select {
    min-width: 180px;
    max-width: 300px;
  }

  .module-display-placeholder {
    color: var(--nuraly-color-chatbot-text-secondary, #6f6f6f);
    font-size: 14px;
  }

  .module-display-single,
  .module-display-multiple {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--nuraly-color-chatbot-text, inherit);
  }

  .module-display-single nr-icon {
    font-size: 16px;
  }

  .module-display-multiple {
    font-weight: 500;
    color: var(--nuraly-color-chatbot-accent, var(--nuraly-color-primary));
  }

    /* Dropdown styling inside chatbot */
  .input-box__upload-dropdown {
    position: relative;
    z-index: var(--nuraly-z-index-chatbot-dropdown, 100);
  }

  .input-box__upload-dropdown ::part(panel) {
    background-color: var(--nuraly-color-chatbot-dropdown-panel-background);
    border: 1px solid var(--nuraly-color-chatbot-dropdown-panel-border);
    border-radius: var(--nuraly-border-radius-chatbot-dropdown-panel);
    box-shadow: var(--nuraly-shadow-chatbot-dropdown-panel);
    min-width: var(--nuraly-size-chatbot-dropdown-panel-min-width);
    position: fixed !important; /* Use fixed positioning to break out of containers */
    z-index: var(--nuraly-z-index-chatbot-dropdown, 100);
    transform: none !important;
  }

  .input-box__input {
    flex: 1;
    width: 100%;
    min-height: 24px;
    max-height: 120px;
    overflow-y: auto;
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--nuraly-color-chatbot-input-text);
    font-family: var(--nuraly-font-family-chatbot-input);
    font-size: var(--nuraly-font-size-chatbot-input);
    line-height: 1.4;
    resize: none;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .input-box__input:empty::before {
    content: attr(data-placeholder);
    color: var(--nuraly-color-chatbot-input-placeholder);
    pointer-events: none;
  }

  .input-box__input:focus {
    outline: none;
  }

  /* ChatGPT-style action buttons using nr-button with CSS variable overrides */
  .input-box__file-button,
  .input-box__send-button {
    /* Remove any default margins */
    margin: 0;
  }

  /* Target the actual button element inside nr-button components */
  .input-box__file-button button,
  .input-box__send-button button {
    background: transparent !important;
    border: 1px solid var(--nuraly-color-chatbot-action-button-border) !important;
    color: var(--nuraly-color-chatbot-action-button-text) !important;
    padding: 8px 12px !important;
    border-radius: var(--nuraly-border-radius-chatbot-action-button) !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    min-width: auto !important;
    height: auto !important;
    gap: 8px !important;
    transition: all 0.2s ease !important;
    white-space: nowrap !important;
  }

  /* Send button specific styling for more rounded appearance */
  .input-box__send-button button {
    border-radius: var(--nuraly-border-radius-chatbot-send-button) !important;
    background-color: var(--nuraly-color-chatbot-send-button-background) !important;
    color: var(--nuraly-color-chatbot-send-button-text) !important;
    border-color: var(--nuraly-color-chatbot-send-button-border) !important;
  }

  .input-box__file-button:hover button,
  .input-box__send-button:hover button {
    background-color: var(--nuraly-color-chatbot-action-button-background-hover) !important;
    border-color: var(--nuraly-color-chatbot-action-button-border-hover) !important;
    transform: scale(1.05);
  }

  /* Send button hover specific styling */
  .input-box__send-button:hover button {
    background-color: var(--nuraly-color-chatbot-send-button-background-hover) !important;
    border-color: var(--nuraly-color-chatbot-send-button-border-hover) !important;
  }

  .input-box__file-button:focus-within,
  .input-box__send-button:focus-within {
    outline: 2px solid var(--nuraly-color-chatbot-action-button-focus);
    outline-offset: 2px;
  }

  .input-box__send-button[disabled] button,
  .input-box__file-button[disabled] button {
    background-color: var(--nuraly-color-chatbot-action-button-background-disabled) !important;
    color: var(--nuraly-color-chatbot-action-button-text-disabled) !important;
    border-color: var(--nuraly-color-chatbot-action-button-border-disabled) !important;
    opacity: 0.6 !important;
    cursor: not-allowed !important;
  }

  /* Ensure icons are properly styled within the buttons */
  .input-box__send-button nr-icon,
  .input-box__file-button nr-icon {
    pointer-events: none;
  }

  /* RTL support */
  :host([dir='rtl']) .chat-container--with-threads {
    grid-template-columns: 1fr 280px;
  }

  :host([dir='rtl']) .thread-sidebar {
    border-right: none;
    border-left: 1px solid var(--chatbot-border);
  }

  :host([dir='rtl']) .message.user {
    align-self: flex-start;
  }

  :host([dir='rtl']) .message.bot {
    align-self: flex-end;
  }

  :host([dir='rtl']) .message.user .message__content {
    border-bottom-right-radius: var(--chatbot-radius);
    border-bottom-left-radius: var(--chatbot-spacing-xs);
  }

  :host([dir='rtl']) .message.bot .message__content {
    border-bottom-left-radius: var(--chatbot-radius);
    border-bottom-right-radius: var(--chatbot-spacing-xs);
  }

  :host([dir='rtl']) .message.user .message__timestamp {
    text-align: left;
  }

  :host([dir='rtl']) .message.bot .message__timestamp {
    text-align: right;
  }

  :host([dir='rtl']) .input-row {
    flex-direction: row-reverse;
  }

  /* Size variants */
  :host([data-size='small']) {
    --chatbot-spacing-md: 12px;
    font-size: 13px;
  }

  :host([data-size='large']) {
    --chatbot-spacing-md: 20px;
    font-size: 15px;
  }

  /* Variant styles */
  :host([data-variant='rounded']) {
    --chatbot-radius: 16px;
  }

  :host([data-variant='squared']) {
    --chatbot-radius: 4px;
  }

  /* Mode-specific styles */
  :host([data-mode='assistant']) .message.bot .message__content {
    background: linear-gradient(135deg, var(--chatbot-bot-message-bg), var(--chatbot-surface-hover));
  }

  :host([data-mode='assistant']) .suggestion {
    background: linear-gradient(135deg, var(--chatbot-surface), var(--chatbot-surface-hover));
  }

  /* Focus states */
  .chat-container--focused {
    outline: 2px solid var(--chatbot-user-message-bg);
    outline-offset: 2px;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .thread-sidebar {
      width: 240px;
    }
    
    .message {
      max-width: 90%;
    }
    
    .input-row {
      flex-wrap: wrap;
    }
  }

  @media (max-width: 480px) {
    .chat-container--with-threads {
      grid-template-columns: 1fr;
    }
    
    .thread-sidebar {
      display: none;
    }
    
    .message {
      max-width: 95%;
    }
    
    .uploaded-file {
      max-width: 150px;
    }
  }

  /* Dark theme support */
  @media (prefers-color-scheme: dark) {
    :host {
      --chatbot-background: var(--chatbot-color-background-dark, #161616);
      --chatbot-surface: var(--chatbot-color-surface-dark, #262626);
      --chatbot-surface-hover: var(--chatbot-color-surface-hover-dark, #353535);
      --chatbot-border: var(--chatbot-color-border-dark, #393939);
      --chatbot-text-primary: var(--chatbot-color-text-primary-dark, #f4f4f4);
      --chatbot-text-secondary: var(--chatbot-color-text-secondary-dark, #c6c6c6);
      --chatbot-text-helper: var(--chatbot-color-text-helper-dark, #8d8d8d);
      --chatbot-bot-message-bg: var(--chatbot-color-bot-message-bg-dark, #262626);
      --chatbot-bot-message-text: var(--chatbot-color-bot-message-text-dark, #f4f4f4);
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    :host {
      --chatbot-border: #000000;
      --chatbot-text-primary: #000000;
      --chatbot-user-message-bg: #0000ff;
      --chatbot-error-border: #ff0000;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

`;