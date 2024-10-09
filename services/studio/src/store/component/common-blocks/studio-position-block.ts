import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "position_block",
        applicationId: "1",
        name: "position block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["position_label", "position_select","position_handler_block","position_values"],
    },
    
    {
        uuid: "position_label",
        name: "position label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const positionLabel='Position';
                return positionLabel;
                
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "position_select",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "position select",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentPosition=""
                let isDisabled = false;
                if(currentComponent.styleHandlers && currentComponent.styleHandlers?.position){
                     isDisabled =true
                }
                else
                currentPosition = currentComponent?.style && currentComponent.style['position'] || 'static'
                const options = 
                    [
                    {
                    label: "Relative",
                    value: "relative",
                    disabled:isDisabled
                    }, 
                    {
                    label: "Absolute",
                    value: "absolute",
                    disabled:isDisabled
                   },
                    {
                     label: "Fixed",
                     value: "fixed",
                     disabled:isDisabled
                   },
                   {
                    label: "Sticky",
                    value: "sticky",
                    disabled:isDisabled
                   },
                   {
                    label: "Static",
                    value: "static",
                    disabled:isDisabled
                   },
            ]   
            const radioType ='button'
            const result = [options,currentPosition,radioType];
           return  result;
                `
            }
        },
        style: {
            display:'block',
            width: "350px",
        },
        event: {
            changed: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const positionValue = EventData.value;
                    updateStyle(currentComponent,'position',positionValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "position_handler_block",
        applicationId: "1",
        name: "position handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["position_handler"],
    },
    {
        uuid: "position_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "position handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='position';
                let positionHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    positionHandler = currentComponent?.styleHandlers && currentComponent?.styleHandlers['position'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,positionHandler];
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
                    updateStyleHandlers(currentComponent,'position',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
    {
        uuid: "position_values",
        applicationId: "1",
        name: "position x axis",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:"flex",
            "flex-direction":'column',
            gap:"10px",
            "margin-top":"10px"
        },
        childrenIds: ["top_label", "top_input","top_handler_block","left_label","left_input","left_handler_block"],
    },
    {
        uuid: "top_label",
        name: "top label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Top';
                return label;
            `
            }
        },
      
    },
    {
        uuid: "top_input",
        name: "top input",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'block',
            width: "120px",
        },
        event: {
            valueChange:  /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "top",EventData.value+'px');
                        }
                    }catch(error){
                        console.log(error);
                    }         `
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let topValue =0;
                if(currentComponent?.style && currentComponent.style['top'])
                    topValue = currentComponent.style['top']
                return topValue;  
            }

        }catch(e){
            console.log(e);
        }
            `
            },
            state:{
                type:'handler',
                value: /* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        let state ='enabled'
                        if(currentComponent?.styleHandlers && currentComponent.styleHandlers?.top){
                            state='disabled'
                        }
                        return state;  
                    }
        
                }catch(e){
                    console.log(e);
                }
                
                
                `
            }
        }
    },
    {
        uuid: "top_handler_block",
        applicationId: "1",
        name: "top handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["top_handler"],
    },
    {
        uuid: "top_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "top handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='top';
                let topHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    topHandler = currentComponent?.styleHandlers && currentComponent?.styleHandlers['top'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,topHandler];
            `
            }
        },
        
        event: {
            codeChange: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyleHandlers(currentComponent,'top',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
    {
        uuid: "left_label",
        name: "left label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Left';
                return label;
            `
            }
        },
      
    },
    {
        uuid: "left_input",
        name: "left input",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'block',
            width: "120px",
        },
        event: {
            valueChange:  /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "left",EventData.value+'px');
                        }
                    }catch(error){
                        console.log(error);
                    }         `
            
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const leftValue = currentComponent?.style&&currentComponent.style['left']||0;
                return leftValue;
                
            }

        }catch(e){
            console.log(e);
        }
            `
            },
            state:{
                type:'handler',
                value: /* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        let state ='enabled'
                        if(currentComponent?.styleHandlers && currentComponent.styleHandlers?.left){
                            state='disabled'
                        }
                        return state;  
                    }
        
                }catch(e){
                    console.log(e);
                } 
                `
            }
        }
    },
    {
        uuid: "left_handler_block",
        applicationId: "1",
        name: "left handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["left_handler"],
    },
    {
        uuid: "left_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "left handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='left';
                let leftHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    leftHandler = currentComponent?.styleHandlers && currentComponent?.styleHandlers['left'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,leftHandler];
            `
            }
        },
        
        event: {
            codeChange: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyleHandlers(currentComponent,'left',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },    
]