import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../common_attributes";
export default [
    {
        uuid: "letter_spacing_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
            display: 'flex',
            'flex-direction': 'column',
            'margin-top': '10px',
        },
        childrenIds: ["text_label_letter_spacing", "letter_spacing_input"],
    },
    {
        uuid: "text_label_letter_spacing",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "letter spacing",
        },

        applicationId: "1",
        ...COMMON_ATTRIBUTES,
    },
    {
        uuid: "letter_spacing_input",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        ...COMMON_ATTRIBUTES,
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
                        const letterSpacing =currentComponent.style['letter-spacing']?.split('px')[0]
                        if(letterSpacing)
                            letterSpacing;
                        else  
                        0       
                    }
        
                }catch(e){
                    console.log(e);
                }                
                `
            }
        },
        style: {
                display:'block',
                width: "250px", 
        },
        event: {
            valueChange:  {
                type:'handler',
                value: /* js */ `
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
    },
] 
