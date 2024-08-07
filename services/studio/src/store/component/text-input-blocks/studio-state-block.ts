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

        childrenIds: ["input_state_label", "input_state_select"],
    },
    
    {
        uuid: "input_state_label",
        name: "input state label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "State",
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style: {

        }
    },
    {
        uuid: "input_state_select",
        applicationId: "1",
        component_type: ComponentType.Select,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "input state select",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentState = currentComponent.parameters?.state || "default"
                const options = 
                [
                    {
                        label: "Default",
                        value: "default",
                    }, 
                    {
                        label: "Warning",
                        value: "warning"
                    },
                    {
                        label: "Error",
                        value: "error"
                    }
                ]   
            let defaultState = options.find((option)=>option.value == currentState).label
            console.log('defaultstate ',defaultState)
            const result =[options,[defaultState]];
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
                    const stateValue = EventData.value;
                    updateStyle(currentComponent,'state',stateValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]