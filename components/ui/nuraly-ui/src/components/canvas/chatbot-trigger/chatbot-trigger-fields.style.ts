/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

export const chatbotTriggerFieldStyles = css`
  :host {
    display: block;
    font-family: var(--nuraly-font-family, system-ui, -apple-system, sans-serif);
  }

  /* Common field styles */
  .field-container {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .field-label {
    font-size: var(--nuraly-font-size-sm, 13px);
    font-weight: 500;
    color: var(--nuraly-color-text-secondary, #64748b);
  }

  .field-description {
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-muted, #94a3b8);
    margin-top: var(--nuraly-spacing-1, 4px);
  }

  /* Event checkbox list */
  .event-list {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .event-item {
    display: flex;
    align-items: flex-start;
    gap: var(--nuraly-spacing-3, 12px);
    padding: var(--nuraly-spacing-3, 12px);
    background: var(--nuraly-color-bg-subtle, #f8fafc);
    border: 1px solid var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-md, 6px);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .event-item:hover {
    background: var(--nuraly-color-bg-hover, #f1f5f9);
    border-color: var(--nuraly-color-border-strong, #cbd5e1);
  }

  .event-item.selected {
    background: rgba(99, 102, 241, 0.1);
    border-color: var(--nuraly-color-primary, #6366f1);
  }

  .event-item-checkbox {
    margin-top: 2px;
  }

  .event-item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-1, 4px);
  }

  .event-item-header {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .event-item-icon {
    color: var(--nuraly-color-text-muted, #94a3b8);
  }

  .event-item.selected .event-item-icon {
    color: var(--nuraly-color-primary, #6366f1);
  }

  .event-item-label {
    font-size: var(--nuraly-font-size-sm, 13px);
    font-weight: 500;
    color: var(--nuraly-color-text-primary, #1e293b);
  }

  .event-item-description {
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-muted, #94a3b8);
  }

  /* Suggestion list */
  .suggestion-list {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .suggestion-item {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: var(--nuraly-spacing-2, 8px);
    align-items: center;
    padding: var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-bg-elevated, #ffffff);
    border: 1px solid var(--nuraly-color-border-light, #f1f5f9);
    border-radius: var(--nuraly-border-radius-sm, 4px);
  }

  .suggestion-item-drag {
    cursor: grab;
    color: var(--nuraly-color-text-muted, #94a3b8);
    padding: var(--nuraly-spacing-1, 4px);
  }

  .suggestion-item-drag:active {
    cursor: grabbing;
  }

  /* Toggle switch styling */
  .toggle-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--nuraly-spacing-2, 8px) 0;
  }

  .toggle-label {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-1, 4px);
  }

  .toggle-label-text {
    font-size: var(--nuraly-font-size-sm, 13px);
    font-weight: 500;
    color: var(--nuraly-color-text-primary, #1e293b);
  }

  .toggle-label-desc {
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-muted, #94a3b8);
  }

  /* Toggle switch */
  .toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
    background: var(--nuraly-color-bg-subtle, #e2e8f0);
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .toggle-switch.active {
    background: var(--nuraly-color-primary, #6366f1);
  }

  .toggle-switch-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease;
  }

  .toggle-switch.active .toggle-switch-knob {
    transform: translateX(20px);
  }

  /* Preview card */
  .chatbot-preview {
    padding: var(--nuraly-spacing-4, 16px);
    background: var(--nuraly-color-bg-subtle, #f8fafc);
    border: 1px solid var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-lg, 8px);
    text-align: center;
  }

  .chatbot-preview-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: var(--nuraly-border-radius-md, 6px);
    color: white;
    margin-bottom: var(--nuraly-spacing-3, 12px);
  }

  .chatbot-preview-title {
    font-size: var(--nuraly-font-size-md, 14px);
    font-weight: 600;
    color: var(--nuraly-color-text-primary, #1e293b);
    margin-bottom: var(--nuraly-spacing-1, 4px);
  }

  .chatbot-preview-subtitle {
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-muted, #94a3b8);
  }

  /* Add button */
  .add-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--nuraly-spacing-1, 4px);
    padding: var(--nuraly-spacing-1, 4px) var(--nuraly-spacing-2, 8px);
    background: transparent;
    border: 1px dashed var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    cursor: pointer;
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-secondary, #64748b);
    transition: border-color 0.15s ease, color 0.15s ease;
  }

  .add-btn:hover {
    border-color: var(--nuraly-color-primary, #6366f1);
    color: var(--nuraly-color-primary, #6366f1);
  }

  /* Remove button */
  .remove-btn {
    padding: var(--nuraly-spacing-1, 4px);
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--nuraly-color-text-muted, #94a3b8);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    transition: color 0.15s ease, background 0.15s ease;
  }

  .remove-btn:hover {
    color: var(--nuraly-color-error, #ef4444);
    background: rgba(239, 68, 68, 0.1);
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--nuraly-spacing-6, 24px);
    text-align: center;
    color: var(--nuraly-color-text-muted, #94a3b8);
    border: 1px dashed var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-md, 6px);
  }

  .empty-state nr-icon {
    margin-bottom: var(--nuraly-spacing-2, 8px);
    opacity: 0.5;
  }

  .empty-state-text {
    font-size: var(--nuraly-font-size-sm, 13px);
  }

  /* Size/variant selector */
  .option-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--nuraly-spacing-2, 8px);
  }

  .option-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--nuraly-spacing-1, 4px);
    padding: var(--nuraly-spacing-3, 12px);
    background: var(--nuraly-color-bg-subtle, #f8fafc);
    border: 2px solid var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-md, 6px);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .option-card:hover {
    border-color: var(--nuraly-color-border-strong, #cbd5e1);
  }

  .option-card.selected {
    border-color: var(--nuraly-color-primary, #6366f1);
    background: rgba(99, 102, 241, 0.05);
  }

  .option-card-label {
    font-size: var(--nuraly-font-size-xs, 11px);
    font-weight: 500;
    color: var(--nuraly-color-text-primary, #1e293b);
  }

  /* Dark theme overrides */
  :host([data-theme="dark"]) .event-item,
  :host([data-theme="dark"]) .chatbot-preview {
    background: var(--nuraly-color-bg-subtle-dark, #1e293b);
    border-color: var(--nuraly-color-border-dark, #334155);
  }

  :host([data-theme="dark"]) .event-item:hover {
    background: var(--nuraly-color-bg-hover-dark, #334155);
  }

  :host([data-theme="dark"]) .suggestion-item {
    background: var(--nuraly-color-bg-elevated-dark, #0f172a);
    border-color: var(--nuraly-color-border-dark, #334155);
  }
`;
