import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";

export default [
    {
        uuid: "input_type_block",
        applicationId: "1",
        name: "input type block",
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

        childrenIds: ["input_type_label", "input_type_radio"],
    },
    
    {
        uuid: "input_type_label",
        name: "input type label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Type';
               label;
            `
            }
        },
        style: {

        }
    },
    {
        uuid: "input_type_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "input type radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const currentType = currentComponent.input?.type?.value || 'text'
                const options = 
                [
                    {
                        value: "text",
                        icon:'font'
                    }, 
                    {
                        value: "password",
                        icon:'lock'
                    },
                    {
                        value: "number",
                        icon:'hashtag'
                    }
                ]  
            const radioType='button' 
            const result =[options,currentType,radioType];
            result;
                `
            }
        },
        style: {
            display:'block',
            width: "350px",
        },
        event: {
            changed: /* js */ `

            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const typeValue = EventData.value?EventData.value:'text';
                    updateInput(currentComponent,'type','string',typeValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]