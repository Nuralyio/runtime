import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "icon_height_vertical_container",
        applicationId: "1",
        name: "icon height vertical container",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "330px",
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center'
        },
        childrenIds: ["icon_height_block","icon_height_handler_block"],
    },
    {
        uuid: "icon_height_block",
        applicationId: "1",
        name: "Icon height block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between',

        },
        childrenIds: ["icon_height", "icon_height_input"],
    },

    {
        uuid: "icon_height",
        name: "icon height",
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
                const label ='height';
              return label;
            `
            }
        },
      
    },
    {
        uuid: "icon_height_input",
        name: "icon height",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        ...COMMON_ATTRIBUTES,
        style: {
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
                            updateStyle(currentComponent, "--hybrid-icon-height",EventData.value+'px');
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
                const iconheight = currentComponent?.style&&currentComponent.style['--hybrid-icon-height']||0;
                return iconheight;
                
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
                        if(currentComponent.styleHandlers && currentComponent.styleHandlers['--hybrid-icon-height']){
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
        uuid: "icon_height_handler_block",
        applicationId: "1",
        name: "icon height handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        }, 
        childrenIds: ["icon_height_handler"],
    },
    {
        uuid: "icon_height_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "icon height handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='iconHeight';
                let iconHeightHandler =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    iconHeightHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['--hybrid-icon-height'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,iconHeightHandler];
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
                    updateStyleHandlers(currentComponent,'--hybrid-icon-height',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]