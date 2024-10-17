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
            width: "330px",
            display: 'flex',
            'justify-content': 'space-between',
            'align-items':'center',
            'margin-top': '10px',
        },
        childrenIds: ["line_height_input_block","line_height_handler_block"],
    },
    {
        uuid: "line_height_input_block",
        applicationId: "1",
        name: "placeholder block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["text_label_line_height", "line_height_input"],
    },
    {
        uuid: "text_label_line_height",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
            'font-size':'14px',
            width:'90px'
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Line height';
             return label;
            `
            }
        },
    },
    {
        uuid: "line_height_input",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        ...COMMON_ATTRIBUTES,
        style:{
            size:'small',
            width:'120px',
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
                        const lineHeight= currentComponent?.styleHandlers && currentComponent.style['line-height']?.split('px')[0] || 0
                        if(lineHeight)
                            return lineHeight;
                        else  
                        return 0       
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
                        let state='enabled';
                        if(currentComponent.styleHandlers && currentComponent.styleHandlers['line-height']){
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
                    updateStyle(currentComponent, "line-height", EventData.value+'px');
                }
            }catch(error){
                console.log(error);
            }     
      `
            
        },
    },
    {
        uuid: "line_height_handler_block",
        applicationId: "1",
        name: "line height handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
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
                    lineHeightHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['line-height'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,lineHeightHandler];
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
