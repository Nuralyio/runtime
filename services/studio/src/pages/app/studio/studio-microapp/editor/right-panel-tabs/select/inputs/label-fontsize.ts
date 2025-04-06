import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, TextInputTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "select_label_font_size_vertical_container",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["select_label_size_input_block", "label_size_handler_block"]
  },
  {
    uuid: "select_label_size_input_block",
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
                const label ='Label size';
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
                            
                            
                            const unity = EventData.unity || "px"
                            updateStyle(selectedComponent, "--hybrid-select-label-font-size", EventData.value+unity);
                                     
  `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            
            const selectedComponent = Utils.first(Vars.selectedComponents);
                
                
                let fontSize;
                if(currentPlatform.platform !== "desktop"){
                    fontSize = currentComponent?.breakpoints?.[currentPlatform.width]['--hybrid-select-label-font-size']?.split('')
                }else{
                    fontSize =selectedComponent.style && selectedComponent.style['--hybrid-select-label-font-size']?.split('')
                }
                if(fontSize) 
                    {
                        let unity='';
                        let value='';
                        fontSize.forEach((char)=>
                            {
                            if(char>='0' && char<='9')
                                value+=char 
                            else 
                            unity+=char
                           }
                        );
                        return [+value,unity]
                    }
                    else 
                       return [0,'px']

        
            `
      },
      state: {
        type: "handler",
        value:/* js */`
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        let state='enabled';
                        if(selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['--hybrid-select-label-font-size']){
                         state='disabled'
                        }
                        return state
        
                 
                
                `
      }
    }
  },
  {
    uuid: "label_size_handler_block",
    application_id: "1",
    name: "label size handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["select_font_size_label_input", "label_size_handler"]
  },
  {
    uuid: "label_size_handler",
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
                    
                        
                    labelSizeHandler= selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['--hybrid-select-label-font-size'] || ''  
                
                return [parameter,labelSizeHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    updateStyleHandlers(selectedComponent,'--hybrid-select-label-font-size',EventData.value)
            
      `
    }
  }

];