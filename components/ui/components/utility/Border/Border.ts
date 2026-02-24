import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from '../../base/BaseElement';
import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { executeHandler } from '../../../../../state/runtime-context';
import { getNestedAttribute } from '../../../../../utils/object.utils.ts';
import { styleMap } from "lit/directives/style-map.js";
import {
    SelectTheme,
    SingleButtonTheme,
} from '../../../../../../studio/core/utils/common-editor-theme';

// Debounce function
function debounce(func: Function, wait: number) {
  let timeout: number;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

@customElement("attribute-border-value")
export class AttributeBorderValue extends BaseElementBlock {
  static override styles = [
    css`
      :host {
        display: block;
        --box-manager-background-color: transparent;
      }
      nr-slider-input {
        width: 100%;
        margin-left: 14px;
      }
      nr-input {
        --nuraly-input-container-padding-top: 0px;
        --nuraly-input-container-padding-bottom: 0px;
        --nuraly-input-container-padding-left: 0px;
        --nuraly-input-container-padding-right: 0px;
        --nuraly-input-text-align: center;
      }
      nr-icon {
        font-size: 20px;
      }
      .first-row {
        flex: 80%;
        display: flex;
      }
      .second-row {
        flex: 20%;
      }

      nr-input {
        --nuraly-input-container-border-color: transparent;
        --nuraly-input-container-padding-top: 0px;
        --nuraly-input-container-padding-bottom: 0px;
        --nuraly-input-container-padding-left: 0px;
        --nuraly-input-container-padding-right: 0px;
        --nuraly-input-text-align: center;
      }

      .margin-label,
      .padding-label {
        color: #ccc;
        margin-bottom: 14px;
      }

      .container-outside {
        width: 210px;
        background-color: var(--box-manager-background-color, #393939);
        padding: 50px;
        border-radius: 3px;
        padding-top: 5px;
        padding-bottom: 35px;
        margin-right: 10px;
        position: relative;
      }

      .position-input {
        width: 40px;
      }

      .container-outside > .margin-left,
      .container-outside > .margin-right,
      .container-outside > .margin-top,
      .container-outside > .margin-bottom {
        position: absolute;
        color: #ccc;
      }

      .margin-left {
        left: 5px;
        top: 53.5%;
        transform: translateY(-40%);
      }

      .margin-right {
        right: 37px;
        top: 53.5%;
        transform: translateY(-40%);
      }

      .margin-top {
        top: 20px;
        left: 44.5%;
        transform: translateX(-50%);
      }

      .margin-bottom {
        bottom: 10px;
        left: 44.5%;
        transform: translateX(-50%);
      }

      .container {
        height: 65px;
        border: 1px solid #bcbcbc;
        border-radius: 3px;
        padding: 5px;
        position: relative;
        width: 164px;
      }

      .container > .padding-left {
        position: absolute;
        top: 40%;
        left: 4px;
      }

      .container > .padding-right {
        position: absolute;
        top: 40%;
        right: 4px;
      }

      .container > .padding-top {
        position: absolute;
        top: 5px;
        left: 50%;
        transform: translateX(-50%);
      }

      .container > .padding-bottom {
        position: absolute;
        bottom: 5px;
        left: 50%;
        transform: translateX(-50%);
      }

      .container > .border-bottom-right-radius {
        position: absolute;
        bottom: -28px;
        right: -27px;
      }
      .container > .border-top-right-radius {
        position: absolute;
        top: -28px;
        right: -27px;
      }

      .container > .border-top-left-radius {
        position: absolute;
        top: -28px;
        left: -27px;
      }

      .container > .border-bottom-left-radius {
        position: absolute;
        bottom: -28px;
        left: -27px;
      }

      .input-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 300px;
        margin: 10px;
      }

      @media (prefers-color-scheme: dark) {
        :host {
          --box-manager-background-color: #393939;
        }
      }
    `,
  ];
  @property()
  component: ComponentElement;
  @state()
  borderRadius = 0;
  @state()
  position: any = {};
  @state()
  margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    unit: "px",
  };

  @state()
  cassAttributes: any = {};

  @state()
  activeBorders = {
    all: true,
    top: false,
    right: false,
    bottom: false,
    left: false,
  };

  @state()
  borderSize = {
    size: 0,
    type: "solid",
    color: "#000000",
  };
  // Padding States
  @state()
  padding = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    unit: "px",
  };
  @state()
  unity = "";
  // Debounced changed event handler
  debouncedChanged = debounce((attributeName: string) => {
    if (this.component.event.borderRadiusChanged) {
      const fn = executeHandler(
        this.component,
        getNestedAttribute(this.component, `event.borderRadiusChanged`),
        {
          attributeName,
          value: this.cassAttributes[attributeName],
        },
      );
    }
  }, 100);

  debouncedBorderChanged = (borders) => {
    if (this.component.event.borderChanged) {
      const fn = executeHandler(
        this.component,
        getNestedAttribute(this.component, `evealnt.borderChanged`),
        {
          borders,
        },
      );
    }
  };

  // add function to remove and update the borders

  toggleBorder(border) {
    if (border === "all") {
      const newState = !this.activeBorders.all;
      this.activeBorders = {
        all: newState,
        top: false,
        right: false,
        bottom: false,
        left: false,
      };
    } else {
      this.activeBorders = {
        ...this.activeBorders,
        all: false,
        [border]: !this.activeBorders[border],
      };
    }
    this.updateBorders();
    this.requestUpdate();
  }
  handleValueChange = (event: { detail: { value: any } }) => {
    this.borderSize.color = event.detail.value;
    this.updateBorders();
  };
  renderBorder() {
    return html`
      <div>
        <nr-button
          style=${styleMap({
            ...SingleButtonTheme,
          })}
          type=${this.activeBorders.all ? "primary" : ""}
          @click=${() => this.toggleBorder("all")}
        >
          ALL
        </nr-button>
        <nr-button
          style=${styleMap({
            ...SingleButtonTheme,
          })}
          type=${this.activeBorders.top ? "primary" : ""}
          @click=${() => this.toggleBorder("top")}
        >
          TOP
        </nr-button>
        <nr-button
          style=${styleMap({
            ...SingleButtonTheme,
          })}
          type=${this.activeBorders.right ? "primary" : ""}
          @click=${() => this.toggleBorder("right")}
        >
          RIGHT
        </nr-button>
        <nr-button
          style=${styleMap({
            ...SingleButtonTheme,
          })}
          type=${this.activeBorders.bottom ? "primary" : ""}
          @click=${() => this.toggleBorder("bottom")}
        >
          BOTTOM
        </nr-button>
        <nr-button
          style=${styleMap({
            ...SingleButtonTheme,
          })}
          type=${this.activeBorders.left ? "primary" : ""}
          @click=${() => this.toggleBorder("left")}
        >
          LEFT
        </nr-button>
        <div style="display: flex; align-items: center;">
          <div style="width : 60px; margin-right : 10px">
            <nr-input
              value=${this.borderSize.size ?? 0}
              @valueChange=${(e: any) => {
                this.borderSize.size = e.detail.value;
                this.updateBorders();
              }}
            ></nr-input>
          </div>
          <div>
            <nr-select
              style=${styleMap({
                ...SelectTheme,
              })}
              size="small"
              style="--nuraly-select-width:150px;size:small;width:auto;"
              palceholder="Solid"
              .defaultSelected="${[this.borderSize.type ?? "solid"]}"
              @changed=${(e: any) => {
                this.borderSize.type = e.detail.value.value;
                this.updateBorders();
              }}
              .options=${[
                { label: "Solid", value: "solid" },
                { label: "Dotted", value: "dotted" },
                { label: "Dashed", value: "dashed" },
                { label: "Double", value: "double" },
                { label: "Groove", value: "groove" },
                { label: "Ridge", value: "ridge" },
                { label: "Inset", value: "inset" },
                { label: "Outset", value: "outset" },
              ]}
            ></nr-select>
          </div>
          <div>
            <nr-color-picker
              .color=${this.borderSize.color ?? "#000000"}
              @color-changed=${this.handleValueChange}
            ></nr-color-picker>
          </div>
        </div>
      </div>
    `;
  }
  constructor() {
    super();
    this.registerCallback("border", (borders) => {
      // Extraire la taille et la couleur de la bordure du premier élément de "borders"
      const border = borders?.[0] ?? {};
      const firstCrossedBorder =
        border?.border ??
        border["border-top"] ??
        border["border-right"] ??
        border["border-bottom"] ??
        border["border-left"] ??
        "";

      const borderParts = firstCrossedBorder.split(" ");

      this.borderSize.size = borderParts[0]?.replace("px", "") ?? "";
      this.borderSize.type = borderParts[1] ?? "";
      this.borderSize.color = borderParts[2] ?? "";

      // Vérifier l'existence de différentes bordures
      const hasBorder = (key: string) =>
        borders?.some((border) => Object.keys(border)[0] === key) ?? false;

      this.activeBorders.all = hasBorder("border");
      this.activeBorders.top = hasBorder("border-top");
      this.activeBorders.right = hasBorder("border-right");
      this.activeBorders.bottom = hasBorder("border-bottom");
      this.activeBorders.left = hasBorder("border-left");
    });
  }
  updateBorders() {
    const { size, type, color } = this.borderSize;
    const { all, top, right, bottom, left } = this.activeBorders;
    let borders = [];

    if (all) {
      borders.push({
        border: `${size}px ${type} ${color}`,
      });
    } else {
      borders.push({
        border: undefined,
      });
      if (top) borders.push({ "border-top": `${size}px ${type} ${color}` });
      else {
        borders.push({
          "border-top": undefined,
        });
      }
      if (right) borders.push({ "border-right": `${size}px ${type} ${color}` });
      else
        borders.push({
          "border-right": undefined,
        });
    }
    if (bottom) borders.push({ "border-bottom": `${size}px ${type} ${color}` });
    else {
      borders.push({
        "border-bottom": undefined,
      });
    }

    if (left) borders.push({ "border-left": `${size}px ${type} ${color}` });
    else {
      borders.push({
        "border-left": undefined,
      });
    }
    this.debouncedBorderChanged(borders);
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has("component")) {
      const borders = Object.keys(this.getStyles()).filter((key) =>
        key.startsWith("border"),
      );
    }
  }
  override renderComponent() {
    const handlers = this.resolvedInputs.value;
    const border = this.resolvedInputs.border;
    this.borderRadius = this.resolvedInputs.value
      ? this.resolvedInputs.value["border-radius"]?.value
      : 0;
    this.unity = this.resolvedInputs.value
      ? this.resolvedInputs.value["border-radius"]?.unit
      : "px";
    // Initialize Margin
    this.cassAttributes["margin-top"] =
      `${handlers?.["margin-top"]?.value ?? 0}${handlers?.["margin-top"]?.unit ?? "px"}`;
    this.cassAttributes["margin-right"] =
      `${handlers?.["margin-right"]?.value ?? 0}${handlers?.["margin-right"]?.unit ?? "px"}`;
    this.cassAttributes["margin-bottom"] =
      `${handlers?.["margin-bottom"]?.value ?? 0}${handlers?.["margin-bottom"]?.unit ?? "px"}`;
    this.cassAttributes["margin-left"] =
      `${handlers?.["margin-left"]?.value ?? 0}${handlers?.["margin-left"]?.unit ?? "px"}`;
    this.cassAttributes["padding-top"] =
      `${handlers?.["padding-top"]?.value ?? 0}${handlers?.["padding-top"]?.unit ?? "px"}`;
    this.cassAttributes["padding-right"] =
      `${handlers?.["padding-right"]?.value ?? 0}${handlers?.["padding-right"]?.unit ?? "px"}`;
    this.cassAttributes["padding-bottom"] =
      `${handlers?.["padding-bottom"]?.value ?? 0}${handlers?.["padding-bottom"]?.unit ?? "px"}`;
    this.cassAttributes["padding-left"] =
      `${handlers?.["padding-left"]?.value ?? 0}${handlers?.["padding-left"]?.unit ?? "px"}`;
    this.cassAttributes["border-bottom-right-radius"] =
      `${handlers?.["border-bottom-right-radius"]?.value ?? 0}${handlers?.["padding-left"]?.unit ?? "px"}`;
    this.cassAttributes["border-top-right-radius"] =
      `${handlers?.["border-top-right-radius"]?.value ?? 0}${handlers?.["padding-left"]?.unit ?? "px"}`;
    this.cassAttributes["border-bottom-left-radius"] =
      `${handlers?.["border-bottom-left-radius"]?.value ?? 0}${handlers?.["padding-left"]?.unit ?? "px"}`;
    this.cassAttributes["border-top-left-radius"] =
      `${handlers?.["border-top-left-radius"]?.value ?? 0}${handlers?.["padding-left"]?.unit ?? "px"}`;

    const isDisabled =
      this.resolvedInputs.state == "disabled" ? true : false;
    return html`
      ${this.renderBorder()}
      <div class="container-outside">
        <div class="margin-label" style="margin-left: -43px; margin-top: 2px">
          <nr-label>Margin</nr-label>
        </div>
        <nr-input
          .size=${"default"}
          @valueChange="${(e) => {
            this.cassAttributes["margin-left"] = e.detail.value;
            this.debouncedChanged("margin-left");
          }}"
          class="position-input margin-left"
          placeholder="margin left"
          value=${this.cassAttributes["margin-left"]}
        ></nr-input>
        <nr-input
          .size=${"default"}
          @valueChange="${(e) => {
            this.cassAttributes["margin-right"] = e.detail.value;
            this.debouncedChanged("margin-right");
          }}"
          class="position-input margin-right"
          placeholder="margin right"
          .value=${this.cassAttributes["margin-right"]}
        ></nr-input>
        <nr-input
          .size=${"default"}
          @valueChange="${(e) => {
            this.cassAttributes["margin-top"] = e.detail.value;
            this.debouncedChanged("margin-top");
          }}"
          class="position-input margin-top"
          placeholder="margin top"
          .value=${this.cassAttributes["margin-top"]}
        ></nr-input>
        <nr-input
          .size=${"default"}
          @valueChange="${(e) => {
            this.cassAttributes["margin-bottom"] = e.detail.value;
            this.debouncedChanged("margin-bottom");
          }}"
          class="position-input margin-bottom"
          placeholder="margin bottom"
          .value=${this.cassAttributes["margin-bottom"]}
        ></nr-input>
        <div
          class="container "
          style=${styleMap({
            "border-bottom-right-radius":
              this.cassAttributes["border-bottom-right-radius"],
            "border-top-right-radius":
              this.cassAttributes["border-top-right-radius"],
            "border-bottom-left-radius":
              this.cassAttributes["border-bottom-left-radius"],
            "border-top-left-radius":
              this.cassAttributes["border-top-left-radius"],
          })}
        >
          <div class="padding-label"><nr-label>Padding</nr-label></div>
          <nr-input
            .size=${"default"}
            @valueChange="${(e) => {
              this.cassAttributes["padding-left"] = e.detail.value;
              this.debouncedChanged("padding-left");
            }}"
            class="position-input padding-left"
            placeholder="padding left"
            .value=${this.cassAttributes["padding-left"]}
          ></nr-input>

          <nr-input
            .size=${"default"}
            @valueChange="${(e) => {
              this.cassAttributes["padding-right"] = e.detail.value;
              this.debouncedChanged("padding-right");
            }}"
            class="position-input padding-right"
            placeholder="padding right"
            .value=${this.cassAttributes["padding-right"]}
          ></nr-input>
          <nr-input
            .size=${"default"}
            @valueChange="${(e) => {
              this.cassAttributes["padding-top"] = e.detail.value;
              this.debouncedChanged("padding-top");
            }}"
            class="position-input padding-top"
            placeholder="padding top"
            .value=${this.cassAttributes["padding-top"]}
          ></nr-input>
          <nr-input
            .size=${"default"}
            @valueChange="${(e) => {
              this.cassAttributes["padding-bottom"] = e.detail.value;
              this.debouncedChanged("padding-bottom");
            }}"
            class="position-input padding-bottom"
            placeholder="padding bottom"
            .value=${this.cassAttributes["padding-bottom"]}
          ></nr-input>

          <nr-input
            .size=${"default"}
            @valueChange="${(e) => {
              this.cassAttributes["border-bottom-right-radius"] =
                e.detail.value;
              this.debouncedChanged("border-bottom-right-radius");
            }}"
            class="position-input border-bottom-right-radius"
            placeholder="padding bottom"
            .value=${this.cassAttributes["border-bottom-right-radius"]}
          ></nr-input>

          <nr-input
            .size=${"default"}
            @valueChange="${(e) => {
              this.cassAttributes["border-top-right-radius"] = e.detail.value;
              this.debouncedChanged("border-top-right-radius");
            }}"
            class="position-input border-top-right-radius"
            placeholder="padding bottom"
            .value=${this.cassAttributes["border-top-right-radius"]}
          ></nr-input>

          <nr-input
            .size=${"default"}
            @valueChange="${(e) => {
              this.cassAttributes["border-bottom-left-radius"] = e.detail.value;
              this.debouncedChanged("border-bottom-left-radius");
            }}"
            class="position-input border-bottom-left-radius"
            placeholder="padding bottom"
            .value=${this.cassAttributes["border-bottom-left-radius"]}
          ></nr-input>

          <nr-input
            .size=${"default"}
            @valueChange="${(e) => {
              this.cassAttributes["border-top-left-radius"] = e.detail.value;
              this.debouncedChanged("border-top-left-radius");
            }}"
            class="position-input border-top-left-radius"
            placeholder="padding bottom"
            .value=${this.cassAttributes["border-top-left-radius"]}
          ></nr-input>
        </div>
      </div>
    `;
  }
}
