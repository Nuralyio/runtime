import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, TextInputTheme } from "../../../utils/common-editor-theme.ts";

export const StudioSelectHelperFontSize = [

  {
    uuid: "select_helper_font_size_vertical_container",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["helper_size_block", "helper_size_handler_block"]
  },
  {
    uuid: "helper_size_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["select_text_label_helper_font_size"]
  },

  {
    uuid: "select_text_label_helper_font_size",
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
                const label ='Helper size';
                return label;
            `
      }
    }

  },
  {
    uuid: "select_font_size_helper_input",
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
      valueChange:  /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        const unity = EventData.unity || "px"
        updateStyle(selectedComponent, "--hybrid-select-helper-text-font-size", EventData.value+unity);
                        
  `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Vars.selectedComponents);
      const fontSize =  Editor.getComponentStyle(selectedComponent, "--hybrid-select-helper-text-font-size")?.split('')
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
                    if(true) {
                        
                        
                        let state='enabled';
                        if(selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['--hybrid-select-helper-text-font-size']){
                         state='disabled'
                        }
                        return state
                    }
        
                 
                
                `
      }
    }
  },
  {
    uuid: "helper_size_handler_block",
    application_id: "1",
    name: "helper size handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["select_font_size_helper_input", "helper_size_handler"]
  },
  {
    uuid: "helper_size_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "helper size handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='helperSize';
                let helperSizeHandler =''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                        
                    helperSizeHandler = selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['--hybrid-select-helper-text-font-size'] || ''  
                
                return [parameter,helperSizeHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    updateStyleHandlers(selectedComponent,'--hybrid-select-helper-text-font-size',EventData.value)
            
      `
    }
  }


];