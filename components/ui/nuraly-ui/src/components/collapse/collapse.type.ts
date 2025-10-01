/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { TemplateResult } from 'lit';

/**
 * Collapse component types and enums following NuralyUI architecture patterns
 */

// Constants
export const EMPTY_STRING = '';

// Enum for collapse sizes
export const enum CollapseSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

// Enum for collapse variant types
export const enum CollapseVariant {
  Default = 'default',
  Bordered = 'bordered',
  Ghost = 'ghost'
}

// Enum for animation types
export const enum CollapseAnimation {
  None = 'none',
  Slide = 'slide',
  Fade = 'fade'
}

// Enhanced section interface
export interface CollapseSection {
  /** Unique identifier for the section */
  id?: string;
  /** Header content (text, HTML string, or TemplateResult) */
  header: string | TemplateResult;
  /** Content to display when expanded - supports plain text, HTML string, or TemplateResult */
  content: string | TemplateResult;
  /** Optional slot name for header content (alternative to header property) */
  headerSlot?: string;
  /** Optional slot name for content (alternative to content property) */
  contentSlot?: string;
  /** Optional content for the right side of the header (icons, menu, badges, etc.) */
  headerRight?: string | TemplateResult;
  /** Optional slot name for header right content (alternative to headerRight property) */
  headerRightSlot?: string;
  /** Whether the section is initially open */
  open?: boolean;
  /** Whether the section can be collapsed/expanded */
  collapsible?: boolean;
  /** Whether this section is disabled */
  disabled?: boolean;
  /** Custom CSS classes for the section */
  className?: string;
  /** Header icon configuration */
  headerIcon?: string;
  /** Custom expand/collapse icons */
  expandIcon?: string;
  collapseIcon?: string;
}

// Configuration for accordion behavior
export interface CollapseAccordionConfig {
  /** Whether to allow multiple sections open at once */
  allowMultiple?: boolean;
  /** Whether to collapse others when one is opened */
  collapsible?: boolean;
}

// Event detail interfaces
export interface CollapseSectionToggleEvent {
  /** Index of the toggled section */
  index: number;
  /** Section data */
  section: CollapseSection;
  /** Whether the section is now open */
  isOpen: boolean;
}

export interface CollapseBeforeToggleEvent {
  /** Index of the section about to be toggled */
  index: number;
  /** Section data */
  section: CollapseSection;
  /** Current open state */
  isOpen: boolean;
  /** Function to prevent the toggle */
  preventDefault: () => void;
}
