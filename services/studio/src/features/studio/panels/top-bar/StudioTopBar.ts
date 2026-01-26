/**
 * Native TopBar Component
 *
 * Replaces the micro-app based top bar with a native Lit component.
 * This provides better performance, type safety, and maintainability.
 */

import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $currentApplication, $editorState } from '@nuraly/runtime/redux/store';
import { $environment, ViewMode } from '@nuraly/runtime/redux/store/environment';
import { setEnvirementMode, addComponentAction } from '@nuraly/runtime/redux/actions';
import { openEditorTab } from '@nuraly/runtime/redux/actions/editor/openEditorTab';
import { $pageZoom } from '@nuraly/runtime/redux/store';
import { GenerateName } from '@nuraly/runtime/utils/naming-generator';

// Component insert options
import { getInsertOptions, getEditOptions, getApplicationOptions } from './topbar-options';

@customElement("studio-topbar")
export class StudioTopBar extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: 37px;
      border-bottom: 1px solid var(--topbar-border, #d6d6d6);
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --topbar-border: #3a3a3a;
        --topbar-bg: #1a1a1a;
      }
    }

    .topbar {
      display: flex;
      flex-direction: row;
      height: 100%;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      background: var(--topbar-bg, white);
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 60vw;
      justify-content: space-between;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-end;
    }

    .app-details {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .mode-buttons {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .menu-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .zoom-container {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .app-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color, #333);
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    nr-button {
      --nuraly-button-height: 24px;
    }

    .active-mode {
      --nuraly-button-background-color: var(--active-bg, #e0e0e0);
    }

    @media (prefers-color-scheme: dark) {
      .app-name {
        color: #e0e0e0;
      }
      .active-mode {
        --nuraly-button-background-color: #3a3a3a;
      }
    }
  `;

  @state()
  private appName: string = '';

  @state()
  private appId: string = '';

  @state()
  private currentPageId: string = '';

  @state()
  private mode: ViewMode = ViewMode.Edit;

  @state()
  private zoom: number = 100;

  @state()
  private applicationSettingsModalOpen: boolean = false;

  @state()
  private shareModalOpen: boolean = false;

  @state()
  private kvStorageModalOpen: boolean = false;

  private unsubscribeApp?: () => void;
  private unsubscribeEnv?: () => void;
  private unsubscribeZoom?: () => void;
  private unsubscribeEditor?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    // Subscribe to current application
    this.unsubscribeApp = $currentApplication.subscribe((app) => {
      if (app) {
        this.appName = app.name || 'Untitled App';
        this.appId = app.uuid || '';
      }
    });

    // Subscribe to environment mode
    this.unsubscribeEnv = $environment.subscribe((env) => {
      this.mode = env.mode;
    });

    // Subscribe to zoom
    this.unsubscribeZoom = $pageZoom.subscribe((zoom) => {
      this.zoom = Number(zoom) || 100;
    });

    // Subscribe to editor state for current page
    this.unsubscribeEditor = $editorState.subscribe((state) => {
      if (state.currentTab?.type === 'page') {
        this.currentPageId = state.currentTab.id || '';
      }
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeApp?.();
    this.unsubscribeEnv?.();
    this.unsubscribeZoom?.();
    this.unsubscribeEditor?.();
  }

  private handleInsertComponent(e: CustomEvent) {
    const itemValue = e.detail.value || e.detail;
    const componentType = itemValue.value;
    const additionalData = itemValue.additionalData || {};
    const action = additionalData.action;

    if (!this.currentPageId || !this.appId) return;

    if (action === 'add') {
      const cleanAdditionalData = { ...additionalData };
      delete cleanAdditionalData.action;
      const generatedName = GenerateName(componentType);
      addComponentAction(
        { name: generatedName, type: componentType, ...cleanAdditionalData },
        this.currentPageId,
        this.appId
      );
    } else if (action === 'paste') {
      // Handle paste from schema
      this.dispatchEvent(new CustomEvent('paste-component', {
        detail: { schema: additionalData.schema },
        bubbles: true,
        composed: true
      }));
    }
  }

  private handleEditAction(e: CustomEvent) {
    const action = e.detail.value || e.detail;
    this.dispatchEvent(new CustomEvent('edit-action', {
      detail: { action },
      bubbles: true,
      composed: true
    }));
  }

  private handleApplicationAction(e: CustomEvent) {
    const itemValue = e.detail.value || e.detail;
    const action = itemValue.action;

    if (action === 'open-modal') {
      this.applicationSettingsModalOpen = true;
    } else if (action === 'open-kv-modal') {
      this.kvStorageModalOpen = true;
    } else if (action === 'share') {
      this.shareModalOpen = true;
    } else if (action === 'new-tab') {
      const tabData = itemValue.tab;
      if (tabData) {
        openEditorTab(tabData);
      }
    }
  }

  private setMode(mode: ViewMode) {
    setEnvirementMode(mode);
  }

  private handleZoomChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    if (!isNaN(value) && value >= 10 && value <= 200) {
      $pageZoom.set(String(value));
    }
  }

  private handleBackClick() {
    // Navigate back to dashboard
    window.location.href = '/dashboard';
  }

  override render() {
    return html`
      <div class="topbar">
        <div class="topbar-left">
          <div class="app-details">
            <!-- Back button -->
            <nr-button
              size="small"
              variant="text"
              .iconLeft=${"arrow-left"}
              @click=${this.handleBackClick}
            ></nr-button>

            <!-- App name -->
            <span class="app-name">${this.appName}</span>

            <!-- Menu dropdowns -->
            <div class="menu-group">
              <nr-dropdown
                .options=${getInsertOptions()}
                .trigger=${{ icon: 'plus', label: '' }}
                size="small"
                @nr-dropdown-select=${this.handleInsertComponent}
              ></nr-dropdown>

              <nr-dropdown
                .options=${getEditOptions()}
                .trigger=${{ icon: 'pencil', label: '' }}
                size="small"
                @nr-dropdown-select=${this.handleEditAction}
              ></nr-dropdown>

              <nr-dropdown
                .options=${getApplicationOptions()}
                .trigger=${{ icon: 'app-window', label: '' }}
                size="small"
                @nr-dropdown-select=${this.handleApplicationAction}
              ></nr-dropdown>
            </div>
          </div>

          <!-- Mode toggle -->
          <div class="mode-buttons">
            <nr-button
              size="small"
              variant=${this.mode === ViewMode.Edit ? 'primary' : 'secondary'}
              class=${this.mode === ViewMode.Edit ? 'active-mode' : ''}
              .iconLeft=${"pencil"}
              @click=${() => this.setMode(ViewMode.Edit)}
            >Edit</nr-button>

            <nr-button
              size="small"
              variant=${this.mode === ViewMode.Preview ? 'primary' : 'secondary'}
              class=${this.mode === ViewMode.Preview ? 'active-mode' : ''}
              .iconLeft=${"play"}
              @click=${() => this.setMode(ViewMode.Preview)}
            >Preview</nr-button>
          </div>
        </div>

        <div class="topbar-right">
          <!-- Zoom control -->
          <div class="zoom-container">
            <nr-text-input
              size="small"
              type="number"
              .value=${String(this.zoom)}
              style="width: 60px"
              @change=${this.handleZoomChange}
            ></nr-text-input>
            <span>%</span>
          </div>

          <!-- Settings button -->
          <nr-button
            size="small"
            variant="text"
            .iconLeft=${"settings"}
            @click=${() => this.applicationSettingsModalOpen = true}
          ></nr-button>

          <!-- Share button -->
          <nr-button
            size="small"
            variant="primary"
            .iconLeft=${"share"}
            @click=${() => this.shareModalOpen = true}
          >Share</nr-button>
        </div>
      </div>

      <!-- Application Settings Modal -->
      ${this.applicationSettingsModalOpen ? html`
        <nr-modal
          .open=${this.applicationSettingsModalOpen}
          title="Application Settings"
          @nr-modal-close=${() => this.applicationSettingsModalOpen = false}
        >
          <application-settings-panel
            .appId=${this.appId}
          ></application-settings-panel>
        </nr-modal>
      ` : nothing}

      <!-- Share Modal -->
      ${this.shareModalOpen ? html`
        <nr-modal
          .open=${this.shareModalOpen}
          title="Share Application"
          @nr-modal-close=${() => this.shareModalOpen = false}
        >
          <share-application-panel
            .appId=${this.appId}
          ></share-application-panel>
        </nr-modal>
      ` : nothing}

      <!-- KV Storage Modal -->
      ${this.kvStorageModalOpen ? html`
        <nr-modal
          .open=${this.kvStorageModalOpen}
          title="KV Storage"
          @nr-modal-close=${() => this.kvStorageModalOpen = false}
        >
          <kv-storage-panel
            .appId=${this.appId}
          ></kv-storage-panel>
        </nr-modal>
      ` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "studio-topbar": StudioTopBar;
  }
}
