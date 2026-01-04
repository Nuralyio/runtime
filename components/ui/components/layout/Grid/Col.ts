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

/** Input property names that trigger re-render */
const COL_INPUT_PROPS = ['span', 'offset', 'order', 'pull', 'push', 'flex', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

/** Parsed column properties for rendering */
interface ColProps {
  span: number | undefined;
  offset: number;
  order: number | undefined;
  pull: number;
  push: number;
  flex: string;
  xs: number | object | undefined;
  sm: number | object | undefined;
  md: number | object | undefined;
  lg: number | object | undefined;
  xl: number | object | undefined;
  xxl: number | object | undefined;
}

@customElement("grid-col-block")
export class GridCol extends BaseElementBlock {
  static styles = styles;

  @property({ type: Object }) component: ComponentElement;
  @property({ type: Object }) item: any;
  @property({ type: Boolean }) isViewMode = false;

  @state() childrenComponents: ComponentElement[] = [];
  @state() containerRef = createRef();

  override connectedCallback() {
    super.connectedCallback();
    this.updateChildrenComponents();

    // Register callbacks for input changes to trigger re-render
    COL_INPUT_PROPS.forEach(prop => this.registerCallback(prop, () => this.requestUpdate()));
  }

  override willUpdate(changedProperties: Map<string, any>) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("component")) {
      this.updateChildrenComponents();
    }
  }

  private updateChildrenComponents(): void {
    this.childrenComponents = this.component?.children_ids?.map((id) => {
      return $components.get()[this.component?.application_id]?.find((component) => component.uuid === id);
    }).filter(Boolean) ?? [];
  }

  /**
   * Parse numeric value from input (handles string or number)
   */
  private parseNumeric(value: any, defaultValue?: number): number | undefined {
    if (value === undefined || value === null || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Parse responsive breakpoint value
   * Can be a number or an object { span, offset, order, pull, push }
   */
  private parseBreakpoint(value: any): number | object | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && !isNaN(Number(value))) return Number(value);
    if (typeof value === 'object') return value;
    return undefined;
  }

  /**
   * Get all column properties from input handlers
   */
  private getColProps(): ColProps {
    const input = this.resolvedInputs;
    return {
      span: this.parseNumeric(input?.span),
      offset: this.parseNumeric(input?.offset, 0)!,
      order: this.parseNumeric(input?.order),
      pull: this.parseNumeric(input?.pull, 0)!,
      push: this.parseNumeric(input?.push, 0)!,
      flex: input?.flex || '',
      xs: this.parseBreakpoint(input?.xs),
      sm: this.parseBreakpoint(input?.sm),
      md: this.parseBreakpoint(input?.md),
      lg: this.parseBreakpoint(input?.lg),
      xl: this.parseBreakpoint(input?.xl),
      xxl: this.parseBreakpoint(input?.xxl),
    };
  }

  /**
   * Render children components
   */
  private renderChildren() {
    return this.childrenComponents.length
      ? renderComponent(
          this.childrenComponents.map((component) => ({ ...component, item: this.item })),
          this.item,
          this.isViewMode,
          { ...this.component, uniqueUUID: this.uniqueUUID }
        )
      : nothing;
  }

  /**
   * Render empty state placeholder for editor mode
   */
  private renderEmptyState() {
    return html`
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
    `;
  }

  override renderComponent() {
    const props = this.getColProps();

    if (this.isViewMode) {
      return html`
        <nr-col
          ${ref(this.inputRef)}
          data-component-uuid=${this.component?.uuid}
          data-component-name=${this.component?.name}
          style=${styleMap(this.getStyles())}
          offset=${props.offset}
          order=${props.order ?? nothing}
          pull=${props.pull}
          push=${props.push}
          flex=${props.flex || nothing}
          .xs=${props.xs}
          .sm=${props.sm}
          .md=${props.md}
          .lg=${props.lg}
          .xl=${props.xl}
          .xxl=${props.xxl}
        >
          ${this.renderChildren()}
        </nr-col>
      `;
    }

    return html`
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
        offset=${props.offset}
        order=${props.order ?? nothing}
        pull=${props.pull}
        push=${props.push}
        flex=${props.flex || nothing}
        .xs=${props.xs}
        .sm=${props.sm}
        .md=${props.md}
        .lg=${props.lg}
        .xl=${props.xl}
        .xxl=${props.xxl}
      >
        ${this.childrenComponents.length ? this.renderChildren() : this.renderEmptyState()}
      </nr-col>
    `;
  }
}
