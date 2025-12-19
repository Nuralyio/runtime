import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { $currentApplication } from '@nuraly/runtime/redux/store';
import { $applicationComponents } from '@nuraly/runtime/redux/store';
import { ExecuteInstance } from '@nuraly/runtime';
import { eventDispatcher } from '@nuraly/runtime/utils';

/**
 * Message types for iframe communication
 */
export interface PreviewMessage {
  type: 'COMPONENTS_UPDATE' | 'COMPONENT_UPDATE_SINGLE' | 'COMPONENT_SELECTED' | 'SET_MODE' | 'SELECT_COMPONENT' | 'READY' | 'COMPONENT_CLICKED' | 'COMPONENT_UPDATED' | 'COMPONENT_HOVERED';
  payload?: any;
}

@customElement('preview-iframe-panel')
export class PreviewIFramePanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .iframe-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
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

  @query('iframe') private iframeElement: HTMLIFrameElement | null;

  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private componentStoreUnsubscribe: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.setupMessageListener();
    this.setupComponentStoreSubscription();
    this.setupModeListener();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupMessageListener();
    this.cleanupComponentStoreSubscription();
  }

  private setupMessageListener() {
    this.messageHandler = (event: MessageEvent) => {
      // Verify the origin of the message
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.data && typeof event.data === 'object' && event.data.type) {
        this.handleIframeMessage(event.data as PreviewMessage);
      }
    };
    window.addEventListener('message', this.messageHandler);
  }

  private cleanupMessageListener() {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
  }

  // Track UUIDs we've already sent to iframe to prevent loops
  private sentToIframe = new Set<string>();

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
      const mode = ExecuteInstance.Vars.currentEditingMode;
      this.sendMessageToIframe({
        type: 'SET_MODE',
        payload: mode
      });
    });
  }

  private handleIframeMessage(message: PreviewMessage) {
    switch (message.type) {
      case 'READY':
        this.iframeReady = true;
        this.isLoading = false;
        // Send initial mode
        const initialMode = ExecuteInstance.Vars.currentEditingMode || 'edit';
        this.sendMessageToIframe({
          type: 'SET_MODE',
          payload: initialMode
        });
        break;

      case 'COMPONENT_CLICKED':
        // Update selected component in parent
        if (message.payload?.uuid) {
          const appId = this.applicationId || $currentApplication.get()?.uuid;
          if (appId) {
            const components = $applicationComponents(appId).get();
            const selectedComponent = components.find(c => c.uuid === message.payload.uuid);
            if (selectedComponent) {
              ExecuteInstance.VarsProxy.selectedComponents = [selectedComponent];
              // Calculate absolute position (iframe position + component position within iframe)
              const iframeRect = this.iframeElement?.getBoundingClientRect();
              const componentRect = message.payload.rect;
              const absoluteRect = iframeRect && componentRect ? {
                top: iframeRect.top + componentRect.top,
                left: iframeRect.left + componentRect.left,
                width: componentRect.width,
                height: componentRect.height
              } : null;
              // Dispatch event for EditorInteractivePanel
              this.dispatchEvent(new CustomEvent('component-selected-from-iframe', {
                detail: { component: selectedComponent, rect: absoluteRect },
                bubbles: true,
                composed: true
              }));
            }
          }
        }
        break;

      case 'COMPONENT_UPDATED':
        // Component was updated in iframe, trigger refresh
        eventDispatcher.emit('component:updated', message.payload);
        break;

      case 'COMPONENT_HOVERED':
        // Update hovered component in parent
        if (message.payload?.uuid) {
          const appId = this.applicationId || $currentApplication.get()?.uuid;
          if (appId) {
            const components = $applicationComponents(appId).get();
            const hoveredComponent = components.find(c => c.uuid === message.payload.uuid);
            // Calculate absolute position (iframe position + component position within iframe)
            const iframeRect = this.iframeElement?.getBoundingClientRect();
            const componentRect = message.payload.rect;
            const absoluteRect = iframeRect && componentRect ? {
              top: iframeRect.top + componentRect.top,
              left: iframeRect.left + componentRect.left,
              width: componentRect.width,
              height: componentRect.height
            } : null;
            // Dispatch event for hover overlay
            this.dispatchEvent(new CustomEvent('component-hovered-from-iframe', {
              detail: { component: hoveredComponent || null, rect: absoluteRect },
              bubbles: true,
              composed: true
            }));
          }
        } else {
          // Clear hover
          this.dispatchEvent(new CustomEvent('component-hovered-from-iframe', {
            detail: { component: null, rect: null },
            bubbles: true,
            composed: true
          }));
        }
        break;
    }
  }

  private sendMessageToIframe(message: PreviewMessage) {
    if (this.iframeElement?.contentWindow) {
      this.iframeElement.contentWindow.postMessage(message, window.location.origin);
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
    const pageUrl = this.pageUrl || ExecuteInstance.Vars.currentPage || '';
    return `/app/preview/${appId}/${pageUrl}`;
  }

  private handleIframeLoad() {
    // Iframe loaded, waiting for READY message from preview bridge
  }

  render() {
    const previewUrl = this.getPreviewUrl();
    return html`
      <div class="iframe-container">
        ${this.isLoading ? html`
          <div class="loading-overlay">
            <div class="loading-spinner"></div>
          </div>
        ` : ''}
        <iframe
          src=${previewUrl}
          @load=${this.handleIframeLoad}
        ></iframe>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'preview-iframe-panel': PreviewIFramePanel;
  }
}
