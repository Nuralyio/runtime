import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "font_color_block",
    application_id: "1",
    name: "font color block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "276px"
    },
    childrenIds: ["font_color_label", "font_color_input_2", "font_color_handler"]
  },
  {
    uuid: "font_color_label",
    name: "font color label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value:'Color'
      }
    },
    style: {
      width: "90px",
      display: "block"
    }
  },
  {
    uuid: "font_color_input_2",
    name: "name",
    application_id: "1",
    component_type: ComponentType.ColorPicker,
    event: {
      valueChange: /* js */ `
       
       
            const selectedComponent = Utils.first(Vars.selectedComponents);
                
                
                updateStyle(selectedComponent, "color", EventData.value);
            
        
        
  `
    },
    style: {
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                       return selectedComponent.style?.color || "black";

                
            `
      },
      state: {
        type: "handler",
        value:/* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    let state='enabled';
                    if(selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['color']){
                        state='disabled'
                    }
                return state;

            
            
            `
      }
    }
  },

  {
    uuid: "font_color_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "font color handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            const parameter ='fontColor';
            let fontColorHandler=''
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                
                    
                fontColorHandler = selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['color'] || ''  
            
            return [parameter,fontColorHandler];
        `
      }
    },

    event: {
      codeChange: /* js */ `
        
            const selectedComponent = Utils.first(Vars.selectedComponents);
                
                
                updateStyleHandlers(selectedComponent,'color',EventData.value)
        
  `
    }
  }

];
