/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrTabsElement } from './tabs.component.js';

/**
 * React wrapper for the nr-tabs component.
 * 
 * @example
 * ```jsx
 * import { NrTabs } from '@nuralyui/tabs/react';
 * 
 * const tabs = [
 *   { label: 'Tab 1', content: <div>Content 1</div> },
 *   { label: 'Tab 2', content: <div>Content 2</div> }
 * ];
 * 
 * function MyComponent() {
 *   return (
 *     <NrTabs 
 *       tabs={tabs}
 *       activeTab={0}
 *       orientation="horizontal"
 *       onNrTabClick={(e) => console.log('Tab clicked:', e.detail)}
 *     />
 *   );
 * }
 * ```
 */
export const NrTabs = createComponent({
  tagName: 'nr-tabs',
  elementClass: NrTabsElement,
  react: React,
  events: {
    onNrTabClick: 'nr-tab-click',
    onNrTabChange: 'nr-tab-change',
    onNrTabAdd: 'nr-tab-add',
    onNrTabRemove: 'nr-tab-remove',
    onNrTabEdit: 'nr-tab-edit',
    onNrTabOrderChange: 'nr-tab-order-change',
  },
});

/**
 * @deprecated Use NrTabs instead. Will be removed in next major version.
 */
export const HyTabsComponent = NrTabs;
