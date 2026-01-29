// CRITICAL: Register all runtime components first
import "../../../runtime/utils/register-components";

import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $environment, type Environment, ViewMode } from '../../../runtime/redux/store/environment.ts';
import { $editorState } from '../../../runtime/redux/store/apps.ts';

import "../control-panel/ControlPanelTabs.ts";

@customElement("right-panel")
export class RightPanel extends LitElement {
  static styles = [css`
      :host {
        display: block;
        width: 350px;
        height: 100%;
        --nuraly-tabs-content-padding: 20px;
        --nuraly-tabs-content-maring: 10px;
        --nuraly-tabs-container-background-color: white;
      }
      :host(.hidden) {
        display: none;
      }
      aside {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }`];

  @state()
  mode: ViewMode = ViewMode.Edit;

  @state()
  currentTabType: string = "page";

  showSecondsRow: boolean;

  private unsubscribeEnvironment?: () => void;
  private unsubscribeEditorState?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    this.unsubscribeEnvironment = $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
      this.updateVisibility();
    });
    this.unsubscribeEditorState = $editorState.subscribe((editorState) => {
      this.currentTabType = editorState.currentTab?.type || "page";
      this.updateVisibility();
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeEnvironment?.();
    this.unsubscribeEditorState?.();
  }

  private updateVisibility() {
    // Hide in preview mode, or when viewing workflow/database tabs
    const shouldHide = this.mode !== ViewMode.Edit ||
      this.currentTabType === "flow" ||
      this.currentTabType === "database";

    if (shouldHide) {
      this.classList.add('hidden');
    } else {
      this.classList.remove('hidden');
    }
  }

  render() {
    return html`
      <aside class="sidebar">
        <div class="my-4 w-full text-center">
          <span class="font-mono text-xl font-bold tracking-widest"></span>
        </div>
        <div class="my flex-grow w-full h-full" style="width:100%">
          <control-panel class="w-full h-full" style=""></control-panel>
        </div>
      </aside>`;
  }
}
