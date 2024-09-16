import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
    uuid: "font_color_block",
    applicationId: "1",
    name: "font color block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
        width: "70px",
        display: 'flex',
        "flex-direction": "column",
    },
    childrenIds: ["font_color_label", "font_color_input_2","font_color_handler_block"]
    },
    {
        uuid: "font_color_label",
        name: "font color label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Color';
              return label;`
            }
        },
        style: {
            width:"100px",
            display:'block'
        },
    },
{
    uuid: "font_color_input_2",
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
                updateStyle(currentComponent, "color", EventData.value);
            
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
                       return currentComponent.style?.color || "black";
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
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    let state='';
                    if(currentComponent.styleHandlers && currentComponent.styleHandlers['color']){
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
    uuid: "font_color_handler_block",
    applicationId: "1",
    name: "font color handler block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
        width: "220px",
        'margin-top': '10px',
        display:'flex',
        'justify-content':'space-between',
    },
    
    childrenIds: ["font_color_handler"],
},
{
    uuid: "font_color_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "font color handler",
    style: {
            display:'block',
            width: "250px", 
    },
    input: { 
        value: {
            type: 'handler',
            value: /* js */`
            const parameter ='fontColor';
            let fontColorHandler=''
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                fontColorHandler = currentComponent?.styleHandlers && currentComponent?.styleHandlers['color'] || ''  
                }
            }catch(error){
                console.log(error);
            }
            [parameter,fontColorHandler];
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
                updateStyleHandlers(currentComponent,'color',EventData.value)
            }
        }catch(error){
            console.log(error);
        }
  `
    },
},

] 
