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
  type: 'COMPONENTS_UPDATE' | 'COMPONENT_SELECTED' | 'SET_MODE' | 'SELECT_COMPONENT' | 'READY' | 'COMPONENT_CLICKED' | 'COMPONENT_UPDATED';
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
      // Validate origin if needed
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

  private setupComponentStoreSubscription() {
    const appId = this.applicationId || $currentApplication.get()?.uuid;
    if (appId) {
      this.componentStoreUnsubscribe = $applicationComponents(appId).subscribe((components) => {
        if (this.iframeReady) {
          this.sendMessageToIframe({
            type: 'COMPONENTS_UPDATE',
            payload: components
          });
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
        this.sendMessageToIframe({
          type: 'SET_MODE',
          payload: ExecuteInstance.Vars.currentEditingMode || 'edit'
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
              // Dispatch event for EditorInteractivePanel
              this.dispatchEvent(new CustomEvent('component-selected-from-iframe', {
                detail: { component: selectedComponent },
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
    }
  }

  private sendMessageToIframe(message: PreviewMessage) {
    if (this.iframeElement?.contentWindow) {
      this.iframeElement.contentWindow.postMessage(message, '*');
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

  private getPreviewUrl(): string {
    const appId = this.applicationId || $currentApplication.get()?.uuid || '';
    const pageUrl = this.pageUrl || ExecuteInstance.Vars.currentPage || '';
    return `/app/preview/${appId}/${pageUrl}`;
  }

  private handleIframeLoad() {
    // Iframe loaded, wait for READY message from inside
  }

  render() {
    return html`
      <div class="iframe-container">
        ${this.isLoading ? html`
          <div class="loading-overlay">
            <div class="loading-spinner"></div>
          </div>
        ` : ''}
        <iframe
          src=${this.getPreviewUrl()}
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
