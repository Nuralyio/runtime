/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotPlugin } from '../core/types.js';

/**
 * Base class for Chatbot plugins with handy utilities.
 * - Provides one-time-per-conversation style injection with a data-marker.
 */
export abstract class ChatPluginBase implements ChatbotPlugin {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly version: string;

  // Per-conversation style injection tracking
  private _stylesInjected = false;
  private _lastThreadId?: string;

  /**
   * Returns a <style> tag only once per conversation (thread) to avoid duplicates.
   * Adds a data attribute marker to the style tag for easy detection.
   *
   * Usage: const styleTag = this.getOncePerConversationStyleTag(cssString)
   */
  protected getOncePerConversationStyleTag(css: string, hostSelector = 'nr-chatbot'): string {
    // Compute a stable data attribute unique to this plugin id
    const markerAttr = `data-plugin-styles-${this.id}`;

    // Best-effort check inside the host shadowRoot for an existing marker
    let markerFound = false;
    try {
      const host = document.querySelector(hostSelector) as (HTMLElement & { shadowRoot?: ShadowRoot }) | null;
      const hasMarker = host?.shadowRoot?.querySelector(`style[${markerAttr}]`);
      markerFound = !!hasMarker;
    } catch {
      // ignore DOM access errors
    }

    if (!this._stylesInjected && !markerFound) {
      this._stylesInjected = true;
      return `<style ${markerAttr}="true">${css}</style>`;
    }
    return '';
  }

  /**
   * Reset style injection flag when conversation (thread) changes.
   * This relies on ChatbotState.currentThreadId presence.
   */
  onStateChange?(state: Readonly<any>): void {
    try {
      const currentThreadId = (state as any)?.currentThreadId;
      if (currentThreadId !== this._lastThreadId) {
        this._lastThreadId = currentThreadId;
        this._stylesInjected = false;
      }
    } catch {
      // best-effort only
    }
  }

  onInit?(): void;
  onDestroy?(): void;
  onMessageSent?(message: any): void | Promise<void>;
  onMessageReceived?(message: any): void | Promise<void>;
  beforeSend?(text: string): string | Promise<string>;
  afterReceive?(text: string): string | Promise<string>;
  onError?(error: Error): void;

  // HTML-like block streaming support
  htmlTags?: Array<{ name: string; open: string; close: string }>;
  renderHtmlBlock?(name: string, content: string): string;
}
