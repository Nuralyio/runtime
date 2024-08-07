import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
    uuid: "font_color_block",
    applicationId: "1",
    name: "Left panel",
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
    childrenIds: ["text_label_color", "font_color_input_2"]
    },
    {
        uuid: "text_label_color",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Color",
        },

        event: {
            onClick: `
        console.log("Clicked 22" , Current.uuid);
      `
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
            display:true
        },
        inputHandlers: {
            value: `GetContextVar("text_label_value");`
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
