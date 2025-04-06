import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "line_height_block",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "276px"
    },
    childrenIds: ["text_label_line_height", "line_height_input", "line_height_handler"]
  },
  {
    uuid: "text_label_line_height",
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
        value: 'Line height'
      }
    }
  },
  {
    uuid: "line_height_input",
    application_id: "1",
    component_type: ComponentType.NumberInput,
    ...COMMON_ATTRIBUTES,
    style: {
      size: "small",
      width: "100px"
    },
    styleHandlers: {},
    name: "Left panel",
    input: {
      innerAlignment : {
        type : "string", 
        value : "end"
      },
      value: {
        type: "handler",
        value: /* js */ `    
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        const lineHeight= selectedComponent?.styleHandlers && selectedComponent.style['line-height']?.split('px')[0] || 0
                        if(lineHeight)
                            return lineHeight;
                        else  
                        return 0       
        
                                
                `
      },
      state: {
        type: "handler",
        value: /* js */`
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        let state='enabled';
                        if(selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['line-height']){
                         state='disabled'
                        }
                        return state
        
                      
                
                `
      }
    },
    event: {
      valueChange:  /* js */ `
                  
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    updateStyle(selectedComponent, "line-height", EventData.value+'px');
                 
      `

    }
  },

  {
    uuid: "line_height_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "line height handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='lineHeight';
                let lineHeightHandler =''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                        
                    lineHeightHandler= selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['line-height'] || ''  
                
                return [parameter,lineHeightHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    updateStyleHandlers(selectedComponent,'line-height',EventData.value)
            
      `
    }
  }
];
