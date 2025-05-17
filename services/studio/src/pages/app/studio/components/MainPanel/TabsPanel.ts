import "../Page/Page.ts";
import "../Flow/Flow.ts";
import "../Function/Function.ts";
import "../Files/Files.ts";
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
                font-family: 'Roboto', sans-serif;
                margin: 10px 0 0 16px;
            }
            hy-tabs  {
            	--hybrid-menu-background-color: #2c2c2c;
		        --hybrid-tabs-label-font-size: 12px;
		          --hybrid-button-border-color: transparent;
    --hybrid-tabs-container-background-local-color: transparent;
    --hybrid-tabs-label-active-background-color: white;
    --hybrid-tabs-label-active-border-left-radius: 5px;
    --hybrid-tabs-label-active-border-right-radius: 5px;

          		}
              @media (prefers-color-scheme: dark) {
                hy-tabs {
                  --hybrid-tabs-container-box-shadow : 2px 0px 5px 0px #454545 ;
                  --hybrid-tabs-container-background-color : #313131;
    --hybrid-tabs-label-active-background-color: #272727;

                }
              }

              hy-tabs{
       
      }
       
      @media (prefers-color-scheme: dark) {
        hy-tabs {
          --hybrid-tabs-content-background-color: #2c2c2c;
          color: #f3f3f3;
          font-weight: 400;
        }
      
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
        <hy-tabs
        style=${styleMap({
      "--hybrid-tabs-content-padding": "0px",
      "--hybrid-tabs-border-radius": "8px"

    })
        }
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
        ></hy-tabs>
      `}

    `;
  }
}

customElements.define("tabs-panel", TabsPanel);