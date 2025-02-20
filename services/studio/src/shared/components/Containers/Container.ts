import { $resizing } from "$store/apps.ts";
import { type ComponentElement, type DraggingComponentInfo } from "$store/component/interface.ts";
import { $components, $draggingComponentInfo } from "$store/component/store.ts";
import { html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { renderComponent } from "../../../utils/render-util.ts";
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import styles from "./Container.style.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { setCurrentComponentIdAction } from "$store/actions/component/setCurrentComponentIdAction.ts";
import { setContextMenuEvent } from "$store/actions/page/setContextMenuEvent.ts";
import { eventDispatcher } from "@utils/change-detection.ts";
import { Utils } from "core/Utils.ts";
@customElement("vertical-container-block")
export class VerticalContainer extends BaseElementBlock {
  static styles = styles;

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @state()
  dragOverSituation = false;

  @state()
  selectedComponent: ComponentElement;

  @state()
  hoveredComponent: ComponentElement;

  @property({ type: Object })
  draggingComponentInfo: DraggingComponentInfo;

  @property({ type: Boolean })
  isViewMode = false;

  @state()
  wrapperStyle: any = {};

  @state()
  containerRef: Ref<HTMLInputElement> = createRef();

  isDragging: boolean;

  override async connectedCallback() {
    await super.connectedCallback();
    this.addEventListener("contextmenu", this.onContextMenu.bind(this));
  }

  onContextMenu(e: MouseEvent) {
    if(!this.isViewMode) {
      e.preventDefault();
      e.stopPropagation();
      const rect = this.containerRef.value?.getBoundingClientRect();
      if (rect) {
        e["ComponentTop"] = rect.top;
        e["ComponentLeft"] = rect.left;
        setContextMenuEvent(e);
      }
    }

   
  }

  renderView() {
    return html`
      <div
      ${ref(this.inputRef)
      }
        data-component-uuid=${this.component?.uuid}
        style=${styleMap({
        ...this.calculatedStyles,
        "min-height": this.component?.childrenIds?.length ? "auto" : "300px",
        "width": Utils.extractUnit(this.componentStyles?.width) === "%" ? "100%" : this.componentStyles?.width ?? "auto",

      })}
        class=${classMap({
        container: true,
        vertical: this.inputHandlersValue.direction === "vertical",
        boxed: this.inputHandlersValue.layout === "boxed",
        "drag-over": this.dragOverSituation,
      })}
      @click="${(e: Event) => {
                this.executeEvent("onclick", e);

              }
              }"
      >
        ${this.component?.childrenIds?.length
        ? renderComponent(
          this.component.childrenIds.map((id) => ({
            ...$components.get()[this.component?.application_id]?.find((component) => component.uuid === id),
            item: this.item,
          })),
          this.item,
          this.isViewMode
        )
        : nothing}
      </div>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    eventDispatcher.on(`component-property-changed:${String(this.component.name)}`, (data) => {
      this.traitInputsHandlers();
      this.requestUpdate();
    });
  }


  override renderComponent() {
    return html`
      ${this.isViewMode
        ? this.renderView()
        : html`
            <div
            ${ref(this.inputRef)
          }
              data-component-uuid=${this.component?.uuid}
              ${ref(this.containerRef)}
              @click="${(e: Event) => {
            setContextMenuEvent(null);
            this.executeEvent("onClick", e);
          }}"
              style=${styleMap({
                ...this.getStyles(),
             "min-height": this.component?.childrenIds?.length ? "auto" : "300px",
          })}
              class=${classMap({
            container: true,
            vertical: this.inputHandlersValue.direction === "vertical",
            horizontal: this.inputHandlersValue.direction !== "vertical",
            boxed: this.inputHandlersValue.layout == "boxed",
          })}
            
            >
              ${this.component?.childrenIds?.length
            ? renderComponent(
              this.component.childrenIds.map((id) => ({
                ...$components.get()[this.component?.application_id]?.find((component) => component.uuid === id),
                item: this.item,
              })),
              this.item,
              this.isViewMode
            )
            : html`
                    <div
                      class="empty-message"
                      @click="${(e: Event) => {
                setCurrentComponentIdAction(this.component?.uuid);
              }}"
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