/* eslint-disable @typescript-eslint/no-explicit-any */
import {LitElement, html, nothing} from 'lit';
import {property, state} from 'lit/decorators.js';
import {styles} from './tabs.style';
import {classMap} from 'lit/directives/class-map.js';
import {TabEditable, TabOrientation} from './menu.type';

/**
 * `hy-tabs` is a LitElement that provides a customizable tabs.
 * @customElement 'hy-button'
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
class TabsComponent extends LitElement {
  @property({type: Number})
  activeTab!: number;

  @property({type: String})
  orientation!: TabOrientation;

  @property({type: String})
  tabsAlign!: string;

  @property({type: Object})
  editable!: TabEditable;

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
          'right-align': this.tabsAlign === 'right',
          'left-align': this.tabsAlign === 'left',
          'center-align': this.tabsAlign === 'center',
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
  }

  private observeChildrenChanges() {
    const mutationObserver = new MutationObserver(() => {
      this.requestUpdate();
    });

    mutationObserver.observe(this, {childList: true});
  }
  renderTabs() {
    const tabs = [];
    const children = [...this.children];
    for (let tabIndex = 0; tabIndex < children.length; tabIndex++) {
      const tab = html`
        <div
          class=${tabIndex === this.activeTab ? 'tab-label active' : 'tab-label'}
          @click=${(e: Event) => this.setActiveTab(tabIndex, children[tabIndex], e)}
        >
          <span
            contenteditable=${this.editable?.canEditTabTitle ? true : nothing}
            @blur=${(e: Event) => {
              this.dispatchEvent(
                new CustomEvent('tabEdited', {
                  detail: {
                    tab: {
                      label: (e.target as HTMLElement)?.textContent,
                      index: tabIndex,
                    },
                  },
                })
              );
            }}
            >${children[tabIndex].getAttribute('label')}</span
          >
          ${this.editable?.canDeleteTab
            ? html`<hy-icon
                @click=${() => {
                  this.dispatchEvent(
                    new CustomEvent('removeTab', {
                      detail: {index: tabIndex},
                    })
                  );
                }}
                name="window-close"
                style="    font-size: 13px;"
              ></hy-icon>`
            : ''}
        </div>
      `;
      tabs.push(tab);
    }
    if (this.editable?.canAddTab) {
      const tab = html`
        <div
          class="tab-label"
          style="font-size: 13px;text-align: center;"
          @click=${() => {
            this.dispatchEvent(new Event('addTab'));
          }}
        >
          <hy-icon name="plus"></hy-icon>
        </div>
      `;
      tabs.push(tab);
    }

    return tabs;
  }

  override updated(changedProperties: Map<string, any>) {
    if (!this.children[this.activeTab]) {
      this.activeTab--;
    }
  }

  renderActiveTab() {
    const children = [...this.children];
    if (children.length > 0 && this.activeTab >= 0 && this.activeTab < children.length) {
      return children[this.activeTab].cloneNode(true);
    }
    return html``;
  }

  setActiveTab(index: number, element: Element, e: Event) {
    e.preventDefault();
    this.activeTab = index;
    element.dispatchEvent(new Event('tabTilteClick', e));
  }
}

customElements.define('hy-tabs', TabsComponent);
