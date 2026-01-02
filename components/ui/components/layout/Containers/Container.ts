import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { $components } from '../../../../../redux/store/component/store.ts';
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { renderComponent } from '../../../../../utils/render-util';
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import styles from "./Container.style.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';
import { setContextMenuEvent } from '../../../../../redux/actions/page/setContextMenuEvent.ts';
import "@nuralyui/container";
@customElement("container-block")
export class VerticalContainer extends BaseElementBlock {
  static styles = styles;

  @property({ type: Object }) component!: ComponentElement;
  @property({ type: Object }) item: any;
  @property({ type: Boolean }) isViewMode = false;

  @state() dragOverSituation = false;
  @state() selectedComponent!: ComponentElement;
  @state() hoveredComponent!: ComponentElement;
  @state() wrapperStyle: any = {};
  @state() containerRef: Ref<HTMLInputElement> = createRef();
  @state() childrenComponents: ComponentElement[] = [];

  isDragging!: boolean;

  override connectedCallback() {
    super.connectedCallback();
    this.updateChildrenComponents();
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
    }) ?? [];
  }

  /**
   * Get container layout type based on input
   */
  private getLayout(): 'fluid' | 'boxed' | 'fixed' {
    if (this.resolvedInputs.layout === "boxed") return "boxed";
    if (this.resolvedInputs.layout === "fixed") return "fixed";
    return "fluid";
  }

  /**
   * Get container direction based on input or styles
   */
  private getDirection(): 'row' | 'column' {
    // Check input direction first
    if (this.resolvedInputs.direction === "horizontal") return "row";
    if (this.resolvedInputs.direction === "vertical") return "column";
    // Fallback: if display:flex is set in styles, default to row (browser default)
    const styles = this.component?.style || {};
    if (styles['display'] === 'flex' && !styles['flex-direction']) return "row";
    if (styles['flex-direction'] === 'row') return "row";
    // Default to column
    return "column";
  }

  /**
   * Get justify content value from input handlers
   */
  private getJustify(): '' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' {
    const value = this.resolvedInputs.justify;
    if (value === 'flex-start' || value === 'flex-end' || value === 'center' ||
        value === 'space-between' || value === 'space-around' || value === 'space-evenly') {
      return value;
    }
    return '';
  }

  /**
   * Get align items value from input handlers
   */
  private getAlign(): '' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch' {
    const value = this.resolvedInputs.align;
    if (value === 'flex-start' || value === 'flex-end' || value === 'center' ||
        value === 'baseline' || value === 'stretch') {
      return value;
    }
    return '';
  }

  /**
   * Get gap value from input handlers
   */
  private getGap(): number | string {
    return this.resolvedInputs.gap || 0;
  }

  renderView() {
    const componentStyles = this.getStyles();

    return html`
      <nr-container
        id=${this.resolvedInputs.id ?? nothing}
        ${ref(this.inputRef)}
        data-component-uuid=${this.component?.uuid}
        data-component-name=${this.component?.name}
        layout=${this.getLayout()}
        direction=${this.getDirection()}
        justify=${this.getJustify()}
        align=${this.getAlign()}
        .gap=${this.getGap()}
        ?wrap=${this.resolvedInputs.wrap}
        width=${componentStyles.width || ''}
        height=${componentStyles.height || ''}
        min-height=${this.childrenComponents.length ? (componentStyles['min-height'] || '') : '300px'}
        class="drop-${this.component.uuid}"
        @mouseenter="${(e: Event) => this.executeEvent("onMouseEnter", e)}"
        @mouseleave="${(e: Event) => this.executeEvent("onMouseLeave", e)}"
        @click="${(e: Event) => this.executeEvent("onClick", e)}"
      >
        ${this.childrenComponents.length
          ? renderComponent(this.childrenComponents.map((component) => ({ ...component, item: this.item })), this.item, this.isViewMode, {...this.component, uniqueUUID : this.uniqueUUID})
          : html`
              <div class="container-placeholder">
                <nr-icon name="layout-grid"></nr-icon>
                <nr-label>No content</nr-label>
              </div>
            `}
      </nr-container>
    `;
  }

  override renderComponent() {
    const componentStyles = this.getStyles();

    return html`
      ${this.isViewMode
        ? this.renderView()
        : html`
            <nr-container
              ${ref(this.inputRef)}
              data-component-uuid=${this.component?.uuid}
              data-component-name=${this.component?.name}
              layout=${this.getLayout()}
              direction=${this.getDirection()}
              justify=${this.getJustify()}
              align=${this.getAlign()}
              .gap=${this.getGap()}
              ?wrap=${this.resolvedInputs.wrap}
              width=${componentStyles.width || ''}
              height=${componentStyles.height || ''}
              min-height=${this.childrenComponents.length ? (componentStyles['min-height'] || '') : '300px'}
              class="drop-${this.component.uuid}"
              @click="${(e: Event) => {
                setContextMenuEvent(null);
                this.executeEvent("onClick", e);
              }}"
            >
              ${this.childrenComponents.length
                ? renderComponent(this.childrenComponents.map((component) => ({ ...component, item: this.item })), this.item, this.isViewMode, {...this.component, uniqueUUID : this.uniqueUUID})
                : html`
                    <div
                      class="container-placeholder"
                      @click="${() => setCurrentComponentIdAction(this.component?.uuid)}"
                    >
                      <nr-icon name="layout-grid"></nr-icon>
                      <nr-label>Add or drag an item into this container</nr-label>
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
            </nr-container>
          `}
    `;
  }
}