import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, TextInputTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "FileUpload_alt_text_block",
    application_id: "1",
    name: "FileUpload alt text block",
    component_type: ComponentType.Container,
    styleHandlers: {},
    input: {
      direction: "vertical"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["alt_input_block", "alt_handler_block"]
  },
  {
    uuid: "alt_input_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["label_FileUpload_alt"]
  },
  {
    uuid: "label_FileUpload_alt",
    name: "label FileUpload alt",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      "width": "90px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
               const label ='Alt';
             return label;
            `
      }
    }
  },
  {
    uuid: "alt_text_input",
    name: "alt text input",
    application_id: "1",
    component_type: ComponentType.TextInput,
    styleHandlers: {},
    ...COMMON_ATTRIBUTES,
    style: {
      ...TextInputTheme
    },
    event: {
      valueChange:/* js */ `
                
          const selectedComponent = Utils.first(Vars.selectedComponents);

                        const newAltText = EventData.value;
                        updateInput(selectedComponent,'alt','string',newAltText);
                 
  `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            
              const selectedComponent = Utils.first(Vars.selectedComponents);
                if(selectedComponent.input?.alt?.type=="value"){
                const currentAlt=selectedComponent.input?.alt?.value??'';
                return currentAlt;
                }

        
            `
      },
      state: {
        type: "handler",
        value: /* js */`
            
            const selectedComponent = Utils.first(Vars.selectedComponents);
            if(true) {
                
                                    
                let state = "unabled";
                if(selectedComponent.input?.alt?.type =="handler"&&selectedComponent.input?.alt?.value){
                   state = "disabled"
               }
               return state;
            }

        
            `
      },
      placeholder: {
        type: "handler",
        value: /* js */`
                const inputPlaceHolder ="alt";
             return  inputPlaceHolder;
            `
      }

    }
  },
  {
    uuid: "alt_handler_block",
    application_id: "1",
    name: "alt handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},

    childrenIds: ["alt_text_input", "alt_handler"]
  },
  {
    uuid: "alt_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "alt handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='alt';
                let altHandler=''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        if(selectedComponent.input?.alt?.type =='handler' && selectedComponent.input?.alt?.value){
                           altHandler = selectedComponent.input?.alt?.value
                        }
                
                return [parameter,altHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    if(EventData.value != selectedComponent.input?.alt?.value != EventData.value )
                    updateInput(selectedComponent,'alt','handler',EventData.value);
            
      `
    }
  }

];