import type { ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BaseElementBlock } from "@runtime/components/base/BaseElement.ts";
import { styles } from "./IconPicker.style.ts";
import { executeCodeWithClosure } from "@runtime/core/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { EMPTY_STRING } from "@shared/utils/constants.ts";
import * as solidIcons from "@fortawesome/free-solid-svg-icons";
import "@lit-labs/virtualizer";
import { grid } from "@lit-labs/virtualizer/layouts/grid.js";
import { styleMap } from "lit/directives/style-map.js";
import { ButtonTheme } from "@features/studio/core/utils/common-editor-theme";

@customElement("icon-picker-block")
export class IconPicker extends BaseElementBlock {
  static override styles = styles;
  icons = Array.from(
    new Set(
      [...Object.keys(solidIcons)]
        .filter((key) => key.startsWith("fa"))
        .map((key) => solidIcons[key].iconName)
        .filter((iconName) => iconName)
    )
  );
  @state()
  filteredIcons = this.icons;
  @state()
  selectedIcon = EMPTY_STRING;
  @state()
  dropdownOpen = false;
  @property()
  component: ComponentElement;

  constructor() {
    super();
    document.addEventListener("click", this.onClickOutside);
  }

  handleIconSelect(icon: string) {
    this.selectedIcon = icon === this.selectedIcon ? EMPTY_STRING : icon;
    this.dispatchEvent(new CustomEvent("icon-selected", { detail: icon }));

    if (this.component.event?.iconChanged) {
      executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.iconChanged`), {
        value: this.selectedIcon
      });
    }
    this.dropdownOpen = false;
    this.requestUpdate();
  }

  handleIconChange = (e: CustomEvent) => {
    const searchString = e.detail.value;
    this.filteredIcons = searchString
      ? this.icons.filter((icon) => icon.includes(searchString))
      : this.icons;
  };

  toggleDropdown = () => {
    this.dropdownOpen = !this.dropdownOpen;
  };

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("click", this.onClickOutside);
  }

  override render() {
    this.selectedIcon = this.inputHandlersValue.value ?? EMPTY_STRING;
    const isDisabled = this.inputHandlersValue?.disable || false;
    
    const dropdownContent = html`
      <style>
        .icon-item .selected {
          border: red;
        }
      </style>
      <div class="dropdown-icon">
        <div class="search-container">
          <nr-input
            .autocomplete="off"
            placeholder=${this.inputHandlersValue.placeholder || "Search icons..."}
            @nr-input=${this.handleIconChange}
          ></nr-input>
        </div>
        <div style="height: 200px; overflow: auto; display: flex; background: var(--nuraly-input-background-color)" class="hello">
          <lit-virtualizer
            .items=${this.filteredIcons}
            .layout=${grid({ itemSize: "30px" })}
            .renderItem=${(icon: string) => html`
              <div
                class="icon-item ${icon === this.selectedIcon ? "selected" : EMPTY_STRING}"
                @click=${() => this.handleIconSelect(icon)}
              >
                <nr-icon .name=${icon}></nr-icon>
              </div>
            `}
          ></lit-virtualizer>
        </div>
      </div>
    `;

    return html`
      <nr-dropdown
        style="--nuraly-dropdown-width: 215px;"
        .open=${this.dropdownOpen}
        .items=${[{ content: dropdownContent }]}
      >
        <nr-button
          slot="trigger"
          .disabled=${isDisabled}
          @click=${this.toggleDropdown}
          style=${styleMap({
            ...ButtonTheme,
            "--nuraly-button-width": isDisabled ? "auto" : "35px"
          })}
        >
          ${isDisabled 
            ? html`Dynamic` 
            : html`<nr-icon class="icon-preview" .name=${this.selectedIcon}></nr-icon>`
          }
        </nr-button>
      </nr-dropdown>
    `;
  }

  private onClickOutside = (event: Event) => {
    const outsideClick = !event.composedPath().includes(this);
    if (outsideClick) this.dropdownOpen = false;
  };
}