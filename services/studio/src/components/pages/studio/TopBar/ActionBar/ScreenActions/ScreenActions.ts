import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./ScreenActions.style";
import "@hybridui/button";
import "@hybridui/dropdown";
import "@hybridui/icon";
import { addComponentAction, setCurrentComponentIdAction } from "$store/actions/component";
import { ComponentType } from "$store/component/interface";
import { GenerateName } from "utils/naming-generator";
import { setShowBorder } from "$store/actions/page";
import { v4 as uuidv4 } from "uuid";
import { AddCollection } from "./AddCollection";
import { getVar } from "$store/context";

@customElement("topbar-screen-actions")
export class TopbarScreenActions extends LitElement {
  static styles = styles;

  @state()
  options = [
    {
      label: "Text Label",
      value: ComponentType.TextLabel,
      handler: () => {
        
      },
    },
    {
      label: "Table",
      value: ComponentType.Table,
      handler: () => {
        
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
      value: ComponentType.TextInput,
      handler: () => {
        addComponentAction({
          name: "text_input888",
          component_type: ComponentType.TextInput,
          parameters: {
            value: "Text Label",
          },
        },
          getVar("global", "currentPage").value,
          getVar("global", "currentEditingApplication").value.uuid);
      },
    },
    {
      label: "Button", //vertical-container-block
      handler: () => {
        addComponentAction({
          name: GenerateName(ComponentType.Button),
          component_type: ComponentType.Button,
        }, getVar("global", "currentPage").value,
          getVar("global", "currentEditingApplication").value.uuid);
      },
    },
    { type: "divider" },
    {
      label: "Vertical Container", //
      value: ComponentType.VerticalContainer,
      handler: () => {
        addComponentAction({
          name: GenerateName(ComponentType.VerticalContainer),
          component_type: ComponentType.VerticalContainer,
        },
          getVar("global", "currentPage").value,
          getVar("global", "currentEditingApplication").value.uuid);
      },
    },
  ];

  @state()
  showBorder = false;


  render() {
    return html` <div class="screen-action-wrapper">
      <hy-button icon="arrow-left" @click=${() => window.location.href = '/dashboard'}></hy-button>
      <hy-dropdown
      trigger="click"
        .options=${this.options}
        @click-item="${(e: any) => {
        addComponentAction({
          name: GenerateName(e.detail.value),
          component_type: e.detail.value,
        }, 
        getVar("global", "currentPage").value,
        getVar("global", "currentEditingApplication").value.uuid);
      }
      }"
        >
          <hy-button icon="plus">Insert</hy-button>
        </hy-dropdown
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


