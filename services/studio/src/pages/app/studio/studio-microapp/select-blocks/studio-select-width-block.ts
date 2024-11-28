import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "select_width_vertical_container",
        applicationId: "1",
        name: "select width vertical container",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center'
        },
        childrenIds: ["select_width_block","select_width_handler_block"],
    },
    {
        uuid: "select_width_block",
        applicationId: "1",
        name: "select width block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'

        },
        childrenIds: ["select_width", "select_width_input"],
    },

    {
        uuid: "select_width",
        name: "select width",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
            width:'90px',
        },
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
        uuid: "select_width_input",
        name: "select width",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "120px",
            size:'small'
        },
        event: {
            valueChange:  /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "--hybrid-select-width",EventData.value+'px');
                        }
                    }catch(error){
                        console.log(error);
                    } `
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
                const selectWidth = currentComponent?.style&&currentComponent.style['--hybrid-select-width']||0;
                return selectWidth;
                
            }

        }catch(e){
            console.log(e);
        }
            `
            },
            state:{
                type:'handler',
                value:/* js */`
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if(selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        let state='enabled';
                        if(currentComponent.styleHandlers && currentComponent.styleHandlers['--hybrid-select-width']){
                         state='disabled'
                        }
                       return state
                    }
        
                }catch(e){
                    console.log(e);
                } 
                
                `
            }
        }
    },
    {
        uuid: "select_width_handler_block",
        applicationId: "1",
        name: "select with handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        }, 
        childrenIds: ["select_width_handler"],
    },
    {
        uuid: "select_width_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "select width handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='selectWidth';
                let selectWidthHandler =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    selectWidthHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['--hybrid-select-width'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,selectWidthHandler];
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
                    updateStyleHandlers(currentComponent,'--hybrid-select-width',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },


]