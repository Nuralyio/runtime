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
      "width": "290px"
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
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        const letterSpacing =currentComponent.style && currentComponent.style['letter-spacing']?.split('px')[0] || 0
                        if(letterSpacing)
                            return letterSpacing;
                        else  
                        return 0       
                    }
        
                }catch(e){
                    console.log(e);
                }                
                `
      },
      state: {
        type: "handler",
        value: /* js */`
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if(selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        let state='enabled';
                        if(currentComponent.styleHandlers && currentComponent.styleHandlers['letter-spacing']){
                         state='disabled'
                        }
                        return state
                    }
        
                }catch(e){
                    console.log(e);
                }      
                
                `
      }
    },
    event: {
      valueChange:  /* js */ `
                  try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "letter-spacing", EventData.value+'px');
                }
            }catch(error){
                console.log(error);
            }     
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
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    letterSpacingHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['letter-spacing'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,letterSpacingHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if(selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyleHandlers(currentComponent,'letter-spacing',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }
];
