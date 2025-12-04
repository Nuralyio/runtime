import { type ComponentElement, type DraggingComponentInfo } from '../../../../../redux/store/component/component.interface.ts';
import { $components } from '../../../../../redux/store/component/store.ts';
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { renderComponent } from '../../../../../utils/render-util';
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import styles from "./Container.style.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';
import { setContextMenuEvent } from '../../../../../redux/actions/page/setContextMenuEvent.ts';
import { RuntimeHelpers } from '../../../../../utils/runtime-helpers.ts';

@customElement("vertical-container-block")
export class VerticalContainer extends BaseElementBlock {
  static styles = styles;

  @property({ type: Object }) component: ComponentElement;
  @property({ type: Object }) item: any;
  @property({ type: Object }) draggingComponentInfo: DraggingComponentInfo;
  @property({ type: Boolean }) isViewMode = false;

  @state() dragOverSituation = false;
  @state() selectedComponent: ComponentElement;
  @state() hoveredComponent: ComponentElement;
  @state() wrapperStyle: any = {};
  @state() containerRef: Ref<HTMLInputElement> = createRef();
  @state() childrenComponents: ComponentElement[] = [];

  isDragging: boolean;

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
    }) ?? [];
  }

  renderView() {
    return html`
      <div
      id=${this.inputHandlersValue.id ?? nothing}
        ${ref(this.inputRef)}
        data-component-uuid=${this.component?.uuid}
        data-component-name=${this.component?.name}
        style=${styleMap({
          "width": RuntimeHelpers.extractUnit(this.componentStyles?.width) === "%" ? "100%" : this.componentStyles?.width ?? "auto",
          ...this.getStyles(),
          "min-height": this.childrenComponents.length ? "auto" : "300px",
        })}
        class=${classMap({
          container: true,
          vertical: this.inputHandlersValue.direction === "vertical",
          boxed: this.inputHandlersValue.layout === "boxed",
          "drag-over": this.dragOverSituation,
        })}
        @mouseenter="${(e: Event) => this.executeEvent("onMouseEnter", {...e,unique : this.uniqueUUID})}"
        @mouseleave="${(e: Event) => this.executeEvent("onMouseLeave", {...e,unique : this.uniqueUUID})}"
        @click="${(e: Event) => this.executeEvent("onClick", e)}"
      >
        ${this.childrenComponents.length
          ? renderComponent(this.childrenComponents.map((component) => ({ ...component, item: this.item })), this.item, this.isViewMode, {...this.component, uniqueUUID : this.uniqueUUID})
          : nothing}
      </div>
    `;
  }

  override renderComponent() {
    return html`
      ${this.isViewMode
        ? this.renderView()
        : html`
            <div
              ${ref(this.inputRef)}
              data-component-uuid=${this.component?.uuid}
              data-component-name=${this.component?.name}
              ${ref(this.containerRef)}
              @click="${(e: Event) => {
                setContextMenuEvent(null);
                this.executeEvent("onClick", e);
              }}"
              style=${styleMap({
                ...this.getStyles(),
                "min-height": this.childrenComponents.length ? "auto" : "300px",
              })}
              class=${classMap({
                container: true,
                vertical: this.inputHandlersValue.direction === "vertical",
                horizontal: this.inputHandlersValue.direction !== "vertical",
                boxed: this.inputHandlersValue.layout == "boxed",
              })}
            >
              ${this.childrenComponents.length
                ? renderComponent(this.childrenComponents.map((component) => ({ ...component, item: this.item })), this.item, this.isViewMode, {...this.component, uniqueUUID : this.uniqueUUID})
                : html`
                    <div
                      class="empty-message"
                      @click="${() => setCurrentComponentIdAction(this.component?.uuid)}"
                    >
                      Add or Drag an item into this container
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
            </div>
          `}
    `;
  }
}