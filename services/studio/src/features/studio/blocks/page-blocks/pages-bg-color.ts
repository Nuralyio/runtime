import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

export default [
  {
    uuid: "page_bg_color_theme_block",
    application_id: "1",
    name: "page name block",
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      width: "250px",
      "justify-content": "space-between",
      "align-items": "center"
    },

    childrenIds: ["page_bg-color_label", "page_color_input"]
  },
  {
    uuid: "page_bg-color_label",
    name: "page name text label",
    component_type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Background color'
      }

    },
    style: {
      width: "90px"
    }
  },

  {
    uuid: "page_color_input",
    application_id: "1",
    component_type: "color_picker",
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

          "--nuraly-page-background-color": newPageName
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