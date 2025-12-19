import { css, html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { ViewMode, $currentApplication, type ComponentElement } from '@nuraly/runtime/redux/store';

import { eventDispatcher } from '@nuraly/runtime/utils';
import { ExecuteInstance } from '@nuraly/runtime';
import '../preview-panel/PreviewIFramePanel.ts';
import type { PreviewIFramePanel } from '../preview-panel/PreviewIFramePanel.ts';

/**
 * EditorInteractivePanel - Parent component that hosts the iframe preview
 *
 * This component renders the PreviewIFramePanel which loads the editor canvas
 * in an iframe. The overlays (selection, hover) are rendered INSIDE the iframe
 * by the PreviewEditorPanel component.
 */
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

  @query('preview-iframe-panel') private readonly iframePanel: PreviewIFramePanel;

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
      // Sync selection to parent app state
      ExecuteInstance.VarsProxy.selectedComponents = [component];
      this.requestUpdate();
    }
  }

  private initializeSubscriptions() {
    eventDispatcher.on('Vars:currentEditingMode', () => {
      this.mode = ExecuteInstance.Vars.currentEditingMode === "edit" ? ViewMode.Edit : ViewMode.Preview;
    });

    // Listen for selection changes from structure panel or other sources
    eventDispatcher.on('Vars:selectedComponents', () => {
      const selectedComponents = ExecuteInstance.Vars.selectedComponents || [];
      if (selectedComponents.length > 0 && this.iframePanel) {
        const component = selectedComponents[0];
        // Only sync if selection came from outside (not from iframe click)
        if (this.selectedComponent?.uuid !== component.uuid) {
          this.selectedComponent = component;
          this.iframePanel.selectComponent(component.uuid);
        }
      }
    });
  }
}
