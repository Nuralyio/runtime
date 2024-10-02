import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
    uuid: "select_helper_color_block",
    applicationId: "1",
    name: "select helper color block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
        width: "70px",
        display: 'flex',
        "flex-direction": "column",
    },
    childrenIds: ["select_helper_color_label", "select_helper_color_input","select_helper_color_handler_block"]
    },
    {
        uuid: "select_helper_color_label",
        name: "select helper color label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Helper color';
                label;`
            }
        },
        style: {
            width:"100px",
            display:'block'
        },
    },
{
    uuid: "select_helper_color_input",
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
                updateStyle(currentComponent, "--hybrid-select-helper-text-color", EventData.value);
            
            }
        }catch(error){
            console.log(error);
        }
        
  `
    },
    ...COMMON_ATTRIBUTES,
   style:{
    width:"50px",
    display:'block'
   },
    input: {
        value: {
            type: "handler",
            value: /* js */`
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.style)
                        currentComponent.style['--hybrid-select-helper-text-color'];
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
                    if(currentComponent.styleHandlers && currentComponent.styleHandlers['--hybrid-select-helper-text-color']){
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
    uuid: "select_helper_color_handler_block",
    applicationId: "1",
    name: "select helper color handler block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
        width: "220px",
        'margin-top': '10px',
        display:'flex',
        'justify-content':'space-between',
    },
    
    childrenIds: ["select_helper_color_handler"],
},
{
    uuid: "select_helper_color_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "helper color handler",
    style: {
            display:'block',
            width: "250px", 
    },
    input: { 
        value: {
            type: 'handler',
            value: /* js */`
            const parameter ='helperColor';
            let helperColorHandler=''
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                helperColorHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['--hybrid-select-helper-text-color'] || ''  
                }
            }catch(error){
                console.log(error);
            }
            [parameter,helperColorHandler];
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
                updateStyleHandlers(currentComponent,'--hybrid-select-helper-text-color',EventData.value)
            }
        }catch(error){
            console.log(error);
        }
  `
    },
},
] 
