import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "label_text_block",
        applicationId: "1",
        name: "label text block",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },
        ...COMMON_ATTRIBUTES,
        style: {
             display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["label_text_label", "label_text_input"],
    },
    {
        uuid: "label_text_label",
        name: "label text label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Label",
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style: {}
    },
    {
        uuid: "label_text_input",
        name: "label text input",
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
                        // here I need to pass new label value to the component
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
                const currentLabel= currentComponent.parameters.label || '';
                currentLabel;
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },

]