import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "position_collapse_container",
        applicationId: "1",
        name: "position collapse container",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            "margin-top":'10px',
        },
        childrenIds: ["position_collapse"]
    },
    {
        uuid: "position_collapse",
        applicationId: "1",
        name: "position collapse",
        component_type: ComponentType.Collapse,
        style:{
          "--hy-collapse-content-small-size-padding":"5px",
          "--hy-collapse-font-weight:":"normal",
          '--hy-collapse-border-radius':'5px',
          '--hy-collapse-width':'320px',
        },
        input: {
            size:{
                type:'handler',
                value:/* js */`
                const size='small';
                return size;
                `
            },
            components:{
                type:'handler',
                value:/* js */`
                return [{blockName:'position_block',label:'Box'}];
                `
            }
        }
    },
    {
        uuid: "position_block",
        applicationId: "1",
        name: "position block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column',
            "margin-top":'10px',
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
            'font-size':'14px'

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
            '--hybrid-button-height':'30px',
            '--hybrid-button-width':'60px',
            '--hybrid-button-font-size':'12px'
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
        style:{
          display:'flex',
          'flex-direction':'column'
        },
        childrenIds: ["top_block","left_block"],
    },
    {
        uuid: "top_block",
        applicationId: "1",
        name: "position x axis",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:"flex",
            'justify-content':'space-between',
            'align-items':'center',
            "margin-top":"10px",
            width:'330px'
        },
        childrenIds: ["top_input_block","top_handler_block"],
    },
    {
        uuid: "left_block",
        applicationId: "1",
        name: "position x axis",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:"flex",
            'justify-content':'space-between',
            'align-items':'center',
            "margin-top":"10px",
            width:'330px'
        },
        childrenIds: ["left_input_block","left_handler_block"],
    },
    {
        uuid: "top_input_block",
        applicationId: "1",
        name: "top input block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between',
        },
        childrenIds: ["top_label", "top_input"],
    },
    {
        uuid: "left_input_block",
        applicationId: "1",
        name: "left input block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between',
        },
        childrenIds: ["left_label","left_input"],
    },
    {
        uuid: "top_label",
        name: "top label",
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
            size:'small',
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
                        if((currentComponent?.styleHandlers && currentComponent.styleHandlers?.top) ||(currentComponent?.style && (!currentComponent?.style['position'] || currentComponent?.style['position'] == 'static')) ){
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
            width: "50px",
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
        style:{
            'font-size':'14px',
            width:'90px'
        },
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
            size:'small',
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
                        if((currentComponent?.styleHandlers && currentComponent.styleHandlers?.left )||(!currentComponent?.style['position'] || currentComponent?.style && currentComponent?.style['position'] == 'static')){
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
            width: "50px",
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