import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";

export default [
    {
        uuid: "input_state_block",
        applicationId: "1",
        name: "input state block",
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

        childrenIds: ["input_state_label", "input_state_radio"],
    },
    
    {
        uuid: "input_state_label",
        name: "input state label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='State';
               label;
            `
            }
        },
        style: {

        }
    },
    {
        uuid: "input_state_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "input state radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const currentState = currentComponent.style['state'] || 'default'
                const options = 
                [
                    {
                        value: "default",
                        icon:'font-awesome'
                    }, 
                    {
                        value: "warning",
                        icon:'triangle-exclamation'
                    },
                    {
                        value: "error",
                        icon:'circle-exclamation'
                    }
                ]  
            const radioType='button' 
            const result =[options,currentState,radioType];
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
                    const stateValue = EventData.value?EventData.value:'default';
                    updateStyle(currentComponent,'state',stateValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]