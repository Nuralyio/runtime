import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { $currentApplication, $applicationComponents } from '@nuraly/runtime/redux/store';
import { ExecuteInstance } from '@nuraly/runtime';
import { eventDispatcher } from '@nuraly/runtime/utils';
import Editor from '@nuraly/runtime/state/editor';

/**
 * Message types for iframe communication
 */
export interface PreviewMessage {
  type: 'COMPONENTS_UPDATE' | 'COMPONENT_UPDATE_SINGLE' | 'COMPONENT_DELETED' | 'COMPONENT_SELECTED' | 'SET_MODE' | 'SELECT_COMPONENT' | 'READY' | 'COMPONENT_CLICKED' | 'COMPONENT_UPDATED' | 'COMPONENT_HOVERED' | 'SET_PAGE';
  payload?: any;
}

@customElement('preview-iframe-panel')
export class PreviewIFramePanel extends LitElement {
  static readonly styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .iframe-container {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      overflow: auto;
      background: #f5f5f5;
    }

    .iframe-wrapper {
      position: relative;
      background: white;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
      transition: width 0.3s ease, height 0.3s ease;
      margin: auto;
      margin-top: 18px;
    }

    .iframe-wrapper.mobile {
      padding-top: 45px;
      border: 16px solid #000;
      border-radius: 40px;
    }

    /* Simulated mobile notch */
    .iframe-wrapper.mobile::before {
      content: "";
      position: absolute;
      top: -12px;
      left: 50%;
      width: 120px;
      height: 30px;
      background: black;
      border-radius: 20px;
      transform: translateX(-50%);
      z-index: 1;
    }

    .iframe-wrapper.tablet {
      border: 12px solid #222;
      border-radius: 20px;
    }

    .iframe-wrapper.desktop {
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    iframe {
      display: block;
      border: none;
      background: white;
      width: 100%;
      height: 100%;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      z-index: 10;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  @property({ type: String }) applicationId: string = '';
  @property({ type: String }) pageUrl: string = '';

  @state() private isLoading = true;
  @state() private iframeReady = false;
  @state() private currentPlatform: { platform: string; width: string; height?: string } = Editor.currentPlatform;

  // Track current page to avoid sending duplicate SET_PAGE messages
  private currentPageId: string = '';

  @query('iframe') private readonly iframeElement: HTMLIFrameElement | null;

  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private componentStoreUnsubscribe: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.setupMessageListener();
    this.setupComponentStoreSubscription();
    this.setupModeListener();
    this.setupPageChangeListener();
    this.setupPlatformListener();
  }

  private setupPlatformListener() {
    eventDispatcher.on('Vars:currentPlatform', () => {
      this.currentPlatform = Editor.currentPlatform;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupMessageListener();
    this.cleanupComponentStoreSubscription();
  }

  private setupMessageListener() {
    this.messageHandler = (event: MessageEvent) => {
      // Verify the origin of the message
      if (event.origin !== globalThis.location.origin) {
        return;
      }
      if (event.data && typeof event.data === 'object' && event.data.type) {
        this.handleIframeMessage(event.data as PreviewMessage);
      }
    };
    globalThis.addEventListener('message', this.messageHandler);
  }

  private cleanupMessageListener() {
    if (this.messageHandler) {
      globalThis.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
  }

  // Track UUIDs we've already sent to iframe to prevent loops
  private readonly sentToIframe = new Set<string>();

  private setupComponentStoreSubscription() {
    const appId = this.applicationId || $currentApplication.get()?.uuid;
    if (appId) {
      // Listen for single component updates (efficient - only sends changed component)
      eventDispatcher.on('component:updated', (data: { uuid?: string; component?: any }) => {
        if (this.iframeReady && data?.uuid) {
          // Prevent loop: don't re-send if we just sent this
          if (this.sentToIframe.has(data.uuid)) {
            this.sentToIframe.delete(data.uuid);
            return;
          }
          const components = $applicationComponents(appId).get();
          const updatedComponent = components.find(c => c.uuid === data.uuid);
          if (updatedComponent) {
            this.sentToIframe.add(data.uuid);
            this.sendMessageToIframe({
              type: 'COMPONENT_UPDATE_SINGLE',
              payload: updatedComponent
            });
          }
        }
      });

      // Listen for component deletion - sync full component list to iframe
      eventDispatcher.on('component:deleted', () => {
        if (this.iframeReady) {
          this.syncComponentsToIframe();
        }
      });

      // Listen for component refresh (e.g., after adding new components)
      eventDispatcher.on('component:refresh', () => {
        if (this.iframeReady) {
          this.syncComponentsToIframe();
        }
      });
    }
  }

  private cleanupComponentStoreSubscription() {
    if (this.componentStoreUnsubscribe) {
      this.componentStoreUnsubscribe();
      this.componentStoreUnsubscribe = null;
    }
  }

  private setupModeListener() {
    eventDispatcher.on('Vars:currentEditingMode', () => {
      const mode = ExecuteInstance.$currentEditingMode;
      this.sendMessageToIframe({
        type: 'SET_MODE',
        payload: mode
      });
    });
  }

  private setupPageChangeListener() {
    // Initialize with current page
    this.currentPageId = ExecuteInstance.Vars.currentPage || '';

    // Listen for page changes and send message to iframe (don't reload)
    eventDispatcher.on('Vars:currentPage', () => {
      const newPageId = ExecuteInstance.Vars.currentPage || '';
      if (newPageId !== this.currentPageId) {
        this.currentPageId = newPageId;
        // Send page change to iframe instead of reloading
        if (this.iframeReady) {
          this.sendMessageToIframe({
            type: 'SET_PAGE',
            payload: newPageId
          });
        }
      }
    });
  }

  private handleIframeMessage(message: PreviewMessage) {
    switch (message.type) {
      case 'READY':
        this.handleReady();
        break;
      case 'COMPONENT_CLICKED':
        this.handleComponentClicked(message.payload);
        break;
      case 'COMPONENT_UPDATED':
        eventDispatcher.emit('component:updated', message.payload);
        break;
      case 'COMPONENT_HOVERED':
        this.handleComponentHovered(message.payload);
        break;
    }
  }

  private handleReady() {
    this.iframeReady = true;
    this.isLoading = false;
    const initialMode = ExecuteInstance.$currentEditingMode || 'edit';
    this.sendMessageToIframe({ type: 'SET_MODE', payload: initialMode });
  }

  private handleComponentClicked(payload: { uuid?: string; rect?: DOMRect }) {
    if (!payload?.uuid) return;

    const appId = this.applicationId || $currentApplication.get()?.uuid;
    if (!appId) return;

    const components = $applicationComponents(appId).get();
    const selectedComponent = components.find(c => c.uuid === payload.uuid);
    if (!selectedComponent) return;

    ExecuteInstance.VarsProxy.selectedComponents = [selectedComponent];
    const absoluteRect = this.calculateAbsoluteRect(payload.rect);
    this.dispatchEvent(new CustomEvent('component-selected-from-iframe', {
      detail: { component: selectedComponent, rect: absoluteRect },
      bubbles: true,
      composed: true
    }));
  }

  private handleComponentHovered(payload: { uuid?: string; rect?: DOMRect } | null) {
    if (!payload?.uuid) {
      this.dispatchEvent(new CustomEvent('component-hovered-from-iframe', {
        detail: { component: null, rect: null },
        bubbles: true,
        composed: true
      }));
      return;
    }

    const appId = this.applicationId || $currentApplication.get()?.uuid;
    if (!appId) return;

    const components = $applicationComponents(appId).get();
    const hoveredComponent = components.find(c => c.uuid === payload.uuid);
    const absoluteRect = this.calculateAbsoluteRect(payload.rect);
    this.dispatchEvent(new CustomEvent('component-hovered-from-iframe', {
      detail: { component: hoveredComponent || null, rect: absoluteRect },
      bubbles: true,
      composed: true
    }));
  }

  private calculateAbsoluteRect(componentRect?: DOMRect) {
    const iframeRect = this.iframeElement?.getBoundingClientRect();
    if (!iframeRect || !componentRect) return null;
    return {
      top: iframeRect.top + componentRect.top,
      left: iframeRect.left + componentRect.left,
      width: componentRect.width,
      height: componentRect.height
    };
  }

  /**
   * Strip non-serializable properties from a component before sending to iframe.
   * Properties like Instance (Proxy), parent (circular ref), children (circular ref) cannot be cloned.
   */
  private sanitizeComponentForIframe(component: any): any {
    if (!component) return component;

    // Create a shallow copy and remove non-serializable properties
    const { Instance, parent, children, __microAppContext, ...serializableProps } = component;
    return serializableProps;
  }

  private sendMessageToIframe(message: PreviewMessage) {
    if (this.iframeElement?.contentWindow) {
      // Sanitize component payloads before sending
      let sanitizedMessage = message;
      if (message.type === 'COMPONENT_UPDATE_SINGLE' && message.payload) {
        sanitizedMessage = {
          ...message,
          payload: this.sanitizeComponentForIframe(message.payload)
        };
      } else if (message.type === 'COMPONENTS_UPDATE' && Array.isArray(message.payload)) {
        sanitizedMessage = {
          ...message,
          payload: message.payload.map((c: any) => this.sanitizeComponentForIframe(c))
        };
      }
      this.iframeElement.contentWindow.postMessage(sanitizedMessage, globalThis.location.origin);
    }
  }

  /**
   * Send selection to iframe
   */
  selectComponent(uuid: string) {
    this.sendMessageToIframe({
      type: 'SELECT_COMPONENT',
      payload: { uuid }
    });
  }

  /**
   * Sync components from parent store to iframe
   */
  syncComponentsToIframe() {
    const appId = this.applicationId || $currentApplication.get()?.uuid;
    if (appId && this.iframeReady) {
      const components = $applicationComponents(appId).get();
      this.sendMessageToIframe({
        type: 'COMPONENTS_UPDATE',
        payload: components
      });
    }
  }

  private getPreviewUrl(): string {
    const appId = this.applicationId || $currentApplication.get()?.uuid || '';
    // Use pageUrl prop or initial currentPage for first load only
    // Page changes are handled via SET_PAGE message, not URL change
    const pageUrl = this.pageUrl || ExecuteInstance.Vars.currentPage || '';
    return `/app/preview/${appId}/${pageUrl}`;
  }

  private handleIframeLoad() {
    // Iframe loaded, waiting for READY message from preview bridge
  }

  render() {
    const previewUrl = this.getPreviewUrl();
    const platform = this.currentPlatform?.platform || 'desktop';
    const iframeWidth = this.currentPlatform?.width || '100%';
    const iframeHeight = this.currentPlatform?.height || '100%';

    return html`
      <div class="iframe-container">
        ${this.isLoading ? html`
          <div class="loading-overlay">
            <div class="loading-spinner"></div>
          </div>
        ` : ''}
        <div class="iframe-wrapper ${platform}" style="width: ${iframeWidth}; height: ${iframeHeight};">
          <iframe
            src=${previewUrl}
            @load=${this.handleIframeLoad}
          ></iframe>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'preview-iframe-panel': PreviewIFramePanel;
  }
}
