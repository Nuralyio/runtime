/**
 * @file Row.ts
 * @description Grid Row component that wraps nr-row from @nuralyui/grid
 */

import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { $components } from '../../../../../redux/store/component/store.ts';
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { renderComponent } from '../../../../../utils/render-util';
import { createRef, ref } from "lit/directives/ref.js";
import styles from "./Row.style.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';
import { setContextMenuEvent } from '../../../../../redux/actions/page/setContextMenuEvent.ts';

// Import nr-row from nuralyui grid
import "@nuralyui/grid";

/** Input property names that trigger re-render */
const ROW_INPUT_PROPS = ['gutter', 'align', 'justify', 'wrap'] as const;

/** Parsed row properties for rendering */
interface RowProps {
  gutter: number | number[] | object;
  align: string;
  justify: string;
  wrap: boolean;
}

@customElement("grid-row-block")
export class GridRow extends BaseElementBlock {
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
    ROW_INPUT_PROPS.forEach(prop => this.registerCallback(prop, () => this.requestUpdate()));
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
   * Parse gutter value - supports number, [h, v] array, or responsive object
   */
  private parseGutter(gutter: any): number | number[] | object {
    if (!gutter) return 0;
    if (typeof gutter === 'number' || Array.isArray(gutter)) return gutter;
    if (typeof gutter === 'string' && !isNaN(Number(gutter))) return Number(gutter);
    return gutter;
  }

  /**
   * Get all row properties from input handlers
   */
  private getRowProps(): RowProps {
    const input = this.inputHandlersValue;
    return {
      gutter: this.parseGutter(input?.gutter),
      align: input?.align || '',
      justify: input?.justify || '',
      wrap: input?.wrap !== false,
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
    `;
  }

  override renderComponent() {
    const props = this.getRowProps();

    if (this.isViewMode) {
      return html`
        <nr-row
          ${ref(this.inputRef)}
          data-component-uuid=${this.component?.uuid}
          data-component-name=${this.component?.name}
          style=${styleMap(this.getStyles())}
          .gutter=${props.gutter}
          align=${props.align || nothing}
          justify=${props.justify || nothing}
          ?wrap=${props.wrap}
        >
          ${this.renderChildren()}
        </nr-row>
      `;
    }

    return html`
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
        .gutter=${props.gutter}
        align=${props.align || nothing}
        justify=${props.justify || nothing}
        ?wrap=${props.wrap}
      >
        ${this.childrenComponents.length ? this.renderChildren() : this.renderEmptyState()}
      </nr-row>
    `;
  }
}
