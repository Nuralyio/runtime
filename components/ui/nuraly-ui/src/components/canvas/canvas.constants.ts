/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

// ==================== Frame Defaults ====================
export const FRAME_DEFAULT_WIDTH = 400;
export const FRAME_DEFAULT_HEIGHT = 300;
export const FRAME_DEFAULT_BG_COLOR = 'rgba(99, 102, 241, 0.05)';
export const FRAME_DEFAULT_BORDER_COLOR = 'rgba(99, 102, 241, 0.3)';
export const FRAME_DEFAULT_LABEL = 'Group';
export const FRAME_DEFAULT_LABEL_POSITION = 'top-left';
export const FRAME_DEFAULT_LABEL_PLACEMENT = 'outside';

// ==================== Node Dimensions ====================
export const WORKFLOW_NODE_WIDTH = 180;
export const WORKFLOW_NODE_HEIGHT = 80;
export const WORKFLOW_NOTE_DEFAULT_WIDTH = 200;
export const WORKFLOW_NOTE_DEFAULT_HEIGHT = 100;
export const WHITEBOARD_NODE_DEFAULT_SIZE = 200;

// ==================== Note / Table Resize Limits ====================
export const NOTE_MIN_WIDTH = 100;
export const NOTE_MIN_HEIGHT = 50;
export const TABLE_DEFAULT_WIDTH = 320;
export const TABLE_DEFAULT_HEIGHT = 200;
export const TABLE_MIN_WIDTH = 200;
export const TABLE_MIN_HEIGHT = 120;

// ==================== Viewport ====================
export const VIEWPORT_ADD_NODE_OFFSET_X = 400;
export const VIEWPORT_ADD_NODE_OFFSET_Y = 200;

// ==================== Trigger Polling ====================
export const TRIGGER_POLL_INTERVAL_MS = 10_000;
export const PERSISTENT_TRIGGER_TYPE_NAMES = [
  'TELEGRAM_BOT', 'SLACK_SOCKET', 'DISCORD_BOT', 'WHATSAPP_WEBHOOK', 'CUSTOM_WEBSOCKET',
] as const;

// ==================== Color Presets ====================
export const FILL_COLOR_PRESETS = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa', '#ffffff', '#f3f4f6',
] as const;

export const BORDER_COLOR_PRESETS = [
  '#8b5cf6', '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#6b7280', '#1a1a1a', '#e5e7eb',
] as const;

export const TEXT_COLOR_PRESETS = [
  '#1a1a1a', '#374151', '#713f12', '#1e3a5f', '#7f1d1d', '#4c1d95', '#ffffff',
] as const;

// ==================== Font & Theme Options ====================
export const FONT_FAMILY_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
] as const;

export const MERMAID_THEME_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'dark', label: 'Dark' },
  { value: 'forest', label: 'Forest' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'base', label: 'Base' },
] as const;
