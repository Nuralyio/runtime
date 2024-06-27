import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./ScreenActions.style";
import "@hybridui/button";
import "@hybridui/dropdown";
import "@hybridui/icon";
import { addComponentAction, setCurrentComponentIdAction } from "$store/component/action";
import { ComponentType } from "$store/component/interface";
import { GenerateName } from "utils/naming-generator";
import { setShowBorder } from "$store/page/action";
import { v4 as uuidv4 } from "uuid";
import { AddCollection } from "./AddCollection";
import { getVar } from "$store/context/store";

@customElement("topbar-screen-actions")
export class TopbarScreenActions extends LitElement {
  static styles = styles;

  @state()
  options = [
    {
      label: "Text Label",
      handler: () => {
      //  const componentName = GenerateName(ComponentType.TextLabel);
        addComponentAction({
          name: "componentName",
          component_type: ComponentType.TextLabel,
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
          styleBreakPoints: {
            mobile: {},
            tablet: {},
            laptop: {},
          },
          inputHandlers: {},
          attributesHandlers: {},
          errors: {},
          childrenIds: [],
        } , getVar("global", "currentPage").value);
      },
    },
    {
      label: "Collections",
      handler: () => {
        AddCollection();
        },
    },
    {
      label: "Text Input",
      handler: () => {
        addComponentAction({
          name: "text_input654",
          component_type: ComponentType.TextInput,
          styleHandlers: {},
          parameters: {
            value: "Text Label",
          },
          styleHandlers: {},
          event: {},
          input: {},
          style: {},
          styleBreakPoints: {
            mobile: {},
            tablet: {},
            laptop: {},
          },
          inputHandlers: {},
          attributesHandlers: {},
          errors: {},
          childrenIds: [],
        }  ,getVar("global", "currentPage").value);
      },
    },
    {
      label: "Button", //vertical-container-block
      handler: () => {
        addComponentAction({
          name: GenerateName(ComponentType.Button),
          component_type: ComponentType.Button,
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
          component_type: ComponentType.VerticalContainer,
          styleHandlers: {},
          input: {
            direction: "horizontal",
          },
          styleHandlers: {},
          event: {},
          style: {},
          attributes:{},
          styleBreakPoints: {
            mobile: {},
            tablet: {},
            laptop: {},
          },
          inputHandlers: {},
          attributesHandlers: {},
          errors: {},
          childrenIds: [],
          parameters: {
          },
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
      <hy-button icon="arrow-left" @click=${()=>window.location.href = '/apps'}></hy-button>
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
        ${!this.showBorder ? html`Show` : html`Hide`
      }
        
         Broder</hy-button>

    </div>`;
  }
}


