/**
 * Native TopBar Component
 *
 * Replaces the micro-app based top bar with a native Lit component.
 * This provides better performance, type safety, and maintainability.
 */

import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $currentApplication, $editorState, $currentPageId, $applicationPages } from '@nuraly/runtime/redux/store';
import { $environment, ViewMode } from '@nuraly/runtime/redux/store/environment';
import { setEnvirementMode, addComponentAction } from '@nuraly/runtime/redux/actions';
import { openEditorTab } from '@nuraly/runtime/redux/actions/editor/openEditorTab';
import { GenerateName } from '@nuraly/runtime/utils/naming-generator';

// Locale stores
import { $locale, $supportedLocales, $i18nEnabled, setLocale, getLocaleFlag } from '@nuraly/runtime/state/locale.store';

// Presence indicator component (registers custom element)
import '@nuraly/runtime/presence/PresenceIndicator';

// Editor for platform state
import Editor from '@nuraly/runtime/state/editor';

// Runtime context for iframe communication
import { ExecuteInstance } from '@nuraly/runtime/state/runtime-context';

// Event dispatcher for platform changes
import { eventDispatcher } from '@nuraly/runtime/utils/change-detection';

// Component insert options
import { getInsertOptions, getEditOptions, getApplicationOptions } from './topbar-options';

// Modal components
import '../../components/share-modal/ShareModal';
import '../../components/kv-modal/KvModal';
import '../../components/app-settings-modal/AppSettingsModal';

@customElement("studio-topbar")
export class StudioTopBar extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100vw;
      max-width: 100%;
      height: 37px;
      border-bottom: 1px solid var(--topbar-border, #d6d6d6);
      background: var(--topbar-bg, #ffffff);
      box-sizing: border-box;
    }

    .topbar-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 8px;
    }

    .topbar-left {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }

    .topbar-center {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }

    .topbar-right {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
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

    .history-buttons {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .platform-selector {
      display: flex;
      align-items: center;
    }

    nr-divider[type="vertical"] {
      display: inline-block;
      width: 1px;
      height: 20px;
      margin: 0 4px;
      background-color: var(--nuraly-divider-color, #e0e0e0);
      --nuraly-divider-color: #e0e0e0;
    }

    nr-button {
      --nuraly-button-height: 24px;
    }

    .active-mode {
      --nuraly-button-background-color: var(--active-bg, #e0e0e0);
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
  private applicationSettingsModalOpen: boolean = false;

  @state()
  private shareModalOpen: boolean = false;

  @state()
  private kvStorageModalOpen: boolean = false;

  @state()
  private currentPlatform: string = 'desktop';

  @state()
  private locale: string = 'en';

  @state()
  private supportedLocales: string[] = [];

  @state()
  private i18nEnabled: boolean = false;

  private unsubscribeApp?: () => void;
  private unsubscribeEnv?: () => void;
  private unsubscribeEditor?: () => void;
  private unsubscribeCurrentPage?: () => void;
  private unsubscribePages?: () => void;
  private unsubscribeLocale?: () => void;
  private unsubscribeSupportedLocales?: () => void;
  private unsubscribeI18n?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    // Subscribe to current application
    this.unsubscribeApp = $currentApplication.subscribe((app: any) => {
      if (app) {
        this.appName = app.name || 'Untitled App';
        const newAppId = app.uuid || '';
        if (newAppId && newAppId !== this.appId) {
          this.appId = newAppId;
          // Set up page subscription after we have appId
          this.setupPageSubscription();
        }
      }
    });

    // Subscribe to environment mode
    this.unsubscribeEnv = $environment.subscribe((env) => {
      this.mode = env.mode;
    });

    // Subscribe to editor state for tab type
    this.unsubscribeEditor = $editorState.subscribe((state) => {
      // Editor state subscription for future use (e.g., tab type)
    });

    // Platform - read from Editor singleton
    this.currentPlatform = Editor.currentPlatform?.platform || 'desktop';

    // Locale stores
    this.unsubscribeLocale = $locale.subscribe((loc) => this.locale = loc);
    this.unsubscribeSupportedLocales = $supportedLocales.subscribe((locs) => this.supportedLocales = locs);
    this.unsubscribeI18n = $i18nEnabled.subscribe((enabled) => this.i18nEnabled = enabled);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeApp?.();
    this.unsubscribeEnv?.();
    this.unsubscribeEditor?.();
    this.unsubscribeCurrentPage?.();
    this.unsubscribePages?.();
    this.unsubscribeLocale?.();
    this.unsubscribeSupportedLocales?.();
    this.unsubscribeI18n?.();
  }

  private setupPageSubscription() {
    // Clean up existing subscriptions
    this.unsubscribeCurrentPage?.();
    this.unsubscribePages?.();

    // Subscribe to current page ID for this application
    this.unsubscribeCurrentPage = $currentPageId(this.appId).subscribe((pageId) => {
      if (pageId) {
        this.currentPageId = pageId;
      }
    });

    // Subscribe to pages to fallback to first page if no page is selected
    this.unsubscribePages = $applicationPages(this.appId).subscribe((pages: any[]) => {
      // If no current page is set and we have pages, set the first page
      if (!this.currentPageId && pages && pages.length > 0) {
        const firstPageId = pages[0].uuid;
        this.currentPageId = firstPageId;
        // Also persist the selection
        $currentPageId(this.appId).set(firstPageId);
      }
    });
  }

  private handleInsertComponent(e: CustomEvent) {
    const item = e.detail.item;
    if (!item?.value) return;

    const componentType = item.value.value;
    const additionalData = item.value.additionalData || {};
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
    const item = e.detail.item;
    const action = item?.value || item?.id;
    this.dispatchEvent(new CustomEvent('edit-action', {
      detail: { action },
      bubbles: true,
      composed: true
    }));
  }

  private handleApplicationAction(e: CustomEvent) {
    const item = e.detail.item;
    if (!item?.value) return;
    const action = item.value.action;

    if (action === 'open-modal') {
      this.applicationSettingsModalOpen = true;
    } else if (action === 'open-kv-modal') {
      this.kvStorageModalOpen = true;
    } else if (action === 'share') {
      this.shareModalOpen = true;
    } else if (action === 'new-tab') {
      const tabData = item.value.tab;
      if (tabData) {
        openEditorTab(tabData);
      }
    }
  }

  private setMode(mode: ViewMode) {
    setEnvirementMode(mode);
  }

  private handleBackClick() {
    // Navigate back to dashboard
    window.location.href = '/dashboard';
  }

  private handlePlatformChange(e: CustomEvent): void {
    const platform = e.detail.value;
    const configs: Record<string, { platform: string; width: string; height?: string; isMobile: boolean }> = {
      desktop: { platform: 'desktop', width: '1366px', isMobile: false },
      tablet: { platform: 'tablet', width: '1024px', height: '768px', isMobile: true },
      mobile: { platform: 'mobile', width: '430px', height: '767px', isMobile: true }
    };
    const newPlatform = configs[platform];
    Editor.currentPlatform = { ...newPlatform };
    this.currentPlatform = platform;

    // Update VarsProxy and trigger refresh
    if (ExecuteInstance?.VarsProxy) {
      ExecuteInstance.VarsProxy.currentPlatform = { ...newPlatform };
    }
    eventDispatcher.emit("component:refresh");
  }

  private handleLocaleChange(e: CustomEvent): void {
    const locale = e.detail.value;
    if (locale !== 'auto') {
      setLocale(locale);
      // Also set previewLocale to trigger iframe update
      ExecuteInstance.VarsProxy.previewLocale = locale;
    }
  }

  private getLocaleOptions() {
    return [
      { label: '🌐 Auto', value: 'auto' },
      ...this.supportedLocales.map(loc => ({
        label: `${getLocaleFlag(loc)} ${loc.toUpperCase()}`,
        value: loc
      }))
    ];
  }

  private handleUndo(): void {
    this.dispatchEvent(new CustomEvent('editor-undo', { bubbles: true, composed: true }));
  }

  private handleRedo(): void {
    this.dispatchEvent(new CustomEvent('editor-redo', { bubbles: true, composed: true }));
  }

  private handleLogout(): void {
    window.location.href = '/logout';
  }

  override render() {
    return html`
      <div class="topbar-row">
        <!-- Left section -->
        <div class="topbar-left">
          <nr-button
            size="small"
            type="default"
            style="--nuraly-button-min-width:47px;width:auto;"
            iconposition="left"
            .iconLeft=${"arrow-left"}
            @click=${this.handleBackClick}
          ></nr-button>
          <nr-label size="small" weight="medium" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.appName}</nr-label>
        </div>

        <!-- Center section -->
        <div class="topbar-center">
          <div class="menu-group">
            <nr-dropdown
              .items=${getInsertOptions()}
              trigger="click"
              size="small"
              auto-close
              @nr-dropdown-item-click=${this.handleInsertComponent}
            >
              <nr-button slot="trigger" size="small" type="default" style="--nuraly-button-min-width:47px;width:auto;" iconposition="left" .iconLeft=${"plus"}></nr-button>
            </nr-dropdown>

            <nr-dropdown
              .items=${getEditOptions()}
              trigger="click"
              size="small"
              @nr-dropdown-item-click=${this.handleEditAction}
            >
              <nr-button slot="trigger" size="small" type="default" style="--nuraly-button-min-width:47px;width:auto;" iconposition="left" .iconLeft=${"pencil"}></nr-button>
            </nr-dropdown>

            <nr-dropdown
              .items=${getApplicationOptions()}
              trigger="click"
              size="small"
              @nr-dropdown-item-click=${this.handleApplicationAction}
            >
              <nr-button slot="trigger" size="small" type="default" style="--nuraly-button-min-width:47px;width:auto;" iconposition="left" .iconLeft=${"app-window"}></nr-button>
            </nr-dropdown>
          </div>

          <nr-divider type="vertical"></nr-divider>

          <div class="platform-selector">
            <nr-radio-group
              type="button"
              size="small"
              .options=${[
                { icon: 'monitor', value: 'desktop' },
                { icon: 'tablet', value: 'tablet' },
                { icon: 'smartphone', value: 'mobile' }
              ]}
              .value=${this.currentPlatform}
              @nr-change=${this.handlePlatformChange}
            ></nr-radio-group>
          </div>

          ${this.i18nEnabled && this.supportedLocales.length > 1 ? html`
            <nr-divider type="vertical"></nr-divider>
            <nr-select
              size="small"
              style="width: 110px"
              .options=${this.getLocaleOptions()}
              .value=${this.locale}
              @nr-change=${this.handleLocaleChange}
            ></nr-select>
          ` : nothing}

        </div>

        <!-- Right section -->
        <div class="topbar-right">
          <div class="mode-buttons">
            ${this.mode === ViewMode.Edit ? html`
              <nr-button
                size="small"
                type="default"
                style="--nuraly-button-min-width:47px;width:auto;"
                iconposition="left"
                .iconLeft=${"play"}
                @click=${() => this.setMode(ViewMode.Preview)}
              >Preview</nr-button>
            ` : html`
              <nr-button
                size="small"
                type="default"
                style="--nuraly-button-min-width:47px;width:auto;"
                iconposition="left"
                .iconLeft=${"pencil"}
                @click=${() => this.setMode(ViewMode.Edit)}
              >Edit</nr-button>
            `}
          </div>

          <nr-divider type="vertical"></nr-divider>

          <presence-indicator></presence-indicator>

          <nr-divider type="vertical"></nr-divider>

          <nr-button
            size="small"
            type="default"
            style="--nuraly-button-min-width:47px;width:auto;"
            iconposition="left"
            .iconLeft=${"settings"}
            @click=${() => this.applicationSettingsModalOpen = true}
          ></nr-button>

          <nr-button
            size="small"
            variant="primary"
            .iconLeft=${"share"}
            @click=${() => this.shareModalOpen = true}
          >Share</nr-button>

          <nr-divider type="vertical"></nr-divider>

          <nr-button
            size="small"
            type="default"
            style="--nuraly-button-min-width:47px;width:auto;"
            iconposition="left"
            .iconLeft=${"log-out"}
            @click=${this.handleLogout}
          ></nr-button>
        </div>
      </div>

      <!-- Application Settings Modal -->
      ${this.applicationSettingsModalOpen ? html`
        <nr-modal
          .open=${this.applicationSettingsModalOpen}
          title="Application Settings"
          @modal-close=${() => this.applicationSettingsModalOpen = false}
        >
          <app-settings-modal></app-settings-modal>
        </nr-modal>
      ` : nothing}

      <!-- Share Modal -->
      ${this.shareModalOpen ? html`
        <nr-modal
          .open=${this.shareModalOpen}
          title="Share Application"
          @modal-close=${() => this.shareModalOpen = false}
        >
          <share-modal></share-modal>
        </nr-modal>
      ` : nothing}

      <!-- KV Storage Modal -->
      ${this.kvStorageModalOpen ? html`
        <nr-modal
          .open=${this.kvStorageModalOpen}
          title="KV Storage"
          @modal-close=${() => this.kvStorageModalOpen = false}
        >
          <kv-modal></kv-modal>
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
