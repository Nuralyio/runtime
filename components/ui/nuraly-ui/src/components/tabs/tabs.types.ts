/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

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
  TabChange = 'nr-tab-change'
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
  /** Custom data attributes */
  data?: Record<string, any>;
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