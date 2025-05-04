import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, TextInputTheme } from "../../../utils/common-editor-theme.ts";

export const StudioImagePreviewableInput =  [
  {
    uuid: "image_previewable_text_block",
    application_id: "1",
    name: "image previewable text block",
    component_type: ComponentType.Container,
    styleHandlers: {},
    input: {
      direction: "vertical"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["previewable_input_block", "previewable_handler_block"]
  },
  {
    uuid: "previewable_input_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["label_image_previewable"]
  },
  {
    uuid: "label_image_previewable",
    name: "label image previewable",
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
               const label ='Previewable';
             return label;
            `
      }
    }
  },
  {
    uuid: "previewable_text_input",
    name: "previewable text input",
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
                        updateInput(selectedComponent,'previewable','string',newAltText);
                 
  `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            
              const selectedComponent = Utils.first(Vars.selectedComponents);
                if(selectedComponent.input?.previewable?.type=="value"){
                const currentAlt=selectedComponent.input?.previewable?.value??'';
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
                if(selectedComponent.input?.previewable?.type =="handler"&&selectedComponent.input?.previewable?.value){
                   state = "disabled"
               }
               return state;
            }

        
            `
      },
      placeholder: {
        type: "handler",
        value: /* js */`
                const inputPlaceHolder ="previewable";
             return  inputPlaceHolder;
            `
      }

    }
  },
  {
    uuid: "previewable_handler_block",
    application_id: "1",
    name: "previewable handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},

    childrenIds: ["previewable_text_input", "previewable_handler"]
  },
  {
    uuid: "previewable_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "previewable handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='previewable';
                let previewableHandler=''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        if(selectedComponent.input?.previewable?.type =='handler' && selectedComponent.input?.previewable?.value){
                           previewableHandler = selectedComponent.input?.previewable?.value
                        }
                
                return [parameter,previewableHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    if(EventData.value != selectedComponent.input?.previewable?.value != EventData.value )
                    updateInput(selectedComponent,'previewable','handler',EventData.value);
            
      `
    }
  }

];
