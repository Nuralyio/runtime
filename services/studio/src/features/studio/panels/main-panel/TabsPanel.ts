import "../../params/page/Page.ts";
import "../../params/flow/Flow.ts";
import "../../params/function/Function.ts";
import "../../params/database/Database.ts";
import "../../params/files/Files.ts";
import "./EditorInteractivePanel.ts";
import { $editorState } from "@shared/redux/store/apps.ts";
import { css, html, LitElement } from "lit";
import { state } from "lit/decorators.js";
import { closeEditorTab } from "@shared/redux/actions/editor/closeEditorTab.ts";
import { setCurrentEditorTab } from "@shared/redux/actions/editor/setCurrentEditorTab.ts";

export class TabsPanel extends LitElement {
  static override styles = [
    css`
           

        `
  ];
  @state()
  activeTab = 0;

  @state()
  editableTabs = [


  ];

  constructor() {
    super();

  }

  override connectedCallback() {
    super.connectedCallback();
    $editorState.subscribe((editorState) => {
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
                                <editor-interactive-panel>
                                    <function-page .detail=${tab.detail}></function-page>
                                </editor-interactive-panel>`
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
                content: html`
                                  <editor-interactive-panel>
                                    <flow-page .detail=${tab.detail}></flow-page>
                                </editor-interactive-panel>`
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
        const tabindex = editorState.tabs.findIndex((tab: any) => tab.id === editorState.currentTab.id);
        if (tabindex > 0) {
          this.activeTab = tabindex;
          // Ensure the activeTab index is updated if needed
          this.requestUpdate();
        }
      }

      // Trigger a re-render with the updated tabs
      this.editableTabs = [...this.editableTabs];
    });
  }
  override render() {
    return html`
      ${this.editableTabs.length === 0 ? html`
		` : html`
        <nr-tabs
       
        size="small"
          .activeTab=${this.activeTab}
          @removeTab=${(e: CustomEvent) => {
            const tabToClose = this.editableTabs[e.detail.index];
            closeEditorTab(tabToClose);
          this.editableTabs = [...this.editableTabs.filter((tab, index) => index !== e.detail.index)];
          this.activeTab = e.detail.index-1;
          setCurrentEditorTab(this.editableTabs[this.activeTab]);

        }}
          @tabTilteClick=${(e: CustomEvent) => {
          setCurrentEditorTab($editorState.get().tabs[e.detail.index]);
        }
        }
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