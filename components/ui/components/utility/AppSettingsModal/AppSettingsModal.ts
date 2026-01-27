import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getVarValue } from '../../../../../redux/store/context';
import { $currentApplication } from '../../../../../redux/store';

// Import access roles component
import '../AccessRoles/AccessRoles';

// Locale options for i18n
const LOCALE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'ar', label: 'العربية' },
  { value: 'he', label: 'עברית' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'pl', label: 'Polski' }
];

/**
 * AppSettingsModal Component
 *
 * A modal for managing application settings:
 * - Name
 * - Description
 * - Subdomain configuration
 * - Access settings
 * - i18n settings
 * - Danger zone (delete)
 */
@customElement('app-settings-modal')
export class AppSettingsModal extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .settings-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 16px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .settings-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--nuraly-color-text-primary, #333);
      margin-bottom: 4px;
    }

    .section-description {
      font-size: 12px;
      color: var(--nuraly-color-text-secondary, #666);
      line-height: 1.4;
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .suffix {
      font-size: 12px;
      color: var(--nuraly-color-text-secondary, #666);
      white-space: nowrap;
    }

    .divider {
      height: 1px;
      background: var(--nuraly-color-border, #e0e0e0);
    }

    .danger-section {
      border: 1px solid var(--nuraly-color-error, #ff4d4f);
      border-radius: 8px;
      padding: 16px;
      background: var(--nuraly-color-error-bg, #fff2f0);
    }

    .danger-title {
      color: var(--nuraly-color-error, #ff4d4f);
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 8px;
    }

    .danger-description {
      font-size: 12px;
      color: var(--nuraly-color-text-secondary, #666);
      margin-bottom: 12px;
    }

    .message {
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      margin-bottom: 8px;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
    }

    .form-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--nuraly-color-text-secondary, #666);
      margin-bottom: 4px;
    }

    nr-input, nr-textarea {
      width: 100%;
    }

    .access-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: var(--nuraly-color-background-secondary, #f5f5f5);
      border-radius: 6px;
      gap: 12px;
    }

    .access-info {
      flex: 1;
    }

    .access-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--nuraly-color-text-primary, #333);
      margin-bottom: 2px;
    }
  `;

  @state() private appName = '';
  @state() private appDescription = '';
  @state() private subdomain = '';
  @state() private customDomain = '';
  @state() private requiresAuthOnly = false;
  @state() private message: { type: 'success' | 'error'; text: string } | null = null;

  // i18n settings
  @state() private i18nEnabled = false;
  @state() private defaultLocale = 'en';
  @state() private supportedLocales: string[] = ['en'];
  @state() private activeLocale = 'auto';
  @state() private detectBrowserLanguage = true;

  private unsubscribe?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();
    this.loadAppSettings();

    // Subscribe to app changes
    this.unsubscribe = $currentApplication.subscribe((app: any) => {
      if (app) {
        this.appName = app.name || '';
        this.appDescription = app.description || '';
        this.subdomain = app.subdomain || '';
        this.customDomain = app.customDomain || '';
        this.requiresAuthOnly = app.requiresAuthOnly || false;
        // i18n settings (stored in app.i18n object)
        const i18n = app.i18n || {};
        this.i18nEnabled = i18n.enabled || false;
        this.defaultLocale = i18n.defaultLocale || 'en';
        this.supportedLocales = i18n.supportedLocales || ['en'];
        this.activeLocale = i18n.activeLocale || 'auto';
        this.detectBrowserLanguage = i18n.detectBrowserLanguage !== false;
      }
    });
  }

  override disconnectedCallback(): void {
    this.unsubscribe?.();
    super.disconnectedCallback();
  }

  private getAppId(): string | null {
    const app = getVarValue('global', 'currentEditingApplication') as any;
    return app?.uuid || null;
  }

  private loadAppSettings(): void {
    const app = getVarValue('global', 'currentEditingApplication') as any;
    if (app) {
      this.appName = app.name || '';
      this.appDescription = app.description || '';
      this.subdomain = app.subdomain || '';
      this.customDomain = app.customDomain || '';
      this.requiresAuthOnly = app.requiresAuthOnly || false;
      // i18n settings (stored in app.i18n object)
      const i18n = app.i18n || {};
      this.i18nEnabled = i18n.enabled || false;
      this.defaultLocale = i18n.defaultLocale || 'en';
      this.supportedLocales = i18n.supportedLocales || ['en'];
      this.activeLocale = i18n.activeLocale || 'auto';
      this.detectBrowserLanguage = i18n.detectBrowserLanguage !== false;
    }
  }

  private async handleCustomDomainChange(e: CustomEvent): Promise<void> {
    const newDomain = (e.detail?.value || '').toLowerCase().trim();
    this.customDomain = newDomain;
    await this.saveSettings({ customDomain: newDomain || null });
  }

  private async handleAuthOnlyChange(e: CustomEvent): Promise<void> {
    const checked = e.detail?.checked ?? false;
    this.requiresAuthOnly = checked;
    await this.saveSettings({ requiresAuthOnly: checked });

    // Update the store
    const app = getVarValue('global', 'currentEditingApplication') as any;
    if (app) {
      $currentApplication.set({ ...app, requiresAuthOnly: checked });
    }
  }

  private async handleNameChange(e: CustomEvent): Promise<void> {
    const newName = e.detail?.value || '';
    this.appName = newName;
    await this.saveSettings({ name: newName });
  }

  private async handleDescriptionChange(e: CustomEvent): Promise<void> {
    const newDescription = e.detail?.value || '';
    this.appDescription = newDescription;
    await this.saveSettings({ description: newDescription });
  }

  private async handleSubdomainChange(e: CustomEvent): Promise<void> {
    const newSubdomain = (e.detail?.value || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    this.subdomain = newSubdomain;
    await this.saveSettings({ subdomain: newSubdomain || null });
  }

  // i18n handlers - save to nested app.i18n object
  private getI18nConfig(): any {
    return {
      enabled: this.i18nEnabled,
      defaultLocale: this.defaultLocale,
      supportedLocales: this.supportedLocales,
      activeLocale: this.activeLocale,
      detectBrowserLanguage: this.detectBrowserLanguage
    };
  }

  private async handleI18nEnabledChange(e: CustomEvent): Promise<void> {
    const checked = e.detail?.checked ?? false;
    this.i18nEnabled = checked;
    const i18n = this.getI18nConfig();
    await this.saveSettings({ i18n });

    const app = getVarValue('global', 'currentEditingApplication') as any;
    if (app) {
      $currentApplication.set({ ...app, i18n });
    }
  }

  private async handleDefaultLocaleChange(e: CustomEvent): Promise<void> {
    const value = e.detail?.value || 'en';
    this.defaultLocale = value;
    const i18n = this.getI18nConfig();
    await this.saveSettings({ i18n });

    const app = getVarValue('global', 'currentEditingApplication') as any;
    if (app) {
      $currentApplication.set({ ...app, i18n });
    }
  }

  private async handleSupportedLocalesChange(e: CustomEvent): Promise<void> {
    const values = e.detail?.value || ['en'];
    this.supportedLocales = Array.isArray(values) ? values : [values];
    const i18n = this.getI18nConfig();
    await this.saveSettings({ i18n });

    const app = getVarValue('global', 'currentEditingApplication') as any;
    if (app) {
      $currentApplication.set({ ...app, i18n });
    }
  }

  private async handleActiveLocaleChange(e: CustomEvent): Promise<void> {
    const value = e.detail?.value || 'auto';
    this.activeLocale = value;
    this.detectBrowserLanguage = value === 'auto';
    const i18n = this.getI18nConfig();
    await this.saveSettings({ i18n });

    const app = getVarValue('global', 'currentEditingApplication') as any;
    if (app) {
      $currentApplication.set({ ...app, i18n });
    }
  }

  private async saveSettings(updates: Record<string, any>): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      this.message = { type: 'success', text: 'Settings saved' };
      setTimeout(() => this.message = null, 2000);
    } catch (error: any) {
      this.message = { type: 'error', text: error.message || 'Failed to save' };
    }
  }

  private async handleDeleteApp(): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    const confirmed = confirm(`Are you sure you want to delete "${this.appName}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      // Redirect to dashboard after deletion
      window.location.href = '/dashboard';
    } catch (error: any) {
      this.message = { type: 'error', text: error.message || 'Failed to delete' };
    }
  }

  override render() {
    return html`
      <div class="settings-container">
        ${this.message ? html`
          <div class="${this.message.type}-message message">${this.message.text}</div>
        ` : nothing}

        <!-- Name Section -->
        <div class="settings-section">
          <label class="form-label">Application Name</label>
          <nr-input
            size="small"
            .value=${this.appName}
            placeholder="My Application"
            @nr-input=${this.handleNameChange}
          ></nr-input>
        </div>

        <!-- Description Section -->
        <div class="settings-section">
          <label class="form-label">Description</label>
          <nr-textarea
            size="small"
            .value=${this.appDescription}
            placeholder="Enter a description for your application..."
            rows="3"
            @nr-change=${this.handleDescriptionChange}
          ></nr-textarea>
        </div>

        <div class="divider"></div>

        <!-- Subdomain Section -->
        <div class="settings-section">
          <label class="form-label">Subdomain</label>
          <div class="section-description">Configure a custom subdomain for your application</div>
          <div class="input-row">
            <nr-input
              size="small"
              .value=${this.subdomain}
              placeholder="my-app"
              style="flex: 1"
              @nr-input=${this.handleSubdomainChange}
            ></nr-input>
            <span class="suffix">.nuraly.app</span>
          </div>
        </div>

        <!-- Custom Domain Section -->
        <div class="settings-section">
          <label class="form-label">Custom Domain</label>
          <div class="section-description">Use your own domain (requires DNS configuration)</div>
          <nr-input
            size="small"
            .value=${this.customDomain}
            placeholder="app.yourdomain.com"
            @nr-input=${this.handleCustomDomainChange}
          ></nr-input>
        </div>

        <div class="divider"></div>

        <!-- Access Settings Section -->
        <div class="settings-section">
          <label class="form-label">Access Settings</label>
          <div class="access-row">
            <div class="access-info">
              <div class="access-title">Allow all authenticated users</div>
              <div class="section-description">Any logged-in user can view this app without being a member</div>
            </div>
            <nr-checkbox
              .checked=${this.requiresAuthOnly}
              toggle
              @nr-change=${this.handleAuthOnlyChange}
            ></nr-checkbox>
          </div>
          <div class="section-description" style="margin-top: 12px;">
            Use the <strong>Share</strong> button to invite members and manage roles.
          </div>
        </div>

        <div class="divider"></div>

        <!-- i18n / Translation Settings Section -->
        <div class="settings-section">
          <label class="form-label">Translation Settings</label>
          <div class="access-row">
            <div class="access-info">
              <div class="access-title">Enable Multi-language Support</div>
              <div class="section-description">Allow your application to support multiple languages</div>
            </div>
            <nr-checkbox
              .checked=${this.i18nEnabled}
              toggle
              @nr-change=${this.handleI18nEnabledChange}
            ></nr-checkbox>
          </div>

          ${this.i18nEnabled ? html`
            <div class="i18n-settings" style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">
              <!-- Default Language -->
              <div>
                <label class="form-label">Default Language</label>
                <div class="section-description" style="margin-bottom: 4px;">The primary language for your application</div>
                <nr-select
                  size="small"
                  .value=${this.defaultLocale}
                  .options=${LOCALE_OPTIONS}
                  @nr-change=${this.handleDefaultLocaleChange}
                ></nr-select>
              </div>

              <!-- Supported Languages -->
              <div>
                <label class="form-label">Supported Languages</label>
                <div class="section-description" style="margin-bottom: 4px;">Languages available in your application</div>
                <nr-select
                  size="small"
                  .value=${this.supportedLocales}
                  .options=${LOCALE_OPTIONS}
                  multiple
                  @nr-change=${this.handleSupportedLocalesChange}
                ></nr-select>
              </div>

              <!-- Active Language / Auto-detect -->
              <div>
                <label class="form-label">Active Language (Runtime Default)</label>
                <div class="section-description" style="margin-bottom: 4px;">Choose default or auto-detect from browser</div>
                <nr-select
                  size="small"
                  .value=${this.activeLocale}
                  .options=${[
                    { value: 'auto', label: 'Auto-detect (Browser Language)' },
                    ...LOCALE_OPTIONS.filter(opt => this.supportedLocales.includes(opt.value))
                  ]}
                  @nr-change=${this.handleActiveLocaleChange}
                ></nr-select>
              </div>
            </div>
          ` : nothing}
        </div>

        <div class="divider"></div>

        <!-- Danger Zone -->
        <div class="danger-section">
          <div class="danger-title">Danger Zone</div>
          <div class="danger-description">
            Once you delete an application, there is no going back. Please be certain.
          </div>
          <nr-button
            type="primary"
            danger
            size="small"
            @click=${this.handleDeleteApp}
          >Delete Application</nr-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-settings-modal': AppSettingsModal;
  }
}
