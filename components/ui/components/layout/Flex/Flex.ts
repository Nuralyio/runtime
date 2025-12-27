/**
 * @file Flex.ts
 * @description Flex layout component that wraps nr-flex from @nuralyui/flex
 */

import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { $components } from '../../../../../redux/store/component/store.ts';
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { renderComponent } from '../../../../../utils/render-util';
import { createRef, ref } from "lit/directives/ref.js";
import styles from "./Flex.style.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';
import { setContextMenuEvent } from '../../../../../redux/actions/page/setContextMenuEvent.ts';
import { RuntimeHelpers } from '../../../../../utils/runtime-helpers.ts';

// Import nr-flex from nuralyui flex
try {
  await import("@nuralyui/flex");
} catch (error) {
  console.warn('[@nuralyui/flex] Package not found or failed to load.');
}

/** Input property names that trigger re-render */
const FLEX_INPUT_PROPS = ['direction', 'wrap', 'justify', 'align', 'gap', 'vertical'] as const;

/** Parsed flex properties for rendering */
interface FlexProps {
  direction: string;
  wrap: string;
  justify: string;
  align: string;
  gap: string | number;
  vertical: boolean;
}

@customElement("flex-block")
export class FlexBlock extends BaseElementBlock {
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
    FLEX_INPUT_PROPS.forEach(prop => this.registerCallback(prop, () => this.requestUpdate()));
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
   * Parse gap value - supports number or string with units
   */
  private parseGap(gap: any): string | number {
    if (!gap) return 0;
    if (typeof gap === 'number') return gap;
    if (typeof gap === 'string' && !isNaN(Number(gap))) return Number(gap);
    return gap;
  }

  /**
   * Get all flex properties from input handlers
   */
  private getFlexProps(): FlexProps {
    const input = this.inputHandlersValue;
    return {
      direction: input?.direction || 'row',
      wrap: input?.wrap || 'nowrap',
      justify: input?.justify || 'flex-start',
      align: input?.align || 'stretch',
      gap: this.parseGap(input?.gap),
      vertical: input?.vertical ?? false,
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
        Add or drag items into this flex container
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

  renderView() {
    const props = this.getFlexProps();
    const componentStyles = this.component?.style || {};

    return html`
      <nr-flex
        id=${this.inputHandlersValue.id ?? nothing}
        ${ref(this.inputRef)}
        data-component-uuid=${this.component?.uuid}
        data-component-name=${this.component?.name}
        style=${styleMap({
          "width": RuntimeHelpers.extractUnit(componentStyles?.width) === "%" ? "100%" : componentStyles?.width ?? "auto",
          ...this.getStyles(),
        })}
        direction=${props.direction || nothing}
        wrap=${props.wrap || nothing}
        justify=${props.justify || nothing}
        align=${props.align || nothing}
        .gap=${props.gap}
        ?vertical=${props.vertical}
        @mouseenter="${(e: Event) => this.executeEvent("onMouseEnter", {...e, unique: this.uniqueUUID})}"
        @mouseleave="${(e: Event) => this.executeEvent("onMouseLeave", {...e, unique: this.uniqueUUID})}"
        @click="${(e: Event) => this.executeEvent("onClick", e)}"
      >
        ${this.renderChildren()}
      </nr-flex>
    `;
  }

  override renderComponent() {
    const props = this.getFlexProps();

    if (this.isViewMode) {
      return this.renderView();
    }

    return html`
      <nr-flex
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
        direction=${props.direction || nothing}
        wrap=${props.wrap || nothing}
        justify=${props.justify || nothing}
        align=${props.align || nothing}
        .gap=${props.gap}
        ?vertical=${props.vertical}
      >
        ${this.childrenComponents.length ? this.renderChildren() : this.renderEmptyState()}
      </nr-flex>
    `;
  }
}
