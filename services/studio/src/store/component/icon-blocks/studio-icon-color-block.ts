import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
    uuid: "icon_color_block",
    applicationId: "1",
    name: "icon color block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
        width: "250px",
        display: 'flex',
        "flex-direction": "column",
    },
    childrenIds: ["icon_color_label", "icon_color_input","icon_color_handler_block"]
    },
    {
        uuid: "icon_color_label",
        name: "icon color label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Color';
                label;`
            }
        },
        style: {},
    },
{
    uuid: "icon_color_input",
    name: "name",
    applicationId: "1",
    component_type: ComponentType.ColorPicker,
    event: {
        valueChange: /* js */ `
       
       try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                updateStyle(currentComponent, "--hybrid-icon-color", EventData.value);
            
            }
        }catch(error){
            console.log(error);
        }
        
  `
    },
    ...COMMON_ATTRIBUTES,
    input: {
        value: {
            type: "handler",
            value: /* js */`
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        const currentColor = currentComponent?.style&&currentComponent.style['--hybrid-icon-color']||"" ;
                        currentColor;
                    }

                }catch(e){
                    console.log(e);
                }
            `
        },
        state:{
            type:"handler",
            value:/* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if(selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    let state='';
                    if(currentComponent.styleHandlers && currentComponent.styleHandlers['--hybrid-icon-color']){
                        state='disabled'
                    }
                }
            }catch(e){
                console.log(e);
            }
            
            `
        }
    }
},
{
    uuid: "icon_color_handler_block",
    applicationId: "1",
    name: "icon color handler block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
        width: "220px",
        'margin-top': '10px',
        display:'flex',
        'justify-content':'space-between',
    },
    
    childrenIds: ["icon_color_handler"],
},
{
    uuid: "icon_color_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "icon color handler",
    style: {
            display:'block',
            width: "250px", 
    },
    input: { 
        value: {
            type: 'handler',
            value: /* js */`
            const parameter ='iconColor';
            let iconColorHandler=''
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                iconColorHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['--hybrid-icon-color'] || ''  
                }
            }catch(error){
                console.log(error);
            }
            [parameter,iconColorHandler];
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
                updateStyleHandlers(currentComponent,'--hybrid-icon-color',EventData.value)
            }
        }catch(error){
            console.log(error);
        }
  `
    },
},
] 
