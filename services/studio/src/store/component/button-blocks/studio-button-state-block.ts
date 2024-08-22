import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "button_state_block",
        applicationId: "1",
        name: "button state block",
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

        childrenIds: ["button_state_label", "button_state_radio"],
    },
    
    {
        uuid: "button_state_label",
        name: "button state label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const stateLabel='State';
                stateLabel;
                
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "button_state_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "button state radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const currentState = currentComponent.input?.state?.value || 'enabled';
                const options = 
                    [
                    {
                    icon: "font-awesome",
                    value: "enabled",
                    }, 
                    {
                    icon: "font-awesome",
                    value: "disabled"
                   }
            ]   
            const radioType ='button'
            const result = [options,currentState,radioType];
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
                    updateInput(currentComponent,'state','string',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]