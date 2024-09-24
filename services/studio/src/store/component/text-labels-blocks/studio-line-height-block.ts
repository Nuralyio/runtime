import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "line_height_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
            display: 'flex',
            'flex-direction': 'column',
            'margin-top': '10px',
        },
        childrenIds: ["text_label_line_height", "line_height_input","line_height_handler_block"],
    },
    {
        uuid: "text_label_line_height",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Line height';
               label;
            `
            }
        },
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
            },
            state:{
                type:'handler',
                value: /* js */`
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if(selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        let state='';
                        if(currentComponent.styleHandlers && currentComponent.styleHandlers['line-height']){
                         state='disabled'
                        }
                        state
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
    {
        uuid: "line_height_handler_block",
        applicationId: "1",
        name: "line height handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        }, 
        childrenIds: ["line_height_handler"],
    },
    {
        uuid: "line_height_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "line height handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='lineHeight';
                let lineHeightHandler =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    lineHeightHandler= currentComponent?.styleHandlers['line-height'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                [parameter,lineHeightHandler];
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
                    updateStyleHandlers(currentComponent,'line-height',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
] 
