/**
 * @file Row.ts
 * @description Grid Row component that wraps nr-row from @nuralyui/grid
 */

import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { $components } from '../../../../../redux/store/component/store.ts';
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { renderComponent } from '../../../../../utils/render-util';
import { createRef, ref } from "lit/directives/ref.js";
import styles from "./Row.style.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';
import { setContextMenuEvent } from '../../../../../redux/actions/page/setContextMenuEvent.ts';

// Import nr-row from nuralyui grid
import "@nuralyui/grid";

@customElement("grid-row-block")
export class GridRow extends BaseElementBlock {
  static styles = styles;

  @property({ type: Object }) component: ComponentElement;
  @property({ type: Object }) item: any;
  @property({ type: Boolean }) isViewMode = false;

  @state() childrenComponents: ComponentElement[] = [];
  @state() containerRef = createRef();

  override async connectedCallback() {
    await super.connectedCallback();
    this.updateChildrenComponents();
  }

  override willUpdate(changedProperties: Map<string, any>) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("component")) {
      this.updateChildrenComponents();
    }
  }

  private updateChildrenComponents(): void {
    this.childrenComponents = this.component?.childrenIds?.map((id) => {
      return $components.get()[this.component?.application_id]?.find((component) => component.uuid === id);
    }).filter(Boolean) ?? [];
  }

  /**
   * Get gutter value - supports number, [h, v] array, or responsive object
   */
  private getGutter() {
    const gutter = this.inputHandlersValue?.gutter;
    if (!gutter) return 0;

    // If it's already a number or array, return as-is
    if (typeof gutter === 'number' || Array.isArray(gutter)) {
      return gutter;
    }

    // If it's a string that looks like a number, parse it
    if (typeof gutter === 'string' && !isNaN(Number(gutter))) {
      return Number(gutter);
    }

    // Otherwise return as-is (could be responsive object)
    return gutter;
  }

  renderView() {
    const gutter = this.getGutter();
    const align = this.inputHandlersValue?.align || '';
    const justify = this.inputHandlersValue?.justify || '';
    const wrap = this.inputHandlersValue?.wrap !== false;

    return html`
      <nr-row
        ${ref(this.inputRef)}
        data-component-uuid=${this.component?.uuid}
        data-component-name=${this.component?.name}
        style=${styleMap(this.getStyles())}
        .gutter=${gutter}
        align=${align || nothing}
        justify=${justify || nothing}
        ?wrap=${wrap}
      >
        ${this.childrenComponents.length
          ? renderComponent(
              this.childrenComponents.map((component) => ({ ...component, item: this.item })),
              this.item,
              this.isViewMode,
              { ...this.component, uniqueUUID: this.uniqueUUID }
            )
          : nothing}
      </nr-row>
    `;
  }

  override renderComponent() {
    const gutter = this.getGutter();
    const align = this.inputHandlersValue?.align || '';
    const justify = this.inputHandlersValue?.justify || '';
    const wrap = this.inputHandlersValue?.wrap !== false;

    return html`
      ${this.isViewMode
        ? this.renderView()
        : html`
            <nr-row
              ${ref(this.inputRef)}
              ${ref(this.containerRef)}
              data-component-uuid=${this.component?.uuid}
              data-component-name=${this.component?.name}
              @click="${(e: Event) => {
                setContextMenuEvent(null);
                this.executeEvent("onClick", e);
              }}"
              style=${styleMap({
                ...this.getStyles(),
                "min-height": this.childrenComponents.length ? "auto" : "100px",
              })}
              .gutter=${gutter}
              align=${align || nothing}
              justify=${justify || nothing}
              ?wrap=${wrap}
            >
              ${this.childrenComponents.length
                ? renderComponent(
                    this.childrenComponents.map((component) => ({ ...component, item: this.item })),
                    this.item,
                    this.isViewMode,
                    { ...this.component, uniqueUUID: this.uniqueUUID }
                  )
                : html`
                    <div
                      class="empty-message"
                      @click="${() => setCurrentComponentIdAction(this.component?.uuid)}"
                    >
                      Add Grid Columns (nr-col) to this row
                      <drag-wrapper
                        .where=${"inside"}
                        .message=${"Drop inside"}
                        .component=${{ ...this.component }}
                        .inputRef=${this.inputRef}
                        .isDragInitiator=${this.isDragInitiator}
                      >
                      </drag-wrapper>
                    </div>
                  `}
            </nr-row>
          `}
    `;
  }
}
