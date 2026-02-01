// CRITICAL: Register all runtime components first
import "../../../../features/runtime/utils/register-components";

// Import native left panel component
import "../left-panel/StudioLeftPanel.ts";

import { $environment, type Environment, ViewMode } from '../../../../features/runtime/redux/store/environment';
import { $editorState, $currentApplication } from '../../../../features/runtime/redux/store/apps';
import { $leftPanelCollapsed, loadLeftPanelPreference, saveLeftPanelPreference } from '../../../../features/runtime/redux/store/ui-preferences';
import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("left-panel")
export class LeftPanel extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        height: 100%;
        width: 300px;
        transition: width 200ms ease-in-out;
      }
      :host(.collapsed) {
        width: 40px;
      }
      :host(.hidden) {
        display: none;
      }

      .panel-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--panel-bg, white);
        border-right: 1px solid var(--panel-border, #e0e0e0);
      }

      .toggle-bar {
        display: flex;
        align-items: center;
        height: 41px;
        padding: 0 8px;
        border-bottom: 1px solid var(--panel-border, #e0e0e0);
        background: var(--panel-bg, white);
      }

      .toggle-button {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 4px;
        background: transparent;
        border: none;
        color: var(--text-color, #666);
        transition: background 150ms ease;
      }

      .toggle-button:hover {
        background: var(--hover-bg, #f0f0f0);
      }

      .panel-content {
        flex: 1;
        overflow: hidden;
      }

      .collapsed-bar {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 40px;
        height: 100%;
        background: var(--panel-bg, white);
        border-right: 1px solid var(--panel-border, #e0e0e0);
        padding-top: 8px;
      }
    `
  ];

  @state()
  mode: ViewMode = ViewMode.Edit;

  @state()
  collapsed: boolean = false;

  @state()
  private appId: string = '';

  private unsubscribeEnvironment?: () => void;
  private unsubscribeCollapsed?: () => void;
  private unsubscribeApp?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    this.unsubscribeEnvironment = $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
      this.updateVisibility();
    });

    this.unsubscribeCollapsed = $leftPanelCollapsed.subscribe((collapsed: boolean) => {
      this.collapsed = collapsed;
      this.updateCollapsedClass();
    });

    this.unsubscribeApp = $currentApplication.subscribe((app: any) => {
      if (app?.uuid && app.uuid !== this.appId) {
        this.appId = app.uuid;
        // Load preference when app changes
        loadLeftPanelPreference(this.appId);
      }
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeEnvironment?.();
    this.unsubscribeCollapsed?.();
    this.unsubscribeApp?.();
  }

  private updateVisibility() {
    if (this.mode !== ViewMode.Edit) {
      this.classList.add('hidden');
    } else {
      this.classList.remove('hidden');
    }
  }

  private updateCollapsedClass() {
    if (this.collapsed) {
      this.classList.add('collapsed');
    } else {
      this.classList.remove('collapsed');
    }
  }

  private handleToggle() {
    if (this.appId) {
      saveLeftPanelPreference(this.appId, !this.collapsed);
    }
  }

  render() {
    if (this.mode !== ViewMode.Edit) {
      return nothing;
    }

    if (this.collapsed) {
      return html`
        <div class="collapsed-bar">
          <button class="toggle-button" @click=${this.handleToggle} title="Expand panel">
            <nr-icon name="arrow-right-from-line" size="small"></nr-icon>
          </button>
        </div>
      `;
    }

    return html`
      <div class="panel-wrapper">
        <div class="toggle-bar">
          <button class="toggle-button" @click=${this.handleToggle} title="Collapse panel">
            <nr-icon name="arrow-left-from-line" size="small"></nr-icon>
          </button>
        </div>
        <div class="panel-content">
          <studio-left-panel></studio-left-panel>
        </div>
      </div>
    `;
  }
}