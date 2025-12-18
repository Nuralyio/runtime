import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { classMap } from "lit/directives/class-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { $components } from '../../../../../redux/store/component/store.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";
import { renderComponent } from '../../../../../utils/render-util';
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';
import { setContextMenuEvent } from '../../../../../redux/actions/page/setContextMenuEvent.ts';
import { RuntimeHelpers } from '../../../../../utils/runtime-helpers.ts';

try {
  await import("@nuralyui/card");
} catch (error) {
  console.warn('[@nuralyui/card] Package not found or failed to load.');
}


@customElement("card-block")
export class CardBlock extends BaseElementBlock {
  static styles = [css``];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @property({ type: Boolean })
  isViewMode = false;

  @state()
  childrenComponents: ComponentElement[] = [];

  @state()
  dragOverSituation = false;

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
    this.childrenComponents = this.component?.childrenIds?.map((id) => {
      return $components.get()[this.component?.application_id]?.find((component) => component.uuid === id);
    }) ?? [];
  }

  renderView() {
    const cardStyles = this.component?.style || {};
    
    // Get properties from input or inputHandlers
    const title = this.component?.input?.title?.value || this.inputHandlersValue?.title || '';
    const bordered = this.component?.input?.bordered?.value ?? this.inputHandlersValue?.bordered ?? true;
    const hoverable = this.component?.input?.hoverable?.value ?? this.inputHandlersValue?.hoverable ?? false;
    const loading = this.component?.input?.loading?.value ?? this.inputHandlersValue?.loading ?? false;
    const size = this.component?.input?.size?.value || this.inputHandlersValue?.size || 'default';

    return html`
      <nr-card
        id=${this.inputHandlersValue.id ?? nothing}
        ${ref(this.inputRef)}
        data-component-uuid=${this.component?.uuid}
        data-component-name=${this.component?.name}
        style=${styleMap({
          "width": RuntimeHelpers.extractUnit(cardStyles?.width) === "%" ? "100%" : cardStyles?.width ?? "auto",
          ...cardStyles
        })}
        class=${classMap({
          "drag-over": this.dragOverSituation,
        })}
        .header=${title}
        .size=${size}
        ?bordered=${bordered}
        ?hoverable=${hoverable}
        ?loading=${loading}
        @mouseenter="${(e: Event) => this.executeEvent("onMouseEnter", {...e, unique: this.uniqueUUID})}"
        @mouseleave="${(e: Event) => this.executeEvent("onMouseLeave", {...e, unique: this.uniqueUUID})}"
        @click=${(e: MouseEvent) => this.executeEvent('onClick', e)}
      >
        <div slot="content">
          ${this.childrenComponents.length
            ? renderComponent(this.childrenComponents.map((component) => ({ ...component, item: this.item })), this.item, this.isViewMode, {...this.component, uniqueUUID: this.uniqueUUID})
            : nothing}
        </div>
      </nr-card>
    `;
  }

  override renderComponent() {
    const cardStyles = this.component?.style || {};
    
    // Get properties from input or inputHandlers
    const title = this.component?.input?.title?.value || this.inputHandlersValue?.title || '';
    const bordered = this.component?.input?.bordered?.value ?? this.inputHandlersValue?.bordered ?? true;
    const hoverable = this.component?.input?.hoverable?.value ?? this.inputHandlersValue?.hoverable ?? false;
    const loading = this.component?.input?.loading?.value ?? this.inputHandlersValue?.loading ?? false;
    const size = this.component?.input?.size?.value || this.inputHandlersValue?.size || 'default';

    return html`
      ${this.isViewMode
        ? this.renderView()
        : html`
            <nr-card
              ${ref(this.inputRef)}
              data-component-uuid=${this.component?.uuid}
              data-component-name=${this.component?.name}
              style=${styleMap(cardStyles)}
              class=${classMap({
                "drag-over": this.dragOverSituation,
              })}
              .header=${title}
              .size=${size}
              ?bordered=${bordered}
              ?hoverable=${hoverable}
              ?loading=${loading}
              @click=${(e: MouseEvent) => {
                setContextMenuEvent(null);
                this.executeEvent('onClick', e);
              }}
            >
              <div slot="content" style=${styleMap({ "min-height": this.childrenComponents.length ? "auto" : "100px" })}>
                ${this.childrenComponents.length
                  ? renderComponent(this.childrenComponents.map((component) => ({ ...component, item: this.item })), this.item, this.isViewMode, {...this.component, uniqueUUID: this.uniqueUUID})
                  : html`
                      <div
                        style="padding: 20px; text-align: center; color: #999;"
                        @click="${() => setCurrentComponentIdAction(this.component?.uuid)}"
                      >
                        Add or Drag an item into this card
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
            </nr-card>
          `}
    `;
  }
}
