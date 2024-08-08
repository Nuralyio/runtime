import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
    uuid: "font_color_block",
    applicationId: "1",
    name: "font color block",
    component_type: ComponentType.VerticalContainer,
    styleHandlers: {},
    input: {
        direction: "vertical",
    },

    ...COMMON_ATTRIBUTES,
    style: {
        width: "250px",
        display: 'flex',
        "flex-direction": "column",
    },
    childrenIds: ["font_color_label", "font_color_input_2"]
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
                label;`
            }
        },
        style: {},
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
    input: {
        value: {
            type: "handler",
            value: /* js */`
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        currentComponent.style?.color || "black";
                    }

                }catch(e){
                    console.log(e);
                }
            `
        }
    }
}
] 
