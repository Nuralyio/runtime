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
import { getVar,setVar } from "$store/context";
import { $applicationPages } from "$store/page";
import { $currentApplication } from "$store/apps";

@customElement("topbar-screen-actions")
export class TopbarScreenActions extends LitElement {
  static styles = styles;

  @state()
  options = [
    {
      label: "Text Label",
      value: ComponentType.TextLabel,
    },
    {
      label: "Table",
      value: ComponentType.Table,
    },
    {
      label: "Checkbox",
      value: ComponentType.Checkbox,
    },
    {
      label: "Select",
      value: ComponentType.Select,
    },
    {
      label: "DatePicker",
      value: ComponentType.DatePicker,
    },
    {
      label: "Icon",
      value: ComponentType.Icon,
    },
    {
      label: "Image",
      value: ComponentType.Image,
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
  
    },
    {
      label: "Button", //vertical-container-block
      value: ComponentType.Button,
    },
    { type: "divider" },
    {
      label: "Vertical Container", //
      value: ComponentType.VerticalContainer,
    },
  ];

  @state()
  showBorder = false;


  render() {
    return html` <div class="screen-action-wrapper">
      <hy-button .icon="${['arrow-left']}" @click=${() => window.location.href = '/dashboard'}></hy-button>
      <hy-dropdown
      trigger="click"
        .options=${this.options}
        @click-item="${(e: any) => {
          let currentPage = getVar("global", "currentPage")?.value;
        if(!currentPage) {
          currentPage= $applicationPages($currentApplication.get().uuid).get()[0]?.uuid ;
          setVar( "global" , "currentPage" , currentPage);
          }
          if(currentPage){
            addComponentAction({
              name: GenerateName(e.detail.value),
              component_type: e.detail.value,
            }, 
            currentPage,
            getVar("global", "currentEditingApplication").value.uuid);
          }
      }
      }"
        >
          <hy-button .icon=${['plus']}>Insert</hy-button>
        </hy-dropdown
      >
      <hy-button .icon=${['border-style']} type="${this.showBorder ? "primary" : ""}"
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


