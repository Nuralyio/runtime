import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
     
    {
        uuid: "background_color_block",
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
            'flex-direction': 'column',
            "margin-top": "10px"
        },
        childrenIds: ["text_label_background_color", "background_color_value"],
    },
    {
        uuid: "text_label_background_color",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Background Color';
             return label;
            `
            }
        },
    },
    {
        uuid: "background_color_value",
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
                    updateStyle(currentComponent, "background-color", EventData.value);
                
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
                            currentComponent.style?.backgroundColor || "#ffffff";
                        }

                    }catch(e){
                        console.log(e);
                    }
                `
            }
        }
    },
]