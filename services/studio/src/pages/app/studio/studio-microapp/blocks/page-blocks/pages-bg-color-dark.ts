import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

export default [
  {
    uuid: "page_bg-dark_color_theme_block",
    application_id: "1",
    name: "page name block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      width: "250px",
      "justify-content": "space-between",
      "align-items": "center"
    },

    childrenIds: ["page_bg-dark-color_label", "page_dark_color_input"]
  },
  {
    uuid: "page_bg-dark-color_label",
    name: "page name text label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Drak Background color'
      }

    },
    style: {
      width: "90px"
    }
  },

  {
    uuid: "page_dark_color_input",
    application_id: "1",
    component_type: ComponentType.ColorPicker,
    ...COMMON_ATTRIBUTES,
    style: {},
    event: {
      valueChange: /* js */ `

      const currentPageId =  Vars.currentPage;
      if(currentPageId){
        const newPageName = EventData.value;
        const currentEditingApplication = GetVar("currentEditingApplication");
        const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
        const currentPage = appPages?.find((page)=>page.uuid == currentPageId);
        const newPage = {...currentPage,style:{
            ...currentPage.style || {},
          "--hybrid-page-background-color-dark": newPageName
        }};
        UpdatePage(newPage,currentEditingApplication.uuid).then(() => {
        }).catch((e) => {
            console.error(e);
        })
      }

            
        const selectedComponent = Utils.first(Vars.selectedComponents);
       // updateStyle(selectedComponent, "hello", EventData.value);
      `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          return  Editor.getComponentStyle(Utils.first(Vars.selectedComponents), "color") ?? "black";
          `
      }
    }
  },

];