import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "line_height_block",
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
        childrenIds: ["text_label_line_height", "line_height_input"],
    },
    {
        uuid: "text_label_line_height",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Line height",
        },

        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
            display:true
        }
    },
    {
        uuid: "line_height_input",
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
                        const lineHeight=currentComponent.style['line-height']?.split('px')[0]
                        if(lineHeight)
                            lineHeight;
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
                    updateStyle(currentComponent, "line-height", EventData.value+'px');
                }
            }catch(error){
                console.log(error);
            }     
      `
            }     
        },
    },
] 
