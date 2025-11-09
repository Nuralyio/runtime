/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { PanelMode } from '../panel/panel.types.js';

/**
 * Tab orientation options
 */
export const enum TabOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

/**
 * Tab alignment options
 */
export const enum TabsAlign {
  Right = 'right',
  Left = 'left',
  Center = 'center',
  Stretch = 'stretch'
}

/**
 * Tab size options
 */
export const enum TabSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

/**
 * Tab type/variant options
 */
export const enum TabType {
  Default = 'default',
  Card = 'card',
  Line = 'line',
  Bordered = 'bordered'
}

/**
 * Tab events enumeration
 */
export const enum TabEvent {
  TabClick = 'nr-tab-click',
  TabAdd = 'nr-tab-add',
  TabRemove = 'nr-tab-remove',
  TabEdit = 'nr-tab-edit',
  TabOrderChange = 'nr-tab-order-change',
  TabChange = 'nr-tab-change',
  TabPopOut = 'nr-tab-pop-out',
  TabPopIn = 'nr-tab-pop-in'
}

/**
 * Pop-out state enumeration
 */
export const enum TabPopOutState {
  Normal = 'normal',
  PoppedOut = 'popped-out',
  Placeholder = 'placeholder'
}

/**
 * Pop-out configuration interface
 */
export interface TabPopOutConfig {
  /** Whether pop-out functionality is enabled */
  enabled: boolean;
  /** Whether tabs can be popped out */
  canPopOut?: boolean;
  /** Whether popped-out tabs can be popped back in */
  canPopIn?: boolean;
  /** Panel configuration for popped-out tabs */
  windowPanel?: {
    /** Panel title template (can use {tabLabel} placeholder) */
    title?: string;
    /** Panel icon */
    icon?: string;
    /** Default panel width */
    width?: string;
    /** Default panel height */
    height?: string;
    /** Whether panel is resizable */
    resizable?: boolean;
    /** Whether panel is draggable */
    draggable?: boolean;
    /** Whether panel can be closed (will pop tab back in) */
    closable?: boolean;
    /** Whether panel can be minimized */
    minimizable?: boolean;
  };
}

/**
 * Popped-out tab tracking interface
 */
export interface PoppedOutTab {
  /** Tab data */
  tab: TabItem;
  /** Original index in tabs array */
  originalIndex: number;
  /** Current pop-out state */
  state: TabPopOutState;
  /** Panel element reference */
  panelElement?: HTMLElement;
  /** Unique identifier for this pop-out instance */
  popOutId: string;
}

/**
 * Individual tab configuration interface
 */
export interface TabItem {
  /** Unique identifier for the tab */
  id?: string | number;
  /** Tab label/title */
  label: string;
  /** Tab content (HTML template or string) */
  content?: any;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Whether the tab can be closed */
  closable?: boolean;
  /** Icon for the tab */
  icon?: string;
  /** Custom CSS classes for the tab */
  className?: string;
  /** Tab-specific editable options */
  editable?: Partial<TabEditable>;
  /** Tab-specific pop-out options */
  popOut?: Partial<TabPopOutConfig>;
  /** Custom data attributes */
  data?: Record<string, any>;
  /** Current pop-out state */
  popOutState?: TabPopOutState;
}

/**
 * Tab editable configuration interface
 */
export interface TabEditable {
  /** Whether tabs can be deleted/removed */
  canDeleteTab: boolean;
  /** Whether tab titles can be edited inline */
  canEditTabTitle: boolean;
  /** Whether new tabs can be added */
  canAddTab: boolean;
  /** Whether tabs can be reordered via drag & drop */
  canMove: boolean;
}

/**
 * Tab panel configuration interface for making tabs pannable
 */
export interface TabsPanelConfig {
  /** Whether panel wrapper is enabled */
  enabled: boolean;
  /** Panel mode */
  mode?: PanelMode;
  /** Panel size (inherits from tabs if not specified) */
  size?: string;
  /** Whether the panel is resizable */
  resizable?: boolean;
  /** Whether the panel is draggable */
  draggable?: boolean;
  /** Whether the panel can be closed */
  closable?: boolean;
  /** Whether the panel can be minimized */
  minimizable?: boolean;
  /** Panel title */
  title?: string;
  /** Panel icon */
  icon?: string;
  /** Custom panel width */
  width?: string;
  /** Custom panel height */
  height?: string;
}

/**
 * Tab event detail interfaces
 */
export interface TabClickEventDetail {
  index: number;
  tab: TabItem;
  previousIndex?: number;
}

export interface TabAddEventDetail {
  tab?: Partial<TabItem>;
  index?: number;
}

export interface TabRemoveEventDetail {
  index: number;
  tab: TabItem;
}

export interface TabEditEventDetail {
  index: number;
  tab: TabItem;
  oldLabel: string;
  newLabel: string;
}

export interface TabOrderChangeEventDetail {
  sourceIndex: number;
  targetIndex: number;
  sourceTab: TabItem;
  targetTab: TabItem;
}

export interface TabPopOutEventDetail {
  index: number;
  tab: TabItem;
  popOutId: string;
}

export interface TabPopInEventDetail {
  tab: TabItem;
  originalIndex: number;
  popOutId: string;
}

/**
 * Tab configuration options
 */
export interface TabsConfig {
  /** Tab orientation */
  orientation?: TabOrientation;
  /** Tab alignment */
  align?: TabsAlign;
  /** Tab size */
  size?: TabSize;
  /** Tab type/variant */
  type?: TabType;
  /** Whether tabs are editable */
  editable?: TabEditable;
  /** Pop-out configuration */
  popOut?: TabPopOutConfig;
  /** Whether tabs are animated */
  animated?: boolean;
  /** Whether to hide tab content when tab is not active */
  destroyInactiveTabPane?: boolean;
  /** Custom tab bar extra content */
  tabBarExtraContent?: any;
}

/**
 * Constants
 */
export const EMPTY_STRING = '';
export const NOTHING_STRING = '';
export const DEFAULT_ACTIVE_TAB = 0;
export const LABEL_ATTRIBUTES = 'label';