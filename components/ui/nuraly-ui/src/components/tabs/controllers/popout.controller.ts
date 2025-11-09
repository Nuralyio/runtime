/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  TabItem,
  TabPopOutConfig,
  TabPopOutState,
  PoppedOutTab,
  TabEvent,
  TabPopOutEventDetail,
  TabPopInEventDetail,
  TabsPanelConfig
} from '../tabs.types.js';
import { PanelMode } from '../../panel/panel.types.js';

/**
 * Host interface for tabs pop-out controller
 */
export interface TabsPopOutHost extends ReactiveControllerHost {
  /** Tab items array */
  tabs: TabItem[];
  /** Pop-out configuration */
  popOut?: TabPopOutConfig;
  /** Panel configuration for making tabs pannable */
  panelConfig?: TabsPanelConfig;
  /** Method to dispatch custom events */
  dispatchEventWithMetadata(eventName: string, detail: any): void;
  /** Method to check if a component is available */
  isComponentAvailable(componentName: string): boolean;
  /** Method to request update */
  requestUpdate(): void;
}

/**
 * Controller for managing tab pop-out functionality
 */
export class TabsPopOutController implements ReactiveController {
  private host: TabsPopOutHost;
  private poppedOutTabs = new Map<string, PoppedOutTab>();
  private popOutIdCounter = 0;

  constructor(host: TabsPopOutHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    // Initialize pop-out states for existing tabs
    this.initializeTabStates();
  }

  hostDisconnected(): void {
    // Clean up any popped-out panels
    this.cleanupPoppedOutTabs();
  }

  /**
   * Initialize pop-out states for all tabs
   */
  private initializeTabStates(): void {
    this.host.tabs.forEach((tab) => {
      if (!tab.popOutState) {
        tab.popOutState = TabPopOutState.Normal;
      }
    });
  }

  /**
   * Check if pop-out functionality is enabled
   */
  isPopOutEnabled(): boolean {
    return this.host.popOut?.enabled ?? false;
  }

  /**
   * Check if a specific tab can be popped out
   */
  canPopOut(tab: TabItem): boolean {
    if (!this.isPopOutEnabled()) return false;
    
    // Check global config
    const globalCanPopOut = this.host.popOut?.canPopOut ?? true;
    
    // Check tab-specific config
    const tabCanPopOut = tab.popOut?.canPopOut ?? globalCanPopOut;
    
    // Can't pop out if already popped out or disabled
    return tabCanPopOut && 
           tab.popOutState === TabPopOutState.Normal && 
           !tab.disabled;
  }

  /**
   * Check if a specific tab can be popped back in
   */
  canPopIn(tab: TabItem): boolean {
    if (!this.isPopOutEnabled()) return false;
    
    // Check global config
    const globalCanPopIn = this.host.popOut?.canPopIn ?? true;
    
    // Check tab-specific config
    const tabCanPopIn = tab.popOut?.canPopIn ?? globalCanPopIn;
    
    return tabCanPopIn && tab.popOutState === TabPopOutState.PoppedOut;
  }

  /**
   * Generate unique pop-out ID
   */
  private generatePopOutId(): string {
    return `popout-${Date.now()}-${++this.popOutIdCounter}`;
  }

  /**
   * Pop out a tab to a window panel
   */
  async popOutTab(tabIndex: number): Promise<void> {
    const tab = this.host.tabs[tabIndex];
    if (!this.canPopOut(tab)) {
      console.warn('[TabsPopOutController] Cannot pop out tab:', tab.label);
      return;
    }

    const popOutId = this.generatePopOutId();
    
    // Store original content before any modifications
    const originalContent = tab.content;
    
    // Capture parent panel dimensions BEFORE popping out
    let originalWidth: string | undefined;
    let originalHeight: string | undefined;
    
    console.log('[TabsPopOutController] === DIMENSION CAPTURE START ===');
    const hostElement = this.host as any;
    console.log('[TabsPopOutController] hostElement.tagName:', hostElement.tagName);
    
    // First try to find a parent nr-panel
    const parentPanel = hostElement.closest?.('nr-panel');
    console.log('[TabsPopOutController] parentPanel found:', !!parentPanel);
    
    if (parentPanel) {
      const panelRect = parentPanel.getBoundingClientRect();
      console.log('[TabsPopOutController] Using parent panel dimensions');
      console.log('[TabsPopOutController] panelRect:', panelRect.width, 'x', panelRect.height);
      
      if (panelRect.width > 0 && panelRect.height > 0) {
        originalWidth = `${panelRect.width}px`;
        originalHeight = `${panelRect.height}px`;
        console.log('[TabsPopOutController] ✓ Captured parent panel dimensions:', originalWidth, 'x', originalHeight);
      }
    } else {
      // If no parent panel, use the tabs element's own dimensions
      console.log('[TabsPopOutController] No parent panel found, using tabs element dimensions');
      const tabsRect = hostElement.getBoundingClientRect();
      console.log('[TabsPopOutController] tabsRect:', tabsRect.width, 'x', tabsRect.height);
      
      if (tabsRect.width > 0 && tabsRect.height > 0) {
        originalWidth = `${tabsRect.width}px`;
        originalHeight = `${tabsRect.height}px`;
        console.log('[TabsPopOutController] ✓ Captured tabs element dimensions:', originalWidth, 'x', originalHeight);
      } else {
        console.warn('[TabsPopOutController] ✗ Tabs element has zero dimensions');
      }
    }
    console.log('[TabsPopOutController] === DIMENSION CAPTURE END ===');
    
    // Create popped-out tab tracking object with a copy of the tab
    const poppedOutTab: PoppedOutTab = {
      tab: { ...tab },
      originalIndex: tabIndex,
      state: TabPopOutState.PoppedOut,
      popOutId,
      originalWidth,
      originalHeight
    } as any;

    // Set the popped-out tab state and restore original content
    poppedOutTab.tab.popOutState = TabPopOutState.PoppedOut;
    poppedOutTab.tab.content = originalContent;

    // Remove the tab from the tabs array (no placeholder)
    this.host.tabs.splice(tabIndex, 1);

    // Store popped-out tab
    this.poppedOutTabs.set(popOutId, poppedOutTab);

    // Create window panel
    await this.createWindowPanel(poppedOutTab);

    // Dispatch event
    this.host.dispatchEventWithMetadata(TabEvent.TabPopOut, {
      index: tabIndex,
      tab: poppedOutTab.tab,
      popOutId
    } as TabPopOutEventDetail);

    this.host.requestUpdate();
  }

  /**
   * Pop a tab back into the tabs container
   */
  async popInTab(popOutId: string): Promise<void> {
    console.log('[TabsPopOutController] popInTab called with ID:', popOutId);
    const poppedOutTab = this.poppedOutTabs.get(popOutId);
    if (!poppedOutTab) {
      console.warn('[TabsPopOutController] Popped-out tab not found:', popOutId);
      console.log('[TabsPopOutController] Available pop-out IDs:', Array.from(this.poppedOutTabs.keys()));
      return;
    }

    console.log('[TabsPopOutController] Found popped-out tab:', poppedOutTab.tab.label);
    
    if (!this.canPopIn(poppedOutTab.tab)) {
      console.warn('[TabsPopOutController] Cannot pop in tab:', poppedOutTab.tab.label);
      return;
    }

    // Find the placeholder tab in current tabs
    const placeholderIndex = this.host.tabs.findIndex(tab => 
      tab.popOutState === TabPopOutState.Placeholder && 
      tab.id === poppedOutTab.tab.id
    );
    
    console.log('[TabsPopOutController] Placeholder index:', placeholderIndex);

    if (placeholderIndex !== -1) {
      // Restore original tab with its original content
      const originalTab = poppedOutTab.tab;
      originalTab.popOutState = TabPopOutState.Normal;
      
      console.log('[TabsPopOutController] Restoring tab at placeholder index:', placeholderIndex);
      console.log('[TabsPopOutController] Original tab content:', originalTab.content);
      
      // Replace placeholder with original tab
      this.host.tabs[placeholderIndex] = originalTab;
    } else {
      // If placeholder not found, insert at original position
      const insertIndex = Math.min(poppedOutTab.originalIndex, this.host.tabs.length);
      poppedOutTab.tab.popOutState = TabPopOutState.Normal;
      
      console.log('[TabsPopOutController] Placeholder not found, inserting at:', insertIndex);
      
      this.host.tabs.splice(insertIndex, 0, poppedOutTab.tab);
    }

    // Clean up window panel
    console.log('[TabsPopOutController] Destroying window panel');
    this.destroyWindowPanel(poppedOutTab);

    // Remove from tracking
    this.poppedOutTabs.delete(popOutId);

    // Dispatch event
    console.log('[TabsPopOutController] Dispatching TabPopIn event');
    this.host.dispatchEventWithMetadata(TabEvent.TabPopIn, {
      tab: poppedOutTab.tab,
      originalIndex: poppedOutTab.originalIndex,
      popOutId
    } as TabPopInEventDetail);

    console.log('[TabsPopOutController] Requesting host update');
    this.host.requestUpdate();
    console.log('[TabsPopOutController] popInTab completed');
  }

  /**
   * Create window panel for popped-out tab
   */
  private async createWindowPanel(poppedOutTab: PoppedOutTab): Promise<void> {
    if (!this.host.isComponentAvailable('nr-panel')) {
      console.warn('[TabsPopOutController] Panel component not available');
      return;
    }

    // Check if required dependencies are available
    if (!this.host.isComponentAvailable('nr-icon')) {
      console.warn('[TabsPopOutController] Icon component not available - minimize button may not display correctly');
    }

    // Get panel config from global or tab-specific settings
    const windowPanelConfig = this.host.popOut?.windowPanel || {};
    const tabPanelConfig = poppedOutTab.tab.popOut?.windowPanel || {};
    
    const config = { ...windowPanelConfig, ...tabPanelConfig };
    
    // Use stored dimensions from when we captured them, or fall back to config
    const poppedTabData = poppedOutTab as any;
    const originalWidth = poppedTabData.originalWidth || config.width || '600px';
    const originalHeight = poppedTabData.originalHeight || config.height || '400px';
    
    console.log('[TabsPopOutController] === DIMENSION FLOW START ===');
    console.log('[TabsPopOutController] originalWidth from poppedTabData:', poppedTabData.originalWidth);
    console.log('[TabsPopOutController] originalHeight from poppedTabData:', poppedTabData.originalHeight);
    console.log('[TabsPopOutController] Final originalWidth:', originalWidth);
    console.log('[TabsPopOutController] Final originalHeight:', originalHeight);
    
    // Create panel element
    const panel = document.createElement('nr-panel') as any;
    
    // Determine if the host tabs component is in embedded mode
    const isHostEmbedded = this.host.panelConfig?.mode === 'embedded';
    console.log('[TabsPopOutController] isHostEmbedded:', isHostEmbedded);
    
    // Add random offset for cascading effect (±80px for X, ±60px for Y)
    const randomOffsetX = Math.floor(Math.random() * 560) - 80;
    const randomOffsetY = Math.floor(Math.random() * 120) - 60;
    console.log('[TabsPopOutController] Random offsets - X:', randomOffsetX, 'Y:', randomOffsetY);
    
    // Set properties
    // If host is embedded, start in embedded mode and maximize to window
    panel.mode = isHostEmbedded ? 'embedded' : PanelMode.Window;
    panel.title = config.title?.replace('{tabLabel}', poppedOutTab.tab.label) || poppedOutTab.tab.label;
    panel.icon = config.icon || poppedOutTab.tab.icon || '';
    panel.width = originalWidth;
    panel.height = originalHeight;
    panel.isTabPopOut = true; // Mark this panel as a tab pop-out
    
    // Apply random offset for non-embedded panels (direct window mode)
    if (!isHostEmbedded) {
      panel.offsetX = randomOffsetX;
      // panel.offsetY = randomOffsetY;
      console.log('[TabsPopOutController] Applied random offset to window panel');
    }
    
    console.log('[TabsPopOutController] Set panel.width:', panel.width);
    console.log('[TabsPopOutController] Set panel.height:', panel.height);
    
    // For embedded panels that will be maximized, set numeric dimensions BEFORE appending
    if (isHostEmbedded) {
      const widthNum = parseInt(originalWidth);
      const heightNum = parseInt(originalHeight);
      
      console.log('[TabsPopOutController] Parsed widthNum:', widthNum);
      console.log('[TabsPopOutController] Parsed heightNum:', heightNum);
      console.log('[TabsPopOutController] widthNum isNaN:', isNaN(widthNum));
      console.log('[TabsPopOutController] heightNum isNaN:', isNaN(heightNum));
      
      if (!isNaN(widthNum) && !isNaN(heightNum)) {
        panel.panelWidth = widthNum;
        panel.panelHeight = heightNum;
        console.log('[TabsPopOutController] ✓ Set panel.panelWidth:', panel.panelWidth);
        console.log('[TabsPopOutController] ✓ Set panel.panelHeight:', panel.panelHeight);
      } else {
        console.warn('[TabsPopOutController] ✗ Could not set numeric dimensions - NaN detected');
      }
    }
    
    // Set boolean properties via both property and attribute to ensure they take effect
    const resizable = config.resizable ?? true;
    const draggable = config.draggable ?? true;
    const closable = config.closable ?? true;
    const minimizable = config.minimizable ?? true;
    
    panel.resizable = resizable;
    panel.draggable = draggable;
    panel.closable = closable;
    panel.minimizable = minimizable;
    
    // Also set as attributes for boolean properties
    if (resizable) panel.setAttribute('resizable', '');
    if (draggable) panel.setAttribute('draggable', '');
    if (closable) panel.setAttribute('closable', '');
    if (minimizable) panel.setAttribute('minimizable', '');

    // Set content - handle both HTML strings and template results
    if (poppedOutTab.tab.content) {
      if (typeof poppedOutTab.tab.content === 'string') {
        panel.innerHTML = poppedOutTab.tab.content;
      } else {
        // For Lit template results, create a container and render
        const container = document.createElement('div');
        container.style.height = '100%';
        container.style.width = '100%';
        panel.appendChild(container);
        
        // Import render from lit-html for template results
        try {
          const { render } = await import('lit');
          render(poppedOutTab.tab.content, container);
        } catch (error) {
          console.warn('[TabsPopOutController] Could not render template content:', error);
          container.innerHTML = 'Content could not be rendered';
        }
      }
    }

    // Add event listeners
    panel.addEventListener('panel-close', () => {
      this.popInTab(poppedOutTab.popOutId);
    });

    panel.addEventListener('panel-minimize', () => {
      console.log('Pop-out panel minimized:', poppedOutTab.tab.label);
      // For embedded panels that were maximized, minimize means restore to embedded
      // which will pop the tab back in
      if (isHostEmbedded) {
        this.popInTab(poppedOutTab.popOutId);
      }
    });

    // Listen for restore events (when user clicks "Restore to tabs" button)
    panel.addEventListener('panel-restore', (e: Event) => {
      console.log('[TabsPopOutController] panel-restore event received for:', poppedOutTab.tab.label);
      console.log('[TabsPopOutController] Event details:', e);
      console.log('[TabsPopOutController] Pop-out ID:', poppedOutTab.popOutId);
      this.popInTab(poppedOutTab.popOutId);
    });

    // Append to body or designated container
    console.log('[TabsPopOutController] Before appendChild - panel.panelWidth:', panel.panelWidth, 'panel.panelHeight:', panel.panelHeight);
    document.body.appendChild(panel);
    console.log('[TabsPopOutController] After appendChild - panel.panelWidth:', panel.panelWidth, 'panel.panelHeight:', panel.panelHeight);
    
    // Store panel reference
    poppedOutTab.panelElement = panel;
    
    // If the host is embedded, maximize the panel to window mode after it's been added to DOM
    if (isHostEmbedded) {
      // Wait for the panel to be fully initialized, then maximize it
      setTimeout(() => {
        console.log('[TabsPopOutController] Before maximizeEmbedded - panel.panelWidth:', panel.panelWidth, 'panel.panelHeight:', panel.panelHeight);
        if (panel.maximizeEmbedded && typeof panel.maximizeEmbedded === 'function') {
          panel.maximizeEmbedded();
          console.log('[TabsPopOutController] After maximizeEmbedded called');
        } else {
          console.warn('[TabsPopOutController] maximizeEmbedded not available');
        }
      }, 100);
    }
    
    console.log('[TabsPopOutController] === DIMENSION FLOW END ===');
    
    // Debug: Check panel properties after a short delay to ensure it's fully initialized
    setTimeout(() => {
      console.log('Panel debug info:', {
        label: poppedOutTab.tab.label,
        mode: panel.mode,
        minimizable: panel.minimizable,
        isMaximizedFromEmbedded: panel.isMaximizedFromEmbedded,
        hasMinimizeButton: !!panel.shadowRoot?.querySelector('button[title="Minimize"]'),
        panelElement: panel
      });
    }, 200);
  }

  /**
   * Destroy window panel
   */
  private destroyWindowPanel(poppedOutTab: PoppedOutTab): void {
    if (poppedOutTab.panelElement) {
      poppedOutTab.panelElement.remove();
      poppedOutTab.panelElement = undefined;
    }
  }

  /**
   * Clean up all popped-out tabs
   */
  private cleanupPoppedOutTabs(): void {
    this.poppedOutTabs.forEach(poppedOutTab => {
      this.destroyWindowPanel(poppedOutTab);
    });
    this.poppedOutTabs.clear();
  }

  /**
   * Get all currently popped-out tabs
   */
  getPoppedOutTabs(): PoppedOutTab[] {
    return Array.from(this.poppedOutTabs.values());
  }

  /**
   * Check if any tabs are currently popped out
   */
  hasPopppedOutTabs(): boolean {
    return this.poppedOutTabs.size > 0;
  }

  /**
   * Handle tab removal - clean up if tab is popped out
   */
  handleTabRemoval(tabIndex: number): void {
    const tab = this.host.tabs[tabIndex];
    if (tab?.popOutState === TabPopOutState.Placeholder) {
      // Find and clean up corresponding popped-out tab
      const poppedOutTab = Array.from(this.poppedOutTabs.values())
        .find(pot => pot.tab.id === tab.id);
      
      if (poppedOutTab) {
        this.destroyWindowPanel(poppedOutTab);
        this.poppedOutTabs.delete(poppedOutTab.popOutId);
      }
    }
  }

  /**
   * Public method to be called from tab component
   */
  async handlePopOutRequest(tabIndex: number): Promise<void> {
    await this.popOutTab(tabIndex);
  }

  /**
   * Public method to be called from panel or placeholder
   */
  async handlePopInRequest(popOutId: string): Promise<void> {
    await this.popInTab(popOutId);
  }
}