import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, TextInputTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "image_fallback_text_block",
    application_id: "1",
    name: "image fallback text block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["image_fallback_input_block", "fallback_handler_block"]
  },
  {
    uuid: "image_fallback_input_block",
    application_id: "1",
    name: "image fallback block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["label_image_fallback"]
  },
  {
    uuid: "label_image_fallback",
    name: "label image fallback",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
               const label ='Fallback';
             return label;
            `
      }
    }
  },
  {
    uuid: "fallback_text_input",
    name: "fallback text input",
    application_id: "1",
    component_type: ComponentType.TextInput,
    ...COMMON_ATTRIBUTES,
    style: {
      ...TextInputTheme
    },
    event: {
      valueChange:/* js */ `
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                        
                        
                        const newFallBack = EventData.value;
                        updateInput(selectedComponent,'fallback','string',newFallBack);
                 
  `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            
            const selectedComponent = Utils.first(Vars.selectedComponents);
                
                                    
                if(selectedComponent.input?.fallback?.type=="string"){
                const currentFallback=  selectedComponent.input?.fallback?.value??'';
                currentFallback;
                }

        
            `
      },
      state: {
        type: "handler",
        value: /* js */`
            
            const selectedComponent = Utils.first(Vars.selectedComponents);
                
                                    
                let state = "unabled";
                if(selectedComponent.input?.fallback?.type =="handler"&&selectedComponent.input?.fallback?.value){
                   state = "disabled"
               }
               return state;

        
            `
      },
      placeholder: {
        type: "handler",
        value: /* js */`
                const inputPlaceHolder ="fallback";
             return  inputPlaceHolder;
            `
      }
    }
  },
  {
    uuid: "fallback_handler_block",
    application_id: "1",
    name: "fallback handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},

    childrenIds: ["fallback_text_input", "fallback_handler"]
  },
  {
    uuid: "fallback_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "fallback handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='fallback';
                let fallbackHandler=''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                        
                        
                        if(selectedComponent.input?.fallback?.type =='handler' && selectedComponent.input?.fallback?.value){
                           fallbackHandler = selectedComponent.input?.fallback?.value
                        }
                
                return [parameter,fallbackHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                
                    
                    
                    if(EventData.value != selectedComponent.input?.fallback?.value != EventData.value )
                    updateInput(selectedComponent,'fallback','handler',EventData.value);
            
      `
    }
  }

];