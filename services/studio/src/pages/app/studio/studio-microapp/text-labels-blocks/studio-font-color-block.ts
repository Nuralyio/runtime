import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
    uuid: "font_color_block",
    applicationId: "1",
    name: "font color block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
        
        display: 'flex',
        'justify-content':'space-between',
        'align-items':'center',
        'margin-top': '10px',

    },
    childrenIds: ["font_color_input_block","font_color_handler_block"]
    },
    {
        uuid: "font_color_input_block",
        applicationId: "1",
        name: "font color input block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["font_color_label", "font_color_input_2"],
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
            width:"90px",
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
    width:"120px",
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
                    let state='enabled';
                    if(currentComponent?.styleHandlers && currentComponent.styleHandlers['color']){
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
    uuid: "font_color_handler_block",
    applicationId: "1",
    name: "font color handler block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
        width: "50px",
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
            return [parameter,fontColorHandler];
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
