// CRITICAL: Register all runtime components first
import "../../../runtime/utils/register-components";

import "../../params/page/Page.ts";
import "../../params/flow/Flow.ts";
import "../../params/function/Function.ts";
import "../../params/database/Database.ts";
import "../../params/files/Files.ts";
import "./EditorInteractivePanel.ts";
import { $editorState } from '../../../runtime/redux/store/apps.ts';
import { css, html, LitElement } from "lit";
import { state } from "lit/decorators.js";
import { closeEditorTab } from '../../../runtime/redux/actions/editor/closeEditorTab.ts';
import { setCurrentEditorTab } from '../../../runtime/redux/actions/editor/setCurrentEditorTab.ts';

export class TabsPanel extends LitElement {
  static override styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }

      nr-tabs {
        height: 100%;
        display: flex;
        flex-direction: column;
        --nuraly-spacing-tabs-content-padding-small : 0;
      }

      nr-tabs::part(content) {
        flex: 1;
        min-height: 0;
        overflow: auto;
      }
    `
  ];
  @state()
  activeTab = 0;

  @state()
  editableTabs = [


  ];

  private unsubscribe?: () => void;

  constructor() {
    super();

  }

  override connectedCallback() {
    super.connectedCallback();
    
    // Defer subscription to avoid hydration mismatch
    // This allows SSR to render empty state, then populate on client
    setTimeout(() => {
      this.unsubscribe = $editorState.subscribe((editorState) => {
        editorState.tabs.forEach((tab) => {
          // Check if the tab already exists
          const tabExists = this.editableTabs.some(existingTab => existingTab.id === tab.id);
          if (!tabExists) {
            switch (tab.type) {
            case "page":
              this.editableTabs.push({
                id: tab.id,
                label: tab.label,
                type : "page",
                content: html`
                                <editor-interactive-panel>
                                    <content-page></content-page>
                                </editor-interactive-panel>`
              });
              break;
            case "function":
              this.editableTabs.push({
                id: tab.id,
                label: tab.label,
                content: html`
                                <!-- <editor-interactive-panel> -->
                                    <function-page .detail=${tab.detail}></function-page>
                                <!-- </editor-interactive-panel> -->
                                `
              });
              break;
            case "files":
              this.editableTabs.push({
                id: tab.id,
                label: tab.label,
                content: html`
                                  <editor-interactive-panel>
                                    <files-page .detail=${tab.detail}></files-page>
                                </editor-interactive-panel>`
              });
              break;
            case "flow":
              this.editableTabs.push({
                id: tab.id,
                label: tab.label,
                content: html`<div style="width: 100%; height: calc(100vh - 130px);"><flow-page .detail=${tab.detail}></flow-page></div>`
              });
              break;
                   case "database":
                    this.editableTabs.push({
                      id: tab.id,
                      label: tab.label,
                      content: html`
                                        <editor-interactive-panel>
                                          <databse-page .detail=${tab.detail}></databse-page>
                                      </editor-interactive-panel>`
                    });
              break;
          }
        }
      });

      if (editorState.currentTab) {
        // Find the tab index in editableTabs (not editorState.tabs) since they may differ
        const tabindex = this.editableTabs.findIndex((tab: any) => tab.id === editorState.currentTab.id);
        if (tabindex >= 0) {
          this.activeTab = tabindex;
        }
      }

      // Trigger a re-render with the updated tabs
      this.editableTabs = [...this.editableTabs];
      this.requestUpdate();
      });
    }, 0);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  override render() {
    return html`
      ${this.editableTabs.length === 0 ? html`
		` : html`
        <nr-tabs
       
        size="small"
          .activeTab=${this.activeTab}
          @nr-tab-remove=${(e: CustomEvent) => {
            const tabIndex = e.detail.index;
            const tabToClose = this.editableTabs[tabIndex];

            if (!tabToClose) {
              console.error('[TabsPanel] No tab found at index:', tabIndex);
              return;
            }

            closeEditorTab(tabToClose);
            this.editableTabs = [...this.editableTabs.filter((_, index) => index !== tabIndex)];

            // Calculate new active tab
            const newActiveTab = Math.max(0, tabIndex - 1);
            this.activeTab = newActiveTab;

            if (this.editableTabs[newActiveTab]) {
              setCurrentEditorTab(this.editableTabs[newActiveTab]);
            }
        }}
          @nr-tab-click=${(e: CustomEvent) => {
            const tabIndex = e.detail.index;
            if (this.editableTabs[tabIndex]) {
              setCurrentEditorTab(this.editableTabs[tabIndex]);
            }
        }}
          .tabs=${this.editableTabs}
          .editable=${{
          canDeleteTab: this.editableTabs.length !== 1,
          canEditTabTitle: false,
          canAddTab: false,
          canMove: false
        }}
        ></nr-tabs>
      `}

    `;
  }
}

customElements.define("tabs-panel", TabsPanel);