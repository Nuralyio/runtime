import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { ViewMode } from '@nuraly/runtime/redux/store';
import { $currentApplication } from '@nuraly/runtime/redux/store';
import { type ComponentElement } from '@nuraly/runtime/redux/store';

import { eventDispatcher } from '@nuraly/runtime/utils';
import { ExecuteInstance } from '@nuraly/runtime';
import '../preview-panel/PreviewIFramePanel.ts';

@customElement("editor-interactive-panel")
export class EditorInteractivePanel extends LitElement {
  static styles = css`
    :host {
      height: calc(100vh - 90px);
      display: block;
    }
    .iframe-wrapper {
      width: 100%;
      height: 100%;
    }
  `;

  @state() mode: ViewMode = ViewMode.Edit;
  @state() selectedComponent: ComponentElement;

  connectedCallback() {
    super.connectedCallback();
    this.initializeSubscriptions();
  }

  render() {
    return html`
      <style>
        :host {
          width: ${this.mode == ViewMode.Edit ? "calc(100vw - 650px)" : "100vw"};
        }
      </style>
      <div class="iframe-wrapper">
        <preview-iframe-panel
          .applicationId=${$currentApplication.get()?.uuid || ''}
          .pageUrl=${ExecuteInstance.Vars.currentPage || ''}
          @component-selected-from-iframe=${this.handleComponentSelectedFromIframe}
        ></preview-iframe-panel>
      </div>
    `;
  }

  private handleComponentSelectedFromIframe(event: CustomEvent) {
    const { component } = event.detail;
    if (component) {
      this.selectedComponent = component;
      this.requestUpdate();
    }
  }

  private initializeSubscriptions() {
    eventDispatcher.on('Vars:currentEditingMode', () => {
      this.mode = ExecuteInstance.Vars.currentEditingMode === "edit" ? ViewMode.Edit : ViewMode.Preview;
    });
  }
}
