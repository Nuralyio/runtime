import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "font_size_vertical_container",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "276px"
    },
    childrenIds: ["text_label_font_size", "font_size_input_2", "label_fontsize_handler"]
  },

  {
    uuid: "text_label_font_size",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px"
    },
    input: {
      value: {
        type: "string",
        value: 'Font size'
      }
    }

  },
  {
    uuid: "font_size_input_2",
    name: "name",
    application_id: "1",
    component_type: ComponentType.NumberInput,
    parameters: {
      value: "22px"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      width: "100px",
      size: "small"
    },
    event: {
      valueChange:  /* js */`
                    
                        const selectedComponent = Utils.first(Vars.selectedComponents);
                            
                            
                            const unity= EventData.unity || 'px'
                            updateStyle(selectedComponent, "fontSize", EventData.value+unity);
                        
                    
                    
  `
    },
    input: {
      innerAlignment : {
        type : "string", 
        value : "end"
      },
      value: {
        type: "handler",
        value: /* js */`
            const selectedComponent = Utils.first(Vars.selectedComponents);
                
                
                let fontSize ;
                if(Editor.currentPlatform.platform !== "desktop"){
                    fontSize = currentComponent?.breakpoints?.[Editor.currentPlatform.width]?.fontSize?.split('') || selectedComponent.style && selectedComponent.style['fontSize']?.split('')
                }else{
                    fontSize =selectedComponent.style && selectedComponent.style?.fontSize?.split('')
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
                       return [13,'px']

            `
      },
      state: {
        type: "handler",
        value:/* js */`
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    if(true) {
                        
                        
                        let state='enabled';
                        if(selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['fontSize']){
                         state='disabled'
                        }
                        return state
                    }
        
                 
                
                `
      }
    }
  },

  {
    uuid: "label_fontsize_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label font size handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='labelFontSize';
                let labelFontSizeHandler =''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                        
                    labelFontSizeHandler= selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['fontSize'] || ''  
                
                return [parameter,labelFontSizeHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    updateStyleHandlers(selectedComponent,'fontSize',EventData.value)
            
      `
    }
  }


];