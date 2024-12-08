/* eslint-disable @typescript-eslint/no-explicit-any */
import {LitElement, PropertyValueMap, html, nothing} from 'lit';
import {property} from 'lit/decorators.js';
import {styles} from './tabs.style.js';
import {classMap} from 'lit/directives/class-map.js';
import { NOTHING_STRING, TabEditable, TabEvent, TabOrientation, TabsAlign} from './tabs.constant.js';
//todo: make this use peer dependency
import "../label/label.component.js";
/**
 * `hy-tabs` is a LitElement that provides a customizable tabs.
 * @customElement 'hy-tabs'
 *
 * Attributes
 * @attr activeTab
 * @attr orientation
 * @attr tabsAlign
 * @attr editable
 * Events
 * @fires tabEdited - Indicates when tab edited
 * @fires removeTab - Indicates when tab removed
 * @fires addTab - Indicates when tab added
 */
export class TabsComponent extends LitElement {
  @property({type: Number})
  activeTab!: number;

  @property({type: String})
  orientation!: TabOrientation;

  @property({type: String})
  tabsAlign!: TabsAlign;

  @property({type: Object})
  editable!: TabEditable;

  @property({type: Array})
  tabs!: any[];

  static override styles = styles;

  constructor() {
    super();
    this.activeTab = 0;
    this.orientation = TabOrientation.Horizontal;
  }

  override render() {
    return html`
      <div
        class=${classMap({
          'tabs-container': true,
          'vertical-align': this.orientation === TabOrientation.Vertical,
          'horizontal-align': this.orientation === TabOrientation.Horizontal,
          'right-align': this.tabsAlign === TabsAlign.Right,
          'left-align': this.tabsAlign === TabsAlign.Left,
          'center-align': this.tabsAlign === TabsAlign.Center,
        })}
      >
        <div
          class="tab-labels"
          style="flex-direction: ${this.orientation === TabOrientation.Vertical ? 'column' : ('row' as any)}"
        >
          <div></div>

          ${this.renderTabs()}
          <div></div>
        </div>
        <div class="tab-content">${this.renderActiveTab()}</div>
      </div>
    `;
  }
  override connectedCallback() {
    super.connectedCallback();
    this.observeChildrenChanges();
    this.addEventListener('dragover', this.handleDragOver);
  }

  private observeChildrenChanges() {
    const mutationObserver = new MutationObserver(() => {
      this.requestUpdate();
    });

    mutationObserver.observe(this, {childList: true});
  }

  private handleDragStart(event: any) {
    event.dataTransfer.setData('text/plain', event.currentTarget.dataset.index);
    event.dataTransfer.effectAllowed = 'move';
    event.target.closest('.tab-label').classList.add('dragging-start');
  }

  private handleDragOver(event: any) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  private handleDragEnter(event: any) {
    event.preventDefault();
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    event.currentTarget.classList.add('dragging');
  }

  private handleDragLeave(event: any) {
    event.preventDefault();
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    if (event.currentTarget.classList.contains('dragging')) {
      event.currentTarget.classList.remove('dragging');
    }
  }

  private handleDrop(event: any) {
    event.preventDefault();
    const sourceIndex = event.dataTransfer.getData('text/plain');
    const targetIndex = event.currentTarget.dataset.index;
    if (sourceIndex !== targetIndex) {
      const tabs = Array.from(this.children || []);
      const sourceTab = tabs[sourceIndex];
      const targetTab = tabs[targetIndex];
      this.dispatchEvent(
        new CustomEvent(TabEvent.tabOrderChange, {
          detail: {sourceTab, targetTab, sourceIndex: parseInt(sourceIndex), targetIndex: parseInt(targetIndex)},
        })
      );
    }
    this.shadowRoot!.querySelector('.dragging')?.classList.remove('dragging');
    event.target.classList.remove('dragging');
    this.shadowRoot!.querySelector('.dragging-start')?.classList.remove('dragging-start');
  }

  renderDeleteIcon(tab :any){
    // if the tab does not gave edibale propetry and canDeleteTab is true
    // then render the delete icon
    if(!tab.editable && this.editable?.canDeleteTab){
      return html`<hy-icon
      @click=${() => {
        this.dispatchEvent(
          new CustomEvent(TabEvent.removeTab, {
            detail: {index: tab.index},
          })
        );
      }}
      name="window-close"
      class="close-icon"
    ></hy-icon>`
    ;
  }
  return nothing;

  }
  private renderTabs() {
    const tabs = [];
    const children = this.tabs || [];
    for (let tabIndex = 0; tabIndex < children.length; tabIndex++) {
      const tab = html`
        <div
          data-index=${tabIndex}
          draggable=${this.editable?.canMove}
          @dragenter=${this.handleDragEnter}
          @dragleave=${this.handleDragLeave}
          @dragstart=${(e: any) => this.handleDragStart(e)}
          @drop=${(event: Event) => this.handleDrop(event)}
          class=${tabIndex === this.activeTab ? 'tab-label active' : 'tab-label'}
          @mousedown=${(e: Event) => this.setActiveTab(tabIndex, children[tabIndex], e)}
        >
          <hy-label
            contenteditable=${this.editable?.canEditTabTitle ? true : nothing}
            @blur=${(event: Event) => {
              this.dispatchEvent(
                new CustomEvent(TabEvent.tabEdited, {
                  detail: {
                    tab: {
                      label: (event.target as HTMLElement)?.textContent,
                      index: tabIndex,
                    },
                  },
                })
              );
            }}
            >${children[tabIndex].label}</hy-label
          >
          ${children[tabIndex].editable?.canDeleteTab ?? this.editable?.canDeleteTab
            ? html`<hy-icon
                @click=${() => {
                  this.dispatchEvent(
                    new CustomEvent(TabEvent.removeTab, {
                      detail: {index: tabIndex},
                    })
                  );
                }}
                name="window-close"
                class="close-icon"
              ></hy-icon>`
            : NOTHING_STRING}
        </div>
      `;
      tabs.push(tab);
    }
    if (this.editable?.canAddTab) {
      const tab = html`
        <div
          class="tab-label add-tab-label"
          @click=${() => {
            this.dispatchEvent(new CustomEvent(TabEvent.addTab));
          }}
        >
          <hy-icon name="plus" class="add-tab-icon"></hy-icon>
        </div>
      `;
      tabs.push(tab);
    }
    return tabs;
  }

  override updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    super.updated(changedProperties);
    if (!this.tabs[this.activeTab]) {
      if (!this.tabs[this.activeTab - 1]) {
        this.activeTab++;
      } else {
        this.activeTab--;
      }
    }
  }

  private renderActiveTab() {
    const children = this.tabs ? [...this.tabs] : [];
    if (children.length > 0 && this.activeTab >= 0 && this.activeTab < children.length) {
      return html`${children[this.activeTab].content}`;
    }
    return html`${NOTHING_STRING}`;
  }

  private setActiveTab(index: number, _element: Element, event: Event) {
    event.preventDefault();
    this.activeTab = index;
    /*element?.dispatchEvent(
      new CustomEvent(TabEvent.tabTilteClick, {
        detail: event,
      })
    );*/
  }
}

customElements.define('hy-tabs', TabsComponent);
