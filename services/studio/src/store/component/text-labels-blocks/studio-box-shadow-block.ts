import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "box_shadow_block",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style:{
            "margin-top":'10px'
        },
        childrenIds: ["box_shadow_label","box_shadow_values","box_shadow_handler_block"],
    },
    {
        uuid: "box_shadow_label",
        name: "box shadow label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Box shadow';
                label;`
            }
        },
        style: {
            width:"100px",
            display:'block',
            'margin-bottom':'5px'
        },
    },
    {
        uuid: "box_shadow_values",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.ShadowBox,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        event: {
            boxShadowChanged: {
                type: "handler",
                value: /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "box-shadow",EventData.value);
                        
                        }
                    }catch(error){
                        console.log(error);
                    }      
  `
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
                if (currentComponent?.style && currentComponent.style["box-shadow"]) {
                    const values = currentComponent.style["box-shadow"].match(/-?[0-9]+px/g);  
                    const horizontalValue = parseInt(values[0], 10);
                    const verticalValue = parseInt(values[1], 10);
                    const blurValue = parseInt(values[2], 10);
                    const spreadValue = parseInt(values[3], 10);
                    const colorMatch = currentComponent.style["box-shadow"].match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
                    const insetMatch = currentComponent.style["box-shadow"].includes('inset');
                    const colorValue = colorMatch ? colorMatch[0] : "#ffffff";
                    const result=[horizontalValue,verticalValue,blurValue,spreadValue,insetMatch,colorValue];
                    return  result;

                }
                else {
                    const horizontalValue = 0;
                    const verticalValue = 0;
                    const blurValue = 0;
                    const spreadValue = 0;
                    const colorValue = "#000000";
                    const insetValue = false;
                    return [horizontalValue,verticalValue,blurValue,spreadValue,insetValue,colorValue]
                }
                
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
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        let state =''
                        if(currentComponent.styleHandlers && currentComponent.styleHandlers['box-shadow']){
                               state='disabled'
                        }
                    }
                }
                catch(e){
                    console.log(e)
                }
                
                `
            }
        },
    },
    {
        uuid: "box_shadow_handler_block",
        applicationId: "1",
        name: "box shadow handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        }, 
        childrenIds: ["box_shadow_handler"],
    },
    {
        uuid: "box_shadow_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "box shadow handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='boxShadow';
                let boxShadowHandler =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    boxShadowHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['box-shadow'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                [parameter,boxShadowHandler];
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
                    updateStyleHandlers(currentComponent,'box-shadow',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]