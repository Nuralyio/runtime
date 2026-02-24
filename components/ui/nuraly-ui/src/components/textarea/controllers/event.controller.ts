/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseTextareaController, TextareaHost } from './base.controller.js';
import { ReactiveControllerHost } from 'lit';

/**
 * Extended textarea host interface for event handling
 */
export interface TextareaEventHost extends TextareaHost {
  readonly?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  autoResize?: boolean;
  placeholder?: string;
  shadowRoot?: ShadowRoot | null;
}

/**
 * Event controller manages all event handling for textarea components
 * This controller handles:
 * - Input event handling with debouncing
 * - Focus and blur state management
 * - Keyboard interactions (Enter, Escape, etc.)
 * - Clear functionality
 * - Auto-resize functionality
 * - Event dispatching and custom events
 */
export class TextareaEventController extends BaseTextareaController {
  private _hasFocus = false;
  private _inputDebounceMs = 150;
  private _inputTimeout?: ReturnType<typeof setTimeout>;
  private _clearButtonElement?: HTMLElement;
  private _textareaElement?: HTMLTextAreaElement;

  constructor(host: TextareaEventHost & ReactiveControllerHost) {
    super(host);
  }

  /**
   * Get the event host with extended interface
   */
  get eventHost(): TextareaEventHost & ReactiveControllerHost {
    return this._host as TextareaEventHost & ReactiveControllerHost;
  }

  /**
   * Get focus state
   */
  get hasFocus(): boolean {
    return this._hasFocus;
  }

  /**
   * Set input debounce delay
   */
  setInputDebounce(ms: number): void {
    this._inputDebounceMs = ms;
  }

  /**
   * Initialize event controller after host is connected
   */
  override hostConnected(): void {
    super.hostConnected();
    this.setupEventListeners();
  }

  /**
   * Cleanup event listeners on disconnect
   */
  override hostDisconnected(): void {
    super.hostDisconnected();
    this.cleanupEventListeners();
  }

  /**
   * Setup event listeners for the textarea
   */
  setupEventListeners(): void {
    this.safeExecute(() => {
      // Find textarea element
      const hostWithShadowRoot = this._host as any;
      this._textareaElement = hostWithShadowRoot.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement;
      this._clearButtonElement = hostWithShadowRoot.shadowRoot?.querySelector('.clear-button') as HTMLElement;

      if (this._textareaElement) {
        this.addTextareaEventListeners();
      }

      if (this._clearButtonElement && this.eventHost.clearable) {
        this.addClearButtonEventListeners();
      }
    }, 'setupEventListeners');
  }

  /**
   * Cleanup event listeners
   */
  cleanupEventListeners(): void {
    if (this._inputTimeout) {
      clearTimeout(this._inputTimeout);
      this._inputTimeout = undefined;
    }
  }

  /**
   * Handle input event with debouncing
   */
  handleInput(event: Event): void {
    if (this.eventHost.readonly || this.eventHost.disabled) {
      return;
    }

    const target = event.target as HTMLTextAreaElement;
    const newValue = target.value;

    // Clear any existing timeout
    if (this._inputTimeout) {
      clearTimeout(this._inputTimeout);
    }

    // Update value immediately for responsive UI
    this.eventHost.value = newValue;

    // Trigger auto-resize if enabled
    if (this.eventHost.autoResize) {
      this.handleAutoResize(target);
    }

    // Debounced input event dispatch
    this._inputTimeout = setTimeout(() => {
      this.dispatchInputEvent(newValue, event);
    }, this._inputDebounceMs);

    this.requestHostUpdate();
  }

  /**
   * Handle focus event
   */
  handleFocus(event: FocusEvent): void {
    if (this.eventHost.disabled) {
      return;
    }

    this._hasFocus = true;
    this.requestHostUpdate();
    this.dispatchFocusEvent(event);
  }

  /**
   * Handle blur event
   */
  handleBlur(event: FocusEvent): void {
    this._hasFocus = false;
    this.requestHostUpdate();
    this.dispatchBlurEvent(event);
  }

  /**
   * Handle keydown events
   */
  handleKeyDown(event: KeyboardEvent): void {
    if (this.eventHost.readonly || this.eventHost.disabled) {
      return;
    }

    const { key, ctrlKey, metaKey } = event;

    // Handle Escape key
    if (key === 'Escape') {
      this.handleEscape(event);
      return;
    }

    // Handle Ctrl/Cmd + Enter for submit
    if (key === 'Enter' && (ctrlKey || metaKey)) {
      this.handleSubmit(event);
      return;
    }

    this.dispatchKeydownEvent(event);
  }

  /**
   * Handle keyup events
   */
  handleKeyUp(event: KeyboardEvent): void {
    this.dispatchKeyupEvent(event);
  }

  /**
   * Handle paste events
   */
  handlePaste(event: ClipboardEvent): void {
    if (this.eventHost.readonly || this.eventHost.disabled) {
      event.preventDefault();
      return;
    }

    this.dispatchPasteEvent(event);
  }

  /**
   * Handle clear button click
   */
  handleClear(event?: Event): void {
    if (this.eventHost.readonly || this.eventHost.disabled) {
      return;
    }

    const previousValue = this.eventHost.value;
    this.eventHost.value = '';

    // Focus the textarea after clearing
    if (this._textareaElement) {
      this._textareaElement.focus();
    }

    this.requestHostUpdate();
    this.dispatchClearEvent(previousValue, event);
  }

  /**
   * Handle auto-resize functionality
   */
  handleAutoResize(textareaElement?: HTMLTextAreaElement): void {
    if (!this.eventHost.autoResize) {
      return;
    }

    const textarea = textareaElement || this._textareaElement;
    if (!textarea) {
      return;
    }

    this.safeExecute(() => {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Set the height to match the scroll height
      textarea.style.height = `${textarea.scrollHeight}px`;
    }, 'handleAutoResize');
  }

  /**
   * Focus the textarea programmatically
   */
  focus(): void {
    this.safeExecute(() => {
      this._textareaElement?.focus();
    }, 'focus');
  }

  /**
   * Blur the textarea programmatically
   */
  blur(): void {
    this.safeExecute(() => {
      this._textareaElement?.blur();
    }, 'blur');
  }

  /**
   * Select all text in the textarea
   */
  selectAll(): void {
    this.safeExecute(() => {
      this._textareaElement?.select();
    }, 'selectAll');
  }

  /**
   * Set cursor position
   */
  setCursorPosition(position: number): void {
    this.safeExecute(() => {
      if (this._textareaElement) {
        this._textareaElement.setSelectionRange(position, position);
      }
    }, 'setCursorPosition');
  }

  /**
   * Get cursor position
   */
  getCursorPosition(): number {
    return this._textareaElement?.selectionStart ?? 0;
  }

  /**
   * Add textarea event listeners
   */
  private addTextareaEventListeners(): void {
    if (!this._textareaElement) return;

    const textarea = this._textareaElement;

    textarea.addEventListener('input', this.handleInput.bind(this));
    textarea.addEventListener('focus', this.handleFocus.bind(this));
    textarea.addEventListener('blur', this.handleBlur.bind(this));
    textarea.addEventListener('keydown', this.handleKeyDown.bind(this));
    textarea.addEventListener('keyup', this.handleKeyUp.bind(this));
    textarea.addEventListener('paste', this.handlePaste.bind(this));
  }

  /**
   * Add clear button event listeners
   */
  private addClearButtonEventListeners(): void {
    if (!this._clearButtonElement) return;

    this._clearButtonElement.addEventListener('click', this.handleClear.bind(this));
  }

  /**
   * Handle Escape key press
   */
  private handleEscape(event: KeyboardEvent): void {
    this.blur();
    this.dispatchEscapeEvent(event);
  }

  /**
   * Handle submit (Ctrl/Cmd + Enter)
   */
  private handleSubmit(event: KeyboardEvent): void {
    this.dispatchSubmitEvent(event);
  }

  /**
   * Dispatch input event
   */
  private dispatchInputEvent(value: string, originalEvent: Event): void {
    const event = new CustomEvent('textarea-input', {
      detail: { 
        value, 
        originalEvent,
        cursorPosition: this.getCursorPosition()
      },
      bubbles: true,
      composed: true
    });

    this.safeExecute(() => this._host.dispatchEvent(event), 'dispatchInputEvent');
  }

  /**
   * Dispatch focus event
   */
  private dispatchFocusEvent(originalEvent: FocusEvent): void {
    const event = new CustomEvent('textarea-focus', {
      detail: { 
        originalEvent,
        value: this.eventHost.value
      },
      bubbles: true,
      composed: true
    });

    this.safeExecute(() => this._host.dispatchEvent(event), 'dispatchFocusEvent');
  }

  /**
   * Dispatch blur event
   */
  private dispatchBlurEvent(originalEvent: FocusEvent): void {
    const event = new CustomEvent('textarea-blur', {
      detail: { 
        originalEvent,
        value: this.eventHost.value
      },
      bubbles: true,
      composed: true
    });

    this.safeExecute(() => this._host.dispatchEvent(event), 'dispatchBlurEvent');
  }

  /**
   * Dispatch keydown event
   */
  private dispatchKeydownEvent(originalEvent: KeyboardEvent): void {
    const event = new CustomEvent('textarea-keydown', {
      detail: { 
        originalEvent,
        key: originalEvent.key,
        ctrlKey: originalEvent.ctrlKey,
        metaKey: originalEvent.metaKey,
        value: this.eventHost.value
      },
      bubbles: true,
      composed: true
    });

    this.safeExecute(() => this._host.dispatchEvent(event), 'dispatchKeydownEvent');
  }

  /**
   * Dispatch keyup event
   */
  private dispatchKeyupEvent(originalEvent: KeyboardEvent): void {
    const event = new CustomEvent('textarea-keyup', {
      detail: { 
        originalEvent,
        key: originalEvent.key,
        value: this.eventHost.value
      },
      bubbles: true,
      composed: true
    });

    this.safeExecute(() => this._host.dispatchEvent(event), 'dispatchKeyupEvent');
  }

  /**
   * Dispatch paste event
   */
  private dispatchPasteEvent(originalEvent: ClipboardEvent): void {
    const event = new CustomEvent('textarea-paste', {
      detail: { 
        originalEvent,
        value: this.eventHost.value
      },
      bubbles: true,
      composed: true
    });

    this.safeExecute(() => this._host.dispatchEvent(event), 'dispatchPasteEvent');
  }

  /**
   * Dispatch clear event
   */
  private dispatchClearEvent(previousValue: string, originalEvent?: Event): void {
    const event = new CustomEvent('textarea-clear', {
      detail: { 
        previousValue,
        originalEvent,
        value: this.eventHost.value
      },
      bubbles: true,
      composed: true
    });

    this.safeExecute(() => this._host.dispatchEvent(event), 'dispatchClearEvent');
  }

  /**
   * Dispatch escape event
   */
  private dispatchEscapeEvent(originalEvent: KeyboardEvent): void {
    const event = new CustomEvent('textarea-escape', {
      detail: { 
        originalEvent,
        value: this.eventHost.value
      },
      bubbles: true,
      composed: true
    });

    this.safeExecute(() => this._host.dispatchEvent(event), 'dispatchEscapeEvent');
  }

  /**
   * Dispatch submit event
   */
  private dispatchSubmitEvent(originalEvent: KeyboardEvent): void {
    const event = new CustomEvent('textarea-submit', {
      detail: { 
        originalEvent,
        value: this.eventHost.value
      },
      bubbles: true,
      composed: true
    });

    this.safeExecute(() => this._host.dispatchEvent(event), 'dispatchSubmitEvent');
  }
}