import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../common_attributes";
export default [
    {
        uuid: "text_value_vertical_container",
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
        },
        childrenIds: ["text_value_block"],
    },
    {
        uuid: "text_value_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
            display:"flex",
            'flex-direction':'column',
            width: "250px",
        },
        childrenIds: ["text_label_value", "text_label_input"],
    },

    {
        uuid: "text_label_value",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Value",
        },

        applicationId: "1",
        ...COMMON_ATTRIBUTES,
    
    },
    {
        uuid: "text_label_input",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.TextInput,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            width: "20px",
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
                const value = currentComponent.parameters.value || ''
                value;  
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },

]