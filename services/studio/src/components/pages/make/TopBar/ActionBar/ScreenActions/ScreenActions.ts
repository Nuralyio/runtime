import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./ScreenActions.style";
import "@hybridui/button";
import "@hybridui/dropdown";
import "@hybridui/icon";
import { addComponentAction } from "$store/component/action";
import { ComponentType } from "$store/component/interface";
import { GenerateName } from "utils/naming-generator";
import { setShowBorder } from "$store/page/action";

@customElement("topbar-screen-actions")
export class TopbarScreenActions extends LitElement {
  static styles = styles;

  @state()
  options = [
    {
      label: "Text Label",
      handler: () => {
        const componentName = GenerateName(ComponentType.TextLabel);
        addComponentAction({
          name: componentName,
          type: ComponentType.TextLabel,
          attributes: {
            display: "block",
            fontSize: "16px",
          },
          parameters: {
            value: "Text Label",
          },
          styleHandlers: {},
          event: {},
          input: {},
          style: {},
        });
      },
    },
    {
      label: "Text Input",
      handler: () => {
        addComponentAction({
          name: GenerateName(ComponentType.TextInput),
          type: ComponentType.TextInput,
          styleHandlers: {},
          event: {},
          input: {},
          style: {},
        });
      },
    },
    {
      label: "Button", //vertical-container-block
      handler: () => {
        addComponentAction({
          name: GenerateName(ComponentType.Button),
          type: ComponentType.Button,
          styleHandlers: {},
          event: {},
          input: {},
          style: {},
        });
      },
    },
    { type: "divider" },
    {
      label: "Vertical Container", //
      handler: () => {
        addComponentAction({
          name: GenerateName(ComponentType.VerticalContainer),
          type: ComponentType.VerticalContainer,
          styleHandlers: {},
          input: {
            direction: "horizontal",
          },
          event: {},
          style: {},
        });
      },
    },

    {
      label: "Gallery",
    },
    {
      label: "Form",
    },
    {
      label: "Media",
      children: [
        {
          label: "Image",
        },
        {
          label: "3D Object",
        },
      ],
    },
  ];

  @state()
  showBorder = false;


  render() {
    return html` <div class="screen-action-wrapper">
      <hy-button icon="arrow-left"></hy-button>
      <hy-button icon="paste"></hy-button>
      <hy-dropdown
        .options=${this.options}
        @change="${(e: any) => {
          /* */
        }}"
        ><span slot="label">
          <hy-button icon="plus">Insert</hy-button>
        </span></hy-dropdown
      >
      <hy-button icon="border-style" type="${this.showBorder ? "primary" : ""}"
      @click=${() => {
        this.showBorder = !this.showBorder;
        setShowBorder(this.showBorder);
      }
      }
      >
        ${
          !this.showBorder ? html`Show` : html`Hide`
        }
        
         Broder</hy-button>

    </div>`;
  }
}
