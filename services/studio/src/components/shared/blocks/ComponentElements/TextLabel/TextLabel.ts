import { type ComponentElement } from "$store/component/interface";
import { $applicationComponents, $componentWithChildrens } from "$store/component/sotre";
import { $currentPageViewPort } from "$store/page/store";
import { log } from "@nanostores/logger";
import { executeEventHandler } from "core/engine";
import { executeValueHandler } from "core/helper";
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

const isServer = typeof window === 'undefined';

@customElement("text-label-block")
export class TextLabelBlock extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  currentPageViewPort: string;

  @state()
  viewPortStyles: any;

  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  @state()
  isEditable = false;

  @state()
  components: ComponentElement[];

  @state()
  thisvalue;


  constructor() {
    super();

  }

  override connectedCallback() {
    super.connectedCallback();
    this.updateValue();
    document.body.addEventListener("click", this.handleBodyClick);
    $currentPageViewPort.subscribe((viewPort) => {
      this.currentPageViewPort = viewPort;
      this.updateValue();
      this.updateValues();
    });
  }

  handleBodyClick = (event) => {
    const label = this.shadowRoot.querySelector("label");
    if (label && !label.contains(event.target)) {
      // Click is outside the label, make it non-editable
      this.isEditable = false;
    }
  };
  @property({ type: Object })
  item: any;

  updateValues() {
    if (this.component.styleBreakPoints) {
      this.viewPortStyles = this.component.styleBreakPoints[this.currentPageViewPort]
        ? { ...this.component.styleBreakPoints[this.currentPageViewPort] as any }
        : {};
      // clean this.viewPortStyles from null values and do not use delete keyword
      const cleanedViewPortStyles = {};

      for (const key in this.viewPortStyles) {
        if (this.viewPortStyles[key] !== null) {
          cleanedViewPortStyles[key] = this.viewPortStyles[key];
        }
      }

      // Assign the cleaned object back to this.viewPortStyles if needed
      this.viewPortStyles = cleanedViewPortStyles;
    }
  }

  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component" || propName === "item") {
        this.updateValues();
        this.updateValue();
        this.requestUpdate()
      }
    });
  }

  updateValue() {
    executeValueHandler(this.component)
      .onmessage = (event) => {
        if (event.data.result) {
          this.thisvalue = event.data.result;
        }
      }

  }

  getValue() {
    let value = "";
   /* if (isServer) {
      if (this.component.parameters?.value) {
        if (this.component?.parent?.component_type === "Collection") {
          return this.component.iterations[this.item.index];
        }
      }
    }*/

    return isServer ? this.component.parameters?.value : this.thisvalue ?? this.component.parameters?.value;
  }

  render() {
    return html`
      <label
        contentEditable="${this.isEditable}"
        style=${styleMap({ ...this.component.style, ...this.viewPortStyles })}
        @click=${(e) => {
        if (this.component.event.onClick) {
          executeEventHandler(this.component, "event", "onClick", {
            EventData: e.data,
          });
        }
      }}
        @dblclick=${(e) => {
        e.preventDefault();

        this.isEditable = true;
        this.requestUpdate();
      }}
      >
        ${this.getValue()}
      </label>
    `;
  }
}
