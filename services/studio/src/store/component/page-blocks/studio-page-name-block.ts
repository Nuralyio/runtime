import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "page_name_block",
        applicationId: "1",
        name: "page name block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
             display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["page_name_text_label", "page_name_text_input"],
    },
    {
        uuid: "page_name_text_label",
        name: "page name text label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Page name';
                return label;`
            },
            
        },
        style: {},
    },
    {
        uuid: "page_name_text_input",
        name: "page name text input",
        applicationId: "1",
        component_type: ComponentType.TextInput,
        ...COMMON_ATTRIBUTES,
        style: {
            size:'medium'
        },
        event: {
            valueChange:  /* js */ `
                try{
                    const currentPageId =  GetVar("currentPage");
                    if(currentPageId){
                const newPageName = EventData.value;
                const currentEditingApplication = GetVar("currentEditingApplication");
                const appPages = GetContextVar(currentEditingApplication.uuid + ".appPages", currentEditingApplication.uuid);
                const currentPage = appPages.find((page)=>page.uuid == currentPageId);
                const newPage = {...currentPage,name:newPageName};
                UpdatePage(newPage,currentEditingApplication.uuid).then(() => {
                    console.log("Page Updated");
                }).catch((e) => {
                    console.error(e);
                })
                    }
                    
                }catch(error){
                    console.log(error);
                } 
  `
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
            try{
            const currentPageId =  GetVar("currentPage");
            if(currentPageId) {
                const currentEditingApplication = GetVar("currentEditingApplication");
                const appPages = GetContextVar(currentEditingApplication.uuid + ".appPages", currentEditingApplication.uuid);
                const currentPage = appPages.find((page)=>page.uuid == currentPageId);
                return currentPage?.name || '';
            }

        }catch(e){
            console.log(e);
        }
            `
            },
            placeholder: {
                type: 'handler',
                value: /* js */`
                const inputPlaceHolder ="page name";
                return inputPlaceHolder;
            `
            }
        }
    },

]