/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { TabItem } from '../tabs.types.js';
import { BaseComponentController } from '@nuralyui/common/controllers';
export type { ErrorHandler } from '@nuralyui/common/controllers';

/**
 * Base interface for tabs host element
 */
export interface TabsHost extends EventTarget {
  /** Currently active tab index */
  activeTab: number;
  /** Array of tab items */
  tabs: TabItem[];
  /** Whether component is disabled */
  disabled?: boolean;
  /** Current theme */
  currentTheme: string;
  /** Whether component is available */
  isComponentAvailable(component: string): boolean;
  /** Shadow root access */
  shadowRoot: ShadowRoot | null;
  /** Request update */
  requestUpdate(): void;
}

/**
 * Base interface for tabs controllers
 */
export interface TabsBaseController {
  readonly host: TabsHost;
}

/**
 * Abstract base controller class that implements common functionality
 * for all tabs component controllers
 */
export abstract class BaseTabsController extends BaseComponentController<TabsHost & ReactiveControllerHost>
  implements TabsBaseController {

  /**
   * Helper method to check if tab is valid
   */
  protected isValidTabIndex(index: number): boolean {
    return index >= 0 && index < this.host.tabs.length;
  }

  /**
   * Helper method to get tab element by index
   */
  protected getTabElement(index: number): Element | null {
    return this.host.shadowRoot?.querySelector(`[data-index="${index}"]`) || null;
  }
}
