import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";

export default [
    {
        uuid: "value_text_block",
        applicationId: "1",
        name: "value text block",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },
        ...COMMON_ATTRIBUTES,
        style: {
             display:'flex',
            'flex-direction':'column',
        },

        childrenIds: ["value_text_label", "value_text_input"],
    },
    {
        uuid: "value_text_label",
        name: "value text label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Value",
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style: {}
    },
    {
        uuid: "value_text_input",
        name: "vlaue text input",
        applicationId: "1",
        component_type: ComponentType.TextInput,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            size:"medium",
        },
        event: {
            valueChange: {
                type: "handler",
                value: /* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        console.log('new value ',EventData.value)
                        // here I need to pass new input value to the component
                        currentComponent.parameters.value=EventData.value;
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
            if(selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)                    
                // here I need to retrieve current component value 
                const currentValue=currentComponent.parameters.value || "";
                currentValue;
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },

]