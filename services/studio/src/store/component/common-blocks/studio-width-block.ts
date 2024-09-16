import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "width_vertical_container",
        applicationId: "1",
        name: "width vertical container",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
            "margin-top":'10px'
        },
        childrenIds: ["width_block","auto_width_block","width_handler_block"],
    },
    {
        uuid: "width_block",
        applicationId: "1",
        name: "width block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
            display:'flex',
            'flex-direction':'column'
        },
        childrenIds: ["width_label", "width_container"],
    },
    {
        uuid: "width_container",
        name: "width container",
        component_type: ComponentType.VerticalContainer,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
            display:'flex',
            "align-items":'center'
        },
        childrenIds: ["width_input","auto_width_checkbox"],

    },

    {
        uuid: "width_label",
        name: "width label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Width';
              return label;
            `
            }
        },
      
    },
    {
        uuid: "width_input",
        name: "width input",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'block',
            width: "120px",
        },
        event: {
            valueChange: {
                type: "handler",
                value: /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "width",EventData.value+'px');
                        }
                    }catch(error){
                        console.log(error);
                    }         `
            }
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
                const width = currentComponent?.style&&currentComponent.style['width']||0;
                return width;
                
            }

        }catch(e){
            console.log(e);
        }
            `
            },
            state: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let state =''
                if(currentComponent?.styleHandlers && currentComponent?.styleHandlers['width']){
                  state ='disabled'
                }
                state;
                
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        },
    },

    {
        uuid: "auto_width_checkbox",
        name: "auto width checkbox",
        applicationId: "1",
        component_type: ComponentType.Checkbox,
        ...COMMON_ATTRIBUTES,
        style: {
            
        },
        
        input: {
            label: {
                type: 'handler',
                value: /* js */`
              const checkboxLabel ='auto width';
              return checkboxLabel;
            `
            },
            checked: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const autoWidthChecked = !currentComponent?.style?.width||currentComponent?.input?.width?.value =='auto'?'check':''
                return autoWidthChecked;  
            }

        }catch(e){
            console.log(e);
        }
            `
            },
            state:{
                    type: 'handler',
                    value: /* js */`
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if(selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            let state ='';
                            if(currentComponent?.styleHandlers && currentComponent.styleHandlers['width']){
                                state ='disabled'
                            }
                            state;  
                        }
            
                    }catch(e){
                        console.log(e);
                    }
                    
                    `
            }
        },
        event: {
            checkboxChanged:  /* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        const autoWidth = EventData.value;
                        updateInput(currentComponent,'width','string',autoWidth?'auto':'');
                    }
                }catch(error){
                    console.log(error);
                }`
        },
    },
    {
        uuid: "width_handler_block",
        applicationId: "1",
        name: "width handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["width_handler"],
    },
    {
        uuid: "width_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "width handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='width';
                let widthHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    widthHandler = currentComponent?.styleHandlers && currentComponent?.styleHandlers['width'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                [parameter,widthHandler];
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
                    updateStyleHandlers(currentComponent,'width',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },


]