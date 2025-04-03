import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "letter_spacing_block",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    styleHandlers: {},
    input: {
      direction: "vertical"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "276px"
    },
    childrenIds: ["text_label_letter_spacing", "letter_spacing_input", "letter_spacing_handler"]
  },
  {
    uuid: "text_label_letter_spacing",
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
        value: 'Letter spacing'
      }
    }
  },
  {
    uuid: "letter_spacing_input",
    application_id: "1",
    component_type: ComponentType.NumberInput,
    ...COMMON_ATTRIBUTES,
    style: {
      size: "small",
      "width": "155px"
    },
    styleHandlers: {},
    name: "Left panel",
    input: {
      value: {
        type: "handler",
        value: /* js */ `    
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        const letterSpacing =selectedComponent.style && selectedComponent.style['letter-spacing']?.split('px')[0] || 0
                        if(letterSpacing)
                            return letterSpacing;
                        else  
                        return 0       
        
                                
                `
      },
      state: {
        type: "handler",
        value: /* js */`
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        let state='enabled';
                        if(selectedComponent.styleHandlers && selectedComponent.styleHandlers['letter-spacing']){
                         state='disabled'
                        }
                        return state
        
                      
                
                `
      }
    },
    event: {
      valueChange:  /* js */ `
                  
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    updateStyle(selectedComponent, "letter-spacing", EventData.value+'px');
                 
      `
    }
  },

  {
    uuid: "letter_spacing_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "letter spacing handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='letterSpacing';
                let letterSpacingHandler =''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                        
                    letterSpacingHandler= selectedComponent.styleHandlers && selectedComponent.styleHandlers['letter-spacing'] || ''  
                
                return [parameter,letterSpacingHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    updateStyleHandlers(selectedComponent,'letter-spacing',EventData.value)
            
      `
    }
  }
];
