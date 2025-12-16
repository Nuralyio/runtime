/**
 * @file Col.ts
 * @description Grid Column component that wraps nr-col from @nuralyui/grid
 */

import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { $components } from '../../../../../redux/store/component/store.ts';
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { renderComponent } from '../../../../../utils/render-util';
import { createRef, ref } from "lit/directives/ref.js";
import styles from "./Col.style.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';
import { setContextMenuEvent } from '../../../../../redux/actions/page/setContextMenuEvent.ts';

// Import nr-col from nuralyui grid
import "@nuralyui/grid";

@customElement("grid-col-block")
export class GridCol extends BaseElementBlock {
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
   * Parse numeric value from input (handles string or number)
   */
  private parseNumeric(value: any): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  /**
   * Parse responsive breakpoint value
   * Can be a number or an object { span, offset, order, pull, push }
   */
  private parseBreakpoint(value: any): number | object | undefined {
    if (value === undefined || value === null || value === '') return undefined;

    // If it's a number or numeric string, return as number
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && !isNaN(Number(value))) return Number(value);

    // If it's an object, return as-is
    if (typeof value === 'object') return value;

    return undefined;
  }

  renderView() {
    const span = this.parseNumeric(this.inputHandlersValue?.span);
    const offset = this.parseNumeric(this.inputHandlersValue?.offset) ?? 0;
    const order = this.parseNumeric(this.inputHandlersValue?.order);
    const pull = this.parseNumeric(this.inputHandlersValue?.pull) ?? 0;
    const push = this.parseNumeric(this.inputHandlersValue?.push) ?? 0;
    const flex = this.inputHandlersValue?.flex || '';

    // Responsive breakpoints
    const xs = this.parseBreakpoint(this.inputHandlersValue?.xs);
    const sm = this.parseBreakpoint(this.inputHandlersValue?.sm);
    const md = this.parseBreakpoint(this.inputHandlersValue?.md);
    const lg = this.parseBreakpoint(this.inputHandlersValue?.lg);
    const xl = this.parseBreakpoint(this.inputHandlersValue?.xl);
    const xxl = this.parseBreakpoint(this.inputHandlersValue?.xxl);

    return html`
      <nr-col
        ${ref(this.inputRef)}
        data-component-uuid=${this.component?.uuid}
        data-component-name=${this.component?.name}
        style=${styleMap(this.getStyles())}
        span=${span ?? nothing}
        offset=${offset}
        order=${order ?? nothing}
        pull=${pull}
        push=${push}
        flex=${flex || nothing}
        .xs=${xs}
        .sm=${sm}
        .md=${md}
        .lg=${lg}
        .xl=${xl}
        .xxl=${xxl}
      >
        ${this.childrenComponents.length
          ? renderComponent(
              this.childrenComponents.map((component) => ({ ...component, item: this.item })),
              this.item,
              this.isViewMode,
              { ...this.component, uniqueUUID: this.uniqueUUID }
            )
          : nothing}
      </nr-col>
    `;
  }

  override renderComponent() {
    const span = this.parseNumeric(this.inputHandlersValue?.span);
    const offset = this.parseNumeric(this.inputHandlersValue?.offset) ?? 0;
    const order = this.parseNumeric(this.inputHandlersValue?.order);
    const pull = this.parseNumeric(this.inputHandlersValue?.pull) ?? 0;
    const push = this.parseNumeric(this.inputHandlersValue?.push) ?? 0;
    const flex = this.inputHandlersValue?.flex || '';

    // Responsive breakpoints
    const xs = this.parseBreakpoint(this.inputHandlersValue?.xs);
    const sm = this.parseBreakpoint(this.inputHandlersValue?.sm);
    const md = this.parseBreakpoint(this.inputHandlersValue?.md);
    const lg = this.parseBreakpoint(this.inputHandlersValue?.lg);
    const xl = this.parseBreakpoint(this.inputHandlersValue?.xl);
    const xxl = this.parseBreakpoint(this.inputHandlersValue?.xxl);

    return html`
      ${this.isViewMode
        ? this.renderView()
        : html`
            <nr-col
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
                "min-height": this.childrenComponents.length ? "auto" : "60px",
              })}
              span=${span ?? nothing}
              offset=${offset}
              order=${order ?? nothing}
              pull=${pull}
              push=${push}
              flex=${flex || nothing}
              .xs=${xs}
              .sm=${sm}
              .md=${md}
              .lg=${lg}
              .xl=${xl}
              .xxl=${xxl}
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
                      Drop content here
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
            </nr-col>
          `}
    `;
  }
}
