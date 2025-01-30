import "../Page/Page.ts";
import "../Flow/Flow.ts";
import "../Function/Function.ts";
import "./EditorInteractivePanel.ts";
import { $editorState } from "$store/apps.ts";
import { css, html, LitElement } from "lit";
import { state } from "lit/decorators.js";
import { closeEditorTab } from "$store/actions/editor/closeEditorTab.ts";
import { setCurrentEditorTab } from "$store/actions/editor/setCurrentEditorTab.ts";
import { styleMap } from "lit/directives/style-map.js";

export class TabsPanel extends LitElement {
  static override styles = [
    css`
            :host {
                display: block;
                background-color: #2d2d2d;
                font-family: 'Roboto', sans-serif;
            }
            hy-tabs  {
            	--hybrid-menu-background-color: #2c2c2c;
		        --hybrid-tabs-label-font-size: 12px;
		          --hybrid-button-border-color: transparent;
          		}

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
            case "datasource":
              this.editableTabs.push({
                id: tab.id,
                label: `${tab.detail?.provider_type}/${tab.detail?.databasename} : ${tab.detail?.label}`,
                content: html`
                                <data-source-explorer .detail=${tab.detail}></data-source-explorer>`
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
		<editor-interactive-panel >
          <content-page></content-page>
        </editor-interactive-panel>` : html`
        <hy-tabs
        style=${
          styleMap({
            "--hybrid-tabs-content-padding": "0px",
          })
        }
          .activeTab=${this.activeTab}
          @removeTab=${(e: CustomEvent) => {
            this.activeTab = 0;
            this.editableTabs = [...this.editableTabs.filter((tab, index) => index !== e.detail.index)];
          console.log( this.editableTabs)
          }}
          @tabTilteClick=${(e: CustomEvent) => {
            console.log("tabTilteClick", $editorState.get().tabs[e.detail.index])
            setCurrentEditorTab($editorState.get().tabs[e.detail.index]);
          } 
      }
          .tabs=${this.editableTabs}
          .editable=${{
            canDeleteTab: true,
            canEditTabTitle: false,
            canAddTab: false,
            canMove: false
          }}
        ></hy-tabs>
      `}

    `;
  }
}

customElements.define("tabs-panel", TabsPanel);