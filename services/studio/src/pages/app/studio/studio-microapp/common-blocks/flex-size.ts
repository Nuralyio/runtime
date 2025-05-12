import { ComponentType } from "$store/component/interface.ts";
import { InputBlockContainerTheme, TextInputTheme } from "../editor/utils/common-editor-theme";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";

export default [
  {
    uuid: "flex_font_size_vertical_container",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["flex_size_input_block", "flex_size_handler_block"]
  },
  {
    uuid: "flex_size_input_block",
    application_id: "1",
    name: "select label size input block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["select_text_label_font_size"]
  },

  {
    uuid: "select_text_label_font_size",
    name: "text_label",
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
                const label ='Flex';
                return label;
            `
      }
    }

  },
  {
    uuid: "select_font_size_label_input",
    name: "name",
    application_id: "1",
    component_type: ComponentType.NumberInput,
    parameters: {
      value: "22px"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      ...TextInputTheme
    },
    event: {
      valueChange: /* js */ `
                    
                        const selectedComponent = Utils.first(Vars.selectedComponents);
                            
                            
                            updateStyle(selectedComponent, "flex", EventData.value);
                                     
  `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            
            const selectedComponent = Utils.first(Vars.selectedComponents);
                
                
                let fontSize = 0;
                if(Editor.currentPlatform.platform !== "desktop"){
                    fontSize = selectedComponent?.breakpoints?.[Editor.currentPlatform.width]['flex']?.split('')
                }else{
                    fontSize =selectedComponent?.style && selectedComponent?.style['flex']?.split('')
                }
                       return [fontSize,'']

        
            `
      },
      state: {
        type: "handler",
        value:/* js */`
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        let state='enabled';
                        if(selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['flex']){
                         state='disabled'
                        }
                        return state
        
                 
                
                `
      }
    }
  },
  {
    uuid: "flex_size_handler_block",
    application_id: "1",
    name: "label size handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["select_font_size_label_input", "flex_size_handler"]
  },
  {
    uuid: "flex_size_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label size handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='labelSize';
                let labelSizeHandler =''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                        
                    labelSizeHandler= selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['flex'] || ''  
                
                return [parameter,labelSizeHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    updateStyleHandlers(selectedComponent,'flex',EventData.value)
            
      `
    }
  }

];