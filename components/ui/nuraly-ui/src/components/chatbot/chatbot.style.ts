import { css } from 'lit';

export default css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    min-width: var(--nuraly-size-chatbot-min-width, 320px);
    box-sizing: border-box;
    overflow: visible;
    
    font-family: var(--chatbot-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif);
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .chat-container {
    display: flex;
    width: 100%;
    height: 100%;
    background-color: var(--nuraly-color-chatbot-background);
    border-radius: var(--nuraly-border-radius-chatbot);
    position: relative;
    border: var(--nuraly-border-width-chatbot-input, 1px) solid var(--nuraly-color-chatbot-border);
  }

  .chatbot-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    min-width: 450px;
  }

  .chatbot-container--with-sidebar {
    flex-direction: row;
  }

  .chatbot-main {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .chatbot-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem;
    border-bottom: 1px solid var(--nuraly-color-chatbot-border, #e0e0e0);
  }

  .chatbot-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  :host([boxed]) .chat-container {
    background-color: transparent;
    border: none;
    border-radius: 0;
  }

  :host([boxed]) .chatbot-container {
    width: 100%;
  }

  :host([boxed]) .chatbot-main {
    width: 100%;
    max-width: var(--nuraly-size-chatbot-boxed-max-width, 768px);
    margin: 0 auto;
    background-color: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
    height: 100%;
  }

  /* Boxed layout with threads: white background for entire container */
  :host([boxed]) .chat-container--boxed.chat-container--with-threads {
    background-color: #ffffff;
  }

  .chat-container--boxed.chat-container--with-threads .chatbot-main {
    background-color: #ffffff;
  }

  .chat-container--boxed.chat-container--with-threads .chat-box {
    background-color: #ffffff;
  }

  .chat-container--boxed.chat-container--with-threads .messages {
    background-color: #ffffff;
  }

  .chat-container--boxed.chat-container--with-threads .input-container {
    background-color: #ffffff;
  }

  :host([boxed]) .chatbot-header {
    /* Keep header at the top */
    flex: 0 0 auto;
    border-bottom: none;
  }

  :host([boxed]) .chatbot-content:has(.empty-state) {
    /* Don't let content flex grow when empty */
    flex: 0 0 auto;
  }

  :host([boxed]) .chatbot-content:not(:has(.empty-state)) {
    /* Normal flex behavior when messages exist */
    flex: 1;
    min-height: 0;
  }

  :host([boxed]) .chatbot-main:has(.empty-state) {
    /* Make main container relative for absolute positioning */
    position: relative;
  }

  :host([boxed]) .empty-state {
    /* Position empty state in the center - moved up */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, calc(-50% - 80px));
    width: 100%;
    max-width: var(--nuraly-size-chatbot-boxed-max-width, 768px);
    height: auto;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--nuraly-spacing-06, 1.5rem);
  }

  :host([boxed]) .empty-state__content {
    margin-bottom: 0;
  }

  :host([boxed]) .chatbot-content:has(.empty-state) + .input-box {
    /* Position input-box in the middle with empty state - moved up */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, calc(-50% + 40px));
    width: 100%;
    max-width: var(--nuraly-size-chatbot-boxed-max-width, 768px);
  }

  :host([boxed]) .suggestion-container {
    margin-top: 0;
  }

  :host([boxed]) .messages {
    box-shadow: none;
    margin-bottom: 0;
    background-color: transparent;
    align-items: stretch;
    width: 98%;
    padding: var(--nuraly-spacing-chatbot-message-padding, 8px) var(--nuraly-spacing-06, 1.5rem);
  }

  :host([boxed]) .input-container {
    box-shadow: none;
    margin: 0;
    background-color: transparent;
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
    border: var(--nuraly-spacing-02, 0.25rem) dashed var(--nuraly-color-chatbot-accent);
    border-radius: var(--nuraly-border-radius-chatbot-file-upload);
  }

  .thread-sidebar {
    width: var(--nuraly-size-chatbot-sidebar-width);
    background-color: var(--nuraly-color-chatbot-sidebar-background);
    border-right: var(--nuraly-border-width-chatbot-message, 1px) solid var(--nuraly-color-chatbot-sidebar-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .thread-sidebar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--nuraly-spacing-chatbot-sidebar-padding);
    border-bottom: var(--nuraly-border-width-chatbot-message, 1px) solid var(--nuraly-color-chatbot-sidebar-border);
  }

  .thread-sidebar__header h3 {
    margin: 0;
    font-size: var(--nuraly-font-size-03, 1rem);
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
    border: var(--nuraly-border-width-chatbot-message, 1px) solid transparent;
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

  .chat-box {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;
    background-color: var(--nuraly-color-chatbot-background);
    padding: var(--nuraly-spacing-chatbot-message-padding, 8px 12px);
    justify-content: flex-start; /* Always align messages to top */
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1; /* Take full height when empty */
    text-align: center;
    padding: var(--nuraly-spacing-09, 3rem) var(--nuraly-spacing-06, 1.5rem);
  }

  .empty-state__content {
    color: var(--nuraly-color-chatbot-text-primary);
    font-size: var(--nuraly-font-size-08, 2rem);
    font-weight: var(--nuraly-font-weight-semibold, 600);
    margin-bottom: var(--nuraly-spacing-09, 3rem);
    letter-spacing: -0.02em;
  }

  .message {
    display: flex;
    flex-direction: column;
    max-width: var(--nuraly-size-chatbot-message-max-width);
    word-wrap: break-word;
    word-break: break-word;
    margin-bottom: var(--nuraly-spacing-chatbot-message-margin);
    position: relative;
    min-width: 0;
    flex-shrink: 0;
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
    padding: var(--nuraly-spacing-chatbot-message-padding-vertical, var(--nuraly-spacing-chatbot-message-padding)) var(--nuraly-spacing-chatbot-message-padding-horizontal, var(--nuraly-spacing-chatbot-message-padding));
    border-radius: var(--nuraly-border-radius-chatbot-message, 0);
    font-size: var(--nuraly-font-size-chatbot-message);
    line-height: var(--nuraly-line-height-chatbot-message);
    position: relative;
    font-weight: var(--nuraly-font-weight-normal, 400);
    box-shadow: var(--nuraly-shadow-chatbot-message, none);
    width: 100%;
    box-sizing: border-box;
    overflow-wrap: break-word;
    background-color: var(--nuraly-color-chatbot-message-background, transparent);
    color: var(--nuraly-color-chatbot-message-text, inherit);
    border: var(--nuraly-border-width-chatbot-message, 0) solid var(--nuraly-color-chatbot-message-border, transparent);
  }

  .message.user .message__content {
    background-color: var(--nuraly-color-chatbot-message-user-background);
    color: var(--nuraly-color-chatbot-message-user-text);
    border-radius: var(--nuraly-border-radius-chatbot-message-user, var(--nuraly-border-radius-chatbot-message, 0));
    border: var(--nuraly-border-width-chatbot-message-user, var(--nuraly-border-width-chatbot-message, 0)) solid var(--nuraly-color-chatbot-message-user-border, transparent);
    box-shadow: var(--nuraly-shadow-chatbot-message-user, var(--nuraly-shadow-chatbot-message, none));
  }

  .message.bot .message__content {
    background-color: var(--nuraly-color-chatbot-message-bot-background, transparent);
    color: var(--nuraly-color-chatbot-message-bot-text, inherit);
    border-radius: var(--nuraly-border-radius-chatbot-message-bot, var(--nuraly-border-radius-chatbot-message, 0));
    border: var(--nuraly-border-width-chatbot-message-bot, var(--nuraly-border-width-chatbot-message, 0)) solid var(--nuraly-color-chatbot-message-bot-border, transparent);
    box-shadow: var(--nuraly-shadow-chatbot-message-bot, var(--nuraly-shadow-chatbot-message, none));
  }

  .message.error .message__content {
    background-color: var(--nuraly-color-chatbot-message-error-background, transparent);
    color: var(--nuraly-color-chatbot-message-error-text, inherit);
    border-radius: var(--nuraly-border-radius-chatbot-message-error, var(--nuraly-border-radius-chatbot-message, 0));
    border: var(--nuraly-border-width-chatbot-message-error, var(--nuraly-border-width-chatbot-message, 0)) solid var(--nuraly-color-chatbot-message-error-border, transparent);
    box-shadow: var(--nuraly-shadow-chatbot-message-error, var(--nuraly-shadow-chatbot-message, none));
  }

  /* Message footer - contains timestamp and copy icon */
  .message__footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: var(--nuraly-spacing-chatbot-timestamp-margin);
  }

  .message.user .message__footer {
    justify-content: flex-end;
  }

  .message.bot .message__footer {
    justify-content: flex-start;
  }

  .message__timestamp {
    font-size: var(--nuraly-font-size-chatbot-timestamp);
    color: var(--nuraly-color-chatbot-timestamp);
    font-weight: var(--nuraly-font-weight-normal, 400);
    opacity: var(--nuraly-opacity-chatbot-timestamp);
  }

  .message__copy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer !important;
    pointer-events: auto !important;
    opacity: 0;
    visibility: hidden;
    transition: opacity var(--nuraly-transition-fast, 0.15s) ease, visibility var(--nuraly-transition-fast, 0.15s) ease;
    color: var(--nuraly-color-chatbot-timestamp);
  }

  .message:hover .message__copy {
    opacity: 1;
    visibility: visible;
  }

  .message__copy:hover {
    cursor: pointer !important;
  }

  .message__copy:focus {
    outline: 2px solid var(--nuraly-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .message__retry {
    margin-top: var(--nuraly-spacing-chatbot-suggestions-gap);
    align-self: flex-start;
  }

  .message.loading .message__content {
    display: flex;
    align-items: center;
    gap: var(--chatbot-spacing-sm);
    background-color: var(--chatbot-bot-message-bg);
    /* Set indicator color (affects spinner currentColor) */
    color: var(--chatbot-loading-indicator-color, var(--nuraly-color-chatbot-accent, var(--chatbot-text-secondary)));
  }

  .dots {
    display: flex;
    gap: var(--nuraly-spacing-01, 0.125rem);
  }

  .dots span {
    width: var(--nuraly-spacing-03, 0.5rem);
    height: var(--nuraly-spacing-03, 0.5rem);
    background-color: currentColor;
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

  /* Spinner indicator (for loadingIndicator = Spinner) */
  .spinner {
    --_size: var(--chatbot-spinner-size, 1.25rem);
    --_bw: var(--chatbot-spinner-border-width, 2px);
    --_color: var(--chatbot-spinner-color, currentColor);
    --_speed: var(--chatbot-spinner-speed, 0.8s);

    display: inline-block;
    width: var(--_size);
    height: var(--_size);
    border: var(--_bw) solid transparent;
    border-top-color: var(--_color);
    border-radius: 50%;
    animation: chatbot-spin var(--_speed) linear infinite;
  }

  @keyframes chatbot-spin {
    to { transform: rotate(360deg); }
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
      border: var(--nuraly-border-width-chatbot-message, 1px) solid var(--nuraly-color-chatbot-suggestion-border);
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
      outline: var(--nuraly-spacing-02, 0.25rem) solid var(--nuraly-color-chatbot-suggestion-focus);
      outline-offset: var(--nuraly-spacing-02, 0.25rem);
    }

    .suggestion:active {
      transform: translateY(0);
      background-color: var(--nuraly-color-chatbot-suggestion-background-active);
    }

    .suggestion--disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }  
  .file-upload-area {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.95);
    border: var(--nuraly-spacing-02, 0.25rem) dashed var(--chatbot-user-message-bg);
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
    font-size: var(--nuraly-font-size-01, 0.75rem);
    color: var(--chatbot-text-secondary);
    margin: var(--chatbot-spacing-xs) 0;
  }

  .uploaded-files {
    display: flex;
    flex-wrap: wrap;
    gap: var(--chatbot-spacing-sm);
    padding: var(--chatbot-spacing-sm);
    background-color: var(--chatbot-surface);
  }

  .uploaded-file {
    display: flex;
    align-items: center;
    gap: var(--chatbot-spacing-sm);
    padding: var(--chatbot-spacing-sm);
    background-color: var(--chatbot-background);
    border: var(--nuraly-border-width-chatbot-message, 1px) solid var(--chatbot-border);
    border-radius: var(--chatbot-radius);
    max-width: var(--nuraly-spacing-chatbot-file-upload-preview-size, 200px);
  }

  .uploaded-file__preview {
    width: var(--nuraly-size-chatbot-send-button-width, 32px);
    height: var(--nuraly-size-chatbot-send-button-height, 32px);
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
    font-size: var(--nuraly-font-size-01, 0.75rem);
    font-weight: 500;
    color: var(--chatbot-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .uploaded-file__size {
    font-size: var(--nuraly-font-size-chatbot-file-size, 11px);
    color: var(--chatbot-text-secondary);
  }

  .uploaded-file__progress {
    height: var(--nuraly-spacing-01, 0.125rem);
    background-color: var(--chatbot-border);
    border-radius: var(--nuraly-spacing-01, 0.125rem);
    overflow: hidden;
    margin-top: var(--chatbot-spacing-xs);
  }

  .uploaded-file__progress-bar {
    height: 100%;
    background-color: var(--chatbot-user-message-bg);
    transition: width 0.3s ease;
  }

  .uploaded-file__error {
    font-size: var(--nuraly-font-size-chatbot-file-size, 11px);
    color: var(--chatbot-error-text);
    margin-top: var(--chatbot-spacing-xs);
  }

  .uploaded-file__remove {
    color: var(--chatbot-text-helper);
  }

  

  .input-container {
    background-color: var(--nuraly-color-chatbot-input-background);
    border: var(--nuraly-border-width-chatbot-input, 1px) solid var(--nuraly-color-chatbot-input-border);
    border-radius: var(--nuraly-border-radius-chatbot-input);
    transition: var(--nuraly-transition-chatbot-all, all 0.2s ease);
    box-shadow: var(--nuraly-shadow-chatbot-input, 0 2px 8px rgba(0, 0, 0, 0.1));
    overflow: visible;
    position: relative;
    min-width: var(--nuraly-size-chatbot-input-min-width, 280px);
  }

  .context-tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--nuraly-spacing-03, 0.5rem);
    padding: var(--nuraly-spacing-04, 0.75rem) var(--nuraly-spacing-05, 1rem) 0 var(--nuraly-spacing-05, 1rem);
  }
  .context-tag {
    --nuraly-tag-font-size: var(--nuraly-font-size-01, 0.75rem);
    --nuraly-tag-padding-x: var(--nuraly-spacing-03, 0.5rem);
    --nuraly-tag-padding-y: 0;
  }

  .input-container:focus-within {
    border-color: var(--nuraly-color-chatbot-input-border-focus);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .input-row {
    display: flex;
    align-items: flex-start;
    padding: var(--nuraly-spacing-05, 1rem) var(--nuraly-spacing-05, 1rem) var(--nuraly-spacing-03, 0.5rem) var(--nuraly-spacing-05, 1rem);
    min-height: var(--nuraly-spacing-06, 1.5rem);
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

  :host(:not([boxed])) .input-container {
    border-radius: var(--nuraly-border-radius-md, 12px);
    margin: var(--nuraly-spacing-05, 1rem);
    box-sizing: border-box;
    width: calc(100% - 2 * var(--nuraly-spacing-05, 1rem));
  }

  :host(:not([boxed])) .action-buttons-row {
    border-bottom-left-radius: var(--nuraly-border-radius-md, 12px);
    border-bottom-right-radius: var(--nuraly-border-radius-md, 12px);
  }

  :host(:not([boxed])) .messages {
    padding: var(--nuraly-spacing-05, 1rem) !important;
    width: 100%;
    box-sizing: border-box;
  }

  .action-buttons-row {
    display: flex;
    align-items: center;
    justify-content: space-between; 
    gap: var(--nuraly-spacing-04, 0.75rem);
    padding: var(--nuraly-spacing-03, 0.5rem) var(--nuraly-spacing-05, 1rem) var(--nuraly-spacing-05, 1rem) var(--nuraly-spacing-05, 1rem);
    background-color: transparent;
    border-bottom-left-radius: var(--nuraly-border-radius-chatbot-input);
    border-bottom-right-radius: var(--nuraly-border-radius-chatbot-input);
    min-width: var(--nuraly-size-chatbot-actions-min-width, 240px);
  }

  .action-buttons-left {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-03, 0.5rem);
  }

  .action-buttons-right {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-03, 0.5rem);
    min-width: calc(var(--nuraly-size-md, 40px) + var(--nuraly-spacing-03, 0.5rem));
    justify-content: flex-end;
  }

  .action-buttons-row nr-dropdown {
    display: inline-flex;
    align-items: center;
    --nuraly-size-md: 40px; /* Match select height */
  }

  /* Module select styling */
  .module-select {
    max-width: var(--nuraly-size-chatbot-module-select-max-width, 300px);
  }

  /* Ensure buttons in action row match select height */
  .action-buttons-row nr-button {
    --nuraly-size-md: 40px; /* Match select height */
  }

  .module-display-placeholder {
    color: var(--nuraly-color-chatbot-text-secondary, #6f6f6f);
    font-size: var(--nuraly-font-size-02, 0.875rem); /* 14px */
  }

  .module-display-single,
  .module-display-multiple {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-03, 0.5rem); /* 6px */
    font-size: var(--nuraly-font-size-02, 0.875rem); /* 14px */
    color: var(--nuraly-color-chatbot-text, inherit);
  }

  .module-display-single nr-icon {
    font-size: var(--nuraly-font-size-03, 1rem); /* 16px */
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
    border: var(--nuraly-border-width-chatbot-message, 1px) solid var(--nuraly-color-chatbot-dropdown-panel-border);
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
    min-height: var(--nuraly-spacing-06, 1.5rem); /* 24px */
    max-height: var(--nuraly-size-chatbot-input-max-height, 120px);
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
    border: var(--nuraly-border-width-chatbot-message, 1px) solid var(--nuraly-color-chatbot-action-button-border) !important;
    color: var(--nuraly-color-chatbot-action-button-text) !important;
    padding: var(--nuraly-spacing-chatbot-action-button-padding, var(--nuraly-spacing-03, 0.5rem) var(--nuraly-spacing-04, 0.75rem)) !important; /* 8px 12px */
    border-radius: var(--nuraly-border-radius-chatbot-action-button) !important;
    font-size: var(--nuraly-font-size-02, 0.875rem) !important; /* 14px */
    font-weight: 500 !important;
    min-width: auto !important;
    height: auto !important;
    gap: var(--nuraly-spacing-03, 0.5rem) !important; /* 8px */
    transition: var(--nuraly-transition-chatbot-all, all 0.2s ease) !important;
    white-space: nowrap !important;
  }

  /* Send button specific styling for more rounded appearance */
  .input-box__send-button button {
    border-radius: var(--nuraly-border-radius-chatbot-send-button) !important;
    background-color: var(--nuraly-color-chatbot-send-button-background) !important;
    color: var(--nuraly-color-chatbot-send-button-text) !important;
    border-color: var(--nuraly-color-chatbot-send-button-border) !important;
    width: var(--nuraly-size-md, 40px) !important; /* Match other button widths */
    height: var(--nuraly-size-md, 40px) !important; /* Match other button heights */
    min-width: var(--nuraly-size-md, 40px) !important; /* Prevent shrinking */
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
    outline: var(--nuraly-spacing-02, 0.25rem) solid var(--nuraly-color-chatbot-action-button-focus); /* 2px */
    outline-offset: var(--nuraly-spacing-02, 0.25rem); /* 2px */
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
    border-left: var(--nuraly-border-width-chatbot-message, 1px) solid var(--chatbot-border);
  }

  :host([dir='rtl']) .message.user {
    align-self: flex-start;
  }

  :host([dir='rtl']) .message.bot {
    align-self: flex-end;
  }

  :host([dir='rtl']) .message.user .message__content {
    border-radius: var(--nuraly-border-radius-chatbot-message-user-rtl, var(--nuraly-border-radius-chatbot-message-user, var(--nuraly-border-radius-chatbot-message, 0)));
  }

  :host([dir='rtl']) .message.bot .message__content {
    border-radius: var(--nuraly-border-radius-chatbot-message-bot-rtl, var(--nuraly-border-radius-chatbot-message-bot, var(--nuraly-border-radius-chatbot-message, 0)));
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
    --chatbot-spacing-md: var(--nuraly-spacing-04, 0.75rem); /* 12px */
    font-size: var(--nuraly-font-size-chatbot-small, 13px);
  }

  :host([data-size='large']) {
    --chatbot-spacing-md: var(--nuraly-spacing-chatbot-large, 20px);
    font-size: var(--nuraly-font-size-chatbot-message, 15px);
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