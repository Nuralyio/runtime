import { type ComponentElement, type DraggingComponentInfo } from '../../../../../redux/store/component/component.interface.ts';
import { html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import "./RichTextEditor.ts";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { executeHandler } from '../../../../../state/runtime-context.ts';
import { styleMap } from "lit/directives/style-map.js";

@customElement("rich-text-block")
export class RichTextContainer extends BaseElementBlock {
  @property({ type: Object }) component: ComponentElement;
  @property({ type: Object }) item: any;
  @property({ type: Object }) draggingComponentInfo: DraggingComponentInfo;
  @property({ type: Boolean }) isViewMode = false;

  @state() dragOverSituation = false;
  @state() selectedComponent: ComponentElement;
  @state() hoveredComponent: ComponentElement;
  @state() wrapperStyle: any = {};
  @state() components: ComponentElement[];

  @state() editing = false; // <-- control whether we're editing or not


  isDragging: boolean;

  constructor() {
    super();
  }

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this.editing) {
      this.editing = false;
      e.preventDefault();
        e.stopPropagation();
    }
  };

  private handleDoubleClick = () => {
    this.editing = true;
  };


    private handleCodeEditorChange(value: string) {
        if (!this.isViewMode) {
            const serializedValue = JSON.stringify(value);
            executeHandler(this.component,
                /* js */ `
                  try {
                      const selectedComponent = Utils.first(Vars.selectedComponents);
                      updateInput(selectedComponent, "value", "string", ${serializedValue}, null);
                  } catch (error) {
                      console.error(error);
                  }
                `, {});
        }
    }

  override renderComponent() {
    return html`
    
      <div ${ref(this.inputRef)}
     class="${`drop-${this.component.uuid}`}"
      style=${styleMap({
        width: this.editing  ? "auto" : this.getStyles().width,
        display: "block",})}
      >
        ${this.editing && !this.isViewMode
          ? html`
              <rich-text-editor-block
              @content-change=${(e: CustomEvent) => {
                this.handleCodeEditorChange(e.detail.value);
              }}
                .content=${this.inputHandlersValue.value}
              ></rich-text-editor-block>
            `
          : html`
              <p @dblclick=${this.handleDoubleClick}>
                ${unsafeHTML(this.inputHandlersValue.value)}
              </p>
            `}
      </div>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {}
}