import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "icon_width_vertical_container",
        applicationId: "1",
        name: "icon width vertical container",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "330px",
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center'
        },
        childrenIds: ["icon_width_block","icon_width_handler_block"],
    },
    {
        uuid: "icon_width_block",
        applicationId: "1",
        name: "Icon width block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'

        },
        childrenIds: ["icon_width", "icon_width_input"],
    },

    {
        uuid: "icon_width",
        name: "icon width",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
            width:'90px',
            'font-size':'14px'
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
        uuid: "icon_width_input",
        name: "icon width",
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
                            updateStyle(currentComponent, "--hybrid-icon-width",EventData.value+'px');
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
                const iconWidth = currentComponent?.style['--hybrid-icon-width']||0;
                return iconWidth;
                
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
                        if(currentComponent.styleHandlers && currentComponent.styleHandlers['--hybrid-icon-width']){
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
        uuid: "icon_width_handler_block",
        applicationId: "1",
        name: "icon with handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        }, 
        childrenIds: ["icon_width_handler"],
    },
    {
        uuid: "icon_width_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "icon width handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='iconWidth';
                let iconWidthHandler =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    iconWidthHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['--hybrid-icon-width'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,iconWidthHandler];
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
                    updateStyleHandlers(currentComponent,'--hybrid-icon-width',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },


]