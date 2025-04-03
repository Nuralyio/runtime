import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "page_url_block",
    application_id: "1",
    name: "page url block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      width: "250px"
    },

    childrenIds: ["page_url_text_label", "page_url_text_input"]
  },
  {
    uuid: "page_url_text_label",
    name: "page url text label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Page url'
      }

    },
    style: {
      width: "90px"
    }
  },
  {
    uuid: "page_url_text_input",
    name: "page url text input",
    application_id: "1",
    component_type: ComponentType.TextInput,
    ...COMMON_ATTRIBUTES,
    style: {
      size: "small",
      width: "120px"
    },
    event: {
      valueChange:  /* js */ `
            
                const currentPageId =  GetVar("currentPage");
                if(currentPageId){
            const newPageUrl = EventData.value;
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
            const currentPage = appPages?.find((page)=>page.uuid == currentPageId);
            const newPage = {...currentPage,url:newPageUrl};
            UpdatePage(newPage,currentEditingApplication.uuid).then(() => {
                console.log("Page Updated");
            }).catch((e) => {
                console.error(e);
            })
                }
                
             
               
  `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            
            const currentPageId =  GetVar("currentPage");
            if(currentPageId) {
                const currentEditingApplication = GetVar("currentEditingApplication");
                const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
                const currentPage = appPages?.find((page)=>page.uuid == currentPageId);
                return currentPage?.url || '';
            }

        
            `
      },
      placeholder: {
        type: "handler",
        value: /* js */`
                const inputPlaceHolder ="page url";
                return inputPlaceHolder;
            `
      }
    }
  }

];