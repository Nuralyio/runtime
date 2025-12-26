import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

export default [
  {
    uuid: "description_block",
    application_id: "1",
    name: "page url block",
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      width: "250px"
    },

    childrenIds: ["description_text_label", "description_text_input"]
  },
  {
    uuid: "description_text_label",
    name: "page url text label",
    component_type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Description'
      }

    },
    style: {
      width: "90px"
    }
  },
  {
    uuid: "description_text_input",
    name: "page url text input",
    application_id: "1",
    component_type: "text_input",
    ...COMMON_ATTRIBUTES,
    style: {
      size: "small",
      width: "120px"
    },
    event: {
      valueChange:  /* js */ `
            
                const currentPageId =  $currentPage;
                if(currentPageId){
            const description = EventData.value;
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
            const currentPage = appPages?.find((page)=>page.uuid == currentPageId);
            const newPage = {...currentPage,description:description};
            UpdatePage(newPage,currentEditingApplication.uuid).then(() => {
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
            const currentPageId =  $currentPage;
            if(currentPageId) {
                const currentEditingApplication = GetVar("currentEditingApplication");
                const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
                const currentPage = appPages?.find((page)=>page.uuid == currentPageId);
                return currentPage?.description || '';
            }
            `
      },
      placeholder: {
        type: "handler",
        value: /* js */`
                const inputPlaceHolder ="description";
                return inputPlaceHolder;
            `
      }
    }
  }

];